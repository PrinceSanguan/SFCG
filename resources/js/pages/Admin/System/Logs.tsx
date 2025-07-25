import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';
import React from 'react';

const Logs: React.FC = () => {
    const auditLogs = [
        { id: 1, action: 'User Login', user: 'admin@school.edu', timestamp: '2024-01-20 09:15:32', ip: '192.168.1.100', status: 'Success' },
        { id: 2, action: 'Student Added', user: 'admin@school.edu', timestamp: '2024-01-20 09:10:15', ip: '192.168.1.100', status: 'Success' },
        { id: 3, action: 'Grade Updated', user: 'instructor@school.edu', timestamp: '2024-01-20 08:45:22', ip: '192.168.1.105', status: 'Success' },
        { id: 4, action: 'Failed Login Attempt', user: 'unknown', timestamp: '2024-01-20 08:30:45', ip: '192.168.1.200', status: 'Failed' },
        { id: 5, action: 'CSV Upload', user: 'admin@school.edu', timestamp: '2024-01-20 08:15:10', ip: '192.168.1.100', status: 'Success' }
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                        <p className="text-gray-600">Monitor system activities and user actions</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">System Activity Log</h2>
                            <div className="flex space-x-2">
                                <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option>All Actions</option>
                                    <option>Login Events</option>
                                    <option>User Management</option>
                                    <option>Grade Changes</option>
                                    <option>System Changes</option>
                                </select>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm">
                                    Filter
                                </button>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {auditLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.action}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.user}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    log.status === 'Success' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {log.status}
                                                </span>
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

export default Logs; 