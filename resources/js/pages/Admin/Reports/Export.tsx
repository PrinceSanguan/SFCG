import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';
import React from 'react';

const Export: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
                        <p className="text-gray-600">Export academic and administrative data in various formats</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option>All Users</option>
                                        <option>Students Only</option>
                                        <option>Instructors Only</option>
                                        <option>Grade Records</option>
                                        <option>Attendance Records</option>
                                        <option>Academic Structure</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option>CSV</option>
                                        <option>Excel (XLSX)</option>
                                        <option>PDF</option>
                                        <option>JSON</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg" />
                                        <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                </div>
                                <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 w-full">
                                    💾 Export Data
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">All Students Data</p>
                                        <p className="text-xs text-gray-500">Exported 2 hours ago • CSV</p>
                                    </div>
                                    <button className="text-blue-500 hover:text-blue-700 text-sm">Download</button>
                                </div>
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Grade Reports</p>
                                        <p className="text-xs text-gray-500">Exported 1 day ago • Excel</p>
                                    </div>
                                    <button className="text-blue-500 hover:text-blue-700 text-sm">Download</button>
                                </div>
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Instructor List</p>
                                        <p className="text-xs text-gray-500">Exported 3 days ago • PDF</p>
                                    </div>
                                    <button className="text-blue-500 hover:text-blue-700 text-sm">Download</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Export; 