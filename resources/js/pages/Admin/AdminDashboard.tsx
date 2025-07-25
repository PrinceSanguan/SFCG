import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';
import React from 'react';

const AdminDashboard: React.FC = () => {
    // Mock data for the requested features
    const stats = {
        totalUsers: 1247,
        activeStudents: 856,
        instructors: 45,
        subjects: 28,
        pendingGrades: 23
    };

    const recentActivities = [
        { id: 1, action: 'New student enrolled', user: 'John Doe', time: '2 hours ago', type: 'user' },
        { id: 2, action: 'CSV upload completed', user: 'Admin', time: '4 hours ago', type: 'upload' },
        { id: 3, action: 'Grade submitted', user: 'Prof. Smith', time: '6 hours ago', type: 'grade' },
        { id: 4, action: 'Honor roll updated', user: 'Admin', time: '1 day ago', type: 'honor' },
        { id: 5, action: 'Gmail notification sent', user: 'System', time: '2 days ago', type: 'notification' }
    ];

    const quickActions = [
        { name: 'Upload CSV', icon: '📤', href: '/admin/users/upload', color: 'bg-blue-500' },
        { name: 'Send Gmail', icon: '📧', href: '/admin/notifications', color: 'bg-green-500' },
        { name: 'Generate Reports', icon: '📊', href: '/admin/reports', color: 'bg-purple-500' },
        { name: 'Configure Honors', icon: '🏆', href: '/admin/honors', color: 'bg-yellow-500' },
        { name: 'Backup System', icon: '💾', href: '/admin/system/backup', color: 'bg-orange-500' },
        { name: 'View Audit Logs', icon: '📝', href: '/admin/system/logs', color: 'bg-red-500' }
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user': return '👤';
            case 'upload': return '📤';
            case 'grade': return '📊';
            case 'honor': return '🏆';
            case 'notification': return '📧';
            default: return '📋';
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'user': return 'text-blue-600 bg-blue-50';
            case 'upload': return 'text-green-600 bg-green-50';
            case 'grade': return 'text-purple-600 bg-purple-50';
            case 'honor': return 'text-yellow-600 bg-yellow-50';
            case 'notification': return 'text-indigo-600 bg-indigo-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6 space-y-6">
                    {/* Dashboard Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-2">Manage users, academic setup, grading, honors, and system operations</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-md">
                                        <span className="text-white text-sm">👥</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <dt className="text-sm font-medium text-gray-500">Total Users</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-md">
                                        <span className="text-white text-sm">👨‍🎓</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <dt className="text-sm font-medium text-gray-500">Students</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.activeStudents.toLocaleString()}</dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-md">
                                        <span className="text-white text-sm">👨‍🏫</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <dt className="text-sm font-medium text-gray-500">Instructors</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.instructors}</dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-md">
                                        <span className="text-white text-sm">📚</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <dt className="text-sm font-medium text-gray-500">Subjects</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.subjects}</dd>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-md">
                                        <span className="text-white text-sm">📊</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <dt className="text-sm font-medium text-gray-500">Pending Grades</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.pendingGrades}</dd>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {quickActions.map((action, index) => (
                                <a
                                    key={index}
                                    href={action.href}
                                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                                >
                                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                                        <span className="text-white text-xl">{action.icon}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 text-center">{action.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activities */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                                <a href="/admin/system/logs" className="text-sm text-blue-600 hover:text-blue-800">View all logs</a>
                            </div>
                            <div className="space-y-3">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                                            <span className="text-sm">{getActivityIcon(activity.type)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                            <p className="text-sm text-gray-500">by {activity.user} • {activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Admin Features Overview */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Features</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                                    <div className="flex items-center">
                                        <span className="text-xl mr-3">👥</span>
                                        <span className="text-sm font-medium text-gray-900">User Management</span>
                                    </div>
                                    <a href="/admin/users" className="text-sm text-blue-600 hover:text-blue-800">Manage →</a>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                                    <div className="flex items-center">
                                        <span className="text-xl mr-3">🏫</span>
                                        <span className="text-sm font-medium text-gray-900">Academic Setup</span>
                                    </div>
                                    <a href="/admin/academic" className="text-sm text-blue-600 hover:text-blue-800">Configure →</a>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                                    <div className="flex items-center">
                                        <span className="text-xl mr-3">📊</span>
                                        <span className="text-sm font-medium text-gray-900">Grading</span>
                                    </div>
                                    <a href="/admin/grading" className="text-sm text-blue-600 hover:text-blue-800">Manage →</a>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                                    <div className="flex items-center">
                                        <span className="text-xl mr-3">🏆</span>
                                        <span className="text-sm font-medium text-gray-900">Honors & Certificates</span>
                                    </div>
                                    <a href="/admin/honors" className="text-sm text-blue-600 hover:text-blue-800">Configure →</a>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                                    <div className="flex items-center">
                                        <span className="text-xl mr-3">📧</span>
                                        <span className="text-sm font-medium text-gray-900">Gmail Notifications</span>
                                    </div>
                                    <a href="/admin/notifications" className="text-sm text-blue-600 hover:text-blue-800">Send →</a>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                                    <div className="flex items-center">
                                        <span className="text-xl mr-3">📈</span>
                                        <span className="text-sm font-medium text-gray-900">Reports & Export</span>
                                    </div>
                                    <a href="/admin/reports" className="text-sm text-blue-600 hover:text-blue-800">Generate →</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
