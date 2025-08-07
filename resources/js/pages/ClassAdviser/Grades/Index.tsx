import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ClassAdviserLayout from '../ClassAdviserLayout';
import AddGradeModal from './AddGradeModal';

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
    academicPeriod: {
        name: string;
        school_year: string;
    };
    section: string;
    first_grading: number | null;
    second_grading: number | null;
    third_grading: number | null;
    fourth_grading: number | null;
    overall_grade: number | null;
    status: string;
    created_at: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    academicLevel: {
        name: string;
    };
    instructor_assignments?: Array<{
        id: number;
        instructor: {
            id: number;
            name: string;
            email: string;
        };
        academic_period: {
            id: number;
            name: string;
            school_year: string;
        };
        section: string;
        year_level: string;
        is_active: boolean;
    }>;
}

interface Props {
    adviser: {
        id: number;
        name: string;
        role_display: string;
    };
    assignedStudents: Student[];
    subjects: Subject[];
    grades: {
        data: Grade[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const GradesIndex: React.FC<Props> = ({ adviser, assignedStudents, subjects, grades }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'submitted':
                return 'bg-yellow-100 text-yellow-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved':
                return 'Approved';
            case 'submitted':
                return 'Submitted';
            case 'draft':
                return 'Draft';
            default:
                return status;
        }
    };

    return (
        <>
            <Head title="Grades - Class Adviser" />
            <ClassAdviserLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Grade Management</h1>
                            <p className="text-gray-600 mt-2">View and manage grades for your assigned students.</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Add Grade
                            </button>
                            <Link
                                href="/class-adviser/grades/upload"
                                className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Upload CSV
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-2xl">👥</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                <p className="text-2xl font-semibold text-gray-900">{assignedStudents.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-2xl">📊</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Grades</p>
                                <p className="text-2xl font-semibold text-gray-900">{grades.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {grades.data.filter(grade => grade.status === 'approved').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <span className="text-2xl">⏳</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {grades.data.filter(grade => grade.status === 'submitted').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grades Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">All Grades</h2>
                        <p className="text-sm text-gray-600 mt-1">Grades for your assigned students</p>
                    </div>
                    <div className="overflow-x-auto">
                        {grades.data.filter(grade => grade.student && grade.subject && grade.academicPeriod).length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-gray-400 text-6xl mb-4">📊</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Grades Found</h3>
                                <p className="text-gray-600">No grades have been submitted yet.</p>
                            </div>
                        ) : (
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
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Section
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Overall Grade
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {grades.data.filter(grade => grade.student && grade.subject && grade.academicPeriod).map((grade) => (
                                    <tr key={grade.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {grade.student?.name || 'Unknown Student'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {grade.student?.email || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {grade.subject?.name || 'Unknown Subject'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {grade.subject?.code || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {grade.academicPeriod?.name || 'Unknown Period'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {grade.academicPeriod?.school_year || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {grade.section}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {grade.overall_grade ? grade.overall_grade.toFixed(2) : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(grade.status)}`}>
                                                {getStatusText(grade.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(grade.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                href={`/class-adviser/grades/${grade.id}/edit`}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                href={`/class-adviser/grades/${grade.id}`}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {grades.last_page > 1 && (
                        <div className="px-6 py-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {((grades.current_page - 1) * grades.per_page) + 1} to{' '}
                                    {Math.min(grades.current_page * grades.per_page, grades.total)} of{' '}
                                    {grades.total} results
                                </div>
                                <div className="flex space-x-2">
                                    {grades.current_page > 1 && (
                                        <Link
                                            href={`/class-adviser/grades?page=${grades.current_page - 1}`}
                                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {grades.current_page < grades.last_page && (
                                        <Link
                                            href={`/class-adviser/grades?page=${grades.current_page + 1}`}
                                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Grade Modal */}
                <AddGradeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    assignedStudents={assignedStudents}
                    subjects={subjects}
                />
            </ClassAdviserLayout>
        </>
    );
};

export default GradesIndex; 