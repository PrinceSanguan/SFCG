import React from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '../../TeacherLayout';

interface StudentHonor {
    id: number;
    student: {
        id: number;
        name: string;
        email: string;
        student_profile?: {
            student_id: string;
            section: string;
            academic_level: string;
        };
    };
    honor_criterion: {
        id: number;
        name: string;
        description: string;
        minimum_grade: number;
        maximum_grade: number | null;
    };
    academic_period: {
        id: number;
        name: string;
        school_year: string;
    };
    average_grade: number;
    status: string;
    created_at: string;
}

interface Props {
    teacher: {
        id: number;
        name: string;
        role_display: string;
    };
    honors: {
        data: StudentHonor[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const TeacherHonorsIndex: React.FC<Props> = ({ teacher, honors }) => {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
            rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getHonorLevel = (averageGrade: number, criterion: any) => {
        if (averageGrade >= criterion.minimum_grade) {
            if (criterion.maximum_grade && averageGrade <= criterion.maximum_grade) {
                return criterion.name;
            } else if (!criterion.maximum_grade) {
                return criterion.name;
            }
        }
        return 'Not Qualified';
    };

    const getHonorBadge = (averageGrade: number, criterion: any) => {
        const honorLevel = getHonorLevel(averageGrade, criterion);
        const badgeConfig = {
            'With Highest Honors': { color: 'bg-purple-100 text-purple-800', icon: '🏆' },
            'With High Honors': { color: 'bg-blue-100 text-blue-800', icon: '🥇' },
            'With Honors': { color: 'bg-green-100 text-green-800', icon: '🥈' },
            'Not Qualified': { color: 'bg-gray-100 text-gray-800', icon: '📊' },
        };

        const config = badgeConfig[honorLevel as keyof typeof badgeConfig] || badgeConfig['Not Qualified'];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.icon} {honorLevel}
            </span>
        );
    };

    return (
        <>
            <Head title="Student Honors - Teacher" />
            <TeacherLayout>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Student Honors</h1>
                                <p className="text-gray-600 mt-2">View honor results and achievements of your students.</p>
                            </div>
                            <div className="flex space-x-3">
                                <Link
                                    href="/teacher/dashboard"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    ← Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">🏆</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Honors
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {honors.total}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">✅</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Approved
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {honors.data.filter(h => h.status === 'approved').length}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">⏳</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Pending
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {honors.data.filter(h => h.status === 'pending').length}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">🥇</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Highest Honors
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {honors.data.filter(h => 
                                                    getHonorLevel(h.average_grade, h.honor_criterion) === 'With Highest Honors'
                                                ).length}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Honors Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Honor Results</h2>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-500">
                                        {honors.total} honors found
                                    </span>
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
                                            Section
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Academic Period
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Average Grade
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Honor Level
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {honors.data.map((honor) => (
                                        <tr key={honor.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {honor.student.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {honor.student.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {honor.student.student_profile?.section || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{honor.academic_period.name}</div>
                                                <div className="text-sm text-gray-500">{honor.academic_period.school_year}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="font-medium">{honor.average_grade.toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getHonorBadge(honor.average_grade, honor.honor_criterion)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(honor.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(honor.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {honors.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {((honors.current_page - 1) * honors.per_page) + 1} to{' '}
                                        {Math.min(honors.current_page * honors.per_page, honors.total)} of{' '}
                                        {honors.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {honors.current_page > 1 && (
                                            <Link
                                                href={`/teacher/honors?page=${honors.current_page - 1}`}
                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {honors.current_page < honors.last_page && (
                                            <Link
                                                href={`/teacher/honors?page=${honors.current_page + 1}`}
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

export default TeacherHonorsIndex; 