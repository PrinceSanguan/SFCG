import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import TeacherLayout from '../TeacherLayout';

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

const TeacherGradesUpload: React.FC<Props> = ({ teacher, assignments = [] }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        subject_id: '',
        academic_period_id: '',
        section: '',
        csv_file: null as File | null,
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setData('csv_file', file);
            previewCSV(file);
        }
    };

    const previewCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const preview = lines.slice(1, 6).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                const row: any = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                return row;
            }).filter(row => Object.values(row).some(val => val !== ''));
            
            setPreviewData(preview);
            setShowPreview(true);
        };
        reader.readAsText(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFile) {
            const formData = new FormData();
            formData.append('csv_file', selectedFile);
            formData.append('subject_id', data.subject_id);
            formData.append('academic_period_id', data.academic_period_id);
            formData.append('section', data.section);

            post('/teacher/grades/upload', {
                data: formData,
                forceFormData: true,
            });
        }
    };

    const downloadTemplate = () => {
        const template = [
            'email,first_grading,second_grading,third_grading,fourth_grading,first_semester_midterm,first_semester_pre_final,second_semester_midterm,second_semester_pre_final,overall_grade,remarks',
            'student@example.com,85.5,88.0,92.5,90.0,87.5,89.0,91.0,88.5,89.0,Good performance',
            'another@example.com,78.0,82.5,85.0,80.5,79.0,83.0,84.5,81.0,82.0,Needs improvement'
        ].join('\n');

        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grades_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
            <Head title="Upload Grades - Teacher" />
            <TeacherLayout>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Upload Grades</h1>
                                <p className="text-gray-600 mt-2">Upload student grades using a CSV file.</p>
                            </div>
                            <Link
                                href="/teacher/grades"
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                ← Back to Grades
                            </Link>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-semibold text-blue-900 mb-3">📋 Upload Instructions</h2>
                        <div className="text-blue-800 space-y-2">
                            <p>• Download the CSV template below to see the required format</p>
                            <p>• The CSV should include columns: email, first_grading, second_grading, third_grading, fourth_grading, first_semester_midterm, first_semester_pre_final, second_semester_midterm, second_semester_pre_final, overall_grade, remarks</p>
                            <p>• Use student email addresses to identify students</p>
                            <p>• Grades should be between 0 and 100 (leave blank if not applicable)</p>
                            <p>• Maximum file size: 2MB</p>
                        </div>
                        <button
                            onClick={downloadTemplate}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            📥 Download CSV Template
                        </button>
                    </div>

                    {/* Upload Form */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Upload Grades</h2>
                            <p className="text-sm text-gray-600 mt-1">Select the subject assignment and upload your CSV file.</p>
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
                                        value={`${data.subject_id}-${data.academic_period_id}-${data.section}`}
                                        onChange={(e) => {
                                            const [subjectId, periodId, section] = e.target.value.split('-');
                                            setData({
                                                ...data,
                                                subject_id: subjectId || '',
                                                academic_period_id: periodId || '',
                                                section: section || '',
                                            });
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select a subject assignment</option>
                                        {assignments && assignments.length > 0 ? (
                                            assignments.map((assignment) => (
                                                <option 
                                                    key={assignment.id} 
                                                    value={`${assignment.subject.id}-${assignment.academic_period.id}-${assignment.section}`}
                                                >
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

                                {/* File Upload */}
                                <div>
                                    <label htmlFor="csv_file" className="block text-sm font-medium text-gray-700">
                                        CSV File *
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="csv_file"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                                >
                                                    <span>Upload a file</span>
                                                    <input
                                                        id="csv_file"
                                                        name="csv_file"
                                                        type="file"
                                                        accept=".csv"
                                                        className="sr-only"
                                                        onChange={handleFileSelect}
                                                        required
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">CSV up to 2MB</p>
                                        </div>
                                    </div>
                                    {selectedFile && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                        </p>
                                    )}
                                    {errors.csv_file && (
                                        <p className="mt-1 text-sm text-red-600">{errors.csv_file}</p>
                                    )}
                                </div>

                                {/* Preview */}
                                {showPreview && previewData.length > 0 && (
                                    <div>
                                        <h3 className="text-md font-medium text-gray-900 mb-3">File Preview (First 5 rows)</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        {Object.keys(previewData[0]).map((header) => (
                                                            <th
                                                                key={header}
                                                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                            >
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {previewData.map((row, index) => (
                                                        <tr key={index}>
                                                            {Object.values(row).map((value, valueIndex) => (
                                                                <td
                                                                    key={valueIndex}
                                                                    className="px-3 py-2 text-sm text-gray-900"
                                                                >
                                                                    {String(value)}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

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
                                        disabled={processing || !selectedFile}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {processing ? 'Uploading...' : 'Upload Grades'}
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

export default TeacherGradesUpload; 