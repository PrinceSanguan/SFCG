import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import TeacherLayout from '../TeacherLayout';

interface Grade {
    id: number;
    student: {
        id: number;
        name: string;
        email: string;
    };
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
    '1st_grading': number | null;
    '2nd_grading': number | null;
    '3rd_grading': number | null;
    '4th_grading': number | null;
    '1st_semester_midterm': number | null;
    '1st_semester_pre_final': number | null;
    '2nd_semester_midterm': number | null;
    '2nd_semester_pre_final': number | null;
    overall_grade: number | null;
    status: string;
    remarks: string | null;
}

interface Props {
    teacher: {
        id: number;
        name: string;
        role_display: string;
    };
    grade: Grade;
}

const TeacherGradesEdit: React.FC<Props> = ({ teacher, grade }) => {
    // Safely handle potentially undefined grade properties
    const { data, setData, put, processing, errors } = useForm({
        first_grading: grade?.['1st_grading']?.toString() || '',
        second_grading: grade?.['2nd_grading']?.toString() || '',
        third_grading: grade?.['3rd_grading']?.toString() || '',
        fourth_grading: grade?.['4th_grading']?.toString() || '',
        first_semester_midterm: grade?.['1st_semester_midterm']?.toString() || '',
        first_semester_pre_final: grade?.['1st_semester_pre_final']?.toString() || '',
        second_semester_midterm: grade?.['2nd_semester_midterm']?.toString() || '',
        second_semester_pre_final: grade?.['2nd_semester_pre_final']?.toString() || '',
        overall_grade: grade?.overall_grade?.toString() || '',
        remarks: grade?.remarks || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/teacher/grades/${grade.id}`);
    };

    // Safely access grade properties
    const safeGrade = grade || {};
    const safeStudent = safeGrade.student || {};
    const safeSubject = safeGrade.subject || {};
    const safeAcademicPeriod = safeGrade.academic_period || {};

    return (
        <>
            <Head title="Edit Grade - Teacher" />
            <TeacherLayout>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Edit Grade</h1>
                                <p className="text-gray-600 mt-2">Update grade information for {safeStudent.name || 'Student'}.</p>
                            </div>
                            <Link
                                href="/teacher/grades"
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                ← Back to Grades
                            </Link>
                        </div>
                    </div>

                    {/* Student Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Student Information</h2>
                        </div>
                        <div className="p-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{safeStudent.name || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{safeStudent.email || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Subject</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{safeSubject.name || 'N/A'} ({safeSubject.code || 'N/A'})</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Section</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{safeGrade.section || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Academic Period</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{safeAcademicPeriod.name || 'N/A'} ({safeAcademicPeriod.school_year || 'N/A'})</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                                    <dd className="mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            safeGrade.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                            safeGrade.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                                            safeGrade.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {safeGrade.status ? (safeGrade.status.charAt(0).toUpperCase() + safeGrade.status.slice(1)) : 'N/A'}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Grade Form */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Grade Information</h2>
                            <p className="text-sm text-gray-600 mt-1">Enter grades between 0 and 100. Leave blank if not applicable.</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                        {processing ? 'Updating...' : 'Update Grade'}
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

export default TeacherGradesEdit; 