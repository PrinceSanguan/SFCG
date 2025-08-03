import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

interface Student {
    id: number;
    name: string;
    email: string;
    student_profile: {
        student_id: string;
        grade_level: string;
        section: string;
        academic_level: {
            id: number;
            name: string;
        };
    };
}

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface AcademicPeriod {
    id: number;
    name: string;
}

interface Instructor {
    id: number;
    name: string;
}

interface Props {
    students: Student[];
    subjects: Subject[];
    academicPeriods: AcademicPeriod[];
    instructors: Instructor[];
}

const CreateSeniorHigh: React.FC<Props> = ({ students, subjects, academicPeriods, instructors }) => {
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        subject_id: '',
        academic_period_id: '',
        instructor_id: '',
        section: '',
        quarterly_grades: [
            { quarter: 1, grade: '', weight: 25 },
            { quarter: 2, grade: '', weight: 25 },
            { quarter: 3, grade: '', weight: 25 },
            { quarter: 4, grade: '', weight: 25 }
        ],
        final_grade: '',
        remarks: '',
        status: 'draft'
    });

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const handleStudentChange = (studentId: string) => {
        setData('student_id', studentId);
        const student = students.find(s => s.id.toString() === studentId);
        setSelectedStudent(student || null);
        if (student) {
            setData('section', student.student_profile.section);
        }
    };

    const handleQuarterlyGradeChange = (index: number, field: 'grade' | 'weight', value: string) => {
        const newQuarterlyGrades = [...data.quarterly_grades];
        newQuarterlyGrades[index] = {
            ...newQuarterlyGrades[index],
            [field]: field === 'weight' ? parseFloat(value) || 0 : parseFloat(value) || 0
        };
        setData('quarterly_grades', newQuarterlyGrades);

        // Calculate final grade
        const totalWeight = newQuarterlyGrades.reduce((sum, q) => sum + (q.weight || 0), 0);
        const weightedSum = newQuarterlyGrades.reduce((sum, q) => sum + ((q.grade || 0) * (q.weight || 0)), 0);
        const finalGrade = totalWeight > 0 ? weightedSum / totalWeight : 0;
        setData('final_grade', finalGrade.toFixed(2));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/grading', {
            onSuccess: () => {
                // Reset form or redirect
            }
        });
    };

    const getGradeColor = (grade: number) => {
        if (grade >= 90) return 'text-green-600 font-semibold';
        if (grade >= 75) return 'text-blue-600 font-semibold';
        return 'text-red-600 font-semibold';
    };

    return (
        <>
            <Head title="Create Senior High School Grade" />
            <AdminLayout>
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Create Senior High School Grade</h1>
                            <p className="text-gray-600 mt-2">Add new grades for Senior High School students (Grades 11-12)</p>
                        </div>
                        <Link
                            href="/admin/grading/senior-high"
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            ← Back to Senior High Grades
                        </Link>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Grade Information</h2>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Student <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.student_id}
                                        onChange={(e) => handleStudentChange(e.target.value)}
                                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                            errors.student_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Student</option>
                                        {students.map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.name} - {student.student_profile.student_id} (Grade {student.student_profile.grade_level}, {student.student_profile.section})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.student_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.student_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.subject_id}
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                            errors.subject_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name} ({subject.code})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subject_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.subject_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Academic Period <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.academic_period_id}
                                        onChange={(e) => setData('academic_period_id', e.target.value)}
                                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                            errors.academic_period_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Academic Period</option>
                                        {academicPeriods.map((period) => (
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instructor <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.instructor_id}
                                        onChange={(e) => setData('instructor_id', e.target.value)}
                                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                            errors.instructor_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Instructor</option>
                                        {instructors.map((instructor) => (
                                            <option key={instructor.id} value={instructor.id}>
                                                {instructor.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.instructor_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.instructor_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.section}
                                        onChange={(e) => setData('section', e.target.value)}
                                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                            errors.section ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="e.g., A, B, C"
                                    />
                                    {errors.section && (
                                        <p className="text-red-500 text-sm mt-1">{errors.section}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="submitted">Submitted</option>
                                        <option value="approved">Approved</option>
                                    </select>
                                </div>
                            </div>

                            {/* Student Information Display */}
                            {selectedStudent && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-purple-800 mb-2">Student Information</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-purple-700 font-medium">Name:</span>
                                            <p className="text-purple-800">{selectedStudent.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-purple-700 font-medium">Student ID:</span>
                                            <p className="text-purple-800">{selectedStudent.student_profile.student_id}</p>
                                        </div>
                                        <div>
                                            <span className="text-purple-700 font-medium">Grade Level:</span>
                                            <p className="text-purple-800">Grade {selectedStudent.student_profile.grade_level}</p>
                                        </div>
                                        <div>
                                            <span className="text-purple-700 font-medium">Section:</span>
                                            <p className="text-purple-800">{selectedStudent.student_profile.section}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quarterly Grades */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Quarterly Grades</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {data.quarterly_grades.map((quarter, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Quarter {quarter.quarter}</h4>
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Grade</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="0.01"
                                                        value={quarter.grade}
                                                        onChange={(e) => handleQuarterlyGradeChange(index, 'grade', e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Weight (%)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="0.01"
                                                        value={quarter.weight}
                                                        onChange={(e) => handleQuarterlyGradeChange(index, 'weight', e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        placeholder="25"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Final Grade */}
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-purple-800">Final Grade</h3>
                                        <p className="text-sm text-purple-600">Automatically calculated based on quarterly grades</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-3xl font-bold ${getGradeColor(parseFloat(data.final_grade) || 0)}`}>
                                            {data.final_grade || '0.00'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Remarks
                                </label>
                                <textarea
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Additional comments or notes..."
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                <Link
                                    href="/admin/grading/senior-high"
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Creating...' : 'Create Grade'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
};

export default CreateSeniorHigh; 