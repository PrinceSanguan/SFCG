import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import ClassAdviserLayout from '../ClassAdviserLayout';

interface Student {
    id: number;
    name: string;
    email: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface AcademicPeriod {
    id: number;
    name: string;
    school_year: string;
}

interface Grade {
    id: number;
    student: Student;
    subject: Subject;
    academicPeriod: AcademicPeriod;
    section: string;
    first_grading: number | null;
    second_grading: number | null;
    third_grading: number | null;
    fourth_grading: number | null;
    first_semester_midterm: number | null;
    first_semester_pre_final: number | null;
    second_semester_midterm: number | null;
    second_semester_pre_final: number | null;
    overall_grade: number | null;
    remarks: string | null;
    status: string;
}

interface Props {
    adviser: {
        id: number;
        name: string;
        role_display: string;
    };
    grade: Grade;
    subjects: Subject[];
    academicPeriods: AcademicPeriod[];
}

const EditGrade: React.FC<Props> = ({ adviser, grade, subjects, academicPeriods }) => {
    const { data, setData, put, processing, errors, reset } = useForm({
        subject_id: grade.subject.id.toString(),
        academic_period_id: grade.academicPeriod.id.toString(),
        section: grade.section,
        first_grading: grade.first_grading?.toString() || '',
        second_grading: grade.second_grading?.toString() || '',
        third_grading: grade.third_grading?.toString() || '',
        fourth_grading: grade.fourth_grading?.toString() || '',
        first_semester_midterm: grade.first_semester_midterm?.toString() || '',
        first_semester_pre_final: grade.first_semester_pre_final?.toString() || '',
        second_semester_midterm: grade.second_semester_midterm?.toString() || '',
        second_semester_pre_final: grade.second_semester_pre_final?.toString() || '',
        overall_grade: grade.overall_grade?.toString() || '',
        remarks: grade.remarks || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/class-adviser/grades/${grade.id}`, {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <>
            <Head title="Edit Grade - Class Adviser" />
            <ClassAdviserLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Grade</h1>
                            <p className="text-gray-600 mt-2">Update grade information for {grade.student.name}</p>
                        </div>
                        <Link
                            href="/class-adviser/grades"
                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            Back to Grades
                        </Link>
                    </div>
                </div>

                {/* Grade Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Grade Information</h2>
                        <p className="text-sm text-gray-600 mt-1">Current grade details</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Student</label>
                                <p className="mt-1 text-sm text-gray-900">{grade.student.name}</p>
                                <p className="text-sm text-gray-500">{grade.student.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Subject</label>
                                <p className="mt-1 text-sm text-gray-900">{grade.subject.name} ({grade.subject.code})</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Period</label>
                                <p className="mt-1 text-sm text-gray-900">{grade.academicPeriod.name} ({grade.academicPeriod.school_year})</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Edit Grade Details</h2>
                        <p className="text-sm text-gray-600 mt-1">Update the grade information below</p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Subject and Period Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700">
                                    Subject *
                                </label>
                                <select
                                    id="subject_id"
                                    value={data.subject_id}
                                    onChange={(e) => setData('subject_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Select a subject</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name} ({subject.code})
                                        </option>
                                    ))}
                                </select>
                                {errors.subject_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="academic_period_id" className="block text-sm font-medium text-gray-700">
                                    Academic Period *
                                </label>
                                <select
                                    id="academic_period_id"
                                    value={data.academic_period_id}
                                    onChange={(e) => setData('academic_period_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Select a period</option>
                                    {academicPeriods.map((period) => (
                                        <option key={period.id} value={period.id}>
                                            {period.name} ({period.school_year})
                                        </option>
                                    ))}
                                </select>
                                {errors.academic_period_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.academic_period_id}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="section" className="block text-sm font-medium text-gray-700">
                                    Section *
                                </label>
                                <input
                                    type="text"
                                    id="section"
                                    value={data.section}
                                    onChange={(e) => setData('section', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    required
                                />
                                {errors.section && (
                                    <p className="mt-1 text-sm text-red-600">{errors.section}</p>
                                )}
                            </div>
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

                        {/* Overall Grade and Remarks */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <div>
                                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                                    Remarks
                                </label>
                                <input
                                    type="text"
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Enter remarks"
                                />
                                {errors.remarks && (
                                    <p className="mt-1 text-sm text-red-600">{errors.remarks}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-3">
                            <Link
                                href="/class-adviser/grades"
                                className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                            >
                                {processing ? 'Updating...' : 'Update Grade'}
                            </button>
                        </div>
                    </form>
                </div>
            </ClassAdviserLayout>
        </>
    );
};

export default EditGrade; 