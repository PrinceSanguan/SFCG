import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import RegistrarLayout from '@/pages/Registrar/RegistrarLayout';

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

const ParentsIndex: React.FC<Props> = ({ 
    parents = [], 
    students = [], 
    relationshipTypes = {} 
}) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingParent, setEditingParent] = useState<Parent | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<Parent | null>(null);

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
            put(`/registrar/parents/${editingParent.id}`, {
                onSuccess: () => {
                    setEditingParent(null);
                    setShowCreateModal(false);
                    reset();
                }
            });
        } else {
            post('/registrar/parents', {
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
        setShowCreateModal(true);
    };

    const handleDelete = (parent: Parent) => {
        setShowDeleteModal(parent);
    };

    const confirmDelete = () => {
        if (showDeleteModal) {
            router.delete(`/registrar/parents/${showDeleteModal.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(null);
                }
            });
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingParent(null);
        setShowDeleteModal(null);
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
        setData('relationships', [...data.relationships, '']);
    };

    const removeStudentLink = (index: number) => {
        const newStudentIds = data.student_ids.filter((_, i) => i !== index);
        const newRelationships = data.relationships.filter((_, i) => i !== index);
        setData('student_ids', newStudentIds);
        setData('relationships', newRelationships);
    };

    const getStudentName = (studentId: string) => {
        const student = students.find(s => s.id.toString() === studentId);
        return student ? student.name : 'Select Student';
    };

    return (
        <>
            <Head title="Parents - Registrar" />
            <RegistrarLayout>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Parents</h1>
                    <p className="text-gray-600 mt-2">Manage parent/guardian accounts and their linked students</p>
                </div>

                {/* Actions: Add + Upload CSV (Admin-style) */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        <span className="mr-2">➕</span>
                        Add Parent
                    </button>
                    <a
                        href="/registrar/users/upload?type=parent"
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
                    <div className="p-4">
                        <div className="max-w-md">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search by name or email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={() => { /* optional search hook; implement once API supports */ }}
                            />
                        </div>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Parent
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Linked Students
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
                                    {parents.map((parent) => (
                                        <tr key={parent.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{parent.name}</div>
                                                    <div className="text-sm text-gray-500">{parent.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{parent.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {parent.linked_students && parent.linked_students.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {parent.linked_students.map((student, index) => (
                                                                <div key={student.id} className="flex items-center space-x-2">
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                        {student.pivot.relationship}
                                                                    </span>
                                                                    <span className="text-sm text-gray-900">
                                                                        {student.name}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">No students linked</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(parent.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(parent)}
                                                        className="text-blue-600 hover:text-blue-900"
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
                {showCreateModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingParent ? 'Edit Parent' : 'Add Parent'}
                                </h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password {editingParent && '(leave blank to keep current)'}
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required={!editingParent}
                                        />
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
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
                                            <div key={index} className="flex space-x-2 mb-2">
                                                <select
                                                    value={studentId}
                                                    onChange={(e) => handleStudentChange(index, e.target.value)}
                                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                >
                                                    <option value="">Select Student</option>
                                                    {students.map((student) => (
                                                        <option key={student.id} value={student.id}>
                                                            {student.name} ({student.student_profile?.student_id})
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={data.relationships[index] || ''}
                                                    onChange={(e) => handleRelationshipChange(index, e.target.value)}
                                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                >
                                                    <option value="">Relationship</option>
                                                    {Object.entries(relationshipTypes).map(([key, value]) => (
                                                        <option key={key} value={key}>
                                                            {value}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => removeStudentLink(index)}
                                                    className="px-2 py-1 text-red-600 hover:text-red-800"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : (editingParent ? 'Update' : 'Create')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                                <p className="text-gray-600 mb-4">
                                    Are you sure you want to delete the parent "{showDeleteModal.name}"?
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowDeleteModal(null)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </RegistrarLayout>
        </>
    );
};

export default ParentsIndex; 