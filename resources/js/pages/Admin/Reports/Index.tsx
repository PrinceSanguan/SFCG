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
                        <h1 className="text-2xl font-bold text-gray-900">Generate Reports</h1>
                        <p className="text-gray-600">Generate comprehensive academic and administrative reports</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">👥</span>
                                <h3 className="text-lg font-semibold text-gray-900">User Reports</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Generate reports on students, instructors, and staff</p>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full">
                                Generate
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">📊</span>
                                <h3 className="text-lg font-semibold text-gray-900">Grade Reports</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Generate academic performance and grading reports</p>
                            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full">
                                Generate
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">🏆</span>
                                <h3 className="text-lg font-semibold text-gray-900">Honor Roll Reports</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Generate honor roll and achievement reports</p>
                            <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 w-full">
                                Generate
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">📈</span>
                                <h3 className="text-lg font-semibold text-gray-900">Attendance Reports</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Generate attendance and participation reports</p>
                            <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 w-full">
                                Generate
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">🏫</span>
                                <h3 className="text-lg font-semibold text-gray-900">Academic Reports</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Generate subject and curriculum reports</p>
                            <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 w-full">
                                Generate
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">📋</span>
                                <h3 className="text-lg font-semibold text-gray-900">Custom Reports</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Create custom reports with specific criteria</p>
                            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 w-full">
                                Create
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Index; 