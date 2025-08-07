import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

interface Adviser {
    id: number;
    name: string;
    email: string;
}

interface AcademicLevel {
    id: number;
    name: string;
    code: string;
}

interface AcademicPeriod {
    id: number;
    name: string;
}



interface Assignment {
    id: number;
    adviser?: Adviser;
    academicLevel?: AcademicLevel;
    academicPeriod?: AcademicPeriod;
    year_level?: string;
    section?: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    assignments: Assignment[];
    advisers: Adviser[];
    academicLevels: AcademicLevel[];
}

const AdviserAssignments: React.FC<Props> = ({ 
    assignments = [], 
    advisers = [], 
    academicLevels = []
}) => {


    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<AcademicLevel | null>(null);
    const [filteredPeriods, setFilteredPeriods] = useState<AcademicPeriod[]>([]);
    const [loadingPeriods, setLoadingPeriods] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        adviser_id: '',
        academic_level_id: '',
        academic_period_id: '',
        section: '',
        year_level: '',
        is_active: true as boolean,
    });



    // Fetch periods by academic level
    const fetchPeriodsByLevel = async (levelId: string) => {
        if (!levelId) {
            setFilteredPeriods([]);
            return;
        }

        setLoadingPeriods(true);
        try {
            const response = await fetch(`/admin/api/periods-by-level?academic_level_id=${levelId}`);
            if (response.ok) {
                const periods = await response.json();
                setFilteredPeriods(periods);
            } else {
                setFilteredPeriods([]);
            }
        } catch (error) {
            console.error('Error fetching periods:', error);
            setFilteredPeriods([]);
        } finally {
            setLoadingPeriods(false);
        }
    };

    const handleLevelChange = (levelId: string) => {
        const level = academicLevels.find(l => l.id.toString() === levelId);
        setSelectedLevel(level || null);
        setData('academic_level_id', levelId);
        setData('academic_period_id', ''); // Clear selected period
        


        // Fetch periods for the selected level
        fetchPeriodsByLevel(levelId);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingAssignment) {
            put(`/admin/assignments/advisers/${editingAssignment.id}`, {
                onSuccess: () => {
                    setEditingAssignment(null);
                    setShowCreateModal(false);
                    reset();
                    setSelectedLevel(null);
                }
            });
        } else {
            post('/admin/assignments/advisers', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                    setSelectedLevel(null);
                }
            });
        }
    };

    const handleEdit = (assignment: Assignment) => {
        setData({
            adviser_id: assignment.adviser?.id.toString() || '',
            academic_level_id: assignment.academicLevel?.id.toString() || '',
            academic_period_id: assignment.academicPeriod?.id.toString() || '',
            section: assignment.section || '',
            year_level: assignment.year_level || '',
            is_active: assignment.is_active,
        });
        setEditingAssignment(assignment);
        setShowCreateModal(true);
        setSelectedLevel(assignment.academicLevel || null);
        
        // Fetch periods for the selected level when editing
        if (assignment.academicLevel?.id) {
            fetchPeriodsByLevel(assignment.academicLevel.id.toString());
        }
    };

    const handleDelete = (assignment: Assignment) => {
        if (confirm('Are you sure you want to remove this class adviser assignment?')) {
            router.delete(`/admin/assignments/advisers/${assignment.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingAssignment(null);
        reset();
        setSelectedLevel(null);
        setFilteredPeriods([]);
    };

    const getYearLevelOptions = (levelCode: string) => {
        switch (levelCode) {
            case 'ELEM':
                return [
                    { value: 'Grade 1', label: 'Grade 1' },
                    { value: 'Grade 2', label: 'Grade 2' },
                    { value: 'Grade 3', label: 'Grade 3' },
                    { value: 'Grade 4', label: 'Grade 4' },
                    { value: 'Grade 5', label: 'Grade 5' },
                    { value: 'Grade 6', label: 'Grade 6' },
                ];
            case 'JHS':
                return [
                    { value: 'Grade 7', label: 'Grade 7' },
                    { value: 'Grade 8', label: 'Grade 8' },
                    { value: 'Grade 9', label: 'Grade 9' },
                    { value: 'Grade 10', label: 'Grade 10' },
                ];
            case 'SHS':
                return [
                    { value: 'Grade 11', label: 'Grade 11' },
                    { value: 'Grade 12', label: 'Grade 12' },
                ];
            default:
                return [];
        }
    };

    return (
        <>
            <Head title="Class Adviser Assignments - Admin" />
            <AdminLayout>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Class Adviser Assignments</h1>
                                <p className="text-gray-600 mt-2">Manage class adviser assignments for different academic levels.</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                ✏️ Assign Class Adviser
                            </button>
                        </div>
                    </div>



                    {/* Assignments Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Current Assignments</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Class Adviser
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Academic Level
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Year Level
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Section
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Academic Period
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {assignments.map((assignment) => (
                                        <tr key={assignment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {assignment.adviser?.name || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {assignment.adviser?.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {assignment.academicLevel?.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {assignment.year_level || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {assignment.section || 'N/A'}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {assignment.academicPeriod?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    assignment.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {assignment.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(assignment)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(assignment)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Create/Edit Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                <h2 className="text-lg font-semibold mb-4">
                                    {editingAssignment ? 'Edit Class Adviser Assignment' : 'Assign Class Adviser'}
                                </h2>
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Class Adviser
                                            </label>
                                            <select
                                                value={data.adviser_id}
                                                onChange={(e) => setData('adviser_id', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Class Adviser</option>
                                                {advisers.map((adviser) => (
                                                    <option key={adviser.id} value={adviser.id}>
                                                        {adviser.name} ({adviser.email})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.adviser_id && (
                                                <p className="text-red-500 text-sm mt-1">{errors.adviser_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Academic Level
                                            </label>
                                            <select
                                                value={data.academic_level_id}
                                                onChange={(e) => handleLevelChange(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Academic Level</option>
                                                {academicLevels.map((level) => (
                                                    <option key={level.id} value={level.id}>
                                                        {level.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.academic_level_id && (
                                                <p className="text-red-500 text-sm mt-1">{errors.academic_level_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Academic Period
                                            </label>
                                            <select
                                                value={data.academic_period_id}
                                                onChange={(e) => setData('academic_period_id', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                disabled={loadingPeriods}
                                            >
                                                <option value="">
                                                    {loadingPeriods ? 'Loading periods...' : 'Select Period'}
                                                </option>
                                                {filteredPeriods.map((period) => (
                                                    <option key={period.id} value={period.id}>
                                                        {period.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.academic_period_id && (
                                                <p className="text-red-500 text-sm mt-1">{errors.academic_period_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Section (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.section}
                                                onChange={(e) => setData('section', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Section A"
                                            />
                                            {errors.section && (
                                                <p className="text-red-500 text-sm mt-1">{errors.section}</p>
                                            )}
                                        </div>



                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Year Level
                                            </label>
                                            <select
                                                value={data.year_level}
                                                onChange={(e) => setData('year_level', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Year Level</option>
                                                {selectedLevel && getYearLevelOptions(selectedLevel.code).map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.year_level && (
                                                <p className="text-red-500 text-sm mt-1">{errors.year_level}</p>
                                            )}
                                        </div>

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
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : (editingAssignment ? 'Update' : 'Assign')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
};

export default AdviserAssignments; 