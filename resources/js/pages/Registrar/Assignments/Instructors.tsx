import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import RegistrarLayout from '@/pages/Registrar/RegistrarLayout';

interface InstructorAssignment {
    id: number;
    instructor?: {
        id: number;
        name: string;
        email: string;
    };
    subject?: {
        id: number;
        name: string;
        code: string;
        units: number;
        academicLevel?: {
            name: string;
        };
        academicStrand?: {
            name: string;
        };
        collegeCourse?: {
            name: string;
        };
    };
    academicPeriod?: {
        id: number;
        name: string;
    };
    section?: string;
    created_at: string;
}

interface Instructor {
    id: number;
    name: string;
    email: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    units: number;
    academicLevel?: {
        name: string;
    };
    academicStrand?: {
        name: string;
    };
    collegeCourse?: {
        name: string;
    };
}

interface AcademicPeriod {
    id: number;
    name: string;
}

interface Props {
    assignments: InstructorAssignment[];
    instructors: Instructor[];
    subjects: Subject[];
    periods: AcademicPeriod[];
}

const InstructorAssignments: React.FC<Props> = ({ assignments = [], instructors = [], subjects = [], periods = [] }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<InstructorAssignment | null>(null);
    const [filterInstructor, setFilterInstructor] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterPeriod, setFilterPeriod] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        instructor_id: '',
        subject_id: '',
        academic_period_id: '',
        section: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingAssignment) {
            put(`/registrar/assignments/instructors/${editingAssignment.id}`, {
                onSuccess: () => {
                    setEditingAssignment(null);
                    setShowCreateModal(false);
                    reset();
                }
            });
        } else {
            post('/registrar/assignments/instructors', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (assignment: InstructorAssignment) => {
        setData('instructor_id', assignment.instructor?.id?.toString() || '');
        setData('subject_id', assignment.subject?.id?.toString() || '');
        setData('academic_period_id', assignment.academicPeriod?.id?.toString() || '');
        setData('section', assignment.section || '');
        setEditingAssignment(assignment);
    };

    const handleDelete = (assignment: InstructorAssignment) => {
        if (confirm(`Are you sure you want to delete this assignment? This action cannot be undone.`)) {
            router.delete(`/registrar/assignments/instructors/${assignment.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingAssignment(null);
        reset();
    };

    const getSubjectDisplay = (subject: Subject) => {
        if (subject.collegeCourse) {
            return `${subject.name} (${subject.code}) - ${subject.collegeCourse.name}`;
        } else if (subject.academicStrand) {
            return `${subject.name} (${subject.code}) - ${subject.academicLevel?.name} - ${subject.academicStrand.name}`;
        } else {
            return `${subject.name} (${subject.code}) - ${subject.academicLevel?.name}`;
        }
    };

    const filteredAssignments = assignments.filter(assignment => {
        const instructorMatch = !filterInstructor || 
            assignment.instructor?.name.toLowerCase().includes(filterInstructor.toLowerCase());
        const subjectMatch = !filterSubject || 
            assignment.subject?.name.toLowerCase().includes(filterSubject.toLowerCase());
        const periodMatch = !filterPeriod || 
            assignment.academicPeriod?.name.toLowerCase().includes(filterPeriod.toLowerCase());
        
        return instructorMatch && subjectMatch && periodMatch;
    });

    return (
        <RegistrarLayout>
            <Head title="Instructor Assignments - Registrar" />
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Instructor Assignments</h1>
                                <p className="text-gray-600 mt-2">Manage instructor-subject assignments</p>
                            </div>

                            {/* Create Button */}
                            <div className="mb-6">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <span className="mr-2">➕</span>
                                    Add Assignment
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Filter by Instructor
                                        </label>
                                        <input
                                            type="text"
                                            value={filterInstructor}
                                            onChange={(e) => setFilterInstructor(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Search instructor..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Filter by Subject
                                        </label>
                                        <input
                                            type="text"
                                            value={filterSubject}
                                            onChange={(e) => setFilterSubject(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Search subject..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Filter by Period
                                        </label>
                                        <input
                                            type="text"
                                            value={filterPeriod}
                                            onChange={(e) => setFilterPeriod(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Search period..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Assignments List */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Instructor Assignments ({filteredAssignments.length})
                                    </h3>
                                </div>
                                
                                {filteredAssignments.length === 0 ? (
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
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Period</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredAssignments?.map((assignment) => (
                                                    <tr key={assignment.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {assignment.instructor?.name || 'N/A'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {assignment.instructor?.email || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-900">
                                                                {assignment.subject ? getSubjectDisplay(assignment.subject) : 'N/A'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {assignment.subject?.units || 0} units
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {assignment.academicPeriod?.name || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {assignment.section || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(assignment.created_at).toLocaleDateString()}
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
                                                        {instructors?.map((instructor) => (
                                                            <option key={instructor.id} value={instructor.id}>
                                                                {instructor.name} ({instructor.email})
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
                                                        {subjects?.map((subject) => (
                                                            <option key={subject.id} value={subject.id}>
                                                                {getSubjectDisplay(subject)}
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
                                                        <option value="">Select Academic Period</option>
                                                        {periods?.map((period) => (
                                                            <option key={period.id} value={period.id}>
                                                                {period.name}
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
                                                        placeholder="e.g., Section A"
                                                    />
                                                    {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
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
                                                        {processing ? 'Saving...' : (editingAssignment ? 'Update' : 'Create')}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </RegistrarLayout>
    );
};

export default InstructorAssignments; 