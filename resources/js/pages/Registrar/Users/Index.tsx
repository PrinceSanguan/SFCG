import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import RegistrarLayout from '@/pages/Registrar/RegistrarLayout';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    created_at: string;
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        role?: string;
    };
}

const UsersIndex: React.FC<Props> = ({ users, filters }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');

    const { get } = useForm();

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedRole) params.set('role', selectedRole);
        get(`/registrar/users?${params.toString()}`);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRole('');
        get('/registrar/users');
    };

    const getRoleDisplayName = (role: string) => {
        const roleNames: { [key: string]: string } = {
            'instructor': 'Instructor',
            'teacher': 'Teacher',
            'class_adviser': 'Class Adviser',
            'chairperson': 'Chairperson',
            'principal': 'Principal',
        };
        return roleNames[role] || role;
    };

    const getRoleBadgeColor = (role: string) => {
        const colors: { [key: string]: string } = {
            'instructor': 'bg-blue-100 text-blue-800',
            'teacher': 'bg-green-100 text-green-800',
            'class_adviser': 'bg-purple-100 text-purple-800',
            'chairperson': 'bg-orange-100 text-orange-800',
            'principal': 'bg-red-100 text-red-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    return (
        <RegistrarLayout>
            <Head title="Users - Registrar" />
            <div className="max-w-7xl mx-auto w-full">
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                                <p className="text-gray-600 mt-2">Manage instructor, teacher, adviser, chairperson, and principal accounts</p>
                            </div>

                            {/* Filters */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                            Search
                                        </label>
                                        <input
                                            type="text"
                                            id="search"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search by name or email..."
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                            Role
                                        </label>
                                        <select
                                            id="role"
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">All Roles</option>
                                            <option value="instructor">Instructor</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="class_adviser">Class Adviser</option>
                                            <option value="chairperson">Chairperson</option>
                                            <option value="principal">Principal</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end space-x-2">
                                        <button
                                            onClick={handleSearch}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Search
                                        </button>
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Users ({users.total})
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Created
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.data.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.user_role)}`}>
                                                            {getRoleDisplayName(user.user_role)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={`/registrar/users/${user.id}`}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                View
                                                            </Link>
                                                            <Link
                                                                href={`/registrar/users/${user.id}/edit`}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Edit
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {users.last_page > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-700">
                                                Showing {((users.current_page - 1) * users.per_page) + 1} to{' '}
                                                {Math.min(users.current_page * users.per_page, users.total)} of{' '}
                                                {users.total} results
                                            </div>
                                            <div className="flex space-x-2">
                                                {users.current_page > 1 && (
                                                    <Link
                                                        href={`/registrar/users?page=${users.current_page - 1}&search=${searchTerm}&role=${selectedRole}`}
                                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        Previous
                                                    </Link>
                                                )}
                                                {users.current_page < users.last_page && (
                                                    <Link
                                                        href={`/registrar/users?page=${users.current_page + 1}&search=${searchTerm}&role=${selectedRole}`}
                                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        Next
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
            </div>
        </RegistrarLayout>
    );
};

export default UsersIndex; 