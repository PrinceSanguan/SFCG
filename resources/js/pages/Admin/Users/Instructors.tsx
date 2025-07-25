import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';
import React from 'react';

const Instructors: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Instructors Management</h1>
                        <p className="text-gray-600">Manage instructor accounts and assignments</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Instructors List</h2>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                Add Instructor
                            </button>
                        </div>
                        <p className="text-gray-500">Instructor management functionality will be implemented here.</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Instructors; 