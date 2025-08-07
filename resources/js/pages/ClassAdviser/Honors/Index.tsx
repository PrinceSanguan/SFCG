import React from 'react';
import { Head, Link } from '@inertiajs/react';
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

interface Honor {
    id: number;
    student: {
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
    };
    academicPeriod: {
        name: string;
        school_year: string;
    };
    honor_type: string;
    gpa: number;
    rank: number;
    total_students: number;
    created_at: string;
}

interface Props {
    adviser: {
        id: number;
        name: string;
        role_display: string;
    };
    assignedStudents: Student[];
    honors: {
        data: Honor[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const HonorsIndex: React.FC<Props> = ({ adviser, assignedStudents, honors }) => {
    const getHonorTypeColor = (honorType: string) => {
        switch (honorType.toLowerCase()) {
            case 'summa cum laude':
                return 'bg-yellow-100 text-yellow-800';
            case 'magna cum laude':
                return 'bg-gray-100 text-gray-800';
            case 'cum laude':
                return 'bg-orange-100 text-orange-800';
            case 'with honors':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    const getHonorTypeIcon = (honorType: string) => {
        switch (honorType.toLowerCase()) {
            case 'summa cum laude':
                return '🥇';
            case 'magna cum laude':
                return '🥈';
            case 'cum laude':
                return '🥉';
            case 'with honors':
                return '🏆';
            default:
                return '🎖️';
        }
    };

    return (
        <>
            <Head title="Honor Results - Class Adviser" />
            <ClassAdviserLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Honor Results</h1>
                            <p className="text-gray-600 mt-2">View honor results for your assigned students</p>
                        </div>
                        <Link
                            href="/class-adviser"
                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            Back to Dashboard
                        </Link>
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
                                <span className="text-2xl">🏆</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Honors</p>
                                <p className="text-2xl font-semibold text-gray-900">{honors.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-2xl">🥇</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Summa Cum Laude</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {honors.data.filter(honor => honor.honor_type.toLowerCase().includes('summa')).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <span className="text-2xl">🥈</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Magna Cum Laude</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {honors.data.filter(honor => honor.honor_type.toLowerCase().includes('magna')).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Honors Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Honor Results</h2>
                        <p className="text-sm text-gray-600 mt-1">Academic honors achieved by your students</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Academic Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Honor Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        GPA
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rank
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
                                                    {honor.student.studentProfile.student_id} • {honor.student.studentProfile.section}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {honor.student.studentProfile.academicLevel.name} - {honor.student.studentProfile.year_level}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {honor.academicPeriod.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {honor.academicPeriod.school_year}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-2">
                                                    {getHonorTypeIcon(honor.honor_type)}
                                                </span>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHonorTypeColor(honor.honor_type)}`}>
                                                    {honor.honor_type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {honor.gpa.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {honor.rank} of {honor.total_students}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Top {Math.round((honor.rank / honor.total_students) * 100)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(honor.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {honors.data.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🏆</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Honor Results Yet</h3>
                            <p className="text-gray-600">Honor results will appear here once they are calculated.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {honors.last_page > 1 && (
                        <div className="px-6 py-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {((honors.current_page - 1) * honors.per_page) + 1} to{' '}
                                    {Math.min(honors.current_page * honors.per_page, honors.total)} of{' '}
                                    {honors.total} results
                                </div>
                                <div className="flex space-x-2">
                                    {honors.current_page > 1 && (
                                        <Link
                                            href={`/class-adviser/honors?page=${honors.current_page - 1}`}
                                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {honors.current_page < honors.last_page && (
                                        <Link
                                            href={`/class-adviser/honors?page=${honors.current_page + 1}`}
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

                {/* Honor Types Legend */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Honor Types</h2>
                        <p className="text-sm text-gray-600 mt-1">Understanding the different honor classifications</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                                <span className="text-2xl mr-3">🥇</span>
                                <div>
                                    <div className="font-medium text-yellow-900">Summa Cum Laude</div>
                                    <div className="text-sm text-yellow-700">Highest honors</div>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-2xl mr-3">🥈</span>
                                <div>
                                    <div className="font-medium text-gray-900">Magna Cum Laude</div>
                                    <div className="text-sm text-gray-700">High honors</div>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                                <span className="text-2xl mr-3">🥉</span>
                                <div>
                                    <div className="font-medium text-orange-900">Cum Laude</div>
                                    <div className="text-sm text-orange-700">With honors</div>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-2xl mr-3">🏆</span>
                                <div>
                                    <div className="font-medium text-blue-900">With Honors</div>
                                    <div className="text-sm text-blue-700">Academic distinction</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ClassAdviserLayout>
        </>
    );
};

export default HonorsIndex; 