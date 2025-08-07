import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

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

interface InstructorAssignment {
    id: number;
    instructor: {
        id: number;
        name: string;
        email: string;
    };
    academic_period: {
        id: number;
        name: string;
        school_year: string;
    };
    section: string;
    year_level: string;
    is_active: boolean;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    academicLevel: {
        name: string;
    };
    instructor_assignments?: InstructorAssignment[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    assignedStudents: Student[];
    subjects: Subject[];
}

const AddGradeModal: React.FC<Props> = ({ isOpen, onClose, assignedStudents, subjects }) => {
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Debug: Log the data being received
    console.log('AddGradeModal - Data received:', {
        subjectsCount: subjects?.length || 0,
        assignedStudentsCount: assignedStudents?.length || 0,
        subjects: subjects,
        assignedStudents: assignedStudents
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        student_id: '',
        subject_id: '',
        academic_period_id: '1', // Default to first period
        section: '',
        first_grading: '',
        second_grading: '',
        third_grading: '',
        fourth_grading: '',
        overall_grade: '',
        remarks: '',
    });

    // Load students when subject changes using API
    useEffect(() => {
        if (selectedSubject) {
            setLoadingStudents(true);
            
            console.log('Loading students for subject:', selectedSubject.id);
            
            // Always use section 'A' for now since we know the student is in section A
            const section = 'A';
            
            console.log('API Call Parameters:', {
                subject_id: selectedSubject.id,
                academic_period_id: 1,
                section: section
            });
            
            fetch(`/class-adviser/api/students-for-subject?subject_id=${selectedSubject.id}&academic_period_id=1&section=${section}`)
                .then(response => {
                    console.log('API Response status:', response.status);
                    return response.json();
                })
                .then(data => {
                    console.log('API Response data:', data);
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
    }, [selectedSubject]);

    const handleSubjectChange = (subjectId: string) => {
        const subject = subjects.find(s => s.id.toString() === subjectId);
        setSelectedSubject(subject || null);
        
        if (subject) {
            setData({
                ...data,
                subject_id: subject.id.toString(),
                academic_period_id: '1',
                section: '',
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
                section: student.section || (student.studentProfile ? student.studentProfile.section : ''),
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
                onClose();
                // Refresh the page to show the new grade
                window.location.reload();
            },
        });
    };

    const handleClose = () => {
        reset();
        setSelectedSubject(null);
        setFilteredStudents([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Add New Grade</h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Subject Selection */}
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
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name} ({subject.code})
                                    </option>
                                ))}
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
                                        {student.name} ({student.student_id || student.email}) - {student.section || (student.studentProfile ? student.studentProfile.section : '')}
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
                                    🔄 Loading students for {selectedSubject.academicLevel?.name || 'Unknown Level'}...
                                </p>
                            )}
                            {selectedSubject && !loadingStudents && filteredStudents.length === 0 && (
                                <p className="mt-1 text-sm text-orange-600">
                                    ⚠️ No students found for {selectedSubject.academicLevel?.name || 'Unknown Level'}. Please check if students are assigned to your class.
                                </p>
                            )}
                            {selectedSubject && !loadingStudents && filteredStudents.length > 0 && (
                                <p className="mt-1 text-sm text-green-600">
                                    ✅ Found {filteredStudents.length} student(s) for {selectedSubject.academicLevel?.name || 'Unknown Level'}.
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

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Cancel
                            </button>
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
    );
};

export default AddGradeModal;
