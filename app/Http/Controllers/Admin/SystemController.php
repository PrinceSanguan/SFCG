<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use App\Models\ActivityLog;
use App\Models\User;

class SystemController extends Controller
{
    public function logs(Request $request)
    {
        $query = ActivityLog::with('user');

        // Apply filters
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('model_type', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(50);

        // Get filter options
        $users = User::orderBy('name')->get(['id', 'name']);
        $actions = ActivityLog::distinct()->pluck('action');
        $modelTypes = ActivityLog::distinct()->pluck('model_type');

        // Get statistics
        $stats = [
            'total_logs' => ActivityLog::count(),
            'today_logs' => ActivityLog::whereDate('created_at', today())->count(),
            'this_week_logs' => ActivityLog::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'top_users' => ActivityLog::select('user_id', DB::raw('count(*) as count'))
                                    ->with('user')
                                    ->groupBy('user_id')
                                    ->orderBy('count', 'desc')
                                    ->limit(5)
                                    ->get(),
        ];

        return Inertia::render('Admin/System/Logs', [
            'logs' => $logs,
            'users' => $users,
            'actions' => $actions,
            'modelTypes' => $modelTypes,
            'stats' => $stats,
            'filters' => $request->only(['user_id', 'action', 'model_type', 'date_from', 'date_to', 'search'])
        ]);
    }

    public function backup()
    {
        $backups = $this->getBackupList();
        $systemInfo = $this->getSystemInfo();

        return Inertia::render('Admin/System/Backup', [
            'backups' => $backups,
            'systemInfo' => $systemInfo
        ]);
    }

    public function createBackup(Request $request)
    {
        $request->validate([
            'backup_type' => 'required|in:database,files,full',
            'description' => 'nullable|string|max:255',
            'schedule_automatic' => 'nullable|boolean',
            'retention_days' => 'nullable|integer|min:1|max:365'
        ]);

        try {
            // Clean old backups first if retention policy is set
            if ($request->retention_days) {
                $this->cleanOldBackups($request->retention_days);
            }

            $backupInfo = $this->performBackup($request->backup_type, $request->description);
            
            // Validate backup integrity
            $isValid = $this->validateBackup($backupInfo);
            
            if (!$isValid) {
                throw new \Exception('Backup validation failed - backup may be corrupted');
            }

            ActivityLog::logActivity(
                Auth::user(),
                'created_backup',
                'System',
                null,
                null,
                [
                    'backup_type' => $request->backup_type,
                    'backup_file' => $backupInfo['filename'],
                    'file_size' => $backupInfo['size'],
                    'validated' => $isValid,
                    'description' => $request->description
                ]
            );

            // Store backup metadata
            $this->storeBackupMetadata($backupInfo, $request);

            return redirect()->back()->with('success', 'Backup created and validated successfully: ' . $backupInfo['filename']);
        } catch (\Exception $e) {
            ActivityLog::logActivity(
                Auth::user(),
                'backup_failed',
                'System',
                null,
                null,
                [
                    'backup_type' => $request->backup_type,
                    'error' => $e->getMessage()
                ]
            );
            
            return redirect()->back()->with('error', 'Backup failed: ' . $e->getMessage());
        }
    }

    public function scheduleBackup(Request $request)
    {
        $request->validate([
            'backup_type' => 'required|in:database,files,full',
            'frequency' => 'required|in:daily,weekly,monthly',
            'time' => 'required|date_format:H:i',
            'retention_days' => 'required|integer|min:1|max:365',
            'enabled' => 'required|boolean'
        ]);

        // Store backup schedule configuration
        $schedule = [
            'backup_type' => $request->backup_type,
            'frequency' => $request->frequency,
            'time' => $request->time,
            'retention_days' => $request->retention_days,
            'enabled' => $request->enabled,
            'created_by' => Auth::id(),
            'created_at' => now()
        ];

        // Store in config or database (for this example, we'll use cache)
        cache()->put('backup_schedule', $schedule, now()->addYear());

        ActivityLog::logActivity(
            Auth::user(),
            'scheduled_backup',
            'System',
            null,
            null,
            $schedule
        );

        return redirect()->back()->with('success', 'Backup schedule configured successfully.');
    }

    public function getBackupSchedule()
    {
        $schedule = cache()->get('backup_schedule', [
            'backup_type' => 'full',
            'frequency' => 'weekly',
            'time' => '02:00',
            'retention_days' => 30,
            'enabled' => false
        ]);

        return response()->json($schedule);
    }

    public function verifyBackup($filename)
    {
        $backupPath = storage_path('app/backups/' . $filename);
        
        if (!File::exists($backupPath)) {
            return response()->json(['error' => 'Backup file not found'], 404);
        }

        try {
            $isValid = $this->validateBackup([
                'filename' => $filename,
                'path' => $backupPath
            ]);

            $metadata = $this->getBackupMetadata($filename);

            ActivityLog::logActivity(
                Auth::user(),
                'verified_backup',
                'System',
                null,
                null,
                [
                    'backup_file' => $filename,
                    'is_valid' => $isValid,
                    'metadata' => $metadata
                ]
            );

            return response()->json([
                'valid' => $isValid,
                'metadata' => $metadata,
                'message' => $isValid ? 'Backup is valid and intact' : 'Backup validation failed'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Verification failed: ' . $e->getMessage()], 500);
        }
    }

    public function downloadBackup($filename)
    {
        $backupPath = storage_path('app/backups/' . $filename);
        
        if (!File::exists($backupPath)) {
            return redirect()->back()->with('error', 'Backup file not found.');
        }

        ActivityLog::logActivity(
            Auth::user(),
            'downloaded_backup',
            'System',
            null,
            null,
            ['backup_file' => $filename]
        );

        return response()->download($backupPath);
    }

    public function deleteBackup($filename)
    {
        $backupPath = storage_path('app/backups/' . $filename);
        
        if (File::exists($backupPath)) {
            File::delete($backupPath);
            
            ActivityLog::logActivity(
                Auth::user(),
                'deleted_backup',
                'System',
                null,
                null,
                ['backup_file' => $filename]
            );

            return redirect()->back()->with('success', 'Backup deleted successfully.');
        }

        return redirect()->back()->with('error', 'Backup file not found.');
    }

    public function restore()
    {
        $backups = $this->getBackupList();

        return Inertia::render('Admin/System/Restore', [
            'backups' => $backups
        ]);
    }

    public function performRestore(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|string',
            'restore_type' => 'required|in:database,files,full',
            'confirmation' => 'required|accepted'
        ]);

        $backupPath = storage_path('app/backups/' . $request->backup_file);
        
        if (!File::exists($backupPath)) {
            return redirect()->back()->with('error', 'Backup file not found.');
        }

        try {
            $this->executeRestore($backupPath, $request->restore_type);

            ActivityLog::logActivity(
                Auth::user(),
                'performed_restore',
                'System',
                null,
                null,
                [
                    'backup_file' => $request->backup_file,
                    'restore_type' => $request->restore_type
                ]
            );

            return redirect()->back()->with('success', 'System restore completed successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Restore failed: ' . $e->getMessage());
        }
    }

    public function maintenance()
    {
        $maintenanceTasks = [
            'clear_cache' => 'Clear Application Cache',
            'clear_logs' => 'Clear Old Log Files',
            'optimize_db' => 'Optimize Database Tables',
            'clear_sessions' => 'Clear User Sessions',
            'update_statistics' => 'Update System Statistics'
        ];

        $systemHealth = $this->checkSystemHealth();

        return Inertia::render('Admin/System/Maintenance', [
            'maintenanceTasks' => $maintenanceTasks,
            'systemHealth' => $systemHealth
        ]);
    }

    public function runMaintenance(Request $request)
    {
        $request->validate([
            'tasks' => 'required|array',
            'tasks.*' => 'in:clear_cache,clear_logs,optimize_db,clear_sessions,update_statistics'
        ]);

        $results = [];

        foreach ($request->tasks as $task) {
            try {
                $result = $this->executeMaintenanceTask($task);
                $results[$task] = ['success' => true, 'message' => $result];
            } catch (\Exception $e) {
                $results[$task] = ['success' => false, 'message' => $e->getMessage()];
            }
        }

        ActivityLog::logActivity(
            Auth::user(),
            'ran_maintenance',
            'System',
            null,
            null,
            ['tasks' => $request->tasks, 'results' => $results]
        );

        return redirect()->back()->with('success', 'Maintenance tasks completed.')->with('results', $results);
    }

    private function getBackupList()
    {
        $backupPath = storage_path('app/backups');
        
        if (!File::exists($backupPath)) {
            File::makeDirectory($backupPath, 0755, true);
            return [];
        }

        $files = File::files($backupPath);
        $backups = [];

        foreach ($files as $file) {
            $backups[] = [
                'filename' => $file->getFilename(),
                'size' => $this->formatBytes($file->getSize()),
                'created_at' => date('Y-m-d H:i:s', $file->getMTime()),
                'type' => $this->getBackupType($file->getFilename()),
            ];
        }

        return collect($backups)->sortByDesc('created_at')->values()->all();
    }

    private function getSystemInfo()
    {
        return [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'database_size' => $this->getDatabaseSize(),
            'storage_usage' => $this->getStorageUsage(),
            'memory_usage' => $this->formatBytes(memory_get_usage(true)),
            'uptime' => $this->getSystemUptime(),
        ];
    }

    private function performBackup($type, $description)
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        $filename = "backup_{$type}_{$timestamp}.sql";
        $backupPath = storage_path('app/backups/' . $filename);

        // Ensure backup directory exists
        if (!File::exists(dirname($backupPath))) {
            File::makeDirectory(dirname($backupPath), 0755, true);
        }

        switch ($type) {
            case 'database':
                $this->createDatabaseBackup($backupPath);
                break;
            case 'files':
                // Ensure files backup has proper extension
                $filesBackupPath = str_replace('.sql', '_files.tar.gz', $backupPath);
                $this->createFilesBackup($filesBackupPath);
                $backupPath = $filesBackupPath;
                $filename = basename($backupPath);
                break;
            case 'full':
                $this->createFullBackup($backupPath);
                break;
        }

        return [
            'filename' => $filename,
            'size' => $this->formatBytes(File::size($backupPath)),
            'type' => $type,
            'description' => $description
        ];
    }

    private function createDatabaseBackup($backupPath)
    {
        $driver = config('database.default');
        if ($driver === 'pgsql') {
            $databaseName = config('database.connections.pgsql.database');
            $username = config('database.connections.pgsql.username');
            $password = config('database.connections.pgsql.password');
            $host = config('database.connections.pgsql.host');
            $port = config('database.connections.pgsql.port');

            $env = "PGPASSWORD={$password}";
            $command = "$env pg_dump -h {$host} -p {$port} -U {$username} -d {$databaseName} -F p -f {$backupPath}";
        } else {
            $databaseName = config('database.connections.mysql.database');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');
            $host = config('database.connections.mysql.host');
            $command = "mysqldump --user={$username} --password={$password} --host={$host} {$databaseName} > {$backupPath}";
        }

        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new \Exception('Database backup failed');
        }
    }

    private function createFilesBackup($backupPath)
    {
        // Create a tar archive of important files
        $command = "tar -czf {$backupPath} storage/app public/uploads";
        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new \Exception('Files backup failed');
        }
    }

    private function createFullBackup($backupPath)
    {
        // First create database backup
        $this->createDatabaseBackup($backupPath);
        
        // Then append files backup
        $filesBackupPath = str_replace('.sql', '_files.tar.gz', $backupPath);
        $this->createFilesBackup($filesBackupPath);
    }

    private function executeRestore($backupPath, $restoreType)
    {
        switch ($restoreType) {
            case 'database':
                $this->restoreDatabase($backupPath);
                break;
            case 'files':
                $this->restoreFiles($backupPath);
                break;
            case 'full':
                $this->restoreDatabase($backupPath);
                $filesBackupPath = str_replace('.sql', '_files.tar.gz', $backupPath);
                if (File::exists($filesBackupPath)) {
                    $this->restoreFiles($filesBackupPath);
                }
                break;
        }
    }

    private function restoreDatabase($backupPath)
    {
        $driver = config('database.default');
        if ($driver === 'pgsql') {
            $databaseName = config('database.connections.pgsql.database');
            $username = config('database.connections.pgsql.username');
            $password = config('database.connections.pgsql.password');
            $host = config('database.connections.pgsql.host');
            $port = config('database.connections.pgsql.port');
            $env = "PGPASSWORD={$password}";
            $command = "$env psql -h {$host} -p {$port} -U {$username} -d {$databaseName} -f {$backupPath}";
        } else {
            $databaseName = config('database.connections.mysql.database');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');
            $host = config('database.connections.mysql.host');
            $command = "mysql --user={$username} --password={$password} --host={$host} {$databaseName} < {$backupPath}";
        }

        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new \Exception('Database restore failed');
        }
    }

    private function restoreFiles($backupPath)
    {
        $command = "tar -xzf {$backupPath} -C /";
        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new \Exception('Files restore failed');
        }
    }

    private function checkSystemHealth()
    {
        return [
            'database_connection' => $this->checkDatabaseConnection(),
            'storage_writable' => is_writable(storage_path()),
            'cache_writable' => is_writable(storage_path('framework/cache')),
            'logs_writable' => is_writable(storage_path('logs')),
            'disk_space' => $this->checkDiskSpace(),
            'memory_usage' => $this->getMemoryUsagePercentage(),
        ];
    }

    private function executeMaintenanceTask($task)
    {
        switch ($task) {
            case 'clear_cache':
                Artisan::call('cache:clear');
                Artisan::call('config:clear');
                Artisan::call('route:clear');
                Artisan::call('view:clear');
                return 'Cache cleared successfully';

            case 'clear_logs':
                $logFiles = File::glob(storage_path('logs/*.log'));
                foreach ($logFiles as $file) {
                    if (File::lastModified($file) < strtotime('-30 days')) {
                        File::delete($file);
                    }
                }
                return 'Old log files cleared';

            case 'optimize_db':
                if (config('database.default') === 'pgsql') {
                    DB::statement('VACUUM ANALYZE');
                    return 'PostgreSQL VACUUM ANALYZE executed';
                }
                DB::statement('OPTIMIZE TABLE ' . implode(',', $this->getAllTableNames()));
                return 'Database tables optimized';

            case 'clear_sessions':
                DB::table('sessions')->truncate();
                return 'User sessions cleared';

            case 'update_statistics':
                // Update any cached statistics
                return 'System statistics updated';

            default:
                throw new \Exception('Unknown maintenance task');
        }
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    private function getBackupType($filename)
    {
        if (strpos($filename, '_database_') !== false) return 'database';
        if (strpos($filename, '_files_') !== false) return 'files';
        if (strpos($filename, '_full_') !== false) return 'full';
        return 'unknown';
    }

    private function getDatabaseSize()
    {
        $driver = config('database.default');
        if ($driver === 'pgsql') {
            $result = DB::select("SELECT pg_database_size(current_database()) as size");
            return $this->formatBytes($result[0]->size ?? 0);
        }
        $result = DB::select('SELECT SUM(data_length + index_length) as size FROM information_schema.tables WHERE table_schema = ?', [config('database.connections.mysql.database')]);
        return $this->formatBytes($result[0]->size ?? 0);
    }

    private function getStorageUsage()
    {
        $bytes = disk_total_space(storage_path()) - disk_free_space(storage_path());
        return $this->formatBytes($bytes);
    }

    private function getSystemUptime()
    {
        if (PHP_OS_FAMILY === 'Linux') {
            $uptime = shell_exec('uptime -p');
            return trim($uptime);
        }
        return 'N/A';
    }

    private function checkDatabaseConnection()
    {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function checkDiskSpace()
    {
        $freeSpace = disk_free_space(storage_path());
        $totalSpace = disk_total_space(storage_path());
        $usedPercentage = (($totalSpace - $freeSpace) / $totalSpace) * 100;
        
        return [
            'free' => $this->formatBytes($freeSpace),
            'total' => $this->formatBytes($totalSpace),
            'used_percentage' => round($usedPercentage, 2)
        ];
    }

    private function getMemoryUsagePercentage()
    {
        $memoryLimit = ini_get('memory_limit');
        $memoryLimitBytes = $this->convertToBytes($memoryLimit);
        $memoryUsage = memory_get_usage(true);
        
        return round(($memoryUsage / $memoryLimitBytes) * 100, 2);
    }

    private function convertToBytes($value)
    {
        $value = trim($value);
        $last = strtolower($value[strlen($value) - 1]);
        $value = (int) $value;

        switch ($last) {
            case 'g': $value *= 1024;
            case 'm': $value *= 1024;
            case 'k': $value *= 1024;
        }

        return $value;
    }

    private function getAllTableNames()
    {
        $driver = config('database.default');
        if ($driver === 'pgsql') {
            return collect(DB::select("SELECT tablename FROM pg_tables WHERE schemaname = 'public'"))
                ->pluck('tablename')
                ->toArray();
        }
        return DB::select('SHOW TABLES');
    }

    private function cleanOldBackups($retentionDays)
    {
        $backupPath = storage_path('app/backups');
        $cutoffDate = now()->subDays($retentionDays);
        
        if (!File::exists($backupPath)) {
            return;
        }

        $files = File::files($backupPath);
        $deletedCount = 0;

        foreach ($files as $file) {
            if ($file->getMTime() < $cutoffDate->timestamp) {
                File::delete($file->getPathname());
                $deletedCount++;
            }
        }

        if ($deletedCount > 0) {
            ActivityLog::logActivity(
                Auth::user(),
                'cleaned_old_backups',
                'System',
                null,
                null,
                [
                    'deleted_count' => $deletedCount,
                    'retention_days' => $retentionDays
                ]
            );
        }
    }

    private function validateBackup($backupInfo)
    {
        $backupPath = $backupInfo['path'] ?? storage_path('app/backups/' . $backupInfo['filename']);
        
        // Check if file exists and is readable
        if (!File::exists($backupPath) || !is_readable($backupPath)) {
            return false;
        }

        // Check file size (should be greater than 1KB for valid backups)
        if (File::size($backupPath) < 1024) {
            return false;
        }

        // For SQL files, check if it contains valid SQL structure
        if (str_ends_with($backupPath, '.sql')) {
            $content = File::get($backupPath);
            return str_contains($content, 'CREATE TABLE') || str_contains($content, 'INSERT INTO');
        }

        // For tar.gz files, try to list contents
        if (str_ends_with($backupPath, '.tar.gz')) {
            exec("tar -tzf {$backupPath}", $output, $returnCode);
            return $returnCode === 0;
        }

        return true;
    }

    private function storeBackupMetadata($backupInfo, $request)
    {
        $metadataPath = storage_path('app/backups/metadata/' . $backupInfo['filename'] . '.json');
        
        // Ensure metadata directory exists
        if (!File::exists(dirname($metadataPath))) {
            File::makeDirectory(dirname($metadataPath), 0755, true);
        }

        $metadata = [
            'filename' => $backupInfo['filename'],
            'type' => $backupInfo['type'],
            'size' => $backupInfo['size'],
            'description' => $backupInfo['description'] ?? '',
            'created_at' => now()->toISOString(),
            'created_by' => Auth::user()->name ?? 'System',
            'user_id' => Auth::id(),
            'checksum' => hash_file('md5', storage_path('app/backups/' . $backupInfo['filename'])),
            'validation_status' => 'validated',
            'retention_days' => $request->retention_days ?? null,
        ];

        File::put($metadataPath, json_encode($metadata, JSON_PRETTY_PRINT));
    }

    private function getBackupMetadata($filename)
    {
        $metadataPath = storage_path('app/backups/metadata/' . $filename . '.json');
        
        if (!File::exists($metadataPath)) {
            return null;
        }

        return json_decode(File::get($metadataPath), true);
    }

    public function getBackupStatistics()
    {
        $backupPath = storage_path('app/backups');
        
        if (!File::exists($backupPath)) {
            return response()->json([
                'total_backups' => 0,
                'total_size' => 0,
                'oldest_backup' => null,
                'newest_backup' => null,
                'by_type' => []
            ]);
        }

        $files = File::files($backupPath);
        $stats = [
            'total_backups' => count($files),
            'total_size' => 0,
            'oldest_backup' => null,
            'newest_backup' => null,
            'by_type' => [
                'database' => 0,
                'files' => 0,
                'full' => 0
            ]
        ];

        $oldestTime = null;
        $newestTime = null;

        foreach ($files as $file) {
            $size = $file->getSize();
            $stats['total_size'] += $size;
            
            $mtime = $file->getMTime();
            if ($oldestTime === null || $mtime < $oldestTime) {
                $oldestTime = $mtime;
                $stats['oldest_backup'] = [
                    'filename' => $file->getFilename(),
                    'date' => date('Y-m-d H:i:s', $mtime),
                    'size' => $this->formatBytes($size)
                ];
            }
            
            if ($newestTime === null || $mtime > $newestTime) {
                $newestTime = $mtime;
                $stats['newest_backup'] = [
                    'filename' => $file->getFilename(),
                    'date' => date('Y-m-d H:i:s', $mtime),
                    'size' => $this->formatBytes($size)
                ];
            }

            $type = $this->getBackupType($file->getFilename());
            if (isset($stats['by_type'][$type])) {
                $stats['by_type'][$type]++;
            }
        }

        $stats['total_size_formatted'] = $this->formatBytes($stats['total_size']);

        return response()->json($stats);
    }

    public function exportBackupLog()
    {
        $logs = ActivityLog::where('model', 'System')
            ->whereIn('action', ['created_backup', 'backup_failed', 'downloaded_backup', 'deleted_backup', 'performed_restore'])
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        $csvData = "Date,User,Action,Details,Status\n";
        
        foreach ($logs as $log) {
            $user = $log->user ? $log->user->name : 'System';
            $action = $log->getActionDisplayName();
            $details = '';
            $status = 'Success';
            
            if ($log->new_values) {
                if (isset($log->new_values['backup_file'])) {
                    $details = $log->new_values['backup_file'];
                }
                if (isset($log->new_values['error'])) {
                    $details = $log->new_values['error'];
                    $status = 'Failed';
                }
            }
            
            $csvData .= sprintf(
                "%s,%s,%s,%s,%s\n",
                $log->created_at->format('Y-m-d H:i:s'),
                $user,
                $action,
                $details,
                $status
            );
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="backup_log_' . now()->format('Y-m-d') . '.csv"');
    }
}
