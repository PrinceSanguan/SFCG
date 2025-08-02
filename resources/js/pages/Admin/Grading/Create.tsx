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
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentType, setStudentType] = useState<'elementary' | 'junior_high' | 'senior_high' | 'college' | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterGradeLevel, setFilterGradeLevel] = useState<string>('');
    const [filterSection, setFilterSection] = useState<string>('');
    const [showStudentModal, setShowStudentModal] = useState<boolean>(false);

    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        subject_id: '',
        academic_period_id: '',
        instructor_id: '',
        section: '',
        student_type: '',
        // Elementary/Junior High: 4 quarters
        '1st_grading': '',
        '2nd_grading': '',
        '3rd_grading': '',
        '4th_grading': '',
        // Senior High: 2 semesters (1st: 1st-2nd grading, 2nd: 3rd-4th grading)
        '1st_semester_midterm': '',
        '1st_semester_pre_final': '',
        '1st_semester_final': '',
        '2nd_semester_midterm': '',
        '2nd_semester_pre_final': '',
        '2nd_semester_final': '',
        // Legacy fields
        prelim_grade: '',
        midterm_grade: '',
        final_grade: '',
        overall_grade: '',
        remarks: ''
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

    const handleStudentSelect = (student: Student) => {
        setSelectedStudent(student);
        setData('student_id', student.id.toString());
        setData('section', student.student_profile?.section || '');
        
        const type = determineStudentType(student);
        setStudentType(type);
        
        setShowStudentModal(false);
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
        setData('final_grade', finalGrade);
    };

    // Senior High: 2 Semesters (1st: 1st-2nd grading, 2nd: 3rd-4th grading)
    const handleSemesterGradeChange = (field: '1st_grading' | '2nd_grading' | '3rd_grading' | '4th_grading', value: string) => {
        setData(field, value);
        
        // Calculate semester averages
        const firstSemester = ((parseFloat(data['1st_grading']) || 0) + (parseFloat(data['2nd_grading']) || 0)) / 2;
        const secondSemester = ((parseFloat(data['3rd_grading']) || 0) + (parseFloat(data['4th_grading']) || 0)) / 2;
        
        // Calculate final grade: average of both semesters
        const finalGrade = ((firstSemester + secondSemester) / 2).toFixed(2);
        setData('final_grade', finalGrade);
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
        setData('final_grade', finalGrade);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Set the student type before submitting
        setData('student_type', studentType || '');
        
        post('/admin/grading');
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.student_profile?.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesGradeLevel = !filterGradeLevel || student.student_profile?.grade_level === filterGradeLevel;
        const matchesSection = !filterSection || student.student_profile?.section === filterSection;
        
        return matchesSearch && matchesGradeLevel && matchesSection;
    });

    const uniqueGradeLevels = [...new Set(students.map(s => s.student_profile?.grade_level).filter(Boolean))];
    const uniqueSections = [...new Set(students.map(s => s.student_profile?.section).filter(Boolean))];

    return (
        <>
            <Head title="Create Grade" />
            <div className="min-h-screen bg-gray-100">
                <Header />
                <div className="flex">
                <Sidebar />
                    <main className="flex-1 p-8">
                        <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Create Grade</h1>
                                <p className="text-gray-600 mt-2">Add a new grade record for a student</p>
                        </div>

                            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    {/* Student Selection */}
                                <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Student *
                                        </label>
                                    <div className="flex gap-2">
                                            <input
                                                type="text"
                                            value={selectedStudent ? `${selectedStudent.name} (${selectedStudent.student_profile?.student_id})` : ''}
                                            onClick={() => setShowStudentModal(true)}
                                                readOnly
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                                            placeholder="Click to select student"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowStudentModal(true)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                            Select
                                            </button>
                                    </div>
                                    {errors.student_id && <p className="text-red-600 text-sm mt-1">{errors.student_id}</p>}
                                        </div>

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

                                    {/* Subject Selection */}
                                <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject *
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
                                    {errors.subject_id && <p className="text-red-600 text-sm mt-1">{errors.subject_id}</p>}
                                    </div>

                                    {/* Academic Period */}
                                <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Academic Period *
                                        </label>
                                        <select
                                        value={data.academic_period_id}
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
                                    {errors.academic_period_id && <p className="text-red-600 text-sm mt-1">{errors.academic_period_id}</p>}
                                    </div>

                                {/* Instructor */}
                                <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Instructor *
                                        </label>
                                        <select
                                        value={data.instructor_id}
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
                                    {errors.instructor_id && <p className="text-red-600 text-sm mt-1">{errors.instructor_id}</p>}
                                    </div>

                                    {/* Section */}
                                <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Section
                                        </label>
                                        <input
                                            type="text"
                                        value={data.section}
                                            onChange={(e) => setData('section', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="e.g., Section A"
                                        />
                                    {errors.section && <p className="text-red-600 text-sm mt-1">{errors.section}</p>}
                                </div>

                                {/* Dynamic Grading Sections */}
                                {(studentType === 'elementary' || studentType === 'junior_high') && (
                                <div className="mt-8">
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
                                                <span className="text-2xl font-bold text-green-900">{data.final_grade || '0.00'}</span>
                                            </div>
                                            <p className="text-sm text-green-700 mt-1">Average of all 4 quarters</p>
                                        </div>
                                    </div>
                                )}

                                {/* Semester Grades - Senior High */}
                                {studentType === 'senior_high' && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Semester Grades</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        </div>
                                        
                                        {/* Final Grade Display */}
                                        <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium text-green-900">Final Grade (Auto-calculated)</h4>
                                                <span className="text-2xl font-bold text-green-900">{data.final_grade || '0.00'}</span>
                                            </div>
                                            <p className="text-sm text-green-700 mt-1">Average of both semesters</p>
                                        </div>
                                    </div>
                                )}

                                {/* College Grades */}
                                {studentType === 'college' && (
                                <div className="mt-8">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">College Grades</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Show 1st Semester only if 1st semester period is selected */}
                                            {(data.academic_period_id === '' || 
                                              academicPeriods.find(p => p.id.toString() === data.academic_period_id)?.name.toLowerCase().includes('1st') ||
                                              academicPeriods.find(p => p.id.toString() === data.academic_period_id)?.name.toLowerCase().includes('first')) && (
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
                                            
                                            {/* Show 2nd Semester only if 2nd semester period is selected */}
                                            {(data.academic_period_id === '' || 
                                              academicPeriods.find(p => p.id.toString() === data.academic_period_id)?.name.toLowerCase().includes('2nd') ||
                                              academicPeriods.find(p => p.id.toString() === data.academic_period_id)?.name.toLowerCase().includes('second')) && (
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
                                                <span className="text-2xl font-bold text-green-900">{data.final_grade || '0.00'}</span>
                                            </div>
                                            <p className="text-sm text-green-700 mt-1">Average of both semesters</p>
                                        </div>
                                    </div>
                                )}

                                {/* Remarks */}
                                <div className="mt-8">
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
                                    {errors.remarks && <p className="text-red-600 text-sm mt-1">{errors.remarks}</p>}
                                </div>

                                {/* Submit Button */}
                                <div className="mt-8 flex justify-end space-x-3">
                                    <Link
                                        href="/admin/grading"
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing || !selectedStudent}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Grade'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </main>
                </div>

                {/* Student Selection Modal */}
                {showStudentModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Student</h3>
                                
                                {/* Search and Filters */}
                                <div className="mb-4 space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or student ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <select
                                            value={filterGradeLevel}
                                            onChange={(e) => setFilterGradeLevel(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Grade Levels</option>
                                            {uniqueGradeLevels.map((level) => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={filterSection}
                                            onChange={(e) => setFilterSection(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Sections</option>
                                            {uniqueSections.map((section) => (
                                                <option key={section} value={section}>{section}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Students List */}
                                <div className="max-h-96 overflow-y-auto">
                                    {filteredStudents.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">No students found</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredStudents.map((student) => (
                                                <div
                                                    key={student.id}
                                                    onClick={() => handleStudentSelect(student)}
                                                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">{student.name}</h3>
                                                            <p className="text-sm text-gray-500">
                                                                {student.email} • {student.student_profile?.student_id}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {student.student_profile?.grade_level} • {student.student_profile?.section}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                student.student_profile?.college_course
                                                                    ? 'bg-purple-100 text-purple-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {student.student_profile?.college_course ? 'College' : 'K-12'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowStudentModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default GradingCreate; 