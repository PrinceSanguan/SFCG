import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import RegistrarLayout from '@/pages/Registrar/RegistrarLayout';

interface Student {
    id: number;
    name: string;
    student_profile?: {
        student_id: string;
        grade_level: string;
        section: string;
        academic_level?: {
            name: string;
        };
    };
}

interface StudentHonor {
    id: number;
    student: Student;
    honor_type: string;
    gpa: number;
    is_approved: boolean;
    awarded_date?: string;
    created_at: string;
}

interface Props {
    honors: {
        data: StudentHonor[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const HonorRoll: React.FC<Props> = ({ honors = { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 } }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingHonor, setEditingHonor] = useState<StudentHonor | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [honorToDelete, setHonorToDelete] = useState<StudentHonor | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        student_id: '',
        honor_type: '',
        gpa: '',
        is_approved: false as boolean,
        awarded_date: '',
        remarks: '',
    });

    const handleCalculateHonors = () => {
        post('/registrar/honors/calculate');
    };

    const handleExportHonorRoll = () => {
        post('/registrar/honors/export');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingHonor) {
            put(`/registrar/honors/${editingHonor.id}`, {
                onSuccess: () => {
                    setEditingHonor(null);
                    setShowCreateModal(false);
                    reset();
                }
            });
        } else {
            post('/registrar/honors', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (honor: StudentHonor) => {
        setData('student_id', honor.student.id.toString());
        setData('honor_type', honor.honor_type);
        setData('gpa', honor.gpa.toString());
        setData('is_approved', honor.is_approved as boolean);
        setData('awarded_date', honor.awarded_date || '');
        setData('remarks', '');
        setEditingHonor(honor);
        setShowCreateModal(true);
    };

    const handleDelete = (honor: StudentHonor) => {
        setHonorToDelete(honor);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (honorToDelete) {
            destroy(`/registrar/honors/${honorToDelete.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setHonorToDelete(null);
                }
            });
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingHonor(null);
        setShowDeleteModal(false);
        setHonorToDelete(null);
        reset();
    };

    const getHonorTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            'honor_roll': 'bg-blue-100 text-blue-800',
            'dean_list': 'bg-green-100 text-green-800',
            'president_list': 'bg-purple-100 text-purple-800',
            'academic_excellence': 'bg-yellow-100 text-yellow-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Head title="Honor Roll - Registrar" />
            <RegistrarLayout>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Honor Roll</h1>
                                <p className="text-gray-600 mt-2">View and manage approved student honors</p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Add Honor
                                </button>
                                <button
                                    onClick={handleCalculateHonors}
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {processing ? 'Calculating...' : 'Calculate Honors'}
                                </button>
                                <button
                                    onClick={handleExportHonorRoll}
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Honor Roll Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Honor Roll ({honors?.total || 0})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Academic Level
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Honor Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            GPA
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Awarded Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {honors?.data?.map((honor) => (
                                        <tr key={honor.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {honor.student.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {honor.student.student_profile?.student_id || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {honor.student.student_profile?.academic_level?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHonorTypeColor(honor.honor_type)}`}>
                                                    {honor.honor_type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {honor.gpa.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    honor.is_approved 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {honor.is_approved ? 'Approved' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {honor.awarded_date 
                                                    ? new Date(honor.awarded_date).toLocaleDateString()
                                                    : 'Not awarded'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(honor)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(honor)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {honors?.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {((honors?.current_page || 1) - 1) * (honors?.per_page || 20) + 1} to{' '}
                                        {Math.min((honors?.current_page || 1) * (honors?.per_page || 20), honors?.total || 0)} of{' '}
                                        {honors?.total || 0} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {honors?.current_page > 1 && (
                                            <Link
                                                href={`/registrar/honors/roll?page=${(honors?.current_page || 1) - 1}`}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {honors?.current_page < honors?.last_page && (
                                            <Link
                                                href={`/registrar/honors/roll?page=${(honors?.current_page || 1) + 1}`}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create/Edit Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingHonor ? 'Edit Honor' : 'Add New Honor'}
                                </h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Student ID</label>
                                            <input
                                                type="text"
                                                value={data.student_id}
                                                onChange={(e) => setData('student_id', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {errors.student_id && <p className="text-red-500 text-xs mt-1">{errors.student_id}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Honor Type</label>
                                            <select
                                                value={data.honor_type}
                                                onChange={(e) => setData('honor_type', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="">Select Honor Type</option>
                                                <option value="honor_roll">Honor Roll</option>
                                                <option value="dean_list">Dean's List</option>
                                                <option value="president_list">President's List</option>
                                                <option value="academic_excellence">Academic Excellence</option>
                                            </select>
                                            {errors.honor_type && <p className="text-red-500 text-xs mt-1">{errors.honor_type}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">GPA</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="4"
                                                value={data.gpa}
                                                onChange={(e) => setData('gpa', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {errors.gpa && <p className="text-red-500 text-xs mt-1">{errors.gpa}</p>}
                                        </div>
                                        <div>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_approved}
                                                    onChange={(e) => setData('is_approved', e.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Approved</span>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Awarded Date</label>
                                            <input
                                                type="date"
                                                value={data.awarded_date}
                                                onChange={(e) => setData('awarded_date', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {errors.awarded_date && <p className="text-red-500 text-xs mt-1">{errors.awarded_date}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Remarks</label>
                                            <textarea
                                                value={data.remarks}
                                                onChange={(e) => setData('remarks', e.target.value)}
                                                rows={3}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {errors.remarks && <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : (editingHonor ? 'Update' : 'Create')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Are you sure you want to delete this honor? This action cannot be undone.
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </RegistrarLayout>
        </>
    );
};

export default HonorRoll; 