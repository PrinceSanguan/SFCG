import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

interface Teacher {
    id: number;
    name: string;
    email: string;
}

interface Subject {
    id: number;
    name: string;
    academicLevel?: {
        id: number;
        name: string;
    };
    academicStrand?: {
        id: number;
        name: string;
        code: string;
    };
    year_level?: string;
}

interface AcademicPeriod {
    id: number;
    name: string;
}

interface AcademicStrand {
    id: number;
    name: string;
    code: string;
}

interface Assignment {
    id: number;
    instructor?: Teacher;
    subject?: Subject;
    academicPeriod?: AcademicPeriod;
    section?: string;
    is_active: boolean;
    created_at: string;
    strand_id?: number;
    year_level?: string;
    college_course_id?: number;
    semester?: string;
}

interface Props {
    assignments: Assignment[];
    teachers: Teacher[];
    subjects: Subject[];
    academicPeriods: AcademicPeriod[];
    strands: AcademicStrand[];
}

const Teachers: React.FC<Props> = ({ 
    assignments = [], 
    teachers = [], 
    subjects = [], 
    academicPeriods = [],
    strands = []
}) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        teacher_id: '',
        subject_id: '',
        academic_period_id: '',
        section: '',
        strand_id: '',
        year_level: '',
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingAssignment) {
            put(`/admin/assignments/teachers/${editingAssignment.id}`, {
                onSuccess: () => {
                    setEditingAssignment(null);
                    setShowCreateModal(false);
                    reset();
                }
            });
        } else {
            post('/admin/assignments/teachers', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (assignment: Assignment) => {
        setData('teacher_id', assignment.instructor?.id?.toString() || '');
        setData('subject_id', assignment.subject?.id?.toString() || '');
        setData('academic_period_id', assignment.academicPeriod?.id?.toString() || '');
        setData('section', assignment.section || '');
        setData('is_active', assignment.is_active);
        setEditingAssignment(assignment);
        setShowCreateModal(true);
    };

    const handleDelete = (assignment: Assignment) => {
        if (confirm('Are you sure you want to remove this teacher assignment?')) {
            router.delete(`/admin/assignments/teachers/${assignment.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingAssignment(null);
        reset();
    };

    return (
        <AdminLayout>
            <Head title="Teacher Assignments" />
            
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Teacher Assignments (Senior High School)</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Assign Teacher
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Total Assignments</h3>
                        <p className="text-3xl font-bold text-blue-600">{assignments.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Active Teachers</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {assignments.filter(a => a.is_active).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Available Teachers</h3>
                        <p className="text-3xl font-bold text-yellow-600">{teachers.length}</p>
                    </div>
                </div>

                {/* Assignments Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Current Assignments</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Teacher
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Academic Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Strand & Year Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Section
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
                                {assignments.map((assignment) => (
                                    <tr key={assignment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {assignment.instructor?.name || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {assignment.instructor?.email || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {assignment.subject?.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {assignment.subject?.academicLevel?.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {assignment.subject?.academicStrand?.name || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-900">
                                                {assignment.year_level || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {assignment.academicPeriod?.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {assignment.section || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                assignment.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {assignment.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(assignment)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(assignment)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            {editingAssignment ? 'Edit Teacher Assignment' : 'Assign Teacher'}
                        </h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teacher
                                    </label>
                                    <select
                                        value={data.teacher_id}
                                        onChange={(e) => setData('teacher_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Teacher</option>
                                        {teachers.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.name} ({teacher.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.teacher_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.teacher_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject
                                    </label>
                                    <select
                                        value={data.subject_id}
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name} - {subject.academicLevel?.name || 'N/A'}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subject_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.subject_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Academic Period
                                    </label>
                                    <select
                                        value={data.academic_period_id}
                                        onChange={(e) => setData('academic_period_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Period</option>
                                        {academicPeriods.map((period) => (
                                            <option key={period.id} value={period.id}>
                                                {period.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.academic_period_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.academic_period_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Section (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.section}
                                        onChange={(e) => setData('section', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Section A"
                                    />
                                    {errors.section && (
                                        <p className="text-red-500 text-sm mt-1">{errors.section}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Strand
                                    </label>
                                    <select
                                        value={data.strand_id}
                                        onChange={(e) => setData('strand_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Strand</option>
                                        {strands.map((strand) => (
                                            <option key={strand.id} value={strand.id}>
                                                {strand.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.strand_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.strand_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Year Level
                                    </label>
                                    <select
                                        value={data.year_level}
                                        onChange={(e) => setData('year_level', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Year Level</option>
                                        <option value="Grade 11">Grade 11</option>
                                        <option value="Grade 12">Grade 12</option>
                                    </select>
                                    {errors.year_level && (
                                        <p className="text-red-500 text-sm mt-1">{errors.year_level}</p>
                                    )}
                                </div>

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
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : (editingAssignment ? 'Update' : 'Assign')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Teachers; 