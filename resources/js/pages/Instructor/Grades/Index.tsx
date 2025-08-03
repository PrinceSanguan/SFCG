import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import InstructorLayout from '../InstructorLayout';

interface Student {
    id: number;
    name: string;
    email: string;
    student_profile?: {
        student_id: string;
        grade_level: string;
        section: string;
        academic_level?: {
            id: number;
            name: string;
            code: string;
        };
        college_course?: {
            id: number;
            name: string;
            code: string;
        };
    };
}

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface Assignment {
    id: number;
    subject: Subject;
    academic_period: {
        id: number;
        name: string;
        school_year: string;
    };
    section: string;
}

interface Grade {
    id: number;
    student_id: number;
    subject_id: number;
    academic_period_id: number;
    student_type: string;
    '1st_grading'?: number;
    '2nd_grading'?: number;
    '3rd_grading'?: number;
    '4th_grading'?: number;
    '1st_semester_midterm'?: number;
    '1st_semester_pre_final'?: number;
    '1st_semester_final'?: number;
    '2nd_semester_midterm'?: number;
    '2nd_semester_pre_final'?: number;
    '2nd_semester_final'?: number;
    overall_grade: number;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    remarks?: string;
    created_at: string;
    updated_at: string;
    student: Student;
}

interface Props {
    assignments: Assignment[];
    grades: {
        data: Grade[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    students: Student[];
    subjects: Subject[];
    academicPeriods: Assignment['academic_period'][];
    filters: {
        subject_id?: string;
        academic_period_id?: string;
        status?: string;
    };
}

const GradesIndex: React.FC<Props> = ({ 
    assignments = [], 
    grades = { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 }, 
    students = [], 
    subjects = [],
    academicPeriods = [],
    filters = {} 
}) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
    const [studentType, setStudentType] = useState<'elementary' | 'junior_high' | 'senior_high' | 'college' | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        student_id: '',
        subject_id: '',
        academic_period_id: '',
        student_type: '',
        '1st_grading': '',
        '2nd_grading': '',
        '3rd_grading': '',
        '4th_grading': '',
        '1st_semester_midterm': '',
        '1st_semester_pre_final': '',
        '1st_semester_final': '',
        '2nd_semester_midterm': '',
        '2nd_semester_pre_final': '',
        '2nd_semester_final': '',
        overall_grade: '',
        remarks: '',
    });

    // Determine student type based on academic level or college course
    const determineStudentType = (student: Student): 'elementary' | 'junior_high' | 'senior_high' | 'college' => {
        if (student.student_profile?.college_course?.id) {
            return 'college';
        }
        
        const academicLevel = student.student_profile?.academic_level?.code;
        switch (academicLevel) {
            case 'ELEM':
                return 'elementary';
            case 'JHS':
                return 'junior_high';
            case 'SHS':
                return 'senior_high';
            default:
                return 'elementary';
        }
    };

    // Elementary/Junior High: 4 Quarters
    const handleQuarterlyGradeChange = (field: '1st_grading' | '2nd_grading' | '3rd_grading' | '4th_grading', value: string) => {
        setData(field, value);
        
        // Calculate final grade: average of all 4 quarters
        const grades = [
            parseFloat(data['1st_grading']) || 0,
            parseFloat(data['2nd_grading']) || 0,
            parseFloat(data['3rd_grading']) || 0,
            parseFloat(data['4th_grading']) || 0
        ];
        
        const validGrades = grades.filter(grade => grade > 0);
        const finalGrade = validGrades.length > 0 ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(2) : '0.00';
        setData('overall_grade', finalGrade);
    };

    // Senior High: 2 Semesters (1st: 1st-2nd grading, 2nd: 3rd-4th grading)
    const handleSemesterGradeChange = (field: '1st_grading' | '2nd_grading' | '3rd_grading' | '4th_grading', value: string) => {
        setData(field, value);
        
        // Calculate semester averages
        const firstSemester = ((parseFloat(data['1st_grading']) || 0) + (parseFloat(data['2nd_grading']) || 0)) / 2;
        const secondSemester = ((parseFloat(data['3rd_grading']) || 0) + (parseFloat(data['4th_grading']) || 0)) / 2;
        
        // Calculate final grade: average of both semesters
        const finalGrade = ((firstSemester + secondSemester) / 2).toFixed(2);
        setData('overall_grade', finalGrade);
    };

    // College: 2 Semesters with Midterm, Pre-Final (Final = (Midterm + Pre-Final) ÷ 2)
    const handleCollegeGradeChange = (field: '1st_semester_midterm' | '1st_semester_pre_final' | '2nd_semester_midterm' | '2nd_semester_pre_final', value: string) => {
        setData(field, value);
        
        // Calculate final grade for College
        // 1st Semester: (Midterm + Pre-Final) / 2
        const firstSemester = ((parseFloat(data['1st_semester_midterm']) || 0) + (parseFloat(data['1st_semester_pre_final']) || 0)) / 2;
        
        // 2nd Semester: (Midterm + Pre-Final) / 2
        const secondSemester = ((parseFloat(data['2nd_semester_midterm']) || 0) + (parseFloat(data['2nd_semester_pre_final']) || 0)) / 2;
        
        // Overall: (1st Semester + 2nd Semester) / 2
        const finalGrade = ((firstSemester + secondSemester) / 2).toFixed(2);
        setData('overall_grade', finalGrade);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Set the student type before submitting
        setData('student_type', studentType || '');
        
        if (editingGrade) {
            put(`/instructor/grades/${editingGrade.id}`, {
                onSuccess: () => {
                    setEditingGrade(null);
                    reset();
                    setShowCreateModal(false);
                }
            });
        } else {
            post('/instructor/grades', {
                onSuccess: () => {
                    reset();
                    setShowCreateModal(false);
                }
            });
        }
    };

    const handleEdit = (grade: Grade) => {
        setEditingGrade(grade);
        setData('student_id', grade.student_id.toString());
        setData('subject_id', grade.subject_id.toString());
        setData('academic_period_id', grade.academic_period_id.toString());
        setData('student_type', grade.student_type);
        setData('remarks', grade.remarks || '');
        
        // Set grades based on student type
        if (grade.student_type === 'college') {
            setData('1st_semester_midterm', grade['1st_semester_midterm']?.toString() || '');
            setData('1st_semester_pre_final', grade['1st_semester_pre_final']?.toString() || '');
            setData('2nd_semester_midterm', grade['2nd_semester_midterm']?.toString() || '');
            setData('2nd_semester_pre_final', grade['2nd_semester_pre_final']?.toString() || '');
        } else {
            setData('1st_grading', grade['1st_grading']?.toString() || '');
            setData('2nd_grading', grade['2nd_grading']?.toString() || '');
            setData('3rd_grading', grade['3rd_grading']?.toString() || '');
            setData('4th_grading', grade['4th_grading']?.toString() || '');
        }
        
        // Determine student type for UI
        const student = students.find(s => s.id === grade.student_id);
        if (student) {
            setStudentType(determineStudentType(student));
        }
        
        setShowCreateModal(true);
    };

    const handleSubmitGrades = (gradeId: number) => {
        router.put(`/instructor/grades/${gradeId}/submit`);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingGrade(null);
        setStudentType(null);
        reset();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'submitted': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStudentChange = (studentId: string) => {
        setData('student_id', studentId);
        
        if (studentId) {
            const student = students.find(s => s.id === parseInt(studentId));
            if (student) {
                const type = determineStudentType(student);
                setStudentType(type);
                setData('student_type', type);
            }
        } else {
            setStudentType(null);
            setData('student_type', '');
        }
    };

    return (
        <>
            <Head title="Grades Management" />
            <InstructorLayout>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Grades Management</h1>
                    <p className="text-gray-600 mt-2">Manage and submit student grades</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-2xl">📚</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Assignments</p>
                                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-2xl">👥</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-2xl">📝</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Grades</p>
                                <p className="text-2xl font-bold text-gray-900">{grades.data.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <span className="text-2xl">⏳</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {grades.data.filter(g => g.status === 'submitted').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <select 
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filters.subject_id || ''}
                                onChange={(e) => router.get('/instructor/grades', { 
                                    ...filters, 
                                    subject_id: e.target.value 
                                })}
                            >
                                <option value="">All Subjects</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name} ({subject.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Period</label>
                            <select 
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filters.academic_period_id || ''}
                                onChange={(e) => router.get('/instructor/grades', { 
                                    ...filters, 
                                    academic_period_id: e.target.value 
                                })}
                            >
                                <option value="">All Periods</option>
                                {academicPeriods.map((period) => (
                                    <option key={period.id} value={period.id}>
                                        {period.name} ({period.school_year})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filters.status || ''}
                                onChange={(e) => router.get('/instructor/grades', { 
                                    ...filters, 
                                    status: e.target.value 
                                })}
                            >
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="submitted">Submitted</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="flex items-end space-x-2">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Add Grade
                            </button>
                            <button
                                onClick={() => router.get('/instructor/grades')}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                    {filters.academic_period_id && (() => {
                        const selectedPeriod = academicPeriods.find(p => p.id.toString() === filters.academic_period_id);
                        if (selectedPeriod) {
                            const periodName = selectedPeriod.name.toLowerCase();
                            const semesterType = periodName.includes('1st') || periodName.includes('first') ? '1st' : 
                                               periodName.includes('2nd') || periodName.includes('second') ? '2nd' : null;
                            if (semesterType) {
                                return (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-blue-800 text-sm">
                                            <strong>Viewing {semesterType === '1st' ? '1st' : '2nd'} Semester grades only</strong> - 
                                            Grade entry will be limited to fields relevant to the selected semester.
                                        </p>
                                    </div>
                                );
                            }
                        }
                        return null;
                    })()}
                </div>

                {/* Grades Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Grades List ({grades.data.length})
                        </h3>
                    </div>
                    
                    {grades.data.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No grades found. Add your first grade to get started.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Grade</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {grades.data.map((grade) => (
                                        <tr key={grade.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{grade.student.name}</div>
                                                    <div className="text-sm text-gray-500">{grade.student.student_profile?.student_id}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {subjects.find(s => s.id === grade.subject_id)?.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    grade.student_type === 'college' 
                                                        ? 'bg-purple-100 text-purple-800' 
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {grade.student_type === 'college' ? 'College' : 'K-12'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {grade.overall_grade?.toFixed(2) || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(grade.status)}`}>
                                                    {grade.status.charAt(0).toUpperCase() + grade.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(grade)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    {grade.status === 'draft' && (
                                                        <button
                                                            onClick={() => handleSubmitGrades(grade.id)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Submit
                                                        </button>
                                                    )}
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
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Showing {((grades.current_page - 1) * grades.per_page) + 1} to {Math.min(grades.current_page * grades.per_page, grades.total)} of {grades.total} results
                            </div>
                            <div className="flex space-x-1">
                                {grades.current_page > 1 && (
                                    <button
                                        onClick={() => router.get('/instructor/grades', { 
                                            ...filters, 
                                            page: grades.current_page - 1 
                                        })}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                )}
                                
                                {Array.from({ length: Math.min(5, grades.last_page) }, (_, i) => {
                                    const pageNum = Math.max(1, Math.min(grades.last_page - 4, grades.current_page - 2)) + i;
                                    return pageNum <= grades.last_page ? (
                                        <button
                                            key={pageNum}
                                            onClick={() => router.get('/instructor/grades', { 
                                                ...filters, 
                                                page: pageNum 
                                            })}
                                            className={`px-3 py-1 text-sm border rounded ${
                                                pageNum === grades.current_page
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-white border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ) : null;
                                })}
                                
                                {grades.current_page < grades.last_page && (
                                    <button
                                        onClick={() => router.get('/instructor/grades', { 
                                            ...filters, 
                                            page: grades.current_page + 1 
                                        })}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingGrade ? 'Edit Grade' : 'Add Grade'}
                                </h3>
                                
                                {/* Student Type Display */}
                                {studentType && (
                                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                        <h3 className="font-medium text-blue-900 mb-2">Student Type: {studentType.replace('_', ' ').toUpperCase()}</h3>
                                        <p className="text-blue-700 text-sm">
                                            {studentType === 'elementary' || studentType === 'junior_high' 
                                                ? 'Grading: 4 Quarters (1st to 4th Grading)' 
                                                : studentType === 'senior_high'
                                                ? 'Grading: 2 Semesters (1st: 1st-2nd grading, 2nd: 3rd-4th grading)'
                                                : studentType === 'college'
                                                ? 'Grading: 2 Semesters with Midterm, Pre-Final (Final = (Midterm + Pre-Final) ÷ 2)'
                                                : ''
                                            }
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Student
                                            </label>
                                            <select
                                                value={data.student_id}
                                                onChange={(e) => handleStudentChange(e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Student</option>
                                                {students.map((student) => (
                                                    <option key={student.id} value={student.id}>
                                                        {student.name} ({student.student_profile?.student_id})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.student_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subject
                                            </label>
                                            <select
                                                value={data.subject_id}
                                                onChange={(e) => setData('subject_id', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map((subject) => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.name} ({subject.code})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.subject_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dynamic Grading Sections */}
                                    {(studentType === 'elementary' || studentType === 'junior_high') && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quarterly Grades</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="font-medium text-gray-700 mb-3">1st Grading</h4>
                                                    <div>
                                                        <label className="block text-sm text-gray-600 mb-1">Grade</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            value={data['1st_grading']}
                                                            onChange={(e) => handleQuarterlyGradeChange('1st_grading', e.target.value)}
                                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="font-medium text-gray-700 mb-3">2nd Grading</h4>
                                                    <div>
                                                        <label className="block text-sm text-gray-600 mb-1">Grade</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            value={data['2nd_grading']}
                                                            onChange={(e) => handleQuarterlyGradeChange('2nd_grading', e.target.value)}
                                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="font-medium text-gray-700 mb-3">3rd Grading</h4>
                                                    <div>
                                                        <label className="block text-sm text-gray-600 mb-1">Grade</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            value={data['3rd_grading']}
                                                            onChange={(e) => handleQuarterlyGradeChange('3rd_grading', e.target.value)}
                                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="font-medium text-gray-700 mb-3">4th Grading</h4>
                                                    <div>
                                                        <label className="block text-sm text-gray-600 mb-1">Grade</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            value={data['4th_grading']}
                                                            onChange={(e) => handleQuarterlyGradeChange('4th_grading', e.target.value)}
                                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Final Grade Display */}
                                            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium text-green-900">Final Grade (Auto-calculated)</h4>
                                                    <span className="text-2xl font-bold text-green-900">{data.overall_grade || '0.00'}</span>
                                                </div>
                                                <p className="text-sm text-green-700 mt-1">Average of all 4 quarters</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Semester Grades - Senior High */}
                                    {studentType === 'senior_high' && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Semester Grades</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Show 1st Semester only if 1st semester period is selected or no specific period */}
                                                {(() => {
                                                    const selectedPeriod = academicPeriods.find(p => p.id.toString() === filters.academic_period_id);
                                                    if (!selectedPeriod) return true; // Show all if no filter
                                                    const periodName = selectedPeriod.name.toLowerCase();
                                                    return periodName.includes('1st') || periodName.includes('first') || 
                                                          (!periodName.includes('2nd') && !periodName.includes('second'));
                                                })() && (
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="font-medium text-gray-700 mb-3">1st Semester</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">1st Grading</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                value={data['1st_grading']}
                                                                onChange={(e) => handleSemesterGradeChange('1st_grading', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">2nd Grading</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                value={data['2nd_grading']}
                                                                onChange={(e) => handleSemesterGradeChange('2nd_grading', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <div className="pt-2 border-t border-gray-200">
                                                            <label className="block text-sm text-gray-600 mb-1">1st Semester Average</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                value={((parseFloat(data['1st_grading']) || 0) + (parseFloat(data['2nd_grading']) || 0)) / 2}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
                                                                placeholder="0.00"
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                )}
                                                
                                                {/* Show 2nd Semester only if 2nd semester period is selected or no specific period */}
                                                {(() => {
                                                    const selectedPeriod = academicPeriods.find(p => p.id.toString() === filters.academic_period_id);
                                                    if (!selectedPeriod) return true; // Show all if no filter
                                                    const periodName = selectedPeriod.name.toLowerCase();
                                                    return periodName.includes('2nd') || periodName.includes('second') || 
                                                          (!periodName.includes('1st') && !periodName.includes('first'));
                                                })() && (
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="font-medium text-gray-700 mb-3">2nd Semester</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">3rd Grading</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                value={data['3rd_grading']}
                                                                onChange={(e) => handleSemesterGradeChange('3rd_grading', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">4th Grading</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                value={data['4th_grading']}
                                                                onChange={(e) => handleSemesterGradeChange('4th_grading', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <div className="pt-2 border-t border-gray-200">
                                                            <label className="block text-sm text-gray-600 mb-1">2nd Semester Average</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                value={((parseFloat(data['3rd_grading']) || 0) + (parseFloat(data['4th_grading']) || 0)) / 2}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
                                                                placeholder="0.00"
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                )}
                                            </div>
                                            
                                            {/* Final Grade Display */}
                                            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium text-green-900">Final Grade (Auto-calculated)</h4>
                                                    <span className="text-2xl font-bold text-green-900">{data.overall_grade || '0.00'}</span>
                                                </div>
                                                <p className="text-sm text-green-700 mt-1">Average of both semesters</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* College Grades */}
                                    {studentType === 'college' && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">College Grades</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Show 1st Semester only if 1st semester period is selected or no specific period */}
                                                {(() => {
                                                    const selectedPeriod = academicPeriods.find(p => p.id.toString() === filters.academic_period_id);
                                                    if (!selectedPeriod) return true; // Show all if no filter
                                                    const periodName = selectedPeriod.name.toLowerCase();
                                                    return periodName.includes('1st') || periodName.includes('first') || 
                                                          (!periodName.includes('2nd') && !periodName.includes('second'));
                                                })() && (
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="font-medium text-gray-700 mb-3">1st Semester</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">Midterm</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                value={data['1st_semester_midterm']}
                                                                onChange={(e) => handleCollegeGradeChange('1st_semester_midterm', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">Pre-Final</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                value={data['1st_semester_pre_final']}
                                                                onChange={(e) => handleCollegeGradeChange('1st_semester_pre_final', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <div className="pt-2 border-t border-gray-200">
                                                            <label className="block text-sm text-gray-600 mb-1">1st Semester Final</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                value={((parseFloat(data['1st_semester_midterm']) || 0) + (parseFloat(data['1st_semester_pre_final']) || 0)) / 2}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
                                                                placeholder="0.00"
                                                                readOnly
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">(Midterm + Pre-Final) ÷ 2</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                )}
                                                
                                                {/* Show 2nd Semester only if 2nd semester period is selected or no specific period */}
                                                {(() => {
                                                    const selectedPeriod = academicPeriods.find(p => p.id.toString() === filters.academic_period_id);
                                                    if (!selectedPeriod) return true; // Show all if no filter
                                                    const periodName = selectedPeriod.name.toLowerCase();
                                                    return periodName.includes('2nd') || periodName.includes('second') || 
                                                          (!periodName.includes('1st') && !periodName.includes('first'));
                                                })() && (
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="font-medium text-gray-700 mb-3">2nd Semester</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">Midterm</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                value={data['2nd_semester_midterm']}
                                                                onChange={(e) => handleCollegeGradeChange('2nd_semester_midterm', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">Pre-Final</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                value={data['2nd_semester_pre_final']}
                                                                onChange={(e) => handleCollegeGradeChange('2nd_semester_pre_final', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <div className="pt-2 border-t border-gray-200">
                                                            <label className="block text-sm text-gray-600 mb-1">2nd Semester Final</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                value={((parseFloat(data['2nd_semester_midterm']) || 0) + (parseFloat(data['2nd_semester_pre_final']) || 0)) / 2}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
                                                                placeholder="0.00"
                                                                readOnly
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">(Midterm + Pre-Final) ÷ 2</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                )}
                                            </div>
                                            
                                            {/* Final Grade Display */}
                                            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium text-green-900">Final Grade (Auto-calculated)</h4>
                                                    <span className="text-2xl font-bold text-green-900">{data.overall_grade || '0.00'}</span>
                                                </div>
                                                <p className="text-sm text-green-700 mt-1">Average of both semesters</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Remarks */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Remarks
                                        </label>
                                        <textarea
                                            value={data.remarks}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Additional remarks or notes..."
                                        />
                                        {errors.remarks && (
                                            <p className="mt-1 text-sm text-red-600">{errors.remarks}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-3">
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
                                            {processing ? 'Saving...' : (editingGrade ? 'Update Grade' : 'Create Grade')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </InstructorLayout>
        </>
    );
};

export default GradesIndex; 