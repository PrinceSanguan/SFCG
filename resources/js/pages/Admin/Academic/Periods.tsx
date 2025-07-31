import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

interface AcademicPeriod {
    id: number;
    name: string;
    type: string;
    school_year: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    periods: AcademicPeriod[];
}

const Periods: React.FC<Props> = ({ periods }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<AcademicPeriod | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        type: 'semester',
        school_year: '',
        start_date: '',
        end_date: '',
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingPeriod) {
            put(`/admin/academic/periods/${editingPeriod.id}`, {
                onSuccess: () => {
                    setEditingPeriod(null);
                    reset();
                }
            });
        } else {
            post('/admin/academic/periods', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (period: AcademicPeriod) => {
        setData('name', period.name);
        setData('type', period.type);
        setData('school_year', period.school_year);
        setData('start_date', period.start_date);
        setData('end_date', period.end_date);
        setData('is_active', period.is_active);
        setEditingPeriod(period);
    };

    const handleDelete = (period: AcademicPeriod) => {
        if (confirm(`Are you sure you want to delete ${period.name}? This action cannot be undone.`)) {
            router.delete(`/admin/academic/periods/${period.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingPeriod(null);
        reset();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const generateSchoolYear = () => {
        const currentYear = new Date().getFullYear();
        return `${currentYear}-${currentYear + 1}`;
    };

    return (
        <AdminLayout>
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Academic Periods</h1>
                        <p className="text-gray-600">Configure academic periods, semesters, and quarters</p>
                    </div>

                    {/* Create Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => {
                                setData('school_year', generateSchoolYear());
                                setShowCreateModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <span className="mr-2">➕</span>
                            Add Academic Period
                        </button>
                    </div>

                    {/* Periods List */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Academic Periods List</h2>
                        </div>
                        
                        {periods.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No academic periods found. Create your first academic period to get started.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School Year</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {periods.map((period) => (
                                            <tr key={period.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{period.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                                                        {period.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{period.school_year}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(period.start_date)} - {formatDate(period.end_date)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        period.is_active 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {period.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(period)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(period)}
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
                        )}
                    </div>

                    {/* Create/Edit Modal */}
                    {(showCreateModal || editingPeriod) && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingPeriod ? 'Edit Academic Period' : 'Create Academic Period'}
                                    </h3>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Period Name
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., 1st Semester, 2nd Quarter"
                                                required
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Type
                                            </label>
                                            <select
                                                value={data.type}
                                                onChange={(e) => setData('type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="semester">Semester</option>
                                                <option value="quarter">Quarter</option>
                                                <option value="trimester">Trimester</option>
                                            </select>
                                            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                School Year
                                            </label>
                                            <input
                                                type="text"
                                                value={data.school_year}
                                                onChange={(e) => setData('school_year', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., 2024-2025"
                                                pattern="^\d{4}-\d{4}$"
                                                required
                                            />
                                            {errors.school_year && <p className="text-red-500 text-xs mt-1">{errors.school_year}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Start Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={data.start_date}
                                                    onChange={(e) => setData('start_date', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    End Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={data.end_date}
                                                    onChange={(e) => setData('end_date', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                                {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                                            </div>
                                        </div>

                                        {editingPeriod && (
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="is_active"
                                                    checked={data.is_active}
                                                    onChange={(e) => setData('is_active', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                                    Active
                                                </label>
                                            </div>
                                        )}

                                        <div className="flex justify-end space-x-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                {processing ? 'Saving...' : (editingPeriod ? 'Update' : 'Create')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </AdminLayout>
    );
};

export default Periods; 