import React, { useMemo, useState, useEffect } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
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
    academic_level_id: number;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
    units: number;
    academic_level_id?: number;
    academic_strand_id?: number;
    year_level?: number;
    is_active: boolean;
    created_at: string;
    academic_level?: AcademicLevel;
    academic_strand?: AcademicStrand;
}

interface Props {
    subjects: Subject[];
    levels: AcademicLevel[];
    strands: AcademicStrand[];
    levelType: 'junior' | 'senior';
}

const HighSchoolSubjects: React.FC<Props> = ({ subjects, levels, strands, levelType }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [filteredStrands, setFilteredStrands] = useState<AcademicStrand[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [gradeFilter, setGradeFilter] = useState<string>('');
    const [strandFilter, setStrandFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
        units: 1,
        academic_level_id: '',
        academic_strand_id: '',
        year_level: '',
        is_active: true as boolean,
    });

    const [sectionOptions, setSectionOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [loadingSections, setLoadingSections] = useState(false);

    const isJuniorHigh = levelType === 'junior';
    const titlePrefix = isJuniorHigh ? 'Junior High School' : 'Senior High School';
    const gradeRange = isJuniorHigh ? 'Grades 7-10' : 'Grades 11-12';
    const iconEmoji = isJuniorHigh ? '📚' : '🎓';
    const colorTheme = isJuniorHigh ? 'blue' : 'purple';

    // Filter levels for current type (memoized to avoid re-creating array each render)
    const relevantLevels = useMemo(() => {
        return levels.filter(level => {
            if (isJuniorHigh) {
                return level.name.toLowerCase().includes('junior') || level.code === 'JHS';
            } else {
                return level.name.toLowerCase().includes('senior') || level.code === 'SHS';
            }
        });
    }, [levels, isJuniorHigh]);

    // Get the specific level for this type
    const currentLevel = relevantLevels.find(level => {
        if (isJuniorHigh) {
            return level.name.toLowerCase().includes('junior') || level.code === 'JHS';
        } else {
            return level.name.toLowerCase().includes('senior') || level.code === 'SHS';
        }
    });

    // Set level as default when component loads
    useEffect(() => {
        if (currentLevel && !data.academic_level_id) {
            setData('academic_level_id', currentLevel.id.toString());
        }
    }, [currentLevel, data.academic_level_id, setData]);

    // Update filtered strands when academic level changes
    useEffect(() => {
        if (data.academic_level_id) {
            const levelStrands = strands.filter(strand => 
                strand.academic_level_id === parseInt(data.academic_level_id)
            );
            setFilteredStrands(levelStrands);
        } else {
            setFilteredStrands([]);
        }
    }, [data.academic_level_id, strands]);

    // Load sections dynamically based on JHS/SHS and year level
    useEffect(() => {
        if (!data.academic_level_id || !data.year_level) {
            setSectionOptions([]);
            return;
        }
        const level = relevantLevels.find(l => l.id.toString() === data.academic_level_id);
        const levelCode = level?.code || (level?.name?.toLowerCase().includes('junior') ? 'JHS' : level?.name?.toLowerCase().includes('senior') ? 'SHS' : '');
        if (!levelCode) {
            setSectionOptions([]);
            return;
        }
        setLoadingSections(true);
        fetch(`/admin/api/sections-by-level-year?level=${encodeURIComponent(levelCode)}&year=${encodeURIComponent(data.year_level)}`)
            .then(res => res.json())
            .then((json: { sections?: Array<{ value: string; label: string }> }) => setSectionOptions((json?.sections || []).map((s) => ({ value: s.value, label: s.label }))))
            .catch(() => setSectionOptions([]))
            .finally(() => setLoadingSections(false));
    }, [data.academic_level_id, data.year_level, relevantLevels]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingSubject) {
            put(`/admin/academic/subjects/${editingSubject.id}`, {
                onSuccess: () => {
                    setEditingSubject(null);
                    setShowCreateModal(false);
                    reset();
                }
            });
        } else {
            post('/admin/academic/subjects', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (subject: Subject) => {
        setData({
            name: subject.name,
            code: subject.code,
            description: subject.description || '',
            units: subject.units,
            academic_level_id: subject.academic_level_id?.toString() || '',
            academic_strand_id: subject.academic_strand_id?.toString() || '',
            year_level: subject.year_level?.toString() || '',
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
        setFilteredStrands([]);
    };

  // Derived filtered rows for table
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return subjects.filter((s) => {
      const matchesQ = !q || [s.name, s.code, s.description || '', s.academic_strand?.name || '']
        .some(v => (v || '').toLowerCase().includes(q));
      const matchesGrade = !gradeFilter || String(s.year_level || '') === gradeFilter;
      const matchesStrand = isJuniorHigh || !strandFilter || String(s.academic_strand_id || '') === strandFilter;
      const matchesStatus = !statusFilter || (statusFilter === 'active' ? s.is_active : !s.is_active);
      return matchesQ && matchesGrade && matchesStrand && matchesStatus;
    });
  }, [subjects, searchQuery, gradeFilter, strandFilter, statusFilter, isJuniorHigh]);



    return (
        <>
            <Head title={`${titlePrefix} Subjects`} />
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
                        <div className={`w-12 h-12 bg-${colorTheme}-100 rounded-lg flex items-center justify-center`}>
                            <span className="text-2xl">{iconEmoji}</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{titlePrefix} Subjects</h1>
                            <p className="text-gray-600">Manage subjects for {titlePrefix} ({gradeRange})</p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className={`p-2 bg-${colorTheme}-100 rounded-lg`}>
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
                            <div className="p-2 bg-green-100 rounded-lg">
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
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">With Strands</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {subjects.filter(s => s.academic_strand_id).length}
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
                        className={`inline-flex items-center px-6 py-3 bg-${colorTheme}-600 border border-transparent rounded-lg font-semibold text-sm text-white uppercase tracking-wider hover:bg-${colorTheme}-700 focus:bg-${colorTheme}-700 active:bg-${colorTheme}-900 focus:outline-none focus:ring-2 focus:ring-${colorTheme}-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-lg hover:shadow-xl transform hover:scale-105`}
                    >
                        <span className="mr-3 text-lg">➕</span>
                        Add {titlePrefix} Subject
                    </button>
                </div>

                {/* Subjects List */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">{titlePrefix} Subjects</h2>
                        <div className="mt-3 flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0">
                            <input
                                type="text"
                                placeholder={`Search by name, code, description${isJuniorHigh ? '' : ', strand/track'}`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${colorTheme}-500`}
                            />
                            <select
                                value={gradeFilter}
                                onChange={(e) => setGradeFilter(e.target.value)}
                                className="md:w-40 px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">All Grades</option>
                                {(isJuniorHigh ? [7,8,9,10] : [11,12]).map(g => (
                                    <option key={g} value={String(g)}>Grade {g}</option>
                                ))}
                            </select>
                            {!isJuniorHigh && (
                                <select
                                    value={strandFilter}
                                    onChange={(e) => setStrandFilter(e.target.value)}
                                    className="md:w-56 px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">All Strands/Tracks</option>
                                    {filteredStrands.map(s => (
                                        <option key={s.id} value={String(s.id)}>{s.name}</option>
                                    ))}
                                </select>
                            )}
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
                            <div className="text-6xl mb-4">{iconEmoji}</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No {titlePrefix.toLowerCase()} subjects yet</h3>
                            <p className="text-gray-600 mb-6">
                                Create your first {titlePrefix.toLowerCase()} subject to get started.
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className={`inline-flex items-center px-6 py-3 bg-${colorTheme}-600 border border-transparent rounded-lg font-semibold text-sm text-white uppercase tracking-wider hover:bg-${colorTheme}-700 shadow-lg hover:shadow-xl transform hover:scale-105`}
                            >
                                <span className="mr-3 text-lg">➕</span>
                                Add {titlePrefix} Subject
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strand</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRows.map((subject) => (
                                        <tr key={subject.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${colorTheme}-100 text-${colorTheme}-800`}>
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
                                                <div className="text-sm text-gray-900">
                                                    {subject.academic_strand?.name || 'General'}
                                                </div>
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
                                    {editingSubject ? `Edit ${titlePrefix} Subject` : `Add ${titlePrefix} Subject`}
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
                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-${colorTheme}-500 focus:ring-${colorTheme}-500`}
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
                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-${colorTheme}-500 focus:ring-${colorTheme}-500`}
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
                                            value={titlePrefix}
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
                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-${colorTheme}-500 focus:ring-${colorTheme}-500`}
                                            required
                                        >
                                            <option value="">Select Grade Level</option>
                                            {isJuniorHigh ? (
                                                <>
                                                    <option value="7">Grade 7</option>
                                                    <option value="8">Grade 8</option>
                                                    <option value="9">Grade 9</option>
                                                    <option value="10">Grade 10</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="11">Grade 11</option>
                                                    <option value="12">Grade 12</option>
                                                </>
                                            )}
                                        </select>
                                        {errors.year_level && (
                                            <p className="text-red-600 text-sm mt-1">{errors.year_level}</p>
                                        )}
                                    </div>

                                    {filteredStrands.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Academic Strand (Optional)
                                            </label>
                                            <select
                                                value={data.academic_strand_id}
                                                onChange={(e) => setData('academic_strand_id', e.target.value)}
                                                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-${colorTheme}-500 focus:ring-${colorTheme}-500`}
                                            >
                                                <option value="">General Subject</option>
                                                {filteredStrands.map((strand) => (
                                                    <option key={strand.id} value={strand.id}>
                                                        {strand.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.academic_strand_id && (
                                                <p className="text-red-600 text-sm mt-1">{errors.academic_strand_id}</p>
                                            )}
                                        </div>
                                    )}

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
                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-${colorTheme}-500 focus:ring-${colorTheme}-500`}
                                            required
                                        />
                                        {errors.units && (
                                            <p className="text-red-600 text-sm mt-1">{errors.units}</p>
                                        )}
                                    </div>

                                    {/* Section dropdown shown when creating with assignment details in other flows; kept here for consistency if needed */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Section (Optional)
                                        </label>
                                        <select
                                            value={(data as unknown as { section?: string }).section || ''}
                                            onChange={(e) => setData('section' as unknown as keyof typeof data, e.target.value)}
                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-${colorTheme}-500 focus:ring-${colorTheme}-500`}
                                            disabled={loadingSections || !sectionOptions.length}
                                        >
                                            <option value="">{loadingSections ? 'Loading sections...' : 'Select Section'}</option>
                                            {sectionOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-${colorTheme}-500 focus:ring-${colorTheme}-500`}
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
                                            className={`h-4 w-4 text-${colorTheme}-600 focus:ring-${colorTheme}-500 border-gray-300 rounded`}
                                        />
                                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                            Active
                                        </label>
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
                                            className={`px-4 py-2 text-sm font-medium text-white bg-${colorTheme}-600 rounded-md hover:bg-${colorTheme}-700 disabled:opacity-50`}
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

export default HighSchoolSubjects;