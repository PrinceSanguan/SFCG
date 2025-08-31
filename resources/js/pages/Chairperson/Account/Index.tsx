import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { User, Mail, Calendar, Edit, Shield } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    created_at: string;
    last_login_at?: string;
}

interface AccountIndexProps {
    user: User;
}

export default function AccountIndex({ user }: AccountIndexProps) {
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
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Account Information</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                View and manage your account details
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Account Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</span>
                                        <span className="text-sm text-gray-900 dark:text-gray-100">{user.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</span>
                                        <span className="text-sm text-gray-900 dark:text-gray-100">{user.email}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</span>
                                        <Badge variant="secondary">{user.user_role}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</span>
                                        <span className="text-sm text-gray-900 dark:text-gray-100">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {user.last_login_at && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</span>
                                            <span className="text-sm text-gray-900 dark:text-gray-100">
                                                {new Date(user.last_login_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Account Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Account Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button asChild className="w-full">
                                        <Link href={route('chairperson.account.edit')}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Account Information
                                        </Link>
                                    </Button>
                                    
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        <p>• Update your personal information</p>
                                        <p>• Change your password</p>
                                        <p>• Manage account preferences</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Security Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Security Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Account Security</h4>
                                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            <li>• Strong password protection</li>
                                            <li>• Secure authentication</li>
                                            <li>• Role-based access control</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Data Privacy</h4>
                                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            <li>• Encrypted data storage</li>
                                            <li>• Secure data transmission</li>
                                            <li>• Privacy compliance</li>
                                        </ul>
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
