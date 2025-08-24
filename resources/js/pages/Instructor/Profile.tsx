import { Header } from '@/components/instructor/header';
import { Sidebar } from '@/components/instructor/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useForm } from '@inertiajs/react';
import { User, Lock, Save, Key } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface ProfileProps {
    user: User;
}

export default function Profile({ user }: ProfileProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
    });

    const { data: passwordData, setData: setPasswordData, put: putPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('instructor.profile.update'), {
            onSuccess: () => {
                // Profile updated successfully
            },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        putPassword(route('instructor.profile.password'), {
            onSuccess: () => {
                resetPassword();
            },
        });
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                My Profile
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Manage your personal information and account settings.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Profile Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Profile Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="role">Role</Label>
                                            <Input
                                                id="role"
                                                type="text"
                                                value={user.user_role}
                                                disabled
                                                className="bg-gray-100 dark:bg-gray-800"
                                            />
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Your role cannot be changed. Contact an administrator if needed.
                                            </p>
                                        </div>

                                        <Button type="submit" disabled={processing} className="w-full">
                                            <Save className="h-4 w-4 mr-2" />
                                            {processing ? 'Updating...' : 'Update Profile'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Change Password */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Change Password
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="current_password">Current Password</Label>
                                            <Input
                                                id="current_password"
                                                type="password"
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                className={passwordErrors.current_password ? 'border-red-500' : ''}
                                            />
                                            {passwordErrors.current_password && (
                                                <p className="text-sm text-red-500 mt-1">{passwordErrors.current_password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="password">New Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData('password', e.target.value)}
                                                className={passwordErrors.password ? 'border-red-500' : ''}
                                            />
                                            {passwordErrors.password && (
                                                <p className="text-sm text-red-500 mt-1">{passwordErrors.password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={passwordData.password_confirmation}
                                                onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                className={passwordErrors.password_confirmation ? 'border-red-500' : ''}
                                            />
                                            {passwordErrors.password_confirmation && (
                                                <p className="text-sm text-red-500 mt-1">{passwordErrors.password_confirmation}</p>
                                            )}
                                        </div>

                                        <Button type="submit" disabled={passwordProcessing} className="w-full">
                                            <Key className="h-4 w-4 mr-2" />
                                            {passwordProcessing ? 'Changing...' : 'Change Password'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Account Security */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Security</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <h3 className="font-medium">Two-Factor Authentication</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Add an extra layer of security to your account
                                            </p>
                                        </div>
                                        <Button variant="outline" disabled>
                                            Not Available
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <h3 className="font-medium">Login Sessions</h3>
                                            <p className="text-sm text-muted-foreground">
                                                View and manage your active login sessions
                                            </p>
                                        </div>
                                        <Button variant="outline" disabled>
                                            Not Available
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                                        <p className="text-sm">{user.id}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                                        <p className="text-sm">Recently</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                                        <p className="text-sm">Recently</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                        <p className="text-sm text-green-600">Active</p>
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
