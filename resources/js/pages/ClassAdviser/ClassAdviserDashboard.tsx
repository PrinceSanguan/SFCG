import React from 'react';
import { Head } from '@inertiajs/react';
import ClassAdviserLayout from './ClassAdviserLayout';

interface Assignment {
    id: number;
    subject: {
        id: number;
        name: string;
        code: string;
        academicLevel: {
            id: number;
            name: string;
            code: string;
        };
    };
    academicPeriod: {
        id: number;
        name: string;
        school_year: string;
    };
    section: string;
    is_active: boolean;
}

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
    adviser: {
        id: number;
        name: string;
        email: string;
        role_display: string;
    };
    assignments: Assignment[];
    assignedStudents: Student[];
    stats: Stats;
    recentActivities: Activity[];
    currentPeriod: {
        name: string;
        school_year: string;
    } | null;
}

const ClassAdviserDashboard: React.FC<Props> = ({ 
    adviser, 
    assignments = [], 
    assignedStudents = [],
    stats, 
    recentActivities = [], 
    currentPeriod 
}) => {
    return (
        <>
            <Head title="Dashboard - Class Adviser" />
            <ClassAdviserLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {adviser.name}!</h1>
                            <p className="text-gray-600 mt-2">Here's what's happening with your advisory class today.</p>
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
                    {/* Class Assignments */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Your Class Assignments</h2>
                            <p className="text-sm text-gray-600 mt-1">Classes you are currently advising</p>
                        </div>
                        <div className="p-6">
                            {assignments.length > 0 ? (
                                <div className="space-y-4">
                                    {assignments.filter(assignment => assignment.subject && assignment.academicPeriod).map((assignment) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{assignment.subject?.name || 'Unknown Subject'}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {assignment.subject?.code || 'N/A'} • {assignment.section}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {assignment.subject?.academicLevel?.name || 'Unknown Level'} • {assignment.academicPeriod?.name || 'Unknown Period'} ({assignment.academicPeriod?.school_year || 'Unknown Year'})
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <a
                                                    href={`/class-adviser/grades?subject=${assignment.subject?.id}`}
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    Add Grades →
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Class Assignments</h3>
                                    <p className="text-gray-600">You haven't been assigned to any classes yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assigned Students */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Your Assigned Students</h2>
                            <p className="text-sm text-gray-600 mt-1">Students under your advisory</p>
                        </div>
                        <div className="p-6">
                            {assignedStudents.length > 0 ? (
                                <div className="space-y-4">
                                    {assignedStudents.filter(student => student.studentProfile?.academicLevel).slice(0, 5).map((student) => (
                                        <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{student.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {student.studentProfile?.student_id || 'N/A'} • {student.studentProfile?.section || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {student.studentProfile?.academicLevel?.name || 'Unknown Level'} - {student.studentProfile?.year_level || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <a
                                                    href={`/class-adviser/grades/create?student=${student.id}`}
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    Add Grades →
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                    {assignedStudents.length > 5 && (
                                        <div className="text-center pt-4">
                                            <a
                                                href="/class-adviser/students"
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                View All {assignedStudents.length} Students →
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Students</h3>
                                    <p className="text-gray-600">No students have been assigned to you yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
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

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                        <p className="text-sm text-gray-600 mt-1">Common tasks you can perform</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a
                                href="/class-adviser/students"
                                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                                    <span className="text-xl">👥</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-blue-900">View Students</h3>
                                    <p className="text-sm text-blue-700">View all your assigned students</p>
                                </div>
                            </a>

                            <a
                                href="/class-adviser/grades/create"
                                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                            >
                                <div className="p-2 bg-green-100 rounded-lg mr-4">
                                    <span className="text-xl">✏️</span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-green-900">Add Grades</h3>
                                    <p className="text-sm text-green-700">Add grades for your students</p>
                                </div>
                            </a>

                            <a
                                href="/class-adviser/honors"
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
            </ClassAdviserLayout>
        </>
    );
};

export default ClassAdviserDashboard; 