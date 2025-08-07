import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';

interface Student {
    id: number;
    name: string;
    email: string;
    student_profile: {
        student_id: string;
        grade_level: string;
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
}

interface Instructor {
    id: number;
    name: string;
    email: string;
}

interface Grade {
    id: number;
    student: Student;
    subject: Subject;
    academic_period: AcademicPeriod;
    instructor: Instructor;
    section: string;
    quarterly_grades: Array<{
        quarter: number;
        grade: number;
        weight: number;
    }>;
    final_grade: number;
    status: string;
    remarks: string;
    submitted_at: string;
    approved_at?: string;
    approved_by?: number;
}

interface Props {
    grade: Grade;
}

const GradingShow: React.FC<Props> = ({ grade }) => {
    const getStatusBadge = (status: string) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            finalized: 'bg-blue-100 text-blue-800',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    const getGradeColor = (grade: number) => {
        if (grade >= 90) return 'text-green-600';
        if (grade >= 80) return 'text-blue-600';
        if (grade >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Head title={`Grade Details - ${grade.student.name}`} />
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Grade Details</h1>
                                    <p className="text-gray-600 mt-2">View detailed information about this grade record</p>
                                </div>
                                <div className="flex space-x-3">
                                    <Link
                                        href="/admin/grading"
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        ← Back to Grading
                                    </Link>
                                    <Link
                                        href={`/admin/grading/${grade.id}/edit`}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Edit Grade
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Grade Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Grade Card */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900">Grade Information</h2>
                                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(grade.status)}`}>
                                            {grade.status.charAt(0).toUpperCase() + grade.status.slice(1)}
                                        </span>
                                    </div>

                                    {/* Student Information */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Student Name</label>
                                                <p className="mt-1 text-sm text-gray-900">{grade.student.name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                                                <p className="mt-1 text-sm text-gray-900">{grade.student.student_profile?.student_id || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Grade Level</label>
                                                <p className="mt-1 text-sm text-gray-900">{grade.student.student_profile?.grade_level || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Section</label>
                                                <p className="mt-1 text-sm text-gray-900">{grade.section}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subject Information */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Subject Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Subject</label>
                                                <p className="mt-1 text-sm text-gray-900">{grade.subject.name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Subject Code</label>
                                                <p className="mt-1 text-sm text-gray-900">{grade.subject.code}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Academic Period</label>
                                                <p className="mt-1 text-sm text-gray-900">{grade.academic_period.name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Class Adviser</label>
                                                <p className="mt-1 text-sm text-gray-900">{grade.instructor?.name || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quarterly Grades */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quarterly Grades</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quarter</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weighted Grade</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {grade.quarterly_grades && grade.quarterly_grades.length > 0 ? (
                                                        grade.quarterly_grades.map((quarterlyGrade, index) => (
                                                            <tr key={index}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    Quarter {quarterlyGrade.quarter}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    <span className={`font-semibold ${getGradeColor(quarterlyGrade.grade)}`}>
                                                                        {quarterlyGrade.grade}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {quarterlyGrade.weight}%
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {((quarterlyGrade.grade * quarterlyGrade.weight) / 100).toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                                                No quarterly grades available
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Final Grade */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Final Grade</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-medium text-gray-700">Final Grade:</span>
                                                <span className={`text-3xl font-bold ${getGradeColor(grade.final_grade)}`}>
                                                    {grade.final_grade}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remarks */}
                                    {grade.remarks && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Remarks</h3>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-sm text-gray-900">{grade.remarks}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Status Timeline */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Status Timeline</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">Grade Submitted</p>
                                                <p className="text-xs text-gray-500">{formatDate(grade.submitted_at)}</p>
                                            </div>
                                        </div>
                                        {grade.approved_at && (
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">Grade Approved</p>
                                                    <p className="text-xs text-gray-500">{formatDate(grade.approved_at)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <Link
                                            href={`/admin/grading/${grade.id}/edit`}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                                        >
                                            Edit Grade
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this grade?')) {
                                                    // Handle delete
                                                }
                                            }}
                                            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Delete Grade
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default GradingShow; 