import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    Eye, 
    Shield, 
    Calendar, 
    Mail, 
    Phone, 
    User,
    GraduationCap,
    Activity,
    Clock,
    EyeOff,
    Save
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AppHeader } from '@/components/app-header';
import { Sidebar } from '@/components/admin/sidebar';

interface ActivityLog {
    id: number;
    action: string;
    details: any;
    ip_address: string;
    user_agent: string;
    created_at: string;
    user?: {
        name: string;
        email: string;
    };
    targetUser?: {
        name: string;
        email: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    created_at: string;
    last_login_at: string | null;
}

interface PageProps {
    user: any;
    targetUser: User;
    activityLogs: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    role: string;
    roleDisplayName: string;
}

export default function StudentsView({ user, targetUser, activityLogs, role, roleDisplayName }: PageProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [passwordResetOpen, setPasswordResetOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleDelete = () => {
        router.delete(route('admin.students.destroy', targetUser.id), {
            onSuccess: () => {
                setDeleteDialogOpen(false);
            },
        });
    };

    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.students.reset-password', targetUser.id), {
            onSuccess: () => {
                setPasswordResetOpen(false);
                setData({ password: '', password_confirmation: '' });
            },
        });
    };

    const getActionIcon = (action: string) => {
        const icons: { [key: string]: any } = {
            'created_user': <User size={16} />,
            'updated_user': <Edit size={16} />,
            'deleted_user': <Trash2 size={16} />,
            'reset_password': <Shield size={16} />,
            'login': <Eye size={16} />,
            'logout': <EyeOff size={16} />,
        };
        return icons[action] || <Activity size={16} />;
    };

    const getActionColor = (action: string) => {
        const colors: { [key: string]: string } = {
            'created_user': 'text-green-600 bg-green-100 dark:bg-green-900/20',
            'updated_user': 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
            'deleted_user': 'text-red-600 bg-red-100 dark:bg-red-900/20',
            'reset_password': 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
            'login': 'text-green-600 bg-green-100 dark:bg-green-900/20',
            'logout': 'text-gray-600 bg-gray-100 dark:bg-gray-800',
        };
        return colors[action] || 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <>
            <Head title={`${roleDisplayName} Details - ${targetUser.name}`} />
            
            <AppShell>
                <AppHeader user={user} />
                <Sidebar user={user} />
                
                <div className="flex-1 p-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.visit(route('admin.students.index'))}
                            >
                                <ArrowLeft size={20} />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {targetUser.name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    {roleDisplayName} Account Details
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* User Information */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                <GraduationCap size={24} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl">{targetUser.name}</CardTitle>
                                                <CardDescription>
                                                    {roleDisplayName} Account
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={route('admin.students.edit', targetUser.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Edit size={16} className="mr-2" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => setPasswordResetOpen(true)}
                                            >
                                                <Shield size={16} className="mr-2" />
                                                Reset Password
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <Mail size={16} />
                                                <span className="font-medium">Email:</span>
                                                <span>{targetUser.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <User size={16} />
                                                <span className="font-medium">Role:</span>
                                                <Badge variant="default">{targetUser.user_role}</Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <Calendar size={16} />
                                                <span className="font-medium">Joined:</span>
                                                <span>{formatDate(targetUser.created_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <Clock size={16} />
                                                <span className="font-medium">Last Login:</span>
                                                <span>{formatDate(targetUser.last_login_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Activity Logs */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity size={20} />
                                        Recent Activity
                                    </CardTitle>
                                    <CardDescription>
                                        Track all activities related to this account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {activityLogs.data.length > 0 ? (
                                            activityLogs.data.map((log) => (
                                                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border">
                                                    <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                                                        {getActionIcon(log.action)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-sm">
                                                                {log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDateTime(log.created_at)}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {log.details && typeof log.details === 'object' ? (
                                                                <div className="space-y-1">
                                                                    {Object.entries(log.details).map(([key, value]) => (
                                                                        <div key={key} className="text-xs">
                                                                            <span className="font-medium">{key}:</span> {String(value)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span>{log.details || 'No details available'}</span>
                                                            )}
                                                        </div>
                                                        {log.ip_address && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                IP: {log.ip_address}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                                                <p>No activity logs found for this account.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    {activityLogs.last_page > 1 && (
                                        <div className="flex justify-center mt-6">
                                            <div className="flex gap-2">
                                                {activityLogs.links.map((link: any, index: number) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                                            link.active
                                                                ? 'bg-blue-600 text-white'
                                                                : link.url
                                                                ? 'bg-white text-gray-700 hover:bg-gray-50 border'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Link href={route('admin.students.edit', targetUser.id)} className="w-full">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Edit size={16} className="mr-2" />
                                            Edit Student
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start"
                                        onClick={() => setPasswordResetOpen(true)}
                                    >
                                        <Shield size={16} className="mr-2" />
                                        Reset Password
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        className="w-full justify-start"
                                        onClick={() => setDeleteDialogOpen(true)}
                                    >
                                        <Trash2 size={16} className="mr-2" />
                                        Delete Student
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Account Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                        <Badge variant="default">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Email Verified</span>
                                        <Badge variant="outline">Not Verified</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Last Activity</span>
                                        <span className="text-sm text-gray-900 dark:text-gray-100">
                                            {formatDate(targetUser.last_login_at)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </AppShell>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Student</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {targetUser.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Password Reset Dialog */}
            <Dialog open={passwordResetOpen} onOpenChange={setPasswordResetOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Set a new password for {targetUser.name}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter new password"
                                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                            </div>
                            {errors.password && <InputError message={errors.password} />}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm new password"
                                    className={errors.password_confirmation ? 'border-red-500 pr-10' : 'pr-10'}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                            </div>
                            {errors.password_confirmation && <InputError message={errors.password_confirmation} />}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setPasswordResetOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Resetting...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Save size={16} />
                                        Reset Password
                                    </div>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
