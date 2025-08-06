import React from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from './TeacherLayout';

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
    teacher: {
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

const TeacherDashboard: React.FC<Props> = ({ 
    teacher, 
    assignments = [], 
    stats, 
    recentActivities = [], 
    currentPeriod 
}) => {
    return (
        <>
            <Head title="Dashboard - Teacher" />
            <TeacherLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {teacher.name}!</h1>
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
                    {/* Subject Assignments */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Your Subject Assignments</h2>
                            <p className="text-sm text-gray-600 mt-1">Subjects you are currently teaching</p>
                        </div>
                        <div className="p-6">
                            {assignments.length > 0 ? (
                                <div className="space-y-4">
                                    {assignments.map((assignment) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{assignment.subject.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {assignment.subject.code} • {assignment.section}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {assignment.academic_period.name} ({assignment.academic_period.school_year})
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <a
                                                    href={`/teacher/grades?subject=${assignment.subject.id}&section=${assignment.section}`}
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    View Grades →
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-6xl mb-4">📚</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Subject Assignments</h3>
                                    <p className="text-gray-600">You haven't been assigned to any subjects yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                            <p className="text-sm text-gray-600 mt-1">Your latest actions in the system</p>
                        </div>
                        <div className="p-6">
                            {recentActivities.length > 0 ? (
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
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activities</h3>
                                    <p className="text-gray-600">Your activities will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                        <p className="text-sm text-gray-600 mt-1">Common tasks you can perform</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a
                                href="/teacher/grades/create"
                                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                                    <span className="text-xl">✏️</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-blue-900">Input Grades</h3>
                                    <p className="text-sm text-blue-700">Add grades for your students</p>
                                </div>
                            </a>

                            <a
                                href="/teacher/grades/upload"
                                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                            >
                                <div className="p-2 bg-green-100 rounded-lg mr-4">
                                    <span className="text-xl">📁</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-green-900">Upload Grades</h3>
                                    <p className="text-sm text-green-700">Upload grades via CSV file</p>
                                </div>
                            </a>

                            <a
                                href="/teacher/honors"
                                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                                <div className="p-2 bg-purple-100 rounded-lg mr-4">
                                    <span className="text-xl">🏆</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-purple-900">View Honors</h3>
                                    <p className="text-sm text-purple-700">Check student honor results</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </TeacherLayout>
        </>
    );
};

export default TeacherDashboard; 