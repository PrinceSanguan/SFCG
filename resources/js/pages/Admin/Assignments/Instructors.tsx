import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';

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
            id: number;
            name: string;
            code: string;
        };
        year_level?: string;
        semester?: string;
    };
    academicPeriod?: {
        id: number;
        name: string;
    };
    section?: string;
    created_at: string;
    strand_id?: number;
    year_level?: string;
    college_course_id?: number;
    semester?: string;
    collegeCourse?: {
        id: number;
        name: string;
        code: string;
    };
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
        id: number;
        name: string;
        code: string;
    };
    year_level?: string;
    semester?: string;
}

interface AcademicPeriod {
    id: number;
    name: string;
}

interface CollegeCourse {
    id: number;
    name: string;
    code: string;
}

interface Props {
    assignments: InstructorAssignment[];
    instructors: Instructor[];
    subjects: Subject[];
    periods: AcademicPeriod[];
    collegeCourses: CollegeCourse[];
}

const InstructorAssignments: React.FC<Props> = ({ assignments, instructors, subjects, periods, collegeCourses }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<InstructorAssignment | null>(null);
    const [sectionOptions, setSectionOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [loadingSections, setLoadingSections] = useState(false);
    const [filterInstructor, setFilterInstructor] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterPeriod, setFilterPeriod] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        instructor_id: '',
        subject_id: '',
        academic_period_id: '',
        college_course_id: '',
        year_level: '',
        section: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingAssignment) {
            put(`/admin/assignments/instructors/${editingAssignment.id}`, {
                onSuccess: () => {
                    setEditingAssignment(null);
                    setShowCreateModal(false);
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
        setData({
            instructor_id: assignment.instructor?.id?.toString() || '',
            subject_id: assignment.subject?.id?.toString() || '',
            academic_period_id: assignment.academicPeriod?.id?.toString() || '',
            college_course_id: assignment.college_course_id?.toString() || '',
            year_level: assignment.year_level || '',
            section: assignment.section || '',
        });
        setEditingAssignment(assignment);
        setShowCreateModal(true);
    };

    const handleDelete = (assignment: InstructorAssignment) => {
        if (confirm(`Are you sure you want to delete this assignment for ${assignment.instructor?.name || 'Unknown Instructor'}?`)) {
            router.delete(`/admin/assignments/instructors/${assignment.id}`);
        }
    };

    const filteredAssignments = assignments.filter(assignment => {
        const instructorMatch = !filterInstructor || assignment.instructor?.id?.toString() === filterInstructor;
        const subjectMatch = !filterSubject || assignment.subject?.id?.toString() === filterSubject;
        const periodMatch = !filterPeriod || assignment.academicPeriod?.id?.toString() === filterPeriod;
        
        return instructorMatch && subjectMatch && periodMatch;
    });

    const getSubjectDisplay = (subject: Subject) => {
        if (subject.collegeCourse) {
            return `${subject.name} (${subject.collegeCourse.name})`;
        } else if (subject.academicLevel) {
            const strand = subject.academicStrand ? ` - ${subject.academicStrand.name}` : '';
            return `${subject.name} (${subject.academicLevel.name}${strand})`;
        }
        return subject.name;
    };

    // Load sections for college based on selected course and year level
    useEffect(() => {
        if (!data.college_course_id || !data.year_level) {
            setSectionOptions([]);
            return;
        }
        setLoadingSections(true);
        const params = new URLSearchParams({ level: 'COL', year: String(data.year_level), course_id: String(data.college_course_id) });
        fetch(`/admin/api/sections-by-level-year?${params.toString()}`)
            .then(res => res.json())
            .then(json => setSectionOptions((json?.sections || []).map((s: any) => ({ value: s.value, label: s.label }))))
            .catch(() => setSectionOptions([]))
            .finally(() => setLoadingSections(false));
    }, [data.college_course_id, data.year_level]);

    return (
        <>
            <Head title="Instructor Assignments" />
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Instructor Assignments</h1>
                                    <p className="text-gray-600 mt-2">Assign instructors to subjects and classes</p>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    ➕ Create Assignment
                                </button>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-md">
                                            <span className="text-white text-sm">📚</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Total Assignments</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{assignments.length}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-md">
                                            <span className="text-white text-sm">👨‍🏫</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Active Instructors</dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {new Set(assignments.map(a => a.instructor?.id).filter(Boolean)).size}
                                        </dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-md">
                                            <span className="text-white text-sm">📖</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Assigned Subjects</dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {new Set(assignments.map(a => a.subject?.id).filter(Boolean)).size}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instructor
                                    </label>
                                    <select
                                        value={filterInstructor}
                                        onChange={(e) => setFilterInstructor(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Instructors</option>
                                        {instructors.map((instructor) => (
                                            <option key={instructor.id} value={instructor.id}>
                                                {instructor.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <select
                                        value={filterSubject}
                                        onChange={(e) => setFilterSubject(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Subjects</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name} ({subject.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Academic Period
                                    </label>
                                    <select
                                        value={filterPeriod}
                                        onChange={(e) => setFilterPeriod(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Periods</option>
                                        {periods.map((period) => (
                                            <option key={period.id} value={period.id}>
                                                {period.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Assignments Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Instructor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Academic Period
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Section
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            College Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAssignments.map((assignment) => (
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
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {assignment.subject?.name || 'N/A'}
                                                 </div>
                                                    <div className="text-sm text-gray-500">
                                                        {assignment.subject?.code || 'N/A'} • {assignment.subject?.units || 0} units
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {assignment.subject ? getSubjectDisplay(assignment.subject) : 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {assignment.academicPeriod?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {assignment.section || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {assignment.collegeCourse ? (
                                                    <div>
                                                        <div className="font-medium">{assignment.collegeCourse.name}</div>
                                                        <div className="text-gray-500">{assignment.collegeCourse.code}</div>
                                                        {assignment.year_level && (
                                                            <div className="text-xs text-gray-400">
                                                                {assignment.year_level}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(assignment)}
                                                        className="text-blue-600 hover:text-blue-900"
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

                            {filteredAssignments.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-gray-500 text-lg">No assignments found</div>
                                    <p className="text-gray-400 mt-2">Create an assignment to get started</p>
                                </div>
                            )}
                        </div>

                        {/* Create/Edit Modal */}
                        {showCreateModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Instructor</option>
                                                {instructors.map((instructor) => (
                                                    <option key={instructor.id} value={instructor.id}>
                                                        {instructor.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.instructor_id && (
                                                <p className="text-red-600 text-sm mt-1">{errors.instructor_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subject
                                            </label>
                                            <select
                                                value={data.subject_id}
                                                onChange={(e) => setData('subject_id', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map((subject) => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.name} ({subject.code})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.subject_id && (
                                                <p className="text-red-600 text-sm mt-1">{errors.subject_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Academic Period
                                            </label>
                                            <select
                                                value={data.academic_period_id}
                                                onChange={(e) => setData('academic_period_id', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Period</option>
                                                {periods.map((period) => (
                                                    <option key={period.id} value={period.id}>
                                                        {period.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.academic_period_id && (
                                                <p className="text-red-600 text-sm mt-1">{errors.academic_period_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                College Course
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
                                                Year Level
                                            </label>
                                            <select
                                                value={data.year_level}
                                                onChange={(e) => setData('year_level', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Year Level</option>
                                                <option value="1st Year">1st Year</option>
                                                <option value="2nd Year">2nd Year</option>
                                                <option value="3rd Year">3rd Year</option>
                                                <option value="4th Year">4th Year</option>
                                            </select>
                                            {errors.year_level && (
                                                <p className="text-red-600 text-sm mt-1">{errors.year_level}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Section
                                            </label>
                                            <select
                                                value={data.section}
                                                onChange={(e) => setData('section', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                                disabled={loadingSections || !sectionOptions.length}
                                            >
                                                <option value="">{loadingSections ? 'Loading sections...' : 'Select Section'}</option>
                                                {sectionOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            {errors.section && (
                                                <p className="text-red-600 text-sm mt-1">{errors.section}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCreateModal(false);
                                                    setEditingAssignment(null);
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
                                                {processing ? 'Saving...' : (editingAssignment ? 'Update' : 'Create')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};

export default InstructorAssignments; 