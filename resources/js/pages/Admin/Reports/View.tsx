import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';

interface ReportData {
    title: string;
    data: any[];
    summary: any;
}

interface Filters {
    academic_period_id?: string;
    academic_level_id?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    reportData: ReportData;
    reportType: string;
    filters: Filters;
}

const ReportsView: React.FC<Props> = ({ reportData, reportType, filters }) => {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    const formatNumber = (num: number) => {
        return num?.toFixed(2) || '0.00';
    };

    const renderStudentGradesReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600">Total Grades</h3>
                    <p className="text-2xl font-bold text-blue-900">{reportData.summary.total_grades}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-600">Average Grade</h3>
                    <p className="text-2xl font-bold text-green-900">{formatNumber(reportData.summary.average_grade)}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-600">Highest Grade</h3>
                    <p className="text-2xl font-bold text-yellow-900">{formatNumber(reportData.summary.highest_grade)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-red-600">Lowest Grade</h3>
                    <p className="text-2xl font-bold text-red-900">{formatNumber(reportData.summary.lowest_grade)}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Grade Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.data.map((grade: any) => (
                                <tr key={grade.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{grade.student?.name}</div>
                                        <div className="text-sm text-gray-500">{grade.student?.studentProfile?.student_id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grade.subject?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grade.instructor?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grade.academicPeriod?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(grade.overall_grade)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            grade.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {grade.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderHonorRollReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-600">Total Honors</h3>
                    <p className="text-2xl font-bold text-yellow-900">{reportData.summary.total_honors}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-600">Average GPA</h3>
                    <p className="text-2xl font-bold text-green-900">{formatNumber(reportData.summary.average_gpa)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600">Honor Types</h3>
                    <p className="text-2xl font-bold text-blue-900">{Object.keys(reportData.summary.by_type).length}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Honor Roll Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Honor Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GPA</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Awarded Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.data.map((honor: any) => (
                                <tr key={honor.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{honor.student?.name}</div>
                                        <div className="text-sm text-gray-500">{honor.student?.studentProfile?.student_id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{honor.honorCriterion?.honor_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(honor.gpa)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(honor.awarded_date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            honor.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {honor.is_approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderEnrollmentReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600">Total Students</h3>
                    <p className="text-2xl font-bold text-blue-900">{reportData.summary.total_students}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-600">Academic Levels</h3>
                    <p className="text-2xl font-bold text-green-900">{Object.keys(reportData.summary.by_level).length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment by Level</h3>
                    <div className="space-y-3">
                        {Object.entries(reportData.summary.by_level).map(([level, count]: [string, any]) => (
                            <div key={level} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{level}</span>
                                <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment by Section</h3>
                    <div className="space-y-3">
                        {Object.entries(reportData.summary.by_section).map(([section, count]: [string, any]) => (
                            <div key={section} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{section || 'No Section'}</span>
                                <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderInstructorPerformanceReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-600">Total Instructors</h3>
                    <p className="text-2xl font-bold text-purple-900">{reportData.summary.total_instructors}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600">Total Grades Given</h3>
                    <p className="text-2xl font-bold text-blue-900">{reportData.summary.total_grades_given}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-600">Avg Grades/Instructor</h3>
                    <p className="text-2xl font-bold text-green-900">{formatNumber(reportData.summary.average_grades_per_instructor)}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Instructor Performance Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grades Given</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.data.map((instructor: any) => (
                                <tr key={instructor.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{instructor.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{instructor.user_role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{instructor.assigned_grades_count}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{instructor.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAcademicSummaryReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600">Total Students</h3>
                    <p className="text-2xl font-bold text-blue-900">{reportData.summary.total_students}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-600">Total Instructors</h3>
                    <p className="text-2xl font-bold text-green-900">{reportData.summary.total_instructors}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-600">Total Subjects</h3>
                    <p className="text-2xl font-bold text-yellow-900">{reportData.summary.total_subjects}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h3>
                    <div className="space-y-3">
                        {Object.entries(reportData.summary.grade_distribution).map(([range, count]: [string, any]) => (
                            <div key={range} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{range}</span>
                                <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Honor Distribution</h3>
                    <div className="space-y-3">
                        {Object.entries(reportData.summary.honor_distribution).map(([type, count]: [string, any]) => (
                            <div key={type} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{type}</span>
                                <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUserActivityReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600">Total Activities</h3>
                    <p className="text-2xl font-bold text-gray-900">{reportData.summary.total_activities}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600">Active Users</h3>
                    <p className="text-2xl font-bold text-blue-900">{Object.keys(reportData.summary.by_user).length}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.data.slice(0, 50).map((activity: any) => (
                                <tr key={activity.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.user?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.action}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.model_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(activity.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderReportContent = () => {
        switch (reportType) {
            case 'student_grades':
                return renderStudentGradesReport();
            case 'honor_roll':
                return renderHonorRollReport();
            case 'enrollment':
                return renderEnrollmentReport();
            case 'instructor_performance':
                return renderInstructorPerformanceReport();
            case 'academic_summary':
                return renderAcademicSummaryReport();
            case 'user_activity':
                return renderUserActivityReport();
            default:
                return <div className="text-center text-gray-500">Report type not supported</div>;
        }
    };

    return (
        <>
            <Head title={`${reportData.title} - Reports`} />
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{reportData.title}</h1>
                                    <p className="text-gray-600 mt-2">Generated on {formatDate(new Date().toISOString())}</p>
                                </div>
                                <div className="flex space-x-3">
                                    <Link
                                        href="/admin/reports"
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        ← Back to Reports
                                    </Link>
                                    <button
                                        onClick={() => window.print()}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        🖨️ Print
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filters Summary */}
                        {(filters.academic_period_id || filters.academic_level_id || filters.date_from || filters.date_to) && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="text-sm font-medium text-blue-900 mb-2">Applied Filters:</h3>
                                <div className="text-sm text-blue-700 space-y-1">
                                    {filters.academic_period_id && <div>• Academic Period: {filters.academic_period_id}</div>}
                                    {filters.academic_level_id && <div>• Academic Level: {filters.academic_level_id}</div>}
                                    {filters.date_from && <div>• Date From: {formatDate(filters.date_from)}</div>}
                                    {filters.date_to && <div>• Date To: {formatDate(filters.date_to)}</div>}
                                </div>
                            </div>
                        )}

                        {/* Report Content */}
                        <div className="space-y-6">
                            {renderReportContent()}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default ReportsView; 