import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, User, Mail, Lock } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface AccountEditProps {
    user: User;
}

export default function AccountEdit({ user }: AccountEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('chairperson.account.update'));
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Button asChild variant="outline" size="sm">
                                <Link href={route('chairperson.account.index')}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Account
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Edit Account Information
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Update your personal information and password
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Enter your full name"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500">{errors.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter your email address"
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-500">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Password Change */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Change Password
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">Current Password</Label>
                                        <Input
                                            id="current_password"
                                            type="password"
                                            value={data.current_password}
                                            onChange={(e) => setData('current_password', e.target.value)}
                                            placeholder="Enter your current password"
                                            className={errors.current_password ? 'border-red-500' : ''}
                                        />
                                        {errors.current_password && (
                                            <p className="text-sm text-red-500">{errors.current_password}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Required only if you want to change your password
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="new_password">New Password</Label>
                                            <Input
                                                id="new_password"
                                                type="password"
                                                value={data.new_password}
                                                onChange={(e) => setData('new_password', e.target.value)}
                                                placeholder="Enter new password"
                                                className={errors.new_password ? 'border-red-500' : ''}
                                            />
                                            {errors.new_password && (
                                                <p className="text-sm text-red-500">{errors.new_password}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new_password_confirmation">Confirm New Password</Label>
                                            <Input
                                                id="new_password_confirmation"
                                                type="password"
                                                value={data.new_password_confirmation}
                                                onChange={(e) => setData('new_password_confirmation', e.target.value)}
                                                placeholder="Confirm new password"
                                                className={errors.new_password_confirmation ? 'border-red-500' : ''}
                                            />
                                            {errors.new_password_confirmation && (
                                                <p className="text-sm text-red-500">{errors.new_password_confirmation}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        <p>Password requirements:</p>
                                        <ul className="list-disc list-inside space-y-1 mt-2">
                                            <li>At least 8 characters long</li>
                                            <li>Contains uppercase and lowercase letters</li>
                                            <li>Contains numbers and special characters</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Actions */}
                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href={route('chairperson.account.index')}>
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
