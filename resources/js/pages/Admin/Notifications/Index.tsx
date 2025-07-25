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
                        <h1 className="text-2xl font-bold text-gray-900">Gmail Notifications</h1>
                        <p className="text-gray-600">Send email notifications to users</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Notification</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option>All Users</option>
                                        <option>Students Only</option>
                                        <option>Instructors Only</option>
                                        <option>Parents Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Email subject" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Email message"></textarea>
                                </div>
                                <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
                                    📧 Send Notification
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