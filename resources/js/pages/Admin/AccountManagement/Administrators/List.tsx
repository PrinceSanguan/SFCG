import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, router, usePage } from '@inertiajs/react';
import { Search, Plus, Edit, Eye, Trash2, RotateCcw, Crown } from 'lucide-react';
import { useState } from 'react';
import PasswordResetModal from '@/components/admin/PasswordResetModal';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    created_at: string;
    last_login_at?: string;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Filters {
    search?: string;
    sort_by?: string;
    sort_direction?: string;
}

interface AdministratorListProps {
    user: User;
    users: PaginatedUsers;
    filters: Filters;
}

export default function AdministratorList({ user, users, filters }: AdministratorListProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
    const { errors } = usePage().props;
    
    // Safety check for user data
    if (!user) {
        return <div>Loading...</div>;
    }

    const handleSearch = () => {
        router.get(route('admin.administrators.index'), {
            search: searchTerm,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (sortBy: string) => {
        const currentDirection = filters.sort_direction || 'desc';
        const newDirection = filters.sort_by === sortBy && currentDirection === 'desc' ? 'asc' : 'desc';
        
        router.get(route('admin.administrators.index'), {
            ...filters,
            sort_by: sortBy,
            sort_direction: newDirection,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (userId: number) => {
        console.log('Delete requested for user ID:', userId);
        if (confirm('Are you sure you want to delete this administrator account? This action cannot be undone.')) {
            console.log('Delete confirmed, sending request...');
            router.delete(route('admin.administrators.destroy', userId), {
                onSuccess: () => {
                    console.log('Delete successful');
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                },
                onFinish: () => {
                    console.log('Delete request finished');
                }
            });
        } else {
            console.log('Delete cancelled by user');
        }
    };

    const handleResetPassword = (targetUser: User) => {
        setResetPasswordUser(targetUser);
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Administrator Management</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Manage administrator accounts and their system access.
                            </p>
                        </div>

                        {/* Actions Bar */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Search administrators..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                className="w-64"
                                            />
                                            <Button onClick={handleSearch} variant="outline">
                                                <Search className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Link href={route('admin.administrators.create')}>
                                        <Button className="flex items-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add New Administrator
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Administrators Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Administrators ({users.total} total)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th 
                                                    className="cursor-pointer p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    onClick={() => handleSort('name')}
                                                >
                                                    Name
                                                    {filters.sort_by === 'name' && (
                                                        <span className="ml-1">
                                                            {filters.sort_direction === 'desc' ? '↓' : '↑'}
                                                        </span>
                                                    )}
                                                </th>
                                                <th 
                                                    className="cursor-pointer p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    onClick={() => handleSort('email')}
                                                >
                                                    Email
                                                    {filters.sort_by === 'email' && (
                                                        <span className="ml-1">
                                                            {filters.sort_direction === 'desc' ? '↓' : '↑'}
                                                        </span>
                                                    )}
                                                </th>
                                                <th className="p-3 text-left">Role</th>
                                                <th 
                                                    className="cursor-pointer p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    onClick={() => handleSort('created_at')}
                                                >
                                                    Created
                                                    {filters.sort_by === 'created_at' && (
                                                        <span className="ml-1">
                                                            {filters.sort_direction === 'desc' ? '↓' : '↑'}
                                                        </span>
                                                    )}
                                                </th>
                                                <th className="p-3 text-left">Last Login</th>
                                                <th className="p-3 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.data.map((administrator) => (
                                                <tr key={administrator.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="p-3 font-medium">{administrator.name}</td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">{administrator.email}</td>
                                                    <td className="p-3">
                                                        <Badge variant="default" className="flex items-center gap-1">
                                                            <Crown className="h-3 w-3" />
                                                            Administrator
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                                        {new Date(administrator.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                                        {administrator.last_login_at 
                                                            ? new Date(administrator.last_login_at).toLocaleDateString()
                                                            : 'Never'
                                                        }
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Link href={route('admin.administrators.show', administrator.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="h-3 w-3" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={route('admin.administrators.edit', administrator.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                            </Link>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => handleResetPassword(administrator)}
                                                            >
                                                                <RotateCcw className="h-3 w-3" />
                                                            </Button>
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm"
                                                                onClick={() => handleDelete(administrator.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {users.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Showing {users.from} to {users.to} of {users.total} results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {users.current_page > 1 && (
                                                <Link 
                                                    href={route('admin.administrators.index', { ...filters, page: users.current_page - 1 })}
                                                >
                                                    <Button variant="outline" size="sm">Previous</Button>
                                                </Link>
                                            )}
                                            
                                            <span className="text-sm">
                                                Page {users.current_page} of {users.last_page}
                                            </span>
                                            
                                            {users.current_page < users.last_page && (
                                                <Link 
                                                    href={route('admin.administrators.index', { ...filters, page: users.current_page + 1 })}
                                                >
                                                    <Button variant="outline" size="sm">Next</Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Password Reset Modal */}
            {resetPasswordUser && (
                <PasswordResetModal
                    user={resetPasswordUser}
                    isOpen={!!resetPasswordUser}
                    onClose={() => setResetPasswordUser(null)}
                    errors={errors as Record<string, string>}
                />
            )}
        </div>
    );
}
