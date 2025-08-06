import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import TeacherLayout from '../TeacherLayout';

interface Student {
    id: number;
    name: string;
    email: string;
    student_profile?: {
        student_id: string;
        section: string;
    };
}

interface Assignment {
    id: number;
    subject: {
        id: number;
        name: string;
        code: string;
    };
    academic_period: {
        id: number;
        name: string;
        school_year: string;
    };
    section: string;
}

interface Props {
    teacher: {
        id: number;
        name: string;
        role_display: string;
    };
    assignments: Assignment[];
}

const TeacherGradesCreate: React.FC<Props> = ({ teacher, assignments = [] }) => {
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        student_id: '',
        subject_id: '',
        academic_period_id: '',
        section: '',
        first_grading: '',
        second_grading: '',
        third_grading: '',
        fourth_grading: '',
        first_semester_midterm: '',
        first_semester_pre_final: '',
        second_semester_midterm: '',
        second_semester_pre_final: '',
        overall_grade: '',
        remarks: '',
    });

    // Load students when assignment changes
    useEffect(() => {
        if (selectedAssignment) {
            setLoadingStudents(true);
            fetch(`/teacher/api/students-for-subject?subject_id=${selectedAssignment.subject.id}&academic_period_id=${selectedAssignment.academic_period.id}&section=${selectedAssignment.section}`)
                .then(response => response.json())
                .then(data => {
                    setStudents(data.students || []);
                    setLoadingStudents(false);
                })
                .catch(error => {
                    console.error('Error loading students:', error);
                    setLoadingStudents(false);
                });
        } else {
            setStudents([]);
        }
    }, [selectedAssignment]);

    const handleAssignmentChange = (assignmentId: string) => {
        const assignment = assignments.find(a => a.id.toString() === assignmentId);
        setSelectedAssignment(assignment || null);
        
        if (assignment) {
            setData({
                ...data,
                subject_id: assignment.subject.id.toString(),
                academic_period_id: assignment.academic_period.id.toString(),
                section: assignment.section,
            });
        } else {
            setData({
                ...data,
                subject_id: '',
                academic_period_id: '',
                section: '',
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/teacher/grades', {
            onSuccess: () => {
                reset();
                setSelectedAssignment(null);
                setStudents([]);
            },
        });
    };

    const validateGrade = (value: string) => {
        const num = parseFloat(value);
        return value === '' || (num >= 0 && num <= 100);
    };

    return (
        <>
            <Head title="Create Grade - Teacher" />
            <TeacherLayout>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Create New Grade</h1>
                                <p className="text-gray-600 mt-2">Add a new grade entry for a student.</p>
                            </div>
                            <Link
                                href="/teacher/grades"
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                ← Back to Grades
                            </Link>
                        </div>
                    </div>

                    {/* Grade Form */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Grade Information</h2>
                            <p className="text-sm text-gray-600 mt-1">Select the subject assignment and student, then enter the grades.</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Subject Assignment Selection */}
                                <div>
                                    <label htmlFor="assignment" className="block text-sm font-medium text-gray-700">
                                        Subject Assignment *
                                    </label>
                                    <select
                                        id="assignment"
                                        value={selectedAssignment?.id || ''}
                                        onChange={(e) => handleAssignmentChange(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select a subject assignment</option>
                                        {assignments && assignments.length > 0 ? (
                                            assignments.map((assignment) => (
                                                <option key={assignment.id} value={assignment.id}>
                                                    {assignment.subject.name} ({assignment.subject.code}) - {assignment.section} - {assignment.academic_period.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No assignments available</option>
                                        )}
                                    </select>
                                    {errors.subject_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
                                    )}
                                </div>

                                {/* Student Selection */}
                                <div>
                                    <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                                        Student *
                                    </label>
                                    <select
                                        id="student_id"
                                        value={data.student_id}
                                        onChange={(e) => setData('student_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required
                                        disabled={!selectedAssignment || loadingStudents}
                                    >
                                        <option value="">
                                            {loadingStudents ? 'Loading students...' : 'Select a student'}
                                        </option>
                                        {students.map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.name} ({student.email})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-sm text-blue-600">
                                        💡 Only Junior High School students are displayed for this subject.
                                    </p>
                                    {errors.student_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
                                    )}
                                </div>

                                {/* Quarterly Grades */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 mb-4">Quarterly Grades</h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                                        <div>
                                            <label htmlFor="first_grading" className="block text-sm font-medium text-gray-700">
                                                1st Grading
                                            </label>
                                            <input
                                                type="number"
                                                id="first_grading"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.first_grading}
                                                onChange={(e) => setData('first_grading', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.first_grading && (
                                                <p className="mt-1 text-sm text-red-600">{errors.first_grading}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="second_grading" className="block text-sm font-medium text-gray-700">
                                                2nd Grading
                                            </label>
                                            <input
                                                type="number"
                                                id="second_grading"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.second_grading}
                                                onChange={(e) => setData('second_grading', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.second_grading && (
                                                <p className="mt-1 text-sm text-red-600">{errors.second_grading}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="third_grading" className="block text-sm font-medium text-gray-700">
                                                3rd Grading
                                            </label>
                                            <input
                                                type="number"
                                                id="third_grading"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.third_grading}
                                                onChange={(e) => setData('third_grading', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.third_grading && (
                                                <p className="mt-1 text-sm text-red-600">{errors.third_grading}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="fourth_grading" className="block text-sm font-medium text-gray-700">
                                                4th Grading
                                            </label>
                                            <input
                                                type="number"
                                                id="fourth_grading"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.fourth_grading}
                                                onChange={(e) => setData('fourth_grading', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.fourth_grading && (
                                                <p className="mt-1 text-sm text-red-600">{errors.fourth_grading}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Semester Grades */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 mb-4">Semester Grades</h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                                        <div>
                                            <label htmlFor="first_semester_midterm" className="block text-sm font-medium text-gray-700">
                                                1st Sem Midterm
                                            </label>
                                            <input
                                                type="number"
                                                id="first_semester_midterm"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.first_semester_midterm}
                                                onChange={(e) => setData('first_semester_midterm', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.first_semester_midterm && (
                                                <p className="mt-1 text-sm text-red-600">{errors.first_semester_midterm}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="first_semester_pre_final" className="block text-sm font-medium text-gray-700">
                                                1st Sem Pre-Final
                                            </label>
                                            <input
                                                type="number"
                                                id="first_semester_pre_final"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.first_semester_pre_final}
                                                onChange={(e) => setData('first_semester_pre_final', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.first_semester_pre_final && (
                                                <p className="mt-1 text-sm text-red-600">{errors.first_semester_pre_final}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="second_semester_midterm" className="block text-sm font-medium text-gray-700">
                                                2nd Sem Midterm
                                            </label>
                                            <input
                                                type="number"
                                                id="second_semester_midterm"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.second_semester_midterm}
                                                onChange={(e) => setData('second_semester_midterm', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.second_semester_midterm && (
                                                <p className="mt-1 text-sm text-red-600">{errors.second_semester_midterm}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="second_semester_pre_final" className="block text-sm font-medium text-gray-700">
                                                2nd Sem Pre-Final
                                            </label>
                                            <input
                                                type="number"
                                                id="second_semester_pre_final"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.second_semester_pre_final}
                                                onChange={(e) => setData('second_semester_pre_final', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.second_semester_pre_final && (
                                                <p className="mt-1 text-sm text-red-600">{errors.second_semester_pre_final}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Overall Grade */}
                                <div>
                                    <label htmlFor="overall_grade" className="block text-sm font-medium text-gray-700">
                                        Overall Grade
                                    </label>
                                    <input
                                        type="number"
                                        id="overall_grade"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={data.overall_grade}
                                        onChange={(e) => setData('overall_grade', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="0.00"
                                    />
                                    {errors.overall_grade && (
                                        <p className="mt-1 text-sm text-red-600">{errors.overall_grade}</p>
                                    )}
                                </div>

                                {/* Remarks */}
                                <div>
                                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                                        Remarks
                                    </label>
                                    <textarea
                                        id="remarks"
                                        rows={3}
                                        value={data.remarks}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Additional comments or remarks..."
                                    />
                                    {errors.remarks && (
                                        <p className="mt-1 text-sm text-red-600">{errors.remarks}</p>
                                    )}
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href="/teacher/grades"
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Grade'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </TeacherLayout>
        </>
    );
};

export default TeacherGradesCreate; 