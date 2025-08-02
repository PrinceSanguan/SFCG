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
    grades: Grade[];
    students: Student[];
    subjects: Subject[];
    filters: {
        subject_id?: string;
        status?: string;
    };
}

const GradesIndex: React.FC<Props> = ({ 
    assignments = [], 
    grades = [], 
    students = [], 
    subjects = [],
    filters = {} 
}) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
    const [studentType, setStudentType] = useState<'k12' | 'college'>('k12');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        student_id: '',
        subject_id: '',
        academic_period_id: '',
        student_type: 'k12',
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
        remarks: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingGrade) {
            put(`/instructor/grades/${editingGrade.id}`, {
                onSuccess: () => {
                    setEditingGrade(null);
                    setShowCreateModal(false);
                    reset();
                }
            });
        } else {
            post('/instructor/grades', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (grade: Grade) => {
        setData('student_id', grade.student_id.toString());
        setData('subject_id', grade.subject_id.toString());
        setData('academic_period_id', grade.academic_period_id.toString());
        setData('student_type', grade.student_type);
        setData('1st_grading', grade['1st_grading']?.toString() || '');
        setData('2nd_grading', grade['2nd_grading']?.toString() || '');
        setData('3rd_grading', grade['3rd_grading']?.toString() || '');
        setData('4th_grading', grade['4th_grading']?.toString() || '');
        setData('1st_semester_midterm', grade['1st_semester_midterm']?.toString() || '');
        setData('1st_semester_pre_final', grade['1st_semester_pre_final']?.toString() || '');
        setData('1st_semester_final', grade['1st_semester_final']?.toString() || '');
        setData('2nd_semester_midterm', grade['2nd_semester_midterm']?.toString() || '');
        setData('2nd_semester_pre_final', grade['2nd_semester_pre_final']?.toString() || '');
        setData('2nd_semester_final', grade['2nd_semester_final']?.toString() || '');
        setData('remarks', grade.remarks || '');
        
        setEditingGrade(grade);
        setShowCreateModal(true);
    };

    const handleSubmitGrades = (gradeId: number) => {
        if (confirm('Are you sure you want to submit these grades for validation?')) {
            router.post(`/instructor/grades/${gradeId}/submit`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingGrade(null);
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

    return (
        <>
            <Head title="Grade Management - Instructor" />
            <InstructorLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Grade Management</h1>
                            <p className="text-gray-600 mt-2">Input, edit, and submit student grades for your assigned subjects.</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <span className="mr-2">➕</span>
                                Add Grade
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-2xl">📚</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
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
                                <p className="text-2xl font-bold text-gray-900">{grades.length}</p>
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
                                    {grades.filter(g => g.status === 'submitted').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <select 
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filters.subject_id || ''}
                                onChange={(e) => router.get('/instructor/grades', { subject_id: e.target.value })}
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filters.status || ''}
                                onChange={(e) => router.get('/instructor/grades', { status: e.target.value })}
                            >
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="submitted">Submitted</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => router.get('/instructor/grades')}
                                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grades Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Grades List ({grades.length})
                        </h3>
                    </div>
                    
                    {grades.length === 0 ? (
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
                                    {grades.map((grade) => (
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
                </div>

                {/* Create/Edit Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingGrade ? 'Edit Grade' : 'Add Grade'}
                                </h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Student
                                            </label>
                                            <select
                                                value={data.student_id}
                                                onChange={(e) => setData('student_id', e.target.value)}
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

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Student Type
                                            </label>
                                            <select
                                                value={data.student_type}
                                                onChange={(e) => {
                                                    setData('student_type', e.target.value);
                                                    setStudentType(e.target.value as 'k12' | 'college');
                                                }}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="k12">K-12</option>
                                                <option value="college">College</option>
                                            </select>
                                            {errors.student_type && (
                                                <p className="mt-1 text-sm text-red-600">{errors.student_type}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Academic Period
                                            </label>
                                            <select
                                                value={data.academic_period_id}
                                                onChange={(e) => setData('academic_period_id', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Period</option>
                                                {assignments.map((assignment) => (
                                                    <option key={assignment.id} value={assignment.id}>
                                                        {assignment.academic_period.name} ({assignment.academic_period.school_year})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.academic_period_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.academic_period_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Grade Inputs */}
                                    <div className="mt-6">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Grade Inputs</h4>
                                        
                                        {studentType === 'k12' ? (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">1st Grading</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={data['1st_grading']}
                                                        onChange={(e) => setData('1st_grading', e.target.value)}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">2nd Grading</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={data['2nd_grading']}
                                                        onChange={(e) => setData('2nd_grading', e.target.value)}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">3rd Grading</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={data['3rd_grading']}
                                                        onChange={(e) => setData('3rd_grading', e.target.value)}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">4th Grading</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={data['4th_grading']}
                                                        onChange={(e) => setData('4th_grading', e.target.value)}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 mb-2">1st Semester</h5>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700">Midterm</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    max="100"
                                                                    value={data['1st_semester_midterm']}
                                                                    onChange={(e) => setData('1st_semester_midterm', e.target.value)}
                                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700">Pre-Final</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    max="100"
                                                                    value={data['1st_semester_pre_final']}
                                                                    onChange={(e) => setData('1st_semester_pre_final', e.target.value)}
                                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700">Final</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    max="100"
                                                                    value={data['1st_semester_final']}
                                                                    onChange={(e) => setData('1st_semester_final', e.target.value)}
                                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 mb-2">2nd Semester</h5>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700">Midterm</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    max="100"
                                                                    value={data['2nd_semester_midterm']}
                                                                    onChange={(e) => setData('2nd_semester_midterm', e.target.value)}
                                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700">Pre-Final</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    max="100"
                                                                    value={data['2nd_semester_pre_final']}
                                                                    onChange={(e) => setData('2nd_semester_pre_final', e.target.value)}
                                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700">Final</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    max="100"
                                                                    value={data['2nd_semester_final']}
                                                                    onChange={(e) => setData('2nd_semester_final', e.target.value)}
                                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Remarks
                                        </label>
                                        <textarea
                                            value={data.remarks}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Additional comments or notes..."
                                        />
                                        {errors.remarks && (
                                            <p className="mt-1 text-sm text-red-600">{errors.remarks}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : (editingGrade ? 'Update' : 'Create')}
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