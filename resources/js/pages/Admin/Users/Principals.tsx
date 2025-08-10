import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';

interface Principal {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface Props {
    principals: Principal[];
}

const Principals: React.FC<Props> = ({ principals }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPrincipal, setEditingPrincipal] = useState<Principal | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingPrincipal) {
            put(`/admin/users/principals/${editingPrincipal.id}`, {
                onSuccess: () => {
                    setEditingPrincipal(null);
                    reset();
                }
            });
        } else {
            post('/admin/users/principals', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (principal: Principal) => {
        setData('name', principal.name);
        setData('email', principal.email);
        setData('password', '');
        setEditingPrincipal(principal);
    };

    const handleDelete = (principal: Principal) => {
        if (confirm(`Are you sure you want to delete ${principal.name}? This action cannot be undone.`)) {
            router.delete(`/admin/users/principals/${principal.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingPrincipal(null);
        reset();
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Principals</h1>
                        <p className="text-gray-600">Manage school principals</p>
                    </div>

                    {/* Actions: Add + Upload CSV */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <span className="mr-2">➕</span>
                            Add Principal
                        </button>
                        <a
                            href="/admin/users/upload?type=principal"
                            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 border border-gray-300 rounded-md text-xs font-semibold uppercase tracking-widest hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <span className="mr-2">📁</span>
                            Upload CSV
                        </a>
                    </div>

                    {/* Principals List */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Principals List</h2>
                        </div>
                        
                        {principals.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No principals found. Create your first principal to get started.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {principals.map((principal) => (
                                            <tr key={principal.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                                <span className="text-sm font-medium text-red-600">
                                                                    {principal.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{principal.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{principal.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(principal.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(principal)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(principal)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Create/Edit Modal */}
                    {(showCreateModal || editingPrincipal) && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingPrincipal ? 'Edit Principal' : 'Create Principal'}
                                    </h3>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Dr. Maria Rodriguez"
                                                required
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., maria.rodriguez@school.edu"
                                                required
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Password {editingPrincipal && '(Leave blank to keep current)'}
                                            </label>
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter password"
                                                required={!editingPrincipal}
                                            />
                                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                        </div>

                                        <div className="flex justify-end space-x-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                {processing ? 'Saving...' : (editingPrincipal ? 'Update' : 'Create')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Principals; 