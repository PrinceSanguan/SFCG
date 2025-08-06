import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
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
    created_at: string;
}

interface Assignment {
    id: number;
    subject: {
        id: number;
        name: string;
        code: string;
    };
    academic_period: {
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
    grades: {
        data: Grade[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const TeacherGradesIndex: React.FC<Props> = ({ teacher, assignments = [], grades }) => {
    const [selectedGrades, setSelectedGrades] = useState<number[]>([]);

    const handleGradeSelection = (gradeId: number) => {
        setSelectedGrades(prev => 
            prev.includes(gradeId) 
                ? prev.filter(id => id !== gradeId)
                : [...prev, gradeId]
        );
    };

    const handleSelectAll = () => {
        if (selectedGrades.length === (grades?.data?.length || 0)) {
            setSelectedGrades([]);
        } else {
            setSelectedGrades((grades?.data || []).map(grade => grade.id));
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
            submitted: { color: 'bg-yellow-100 text-yellow-800', label: 'Submitted' },
            approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
            finalized: { color: 'bg-blue-100 text-blue-800', label: 'Finalized' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatGrade = (grade: number | null) => {
        return grade !== null ? grade.toFixed(2) : 'N/A';
    };

    // Safely access grades data
    const safeGrades = grades || { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0 };

    return (
        <>
            <Head title="Grades - Teacher" />
            <TeacherLayout>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Grade Management</h1>
                                <p className="text-gray-600 mt-2">Manage and view student grades for your subjects.</p>
                            </div>
                            <div className="flex space-x-3">
                                <Link
                                    href="/teacher/grades/create"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    ✏️ Input Grade
                                </Link>
                                <Link
                                    href="/teacher/grades/upload"
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    📁 Upload Grades
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                        <div className="p-6">
                            <div className="flex justify-between items-center">
                                <div className="flex space-x-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                                            <option value="">All Subjects</option>
                                            {assignments && assignments.length > 0 ? (
                                                assignments.map((assignment) => (
                                                    <option key={assignment.id} value={assignment.subject.id}>
                                                        {assignment.subject.name} ({assignment.section})
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No assignments available</option>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                                            <option value="">All Status</option>
                                            <option value="draft">Draft</option>
                                            <option value="submitted">Submitted</option>
                                            <option value="approved">Approved</option>
                                            <option value="finalized">Finalized</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {selectedGrades.length > 0 && (
                                        <button
                                            onClick={() => {/* Handle bulk submit */}}
                                            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-sm"
                                        >
                                            📤 Submit Selected ({selectedGrades.length})
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grades Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Student Grades</h2>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-500">
                                        {safeGrades.total} grades found
                                    </span>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedGrades.length === safeGrades.data.length && safeGrades.data.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Select All</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Section
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            1st Grading
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            2nd Grading
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            3rd Grading
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            4th Grading
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Overall
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
                                    {safeGrades.data.length > 0 ? (
                                        safeGrades.data.map((grade) => (
                                            <tr key={grade.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedGrades.includes(grade.id)}
                                                            onChange={() => handleGradeSelection(grade.id)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {grade.student?.name || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {grade.student?.email || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{grade.subject?.name || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">{grade.subject?.code || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {grade.section || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatGrade(grade['1st_grading'])}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatGrade(grade['2nd_grading'])}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatGrade(grade['3rd_grading'])}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatGrade(grade['4th_grading'])}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatGrade(grade.overall_grade)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(grade.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/teacher/grades/${grade.id}/edit`}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => {/* Handle delete */}}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                                                No grades found. Create your first grade entry.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {safeGrades.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {((safeGrades.current_page - 1) * safeGrades.per_page) + 1} to{' '}
                                        {Math.min(safeGrades.current_page * safeGrades.per_page, safeGrades.total)} of{' '}
                                        {safeGrades.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {safeGrades.current_page > 1 && (
                                            <Link
                                                href={`/teacher/grades?page=${safeGrades.current_page - 1}`}
                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {safeGrades.current_page < safeGrades.last_page && (
                                            <Link
                                                href={`/teacher/grades?page=${safeGrades.current_page + 1}`}
                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </TeacherLayout>
        </>
    );
};

export default TeacherGradesIndex; 