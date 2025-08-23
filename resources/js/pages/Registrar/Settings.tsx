import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface SettingsProps {
    user: User;
}

export default function RegistrarSettings({ user }: SettingsProps) {
    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);

    const profileForm = useForm({
        name: user.name,
        email: user.email,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put(route('registrar.settings.updateProfile'), {
            onSuccess: () => {
                setIsProfileEditing(false);
            },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put(route('registrar.settings.updatePassword'), {
            onSuccess: () => {
                setIsPasswordEditing(false);
                passwordForm.reset();
            },
        });
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mx-auto max-w-4xl space-y-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Manage your account settings and preferences.
                            </p>
                        </div>

                        {/* Profile Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Profile Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!isProfileEditing ? (
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-sm font-medium">Name</Label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Email</Label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                                        </div>
                                        <Button onClick={() => setIsProfileEditing(true)}>
                                            Edit Profile
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={profileForm.data.name}
                                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                                required
                                            />
                                            {profileForm.errors.name && (
                                                <p className="text-sm text-red-600">{profileForm.errors.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileForm.data.email}
                                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                                required
                                            />
                                            {profileForm.errors.email && (
                                                <p className="text-sm text-red-600">{profileForm.errors.email}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={profileForm.processing}>
                                                <Save className="mr-2 h-4 w-4" />
                                                {profileForm.processing ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsProfileEditing(false);
                                                    profileForm.reset();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>

                        <Separator />

                        {/* Password Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    Password Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!isPasswordEditing ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Update your password to keep your account secure.
                                        </p>
                                        <Button onClick={() => setIsPasswordEditing(true)}>
                                            Change Password
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current_password">Current Password</Label>
                                            <Input
                                                id="current_password"
                                                type="password"
                                                value={passwordForm.data.current_password}
                                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                required
                                            />
                                            {passwordForm.errors.current_password && (
                                                <p className="text-sm text-red-600">{passwordForm.errors.current_password}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">New Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={passwordForm.data.password}
                                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                required
                                            />
                                            {passwordForm.errors.password && (
                                                <p className="text-sm text-red-600">{passwordForm.errors.password}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={passwordForm.data.password_confirmation}
                                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                required
                                            />
                                            {passwordForm.errors.password_confirmation && (
                                                <p className="text-sm text-red-600">{passwordForm.errors.password_confirmation}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={passwordForm.processing}>
                                                <Save className="mr-2 h-4 w-4" />
                                                {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsPasswordEditing(false);
                                                    passwordForm.reset();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>

                        {/* Account Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-sm font-medium">User ID</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.id}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Role</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Registrar</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Member Since</Label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {new Date().toLocaleDateString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
