import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, router, usePage } from '@inertiajs/react';
import { Search, Plus, Edit, Eye, Trash2, RotateCcw, Upload, Download } from 'lucide-react';
import { useRef, useState } from 'react';
import PasswordResetModal from '@/components/admin/PasswordResetModal';
import { useToast } from '@/components/ui/toast';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    student_number?: string;
    created_at: string;
    last_login_at?: string;
    parents?: Array<{ id: number; name: string; email: string; pivot?: { relationship_type?: string } }>;
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
    year_level?: string;
}

interface ListProps {
    user: User;
    users: PaginatedUsers;
    filters: Filters;
    roles: Record<string, string>;
}

export default function StudentsList({ user, users, filters, roles }: ListProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
    const { errors } = usePage().props;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { addToast } = useToast();

    // Safety check for user data
    if (!user) {
        return <div>Loading...</div>;
    }

    const handleSearch = () => {
        router.get(route('admin.students.index'), {
            search: searchTerm,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (sortBy: string) => {
        const currentDirection = filters.sort_direction || 'desc';
        const newDirection = filters.sort_by === sortBy && currentDirection === 'desc' ? 'asc' : 'desc';
        
        router.get(route('admin.students.index'), {
            ...filters,
            sort_by: sortBy,
            sort_direction: newDirection,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (userId: number) => {
        if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            router.delete(route('admin.students.destroy', userId), {
                onSuccess: () => {
                    // Reload the page to show updated list
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                }
            });
        }
    };

    const handleResetPassword = (targetUser: User) => {
        setResetPasswordUser(targetUser);
    };

    const handleDownloadTemplate = () => {
        window.location.href = route('admin.students.template');
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        router.post(route('admin.students.upload'), formData, {
            forceFormData: true,
            onSuccess: () => {
                addToast('Students CSV uploaded successfully.', 'success');
                router.reload();
            },
            onError: (err) => {
                console.error('CSV upload failed:', err);
                addToast('CSV upload failed. Please check the file format.', 'error');
            },
            preserveScroll: true,
        });
        // reset value so same file can be selected again if needed
        e.target.value = '';
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
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Students Management</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Create, manage, and monitor student accounts in the school system.
                            </p>
                        </div>

                        {/* Actions Bar */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
                                    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center flex-1 min-w-0">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Search students..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                className="w-64"
                                            />
                                            <Button onClick={handleSearch} variant="outline">
                                                <Search className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {/* Year level filter removed on all Students pages */}
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-end w-full lg:w-auto">
                                        <Link href={route('admin.students.create')}>
                                            <Button className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                Add New Student
                                            </Button>
                                        </Link>
                                        <input
                                            type="file"
                                            accept=".csv,text/csv"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileSelected}
                                        />
                                        <Button variant="outline" className="flex items-center gap-2" onClick={handleUploadClick}>
                                            <Upload className="h-4 w-4" />
                                            Upload CSV
                                        </Button>
                                        <Button variant="outline" className="flex items-center gap-2" onClick={handleDownloadTemplate}>
                                            <Download className="h-4 w-4" />
                                            Download Template
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Students Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Students ({users.total} total)
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
                                                    onClick={() => handleSort('student_number')}
                                                >
                                                    Student ID
                                                    {filters.sort_by === 'student_number' && (
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
                                                <th className="p-3 text-left">Parents</th>
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
                                            {users.data.map((tableUser) => (
                                                <tr key={tableUser.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="p-3 font-medium">{tableUser.name}</td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">{tableUser.student_number || '—'}</td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">{tableUser.email}</td>
                                                    <td className="p-3">
                                                        <Badge variant={getRoleBadgeVariant(tableUser.user_role)}>
                                                            {roles[tableUser.user_role] || tableUser.user_role}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                                        {tableUser.parents && tableUser.parents.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {tableUser.parents.slice(0, 2).map((p) => (
                                                                    <Link key={p.id} href={route('admin.parents.show', p.id)} className="underline">
                                                                        {p.name}
                                                                    </Link>
                                                                ))}
                                                                {tableUser.parents.length > 2 && (
                                                                    <span className="text-xs text-gray-500">+{tableUser.parents.length - 2} more</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No parents linked</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                                        {new Date(tableUser.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                                        {tableUser.last_login_at 
                                                            ? new Date(tableUser.last_login_at).toLocaleDateString()
                                                            : 'Never'
                                                        }
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Link href={route('admin.students.show', tableUser.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="h-3 w-3" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={route('admin.students.edit', tableUser.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                            </Link>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => handleResetPassword(tableUser)}
                                                            >
                                                                <RotateCcw className="h-3 w-3" />
                                                            </Button>
                                                            {tableUser.id !== user.id && (
                                                                <Button 
                                                                    variant="destructive" 
                                                                    size="sm"
                                                                    onClick={() => handleDelete(tableUser.id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            )}
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
                                                    href={route('admin.students.index', { ...filters, page: users.current_page - 1 })}
                                                >
                                                    <Button variant="outline" size="sm">Previous</Button>
                                                </Link>
                                            )}
                                            
                                            <span className="text-sm">
                                                Page {users.current_page} of {users.last_page}
                                            </span>
                                            
                                            {users.current_page < users.last_page && (
                                                <Link 
                                                    href={route('admin.students.index', { ...filters, page: users.current_page + 1 })}
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
