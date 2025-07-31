import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

interface HonorCriterion {
    id: number;
    honor_type: string;
    minimum_grade: number;
    maximum_grade?: number;
    criteria_description: string;
    academic_level_id?: number;
    is_active: boolean;
}

interface RecentHonor {
    id: number;
    student: {
        name: string;
        studentProfile: {
            student_id: string;
            grade_level: string;
        };
    };
    honorCriterion: {
        honor_type: string;
    };
    gpa: number;
    awarded_date: string;
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
    };
    academicPeriods: AcademicPeriod[];
    academicLevels: AcademicLevel[];
}

const HonorsIndex: React.FC<Props> = ({ honorCriteria, recentHonors, stats, academicPeriods, academicLevels }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCriterion, setEditingCriterion] = useState<HonorCriterion | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState('');

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
            put(`/admin/honors/criteria/${editingCriterion.id}`, {
                onSuccess: () => {
                    setEditingCriterion(null);
                    setShowCreateModal(false);
                    reset();
                }
            });
        } else {
            post('/admin/honors/criteria', {
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

    const handleCalculateHonors = () => {
        if (!selectedPeriod) {
            alert('Please select an academic period');
            return;
        }

        router.post('/admin/honors/calculate', { academic_period_id: selectedPeriod });
    };

    const handleDelete = (criterion: HonorCriterion) => {
        if (confirm(`Are you sure you want to delete the "${criterion.honor_type}" criteria?`)) {
            router.delete(`/admin/honors/criteria/${criterion.id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Honors Management" />
            <div className="space-y-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Honors Management</h1>
                                    <p className="text-gray-600 mt-2">Manage honor criteria and student achievements</p>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        ➕ Add Honor Criteria
                                    </button>
                                    <Link
                                        href="/admin/honors/roll"
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        🏆 View Honor Roll
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-md">
                                            <span className="text-white text-sm">🏆</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Total Honors</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.total_honors}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-md">
                                            <span className="text-white text-sm">📈</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Average GPA</dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {stats.average_gpa ? stats.average_gpa.toFixed(2) : 'N/A'}
                                        </dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-md">
                                            <span className="text-white text-sm">⭐</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Highest GPA</dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {stats.highest_gpa ? stats.highest_gpa.toFixed(2) : 'N/A'}
                                        </dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-md">
                                            <span className="text-white text-sm">📊</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Honor Types</dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {Object.keys(stats.by_honor_type).length}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calculate Honors Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculate Student Honors</h3>
                            <div className="flex items-end space-x-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Academic Period
                                    </label>
                                    <select
                                        value={selectedPeriod}
                                        onChange={(e) => setSelectedPeriod(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select Period</option>
                                        {academicPeriods.map((period) => (
                                            <option key={period.id} value={period.id}>
                                                {period.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleCalculateHonors}
                                    disabled={!selectedPeriod || processing}
                                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    🔄 Calculate Honors
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Honor Criteria */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Honor Criteria</h3>
                                <div className="space-y-4">
                                    {honorCriteria.data.map((criterion) => (
                                        <div key={criterion.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{criterion.honor_type}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{criterion.criteria_description}</p>
                                                    <div className="flex items-center mt-2 space-x-4">
                                                        <span className="text-sm text-gray-500">
                                                            Min: {criterion.minimum_grade}%
                                                        </span>
                                                        {criterion.maximum_grade && (
                                                            <span className="text-sm text-gray-500">
                                                                Max: {criterion.maximum_grade}%
                                                            </span>
                                                        )}
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            criterion.is_active 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {criterion.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(criterion)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(criterion)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Honors */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Honors</h3>
                                    <Link
                                        href="/admin/honors/students"
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        View All →
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {recentHonors.map((honor) => (
                                        <div key={honor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-medium text-gray-900">{honor.student.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {honor.student.studentProfile.student_id} • {honor.student.studentProfile.grade_level}
                                                </div>
                                                <div className="text-sm text-blue-600">{honor.honorCriterion.honor_type}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-green-600">GPA: {honor.gpa.toFixed(2)}</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(honor.awarded_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {recentHonors.length === 0 && (
                                        <p className="text-gray-500 text-center py-4">No recent honors</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Create/Edit Modal */}
                        {showCreateModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        {editingCriterion ? 'Edit Honor Criteria' : 'Create Honor Criteria'}
                                    </h3>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Honor Type
                                            </label>
                                            <input
                                                type="text"
                                                value={data.honor_type}
                                                onChange={(e) => setData('honor_type', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="e.g., Dean's List, Magna Cum Laude"
                                                required
                                            />
                                            {errors.honor_type && (
                                                <p className="text-red-600 text-sm mt-1">{errors.honor_type}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Minimum Grade (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={data.minimum_grade}
                                                    onChange={(e) => setData('minimum_grade', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
                                                />
                                                {errors.minimum_grade && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.minimum_grade}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Maximum Grade (%) <span className="text-gray-400">(Optional)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={data.maximum_grade}
                                                    onChange={(e) => setData('maximum_grade', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                />
                                                {errors.maximum_grade && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.maximum_grade}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Academic Level <span className="text-gray-400">(Optional)</span>
                                            </label>
                                            <select
                                                value={data.academic_level_id}
                                                onChange={(e) => setData('academic_level_id', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="">All Academic Levels</option>
                                                {academicLevels.map((level) => (
                                                    <option key={level.id} value={level.id}>
                                                        {level.name} ({level.code})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.academic_level_id && (
                                                <p className="text-red-600 text-sm mt-1">{errors.academic_level_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={data.criteria_description}
                                                onChange={(e) => setData('criteria_description', e.target.value)}
                                                rows={3}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Describe the criteria for this honor..."
                                                required
                                            />
                                            {errors.criteria_description && (
                                                <p className="text-red-600 text-sm mt-1">{errors.criteria_description}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label className="ml-2 text-sm text-gray-700">Active</label>
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCreateModal(false);
                                                    setEditingCriterion(null);
                                                    reset();
                                                }}
                                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
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
                        )}
            </div>
        </AdminLayout>
    );
};

export default HonorsIndex; 