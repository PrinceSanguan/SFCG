import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

interface HonorCriterion {
    id: number;
    honor_type: string;
    minimum_grade: number;
    maximum_grade?: number;
    criteria_description: string;
    academic_level_id?: number;
    is_active: boolean;
    academicLevel?: {
        id: number;
        name: string;
        code: string;
    };
}

interface RecentHonor {
    id: number;
    honor_type: string;
    student: {
        name: string;
        studentProfile: {
            student_id: string;
            grade_level: string;
        } | null;
    } | null;
    honorCriterion: {
        honor_type: string;
    } | null;
    gpa: number;
    awarded_date: string;
}

interface AcademicPeriod {
    id: number;
    name: string;
    school_year?: string;
    academicLevel?: { id: number; name: string; code: string } | null;
}

interface AcademicLevel {
    id: number;
    name: string;
    code: string;
}

interface LevelRanking {
    level_id: number;
    level_name: string;
    total_honors: number;
    top_students: Array<{
        student_name: string;
        student_id: string;
        grade_level: string;
        honor_type: string;
        gpa: number;
        awarded_date: string;
    }>;
    honor_distribution: Record<string, number>;
    average_gpa: number;
    highest_gpa: number;
}

interface Props {
    honorCriteria: {
        data: HonorCriterion[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    recentHonors: RecentHonor[];
    stats: {
        total_honors: number;
        average_gpa: number;
        highest_gpa: number;
        by_honor_type: Record<string, number>;
        by_period: Record<string, number>;
    };
    academicPeriods: AcademicPeriod[];
    academicLevels: AcademicLevel[];
    rankingsByLevel: Record<string, LevelRanking>;
    currentPeriodId?: number;
}

const HonorsIndex: React.FC<Props> = ({ honorCriteria, recentHonors, stats, academicPeriods, academicLevels, rankingsByLevel }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCriterion, setEditingCriterion] = useState<HonorCriterion | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState('');

    // Helper function to safely format GPA values
    const formatGPA = (gpa: number | string | null | undefined): string => {
        if (typeof gpa === 'number') {
            return gpa.toFixed(2);
        }
        if (gpa && !isNaN(parseFloat(gpa.toString()))) {
            return parseFloat(gpa.toString()).toFixed(2);
        }
        return 'N/A';
    };

    // Helper function to categorize honor criteria
    const categorizeHonorCriteria = () => {
        const categorized = {
            basicEducation: [] as HonorCriterion[],
            college: [] as HonorCriterion[],
            general: [] as HonorCriterion[]
        };

        honorCriteria.data.forEach(criterion => {
            if (criterion.academicLevel) {
                const levelName = criterion.academicLevel.name.toLowerCase();
                if (levelName === 'college') {
                    categorized.college.push(criterion);
                } else {
                    categorized.basicEducation.push(criterion);
                }
            } else {
                categorized.general.push(criterion);
            }
        });

        return categorized;
    };

    const categorizedCriteria = categorizeHonorCriteria();

    // Helper function to get icon and color for each academic level
    const getLevelConfig = (levelName: string) => {
        switch (levelName) {
            case 'Elementary':
                return { icon: 'ELEM', color: 'emerald', bgColor: 'from-emerald-500 to-emerald-600' };
            case 'Junior High School':
                return { icon: 'JHS', color: 'blue', bgColor: 'from-blue-500 to-blue-600' };
            case 'Senior High School':
                return { icon: 'SHS', color: 'indigo', bgColor: 'from-indigo-500 to-indigo-600' };
            case 'College':
                return { icon: 'COL', color: 'orange', bgColor: 'from-orange-500 to-orange-600' };
            default:
                return { icon: 'GEN', color: 'gray', bgColor: 'from-gray-500 to-gray-600' };
        }
    };

    // Helper component for rendering ranking tiles
    const renderRankingTile = (levelName: string, ranking: LevelRanking) => {
        const config = getLevelConfig(levelName);
        
        return (
            <div key={levelName} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${config.bgColor} text-white font-bold text-sm`}>
                            {config.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{levelName}</h3>
                            <p className="text-sm text-gray-600">{ranking.total_honors} honor students</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Avg GPA</div>
                        <div className="text-xl font-bold text-gray-900">{formatGPA(ranking.average_gpa)}</div>
                    </div>
                </div>

                {/* Top Performers Section */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                        Top Performers
                    </h4>
                    
                    {ranking.top_students.length > 0 ? (
                        <div className="space-y-3">
                            {ranking.top_students.slice(0, 3).map((student, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                            index === 0 ? 'bg-gray-800 text-white' :
                                            index === 1 ? 'bg-gray-600 text-white' :
                                            'bg-gray-400 text-white'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{student.student_name}</div>
                                            <div className="text-xs text-gray-500">
                                                {student.student_id} • {student.grade_level}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {formatGPA(student.gpa)}
                                        </div>
                                        <div className="text-xs text-gray-600 capitalize">
                                            {student.honor_type.replace(/_/g, ' ')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg">
                            No honor students yet
                        </div>
                    )}
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">Highest GPA</div>
                        <div className="text-lg font-bold text-gray-900">{formatGPA(ranking.highest_gpa)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">Honor Types</div>
                        <div className="text-lg font-bold text-gray-900">{Object.keys(ranking.honor_distribution).length}</div>
                    </div>
                </div>

                {/* Action Button */}
                <Link
                    href={`/admin/honors/roll?level=${ranking.level_id}`}
                    className={`block w-full text-center py-3 px-4 rounded-lg font-medium text-sm bg-gradient-to-r ${config.bgColor} text-white hover:opacity-90 transition-opacity duration-200`}
                >
                    View Full {levelName} Rankings
                </Link>
            </div>
        );
    };

    // Helper component for rendering honor criteria
    const renderHonorCriterion = (criterion: HonorCriterion) => (
        <div key={criterion.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{criterion.honor_type}</h4>
                        {criterion.academicLevel && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {criterion.academicLevel.name}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{criterion.criteria_description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-gray-500">
                            Min: {criterion.minimum_grade}%
                        </span>
                        {criterion.maximum_grade && (
                            <span className="text-sm text-gray-500">
                                Max: {criterion.maximum_grade}%
                            </span>
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            criterion.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {criterion.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEdit(criterion)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(criterion)}
                        className="text-red-600 hover:text-red-800"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        honor_type: '',
        minimum_grade: '',
        maximum_grade: '',
        criteria_description: '',
        academic_level_id: '',
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingCriterion) {
            put(`/admin/honors/criteria/${editingCriterion.id}`, {
                onSuccess: () => {
                    setEditingCriterion(null);
                    setShowCreateModal(false);
                    reset();
                }
            });
        } else {
            post('/admin/honors/criteria', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (criterion: HonorCriterion) => {
        setData('honor_type', criterion.honor_type);
        setData('minimum_grade', criterion.minimum_grade.toString());
        setData('maximum_grade', criterion.maximum_grade?.toString() || '');
        setData('criteria_description', criterion.criteria_description);
        setData('academic_level_id', criterion.academic_level_id?.toString() || '');
        setData('is_active', criterion.is_active);
        setEditingCriterion(criterion);
        setShowCreateModal(true);
    };

    const handleCalculateHonors = () => {
        if (!selectedPeriod) {
            alert('Please select an academic period');
            return;
        }

        router.post('/admin/honors/calculate', { academic_period_id: selectedPeriod });
    };

    const handleDelete = (criterion: HonorCriterion) => {
        if (confirm(`Are you sure you want to delete the "${criterion.honor_type}" criteria?`)) {
            router.delete(`/admin/honors/criteria/${criterion.id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Honors Management" />
            <div className="space-y-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Honors Management</h1>
                                    <p className="text-gray-600 mt-2">Manage honor criteria and student achievements</p>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        ➕ Add Honor Criteria
                                    </button>
                                    <Link
                                        href="/admin/honors/roll"
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        🏆 View Honor Roll
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-md">
                                            <span className="text-white text-sm">🏆</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Total Honors</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.total_honors}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-md">
                                            <span className="text-white text-sm">📈</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Average GPA</dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {formatGPA(stats.average_gpa)}
                                        </dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-md">
                                            <span className="text-white text-sm">⭐</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Highest GPA</dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {formatGPA(stats.highest_gpa)}
                                        </dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-md">
                                            <span className="text-white text-sm">📊</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Honor Types</dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {Object.keys(stats.by_honor_type).length}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Academic Level Rankings */}
                        <div className="mb-8">
                            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Academic Rankings</h3>
                                        <p className="text-gray-600 mb-3">Honor rankings by education level</p>
                                        <div className="text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                                            Select a period to calculate honors for that specific academic period
                                        </div>
                                    </div>
                                <div className="flex gap-3">
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="period-filter" className="text-sm font-medium text-gray-700">
                                            Period:
                                        </label>
                                        <select
                                            id="period-filter"
                                            value={selectedPeriod}
                                            onChange={(e) => setSelectedPeriod(e.target.value)}
                                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm min-w-[200px]"
                                        >
                                            <option value="">All Academic Periods</option>
                                            {['Elementary','Junior High School','Senior High School','College'].map((lvl) => (
                                                <optgroup key={lvl} label={lvl}>
                                                    {academicPeriods
                                                        .filter(p => (p.academicLevel?.name ?? '') === lvl)
                                                        .map((period) => (
                                                            <option key={period.id} value={period.id}>
                                                                {period.name} • {period.school_year}
                                                            </option>
                                                        ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleCalculateHonors}
                                        disabled={!selectedPeriod || processing}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                                    >
                                        Calculate Honors
                                    </button>
                                </div>
                            </div>
                        </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {Object.entries(rankingsByLevel).map(([levelName, ranking]) => 
                                    renderRankingTile(levelName, ranking)
                                )}
                            </div>
                        </div>

                        {/* Honor Criteria by Category */}
                        <div className="space-y-6 mb-6">
                            {/* Basic Education Honor Criteria */}
                            {categorizedCriteria.basicEducation.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-md">
                                                <span className="text-white text-sm">🎓</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Basic Education Honor Criteria</h3>
                                            <p className="text-sm text-gray-600">Elementary to Senior High School</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {categorizedCriteria.basicEducation.map(renderHonorCriterion)}
                                    </div>
                                </div>
                            )}

                            {/* College Honor Criteria */}
                            {categorizedCriteria.college.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-md">
                                                <span className="text-white text-sm">🏛️</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">College Honor Criteria</h3>
                                            <p className="text-sm text-gray-600">Undergraduate Programs</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {categorizedCriteria.college.map(renderHonorCriterion)}
                                    </div>
                                </div>
                            )}

                            {/* General/Uncategorized Honor Criteria */}
                            {categorizedCriteria.general.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center w-8 h-8 bg-gray-500 rounded-md">
                                                <span className="text-white text-sm">📋</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">General Honor Criteria</h3>
                                            <p className="text-sm text-gray-600">All Academic Levels</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {categorizedCriteria.general.map(renderHonorCriterion)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recent Honors */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-md">
                                        <span className="text-white text-sm">🏆</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Honors</h3>
                                    <p className="text-sm text-gray-600">Latest awarded student honors</p>
                                </div>
                                <Link
                                    href="/admin/honors/students"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    View All →
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recentHonors.map((honor) => (
                                    <div key={honor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="font-medium text-gray-900">
                                                    {honor.student?.name || 'Unknown Student'}
                                                </div>
                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                    {honor.honorCriterion?.honor_type || honor.honor_type || 'Unknown Honor'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {honor.student?.studentProfile?.student_id || 'N/A'} • {honor.student?.studentProfile?.grade_level || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-green-600">
                                                GPA: {formatGPA(honor.gpa)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {honor.awarded_date ? new Date(honor.awarded_date).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {recentHonors.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 text-4xl mb-2">🏆</div>
                                        <p className="text-gray-500">No recent honors awarded</p>
                                        <p className="text-sm text-gray-400 mt-1">Calculate honors to see results here</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Create/Edit Modal */}
                        {showCreateModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        {editingCriterion ? 'Edit Honor Criteria' : 'Create Honor Criteria'}
                                    </h3>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Honor Type
                                            </label>
                                            <input
                                                type="text"
                                                value={data.honor_type}
                                                onChange={(e) => setData('honor_type', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="e.g., Dean's List, Magna Cum Laude"
                                                required
                                            />
                                            {errors.honor_type && (
                                                <p className="text-red-600 text-sm mt-1">{errors.honor_type}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Minimum Grade (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={data.minimum_grade}
                                                    onChange={(e) => setData('minimum_grade', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
                                                />
                                                {errors.minimum_grade && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.minimum_grade}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Maximum Grade (%) <span className="text-gray-400">(Optional)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={data.maximum_grade}
                                                    onChange={(e) => setData('maximum_grade', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                />
                                                {errors.maximum_grade && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.maximum_grade}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Academic Level <span className="text-gray-400">(Optional)</span>
                                            </label>
                                            <select
                                                value={data.academic_level_id}
                                                onChange={(e) => setData('academic_level_id', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="">All Academic Levels</option>
                                                {academicLevels.map((level) => (
                                                    <option key={level.id} value={level.id}>
                                                        {level.name} ({level.code})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.academic_level_id && (
                                                <p className="text-red-600 text-sm mt-1">{errors.academic_level_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={data.criteria_description}
                                                onChange={(e) => setData('criteria_description', e.target.value)}
                                                rows={3}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Describe the criteria for this honor..."
                                                required
                                            />
                                            {errors.criteria_description && (
                                                <p className="text-red-600 text-sm mt-1">{errors.criteria_description}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label className="ml-2 text-sm text-gray-700">Active</label>
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCreateModal(false);
                                                    setEditingCriterion(null);
                                                    reset();
                                                }}
                                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {processing ? 'Saving...' : (editingCriterion ? 'Update' : 'Create')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
            </div>
        </AdminLayout>
    );
};

export default HonorsIndex; 