import Header from '@/pages/Parent/Header';
import Sidebar from '@/pages/Parent/Sidebar';
import React from 'react';

const ParentDashboard: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600">Welcome back! Here's what's happening.</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ParentDashboard;
