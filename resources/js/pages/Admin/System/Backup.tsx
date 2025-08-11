import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';
import React, { useEffect, useState } from 'react';
import { useForm, Link, usePage } from '@inertiajs/react';

type BackupItem = { filename: string; size: string; created_at: string; type: string };

interface SystemInfo {
  php_version: string;
  laravel_version: string;
  database_size: string;
  storage_usage: string;
  memory_usage: string;
  uptime: string;
}

interface PageProps extends Record<string, unknown> { backups: BackupItem[]; systemInfo: SystemInfo }

const Backup: React.FC = () => {
    const page = usePage<PageProps>();
    const [backups, setBackups] = useState<BackupItem[]>(page.props.backups || []);
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(page.props.systemInfo || null);
    const { setData, post, processing } = useForm({
        backup_type: 'database',
        description: '',
        schedule_automatic: false as boolean | undefined,
        retention_days: '' as number | '',
    });

    useEffect(() => {
        setBackups(page.props.backups || []);
        setSystemInfo(page.props.systemInfo || null);
    }, [page.props]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">System Backup</h1>
                        <p className="text-gray-600">Create and manage system backups</p>
                    </div>

                    {/* System Info Cards */}
                    {systemInfo && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                          <div className="text-sm text-gray-500">PHP / Laravel</div>
                          <div className="text-lg font-semibold text-gray-900">{systemInfo.php_version} / {systemInfo.laravel_version}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                          <div className="text-sm text-gray-500">Database Size</div>
                          <div className="text-lg font-semibold text-gray-900">{systemInfo.database_size}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                          <div className="text-sm text-gray-500">Storage / Memory</div>
                          <div className="text-lg font-semibold text-gray-900">{systemInfo.storage_usage} / {systemInfo.memory_usage}</div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">💾</span>
                                <h3 className="text-lg font-semibold text-gray-900">Quick Backup</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Create an immediate backup of all system data</p>
                            <button
                                onClick={() => post('/admin/system/backup/create', { preserveScroll: true })}
                                disabled={processing}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create Backup Now'}
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">📊</span>
                                <h3 className="text-lg font-semibold text-gray-900">Database Only</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Backup only the database without files</p>
                            <button
                                onClick={() => {
                                    setData('backup_type', 'database');
                                    post('/admin/system/backup/create', { preserveScroll: true });
                                }}
                                disabled={processing}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full disabled:opacity-50"
                            >
                                {processing ? 'Working...' : 'Backup Database'}
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">⚙️</span>
                                <h3 className="text-lg font-semibold text-gray-900">Scheduled Backup</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Configure automated backup schedules</p>
                            <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 w-full">
                                Configure Schedule
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Backup History</h2>
                                <div className="flex space-x-2">
                                    <a
                                        href="/admin/system/backup/statistics"
                                        target="_blank"
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
                                        rel="noreferrer"
                                    >
                                        View Statistics
                                    </a>
                                </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Backup Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {backups.map((backup) => (
                                        <tr key={backup.filename} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{backup.filename}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.created_at}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.size}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    Ready
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <a className="text-blue-600 hover:text-blue-900" href={`/admin/system/backup/download/${encodeURIComponent(backup.filename)}`}>Download</a>
                                                    <Link as="button" method="delete" href={`/admin/system/backup/delete/${encodeURIComponent(backup.filename)}`} className="text-red-600 hover:text-red-900">Delete</Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Backup; 