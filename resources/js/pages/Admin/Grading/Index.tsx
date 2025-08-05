import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

interface Props {
    gradeCounts: {
        elementary: number;
        junior_high: number;
        senior_high: number;
        college: number;
        total: number;
        pending: number;
        approved: number;
    };
}

const GradingIndex: React.FC<Props> = ({ gradeCounts }) => {
    const categories = [
        {
            id: 'elementary',
            title: 'Elementary Grading',
            description: 'Manage grades for Elementary level (Grades 1-6)',
            icon: '🧒',
            count: gradeCounts.elementary,
            route: '/admin/grading/elementary',
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
            route: '/admin/grading/junior-high',
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
            route: '/admin/grading/senior-high',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-800',
            iconBg: 'bg-purple-100',
        },
        {
            id: 'college',
            title: 'College Grading',
            description: 'Manage grades for College/University level',
            icon: '🏛️',
            count: gradeCounts.college,
            route: '/admin/grading/college',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            textColor: 'text-orange-800',
            iconBg: 'bg-orange-100',
        },
    ];

    return (
        <>
            <Head title="Grading Management" />
            <AdminLayout>
                        <div className="mb-8">
                                    <h1 className="text-3xl font-bold text-gray-900">Grading Management</h1>
                    <p className="text-gray-600 mt-2">Manage academic grades by educational level</p>
                </div>

                {/* Summary Statistics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
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
                            <div className="text-2xl font-bold text-green-600">{gradeCounts.elementary}</div>
                            <div className="text-sm text-gray-600">Elementary</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{gradeCounts.junior_high}</div>
                            <div className="text-sm text-gray-600">Junior High</div>
                                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{gradeCounts.senior_high}</div>
                            <div className="text-sm text-gray-600">Senior High</div>
                                    </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{gradeCounts.college}</div>
                            <div className="text-sm text-gray-600">College</div>
                                    </div>
                                </div>
                            </div>

                {/* Grading Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={category.route}
                            className={`block p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${category.bgColor} ${category.borderColor} hover:${category.borderColor.replace('200', '300')}`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${category.iconBg} flex items-center justify-center`}>
                                    <span className="text-2xl">{category.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-lg font-semibold ${category.textColor} mb-1`}>
                                        {category.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-3">
                                        {category.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${category.iconBg} ${category.textColor}`}>
                                            {category.count} {category.count === 1 ? 'Grade' : 'Grades'}
                                        </div>
                                        <div className={`text-sm font-medium ${category.textColor}`}>
                                            Manage →
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Link
                            href="/admin/grading/elementary"
                            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-xl">📝</span>
                            <span className="font-medium text-gray-900">Elementary Grades</span>
                        </Link>
                                                    <Link
                            href="/admin/grading/junior-high"
                            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                                    >
                            <span className="text-xl">📊</span>
                            <span className="font-medium text-gray-900">Junior High Grades</span>
                                                    </Link>
                                                    <Link
                            href="/admin/grading/senior-high"
                            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                                    >
                            <span className="text-xl">🎯</span>
                            <span className="font-medium text-gray-900">Senior High Grades</span>
                                                    </Link>
                                        <Link
                            href="/admin/grading/college"
                            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-xl">🏛️</span>
                            <span className="font-medium text-gray-900">College Grades</span>
                                        </Link>
                                </div>
            </div>
        </AdminLayout>
        </>
    );
};

export default GradingIndex; 