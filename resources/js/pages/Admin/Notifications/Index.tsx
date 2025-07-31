import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';

interface Notification {
    id: number;
    user: {
        name: string;
        email: string;
        user_role: string;
    };
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    read_at?: string;
    created_at: string;
}

interface Props {
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    notificationTypes: string[];
    userRoles: string[];
    stats: {
        total: number;
        unread: number;
        read: number;
        today: number;
    };
    filters: {
        type?: string;
        is_read?: boolean;
        user_role?: string;
        search?: string;
    };
}

const NotificationsIndex: React.FC<Props> = ({ 
    notifications, 
    notificationTypes, 
    userRoles, 
    stats, 
    filters 
}) => {
    const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    const { data, setData, get, processing } = useForm({
        type: filters.type || '',
        is_read: filters.is_read !== undefined ? filters.is_read.toString() : '',
        user_role: filters.user_role || '',
        search: filters.search || '',
    });

    const handleFilter = () => {
        get('/admin/notifications', { preserveState: true });
    };

    const handleSelectNotification = (notificationId: number) => {
        setSelectedNotifications(prev => {
            const newSelection = prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId];
            setShowBulkActions(newSelection.length > 0);
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        if (selectedNotifications.length === notifications.data.length) {
            setSelectedNotifications([]);
            setShowBulkActions(false);
        } else {
            setSelectedNotifications(notifications.data.map(notification => notification.id));
            setShowBulkActions(true);
        }
    };

    const handleBulkMarkAsRead = () => {
        router.post('/admin/notifications/mark-read', { 
            notification_ids: selectedNotifications 
        }, {
            onSuccess: () => {
                setSelectedNotifications([]);
                setShowBulkActions(false);
            }
        });
    };

    const handleBulkMarkAsUnread = () => {
        router.post('/admin/notifications/mark-unread', { 
            notification_ids: selectedNotifications 
        }, {
            onSuccess: () => {
                setSelectedNotifications([]);
                setShowBulkActions(false);
            }
        });
    };

    const handleBulkDelete = () => {
        if (confirm('Are you sure you want to delete the selected notifications?')) {
            router.delete('/admin/notifications/delete', {
                data: { notification_ids: selectedNotifications },
                onSuccess: () => {
                    setSelectedNotifications([]);
                    setShowBulkActions(false);
                }
            });
        }
    };

    const getTypeColor = (type: string) => {
        const colors = {
            honor_achievement: 'bg-yellow-100 text-yellow-800',
            grade_update: 'bg-blue-100 text-blue-800',
            system_alert: 'bg-red-100 text-red-800',
            announcement: 'bg-green-100 text-green-800',
            child_honor_achievement: 'bg-purple-100 text-purple-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <>
            <Head title="Notifications Management" />
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Notifications Management</h1>
                                    <p className="text-gray-600 mt-2">Manage system notifications and communications</p>
                                </div>
                                <div className="flex space-x-3">
                                    <Link
                                        href="/admin/notifications/compose"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        ✉️ Compose Message
                                    </Link>
                                    <Link
                                        href="/admin/notifications/analytics"
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        📊 Analytics
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
                                            <span className="text-white text-sm">📧</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Total Notifications</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.total}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-md">
                                            <span className="text-white text-sm">🔴</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Unread</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.unread}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-md">
                                            <span className="text-white text-sm">✅</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Read</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.read}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-md">
                                            <span className="text-white text-sm">📅</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Today</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.today}</dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Types</option>
                                        {notificationTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Read Status
                                    </label>
                                    <select
                                        value={data.is_read}
                                        onChange={(e) => setData('is_read', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Status</option>
                                        <option value="true">Read</option>
                                        <option value="false">Unread</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        User Role
                                    </label>
                                    <select
                                        value={data.user_role}
                                        onChange={(e) => setData('user_role', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Roles</option>
                                        {userRoles.map((role) => (
                                            <option key={role} value={role}>
                                                {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                        placeholder="Search notifications..."
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

                        {/* Bulk Actions */}
                        {showBulkActions && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-800">
                                        {selectedNotifications.length} notification(s) selected
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleBulkMarkAsRead}
                                            disabled={processing}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            Mark as Read
                                        </button>
                                        <button
                                            onClick={handleBulkMarkAsUnread}
                                            disabled={processing}
                                            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
                                        >
                                            Mark as Unread
                                        </button>
                                        <button
                                            onClick={handleBulkDelete}
                                            disabled={processing}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={selectedNotifications.length === notifications.data.length && notifications.data.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Recipient
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Message
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
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
                                    {notifications.data.map((notification) => (
                                        <tr key={notification.id} className={`hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedNotifications.includes(notification.id)}
                                                    onChange={() => handleSelectNotification(notification.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {notification.user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {notification.user.email} • {notification.user.user_role.replace(/_/g, ' ')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {notification.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                                        {notification.message}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                                                    {notification.type.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    notification.is_read 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {notification.is_read ? 'Read' : 'Unread'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(notification.created_at)}
                                                {notification.read_at && (
                                                    <div className="text-xs text-gray-400">
                                                        Read: {formatDate(notification.read_at)}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {notifications.data.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-gray-500 text-lg">No notifications found</div>
                                    <p className="text-gray-400 mt-2">Try adjusting your filters</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {notifications.total > notifications.per_page && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {((notifications.current_page - 1) * notifications.per_page) + 1} to {Math.min(notifications.current_page * notifications.per_page, notifications.total)} of {notifications.total} results
                                </div>
                                
                                <div className="flex space-x-2">
                                    {Array.from({ length: notifications.last_page }, (_, i) => (
                                        <Link
                                            key={i + 1}
                                            href={`/admin/notifications?page=${i + 1}`}
                                            className={`px-3 py-2 rounded-md text-sm ${
                                                notifications.current_page === i + 1
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

export default NotificationsIndex; 