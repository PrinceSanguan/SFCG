import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface AcademicLevel {
    id: number;
    name: string;
    code: string;
}

interface AcademicStrand {
    id: number;
    name: string;
    code: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    academic_level: AcademicLevel;
    academic_strand?: AcademicStrand;
}

interface AcademicPeriod {
    id: number;
    name: string;
    school_year: string;
}

interface InstructorAssignment {
    id: number;
    instructor: User;
    subject: Subject;
    academic_period: AcademicPeriod;
    section?: string;
    created_at: string;
}

interface Props {
    assignments: InstructorAssignment[];
    instructors: User[];
    subjects: Subject[];
    periods: AcademicPeriod[];
}

const Instructors: React.FC<Props> = ({ assignments, instructors, subjects, periods }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<InstructorAssignment | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        instructor_id: '',
        subject_id: '',
        academic_period_id: '',
        section: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingAssignment) {
            put(`/admin/assignments/instructors/${editingAssignment.id}`, {
                onSuccess: () => {
                    setEditingAssignment(null);
                    reset();
                }
            });
        } else {
            post('/admin/assignments/instructors', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (assignment: InstructorAssignment) => {
        setData('instructor_id', assignment.instructor.id.toString());
        setData('subject_id', assignment.subject.id.toString());
        setData('academic_period_id', assignment.academic_period.id.toString());
        setData('section', assignment.section || '');
        setEditingAssignment(assignment);
    };

    const handleDelete = (assignment: InstructorAssignment) => {
        if (confirm(`Are you sure you want to delete this assignment? This action cannot be undone.`)) {
            router.delete(`/admin/assignments/instructors/${assignment.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingAssignment(null);
        reset();
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Instructor Assignments</h1>
                        <p className="text-gray-600">Assign instructors to subjects for specific periods</p>
                    </div>

                    {/* Create Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <span className="mr-2">➕</span>
                            Assign Instructor
                        </button>
                    </div>

                    {/* Assignments List */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Instructor Assignments</h2>
                        </div>
                        
                        {assignments.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No instructor assignments found. Create your first assignment to get started.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level/Strand</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {assignments.map((assignment) => (
                                            <tr key={assignment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{assignment.instructor.name}</div>
                                                    <div className="text-sm text-gray-500">{assignment.instructor.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{assignment.subject.name}</div>
                                                    <div className="text-sm text-gray-500">{assignment.subject.code}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{assignment.subject.academic_level.name}</div>
                                                    {assignment.subject.academic_strand && (
                                                        <div className="text-sm text-gray-500">{assignment.subject.academic_strand.name}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{assignment.academic_period.name}</div>
                                                    <div className="text-sm text-gray-500">{assignment.academic_period.school_year}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{assignment.section || 'All Sections'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(assignment)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(assignment)}
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
                    {(showCreateModal || editingAssignment) && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
                                    </h3>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Instructor
                                            </label>
                                            <select
                                                value={data.instructor_id}
                                                onChange={(e) => setData('instructor_id', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Instructor</option>
                                                {instructors.map((instructor) => (
                                                    <option key={instructor.id} value={instructor.id}>
                                                        {instructor.name} ({instructor.user_role})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.instructor_id && <p className="text-red-500 text-xs mt-1">{errors.instructor_id}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subject
                                            </label>
                                            <select
                                                value={data.subject_id}
                                                onChange={(e) => setData('subject_id', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map((subject) => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.name} ({subject.code}) - {subject.academic_level.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.subject_id && <p className="text-red-500 text-xs mt-1">{errors.subject_id}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Academic Period
                                            </label>
                                            <select
                                                value={data.academic_period_id}
                                                onChange={(e) => setData('academic_period_id', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Period</option>
                                                {periods.map((period) => (
                                                    <option key={period.id} value={period.id}>
                                                        {period.name} ({period.school_year})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.academic_period_id && <p className="text-red-500 text-xs mt-1">{errors.academic_period_id}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Section (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.section}
                                                onChange={(e) => setData('section', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., A, B, 1, 2"
                                                maxLength={50}
                                            />
                                            {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
                                            <p className="text-xs text-gray-500 mt-1">Leave empty if instructor handles all sections</p>
                                        </div>

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
                                                {processing ? 'Saving...' : (editingAssignment ? 'Update' : 'Assign')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Instructors; 