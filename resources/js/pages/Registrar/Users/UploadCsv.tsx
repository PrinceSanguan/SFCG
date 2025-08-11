import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Header from '@/pages/Registrar/Header';
import Sidebar from '@/pages/Registrar/Sidebar';

const UploadCsv: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        csv_file: null as File | null,
        user_type: 'instructor',
    });

    const lockedType = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        const t = (params.get('type') || '').trim();
        const allowed = ['instructor','teacher','adviser','chairperson','principal'];
        return allowed.includes(t) ? t : '';
    }, []);

    useEffect(() => { if (lockedType) { setData('user_type', lockedType as unknown as string); } }, [lockedType, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;
        setData('csv_file', selectedFile);
        post('/registrar/users/upload', {
            forceFormData: true,
            onSuccess: () => { reset(); setSelectedFile(null); },
        });
    };

    const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true); else if (e.type === 'dragleave') setDragActive(false); };
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) { const file = e.dataTransfer.files[0]; if (file.type === 'text/csv' || file.name.endsWith('.csv')) { setSelectedFile(file); setData('csv_file', file); } else { alert('Please select a CSV file.'); } } };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; setSelectedFile(file); setData('csv_file', file); } };
    const removeFile = () => { setSelectedFile(null); setData('csv_file', null); };

    const userTypes: Array<{ value: string; label: string; description: string }> = [
        { value: 'instructor', label: 'Instructors', description: 'College-level instructors' },
        { value: 'teacher', label: 'Teachers', description: 'K-12 teachers' },
        { value: 'adviser', label: 'Advisers', description: 'Class advisers' },
        { value: 'chairperson', label: 'Chairpersons', description: 'Department chairpersons' },
        { value: 'principal', label: 'Principals', description: 'School principals' },
    ];

    const getSampleCsvFormat = () => 'name,email,password';

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6">
                    <div className="mb-8"><h1 className="text-2xl font-bold text-gray-900">Bulk User Upload</h1><p className="text-gray-600">Upload CSV files to create multiple user accounts at once</p></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                                    {lockedType ? (
                                        <input type="text" value={userTypes.find(u => u.value === lockedType)?.label || ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700" />
                                    ) : (
                                        <select value={data.user_type as string} onChange={(e) => setData('user_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                            {userTypes.map((type) => (
                                                <option key={type.value} value={type.value}>{type.label} - {type.description}</option>
                                            ))}
                                        </select>
                                    )}
                                    {errors.user_type && <p className="text-red-500 text-xs mt-1">{errors.user_type}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">CSV File</label>
                                    {!selectedFile ? (
                                        <div className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                                            <div className="space-y-4">
                                                <div className="mx-auto h-12 w-12 text-gray-400">
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-gray-900">Drop your CSV file here</p>
                                                    <p className="text-sm text-gray-500">or click to browse</p>
                                                </div>
                                                <div className="text-xs text-gray-400">Maximum file size: 2MB</div>
                                            </div>
                                            <input type="file" accept=".csv" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        </div>
                                    ) : (
                                        <div className="border border-gray-300 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3"><div className="flex-shrink-0"><svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div><div><p className="text-sm font-medium text-gray-900">{selectedFile.name}</p><p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p></div></div>
                                                <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-700"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                            </div>
                                        </div>
                                    )}
                                    {errors.csv_file && <p className="text-red-500 text-xs mt-1">{errors.csv_file}</p>}
                                </div>
                                <div className="flex justify-end"><button type="submit" disabled={processing || !selectedFile} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">{processing ? 'Uploading...' : 'Upload CSV'}</button></div>
                            </form>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">CSV Format Requirements</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Required Format for {data.user_type}:</h4>
                                        <div className="bg-gray-100 p-3 rounded-lg"><code className="text-sm text-gray-800">{getSampleCsvFormat()}</code></div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-gray-900">Field Descriptions:</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li><strong>name:</strong> Full name of the user</li>
                                            <li><strong>email:</strong> Unique email address</li>
                                            <li><strong>password:</strong> Password (optional, defaults to 'password123')</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>Email addresses must be unique across all users</li>
                                    <li>Existing users with the same email will be skipped</li>
                                    <li>Maximum file size is 2MB</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UploadCsv;