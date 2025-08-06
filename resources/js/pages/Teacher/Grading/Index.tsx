import React from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '@/pages/Teacher/TeacherLayout';

interface Props {
    gradeCounts: {
        elementary: number;
        junior_high: number;
        senior_high: number;
        total: number;
        pending: number;
        approved: number;
        draft: number;
    };
}

const TeacherGradingIndex: React.FC<Props> = ({ gradeCounts }) => {
    const categories = [
        {
            id: 'elementary',
            title: 'Elementary Grading',
            description: 'Manage grades for Elementary level (Grades 1-6)',
            icon: '🧒',
            count: gradeCounts.elementary,
            route: '/teacher/grading/elementary',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-800',
            iconBg: 'bg-green-100',
        },
        {
            id: 'junior_high',
            title: 'Junior High School Grading',
            description: 'Manage grades for Junior High School (Grades 7-10)',
            icon: '📚',
            count: gradeCounts.junior_high,
            route: '/teacher/grading/junior-high',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            iconBg: 'bg-blue-100',
        },
        {
            id: 'senior_high',
            title: 'Senior High School Grading',
            description: 'Manage grades for Senior High School (Grades 11-12)',
            icon: '🎓',
            count: gradeCounts.senior_high,
            route: '/teacher/grading/senior-high',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-800',
            iconBg: 'bg-purple-100',
        },
    ];

    return (
        <>
            <Head title="Grading Management - Teacher" />
            <TeacherLayout>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Grading Management</h1>
                    <p className="text-gray-600 mt-2">Manage academic grades by educational level (K-12 Only)</p>
                </div>

                {/* Summary Statistics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{gradeCounts.total}</div>
                            <div className="text-sm text-gray-600">Total Grades</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{gradeCounts.pending}</div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{gradeCounts.approved}</div>
                            <div className="text-sm text-gray-600">Approved</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{gradeCounts.draft}</div>
                            <div className="text-sm text-gray-600">Draft</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{gradeCounts.elementary}</div>
                            <div className="text-sm text-gray-600">Elementary</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{gradeCounts.junior_high}</div>
                            <div className="text-sm text-gray-600">Junior High</div>
                        </div>
                    </div>
                </div>

                {/* Grading Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={category.route}
                            className={`block p-6 rounded-lg border-2 ${category.borderColor} ${category.bgColor} hover:shadow-md transition-shadow duration-200`}
                        >
                            <div className="flex items-center mb-4">
                                <div className={`p-3 rounded-lg ${category.iconBg} mr-4`}>
                                    <span className="text-2xl">{category.icon}</span>
                                </div>
                                <div>
                                    <h3 className={`text-lg font-semibold ${category.textColor}`}>
                                        {category.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {category.count} grades
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-4">
                                {category.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${category.textColor}`}>
                                    Manage Grades →
                                </span>
                                <div className={`w-8 h-8 rounded-full ${category.iconBg} flex items-center justify-center`}>
                                    <span className="text-sm">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/teacher/grading/elementary/create"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-2 bg-green-100 rounded-lg mr-3">
                                <span className="text-lg">➕</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Add Elementary Grade</h3>
                                <p className="text-sm text-gray-600">Create new grade for Elementary</p>
                            </div>
                        </Link>
                        <Link
                            href="/teacher/grading/junior-high/create"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <span className="text-lg">➕</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Add Junior High Grade</h3>
                                <p className="text-sm text-gray-600">Create new grade for Junior High</p>
                            </div>
                        </Link>
                        <Link
                            href="/teacher/grading/senior-high/create"
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                <span className="text-lg">➕</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Add Senior High Grade</h3>
                                <p className="text-sm text-gray-600">Create new grade for Senior High</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </TeacherLayout>
        </>
    );
};

export default TeacherGradingIndex; 