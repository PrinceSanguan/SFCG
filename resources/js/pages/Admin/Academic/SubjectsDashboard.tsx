import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

interface Props {
    subjectCounts: {
        elementary: number;
        junior_high: number;
        senior_high: number;
        college: number;
        total: number;
    };
}

const SubjectsDashboard: React.FC<Props> = ({ subjectCounts }) => {
    const categories = [
        {
            id: 'elementary',
            title: 'Elementary Subjects',
            description: 'Manage subjects for Elementary level (Grades 1-6)',
            icon: '🧒',
            count: subjectCounts.elementary,
            route: '/admin/academic/subjects/elementary',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-800',
            iconBg: 'bg-green-100',
        },
        {
            id: 'junior_high',
            title: 'Junior High School Subjects',
            description: 'Manage subjects for Junior High School (Grades 7-10)',
            icon: '📚',
            count: subjectCounts.junior_high,
            route: '/admin/academic/subjects/junior-high',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            iconBg: 'bg-blue-100',
        },
        {
            id: 'senior_high',
            title: 'Senior High School Subjects',
            description: 'Manage subjects for Senior High School (Grades 11-12)',
            icon: '🎓',
            count: subjectCounts.senior_high,
            route: '/admin/academic/subjects/senior-high',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-800',
            iconBg: 'bg-purple-100',
        },
        {
            id: 'college',
            title: 'College Subjects',
            description: 'Manage subjects for College/University level',
            icon: '🏛️',
            count: subjectCounts.college,
            route: '/admin/academic/subjects/college',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            textColor: 'text-orange-800',
            iconBg: 'bg-orange-100',
        },
    ];

    return (
        <>
            <Head title="Subject Management" />
            <AdminLayout>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
                    <p className="text-gray-600 mt-2">Manage academic subjects by educational level</p>
                </div>

                {/* Summary Statistics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{subjectCounts.total}</div>
                            <div className="text-sm text-gray-600">Total Subjects</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{subjectCounts.elementary}</div>
                            <div className="text-sm text-gray-600">Elementary</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{subjectCounts.junior_high}</div>
                            <div className="text-sm text-gray-600">Junior High</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{subjectCounts.senior_high}</div>
                            <div className="text-sm text-gray-600">Senior High</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{subjectCounts.college}</div>
                            <div className="text-sm text-gray-600">College</div>
                        </div>
                    </div>
                </div>

                {/* Subject Categories */}
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
                                            {category.count} {category.count === 1 ? 'Subject' : 'Subjects'}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/admin/academic/subjects/elementary"
                            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-xl">➕</span>
                            <span className="font-medium text-gray-900">Add Elementary Subject</span>
                        </Link>
                        <Link
                            href="/admin/academic/subjects/senior-high"
                            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-xl">🎯</span>
                            <span className="font-medium text-gray-900">Add Senior High Subject</span>
                        </Link>
                        <Link
                            href="/admin/academic/subjects/college"
                            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-xl">🏛️</span>
                            <span className="font-medium text-gray-900">Add College Subject</span>
                        </Link>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
};

export default SubjectsDashboard;