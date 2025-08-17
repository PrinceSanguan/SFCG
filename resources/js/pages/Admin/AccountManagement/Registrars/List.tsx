import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Sidebar } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Eye,
    Filter,
    UserPlus,
    GraduationCap,
    Building2
} from 'lucide-react';


interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    user: User;
    filters: {
        search?: string;
        sort_by?: string;
        sort_direction?: string;
    };
}

export default function RegistrarsList({ users, user, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filterRole, setFilterRole] = useState('all');

    const filteredRegistrars = users.data.filter(registrar => {
        const matchesSearch = registrar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            registrar.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || registrar.user_role === filterRole;
        return matchesSearch && matchesRole;
    });

    const handleDelete = (userId: number) => {
        console.log('Delete requested for user ID:', userId);
        
        if (confirm('Are you sure you want to delete this registrar?')) {
            console.log('Delete confirmed, sending request...');
            
            router.delete(`/admin/registrars/${userId}`, {
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
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'registrar':
                return 'bg-blue-100 text-blue-800';
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'teacher':
                return 'bg-green-100 text-green-800';
            case 'student':
                return 'bg-purple-100 text-purple-800';
            case 'parent':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <>
            <Head title="Registrars Management" />
            
            <div className="flex h-screen bg-gray-50">
                <Sidebar user={user} />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                        Registrars Management
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        Manage all registrar accounts in the system
                                    </p>
                                </div>
                                <Link href="/admin/registrars/create">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add New Registrar
                                    </Button>
                                </Link>
                            </div>

                            {/* Filters and Search */}
                            <Card className="mb-6">
                                <CardContent className="p-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                <Input
                                                    placeholder="Search registrars by name or email..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <select
                                                value={filterRole}
                                                onChange={(e) => setFilterRole(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="all">All Roles</option>
                                                <option value="registrar">Registrar</option>
                                                <option value="admin">Admin</option>
                                                <option value="teacher">Teacher</option>
                                                <option value="student">Student</option>
                                                <option value="parent">Parent</option>
                                            </select>
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Filter
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <UserPlus className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Total Registrars</p>
                                                <p className="text-2xl font-bold text-gray-900">{users.total}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <GraduationCap className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Active Registrars</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {users.data.filter(r => r.user_role === 'registrar').length}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Building2 className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">Other Roles</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {users.data.filter(r => r.user_role !== 'registrar').length}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Registrars Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Registrars List</CardTitle>
                                    <CardDescription>
                                        A comprehensive list of all registrar accounts and their details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {filteredRegistrars.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No registrars found</h3>
                                            <p className="text-gray-500 mb-4">
                                                {searchTerm || filterRole !== 'all' 
                                                    ? 'Try adjusting your search or filter criteria.'
                                                    : 'Get started by creating your first registrar account.'
                                                }
                                            </p>
                                            {!searchTerm && filterRole === 'all' && (
                                                <Link href="/admin/registrars/create">
                                                    <Button>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add New Registrar
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="p-3 text-left">Name</th>
                                                        <th className="p-3 text-left">Email</th>
                                                        <th className="p-3 text-left">Role</th>
                                                        <th className="p-3 text-left">Created</th>
                                                        <th className="p-3 text-left">Updated</th>
                                                        <th className="p-3 text-left">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredRegistrars.map((registrar) => (
                                                        <tr key={registrar.id} className="border-b hover:bg-gray-50">
                                                            <td className="p-3 font-medium">
                                                                <div className="flex items-center">
                                                                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                                        <span className="text-sm font-medium text-blue-600">
                                                                            {registrar.name.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                    {registrar.name}
                                                                </div>
                                                            </td>
                                                            <td className="p-3">{registrar.email}</td>
                                                            <td className="p-3">
                                                                <Badge className={getRoleBadgeColor(registrar.user_role)}>
                                                                    {registrar.user_role}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-3">{formatDate(registrar.created_at)}</td>
                                                            <td className="p-3">{formatDate(registrar.updated_at)}</td>
                                                            <td className="p-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Link href={`/admin/registrars/${registrar.id}`}>
                                                                        <Button variant="ghost" size="sm">
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                    <Link href={`/admin/registrars/${registrar.id}/edit`}>
                                                                        <Button variant="ghost" size="sm">
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                    {registrar.id !== user.id && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleDelete(registrar.id)}
                                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
