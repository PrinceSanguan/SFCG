import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';
import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

const Export: React.FC = () => {
    const { data, setData } = useForm({
        export_type: 'all_users',
        format: 'csv',
        date_from: '',
        date_to: '',
    });

    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const params = new URLSearchParams();
            params.set('export_type', data.export_type);
            params.set('format', data.format);
            if (data.date_from) params.set('date_from', data.date_from);
            if (data.date_to) params.set('date_to', data.date_to);
            const url = `/admin/reports/export-data?${params.toString()}`;
            window.location.href = url;
        } finally {
            setDownloading(false);
        }
    };

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
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={data.export_type} onChange={(e) => setData('export_type', e.target.value)}>
                                        <option value="all_users">All Users</option>
                                        <option value="students">Students Only</option>
                                        <option value="instructors">Instructors Only</option>
                                        <option value="grades">Grade Records</option>
                                        <option value="honors">Honor Roll Data</option>
                                        <option value="activity_logs">Activity Logs</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={data.format} onChange={(e) => setData('format', e.target.value)}>
                                        <option value="csv">CSV</option>
                                        <option value="json">JSON</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg" value={data.date_from as string} onChange={(e) => setData('date_from', e.target.value)} />
                                        <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg" value={data.date_to as string} onChange={(e) => setData('date_to', e.target.value)} />
                                    </div>
                                </div>
                                <button disabled={downloading} onClick={handleDownload} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 w-full disabled:opacity-50">
                                    {downloading ? 'Preparing...' : '💾 Export Data'}
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