import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

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
    }>;
    final_grade: number;
    status: string;
    remarks: string;
    submitted_at: string;
    approved_at?: string;
}

interface Props {
    grades: {
        data: Grade[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    academicPeriods: Array<{id: number; name: string}>;
    subjects: Array<{id: number; name: string}>;
    instructors: Array<{id: number; name: string}>;
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
        instructor_id?: number;
        section?: string;
        status?: string;
    };
}

const GradingIndex: React.FC<Props> = ({ 
    grades, 
    academicPeriods, 
    subjects, 
    instructors, 
    stats, 
    filters 
}) => {
    const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    const { data, setData, post, processing } = useForm({
        academic_period_id: filters.academic_period_id || '',
        subject_id: filters.subject_id || '',
        instructor_id: filters.instructor_id || '',
        section: filters.section || '',
        status: filters.status || '',
        grade_ids: [] as number[],
    });

    const handleFilter = () => {
        router.get('/admin/grading', data);
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
        if (selectedGrades.length === grades.data.length) {
            setSelectedGrades([]);
            setShowBulkActions(false);
        } else {
            setSelectedGrades(grades.data.map(grade => grade.id));
            setShowBulkActions(true);
        }
    };

    const handleBulkApprove = () => {
        setData('grade_ids', selectedGrades);
        post('/admin/grading/bulk-approve');
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            finalized: 'bg-blue-100 text-blue-800',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    const getGradeColor = (grade: number) => {
        if (grade >= 90) return 'text-green-600 font-semibold';
        if (grade >= 80) return 'text-blue-600 font-semibold';
        if (grade >= 70) return 'text-yellow-600 font-semibold';
        return 'text-red-600 font-semibold';
    };

    return (
        <AdminLayout>
            <Head title="Grading Management" />
            <div className="space-y-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Grading Management</h1>
                                    <p className="text-gray-600 mt-2">Manage student grades and approvals</p>
                                </div>
                                <div className="flex space-x-3">
                                    <Link
                                        href="/admin/grading/create"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        ➕ Add Grade
                                    </Link>
                                    <button
                                        onClick={() => document.getElementById('import-file')?.click()}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        📤 Import Grades
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-md">
                                            <span className="text-white text-sm">📊</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Total Grades</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.totalGrades}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-md">
                                            <span className="text-white text-sm">⏳</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Pending</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.pendingGrades}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-md">
                                            <span className="text-white text-sm">✅</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Approved</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.approvedGrades}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-md">
                                            <span className="text-white text-sm">📈</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Average Grade</dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {stats.averageGrade ? stats.averageGrade.toFixed(1) : 'N/A'}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Academic Period
                                    </label>
                                    <select
                                        value={data.academic_period_id}
                                        onChange={(e) => setData('academic_period_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Periods</option>
                                        {academicPeriods.map((period) => (
                                            <option key={period.id} value={period.id}>
                                                {period.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <select
                                        value={data.subject_id}
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Subjects</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instructor
                                    </label>
                                    <select
                                        value={data.instructor_id}
                                        onChange={(e) => setData('instructor_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Instructors</option>
                                        {instructors.map((instructor) => (
                                            <option key={instructor.id} value={instructor.id}>
                                                {instructor.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Status</option>
                                        <option value="draft">Draft</option>
                                        <option value="submitted">Submitted</option>
                                        <option value="approved">Approved</option>
                                        <option value="finalized">Finalized</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={handleFilter}
                                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {showBulkActions && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-800">
                                        {selectedGrades.length} grade(s) selected
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleBulkApprove}
                                            disabled={processing}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            Approve Selected
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedGrades([]);
                                                setShowBulkActions(false);
                                            }}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grades Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Final Grade
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Instructor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {grades.data.map((grade) => (
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
                                                        {grade.student.student_profile.student_id} • {grade.student.student_profile.grade_level} {grade.student.student_profile.section}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {grade.subject.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {grade.subject.code}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-lg font-bold ${getGradeColor(grade.final_grade)}`}>
                                                    {grade.final_grade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(grade.status)}`}>
                                                    {grade.status.charAt(0).toUpperCase() + grade.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {grade.instructor.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={`/admin/grading/${grade.id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={`/admin/grading/${grade.id}/edit`}
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

                            {grades.data.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-gray-500 text-lg">No grades found</div>
                                    <p className="text-gray-400 mt-2">Try adjusting your filters or add some grades</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {grades.total > grades.per_page && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {((grades.current_page - 1) * grades.per_page) + 1} to {Math.min(grades.current_page * grades.per_page, grades.total)} of {grades.total} results
                                </div>
                                
                                <div className="flex space-x-2">
                                    {Array.from({ length: grades.last_page }, (_, i) => (
                                        <Link
                                            key={i + 1}
                                            href={`/admin/grading?page=${i + 1}`}
                                            className={`px-3 py-2 rounded-md text-sm ${
                                                grades.current_page === i + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            }`}
                                        >
                                            {i + 1}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hidden File Input for Import */}
                        <input
                            id="import-file"
                            type="file"
                            accept=".csv"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // Handle file import logic here
                                    console.log('Import file:', file);
                                }
                            }}
                        />
            </div>
        </AdminLayout>
    );
};

export default GradingIndex; 