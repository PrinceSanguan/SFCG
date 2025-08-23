import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link, useForm } from '@inertiajs/react';
import { Search, Users, Eye, Edit, Trash2, Key } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    year_level?: string;
    created_at: string;
}

interface UsersIndexProps {
    user: any;
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: any;
    roles: any;
    currentRole?: string;
    yearLevel?: string;
}

export default function UsersIndex({ user, users, filters, roles, currentRole, yearLevel }: UsersIndexProps) {
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
    const { delete: deleteUser, post: resetPassword } = useForm();

    const handleDelete = (userItem: User) => {
        setUserToDelete(userItem);
    };

    const handleResetPassword = (userItem: User) => {
        setUserToResetPassword(userItem);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            let deleteRoute;
            
            // Determine the correct delete route based on current role
            if (currentRole && currentRole !== 'student') {
                // For role-specific routes (administrators, teachers, etc.)
                deleteRoute = route(`registrar.${currentRole}s.destroy`, userToDelete.id);
            } else if (yearLevel) {
                // For year-level specific student routes
                deleteRoute = route('registrar.students.destroy', userToDelete.id);
            } else {
                // For general users route
                deleteRoute = route('registrar.users.destroy', userToDelete.id);
            }
            
            deleteUser(deleteRoute, {
                onSuccess: () => {
                    setUserToDelete(null);
                },
            });
        }
    };

    const confirmResetPassword = () => {
        if (userToResetPassword) {
            let resetRoute;
            
            // Determine the correct reset password route based on current role
            if (currentRole && currentRole !== 'student') {
                // For role-specific routes (administrators, teachers, etc.)
                resetRoute = route(`registrar.${currentRole}s.reset-password`, userToResetPassword.id);
            } else if (yearLevel) {
                // For year-level specific student routes
                resetRoute = route('registrar.students.reset-password', userToResetPassword.id);
            } else {
                // For general users route
                resetRoute = route('registrar.users.reset-password', userToResetPassword.id);
            }
            
            resetPassword(resetRoute, {
                onSuccess: () => {
                    setUserToResetPassword(null);
                },
            });
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl space-y-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {yearLevel ? `${yearLevel.charAt(0).toUpperCase() + yearLevel.slice(1).replace('_', ' ')} Students` : 
                                 currentRole ? `${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Management` : 'User Management'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                {yearLevel ? `Manage ${yearLevel.replace('_', ' ')} student accounts.` : 
                                 'Manage user accounts and permissions.'}
                            </p>
                        </div>

                        {/* Search and Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Search & Filters
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search users by name or email..."
                                            defaultValue={filters?.search || ''}
                                        />
                                    </div>
                                    <Button>Search</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Users List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Users ({users.total})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {users.data.map((userItem) => (
                                        <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <h3 className="font-medium">{userItem.name}</h3>
                                                    <p className="text-sm text-gray-500">{userItem.email}</p>
                                                    {userItem.year_level && (
                                                        <p className="text-xs text-gray-400 capitalize">
                                                            {userItem.year_level.replace('_', ' ')}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge variant="secondary">{userItem.user_role}</Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={route('registrar.users.show', userItem.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                </Link>
                                                <Link href={route('registrar.users.edit', userItem.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleResetPassword(userItem)}
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Key className="h-4 w-4 mr-2" />
                                                    Reset Password
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleDelete(userItem)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {users.data.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">No users found.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                {users.last_page > 1 && (
                                    <div className="flex justify-center mt-6">
                                        <div className="flex gap-2">
                                            {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={page === users.current_page ? 'default' : 'outline'}
                                                    size="sm"
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Delete Confirmation Dialog */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete <strong>{userToDelete.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setUserToDelete(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
                            >
                                Delete User
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Reset Confirmation Dialog */}
            {userToResetPassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Confirm Password Reset
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to reset the password for <strong>{userToResetPassword.name}</strong>? 
                            A new random password will be generated and sent to their email.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setUserToResetPassword(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="default"
                                onClick={confirmResetPassword}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Reset Password
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
