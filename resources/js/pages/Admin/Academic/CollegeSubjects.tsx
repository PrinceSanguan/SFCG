import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

interface CollegeCourse {
    id: number;
    name: string;
    code: string;
    degree_type: string;
    department: string;
}

interface CollegeSubject {
    id: number;
    name: string;
    code: string;
    description: string;
    units: number;
    year_level: number;
    semester: string;
    is_active: boolean;
    college_course: CollegeCourse;
}

interface Props {
    subjects: CollegeSubject[];
    collegeCourses: CollegeCourse[];
}

const CollegeSubjects: React.FC<Props> = ({ subjects, collegeCourses }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState<CollegeSubject | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<CollegeSubject | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
        units: 3,
        college_course_id: '',
        year_level: 1,
        semester: '1st',
        is_active: true as boolean,
    });

    const handleCreate = () => {
        setShowCreateModal(true);
        setEditingSubject(null);
        reset();
    };

    const handleEdit = (subject: CollegeSubject) => {
        setEditingSubject(subject);
        setData({
            name: subject.name,
            code: subject.code,
            description: subject.description || '',
            units: subject.units,
            college_course_id: subject.college_course.id.toString(),
            year_level: subject.year_level,
            semester: subject.semester,
            is_active: subject.is_active,
        });
        setShowCreateModal(true);
    };

    const handleDelete = (subject: CollegeSubject) => {
        setShowDeleteModal(subject);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingSubject) {
            put(`/admin/academic/college-subjects/${editingSubject.id}`, {
                onSuccess: () => {
                    setShowCreateModal(false);
                    setEditingSubject(null);
                    reset();
                },
            });
        } else {
            post('/admin/academic/college-subjects', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                },
            });
        }
    };

    const confirmDelete = () => {
        if (showDeleteModal) {
            router.delete(`/admin/academic/college-subjects/${showDeleteModal.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(null);
                },
            });
        }
    };

    const getYearLevelName = (yearLevel: number) => {
        switch (yearLevel) {
            case 1: return '1st Year';
            case 2: return '2nd Year';
            case 3: return '3rd Year';
            case 4: return '4th Year';
            case 5: return '5th Year';
            case 6: return '6th Year';
            default: return `${yearLevel}th Year`;
        }
    };

    const getSemesterName = (semester: string) => {
        switch (semester) {
            case '1st': return '1st Semester';
            case '2nd': return '2nd Semester';
            case 'summer': return 'Summer Term';
            default: return semester;
        }
    };

    return (
        <>
            <Head title="Higher Education Subjects" />
            <AdminLayout>
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Higher Education Subjects</h1>
                                    <p className="text-gray-600 mt-2">Manage higher education subjects and their program assignments</p>
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    + Add College Subject
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                            <span className="text-blue-600 text-sm font-medium">📚</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Subjects</p>
                                        <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                            <span className="text-green-600 text-sm font-medium">✅</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Active Subjects</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {subjects.filter(s => s.is_active).length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                                            <span className="text-purple-600 text-sm font-medium">🎓</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Course Programs</p>
                                        <p className="text-2xl font-bold text-gray-900">{collegeCourses.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                                            <span className="text-orange-600 text-sm font-medium">📊</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Units</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {subjects.reduce((sum, subject) => sum + subject.units, 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subjects Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Higher Education Subjects</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Subject
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Course
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Year & Semester
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Units
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {subjects.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                                    No higher education subjects found. Create your first subject to get started.
                                                </td>
                                            </tr>
                                        ) : (
                                            subjects.map((subject) => (
                                                <tr key={subject.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {subject.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {subject.code}
                                                            </div>
                                                            {subject.description && (
                                                                <div className="text-xs text-gray-400 mt-1">
                                                                    {subject.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {subject.college_course.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {subject.college_course.code}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {getYearLevelName(subject.year_level)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {getSemesterName(subject.semester)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {subject.units} unit{subject.units !== 1 ? 's' : ''}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            subject.is_active
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {subject.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleEdit(subject)}
                                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(subject)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                                    </div>
                    </div>
                </AdminLayout>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateModal(false)}></div>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingSubject ? 'Edit Higher Education Subject' : 'Add Higher Education Subject'}
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.code && (
                                        <p className="text-red-600 text-sm mt-1">{errors.code}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    {errors.description && (
                                        <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        College Course *
                                    </label>
                                    <select
                                        value={data.college_course_id}
                                        onChange={(e) => setData('college_course_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select College Course</option>
                                        {collegeCourses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.name} ({course.code})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.college_course_id && (
                                        <p className="text-red-600 text-sm mt-1">{errors.college_course_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Units *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={data.units}
                                        onChange={(e) => setData('units', parseInt(e.target.value))}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.units && (
                                        <p className="text-red-600 text-sm mt-1">{errors.units}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Year Level *
                                    </label>
                                    <select
                                        value={data.year_level}
                                        onChange={(e) => setData('year_level', parseInt(e.target.value))}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value={1}>1st Year</option>
                                        <option value={2}>2nd Year</option>
                                        <option value={3}>3rd Year</option>
                                        <option value={4}>4th Year</option>
                                        <option value={5}>5th Year</option>
                                        <option value={6}>6th Year</option>
                                    </select>
                                    {errors.year_level && (
                                        <p className="text-red-600 text-sm mt-1">{errors.year_level}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Semester *
                                    </label>
                                    <select
                                        value={data.semester}
                                        onChange={(e) => setData('semester', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="1st">1st Semester</option>
                                        <option value="2nd">2nd Semester</option>
                                        <option value="summer">Summer Term</option>
                                    </select>
                                    {errors.semester && (
                                        <p className="text-red-600 text-sm mt-1">{errors.semester}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'Saving...' : (editingSubject ? 'Update Subject' : 'Create Subject')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteModal(null)}></div>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96 z-10">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                    <span className="text-red-600 text-lg">⚠️</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900">Delete Higher Education Subject</h3>
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete "{showDeleteModal.name}"? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CollegeSubjects; 