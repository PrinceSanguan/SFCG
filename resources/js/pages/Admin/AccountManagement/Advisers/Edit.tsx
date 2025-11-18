import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { FormEvent, useState } from 'react';
import PasswordResetModal from '@/components/admin/PasswordResetModal';

interface UserData {
    id: number;
    name: string;
    email: string;
    user_role: string;
    created_at: string;
    last_login_at?: string;
}

interface EditProps {
    user: UserData; // Current admin user
    targetUser: UserData; // User being edited
    roles: Record<string, string>;
    errors?: Record<string, string>;
}

export default function EditAdviser({ user, targetUser, roles, errors }: EditProps) {
    const { data, setData, put, processing } = useForm({
        name: targetUser?.name || '',
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { errors: pageErrors } = usePage().props;

    // Safety check for user data
    if (!user || !targetUser) {
        return <div>Loading...</div>;
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route('admin.advisers.update', targetUser.id));
    };

    const handleResetPassword = () => {
        setShowPasswordModal(true);
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'default';
            case 'registrar':
            case 'teacher':
            case 'instructor':
            case 'adviser':
            case 'chairperson':
            case 'principal':
                return 'secondary';
            case 'student':
            case 'parent':
                return 'outline';
            default:
                return 'outline';
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <Link href={route('admin.advisers.index')}>
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Advisers
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Adviser</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Update adviser information and role assignments.
                                </p>
                            </div>
                        </div>

                        {/* Current User Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Current User Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                                        <p className="text-lg">{targetUser.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                                        <p className="text-lg">{targetUser.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Role</p>
                                        <Badge variant={getRoleBadgeVariant(targetUser.user_role)} className="mt-1">
                                            {roles[targetUser.user_role] || targetUser.user_role}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</p>
                                        <p className="text-lg">{new Date(targetUser.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Edit Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Update User Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Enter full name"
                                                required
                                            />
                                            {errors?.name && (
                                                <Alert variant="destructive">
                                                    <AlertDescription>{errors.name}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>

                                        {/* Email - Read Only */}
                                        <div className="space-y-2">
                                            <Label>Email Address</Label>
                                            <div className="p-3 bg-gray-50 rounded border dark:bg-gray-800">
                                                {targetUser.email}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Email addresses cannot be changed for security reasons.
                                            </p>
                                        </div>

                                        {/* Role - Read Only */}
                                        <div className="space-y-2">
                                            <Label>User Role</Label>
                                            <div className="p-3 bg-gray-50 rounded border dark:bg-gray-800 flex items-center gap-2">
                                                <Badge variant={getRoleBadgeVariant(targetUser.user_role)}>
                                                    {roles[targetUser.user_role] || targetUser.user_role}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                User roles cannot be changed after account creation.
                                            </p>
                                        </div>

                                        {/* Last Login Info */}
                                        <div className="space-y-2">
                                            <Label>Last Login</Label>
                                            <div className="p-3 bg-gray-50 rounded border dark:bg-gray-800">
                                                {targetUser.last_login_at 
                                                    ? new Date(targetUser.last_login_at).toLocaleString()
                                                    : 'Never logged in'
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="flex items-center gap-4 pt-6">
                                        <Button type="submit" disabled={processing} className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            {processing ? 'Updating...' : 'Update User'}
                                        </Button>
                                        <Link href={route('admin.advisers.index')}>
                                            <Button type="button" variant="outline">
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Password Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Password Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Reset the user's password to allow them to regain access to their account. 
                                        A new temporary password will be generated.
                                    </p>
                                    <Button 
                                        onClick={handleResetPassword}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Change Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <Link href={route('admin.advisers.show', targetUser.id)}>
                                        <Button variant="outline">
                                            View Full Profile
                                        </Button>
                                    </Link>
                                    
                                    {/* Prevent self-deletion */}
                                    {targetUser.id !== user.id && (
                                        <Button 
                                            variant="destructive"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                                                    router.delete(route('admin.advisers.destroy', targetUser.id), {
                                                        onSuccess: () => {
                                                            // Redirect to advisers list after successful deletion
                                                            router.visit(route('admin.advisers.index'));
                                                        },
                                                        onError: (errors) => {
                                                            console.error('Delete failed:', errors);
                                                        }
                                                    });
                                                }
                                            }}
                                        >
                                            Delete User
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Password Reset Modal */}
            <PasswordResetModal
                user={targetUser}
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                errors={pageErrors as Record<string, string>}
            />
        </div>
    );
}
