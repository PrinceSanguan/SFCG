import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    ArrowLeft, 
    Search, 
    Filter, 
    Calendar,
    User,
    Activity,
    Eye,
    Download
} from 'lucide-react';

interface User {
    name?: string;
    email?: string;
}

interface ActivityLog {
    id: number;
    action: string;
    entity_type: string;
    entity_id: number;
    ip_address: string;
    user_agent: string;
    created_at: string;
    user: User;
    target_user?: User;
    details: any;
}

interface PageProps {
    user: User;
    activityLogs: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    filters: {
        action?: string;
        user_id?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    availableActions: string[];
    users: User[];
}

export default function ActivityLogs({ 
    user, 
    activityLogs, 
    filters, 
    availableActions, 
    users 
}: PageProps) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [isFiltering, setIsFiltering] = useState(false);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleFilterChange = (key: string, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.append(key, value);
            }
        });
        
        const url = `${route('admin.security.activity-logs')}?${params.toString()}`;
        window.location.href = url;
    };

    const clearFilters = () => {
        setLocalFilters({});
        window.location.href = route('admin.security.activity-logs');
    };

    const getActionColor = (action: string) => {
        const actionColors: { [key: string]: string } = {
            'login': 'bg-green-100 text-green-800',
            'logout': 'bg-gray-100 text-gray-800',
            'failed_login': 'bg-red-100 text-red-800',
            'unauthorized_admin_access': 'bg-red-100 text-red-800',
            'reset_password': 'bg-blue-100 text-blue-800',
            'create_backup': 'bg-purple-100 text-purple-800',
            'download_backup': 'bg-blue-100 text-blue-800',
            'delete_backup': 'bg-red-100 text-red-800',
            'created_user': 'bg-green-100 text-green-800',
            'updated_user': 'bg-blue-100 text-blue-800',
            'deleted_user': 'bg-red-100 text-red-800',
            'terminate_session': 'bg-orange-100 text-orange-800',
        };
        return actionColors[action] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const exportLogs = () => {
        const params = new URLSearchParams();
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.append(key, value);
            }
        });
        params.append('export', 'csv');
        
        const url = `${route('admin.security.activity-logs')}?${params.toString()}`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <Head title="Activity Logs - System Audit & Security" />
                    
                    <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.security.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Security
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Activity Logs
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Monitor and analyze system activity and user actions
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={exportLogs}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filter Activity Logs
                        </CardTitle>
                        <CardDescription>
                            Filter logs by action, user, date range, and search terms
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Action Filter */}
                            <div>
                                <Label htmlFor="action-filter">Action</Label>
                                <Select 
                                    value={localFilters.action || 'all'} 
                                    onValueChange={(value) => handleFilterChange('action', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Actions</SelectItem>
                                        {availableActions.map((action) => (
                                            <SelectItem key={action} value={action}>
                                                {action.replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* User Filter */}
                            <div>
                                <Label htmlFor="user-filter">User</Label>
                                <Select 
                                    value={localFilters.user_id || 'all'} 
                                    onValueChange={(value) => handleFilterChange('user_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id?.toString() || ''}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date From Filter */}
                            <div>
                                <Label htmlFor="date-from">Date From</Label>
                                <Input
                                    type="date"
                                    value={localFilters.date_from || ''}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                />
                            </div>

                            {/* Date To Filter */}
                            <div>
                                <Label htmlFor="date-to">Date To</Label>
                                <Input
                                    type="date"
                                    value={localFilters.date_to || ''}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Search and Actions */}
                        <div className="flex items-end gap-4 mt-4">
                            <div className="flex-1">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="search"
                                        placeholder="Search by action, entity type, IP address, or user details..."
                                        value={localFilters.search || ''}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={applyFilters} disabled={isFiltering}>
                                    {isFiltering ? 'Applying...' : 'Apply Filters'}
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear All
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {activityLogs.data.length} of {activityLogs.total} activity logs
                    </div>
                    <div className="text-sm text-gray-600">
                        Page {activityLogs.current_page} of {activityLogs.last_page}
                    </div>
                </div>

                {/* Activity Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            System Activity Logs
                        </CardTitle>
                        <CardDescription>
                            Detailed view of all system activities and user actions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activityLogs.data.length > 0 ? (
                            <div className="space-y-4">
                                {activityLogs.data.map((log) => (
                                    <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge className={getActionColor(log.action)}>
                                                        {log.action.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-sm text-gray-500">
                                                        {formatDate(log.created_at)}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-700">User</p>
                                                        <p className="text-sm">
                                                            {log.user?.name || 'System'} 
                                                            {log.user?.email && ` (${log.user.email})`}
                                                        </p>
                                                    </div>
                                                    
                                                    {log.target_user && (
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-700">Target User</p>
                                                            <p className="text-sm">
                                                                {log.target_user.name} ({log.target_user.email})
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-700">Entity</p>
                                                        <p className="text-sm">
                                                            {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                                                        </p>
                                                    </div>
                                                    
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-700">IP Address</p>
                                                        <p className="text-sm font-mono">{log.ip_address}</p>
                                                    </div>
                                                </div>
                                                
                                                {log.details && Object.keys(log.details).length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="font-medium text-sm text-gray-700 mb-1">Details</p>
                                                        <div className="bg-gray-50 p-2 rounded text-sm">
                                                            <pre className="whitespace-pre-wrap text-xs">
                                                                {JSON.stringify(log.details, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2 ml-4">
                                                <Button variant="outline" size="sm">
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
                                <p className="text-gray-500">
                                    Try adjusting your filters or search criteria
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {activityLogs.last_page > 1 && (
                    <div className="flex items-center justify-center">
                        <nav className="flex items-center gap-2">
                            {activityLogs.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 text-sm rounded-md ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 border hover:bg-gray-50'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={(e) => !link.url && e.preventDefault()}
                                >
                                    {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
                    </div>
                </main>
            </div>
        </div>
    );
}
