import React from 'react';
import { Head } from '@inertiajs/react';
import InstructorLayout from './InstructorLayout';

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

interface Activity {
    id: number;
    action: string;
    time: string;
    model: string;
}

interface Stats {
    total_subjects: number;
    total_students: number;
    pending_grades: number;
    approved_grades: number;
    draft_grades: number;
}

interface Props {
    instructor: {
        id: number;
        name: string;
        email: string;
        role_display: string;
    };
    assignments: Assignment[];
    stats: Stats;
    recentActivities: Activity[];
    currentPeriod: {
        name: string;
        school_year: string;
    } | null;
}

const InstructorDashboard: React.FC<Props> = ({ 
    instructor, 
    assignments = [], 
    stats, 
    recentActivities = [], 
    currentPeriod 
}) => {
    return (
        <>
            <Head title="Dashboard - Instructor" />
            <InstructorLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {instructor.name}!</h1>
                            <p className="text-gray-600 mt-2">Here's what's happening with your classes today.</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Current Period</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {currentPeriod ? `${currentPeriod.name} (${currentPeriod.school_year})` : 'No active period'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-2xl">📚</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_subjects}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-2xl">👥</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_students}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-2xl">⏳</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending Grades</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending_grades}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Approved Grades</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.approved_grades}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <span className="text-2xl">📝</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Draft Grades</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.draft_grades}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Current Assignments */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Current Subject Assignments</h3>
                        </div>
                        <div className="p-6">
                            {assignments.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <span className="text-4xl mb-4 block">📚</span>
                                    <p>No subject assignments found.</p>
                                    <p className="text-sm">Contact your administrator to get assigned to subjects.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {assignments.map((assignment) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{assignment.subject.name}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {assignment.subject.code} • {assignment.section}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {assignment.academic_period.name} ({assignment.academic_period.school_year})
                                                </p>
                                            </div>
                                            <a
                                                href={`/instructor/grades?subject=${assignment.subject.id}`}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                            >
                                                Manage Grades
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
                        </div>
                        <div className="p-6">
                            {recentActivities.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <span className="text-4xl mb-4 block">📊</span>
                                    <p>No recent activities.</p>
                                    <p className="text-sm">Your activities will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900">{activity.action}</p>
                                                <p className="text-xs text-gray-500">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <a
                                href="/instructor/grades"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-2xl mr-3">✏️</span>
                                <div>
                                    <p className="font-medium text-gray-900">Input Grades</p>
                                    <p className="text-sm text-gray-600">Enter student grades</p>
                                </div>
                            </a>

                            <a
                                href="/instructor/grades/edit"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-2xl mr-3">🔄</span>
                                <div>
                                    <p className="font-medium text-gray-900">Edit Grades</p>
                                    <p className="text-sm text-gray-600">Modify submitted grades</p>
                                </div>
                            </a>

                            <a
                                href="/instructor/grades/submit"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-2xl mr-3">📤</span>
                                <div>
                                    <p className="font-medium text-gray-900">Submit Grades</p>
                                    <p className="text-sm text-gray-600">Submit for validation</p>
                                </div>
                            </a>

                            <a
                                href="/instructor/honors"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-2xl mr-3">🏆</span>
                                <div>
                                    <p className="font-medium text-gray-900">View Honors</p>
                                    <p className="text-sm text-gray-600">Check honor results</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </InstructorLayout>
        </>
    );
};

export default InstructorDashboard;
