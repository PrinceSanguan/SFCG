import React, { useEffect, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

interface AcademicLevel {
    id: number;
    name: string;
    code: string;
}

interface AcademicStrand {
    id: number;
    name: string;
    code: string;
    description: string;
    academic_level_id: number;
    is_active: boolean;
    created_at: string;
    academic_level: AcademicLevel;
    subjects_count: number;
}

interface Props {
    strands: AcademicStrand[];
    levels: AcademicLevel[];
}

const Strands: React.FC<Props> = ({ strands, levels }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingStrand, setEditingStrand] = useState<AcademicStrand | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
        academic_level_id: '',
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingStrand) {
            put(`/admin/academic/strands/${editingStrand.id}`, {
                onSuccess: () => {
                    setEditingStrand(null);
                    reset();
                }
            });
        } else {
            post('/admin/academic/strands', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (strand: AcademicStrand) => {
        setData('name', strand.name);
        setData('code', strand.code);
        setData('description', strand.description);
        setData('academic_level_id', strand.academic_level_id.toString());
        setData('is_active', strand.is_active);
        setEditingStrand(strand);
    };

    const handleDelete = (strand: AcademicStrand) => {
        if (confirm(`Are you sure you want to delete ${strand.name}? This action cannot be undone.`)) {
            router.delete(`/admin/academic/strands/${strand.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingStrand(null);
        reset();
    };

    const filteredStrands = useMemo(() => {
        return strands.filter((s) => {
            const q = searchQuery.trim().toLowerCase();
            const matchesQ = !q || [s.name, s.code, s.description || '', s.academic_level.name].some(v => (v || '').toLowerCase().includes(q));
            const matchesLevel = !levelFilter || String(s.academic_level_id) === levelFilter;
            const matchesStatus = !statusFilter || (statusFilter === 'active' ? s.is_active : !s.is_active);
            return matchesQ && matchesLevel && matchesStatus;
        });
    }, [strands, searchQuery, levelFilter, statusFilter]);

    // Default SHS level id for creation
    const shsLevelId = useMemo(() => {
        const shs = levels.find(l => l.code === 'SHS');
        return shs ? String(shs.id) : '';
    }, [levels]);

    // Lock list to SHS – set the filter once levels are loaded
    useEffect(() => {
        if (shsLevelId) {
            setLevelFilter(shsLevelId);
        }
    }, [shsLevelId]);

    return (
        <AdminLayout>
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Academic Strands</h1>
                        <p className="text-gray-600">Configure academic strands and specializations</p>
                    </div>

                    {/* Create Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => {
                                // Preselect SHS level in the form
                                if (!editingStrand) {
                                    setData('academic_level_id', shsLevelId);
                                }
                                setShowCreateModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <span className="mr-2">➕</span>
                            Add Academic Strand
                        </button>
                    </div>

                    {/* Strands List */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Academic Strands List</h2>
                            {/* Search & Filters */}
                            <div className="mt-3 flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0">
                                <input
                                    type="text"
                                    placeholder="Search by name, code, description"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {/* Level filter locked to SHS */}
                                <input
                                    type="text"
                                    value={levels.find(l => String(l.id) === levelFilter)?.name || 'Senior High School'}
                                    disabled
                                    className="md:w-56 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                                />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="md:w-40 px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        
                        {filteredStrands.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No academic strands found. Create your first academic strand to get started.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strand</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Level</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredStrands.map((strand) => (
                                            <tr key={strand.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{strand.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {strand.code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{strand.academic_level.name}</div>
                                                    <div className="text-xs text-gray-500">{strand.academic_level.code}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{strand.description || 'No description'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        strand.is_active 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {strand.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {strand.subjects_count || 0} subjects
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(strand)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(strand)}
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
                    {(showCreateModal || editingStrand) && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingStrand ? 'Edit Academic Strand' : 'Create Academic Strand'}
                                    </h3>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Academic Level
                                            </label>
                                            {/* Lock to SHS and make unchangeable */}
                                            <input
                                                type="text"
                                                value={levels.find(l => String(l.id) === (data.academic_level_id || shsLevelId))?.name || 'Senior High School'}
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                                            />
                                            {/* Hidden value submitted with the form */}
                                            <input type="hidden" name="academic_level_id" value={data.academic_level_id || shsLevelId} />
                                            {errors.academic_level_id && <p className="text-red-500 text-xs mt-1">{errors.academic_level_id}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Strand / Track Name (SHS)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., STEM, HUMSS, ABM"
                                                required
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Code
                                            </label>
                                            <input
                                                type="text"
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., STEM, HUMSS, ABM"
                                                maxLength={10}
                                                required
                                            />
                                            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows={3}
                                                placeholder="Brief description of this academic strand"
                                            />
                                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                        </div>

                                        {editingStrand && (
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="is_active"
                                                    checked={data.is_active}
                                                    onChange={(e) => setData('is_active', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                                    Active
                                                </label>
                                            </div>
                                        )}

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
                                                {processing ? 'Saving...' : (editingStrand ? 'Update' : 'Create')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </AdminLayout>
    );
};

export default Strands; 