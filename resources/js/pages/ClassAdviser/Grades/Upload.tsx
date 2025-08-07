import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import ClassAdviserLayout from '../ClassAdviserLayout';

interface Student {
    id: number;
    name: string;
    email: string;
    studentProfile: {
        student_id: string;
        academicLevel: {
            name: string;
        };
        year_level: string;
        section: string;
    };
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

interface Props {
    adviser: {
        id: number;
        name: string;
        role_display: string;
    };
    assignedStudents: Student[];
    subjects: Subject[];
    academicPeriods: AcademicPeriod[];
}

const UploadGrades: React.FC<Props> = ({ adviser, assignedStudents, subjects, academicPeriods }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        csv_file: null as File | null,
        academic_period_id: '',
        section: '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('csv_file', e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/class-adviser/grades/upload', {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <>
            <Head title="Upload Grades - Class Adviser" />
            <ClassAdviserLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Upload Grades via CSV</h1>
                            <p className="text-gray-600 mt-2">Upload multiple grades using a CSV file</p>
                        </div>
                        <Link
                            href="/class-adviser/grades"
                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            Back to Grades
                        </Link>
                    </div>
                </div>

                {/* Upload Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Upload Grades</h2>
                        <p className="text-sm text-gray-600 mt-1">Upload grades for your assigned students</p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Academic Period and Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    placeholder="e.g., A, B, C"
                                    required
                                />
                                {errors.section && (
                                    <p className="mt-1 text-sm text-red-600">{errors.section}</p>
                                )}
                            </div>
                        </div>

                        {/* CSV File Upload */}
                        <div>
                            <label htmlFor="csv_file" className="block text-sm font-medium text-gray-700">
                                CSV File *
                            </label>
                            <input
                                type="file"
                                id="csv_file"
                                accept=".csv,.txt"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                required
                            />
                            {errors.csv_file && (
                                <p className="mt-1 text-sm text-red-600">{errors.csv_file}</p>
                            )}
                        </div>

                        {/* CSV Format Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <h3 className="text-sm font-medium text-blue-900 mb-2">CSV Format Requirements</h3>
                            <div className="text-sm text-blue-800 space-y-1">
                                <p>Your CSV file should include the following columns:</p>
                                <ul className="list-disc list-inside ml-4 space-y-1">
                                    <li><strong>student_id</strong> - The student's user ID</li>
                                    <li><strong>subject_id</strong> - The subject's ID</li>
                                    <li><strong>first_grading</strong> - First grading period grade (optional)</li>
                                    <li><strong>second_grading</strong> - Second grading period grade (optional)</li>
                                    <li><strong>third_grading</strong> - Third grading period grade (optional)</li>
                                    <li><strong>fourth_grading</strong> - Fourth grading period grade (optional)</li>
                                    <li><strong>first_semester_midterm</strong> - First semester midterm grade (optional)</li>
                                    <li><strong>first_semester_pre_final</strong> - First semester pre-final grade (optional)</li>
                                    <li><strong>second_semester_midterm</strong> - Second semester midterm grade (optional)</li>
                                    <li><strong>second_semester_pre_final</strong> - Second semester pre-final grade (optional)</li>
                                    <li><strong>overall_grade</strong> - Overall grade (optional)</li>
                                    <li><strong>remarks</strong> - Remarks (optional)</li>
                                </ul>
                            </div>
                        </div>

                        {/* Sample CSV */}
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Sample CSV Format</h3>
                            <div className="text-sm text-gray-700">
                                <pre className="bg-white p-3 rounded border overflow-x-auto">
{`student_id,subject_id,first_grading,second_grading,third_grading,fourth_grading,overall_grade,remarks
1,1,85.5,87.2,88.1,89.0,87.45,Good performance
2,1,78.0,80.5,82.1,83.0,80.90,Needs improvement
3,2,92.0,91.5,93.2,94.0,92.68,Excellent work`}
                                </pre>
                            </div>
                        </div>

                        {/* Assigned Students Info */}
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <h3 className="text-sm font-medium text-green-900 mb-2">Your Assigned Students</h3>
                            <p className="text-sm text-green-800 mb-3">
                                You can only upload grades for students assigned to you. Here are your students:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {assignedStudents.map((student) => (
                                    <div key={student.id} className="bg-white p-3 rounded border">
                                        <div className="text-sm font-medium text-gray-900">
                                            {student.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            ID: {student.id} | {student.studentProfile.section}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Available Subjects */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <h3 className="text-sm font-medium text-yellow-900 mb-2">Available Subjects</h3>
                            <p className="text-sm text-yellow-800 mb-3">
                                You can upload grades for any of these subjects:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {subjects.map((subject) => (
                                    <div key={subject.id} className="bg-white p-3 rounded border">
                                        <div className="text-sm font-medium text-gray-900">
                                            {subject.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Code: {subject.code} | ID: {subject.id}
                                        </div>
                                    </div>
                                ))}
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
                                className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                            >
                                {processing ? 'Uploading...' : 'Upload Grades'}
                            </button>
                        </div>
                    </form>
                </div>
            </ClassAdviserLayout>
        </>
    );
};

export default UploadGrades; 