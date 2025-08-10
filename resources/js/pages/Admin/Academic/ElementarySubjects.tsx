import React, { useMemo, useState, useEffect } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

interface AcademicLevel {
    id: number;
    name: string;
    code: string;
}

interface InstructorAssignment {
    id: number;
    instructor: Teacher;
    academic_period: AcademicPeriod; // Changed from academicPeriod
    section: string;
    year_level: string;
    is_active: boolean;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
    units: number;
    academic_level_id?: number;
    year_level?: number;
    is_active: boolean;
    created_at: string;
    academic_level?: AcademicLevel;
    instructor_assignments?: InstructorAssignment[]; // Changed from instructorAssignments
}

interface Teacher {
    id: number;
    name: string;
    email: string;
}

interface AcademicPeriod {
    id: number;
    name: string;
    school_year: string;
}

interface Adviser {
    id: number;
    name: string;
    email: string;
}

interface Props {
    subjects: Subject[];
    levels: AcademicLevel[];
    advisers: Adviser[]; // Use advisers for elementary
    academicPeriods: AcademicPeriod[];
}

const ElementarySubjects: React.FC<Props> = ({ subjects, levels, advisers, academicPeriods }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [gradeFilter, setGradeFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
        units: 1,
        academic_level_id: '',
        year_level: '',
        teacher_id: '',
        academic_period_id: '',
        section: '',
        is_active: true as boolean,
    });

    const [sectionOptions, setSectionOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [loadingSections, setLoadingSections] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingSubject) {
            put(`/admin/academic/subjects/${editingSubject.id}`, {
                onSuccess: () => {
                    setEditingSubject(null);
                    setShowCreateModal(false);
                    reset();
                    // Refresh the page to show updated data
                    window.location.reload();
                }
            });
        } else {
            post('/admin/academic/subjects', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                    // Refresh the page to show new data
                    window.location.reload();
                },
                onError: (errors) => {
                    console.error('Form submission errors:', errors);
                }
            });
        }
    };

    const handleEdit = (subject: Subject) => {
        // Get the first teacher assignment if it exists
        const firstAssignment = subject.instructor_assignments && subject.instructor_assignments.length > 0 
            ? subject.instructor_assignments[0] 
            : null;

        setData({
            name: subject.name,
            code: subject.code,
            description: subject.description || '',
            units: subject.units,
            academic_level_id: subject.academic_level_id?.toString() || '',
            year_level: subject.year_level?.toString() || '',
            teacher_id: firstAssignment?.instructor?.id?.toString() || '',
            academic_period_id: firstAssignment?.academic_period?.id?.toString() || '',
            section: firstAssignment?.section || '',
            is_active: subject.is_active,
        });
        setEditingSubject(subject);
        setShowCreateModal(true);
    };

    const handleDelete = (subject: Subject) => {
        if (confirm(`Are you sure you want to delete "${subject.name}"?`)) {
            router.delete(`/admin/academic/subjects/${subject.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingSubject(null);
        reset();
    };

    // Filter elementary levels and get the elementary level
    const elementaryLevels = levels.filter(level => 
        level.name.toLowerCase().includes('elementary') || level.code === 'ELEM'
    );
    
    const elementaryLevel = elementaryLevels.find(level => 
        level.name.toLowerCase().includes('elementary') || level.code === 'ELEM'
    );

    // Set elementary level as default when component loads
    useEffect(() => {
        if (elementaryLevel && !data.academic_level_id) {
            setData('academic_level_id', elementaryLevel.id.toString());
        }
    }, [elementaryLevel, data.academic_level_id, setData]);

    // Load sections dynamically for Elementary (ELEM)
    useEffect(() => {
        if (!data.year_level) {
            setSectionOptions([]);
            return;
        }
        setLoadingSections(true);
        fetch(`/admin/api/sections-by-level-year?level=ELEM&year=${encodeURIComponent(data.year_level)}`)
            .then(res => res.json())
            .then(json => setSectionOptions((json?.sections || []).map((s: any) => ({ value: s.value, label: s.label }))))
            .catch(() => setSectionOptions([]))
            .finally(() => setLoadingSections(false));
    }, [data.year_level]);

    return (
        <>
            <Head title="Elementary Subjects" />
            <AdminLayout>
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <Link
                            href="/admin/academic/subjects"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            ← Back to Subject Management
                        </Link>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🧒</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Elementary Subjects</h1>
                            <p className="text-gray-600">Manage subjects for Elementary level (Grades 1-6)</p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-2xl">📚</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                                <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Subjects</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {subjects.filter(s => s.is_active).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-2xl">📝</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Average Units</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {subjects.length > 0 
                                        ? (subjects.reduce((sum, s) => sum + s.units, 0) / subjects.length).toFixed(1)
                                        : '0.0'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-6 py-3 bg-green-600 border border-transparent rounded-lg font-semibold text-sm text-white uppercase tracking-wider hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <span className="mr-3 text-lg">➕</span>
                        Add Elementary Subject
                    </button>
                </div>

                {/* Subjects List */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Elementary Subjects</h2>
                        <div className="mt-3 flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0">
                            <input
                                type="text"
                                placeholder="Search by name, code, description, adviser"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <select
                                value={gradeFilter}
                                onChange={(e) => setGradeFilter(e.target.value)}
                                className="md:w-40 px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">All Grades</option>
                                {[1,2,3,4,5,6].map(g => (
                                    <option key={g} value={String(g)}>Grade {g}</option>
                                ))}
                            </select>
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
                    
                    {subjects.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No elementary subjects yet</h3>
                            <p className="text-gray-600 mb-6">
                                Create your first elementary subject to get started.
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-6 py-3 bg-green-600 border border-transparent rounded-lg font-semibold text-sm text-white uppercase tracking-wider hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <span className="mr-3 text-lg">➕</span>
                                Add Elementary Subject
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level & Grade</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adviser Assignment</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {useMemo(() => subjects.filter((s) => {
                                        const q = searchQuery.trim().toLowerCase();
                                        const matchesQ = !q || [s.name, s.code, s.description || '', s.instructor_assignments?.[0]?.instructor?.name || '']
                                            .some(v => (v || '').toLowerCase().includes(q));
                                        const matchesGrade = !gradeFilter || String(s.year_level || '') === gradeFilter;
                                        const matchesStatus = !statusFilter || (statusFilter === 'active' ? s.is_active : !s.is_active);
                                        return matchesQ && matchesGrade && matchesStatus;
                                    }), [subjects, searchQuery, gradeFilter, statusFilter]).map((subject) => (
                                        <tr key={subject.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {subject.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{subject.units}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{subject.academic_level?.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {subject.year_level && `Grade ${subject.year_level}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {subject.instructor_assignments && subject.instructor_assignments.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {subject.instructor_assignments.map((assignment, index) => (
                                                            <div key={assignment.id} className="text-sm">
                                                                <div className="font-medium text-gray-900">
                                                                    {assignment.instructor.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {assignment.academic_period.name} • {assignment.section}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400 italic">
                                                        No adviser assigned
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="text-sm text-gray-900 truncate">
                                                    {subject.description || 'No description'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    subject.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {subject.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(subject)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(subject)}
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
                        <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {editingSubject ? 'Edit Elementary Subject' : 'Add Elementary Subject'}
                                </h3>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            placeholder="e.g., Mathematics, English, Science"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject Code
                                        </label>
                                        <input
                                            type="text"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            placeholder="e.g., MATH101, ENG101"
                                            required
                                        />
                                        {errors.code && (
                                            <p className="text-red-600 text-sm mt-1">{errors.code}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Academic Level
                                        </label>
                                        <input
                                            type="text"
                                            value="Elementary"
                                            disabled
                                            className="w-full rounded-md border-gray-300 bg-gray-100 text-gray-600 shadow-sm cursor-not-allowed"
                                        />
                                        <input
                                            type="hidden"
                                            name="academic_level_id"
                                            value={data.academic_level_id}
                                        />
                                        {errors.academic_level_id && (
                                            <p className="text-red-600 text-sm mt-1">{errors.academic_level_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Grade Level
                                        </label>
                                        <select
                                            value={data.year_level}
                                            onChange={(e) => setData('year_level', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            required
                                        >
                                            <option value="">Select Grade Level</option>
                                            <option value="1">Grade 1</option>
                                            <option value="2">Grade 2</option>
                                            <option value="3">Grade 3</option>
                                            <option value="4">Grade 4</option>
                                            <option value="5">Grade 5</option>
                                            <option value="6">Grade 6</option>
                                        </select>
                                        {errors.year_level && (
                                            <p className="text-red-600 text-sm mt-1">{errors.year_level}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Units
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={data.units}
                                            onChange={(e) => setData('units', parseInt(e.target.value))}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            required
                                        />
                                        {errors.units && (
                                            <p className="text-red-600 text-sm mt-1">{errors.units}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            rows={3}
                                            placeholder="Brief description of the subject"
                                        />
                                        {errors.description && (
                                            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                            Active
                                        </label>
                                    </div>

                                    {/* Teacher Assignment Section */}
                                    <div className="border-t pt-4 mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Teacher Assignment</h4>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Assign Adviser *
                                                </label>
                                                <select
                                                    value={data.teacher_id}
                                                    onChange={(e) => setData('teacher_id', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                    required
                                                >
                                                    <option value="">Select Adviser</option>
                                                    {advisers.map((adviser) => (
                                                        <option key={adviser.id} value={adviser.id}>
                                                            {adviser.name} ({adviser.email})
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.teacher_id && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.teacher_id}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Academic Period *
                                                </label>
                                                <select
                                                    value={data.academic_period_id}
                                                    onChange={(e) => setData('academic_period_id', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                    required
                                                >
                                                    <option value="">Select Period</option>
                                                    {academicPeriods.map((period) => (
                                                        <option key={period.id} value={period.id}>
                                                            {period.name} ({period.school_year})
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.academic_period_id && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.academic_period_id}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Section *
                                                </label>
                                                <select
                                                    value={data.section}
                                                    onChange={(e) => setData('section', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                    required
                                                    disabled={loadingSections || !sectionOptions.length}
                                                >
                                                    <option value="">{loadingSections ? 'Loading sections...' : 'Select Section'}</option>
                                                    {sectionOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                                {errors.section && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.section}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
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
                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : (editingSubject ? 'Update' : 'Create')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </>
    );
};

export default ElementarySubjects;