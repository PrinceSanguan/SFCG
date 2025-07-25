import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';
import React from 'react';

const Backup: React.FC = () => {
    const backups = [
        { id: 1, name: 'Full System Backup', date: '2024-01-20 02:00:00', size: '2.5 GB', type: 'Automated', status: 'Complete' },
        { id: 2, name: 'Database Backup', date: '2024-01-19 02:00:00', size: '1.2 GB', type: 'Automated', status: 'Complete' },
        { id: 3, name: 'Manual Backup', date: '2024-01-18 14:30:00', size: '2.3 GB', type: 'Manual', status: 'Complete' },
        { id: 4, name: 'Weekly Backup', date: '2024-01-15 02:00:00', size: '2.1 GB', type: 'Automated', status: 'Complete' },
    ];

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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">💾</span>
                                <h3 className="text-lg font-semibold text-gray-900">Quick Backup</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Create an immediate backup of all system data</p>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full">
                                Create Backup Now
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">📊</span>
                                <h3 className="text-lg font-semibold text-gray-900">Database Only</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Backup only the database without files</p>
                            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full">
                                Backup Database
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
                                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option>All Backups</option>
                                    <option>Automated Only</option>
                                    <option>Manual Only</option>
                                    <option>Last 30 Days</option>
                                </select>
                                <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm">
                                    Clean Old Backups
                                </button>
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
                                        <tr key={backup.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{backup.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.size}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    {backup.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button className="text-blue-600 hover:text-blue-900">Download</button>
                                                    <button className="text-red-600 hover:text-red-900">Delete</button>
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