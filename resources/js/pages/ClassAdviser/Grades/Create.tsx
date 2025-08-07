import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import ClassAdviserLayout from '../ClassAdviserLayout';

interface Student {
    id: number;
    name: string;
    email: string;
    student_id?: string;
    section?: string;
    studentProfile: {
        student_id: string;
        academicLevel: {
            name: string;
        };
        year_level: string;
        section: string;
    };
}

interface Assignment {
    id: number;
    academicLevel: {
        id: number;
        name: string;
        code: string;
    };
    academicPeriod: {
        id: number;
        name: string;
        school_year: string;
    };
    year_level: string;
    section: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    academicLevel: {
        name: string;
    };
}

interface Props {
    adviser: {
        id: number;
        name: string;
        role_display: string;
    };
    assignments: Assignment[];
    assignedStudents: Student[];
    subjects: Subject[];
}

const ClassAdviserGradesCreate: React.FC<Props> = ({ assignedStudents, subjects }) => {
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        student_id: '',
        subject_id: '',
        academic_period_id: '',
        section: '',
        first_grading: '',
        second_grading: '',
        third_grading: '',
        fourth_grading: '',
        first_semester_midterm: '',
        first_semester_pre_final: '',
        second_semester_midterm: '',
        second_semester_pre_final: '',
        overall_grade: '',
        remarks: '',
    });

    // Load students when subject changes using API
    useEffect(() => {
        if (selectedSubject) {
            setLoadingStudents(true);
            // Get the first assigned student's section as default
            const defaultSection = assignedStudents.length > 0 ? assignedStudents[0].studentProfile.section : '';
            
            fetch(`/class-adviser/api/students-for-subject?subject_id=${selectedSubject.id}&academic_period_id=1&section=${defaultSection}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error('API Error:', data.error);
                        setFilteredStudents([]);
                    } else {
                        setFilteredStudents(data.students || []);
                    }
                    setLoadingStudents(false);
                })
                .catch(error => {
                    console.error('Error loading students:', error);
                    setFilteredStudents([]);
                    setLoadingStudents(false);
                });
        } else {
            setFilteredStudents([]);
        }
    }, [selectedSubject, assignedStudents]);

    const handleSubjectChange = (subjectId: string) => {
        const subject = subjects.find(s => s.id.toString() === subjectId);
        setSelectedSubject(subject || null);
        
        if (subject) {
            setData({
                ...data,
                subject_id: subject.id.toString(),
                academic_period_id: '1', // Default to first period, can be made dynamic
                section: '', // Will be set when student is selected
            });
        } else {
            setData({
                ...data,
                subject_id: '',
                academic_period_id: '',
                section: '',
            });
        }
    };

    const handleStudentChange = (studentId: string) => {
        const student = filteredStudents.find(s => s.id.toString() === studentId);
        
        if (student) {
            setData({
                ...data,
                student_id: student.id.toString(),
                section: student.studentProfile.section,
            });
        } else {
            setData({
                ...data,
                student_id: '',
                section: '',
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/class-adviser/grades', {
            onSuccess: () => {
                reset();
                setSelectedSubject(null);
                setFilteredStudents([]);
            },
        });
    };

    return (
        <>
            <Head title="Create Grade - Class Adviser" />
            <ClassAdviserLayout>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Create New Grade</h1>
                                <p className="text-gray-600 mt-2">Add a new grade entry for a student.</p>
                            </div>
                            <Link
                                href="/class-adviser/grades"
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                ← Back to Grades
                            </Link>
                        </div>
                    </div>

                    {/* Grade Form */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Grade Information</h2>
                            <p className="text-sm text-gray-600 mt-1">Select the subject assignment and student, then enter the grades.</p>
                        </div>
                        <div className="p-6">
                            {/* Debug Information */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Information</h4>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p>📚 Available Subjects: {subjects.length}</p>
                                    <p>👥 Assigned Students: {assignedStudents.length}</p>
                                    <p>📋 Selected Subject: {selectedSubject ? `${selectedSubject.name} (${selectedSubject.academicLevel.name})` : 'None'}</p>
                                    <p>🎯 Filtered Students: {filteredStudents.length} {loadingStudents ? '(Loading...)' : ''}</p>
                                    {subjects.length === 0 && (
                                        <p className="text-orange-600 font-medium">⚠️ No subjects available. Check your class adviser assignments.</p>
                                    )}
                                    {assignedStudents.length === 0 && (
                                        <p className="text-orange-600 font-medium">⚠️ No students assigned to you. Contact the administrator.</p>
                                    )}
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Subject Assignment Selection */}
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                        Subject *
                                    </label>
                                    <select
                                        id="subject"
                                        value={selectedSubject?.id || ''}
                                        onChange={(e) => handleSubjectChange(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select a subject</option>
                                        {subjects.length > 0 ? (
                                            subjects.filter(subject => subject.academicLevel).map((subject) => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.name} ({subject.code}) - {subject.academicLevel.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No subjects available for your assignments</option>
                                        )}
                                    </select>
                                    {subjects.length === 0 && (
                                        <p className="mt-1 text-sm text-orange-600">
                                            ⚠️ No subjects are available. Please contact the administrator to assign subjects to your academic levels.
                                        </p>
                                    )}
                                    {errors.subject_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
                                    )}
                                </div>

                                {/* Student Selection */}
                                <div>
                                    <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                                        Student *
                                    </label>
                                    <select
                                        id="student_id"
                                        value={data.student_id}
                                        onChange={(e) => handleStudentChange(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required
                                        disabled={!selectedSubject || loadingStudents || filteredStudents.length === 0}
                                    >
                                        <option value="">
                                            {!selectedSubject ? 'Please select a subject first' : 
                                             loadingStudents ? 'Loading students...' :
                                             filteredStudents.length === 0 ? 'No students found for this subject' : 'Select a student'}
                                        </option>
                                        {filteredStudents.map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.name} ({student.student_id || student.email}) - {student.section || student.studentProfile.section}
                                            </option>
                                        ))}
                                    </select>
                                    {!selectedSubject && (
                                        <p className="mt-1 text-sm text-blue-600">
                                            💡 Please select a subject first to see available students.
                                        </p>
                                    )}
                                    {selectedSubject && loadingStudents && (
                                        <p className="mt-1 text-sm text-blue-600">
                                            🔄 Loading students for {selectedSubject.academicLevel.name}...
                                        </p>
                                    )}
                                    {selectedSubject && !loadingStudents && filteredStudents.length === 0 && (
                                        <p className="mt-1 text-sm text-orange-600">
                                            ⚠️ No students found for {selectedSubject.academicLevel.name}. Please check if students are assigned to your class.
                                        </p>
                                    )}
                                    {selectedSubject && !loadingStudents && filteredStudents.length > 0 && (
                                        <p className="mt-1 text-sm text-green-600">
                                            ✅ Found {filteredStudents.length} student(s) for {selectedSubject.academicLevel.name}.
                                        </p>
                                    )}
                                    {errors.student_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
                                    )}
                                </div>

                                {/* Quarterly Grades */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 mb-4">Quarterly Grades</h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                                        <div>
                                            <label htmlFor="first_grading" className="block text-sm font-medium text-gray-700">
                                                1st Grading
                                            </label>
                                            <input
                                                type="number"
                                                id="first_grading"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.first_grading}
                                                onChange={(e) => setData('first_grading', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.first_grading && (
                                                <p className="mt-1 text-sm text-red-600">{errors.first_grading}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="second_grading" className="block text-sm font-medium text-gray-700">
                                                2nd Grading
                                            </label>
                                            <input
                                                type="number"
                                                id="second_grading"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.second_grading}
                                                onChange={(e) => setData('second_grading', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.second_grading && (
                                                <p className="mt-1 text-sm text-red-600">{errors.second_grading}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="third_grading" className="block text-sm font-medium text-gray-700">
                                                3rd Grading
                                            </label>
                                            <input
                                                type="number"
                                                id="third_grading"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.third_grading}
                                                onChange={(e) => setData('third_grading', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.third_grading && (
                                                <p className="mt-1 text-sm text-red-600">{errors.third_grading}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="fourth_grading" className="block text-sm font-medium text-gray-700">
                                                4th Grading
                                            </label>
                                            <input
                                                type="number"
                                                id="fourth_grading"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.fourth_grading}
                                                onChange={(e) => setData('fourth_grading', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.fourth_grading && (
                                                <p className="mt-1 text-sm text-red-600">{errors.fourth_grading}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Semester Grades */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 mb-4">Semester Grades</h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                                        <div>
                                            <label htmlFor="first_semester_midterm" className="block text-sm font-medium text-gray-700">
                                                1st Sem Midterm
                                            </label>
                                            <input
                                                type="number"
                                                id="first_semester_midterm"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.first_semester_midterm}
                                                onChange={(e) => setData('first_semester_midterm', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.first_semester_midterm && (
                                                <p className="mt-1 text-sm text-red-600">{errors.first_semester_midterm}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="first_semester_pre_final" className="block text-sm font-medium text-gray-700">
                                                1st Sem Pre-Final
                                            </label>
                                            <input
                                                type="number"
                                                id="first_semester_pre_final"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.first_semester_pre_final}
                                                onChange={(e) => setData('first_semester_pre_final', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.first_semester_pre_final && (
                                                <p className="mt-1 text-sm text-red-600">{errors.first_semester_pre_final}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="second_semester_midterm" className="block text-sm font-medium text-gray-700">
                                                2nd Sem Midterm
                                            </label>
                                            <input
                                                type="number"
                                                id="second_semester_midterm"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.second_semester_midterm}
                                                onChange={(e) => setData('second_semester_midterm', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.second_semester_midterm && (
                                                <p className="mt-1 text-sm text-red-600">{errors.second_semester_midterm}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="second_semester_pre_final" className="block text-sm font-medium text-gray-700">
                                                2nd Sem Pre-Final
                                            </label>
                                            <input
                                                type="number"
                                                id="second_semester_pre_final"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.second_semester_pre_final}
                                                onChange={(e) => setData('second_semester_pre_final', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="0.00"
                                            />
                                            {errors.second_semester_pre_final && (
                                                <p className="mt-1 text-sm text-red-600">{errors.second_semester_pre_final}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Overall Grade */}
                                <div>
                                    <label htmlFor="overall_grade" className="block text-sm font-medium text-gray-700">
                                        Overall Grade
                                    </label>
                                    <input
                                        type="number"
                                        id="overall_grade"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={data.overall_grade}
                                        onChange={(e) => setData('overall_grade', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="0.00"
                                    />
                                    {errors.overall_grade && (
                                        <p className="mt-1 text-sm text-red-600">{errors.overall_grade}</p>
                                    )}
                                </div>

                                {/* Remarks */}
                                <div>
                                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                                        Remarks
                                    </label>
                                    <textarea
                                        id="remarks"
                                        rows={3}
                                        value={data.remarks}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Additional comments or remarks..."
                                    />
                                    {errors.remarks && (
                                        <p className="mt-1 text-sm text-red-600">{errors.remarks}</p>
                                    )}
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href="/class-adviser/grades"
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Grade'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </ClassAdviserLayout>
        </>
    );
};

export default ClassAdviserGradesCreate; 