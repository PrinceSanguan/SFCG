import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';
import React from 'react';
import { useForm } from '@inertiajs/react';

const Restore: React.FC = () => {
    const { data, setData, post, processing } = useForm({
        backup_file: '',
        restore_type: 'database',
        confirmation: false,
    });
    const availableBackups = [
        { id: 1, name: 'Full System Backup', date: '2024-01-20 02:00:00', size: '2.5 GB', type: 'Complete System' },
        { id: 2, name: 'Database Backup', date: '2024-01-19 02:00:00', size: '1.2 GB', type: 'Database Only' },
        { id: 3, name: 'Manual Backup', date: '2024-01-18 14:30:00', size: '2.3 GB', type: 'Complete System' },
        { id: 4, name: 'Weekly Backup', date: '2024-01-15 02:00:00', size: '2.1 GB', type: 'Complete System' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">System Restore</h1>
                        <p className="text-gray-600">Restore system data from previous backups</p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-red-400 text-xl">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Warning</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>Restoring from a backup will overwrite all current data. This action cannot be undone. Please ensure you have a recent backup before proceeding.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Backup File</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    post('/admin/system/restore');
                                }}
                            >
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                                    <div className="mb-4">
                                        <span className="text-4xl">📁</span>
                                    </div>
                                    <p className="text-gray-600 mb-4">Enter backup filename from the list to restore</p>
                                    <input
                                        type="text"
                                        className="w-full border px-3 py-2 rounded"
                                        placeholder="backup_database_2024-01-20_02-00-00.sql"
                                        value={data.backup_file}
                                        onChange={(e) => setData('backup_file', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" checked={data.restore_type === 'database'} onChange={() => setData('restore_type', 'database')} />
                                        <span className="ml-2 text-sm text-gray-700">Restore Database</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" checked={data.restore_type === 'files'} onChange={() => setData('restore_type', 'files')} />
                                        <span className="ml-2 text-sm text-gray-700">Restore User Files</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" checked={data.restore_type === 'full'} onChange={() => setData('restore_type', 'full')} />
                                        <span className="ml-2 text-sm text-gray-700">Full Restore</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" checked={!!data.confirmation} onChange={(e) => setData('confirmation', e.target.checked)} />
                                        <span className="ml-2 text-sm text-gray-700">I understand this will overwrite data</span>
                                    </label>
                                    <button disabled={processing} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                                        {processing ? 'Restoring...' : 'Start Restore'}
                                    </button>
                                </div>
                            </form>
                            <div className="text-sm text-gray-500">
                                <p>Supported formats: .sql, .zip, .tar.gz</p>
                                <p>Maximum file size: 5GB</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Restore Options</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" defaultChecked />
                                        <span className="ml-2 text-sm text-gray-700">Restore Database</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" defaultChecked />
                                        <span className="ml-2 text-sm text-gray-700">Restore User Files</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
                                        <span className="ml-2 text-sm text-gray-700">Restore System Configuration</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
                                        <span className="ml-2 text-sm text-gray-700">Create backup before restore</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Available Backups</h2>
                            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm">
                                Refresh List
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Backup Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {availableBackups.map((backup) => (
                                        <tr key={backup.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{backup.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.size}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 text-sm">
                                                    🔄 Restore
                                                </button>
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

export default Restore; 