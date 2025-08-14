import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, router, usePage } from '@inertiajs/react';
import { Search, Plus, Edit, Eye, Trash2, RotateCcw, Users } from 'lucide-react';
import { useState } from 'react';
import PasswordResetModal from '@/components/admin/PasswordResetModal';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    created_at: string;
    last_login_at?: string;
    students?: User[];
    parent_relationships?: {
        id: number;
        student: User;
        relationship_type: string;
        emergency_contact: string;
        notes?: string;
    }[];
}

interface PaginatedParents {
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

interface ParentListProps {
    user: User;
    parents: PaginatedParents;
    filters: Filters;
}

export default function ParentList({ user, parents, filters }: ParentListProps) {
    // Safety check for user data
    if (!user) {
        return <div>Loading...</div>;
    }
    
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
    const { errors } = usePage().props;

    const handleSearch = () => {
        router.get(route('admin.parents.index'), {
            search: searchTerm,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (sortBy: string) => {
        const currentDirection = filters.sort_direction || 'desc';
        const newDirection = filters.sort_by === sortBy && currentDirection === 'desc' ? 'asc' : 'desc';
        
        router.get(route('admin.parents.index'), {
            ...filters,
            sort_by: sortBy,
            sort_direction: newDirection,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (parentId: number) => {
        if (confirm('Are you sure you want to delete this parent account? This action cannot be undone and will remove all parent-student relationships.')) {
            router.delete(route('admin.parents.destroy', parentId));
        }
    };

    const handleResetPassword = (targetUser: User) => {
        setResetPasswordUser(targetUser);
    };

    const getStudentsList = (parent: User) => {
        if (!parent.students || parent.students.length === 0) {
            return <span className="text-gray-500 dark:text-gray-400">No students linked</span>;
        }

        return (
            <div className="flex flex-wrap gap-1">
                {parent.students.slice(0, 2).map((student) => (
                    <Badge key={student.id} variant="outline" className="text-xs">
                        {student.name}
                    </Badge>
                ))}
                {parent.students.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                        +{parent.students.length - 2} more
                    </Badge>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Parent Management</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Manage parent accounts and their relationships with students.
                            </p>
                        </div>

                        {/* Actions Bar */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Search parents..."
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
                                    <Link href={route('admin.parents.create')}>
                                        <Button className="flex items-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add New Parent
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parents Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Parents ({parents.total} total)
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
                                                <th className="p-3 text-left">Linked Students</th>
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
                                            {parents.data.map((parent) => (
                                                <tr key={parent.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="p-3 font-medium">{parent.name}</td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">{parent.email}</td>
                                                    <td className="p-3">
                                                        {getStudentsList(parent)}
                                                    </td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                                        {new Date(parent.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                                        {parent.last_login_at 
                                                            ? new Date(parent.last_login_at).toLocaleDateString()
                                                            : 'Never'
                                                        }
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Link href={route('admin.parents.show', parent.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="h-3 w-3" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={route('admin.parents.edit', parent.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                            </Link>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => handleResetPassword(parent)}
                                                            >
                                                                <RotateCcw className="h-3 w-3" />
                                                            </Button>
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm"
                                                                onClick={() => handleDelete(parent.id)}
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
                                {parents.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Showing {parents.from} to {parents.to} of {parents.total} results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {parents.current_page > 1 && (
                                                <Link 
                                                    href={route('admin.parents.index', { ...filters, page: parents.current_page - 1 })}
                                                >
                                                    <Button variant="outline" size="sm">Previous</Button>
                                                </Link>
                                            )}
                                            
                                            <span className="text-sm">
                                                Page {parents.current_page} of {parents.last_page}
                                            </span>
                                            
                                            {parents.current_page < parents.last_page && (
                                                <Link 
                                                    href={route('admin.parents.index', { ...filters, page: parents.current_page + 1 })}
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
