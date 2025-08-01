import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';

interface Student {
    id: number;
    name: string;
    email: string;
    student_profile: {
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

interface AcademicPeriod {
    id: number;
    name: string;
}

interface Instructor {
    id: number;
    name: string;
}

interface Grade {
    id: number;
    student: Student;
    subject: Subject;
    academic_period: AcademicPeriod;
    instructor: Instructor;
    section: string;
    quarterly_grades?: Array<{
        quarter: number;
        grade: number;
        weight: number;
    }>;
    semester_grades?: Array<{
        semester: number;
        first_grading?: number;
        second_grading?: number;
        third_grading?: number;
        fourth_grading?: number;
        weight: number;
    }>;
    college_grades?: Array<{
        semester: number;
        midterm: number;
        pre_final: number;
        final: number;
        weight: number;
    }>;
    final_grade: number;
    status: string;
    remarks: string;
    submitted_at: string;
    approved_at?: string;
}

interface FormData {
    student_id: string;
    subject_id: string;
    academic_period_id: string;
    instructor_id: string;
    section: string;
    quarterly_grades?: Array<{
        quarter: number;
        grade: number;
        weight: number;
    }>;
    semester_grades?: Array<{
        semester: number;
        first_grading?: number;
        second_grading?: number;
        third_grading?: number;
        fourth_grading?: number;
        weight: number;
    }>;
    college_grades?: Array<{
        semester: number;
        midterm: number;
        pre_final: number;
        final: number;
        weight: number;
    }>;
    final_grade: string;
    remarks: string;
    status: string;
    [key: string]: unknown;
}

interface Props {
    grade: Grade;
    students: Student[];
    subjects: Subject[];
    academicPeriods: AcademicPeriod[];
    instructors: Instructor[];
}

const GradingEdit: React.FC<Props> = ({ 
    grade, 
    students = [], 
    subjects = [], 
    academicPeriods = [], 
    instructors = [] 
}) => {
    // Determine student type based on the grade data
    const determineStudentType = (grade: Grade): 'elementary' | 'junior_high' | 'senior_high' | 'college' => {
        if (grade.student.student_profile?.college_course) {
            return 'college';
        }
        
        const academicLevel = grade.student.student_profile?.academic_level;
        if (!academicLevel) return 'elementary';
        
        const levelCode = academicLevel.code.toUpperCase();
        
        if (levelCode.includes('ELEM') || levelCode.includes('ELEMENTARY')) {
            return 'elementary';
        } else if (levelCode.includes('JHS') || levelCode.includes('JUNIOR')) {
            return 'junior_high';
        } else if (levelCode.includes('SHS') || levelCode.includes('SENIOR')) {
            return 'senior_high';
        }
        
        return 'elementary'; // default
    };

    const studentType = determineStudentType(grade);

    // Initialize form data based on student type
    const getInitialFormData = () => {
        const baseData = {
            student_id: grade.student.id.toString(),
            subject_id: grade.subject.id.toString(),
            academic_period_id: grade.academic_period.id.toString(),
            instructor_id: grade.instructor.id.toString(),
            section: grade.section,
            final_grade: grade.final_grade.toString(),
            remarks: grade.remarks || '',
            status: grade.status
        };

        // Add grade structure based on student type
        if (studentType === 'elementary' || studentType === 'junior_high') {
            return {
                ...baseData,
                quarterly_grades: grade.quarterly_grades || [
                    { quarter: 1, grade: 0, weight: 25 },
                    { quarter: 2, grade: 0, weight: 25 },
                    { quarter: 3, grade: 0, weight: 25 },
                    { quarter: 4, grade: 0, weight: 25 }
                ]
            };
        } else if (studentType === 'senior_high') {
            return {
                ...baseData,
                semester_grades: grade.semester_grades || [
                    { semester: 1, first_grading: 0, second_grading: 0, weight: 50 },
                    { semester: 2, third_grading: 0, fourth_grading: 0, weight: 50 }
                ]
            };
        } else if (studentType === 'college') {
            return {
                ...baseData,
                college_grades: grade.college_grades || [
                    { semester: 1, midterm: 0, pre_final: 0, final: 0, weight: 50 },
                    { semester: 2, midterm: 0, pre_final: 0, final: 0, weight: 50 }
                ]
            };
        }

        return baseData;
    };

    const { data, setData, put, processing, errors } = useForm<FormData>(getInitialFormData());

    const [selectedStudent, setSelectedStudent] = useState<Student>(grade.student);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterGradeLevel, setFilterGradeLevel] = useState<string>('');
    const [filterSection, setFilterSection] = useState<string>('');
    const [showStudentModal, setShowStudentModal] = useState<boolean>(false);

    const handleQuarterlyGradeChange = (index: number, field: 'grade' | 'weight', value: string) => {
        const newQuarterlyGrades = [...(data.quarterly_grades || [])];
        const numericValue = parseFloat(value) || 0;
        newQuarterlyGrades[index] = {
            ...newQuarterlyGrades[index],
            [field]: numericValue
        };
        setData('quarterly_grades', newQuarterlyGrades);

        // Auto-calculate final grade for Elementary/Junior High
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

    const handleSemesterGradeChange = (index: number, field: 'first_grading' | 'second_grading' | 'third_grading' | 'fourth_grading' | 'weight', value: string) => {
        const newSemesterGrades = [...(data.semester_grades || [])];
        const numericValue = parseFloat(value) || 0;
        newSemesterGrades[index] = {
            ...newSemesterGrades[index],
            [field]: numericValue
        };
        setData('semester_grades', newSemesterGrades);

        // Auto-calculate final grade for Senior High
        const totalWeight = newSemesterGrades.reduce((sum, sg) => sum + (sg.weight || 0), 0);
        if (totalWeight > 0) {
            let totalGrade = 0;
            let totalWeightedGrade = 0;
            
            newSemesterGrades.forEach(semester => {
                if (semester.semester === 1) {
                    const semesterGrade = ((semester.first_grading || 0) + (semester.second_grading || 0)) / 2;
                    totalGrade += semesterGrade * (semester.weight || 0);
                    totalWeightedGrade += semester.weight || 0;
                } else if (semester.semester === 2) {
                    const semesterGrade = ((semester.third_grading || 0) + (semester.fourth_grading || 0)) / 2;
                    totalGrade += semesterGrade * (semester.weight || 0);
                    totalWeightedGrade += semester.weight || 0;
                }
            });
            
            if (totalWeightedGrade > 0) {
                const calculatedFinalGrade = totalGrade / totalWeightedGrade;
                setData('final_grade', calculatedFinalGrade.toFixed(2));
            }
        }
    };

    const handleCollegeGradeChange = (index: number, field: 'midterm' | 'pre_final' | 'final' | 'weight', value: string) => {
        const newCollegeGrades = [...(data.college_grades || [])];
        const numericValue = parseFloat(value) || 0;
        newCollegeGrades[index] = {
            ...newCollegeGrades[index],
            [field]: numericValue
        };
        setData('college_grades', newCollegeGrades);

        // Auto-calculate final grade for College
        const totalWeight = newCollegeGrades.reduce((sum, cg) => sum + (cg.weight || 0), 0);
        if (totalWeight > 0) {
            let totalGrade = 0;
            let totalWeightedGrade = 0;
            
            newCollegeGrades.forEach(semester => {
                // College formula: (Midterm + Pre-Final) / 2 = Final Grade per semester
                const semesterGrade = ((semester.midterm || 0) + (semester.pre_final || 0)) / 2;
                totalGrade += semesterGrade * (semester.weight || 0);
                totalWeightedGrade += semester.weight || 0;
            });
            
            if (totalWeightedGrade > 0) {
                const calculatedFinalGrade = totalGrade / totalWeightedGrade;
                setData('final_grade', calculatedFinalGrade.toFixed(2));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/grading/${grade.id}`);
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
            <Head title={`Edit Grade - ${grade.student.name}`} />
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Edit Grade</h1>
                                    <p className="text-gray-600 mt-2">Update grade information for {grade.student.name}</p>
                                </div>
                                <div className="flex space-x-3">
                                    <Link
                                        href="/admin/grading"
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        ← Back to Grading
                                    </Link>
                                    <Link
                                        href={`/admin/grading/${grade.id}`}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        View Grade
                                    </Link>
                                </div>
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
                                                Change
                                            </button>
                                        </div>
                                        {errors.student_id && <p className="text-red-500 text-xs mt-1">{errors.student_id}</p>}
                                    </div>

                                    {/* Subject */}
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
                                            {subjects.map((subject) => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.name} ({subject.code})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.subject_id && <p className="text-red-500 text-xs mt-1">{errors.subject_id}</p>}
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
                                            {academicPeriods.map((period) => (
                                                <option key={period.id} value={period.id}>
                                                    {period.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.academic_period_id && <p className="text-red-500 text-xs mt-1">{errors.academic_period_id}</p>}
                                    </div>

                                    {/* Instructor */}
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
                                            {instructors.map((instructor) => (
                                                <option key={instructor.id} value={instructor.id}>
                                                    {instructor.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.instructor_id && <p className="text-red-500 text-xs mt-1">{errors.instructor_id}</p>}
                                    </div>

                                    {/* Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Section *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.section || ''}
                                            onChange={(e) => setData('section', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={data.status || ''}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="submitted">Submitted</option>
                                            <option value="approved">Approved</option>
                                            <option value="finalized">Finalized</option>
                                        </select>
                                        {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                                    </div>
                                </div>

                                {/* Quarterly Grades */}
                                {studentType === 'elementary' || studentType === 'junior_high' ? (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quarterly Grades</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {data.quarterly_grades?.map((quarterlyGrade, index) => (
                                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="font-medium text-gray-900 mb-3">Quarter {quarterlyGrade.quarter}</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Grade
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                value={quarterlyGrade.grade}
                                                                onChange={(e) => handleQuarterlyGradeChange(index, 'grade', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Weight (%)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                value={quarterlyGrade.weight}
                                                                onChange={(e) => handleQuarterlyGradeChange(index, 'weight', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                {/* Semester Grades */}
                                {studentType === 'senior_high' ? (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Semester Grades</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {data.semester_grades?.map((semesterGrade, index) => (
                                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="font-medium text-gray-900 mb-3">Semester {semesterGrade.semester}</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                First Grading
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                value={semesterGrade.first_grading}
                                                                onChange={(e) => handleSemesterGradeChange(index, 'first_grading', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Second Grading
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                value={semesterGrade.second_grading}
                                                                onChange={(e) => handleSemesterGradeChange(index, 'second_grading', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Weight (%)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                value={semesterGrade.weight}
                                                                onChange={(e) => handleSemesterGradeChange(index, 'weight', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                {/* College Grades */}
                                {studentType === 'college' ? (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">College Grades</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {data.college_grades?.map((collegeGrade, index) => (
                                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="font-medium text-gray-900 mb-3">Semester {collegeGrade.semester}</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Midterm
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                value={collegeGrade.midterm}
                                                                onChange={(e) => handleCollegeGradeChange(index, 'midterm', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Pre-Final
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                value={collegeGrade.pre_final}
                                                                onChange={(e) => handleCollegeGradeChange(index, 'pre_final', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Final
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                value={collegeGrade.final}
                                                                onChange={(e) => handleCollegeGradeChange(index, 'final', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Weight (%)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                value={collegeGrade.weight}
                                                                onChange={(e) => handleCollegeGradeChange(index, 'weight', e.target.value)}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                {/* Final Grade */}
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Final Grade *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={data.final_grade || '0'}
                                        onChange={(e) => setData('final_grade', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                                        required
                                        readOnly
                                    />
                                    {errors.final_grade && <p className="text-red-500 text-xs mt-1">{errors.final_grade}</p>}
                                </div>

                                {/* Remarks */}
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Remarks
                                    </label>
                                    <textarea
                                        value={data.remarks || ''}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Add any additional remarks..."
                                    />
                                    {errors.remarks && <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>}
                                </div>

                                {/* Submit Button */}
                                <div className="mt-8 flex justify-end space-x-3">
                                    <Link
                                        href={`/admin/grading/${grade.id}`}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {processing ? 'Updating...' : 'Update Grade'}
                                    </button>
                                </div>
                            </form>
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
                    </main>
                </div>
            </div>
        </>
    );
};

export default GradingEdit; 