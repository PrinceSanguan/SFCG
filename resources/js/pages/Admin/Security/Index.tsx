import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Shield, 
    Activity, 
    Users, 
    Database, 
    Download, 
    Trash2, 
    Eye,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Power,
    PowerOff,
    LogOut
} from 'lucide-react';

interface User {
    name: string;
    email: string;
}

interface ActivityLog {
    id: number;
    action: string;
    entity_type: string;
    ip_address: string;
    created_at: string;
    user: User;
    target_user?: User;
    details: Record<string, unknown>;
}

interface SessionStats {
    total_sessions: number;
    active_sessions: number;
    unique_users: number;
    inactive_sessions: number;
}

interface SecurityStats {
    total_logins: number;
    total_failed_logins: number;
    total_unauthorized_access: number;
    total_password_resets: number;
    today_logins: number;
}

interface BackupInfo {
    total_backups: number;
    total_size_formatted: string;
    latest_backup: Record<string, unknown> | null;
    backups: Record<string, unknown>[];
}

interface PageProps {
    user: User;
    recentActivities: ActivityLog[];
    sessionStats: SessionStats;
    securityStats: SecurityStats;
    backupInfo: BackupInfo;
    maintenanceMode: boolean;
}

export default function SecurityIndex({ 
    user, 
    recentActivities, 
    sessionStats, 
    securityStats, 
    backupInfo,
    maintenanceMode
}: PageProps) {
    const [isCreatingBackup, setIsCreatingBackup] = useState(false);
    const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);
    const [isForceLogout, setIsForceLogout] = useState(false);

    const handleCreateBackup = async () => {
        setIsCreatingBackup(true);
        try {
            await fetch(route('admin.security.create-backup'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            window.location.reload();
        } catch (error) {
            console.error('Failed to create backup:', error);
        } finally {
            setIsCreatingBackup(false);
        }
    };

    const handleToggleMaintenanceMode = async () => {
        setIsTogglingMaintenance(true);
        try {
            await fetch(route('admin.security.toggle-maintenance-mode'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            window.location.reload();
        } catch (error) {
            console.error('Failed to toggle maintenance mode:', error);
        } finally {
            setIsTogglingMaintenance(false);
        }
    };

    const handleForceLogoutAllUsers = async () => {
        if (!confirm('Are you sure you want to force logout all users? This will terminate all active sessions except admin sessions.')) {
            return;
        }
        
        setIsForceLogout(true);
        try {
            await fetch(route('admin.security.force-logout-all-users'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            window.location.reload();
        } catch (error) {
            console.error('Failed to force logout users:', error);
        } finally {
            setIsForceLogout(false);
        }
    };

    const handleDownloadBackup = (filename: string) => {
        window.open(route('admin.security.download-backup', { filename }), '_blank');
    };

    const handleDeleteBackup = async (filename: string) => {
        if (!confirm(`Are you sure you want to delete backup: ${filename}?`)) {
            return;
        }

        try {
            await fetch(route('admin.security.delete-backup', { filename }), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            window.location.reload();
        } catch (error) {
            console.error('Failed to delete backup:', error);
        }
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
        };
        return actionColors[action] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <Head title="System Audit & Security" />
                    
                    <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            System Audit & Security
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Monitor system activity, manage login sessions, and perform data backups
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={route('admin.security.activity-logs')}>
                            <Button variant="outline">
                                <Activity className="w-4 h-4 mr-2" />
                                View All Logs
                            </Button>
                        </Link>
                        <Link href={route('admin.security.login-sessions')}>
                            <Button variant="outline">
                                <Users className="w-4 h-4 mr-2" />
                                Manage Sessions
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Session Statistics */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sessionStats.active_sessions}</div>
                            <p className="text-xs text-muted-foreground">
                                {sessionStats.total_sessions} total sessions
                            </p>
                        </CardContent>
                    </Card>

                    {/* Security Statistics */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Logins</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{securityStats.today_logins}</div>
                            <p className="text-xs text-muted-foreground">
                                {securityStats.total_logins} total logins
                            </p>
                        </CardContent>
                    </Card>

                    {/* Failed Logins */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{securityStats.total_failed_logins}</div>
                            <p className="text-xs text-muted-foreground">
                                {securityStats.total_unauthorized_access} unauthorized attempts
                            </p>
                        </CardContent>
                    </Card>

                    {/* Backup Information */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Database Backups</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{backupInfo.total_backups}</div>
                            <p className="text-xs text-muted-foreground">
                                {backupInfo.total_size_formatted} total size
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
                        <TabsTrigger value="system-control">System Control</TabsTrigger>
                        <TabsTrigger value="backups">Backup Management</TabsTrigger>
                        <TabsTrigger value="security">Security Status</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Session Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Session Overview
                                    </CardTitle>
                                    <CardDescription>
                                        Current login session statistics
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Total Sessions</span>
                                        <Badge variant="secondary">{sessionStats.total_sessions}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Active Sessions</span>
                                        <Badge variant="default">{sessionStats.active_sessions}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Unique Users</span>
                                        <Badge variant="outline">{sessionStats.unique_users}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Inactive Sessions</span>
                                        <Badge variant="destructive">{sessionStats.inactive_sessions}</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Security Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        Security Overview
                                    </CardTitle>
                                    <CardDescription>
                                        System security statistics
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Total Logins</span>
                                        <Badge variant="default">{securityStats.total_logins}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Failed Logins</span>
                                        <Badge variant="destructive">{securityStats.total_failed_logins}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Unauthorized Access</span>
                                        <Badge variant="destructive">{securityStats.total_unauthorized_access}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Password Resets</span>
                                        <Badge variant="outline">{securityStats.total_password_resets}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Recent Activity Tab */}
                    <TabsContent value="recent-activity" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Recent System Activity
                                </CardTitle>
                                <CardDescription>
                                    Latest system events and user actions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivities.length > 0 ? (
                                        recentActivities.map((activity) => (
                                            <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Badge className={getActionColor(activity.action)}>
                                                        {activity.action.replace('_', ' ')}
                                                    </Badge>
                                                    <div>
                                                        <p className="font-medium">
                                                            {activity.user?.name || 'System'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {activity.entity_type} • {activity.ip_address}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(activity.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No recent activity found
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* System Control Tab */}
                    <TabsContent value="system-control" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Power className="w-5 h-5" />
                                    System Control & Maintenance
                                </CardTitle>
                                <CardDescription>
                                    Control system access and perform emergency actions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Maintenance Mode Control */}
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-semibold flex items-center gap-2">
                                            {maintenanceMode ? (
                                                <Badge variant="destructive" className="flex items-center gap-1">
                                                    <PowerOff className="w-3 h-3" />
                                                    MAINTENANCE MODE ACTIVE
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    System Normal
                                                </Badge>
                                            )}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {maintenanceMode 
                                                ? "All user accounts are shut down. Only admin accounts can access the system."
                                                : "System is running normally. All users can access their accounts."
                                            }
                                        </p>
                                    </div>
                                    <Button
                                        variant={maintenanceMode ? "default" : "destructive"}
                                        onClick={handleToggleMaintenanceMode}
                                        disabled={isTogglingMaintenance}
                                        className="min-w-[140px]"
                                    >
                                        {maintenanceMode ? (
                                            <>
                                                <Power className="w-4 h-4 mr-2" />
                                                {isTogglingMaintenance ? 'Disabling...' : 'Enable System'}
                                            </>
                                        ) : (
                                            <>
                                                <PowerOff className="w-4 h-4 mr-2" />
                                                {isTogglingMaintenance ? 'Enabling...' : 'Shut Down All Accounts'}
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Force Logout All Users */}
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <LogOut className="w-4 h-4" />
                                            Force Logout All Users
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Immediately terminate all active user sessions except admin sessions.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleForceLogoutAllUsers}
                                        disabled={isForceLogout}
                                        className="min-w-[140px]"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        {isForceLogout ? 'Logging Out...' : 'Force Logout All'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Backup Management Tab */}
                    <TabsContent value="backups" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="w-5 h-5" />
                                    Database Backup Management
                                </CardTitle>
                                <CardDescription>
                                    Create, download, and manage database backups
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Create Backup */}
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-medium">Create New Backup</h3>
                                        <p className="text-sm text-gray-500">
                                            Generate a new database backup
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={handleCreateBackup} 
                                        disabled={isCreatingBackup}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isCreatingBackup ? (
                                            <>
                                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Database className="w-4 h-4 mr-2" />
                                                Create Backup
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Backup List */}
                                <div>
                                    <h3 className="font-medium mb-4">Available Backups</h3>
                                    {backupInfo.backups.length > 0 ? (
                                        <div className="space-y-3">
                                            {backupInfo.backups.map((backup, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{backup.filename}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {backup.size_formatted} • {backup.created_at}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownloadBackup(backup.filename)}
                                                        >
                                                            <Download className="w-4 h-4 mr-2" />
                                                            Download
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteBackup(backup.filename)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No backups available
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Status Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Security Alerts */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                        Security Alerts
                                    </CardTitle>
                                    <CardDescription>
                                        Recent security events and warnings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {securityStats.total_failed_logins > 0 && (
                                            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                                <span className="text-sm">
                                                    {securityStats.total_failed_logins} failed login attempts detected
                                                </span>
                                            </div>
                                        )}
                                        {securityStats.total_unauthorized_access > 0 && (
                                            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                                                <XCircle className="w-4 h-4 text-red-600" />
                                                <span className="text-sm">
                                                    {securityStats.total_unauthorized_access} unauthorized access attempts
                                                </span>
                                            </div>
                                        )}
                                        {securityStats.total_failed_logins === 0 && securityStats.total_unauthorized_access === 0 && (
                                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-green-800">
                                                    No security alerts - system is secure
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        Quick Actions
                                    </CardTitle>
                                    <CardDescription>
                                        Common security management tasks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Link href={route('admin.security.activity-logs')} className="w-full">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Activity Logs
                                        </Button>
                                    </Link>
                                    <Link href={route('admin.security.login-sessions')} className="w-full">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Users className="w-4 h-4 mr-2" />
                                            Manage Login Sessions
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start"
                                        onClick={handleCreateBackup}
                                        disabled={isCreatingBackup}
                                    >
                                        <Database className="w-4 h-4 mr-2" />
                                        {isCreatingBackup ? 'Creating Backup...' : 'Create Database Backup'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}
