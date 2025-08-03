import React from 'react';
import { Head, router } from '@inertiajs/react';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';

interface AcademicPeriod {
    id: number;
    name: string;
    school_year: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    units: number;
}

interface Grade {
    id: number;
    subject: Subject;
    academic_period: AcademicPeriod;
    instructor: {
        name: string;
    };
    student_type: 'elementary' | 'junior_high' | 'senior_high' | 'college';
    overall_grade: number;
    remarks?: string;
    submitted_at: string;
    '1st_semester'?: {
        midterm?: number;
        pre_final?: number;
        final?: number;
        '1st_grading'?: number;
        '2nd_grading'?: number;
    };
    '2nd_semester'?: {
        midterm?: number;
        pre_final?: number;
        final?: number;
        '3rd_grading'?: number;
        '4th_grading'?: number;
    };
    quarters?: {
        '1st_grading'?: number;
        '2nd_grading'?: number;
        '3rd_grading'?: number;
        '4th_grading'?: number;
    };
}

interface Props {
    grades: Grade[];
    academicPeriods: AcademicPeriod[];
    filters: {
        academic_period_id?: string;
    };
}

const StudentGrades: React.FC<Props> = ({ grades, academicPeriods, filters }) => {
    const getGradeColor = (grade: number) => {
        if (grade >= 95) return 'text-green-600 font-semibold';
        if (grade >= 90) return 'text-blue-600 font-semibold';
        if (grade >= 85) return 'text-yellow-600 font-medium';
        if (grade >= 75) return 'text-orange-600';
        return 'text-red-600 font-medium';
    };

    const getSelectedPeriod = () => {
        if (!filters.academic_period_id) return null;
        return academicPeriods.find(p => p.id.toString() === filters.academic_period_id);
    };

    const getSemesterType = (period: AcademicPeriod | null) => {
        if (!period) return null;
        const periodName = period.name.toLowerCase();
        if (periodName.includes('1st') || periodName.includes('first')) return '1st';
        if (periodName.includes('2nd') || periodName.includes('second')) return '2nd';
        return null;
    };

    const selectedPeriod = getSelectedPeriod();
    const semesterType = getSemesterType(selectedPeriod);

    return (
        <>
            <Head title="My Grades" />
            <div className="flex min-h-screen bg-gray-50">
                <AppSidebar />
                <div className="flex-1">
                    <AppHeader />
                    <main className="p-6">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">My Grades</h1>
                            <p className="text-gray-600 mt-2">View your academic performance across all subjects</p>
                        </div>

                        {/* Academic Period Filter */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Period</label>
                                    <select 
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={filters.academic_period_id || ''}
                                        onChange={(e) => router.get('/student/grades', { academic_period_id: e.target.value })}
                                    >
                                        <option value="">All Periods</option>
                                        {academicPeriods.map((period) => (
                                            <option key={period.id} value={period.id}>
                                                {period.name} ({period.school_year})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => router.get('/student/grades')}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        Clear Filter
                                    </button>
                                </div>
                            </div>
                            {selectedPeriod && semesterType && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-blue-800 text-sm">
                                        <strong>Viewing {semesterType === '1st' ? '1st' : '2nd'} Semester grades only</strong> - 
                                        Only grades relevant to the selected semester period are displayed.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <span className="text-2xl">📚</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                                        <p className="text-2xl font-bold text-gray-900">{grades.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <span className="text-2xl">📊</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Average Grade</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {grades.length > 0 
                                                ? (grades.reduce((sum, grade) => sum + grade.overall_grade, 0) / grades.length).toFixed(2)
                                                : '0.00'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <span className="text-2xl">⭐</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Highest Grade</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {grades.length > 0 
                                                ? Math.max(...grades.map(g => g.overall_grade)).toFixed(2)
                                                : '0.00'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <span className="text-2xl">🎯</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Passing Grades</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {grades.filter(g => g.overall_grade >= 75).length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grades List */}
                        <div className="space-y-6">
                            {grades.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                    <div className="text-gray-400 text-6xl mb-4">📝</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No grades available</h3>
                                    <p className="text-gray-600">
                                        {filters.academic_period_id 
                                            ? 'No grades found for the selected academic period.' 
                                            : 'Your grades will appear here once they are submitted and approved by your instructors.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                grades.map((grade) => (
                                    <div key={grade.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{grade.subject.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {grade.subject.code} • {grade.subject.units} units • {grade.instructor.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {grade.academic_period.name} ({grade.academic_period.school_year})
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Overall Grade</p>
                                                <p className={`text-3xl font-bold ${getGradeColor(grade.overall_grade)}`}>
                                                    {grade.overall_grade.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Grade Details */}
                                        <div className="border-t border-gray-200 pt-4">
                                            {grade.student_type === 'college' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {grade['1st_semester'] && (
                                                        <div className="bg-blue-50 p-4 rounded-lg">
                                                            <h4 className="font-medium text-blue-900 mb-2">1st Semester</h4>
                                                            <div className="space-y-1 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span>Midterm:</span>
                                                                    <span className={grade['1st_semester'].midterm ? getGradeColor(grade['1st_semester'].midterm) : 'text-gray-400'}>
                                                                        {grade['1st_semester'].midterm?.toFixed(2) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Pre-Final:</span>
                                                                    <span className={grade['1st_semester'].pre_final ? getGradeColor(grade['1st_semester'].pre_final) : 'text-gray-400'}>
                                                                        {grade['1st_semester'].pre_final?.toFixed(2) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between border-t border-blue-200 pt-1">
                                                                    <span className="font-medium">Final:</span>
                                                                    <span className={grade['1st_semester'].final ? getGradeColor(grade['1st_semester'].final) : 'text-gray-400'}>
                                                                        {grade['1st_semester'].final?.toFixed(2) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {grade['2nd_semester'] && (
                                                        <div className="bg-green-50 p-4 rounded-lg">
                                                            <h4 className="font-medium text-green-900 mb-2">2nd Semester</h4>
                                                            <div className="space-y-1 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span>Midterm:</span>
                                                                    <span className={grade['2nd_semester'].midterm ? getGradeColor(grade['2nd_semester'].midterm) : 'text-gray-400'}>
                                                                        {grade['2nd_semester'].midterm?.toFixed(2) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Pre-Final:</span>
                                                                    <span className={grade['2nd_semester'].pre_final ? getGradeColor(grade['2nd_semester'].pre_final) : 'text-gray-400'}>
                                                                        {grade['2nd_semester'].pre_final?.toFixed(2) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between border-t border-green-200 pt-1">
                                                                    <span className="font-medium">Final:</span>
                                                                    <span className={grade['2nd_semester'].final ? getGradeColor(grade['2nd_semester'].final) : 'text-gray-400'}>
                                                                        {grade['2nd_semester'].final?.toFixed(2) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {grade.student_type === 'senior_high' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {grade['1st_semester'] && (
                                                        <div className="bg-blue-50 p-4 rounded-lg">
                                                            <h4 className="font-medium text-blue-900 mb-2">1st Semester</h4>
                                                            <div className="space-y-1 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span>1st Grading:</span>
                                                                    <span className={grade['1st_semester']['1st_grading'] ? getGradeColor(grade['1st_semester']['1st_grading']) : 'text-gray-400'}>
                                                                        {grade['1st_semester']['1st_grading']?.toFixed(2) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>2nd Grading:</span>
                                                                    <span className={grade['1st_semester']['2nd_grading'] ? getGradeColor(grade['1st_semester']['2nd_grading']) : 'text-gray-400'}>
                                                                        {grade['1st_semester']['2nd_grading']?.toFixed(2) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {grade['2nd_semester'] && (
                                                        <div className="bg-green-50 p-4 rounded-lg">
                                                            <h4 className="font-medium text-green-900 mb-2">2nd Semester</h4>
                                                            <div className="space-y-1 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span>3rd Grading:</span>
                                                                    <span className={grade['2nd_semester']['3rd_grading'] ? getGradeColor(grade['2nd_semester']['3rd_grading']) : 'text-gray-400'}>
                                                                        {grade['2nd_semester']['3rd_grading']?.toFixed(2) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>4th Grading:</span>
                                                                    <span className={grade['2nd_semester']['4th_grading'] ? getGradeColor(grade['2nd_semester']['4th_grading']) : 'text-gray-400'}>
                                                                        {grade['2nd_semester']['4th_grading']?.toFixed(2) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {(grade.student_type === 'elementary' || grade.student_type === 'junior_high') && grade.quarters && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                        <p className="text-xs text-gray-600 mb-1">1st Quarter</p>
                                                        <p className={`font-semibold ${grade.quarters['1st_grading'] ? getGradeColor(grade.quarters['1st_grading']) : 'text-gray-400'}`}>
                                                            {grade.quarters['1st_grading']?.toFixed(2) || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                        <p className="text-xs text-gray-600 mb-1">2nd Quarter</p>
                                                        <p className={`font-semibold ${grade.quarters['2nd_grading'] ? getGradeColor(grade.quarters['2nd_grading']) : 'text-gray-400'}`}>
                                                            {grade.quarters['2nd_grading']?.toFixed(2) || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                        <p className="text-xs text-gray-600 mb-1">3rd Quarter</p>
                                                        <p className={`font-semibold ${grade.quarters['3rd_grading'] ? getGradeColor(grade.quarters['3rd_grading']) : 'text-gray-400'}`}>
                                                            {grade.quarters['3rd_grading']?.toFixed(2) || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                        <p className="text-xs text-gray-600 mb-1">4th Quarter</p>
                                                        <p className={`font-semibold ${grade.quarters['4th_grading'] ? getGradeColor(grade.quarters['4th_grading']) : 'text-gray-400'}`}>
                                                            {grade.quarters['4th_grading']?.toFixed(2) || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {grade.remarks && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-600">
                                                    <strong>Remarks:</strong> {grade.remarks}
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-4 text-xs text-gray-500">
                                            Submitted on {grade.submitted_at}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default StudentGrades;