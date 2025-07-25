import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';
import React from 'react';

const Index: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Configure Honors</h1>
                        <p className="text-gray-600">Set up honor roll criteria and academic recognition settings</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Honor Roll Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum GPA for Honor Roll</label>
                                    <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="3.50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">High Honor Roll GPA</label>
                                    <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="3.75" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Highest Honor Roll GPA</label>
                                    <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="4.00" />
                                </div>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Save Settings
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Honor Roll</h2>
                            <div className="space-y-3">
                                <div className="text-sm text-gray-600">
                                    Honor roll will be calculated based on the criteria set in the left panel.
                                </div>
                                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                    🏆 Generate Honor Roll
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Index; 