import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import ClassAdviserLayout from '../ClassAdviserLayout';

interface Student {
    id: number;
    name: string;
    email: string;
    student_profile: {
        student_id: string;
        grade_level: string;
        section: string;
    };
}

interface Subject {
    id: number;
    name: string;
    code: string;
    academic_level: {
        name: string;
    };
}

interface AcademicPeriod {
    id: number;
    name: string;
    school_year: string;
}

interface Props {
    adviser: {
        id: number;
        name: string;
        role_display: string;
    };
    assignedStudents: Student[];
    subjects: Subject[];
    academicPeriods: AcademicPeriod[];
}

const Create: React.FC<Props> = ({ adviser, assignedStudents, subjects, academicPeriods }) => {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [quarterlyGrades, setQuarterlyGrades] = useState({
        first: '',
        second: '',
        third: '',
        fourth: ''
    });

    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        subject_id: '',
        academic_period_id: '',
        section: '',
        quarterly_grades: [] as Array<{
            quarter: number;
            grade: number;
            weight: number;
        }>,
        final_grade: 0,
        remarks: '',
    });

    const handleStudentChange = (studentId: string) => {
        const student = assignedStudents.find(s => s.id.toString() === studentId);
        setSelectedStudent(student || null);
        setData('student_id', studentId);
        setData('section', student?.student_profile?.section || '');
    };

    const handleSubjectChange = (subjectId: string) => {
        const subject = subjects.find(s => s.id.toString() === subjectId);
        setSelectedSubject(subject || null);
        setData('subject_id', subjectId);
    };

    const handleQuarterlyGradeChange = (quarter: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setQuarterlyGrades(prev => ({
            ...prev,
            [quarter]: value
        }));

        // Update quarterly grades array
        const updatedGrades = [];
        if (quarterlyGrades.first) updatedGrades.push({ quarter: 1, grade: parseFloat(quarterlyGrades.first), weight: 25 });
        if (quarterlyGrades.second) updatedGrades.push({ quarter: 2, grade: parseFloat(quarterlyGrades.second), weight: 25 });
        if (quarterlyGrades.third) updatedGrades.push({ quarter: 3, grade: parseFloat(quarterlyGrades.third), weight: 25 });
        if (quarterlyGrades.fourth) updatedGrades.push({ quarter: 4, grade: parseFloat(quarterlyGrades.fourth), weight: 25 });
        
        if (quarter === 'first') {
            if (value) updatedGrades.push({ quarter: 1, grade: numValue, weight: 25 });
        } else if (quarter === 'second') {
            if (value) updatedGrades.push({ quarter: 2, grade: numValue, weight: 25 });
        } else if (quarter === 'third') {
            if (value) updatedGrades.push({ quarter: 3, grade: numValue, weight: 25 });
        } else if (quarter === 'fourth') {
            if (value) updatedGrades.push({ quarter: 4, grade: numValue, weight: 25 });
        }

        setData('quarterly_grades', updatedGrades);

        // Calculate final grade
        const validGrades = updatedGrades.filter(g => g.grade > 0);
        if (validGrades.length > 0) {
            const totalGrade = validGrades.reduce((sum, g) => sum + g.grade, 0);
            const finalGrade = totalGrade / validGrades.length;
            setData('final_grade', Math.round(finalGrade * 100) / 100);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/class-adviser/grading/store', {
            onSuccess: () => {
                router.visit('/class-adviser/grading');
            }
        });
    };

    return (
        <>
            <Head title="Add Grade - Class Adviser" />
            <ClassAdviserLayout>
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <Link
                            href="/class-adviser/grading"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            ← Back to Grading
                        </Link>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">✏️</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Add Grade</h1>
                            <p className="text-gray-600">Add a new grade for your assigned student</p>
                        </div>
                    </div>

                    <div className="max-w-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Student Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student *
                                </label>
                                <select
                                    value={data.student_id}
                                    onChange={(e) => handleStudentChange(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select a student</option>
                                    {assignedStudents.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.name} - {student.student_profile.student_id} (Grade {student.student_profile.grade_level} - {student.student_profile.section})
                                        </option>
                                    ))}
                                </select>
                                {errors.student_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
                                )}
                            </div>

                            {/* Subject Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject *
                                </label>
                                <select
                                    value={data.subject_id}
                                    onChange={(e) => handleSubjectChange(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select a subject</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name} ({subject.code}) - {subject.academic_level.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.subject_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
                                )}
                            </div>

                            {/* Academic Period */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Academic Period *
                                </label>
                                <select
                                    value={data.academic_period_id}
                                    onChange={(e) => setData('academic_period_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select an academic period</option>
                                    {academicPeriods.map((period) => (
                                        <option key={period.id} value={period.id}>
                                            {period.name} ({period.school_year})
                                        </option>
                                    ))}
                                </select>
                                {errors.academic_period_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.academic_period_id}</p>
                                )}
                            </div>

                            {/* Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Section
                                </label>
                                <input
                                    type="text"
                                    value={data.section}
                                    onChange={(e) => setData('section', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    readOnly
                                />
                                {errors.section && (
                                    <p className="mt-1 text-sm text-red-600">{errors.section}</p>
                                )}
                            </div>

                            {/* Quarterly Grades */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quarterly Grades
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">1st Quarter</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={quarterlyGrades.first}
                                            onChange={(e) => handleQuarterlyGradeChange('first', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">2nd Quarter</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={quarterlyGrades.second}
                                            onChange={(e) => handleQuarterlyGradeChange('second', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">3rd Quarter</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={quarterlyGrades.third}
                                            onChange={(e) => handleQuarterlyGradeChange('third', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">4th Quarter</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={quarterlyGrades.fourth}
                                            onChange={(e) => handleQuarterlyGradeChange('fourth', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Final Grade */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Final Grade
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.final_grade}
                                    onChange={(e) => setData('final_grade', parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    readOnly
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Automatically calculated from quarterly grades
                                </p>
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
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Additional notes about the grade..."
                                />
                                {errors.remarks && (
                                    <p className="mt-1 text-sm text-red-600">{errors.remarks}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-3">
                                <Link
                                    href="/class-adviser/grading"
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Adding...' : 'Add Grade'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </ClassAdviserLayout>
        </>
    );
};

export default Create;
