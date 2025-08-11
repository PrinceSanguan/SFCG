import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import RegistrarLayout from '@/pages/Registrar/RegistrarLayout';

interface Adviser {
    id: number;
    name: string;
    email: string;
    created_at: string;
    advised_students?: Array<{
        id: number;
        student_id: string;
        first_name: string;
        last_name: string;
        academic_level?: { name: string };
        academic_strand?: { name: string };
        college_course?: { name: string };
    }>;
    instructor_assignments?: Array<{
        id: number;
        subject: { id: number; name: string; code: string };
        academic_period: { id: number; name: string; school_year: string };
        section: string;
        year_level: string;
        is_active: boolean;
    }>;
}

interface Props {
    advisers: Adviser[];
}

const Advisers: React.FC<Props> = ({ advisers }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAdviser, setEditingAdviser] = useState<Adviser | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        contact_number: '',
        department: '',
        specialization: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingAdviser) {
            put(`/registrar/users/advisers/${editingAdviser.id}`, {
                onSuccess: () => {
                    setEditingAdviser(null);
                    setShowCreateModal(false);
                    reset();
                }
            });
        } else {
            post('/registrar/users/advisers', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (adviser: Adviser) => {
        setData('name', adviser.name);
        setData('email', adviser.email);
        // keep only supported fields
        setEditingAdviser(adviser);
    };

    const handleDelete = (adviser: Adviser) => {
        if (confirm(`Are you sure you want to delete ${adviser.name}? This action cannot be undone.`)) {
            router.delete(`/registrar/users/advisers/${adviser.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingAdviser(null);
        reset();
    };

    const filteredAdvisers = advisers.filter((adviser) => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return true;
        return adviser.name.toLowerCase().includes(q) || adviser.email.toLowerCase().includes(q);
    });

    return (
        <RegistrarLayout>
            <Head title="Advisers - Registrar" />
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Advisers</h1>
                <p className="text-gray-600 mt-2">Manage class adviser accounts and information</p>
            </div>

            {/* Search and Create */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search advisers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                    <span className="mr-2">➕</span>
                    Add Adviser
                </button>
            </div>

            {/* Advisers List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Advisers List ({filteredAdvisers.length})
                    </h3>
                </div>
                
                {filteredAdvisers.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        {searchTerm ? 'No advisers found matching your search.' : 'No advisers found. Create your first adviser to get started.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Students</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Subjects</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAdvisers.map((adviser) => (
                                    <tr key={adviser.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-orange-600">{adviser.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{adviser.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{adviser.email}</div></td>
                                        <td className="px-6 py-4">
                                            {adviser.advised_students && adviser.advised_students.length > 0 ? (
                                                <div className="space-y-1">
                                                    {adviser.advised_students.slice(0, 3).map((student, index) => (
                                                        <div key={index} className="text-sm text-gray-900">
                                                            {student.first_name} {student.last_name} ({student.student_id})
                                                            {student.college_course && (<span className="text-xs text-gray-500 ml-1">- {student.college_course.name}</span>)}
                                                            {student.academic_level && (<span className="text-xs text-gray-500 ml-1">- {student.academic_level.name}</span>)}
                                                        </div>
                                                    ))}
                                                    {adviser.advised_students.length > 3 && (
                                                        <div className="text-xs text-gray-500">+{adviser.advised_students.length - 3} more students</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">No students assigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {adviser.instructor_assignments && adviser.instructor_assignments.length > 0 ? (
                                                <div className="space-y-1">
                                                    {adviser.instructor_assignments.slice(0, 3).map((assignment, index) => (
                                                        <div key={index} className="text-sm text-gray-900">
                                                            {assignment.subject.name} ({assignment.subject.code})
                                                            {assignment.academic_period && (
                                                                <span className="text-xs text-gray-500 ml-1">- {assignment.academic_period.name}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {adviser.instructor_assignments.length > 3 && (
                                                        <div className="text-xs text-gray-500">+{adviser.instructor_assignments.length - 3} more subjects</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">No subjects assigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(adviser.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleEdit(adviser)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                <button onClick={() => handleDelete(adviser)} className="text-red-600 hover:text-red-900">Delete</button>
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
            {(showCreateModal || editingAdviser) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingAdviser ? 'Edit Adviser' : 'Create Adviser'}
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
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {!editingAdviser && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required={!editingAdviser}
                                        />
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                    </div>
                                )}

                                {/* Admin-like simplified form: only name, email, password */}

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
                                        {processing ? 'Saving...' : (editingAdviser ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </RegistrarLayout>
    );
};

export default Advisers; 