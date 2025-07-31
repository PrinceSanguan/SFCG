<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use App\Models\ActivityLog;
use App\Models\User;

class AutomatedBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:run {--type=full} {--force}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run automated system backup based on configured schedule';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting automated backup process...');

        try {
            // Get backup schedule configuration
            $schedule = cache()->get('backup_schedule');
            
            if (!$schedule || !$schedule['enabled']) {
                if (!$this->option('force')) {
                    $this->warn('Backup schedule is disabled. Use --force to run anyway.');
                    return 0;
                }
                $schedule = $this->getDefaultSchedule();
            }

            $backupType = $this->option('type') ?: $schedule['backup_type'];
            
            $this->info("Creating {$backupType} backup...");

            // Clean old backups first
            if (isset($schedule['retention_days'])) {
                $this->cleanOldBackups($schedule['retention_days']);
            }

            // Create backup
            $backupInfo = $this->performBackup($backupType);
            
            // Validate backup
            $isValid = $this->validateBackup($backupInfo);
            
            if (!$isValid) {
                throw new \Exception('Backup validation failed');
            }

            // Store metadata
            $this->storeBackupMetadata($backupInfo, $schedule);

            // Log activity
            ActivityLog::logActivity(
                null, // System user
                'automated_backup_success',
                'System',
                null,
                null,
                [
                    'backup_type' => $backupType,
                    'backup_file' => $backupInfo['filename'],
                    'file_size' => $backupInfo['size'],
                    'validated' => $isValid
                ]
            );

            $this->info("✅ Backup completed successfully: {$backupInfo['filename']}");
            $this->info("📁 Size: {$backupInfo['size']}");
            
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Backup failed: " . $e->getMessage());
            
            // Log failure
            ActivityLog::logActivity(
                null,
                'automated_backup_failed',
                'System',
                null,
                null,
                [
                    'error' => $e->getMessage(),
                    'backup_type' => $backupType ?? 'unknown'
                ]
            );
            
            return 1;
        }
    }

    private function getDefaultSchedule()
    {
        return [
            'backup_type' => 'full',
            'retention_days' => 30,
            'enabled' => true
        ];
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
            $this->info("🧹 Cleaned {$deletedCount} old backup(s) (older than {$retentionDays} days)");
        }
    }

    private function performBackup($type)
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        $filename = "backup_{$type}_{$timestamp}";
        
        switch ($type) {
            case 'database':
                $filename .= '.sql';
                $backupPath = storage_path('app/backups/' . $filename);
                $this->createDatabaseBackup($backupPath);
                break;
                
            case 'files':
                $filename .= '.tar.gz';
                $backupPath = storage_path('app/backups/' . $filename);
                $this->createFilesBackup($backupPath);
                break;
                
            case 'full':
                $filename .= '.sql';
                $backupPath = storage_path('app/backups/' . $filename);
                $this->createDatabaseBackup($backupPath);
                
                // Also create files backup
                $filesFilename = "backup_files_{$timestamp}.tar.gz";
                $filesBackupPath = storage_path('app/backups/' . $filesFilename);
                $this->createFilesBackup($filesBackupPath);
                break;
                
            default:
                throw new \Exception("Unknown backup type: {$type}");
        }

        return [
            'filename' => $filename,
            'size' => $this->formatBytes(File::size($backupPath)),
            'type' => $type,
            'path' => $backupPath
        ];
    }

    private function createDatabaseBackup($backupPath)
    {
        // Ensure backup directory exists
        if (!File::exists(dirname($backupPath))) {
            File::makeDirectory(dirname($backupPath), 0755, true);
        }

        $this->info("📊 Creating database backup using Laravel...");
        
        try {
            // Get all table names
            $tables = DB::select('SHOW TABLES');
            $databaseName = config('database.connections.mysql.database');
            
            $sqlContent = "-- Database backup created on " . now()->toDateTimeString() . "\n";
            $sqlContent .= "-- Database: {$databaseName}\n\n";
            $sqlContent .= "SET FOREIGN_KEY_CHECKS = 0;\n\n";

            foreach ($tables as $table) {
                $tableName = array_values((array) $table)[0];
                
                // Get CREATE TABLE statement
                $createTable = DB::select("SHOW CREATE TABLE `{$tableName}`");
                $createStatement = $createTable[0]->{'Create Table'};
                
                $sqlContent .= "-- Table structure for table `{$tableName}`\n";
                $sqlContent .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
                $sqlContent .= $createStatement . ";\n\n";
                
                // Get table data
                $rows = DB::table($tableName)->get();
                
                if ($rows->count() > 0) {
                    $sqlContent .= "-- Dumping data for table `{$tableName}`\n";
                    $sqlContent .= "INSERT INTO `{$tableName}` VALUES ";
                    
                    $values = [];
                    foreach ($rows as $row) {
                        $rowArray = (array) $row;
                        $escapedValues = array_map(function($value) {
                            if (is_null($value)) {
                                return 'NULL';
                            }
                            return "'" . addslashes($value) . "'";
                        }, $rowArray);
                        $values[] = '(' . implode(',', $escapedValues) . ')';
                    }
                    
                    $sqlContent .= implode(",\n", $values) . ";\n\n";
                }
            }
            
            $sqlContent .= "SET FOREIGN_KEY_CHECKS = 1;\n";
            
            // Write to file
            File::put($backupPath, $sqlContent);
            
        } catch (\Exception $e) {
            throw new \Exception('Database backup failed: ' . $e->getMessage());
        }
    }

    private function createFilesBackup($backupPath)
    {
        $this->info("📁 Creating files backup...");
        
        // Create tar archive of important directories
        $sourcePaths = [
            'storage/app',
            'public/uploads',
            'public/images'
        ];
        
        // Filter existing paths
        $existingPaths = [];
        foreach ($sourcePaths as $path) {
            if (File::exists(base_path($path))) {
                $existingPaths[] = $path;
            }
        }
        
        if (empty($existingPaths)) {
            // Create empty archive
            touch($backupPath);
            return;
        }
        
        $pathsString = implode(' ', $existingPaths);
        $command = "cd " . base_path() . " && tar -czf {$backupPath} {$pathsString}";
        
        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new \Exception('Files backup failed with return code: ' . $returnCode);
        }
    }

    private function validateBackup($backupInfo)
    {
        $backupPath = $backupInfo['path'];
        
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

    private function storeBackupMetadata($backupInfo, $schedule)
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
            'created_at' => now()->toISOString(),
            'created_by' => 'Automated System',
            'automated' => true,
            'schedule' => $schedule,
            'checksum' => hash_file('md5', $backupInfo['path']),
            'validation_status' => 'validated'
        ];

        File::put($metadataPath, json_encode($metadata, JSON_PRETTY_PRINT));
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
