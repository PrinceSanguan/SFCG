import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';

interface Student {
    id: number;
    name: string;
    email: string;
    student_profile?: {
        student_id: string;
        grade_level: string;
        section: string;
    } | null;
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

const GradingCreate: React.FC<Props> = ({ 
    students = [], 
    subjects = [], 
    academicPeriods = [], 
    instructors = [] 
}) => {
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        subject_id: '',
        academic_period_id: '',
        instructor_id: '',
        section: '',
        quarterly_grades: [
            { quarter: 1, grade: 0, weight: 25 },
            { quarter: 2, grade: 0, weight: 25 },
            { quarter: 3, grade: 0, weight: 25 },
            { quarter: 4, grade: 0, weight: 25 }
        ],
        final_grade: '0',
        remarks: ''
    });

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterGradeLevel, setFilterGradeLevel] = useState<string>('');
    const [filterSection, setFilterSection] = useState<string>('');
    const [showStudentModal, setShowStudentModal] = useState<boolean>(false);

    const handleQuarterlyGradeChange = (index: number, field: 'grade' | 'weight', value: string) => {
        const newQuarterlyGrades = [...data.quarterly_grades];
        const numericValue = parseFloat(value) || 0;
        newQuarterlyGrades[index] = {
            ...newQuarterlyGrades[index],
            [field]: numericValue
        };
        setData('quarterly_grades', newQuarterlyGrades);

        // Auto-calculate final grade
        const totalWeight = newQuarterlyGrades.reduce((sum, qg) => sum + (qg.weight || 0), 0);
        if (totalWeight > 0) {
            const weightedSum = newQuarterlyGrades.reduce((sum, qg) => {
                const grade = qg.grade || 0;
                const weight = qg.weight || 0;
                return sum + (grade * weight);
            }, 0);
            const calculatedFinalGrade = weightedSum / totalWeight;
            setData('final_grade', calculatedFinalGrade.toFixed(2));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/grading');
    };



    // Filter students based on search and filters
    const filteredStudents = students.filter(student => {
        const matchesSearch = !searchTerm || 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.student_profile?.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesGradeLevel = !filterGradeLevel || 
            student.student_profile?.grade_level === filterGradeLevel;
        
        const matchesSection = !filterSection || 
            student.student_profile?.section === filterSection;
        
        return matchesSearch && matchesGradeLevel && matchesSection;
    });

    // Get unique grade levels and sections for filters
    const gradeLevels = [...new Set(students.map(s => s.student_profile?.grade_level).filter(Boolean))];
    const sections = [...new Set(students.map(s => s.student_profile?.section).filter(Boolean))];

    const handleStudentSelect = (student: Student) => {
        setSelectedStudent(student);
        setData('student_id', student.id.toString());
        if (student.student_profile) {
            setData('section', student.student_profile.section);
        }
        setShowStudentModal(false);
        setSearchTerm('');
        setFilterGradeLevel('');
        setFilterSection('');
    };

    return (
        <>
            <Head title="Add Grade" />
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Add Grade</h1>
                                    <p className="text-gray-600 mt-2">Create a new student grade record</p>
                                </div>
                                <Link
                                    href="/admin/grading"
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    ← Back to Grading
                                </Link>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Student Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Student *
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={selectedStudent ? `${selectedStudent.name} - ${selectedStudent.student_profile?.student_id || 'No ID'} (${selectedStudent.student_profile?.grade_level || 'No Level'})` : ''}
                                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                                                placeholder="Select a student..."
                                                readOnly
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowStudentModal(true)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                {selectedStudent ? 'Change' : 'Select'}
                                            </button>
                                            {selectedStudent && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedStudent(null);
                                                        setData('student_id', '');
                                                        setData('section', '');
                                                    }}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        {errors.student_id && (
                                            <p className="text-red-600 text-sm mt-1">{errors.student_id}</p>
                                        )}
                                    </div>

                                    {/* Subject Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject *
                                        </label>
                                        <select
                                            value={data.subject_id || ''}
                                            onChange={(e) => setData('subject_id', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects && subjects.length > 0 ? (
                                                subjects.map((subject) => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.code} - {subject.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No subjects available</option>
                                            )}
                                        </select>
                                        {errors.subject_id && (
                                            <p className="text-red-600 text-sm mt-1">{errors.subject_id}</p>
                                        )}
                                    </div>

                                    {/* Academic Period */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Academic Period *
                                        </label>
                                        <select
                                            value={data.academic_period_id || ''}
                                            onChange={(e) => setData('academic_period_id', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select Academic Period</option>
                                            {academicPeriods && academicPeriods.length > 0 ? (
                                                academicPeriods.map((period) => (
                                                    <option key={period.id} value={period.id}>
                                                        {period.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No academic periods available</option>
                                            )}
                                        </select>
                                        {errors.academic_period_id && (
                                            <p className="text-red-600 text-sm mt-1">{errors.academic_period_id}</p>
                                        )}
                                    </div>

                                    {/* Instructor Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Instructor *
                                        </label>
                                        <select
                                            value={data.instructor_id || ''}
                                            onChange={(e) => setData('instructor_id', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select Instructor</option>
                                            {instructors && instructors.length > 0 ? (
                                                instructors.map((instructor) => (
                                                    <option key={instructor.id} value={instructor.id}>
                                                        {instructor.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No instructors available</option>
                                            )}
                                        </select>
                                        {errors.instructor_id && (
                                            <p className="text-red-600 text-sm mt-1">{errors.instructor_id}</p>
                                        )}
                                    </div>

                                    {/* Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Section
                                        </label>
                                        <input
                                            type="text"
                                            value={data.section || ''}
                                            onChange={(e) => setData('section', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="e.g., A, B, C"
                                        />
                                        {errors.section && (
                                            <p className="text-red-600 text-sm mt-1">{errors.section}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Quarterly Grades */}
                                <div className="mt-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quarterly Grades</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {data.quarterly_grades.map((quarterlyGrade, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-700 mb-3">Quarter {quarterlyGrade.quarter}</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm text-gray-600 mb-1">
                                                            Grade
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            value={quarterlyGrade.grade}
                                                            onChange={(e) => handleQuarterlyGradeChange(index, 'grade', e.target.value)}
                                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-600 mb-1">
                                                            Weight (%)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            value={quarterlyGrade.weight}
                                                            onChange={(e) => handleQuarterlyGradeChange(index, 'weight', e.target.value)}
                                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="25"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Final Grade */}
                                <div className="mt-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Final Grade
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.final_grade || '0'}
                                                onChange={(e) => setData('final_grade', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                                                placeholder="0.00"
                                                readOnly
                                            />
                                            <p className="text-sm text-gray-500 mt-1">Auto-calculated based on quarterly grades</p>
                                            {errors.final_grade && (
                                                <p className="text-red-600 text-sm mt-1">{errors.final_grade}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Remarks
                                            </label>
                                            <textarea
                                                value={data.remarks || ''}
                                                onChange={(e) => setData('remarks', e.target.value)}
                                                rows={3}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Additional comments or notes..."
                                            />
                                            {errors.remarks && (
                                                <p className="text-red-600 text-sm mt-1">{errors.remarks}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="mt-8 flex justify-end space-x-4">
                                    <Link
                                        href="/admin/grading"
                                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {processing ? 'Saving...' : 'Save Grade'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </main>
                </div>
            </div>

            {/* Student Selection Modal */}
            {showStudentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Select Student</h3>
                            <button
                                onClick={() => setShowStudentModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Search and Filters */}
                        <div className="mb-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search Students
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Search by name, email, or student ID..."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Filter by Grade Level
                                    </label>
                                    <select
                                        value={filterGradeLevel}
                                        onChange={(e) => setFilterGradeLevel(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Grade Levels</option>
                                        {gradeLevels.map((level) => (
                                            <option key={level} value={level}>
                                                {level}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Filter by Section
                                    </label>
                                    <select
                                        value={filterSection}
                                        onChange={(e) => setFilterSection(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Sections</option>
                                        {sections.map((section) => (
                                            <option key={section} value={section}>
                                                {section}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Students List */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                                    <div className="col-span-4">Name</div>
                                    <div className="col-span-3">Student ID</div>
                                    <div className="col-span-2">Grade Level</div>
                                    <div className="col-span-2">Section</div>
                                    <div className="col-span-1">Action</div>
                                </div>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {filteredStudents.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        No students found matching your criteria
                                    </div>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <div
                                            key={student.id}
                                            className="px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleStudentSelect(student)}
                                        >
                                            <div className="grid grid-cols-12 gap-4 text-sm">
                                                <div className="col-span-4 font-medium text-gray-900">
                                                    {student.name}
                                                </div>
                                                <div className="col-span-3 text-gray-600">
                                                    {student.student_profile?.student_id || 'No ID'}
                                                </div>
                                                <div className="col-span-2 text-gray-600">
                                                    {student.student_profile?.grade_level || 'No Level'}
                                                </div>
                                                <div className="col-span-2 text-gray-600">
                                                    {student.student_profile?.section || 'No Section'}
                                                </div>
                                                <div className="col-span-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStudentSelect(student);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Select
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setShowStudentModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GradingCreate; 