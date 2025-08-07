import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import ClassAdviserLayout from '../ClassAdviserLayout';

interface Grade {
    id: number;
    student: {
        id: number;
        name: string;
        email: string;
        student_profile: {
            student_id: string;
            grade_level: string;
            section: string;
        };
    };
    subject: {
        id: number;
        name: string;
        code: string;
    };
    academic_period: {
        id: number;
        name: string;
    };
    instructor: {
        id: number;
        name: string;
    };
    quarterly_grades: Array<{
        quarter: number;
        grade: number;
        weight: number;
        label?: string;
        semester?: number;
    }>;
    final_grade: number;
    status: string;
    remarks: string;
    submitted_at: string;
    approved_at?: string;
}

interface Props {
    adviser: {
        id: number;
        name: string;
        role_display: string;
    };
    grades: {
        data: Grade[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    academicPeriods: Array<{id: number; name: string}>;
    subjects: Array<{id: number; name: string}>;
    sections: string[];
    stats: {
        totalGrades: number;
        pendingGrades: number;
        approvedGrades: number;
        averageGrade: number;
    };
    filters: {
        academic_period_id?: number;
        subject_id?: number;
        section?: string;
        status?: string;
    };
}

const Grading: React.FC<Props> = ({ 
    adviser,
    grades, 
    academicPeriods, 
    subjects, 
    sections,
    stats, 
    filters 
}) => {
    const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    const { data, setData, post, processing } = useForm({
        academic_period_id: filters.academic_period_id || '',
        subject_id: filters.subject_id || '',
        section: filters.section || '',
        status: filters.status || '',
        grade_ids: [] as number[],
    });

    const handleFilter = () => {
        router.get('/class-adviser/grading', data);
    };

    const handleSelectGrade = (gradeId: number) => {
        setSelectedGrades(prev => {
            const newSelection = prev.includes(gradeId)
                ? prev.filter(id => id !== gradeId)
                : [...prev, gradeId];
            setShowBulkActions(newSelection.length > 0);
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        if (selectedGrades.length === (grades.data?.length || 0)) {
            setSelectedGrades([]);
            setShowBulkActions(false);
        } else {
            setSelectedGrades((grades.data || []).map(grade => grade.id));
            setShowBulkActions(true);
        }
    };

    const handleBulkSubmit = () => {
        if (selectedGrades.length === 0) return;
        
        setData('grade_ids', selectedGrades);
        post('/class-adviser/grading/bulk-submit', {
            onSuccess: () => {
                setSelectedGrades([]);
                setShowBulkActions(false);
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            returned: 'bg-red-100 text-red-800'
        };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getGradeColor = (grade: number) => {
        if (grade >= 90) return 'text-green-600 font-semibold';
        if (grade >= 75) return 'text-blue-600 font-semibold';
        if (grade >= 60) return 'text-yellow-600 font-semibold';
        return 'text-red-600 font-semibold';
    };

    return (
        <>
            <Head title="Grading - Class Adviser" />
            <ClassAdviserLayout>
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <Link
                            href="/class-adviser/dashboard"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Grade Management</h1>
                            <p className="text-gray-600">Manage grades for your assigned students and subjects</p>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <span className="text-2xl">📊</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Grades</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalGrades}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <span className="text-2xl">⏳</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pendingGrades}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <span className="text-2xl">✅</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Approved</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.approvedGrades}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <span className="text-2xl">📈</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Average</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.averageGrade ? stats.averageGrade.toFixed(2) : '0.00'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Period</label>
                                <select
                                    value={data.academic_period_id}
                                    onChange={(e) => setData('academic_period_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Periods</option>
                                    {academicPeriods && academicPeriods.map((period) => (
                                        <option key={period.id} value={period.id}>
                                            {period.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <select
                                    value={data.subject_id}
                                    onChange={(e) => setData('subject_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Subjects</option>
                                    {subjects && subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                <select
                                    value={data.section}
                                    onChange={(e) => setData('section', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Sections</option>
                                    {sections && sections.map((section) => (
                                        <option key={section} value={section}>
                                            {section}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="approved">Approved</option>
                                    <option value="returned">Returned</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleFilter}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {showBulkActions && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-blue-900">
                                        {selectedGrades.length} grade(s) selected
                                    </span>
                                    <button
                                        onClick={handleBulkSubmit}
                                        disabled={processing}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {processing ? 'Submitting...' : 'Submit Selected'}
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedGrades([]);
                                        setShowBulkActions(false);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Grades Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Grades</h2>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/class-adviser/grading/create"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    + Add Grade
                                </Link>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedGrades.length === grades.data.length && grades.data.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600">Select All</span>
                                </div>
                            </div>
                        </div>
                        
                        {!grades.data || grades.data.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <div className="text-6xl mb-4">📝</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No grades found</h3>
                                <p className="text-gray-600">
                                    {Object.values(filters).some(f => f) 
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Grades will appear here once they are created.'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedGrades.length === grades.data.length && grades.data.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quarterly Grades (1st-4th)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Grade</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {grades.data && grades.data.map((grade) => (
                                            <tr key={grade.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedGrades.includes(grade.id)}
                                                        onChange={() => handleSelectGrade(grade.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {grade.student.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {grade.student.student_profile?.student_id || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            Grade {grade.student.student_profile?.grade_level || 'N/A'} - {grade.student.student_profile?.section || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {grade.subject.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {grade.subject.code}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex space-x-2">
                                                        {grade.quarterly_grades && grade.quarterly_grades.length > 0 ? (
                                                            grade.quarterly_grades.map((qg, index) => (
                                                                <div key={index} className="text-center">
                                                                    <div className="text-xs text-gray-500">
                                                                        {qg.quarter === 1 ? '1st' : 
                                                                         qg.quarter === 2 ? '2nd' : 
                                                                         qg.quarter === 3 ? '3rd' : '4th'} Grading
                                                                    </div>
                                                                    <div className={`text-sm font-medium ${getGradeColor(qg.grade)}`}>
                                                                        {qg.grade}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center text-gray-500">
                                                                <div className="text-xs">No grades</div>
                                                                <div className="text-sm">-</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-lg font-bold ${getGradeColor(grade.final_grade)}`}>
                                                        {grade.final_grade}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(grade.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/class-adviser/grading/${grade.id}`}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={`/class-adviser/grading/${grade.id}/edit`}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Edit
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {grades.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {((grades.current_page - 1) * grades.per_page) + 1} to {Math.min(grades.current_page * grades.per_page, grades.total)} of {grades.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {grades.current_page > 1 && (
                                            <Link
                                                href={`/class-adviser/grading?page=${grades.current_page - 1}`}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {grades.current_page < grades.last_page && (
                                            <Link
                                                href={`/class-adviser/grading?page=${grades.current_page + 1}`}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </ClassAdviserLayout>
        </>
    );
};

export default Grading;
