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
    Users,
    User,
    Clock,
    Globe,
    Monitor,
    X,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

interface User {
    id: number;
    name?: string;
    email?: string;
    user_role?: string;
}

interface Session {
    id: string;
    user_id: number;
    ip_address: string;
    user_agent: string;
    last_activity: number;
    last_activity_formatted?: string;
    name?: string;
    email?: string;
    user_role?: string;
    last_login_at?: string;
}

interface PageProps {
    user: User;
    sessions: {
        data: Session[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    filters: {
        user_id?: string;
        search?: string;
    };
    users: User[];
    userRoles: string[];
}

export default function LoginSessions({ 
    user, 
    sessions, 
    filters, 
    users, 
    userRoles 
}: PageProps) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [isFiltering, setIsFiltering] = useState(false);
    const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

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
        
        const url = `${route('admin.security.login-sessions')}?${params.toString()}`;
        window.location.href = url;
    };

    const clearFilters = () => {
        setLocalFilters({});
        window.location.href = route('admin.security.login-sessions');
    };

    const formatLastActivity = (timestamp: number) => {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const isSessionActive = (timestamp: number) => {
        const now = Math.floor(Date.now() / 1000);
        return (now - timestamp) < 1800; // 30 minutes
    };

    const getSessionStatus = (timestamp: number) => {
        if (isSessionActive(timestamp)) {
            return { label: 'Active', variant: 'default', icon: CheckCircle };
        } else {
            return { label: 'Inactive', variant: 'secondary', icon: Clock };
        }
    };

    const getRoleColor = (role: string) => {
        const roleColors: { [key: string]: string } = {
            'admin': 'bg-red-100 text-red-800',
            'registrar': 'bg-purple-100 text-purple-800',
            'principal': 'bg-blue-100 text-blue-800',
            'chairperson': 'bg-indigo-100 text-indigo-800',
            'teacher': 'bg-green-100 text-green-800',
            'instructor': 'bg-teal-100 text-teal-800',
            'adviser': 'bg-orange-100 text-orange-800',
            'student': 'bg-gray-100 text-gray-800',
            'parent': 'bg-pink-100 text-pink-800',
        };
        return roleColors[role] || 'bg-gray-100 text-gray-800';
    };

    const handleTerminateSession = async (sessionId: string) => {
        if (!confirm('Are you sure you want to terminate this session?')) {
            return;
        }

        try {
            await fetch(route('admin.security.terminate-session', { sessionId }), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            window.location.reload();
        } catch (error) {
            console.error('Failed to terminate session:', error);
        }
    };

    const handleTerminateUserSessions = async (userId: number) => {
        if (!confirm('Are you sure you want to terminate all sessions for this user?')) {
            return;
        }

        try {
            await fetch(route('admin.security.terminate-user-sessions', { userId }), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            window.location.reload();
        } catch (error) {
            console.error('Failed to terminate user sessions:', error);
        }
    };

    const handleSelectAll = () => {
        if (selectedSessions.length === sessions.data.length) {
            setSelectedSessions([]);
        } else {
            setSelectedSessions(sessions.data.map(session => session.id));
        }
    };

    const handleBulkTerminate = async () => {
        if (selectedSessions.length === 0) return;
        
        if (!confirm(`Are you sure you want to terminate ${selectedSessions.length} selected sessions?`)) {
            return;
        }

        try {
            for (const sessionId of selectedSessions) {
                await fetch(route('admin.security.terminate-session', { sessionId }), {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });
            }
            setSelectedSessions([]);
            window.location.reload();
        } catch (error) {
            console.error('Failed to terminate sessions:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <Head title="Login Sessions - System Audit & Security" />
                    
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
                                Login Sessions
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Monitor and manage active user login sessions
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {selectedSessions.length > 0 && (
                            <Button 
                                variant="destructive" 
                                onClick={handleBulkTerminate}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Terminate Selected ({selectedSessions.length})
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filter Sessions
                        </CardTitle>
                        <CardDescription>
                            Filter sessions by user, role, and search terms
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                            {/* Search */}
                            <div className="md:col-span-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="search"
                                        placeholder="Search by user name, email, IP address, or user agent..."
                                        value={localFilters.search || ''}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="flex gap-2 mt-4">
                            <Button onClick={applyFilters} disabled={isFiltering}>
                                {isFiltering ? 'Applying...' : 'Apply Filters'}
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear All
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {sessions.data.length} of {sessions.total} sessions
                    </div>
                    <div className="text-sm text-gray-600">
                        Page {sessions.current_page} of {sessions.last_page}
                    </div>
                </div>

                {/* Sessions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Active Login Sessions
                        </CardTitle>
                        <CardDescription>
                            Monitor user sessions and manage access control
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {sessions.data.length > 0 ? (
                            <div className="space-y-4">
                                {/* Table Header */}
                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm">
                                    <div className="w-8">
                                        <input
                                            type="checkbox"
                                            checked={selectedSessions.length === sessions.data.length}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300"
                                        />
                                    </div>
                                    <div className="flex-1">User & Session Info</div>
                                    <div className="w-32">Status</div>
                                    <div className="w-32">Last Activity</div>
                                    <div className="w-32">Actions</div>
                                </div>

                                {/* Sessions List */}
                                {sessions.data.map((session) => {
                                    const status = getSessionStatus(session.last_activity);
                                    const StatusIcon = status.icon;
                                    
                                    return (
                                        <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                {/* Checkbox */}
                                                <div className="w-8">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSessions.includes(session.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedSessions(prev => [...prev, session.id]);
                                                            } else {
                                                                setSelectedSessions(prev => prev.filter(id => id !== session.id));
                                                            }
                                                        }}
                                                        className="rounded border-gray-300"
                                                    />
                                                </div>

                                                {/* User & Session Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div>
                                                            <p className="font-medium">
                                                                {session.name || 'Unknown User'}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {session.email || 'No email'}
                                                            </p>
                                                        </div>
                                                        {session.user_role && (
                                                            <Badge className={getRoleColor(session.user_role)}>
                                                                {session.user_role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="w-4 h-4 text-gray-400" />
                                                            <span className="font-mono">{session.ip_address}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Monitor className="w-4 h-4 text-gray-400" />
                                                            <span className="truncate max-w-xs">
                                                                {session.user_agent}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {session.last_login_at && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Last login: {new Date(session.last_login_at).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Status */}
                                                <div className="w-32">
                                                    <Badge variant={status.variant as any} className="flex items-center gap-1">
                                                        <StatusIcon className="w-3 h-3" />
                                                        {status.label}
                                                    </Badge>
                                                </div>

                                                {/* Last Activity */}
                                                <div className="w-32 text-sm text-gray-600">
                                                    {formatLastActivity(session.last_activity, session.last_activity_formatted)}
                                                </div>

                                                {/* Actions */}
                                                <div className="w-32 flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleTerminateSession(session.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <X className="w-4 h-4 mr-1" />
                                                        Terminate
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
                                <p className="text-gray-500">
                                    Try adjusting your filters or search criteria
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {sessions.last_page > 1 && (
                    <div className="flex items-center justify-center">
                        <nav className="flex items-center gap-2">
                            {sessions.links.map((link, index) => (
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

                {/* Security Notice */}
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-yellow-800">Security Notice</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Terminating sessions will immediately log out users from their current session. 
                                    Use this feature carefully, especially for active users. All session terminations 
                                    are logged for audit purposes.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
