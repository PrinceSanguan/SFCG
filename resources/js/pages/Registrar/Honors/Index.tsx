import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import RegistrarLayout from '@/pages/Registrar/RegistrarLayout';

interface HonorCriterion {
    id: number;
    honor_type: string;
    minimum_grade: number;
    maximum_grade?: number;
    criteria_description: string;
    academic_level_id?: number;
    is_active: boolean;
}

interface StudentProfile {
    id: number;
    student_id: string;
    grade_level: string;
    section: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
    student_profile?: StudentProfile;
}

interface RecentHonor {
    id: number;
    student: Student;
    honorCriterion: HonorCriterion;
    honor_type: string;
    gpa: number;
    is_approved: boolean;
    awarded_date: string;
    created_at: string;
}

interface AcademicPeriod {
    id: number;
    name: string;
}

interface AcademicLevel {
    id: number;
    name: string;
    code: string;
}

interface Props {
    honorCriteria: {
        data: HonorCriterion[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    recentHonors: RecentHonor[];
    stats: {
        total_honors: number;
        average_gpa: number;
        highest_gpa: number;
        by_honor_type: Record<string, number>;
        by_period: Record<string, number>;
        approved_honors: number;
        pending_honors: number;
    };
    academicPeriods: AcademicPeriod[];
    academicLevels: AcademicLevel[];
}

const HonorsIndex: React.FC<Props> = ({ 
    honorCriteria = { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 },
    recentHonors = [],
    stats = {
        total_honors: 0,
        average_gpa: 0,
        highest_gpa: 0,
        by_honor_type: {},
        by_period: {},
        approved_honors: 0,
        pending_honors: 0
    },
    academicPeriods = [],
    academicLevels = []
}) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCriterion, setEditingCriterion] = useState<HonorCriterion | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<HonorCriterion | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        honor_type: '',
        minimum_grade: '',
        maximum_grade: '',
        criteria_description: '',
        academic_level_id: '',
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingCriterion) {
            put(`/registrar/honors/criteria/${editingCriterion.id}`, {
                onSuccess: () => {
                    setEditingCriterion(null);
                    setShowCreateModal(false);
                    reset();
                }
            });
        } else {
            post('/registrar/honors/criteria', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (criterion: HonorCriterion) => {
        setData('honor_type', criterion.honor_type);
        setData('minimum_grade', criterion.minimum_grade.toString());
        setData('maximum_grade', criterion.maximum_grade?.toString() || '');
        setData('criteria_description', criterion.criteria_description);
        setData('academic_level_id', criterion.academic_level_id?.toString() || '');
        setData('is_active', criterion.is_active);
        setEditingCriterion(criterion);
        setShowCreateModal(true);
    };

    const handleDelete = (criterion: HonorCriterion) => {
        setShowDeleteModal(criterion);
    };

    const confirmDelete = () => {
        if (showDeleteModal) {
            router.delete(`/registrar/honors/criteria/${showDeleteModal.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(null);
                }
            });
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingCriterion(null);
        setShowDeleteModal(null);
        reset();
    };

    const handleCalculateHonors = () => {
        post('/registrar/honors/calculate');
    };

    const handleExportHonors = () => {
        post('/registrar/honors/export');
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

    const getApprovalStatusColor = (approved: boolean) => {
        return approved 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800';
    };

    return (
        <>
            <Head title="Honors Management - Registrar" />
            <RegistrarLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Honors Management</h1>
                            <p className="text-gray-600 mt-2">Manage honor criteria and student honors</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Add Honor Criterion
                            </button>
                            <button
                                onClick={handleCalculateHonors}
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {processing ? 'Calculating...' : 'Calculate Honors'}
                            </button>
                            <button
                                onClick={handleExportHonors}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Total Honors</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.total_honors}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Honor Criteria</h3>
                        <p className="text-3xl font-bold text-green-600">{honorCriteria.total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Approved Honors</h3>
                        <p className="text-3xl font-bold text-yellow-600">
                            {stats.approved_honors}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Pending Approval</h3>
                        <p className="text-3xl font-bold text-red-600">
                            {stats.pending_honors}
                        </p>
                    </div>
                </div>

                {/* Honor Criteria Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Honor Criteria</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Honor Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Grade Range
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Academic Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {honorCriteria.data.map((criterion) => (
                                    <tr key={criterion.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHonorTypeColor(criterion.honor_type)}`}>
                                                {criterion.honor_type.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {criterion.minimum_grade} - {criterion.maximum_grade || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {criterion.criteria_description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {academicLevels.find(level => level.id === criterion.academic_level_id)?.name || 'All Levels'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                criterion.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {criterion.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(criterion)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(criterion)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Honors Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Recent Student Honors</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Honor Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        GPA
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Awarded Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentHonors.map((honor) => (
                                    <tr key={honor.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{honor.student.name}</div>
                                                <div className="text-sm text-gray-500">{honor.student.student_profile?.student_id}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHonorTypeColor(honor.honor_type)}`}>
                                                {honor.honor_type.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {Number.isFinite(Number(honor.gpa)) ? Number(honor.gpa).toFixed(2) : '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(honor.awarded_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApprovalStatusColor(honor.is_approved)}`}>
                                                {honor.is_approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create/Edit Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingCriterion ? 'Edit Honor Criterion' : 'Add Honor Criterion'}
                                </h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Honor Type
                                        </label>
                                        <select
                                            value={data.honor_type}
                                            onChange={(e) => setData('honor_type', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select honor type</option>
                                            <option value="honor_roll">Honor Roll</option>
                                            <option value="dean_list">Dean's List</option>
                                            <option value="president_list">President's List</option>
                                            <option value="academic_excellence">Academic Excellence</option>
                                        </select>
                                        {errors.honor_type && (
                                            <p className="mt-1 text-sm text-red-600">{errors.honor_type}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Grade
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={data.minimum_grade}
                                            onChange={(e) => setData('minimum_grade', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.minimum_grade && (
                                            <p className="mt-1 text-sm text-red-600">{errors.minimum_grade}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Maximum Grade (Optional)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={data.maximum_grade}
                                            onChange={(e) => setData('maximum_grade', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        {errors.maximum_grade && (
                                            <p className="mt-1 text-sm text-red-600">{errors.maximum_grade}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={data.criteria_description}
                                            onChange={(e) => setData('criteria_description', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.criteria_description && (
                                            <p className="mt-1 text-sm text-red-600">{errors.criteria_description}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Academic Level (Optional)
                                        </label>
                                        <select
                                            value={data.academic_level_id}
                                            onChange={(e) => setData('academic_level_id', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">All Levels</option>
                                            {academicLevels.map((level) => (
                                                <option key={level.id} value={level.id}>
                                                    {level.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.academic_level_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.academic_level_id}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Active</span>
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : (editingCriterion ? 'Update' : 'Create')}
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
                                <p className="text-gray-600 mb-4">
                                    Are you sure you want to delete the honor criterion "{showDeleteModal.honor_type.replace('_', ' ').toUpperCase()}"?
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowDeleteModal(null)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        Delete
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

export default HonorsIndex; 