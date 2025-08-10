import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';

interface StudentProfile {
    id: number;
    student_id: string;
    first_name: string;
    last_name: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
    student_profile?: StudentProfile;
}

interface Parent {
    id: number;
    name: string;
    email: string;
    created_at: string;
    linked_students?: Array<{
        id: number;
        name: string;
        student_profile?: StudentProfile;
        pivot: {
            relationship: string;
        };
    }>;
}

interface Props {
    parents: Parent[];
    students: Student[];
    relationshipTypes: Record<string, string>;
}

const Parents: React.FC<Props> = ({ parents, students, relationshipTypes }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingParent, setEditingParent] = useState<Parent | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        student_ids: [] as string[],
        relationships: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingParent) {
            put(`/admin/users/parents/${editingParent.id}`, {
                onSuccess: () => {
                    setEditingParent(null);
                    reset();
                }
            });
        } else {
            post('/admin/users/parents', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (parent: Parent) => {
        setData('name', parent.name);
        setData('email', parent.email);
        setData('password', '');
        
        if (parent.linked_students) {
            setData('student_ids', parent.linked_students.map(s => s.id.toString()));
            setData('relationships', parent.linked_students.map(s => s.pivot.relationship));
        }
        
        setEditingParent(parent);
    };

    const handleDelete = (parent: Parent) => {
        if (confirm(`Are you sure you want to delete ${parent.name}? This action cannot be undone.`)) {
            router.delete(`/admin/users/parents/${parent.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingParent(null);
        reset();
    };

    const handleStudentChange = (index: number, studentId: string) => {
        const newStudentIds = [...data.student_ids];
        newStudentIds[index] = studentId;
        setData('student_ids', newStudentIds);
    };

    const handleRelationshipChange = (index: number, relationship: string) => {
        const newRelationships = [...data.relationships];
        newRelationships[index] = relationship;
        setData('relationships', newRelationships);
    };

    const addStudentLink = () => {
        setData('student_ids', [...data.student_ids, '']);
        setData('relationships', [...data.relationships, 'guardian']);
    };

    const removeStudentLink = (index: number) => {
        const newStudentIds = data.student_ids.filter((_, i) => i !== index);
        const newRelationships = data.relationships.filter((_, i) => i !== index);
        setData('student_ids', newStudentIds);
        setData('relationships', newRelationships);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1 p-6">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Parents</h1>
                        <p className="text-gray-600">Manage parent/guardian accounts and their linked students</p>
                    </div>

                    {/* Actions: Add + Upload CSV */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <span className="mr-2">➕</span>
                            Add Parent
                        </button>
                        <a
                            href="/admin/users/upload?type=parent"
                            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 border border-gray-300 rounded-md text-xs font-semibold uppercase tracking-widest hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <span className="mr-2">📁</span>
                            Upload CSV
                        </a>
                    </div>

                    {/* Parents List */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Parents List</h2>
                        </div>
                        
                        {parents.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No parents found. Create your first parent to get started.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Students</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {parents.map((parent) => (
                                            <tr key={parent.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                                                                <span className="text-sm font-medium text-pink-600">
                                                                    {parent.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{parent.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{parent.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {parent.linked_students && parent.linked_students.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {parent.linked_students.slice(0, 3).map((student, index) => (
                                                                <div key={index} className="text-sm text-gray-900">
                                                                    {student.student_profile?.first_name} {student.student_profile?.last_name} 
                                                                    <span className="text-xs text-gray-500 ml-1">
                                                                        ({relationshipTypes[student.pivot.relationship]})
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            {parent.linked_students.length > 3 && (
                                                                <div className="text-xs text-gray-500">
                                                                    +{parent.linked_students.length - 3} more students
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">No students linked</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(parent.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(parent)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(parent)}
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
                    {(showCreateModal || editingParent) && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                                <div className="mt-3">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingParent ? 'Edit Parent' : 'Create Parent'}
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
                                                placeholder="e.g., Mrs. Anna Garcia"
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
                                                placeholder="e.g., anna.garcia@email.com"
                                                required
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Password {editingParent && '(Leave blank to keep current)'}
                                            </label>
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter password"
                                                required={!editingParent}
                                            />
                                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                        </div>

                                        {/* Student Links */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Linked Students
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={addStudentLink}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    + Add Student
                                                </button>
                                            </div>
                                            
                                            {data.student_ids.map((studentId, index) => (
                                                <div key={index} className="flex items-center space-x-2 mb-2">
                                                    <select
                                                        value={studentId}
                                                        onChange={(e) => handleStudentChange(index, e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">Select Student</option>
                                                        {students.map((student) => (
                                                            <option key={student.id} value={student.id}>
                                                                {student.student_profile?.first_name} {student.student_profile?.last_name} 
                                                                ({student.student_profile?.student_id})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    
                                                    <select
                                                        value={data.relationships[index] || 'guardian'}
                                                        onChange={(e) => handleRelationshipChange(index, e.target.value)}
                                                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        {Object.entries(relationshipTypes).map(([value, label]) => (
                                                            <option key={value} value={value}>
                                                                {label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={() => removeStudentLink(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            {data.student_ids.length === 0 && (
                                                <p className="text-sm text-gray-500">No students linked</p>
                                            )}
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
                                                {processing ? 'Saving...' : (editingParent ? 'Update' : 'Create')}
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

export default Parents; 