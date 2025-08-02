import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import RegistrarLayout from '@/pages/Registrar/RegistrarLayout';

interface Props {
    // Add any props if needed
}

const UploadCsv: React.FC<Props> = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [userType, setUserType] = useState('instructor');

    const { data, setData, post, processing, errors, reset } = useForm({
        csv_file: null as File | null,
        user_type: 'instructor',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setData('csv_file', file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedFile) {
            alert('Please select a CSV file');
            return;
        }

        const formData = new FormData();
        formData.append('csv_file', selectedFile);
        formData.append('user_type', userType);

        post('/registrar/users/upload', {
            data: formData,
            onSuccess: () => {
                setSelectedFile(null);
                setUserType('instructor');
                reset();
            }
        });
    };

    const downloadTemplate = () => {
        // Create a sample CSV template based on user type
        const headers = ['name', 'email', 'password', 'contact_number', 'department', 'specialization'];
        const sampleData = ['John Doe', 'john.doe@example.com', 'password123', '+1234567890', 'Computer Science', 'Software Engineering'];
        
        const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${userType}_template.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <RegistrarLayout>
            <Head title="Upload Users - Registrar" />
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Upload Users</h1>
                <p className="text-gray-600 mt-2">Bulk upload user accounts via CSV file</p>
            </div>

            <div className="max-w-2xl mx-auto">
                {/* Upload Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload CSV File</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* User Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                User Type
                            </label>
                            <select
                                value={userType}
                                onChange={(e) => {
                                    setUserType(e.target.value);
                                    setData('user_type', e.target.value);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="instructor">Instructors</option>
                                <option value="teacher">Teachers</option>
                                <option value="adviser">Advisers</option>
                                <option value="chairperson">Chairpersons</option>
                                <option value="principal">Principals</option>
                            </select>
                            {errors.user_type && <p className="text-red-500 text-xs mt-1">{errors.user_type}</p>}
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CSV File
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <input
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label htmlFor="csv-upload" className="cursor-pointer">
                                    <div className="space-y-2">
                                        <div className="text-4xl">📁</div>
                                        <div className="text-sm text-gray-600">
                                            {selectedFile ? (
                                                <span className="text-green-600 font-medium">
                                                    Selected: {selectedFile.name}
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="font-medium text-blue-600 hover:text-blue-500">
                                                        Click to upload
                                                    </span>
                                                    {' '}or drag and drop
                                                </>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            CSV files only, max 2MB
                                        </p>
                                    </div>
                                </label>
                            </div>
                            {errors.csv_file && <p className="text-red-500 text-xs mt-1">{errors.csv_file}</p>}
                        </div>

                        {/* Template Download */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-blue-900 mb-2">Need a template?</h3>
                            <p className="text-sm text-blue-700 mb-3">
                                Download a sample CSV template for {userType}s to see the required format.
                            </p>
                            <button
                                type="button"
                                onClick={downloadTemplate}
                                className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                📥 Download Template
                            </button>
                        </div>

                        {/* CSV Format Instructions */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">CSV Format Requirements</h3>
                            <div className="text-sm text-gray-700 space-y-1">
                                <p><strong>Required columns:</strong> name, email, password</p>
                                <p><strong>Optional columns:</strong> contact_number, department, specialization</p>
                                <p><strong>Password:</strong> Must be at least 8 characters</p>
                                <p><strong>Email:</strong> Must be unique and valid format</p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing || !selectedFile}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        📤 Upload Users
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
                    <div className="space-y-4 text-sm text-gray-700">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">1. Prepare Your CSV File</h3>
                            <p>Ensure your CSV file has the correct headers and data format. Use the template above as a reference.</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">2. Select User Type</h3>
                            <p>Choose the appropriate user type for the accounts you're uploading. This will determine the role assigned to all users in the file.</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">3. Upload and Process</h3>
                            <p>Upload your CSV file and the system will process it. You'll receive a summary of successful imports and any errors.</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">4. Review Results</h3>
                            <p>Check the uploaded users in their respective management pages to ensure everything was imported correctly.</p>
                        </div>
                    </div>
                </div>
            </div>
        </RegistrarLayout>
    );
};

export default UploadCsv; 