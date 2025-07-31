import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';

interface ActivityLog {
    id: number;
    user: {
        name: string;
        email: string;
    } | null;
    action: string;
    model_type: string;
    model_id?: number;
    old_values?: Record<string, unknown>;
    new_values?: Record<string, unknown>;
    created_at: string;
}

interface User {
    id: number;
    name: string;
}

interface Props {
    logs: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    users: User[];
    actions: string[];
    modelTypes: string[];
    stats: {
        total_logs: number;
        today_logs: number;
        this_week_logs: number;
        top_users: Array<{
            user_id: number;
            count: number;
            user: {
                name: string;
            };
        }>;
    };
    filters: {
        user_id?: number;
        action?: string;
        model_type?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

const SystemLogs: React.FC<Props> = ({ logs, users, actions, modelTypes, stats, filters }) => {
    const { data, setData, get } = useForm({
        user_id: filters.user_id || '',
        action: filters.action || '',
        model_type: filters.model_type || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        search: filters.search || '',
    });

    const handleFilter = () => {
        get('/admin/system/logs', { preserveState: true });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getActionColor = (action: string) => {
        const colors = {
            created: 'bg-green-100 text-green-800',
            updated: 'bg-blue-100 text-blue-800',
            deleted: 'bg-red-100 text-red-800',
            exported: 'bg-purple-100 text-purple-800',
            imported: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            logged_in: 'bg-blue-100 text-blue-800',
            logged_out: 'bg-gray-100 text-gray-800',
        };
        return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getModelIcon = (modelType: string) => {
        const icons = {
            User: '👤',
            Grade: '📊',
            Subject: '📚',
            AcademicLevel: '🏫',
            AcademicStrand: '🎯',
            StudentHonor: '🏆',
            Notification: '📧',
            System: '⚙️',
        };
        return icons[modelType as keyof typeof icons] || '📋';
    };

    return (
        <>
            <Head title="System Logs" />
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">System Activity Logs</h1>
                                    <p className="text-gray-600 mt-2">Monitor system activities and user actions</p>
                                </div>
                                <div className="flex space-x-3">
                                    <Link
                                        href="/admin/system/backup"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        💾 Backup System
                                    </Link>
                                    <Link
                                        href="/admin/system/maintenance"
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        🔧 Maintenance
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-md">
                                            <span className="text-white text-sm">📝</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Total Logs</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.total_logs.toLocaleString()}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-md">
                                            <span className="text-white text-sm">📅</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Today</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.today_logs}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-md">
                                            <span className="text-white text-sm">📊</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">This Week</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.this_week_logs}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-md">
                                            <span className="text-white text-sm">👥</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Active Users</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.top_users.length}</dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        User
                                    </label>
                                    <select
                                        value={data.user_id}
                                        onChange={(e) => setData('user_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Users</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Action
                                    </label>
                                    <select
                                        value={data.action}
                                        onChange={(e) => setData('action', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Actions</option>
                                        {actions.map((action) => (
                                            <option key={action} value={action}>
                                                {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Model Type
                                    </label>
                                    <select
                                        value={data.model_type}
                                        onChange={(e) => setData('model_type', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Types</option>
                                        {modelTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date From
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date_from}
                                        onChange={(e) => setData('date_from', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date To
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date_to}
                                        onChange={(e) => setData('date_to', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                        placeholder="Search logs..."
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <button
                                    onClick={handleFilter}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>

                        {/* Top Users Activity */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Users</h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {stats.top_users.map((userStat) => (
                                    <div key={userStat.user_id} className="bg-gray-50 rounded-lg p-4 text-center">
                                        <div className="text-lg font-semibold text-gray-900">{userStat.user.name}</div>
                                        <div className="text-2xl font-bold text-blue-600">{userStat.count}</div>
                                        <div className="text-sm text-gray-500">actions</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activity Logs Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Model
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Changes
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {log.user?.name || 'System'}
                                                    </div>
                                                    {log.user?.email && (
                                                        <div className="text-sm text-gray-500">
                                                            {log.user.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-lg mr-2">{getModelIcon(log.model_type)}</span>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {log.model_type}
                                                        </div>
                                                        {log.model_id && (
                                                            <div className="text-sm text-gray-500">
                                                                ID: {log.model_id}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs">
                                                    {log.new_values && Object.keys(log.new_values).length > 0 && (
                                                        <div className="space-y-1">
                                                            {Object.entries(log.new_values).slice(0, 3).map(([key, value]) => (
                                                                <div key={key} className="text-xs">
                                                                    <span className="font-medium">{key}:</span> {
                                                                        typeof value === 'object' ? JSON.stringify(value).slice(0, 50) + '...' : String(value).slice(0, 50)
                                                                    }
                                                                </div>
                                                            ))}
                                                            {Object.keys(log.new_values).length > 3 && (
                                                                <div className="text-xs text-gray-400">
                                                                    +{Object.keys(log.new_values).length - 3} more changes
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(log.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {logs.data.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-gray-500 text-lg">No logs found</div>
                                    <p className="text-gray-400 mt-2">Try adjusting your filters</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {logs.total > logs.per_page && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {((logs.current_page - 1) * logs.per_page) + 1} to {Math.min(logs.current_page * logs.per_page, logs.total)} of {logs.total} results
                                </div>
                                
                                <div className="flex space-x-2">
                                    {Array.from({ length: logs.last_page }, (_, i) => (
                                        <Link
                                            key={i + 1}
                                            href={`/admin/system/logs?page=${i + 1}`}
                                            className={`px-3 py-2 rounded-md text-sm ${
                                                logs.current_page === i + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            }`}
                                        >
                                            {i + 1}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};

export default SystemLogs; 