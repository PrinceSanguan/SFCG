import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';
import React from 'react';

const UploadCsv: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Upload Users CSV</h1>
                        <p className="text-gray-600">Bulk import users via CSV file upload</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <div className="mb-4">
                                    <span className="text-4xl">📤</span>
                                </div>
                                <p className="text-gray-600 mb-4">Drag and drop your CSV file here, or click to browse</p>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    Choose File
                                </button>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <h3 className="font-medium text-gray-900 mb-2">CSV Format Requirements:</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• First row should contain column headers</li>
                                <li>• Required columns: name, email, role, password</li>
                                <li>• Supported roles: instructor, teacher, adviser, chairperson, principal, student, parent</li>
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UploadCsv; 