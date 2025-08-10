import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

interface Student {
    rank: number;
    student_id: string;
    student_name: string;
    grade_level: string;
    honor_type: string;
    honor_display: string;
    gpa: number;
    awarded_date: string;
    certificate_title?: string;
}

interface LevelHonorRoll {
    level_name: string;
    total_students: number;
    average_gpa: number;
    highest_gpa: number;
    students: Student[];
    honor_distribution: Record<string, number>;
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

interface Props {
    honorRoll: Record<string, LevelHonorRoll>;
    stats: {
        total_honors: number;
        average_gpa: number;
        highest_gpa: number;
        by_honor_type: Record<string, number>;
        by_period: Record<string, number>;
    };
    academicPeriods: AcademicPeriod[];
    academicLevels: AcademicLevel[];
    selectedPeriodId?: number;
    selectedLevelId?: number;
    selectedLevel?: AcademicLevel;
    approvedOnly?: boolean;
}

const HonorRoll: React.FC<Props> = ({ 
    honorRoll, 
    stats, 
    academicPeriods, 
    academicLevels, 
    selectedPeriodId, 
    selectedLevelId, 
    selectedLevel, 
    approvedOnly,
}) => {
    const [selectedPeriod, setSelectedPeriod] = useState(selectedPeriodId?.toString() || '');
    const [selectedAcademicLevel, setSelectedAcademicLevel] = useState(selectedLevelId?.toString() || '');
    const [onlyApproved, setOnlyApproved] = useState(approvedOnly ?? false);

    // Helper function to safely format GPA values
    const formatGPA = (gpa: any): string => {
        if (typeof gpa === 'number') {
            return gpa.toFixed(2);
        }
        if (gpa && !isNaN(parseFloat(gpa))) {
            return parseFloat(gpa).toFixed(2);
        }
        return 'N/A';
    };

    // Helper function to get medal color for ranking
    const getRankColor = (rank: number): string => {
        switch (rank) {
            case 1: return 'text-yellow-600 bg-yellow-100';
            case 2: return 'text-gray-600 bg-gray-100';
            case 3: return 'text-orange-600 bg-orange-100';
            default: return 'text-blue-600 bg-blue-100';
        }
    };

    // Helper function to get honor type color
    const getHonorTypeColor = (honorType: string): string => {
        if (honorType.includes('highest') || honorType.includes('summa')) {
            return 'bg-purple-100 text-purple-800';
        }
        if (honorType.includes('high') || honorType.includes('magna')) {
            return 'bg-blue-100 text-blue-800';
        }
        if (honorType.includes('dean') || honorType.includes('cum_laude')) {
            return 'bg-green-100 text-green-800';
        }
        return 'bg-gray-100 text-gray-800';
    };

    const handleFilterChange = () => {
        const params = new URLSearchParams();
        if (selectedPeriod) params.set('academic_period_id', selectedPeriod);
        if (selectedAcademicLevel) params.set('level', selectedAcademicLevel);
        if (onlyApproved) params.set('approved_only', '1');
        
        router.get('/admin/honors/roll', Object.fromEntries(params));
    };

    return (
        <AdminLayout>
            <Head title="Honor Roll" />
            
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <Link 
                                href="/admin/honors" 
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ← Back to Honours
                            </Link>
                            <div className="text-gray-300">|</div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {selectedLevel ? `${selectedLevel.name} Honor Roll` : 'Academic Honor Roll'}
                            </h1>
                        </div>
                        <p className="text-gray-600 mt-1">
                            {selectedLevel 
                                ? `Honor students in ${selectedLevel.name}` 
                                : 'Honor students across all academic levels'
                            }
                        </p>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2">
                            <label htmlFor="period-filter-roll" className="text-sm font-medium text-gray-700">
                                Period:
                            </label>
                            <select
                                id="period-filter-roll"
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm min-w-[180px]"
                            >
                                <option value="">📅 All Academic Periods</option>
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
                        
                        <div className="flex items-center gap-2">
                            <label htmlFor="level-filter-roll" className="text-sm font-medium text-gray-700">
                                Level:
                            </label>
                            <select
                                id="level-filter-roll"
                                value={selectedAcademicLevel}
                                onChange={(e) => setSelectedAcademicLevel(e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm min-w-[160px]"
                            >
                                <option value="">🎓 All Academic Levels</option>
                                <optgroup label="📚 Basic Education">
                                    {academicLevels
                                        .filter(level => level.name !== 'College')
                                        .map((level) => (
                                            <option key={level.id} value={level.id}>
                                                {level.name}
                                            </option>
                                        ))}
                                </optgroup>
                                <optgroup label="🏛️ Higher Education">
                                    {academicLevels
                                        .filter(level => level.name === 'College')
                                        .map((level) => (
                                            <option key={level.id} value={level.id}>
                                                {level.name}
                                            </option>
                                        ))}
                                </optgroup>
                            </select>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input type="checkbox" checked={onlyApproved} onChange={(e) => setOnlyApproved(e.target.checked)} />
                                Only approved honors
                            </label>
                            <button
                            onClick={handleFilterChange}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                        >
                            <span>🔍</span>
                            <span>Apply Filters</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Overall Stats */}
                {Object.keys(honorRoll).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="text-sm text-gray-500">Total Honor Students</div>
                            <div className="text-2xl font-bold text-gray-900">
                                {Object.values(honorRoll).reduce((sum, level) => sum + level.total_students, 0)}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="text-sm text-gray-500">Overall Average GPA</div>
                            <div className="text-2xl font-bold text-green-600">
                                {formatGPA(stats.average_gpa)}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="text-sm text-gray-500">Highest GPA</div>
                            <div className="text-2xl font-bold text-purple-600">
                                {formatGPA(stats.highest_gpa)}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="text-sm text-gray-500">Honor Types</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {Object.keys(stats.by_honor_type).length}
                            </div>
                        </div>
                    </div>
                )}

                {/* Honor Roll by Level */}
                {Object.keys(honorRoll).length > 0 ? (
                    <div className="space-y-8">
                        {Object.entries(honorRoll).map(([levelName, levelData]) => (
                            <div key={levelName} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                {/* Level Header */}
                                <div className="border-b border-gray-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">{levelName}</h2>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {levelData.total_students} honor students • Average GPA: {formatGPA(levelData.average_gpa)} • Highest: {formatGPA(levelData.highest_gpa)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">Honor Distribution</div>
                                            <div className="flex gap-2 mt-1">
                                                {Object.entries(levelData.honor_distribution).map(([honorType, count]) => (
                                                    <span key={honorType} className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                        {count} {honorType.replace(/_/g, ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Students Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Rank
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Student
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Grade Level
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    GPA
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Honor
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date Awarded
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {levelData.students.map((student) => (
                                                <tr key={`${student.student_id}-${student.rank}`} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankColor(student.rank)}`}>
                                                            #{student.rank}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                                                            <div className="text-sm text-gray-500">{student.student_id}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {student.grade_level}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-green-600">
                                                            {formatGPA(student.gpa)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHonorTypeColor(student.honor_type)}`}>
                                                            {student.honor_display}
                                                        </span>
                                                        {student.certificate_title && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                🏆 {student.certificate_title}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(student.awarded_date).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-gray-400 text-6xl mb-4">🏆</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Honor Students Found</h3>
                        <p className="text-gray-500">
                            {selectedLevel 
                                ? `No honor students found for ${selectedLevel.name} in the selected period.`
                                : 'No honor students found for the selected criteria.'
                            }
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/admin/honors"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Back to Honor Management
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default HonorRoll;
