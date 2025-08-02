import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import RegistrarLayout from '@/pages/Registrar/RegistrarLayout';

interface AcademicLevel {
    id: number;
    name: string;
    code: string;
}

interface AcademicStrand {
    id: number;
    name: string;
    code: string;
    academic_level_id: number;
}

interface CollegeCourse {
    id: number;
    name: string;
    code: string;
}

interface ClassAdviser {
    id: number;
    name: string;
}

interface StudentProfile {
    id: number;
    student_id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    birth_date: string;
    gender: string;
    address: string;
    contact_number?: string;
    grade_level: string;
    section?: string;
    enrollment_status: string;
    year_level?: number;
    semester?: string;
    academic_level?: AcademicLevel;
    academic_strand?: AcademicStrand;
    college_course?: CollegeCourse;
    class_adviser?: ClassAdviser;
}

interface Student {
    id: number;
    name: string;
    email: string;
    created_at: string;
    student_profile?: StudentProfile;
}

interface Props {
    students: Student[];
    academicLevels: AcademicLevel[];
    academicStrands: AcademicStrand[];
    collegeCourses: CollegeCourse[];
    classAdvisers: ClassAdviser[];
}

const StudentsIndex: React.FC<Props> = ({ students, academicLevels, academicStrands, collegeCourses, classAdvisers }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [studentType, setStudentType] = useState<'k12' | 'college'>('k12');
    const [filteredStrands, setFilteredStrands] = useState<AcademicStrand[]>([]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        student_id: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        birth_date: '',
        gender: 'Male',
        address: '',
        contact_number: '',
        grade_level: '',
        section: '',
        enrollment_status: 'active',
        class_adviser_id: '',
        student_type: 'k12',
        academic_level_id: '',
        academic_strand_id: '',
        college_course_id: '',
        year_level: '',
        semester: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingStudent) {
            put(`/registrar/students/${editingStudent.id}`, {
                onSuccess: () => {
                    setEditingStudent(null);
                    reset();
                    resetFilters();
                }
            });
        } else {
            post('/registrar/students', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                    resetFilters();
                }
            });
        }
    };

    const handleEdit = (student: Student) => {
        const profile = student.student_profile;
        const isCollege = profile?.college_course ? true : false;
        const type = isCollege ? 'college' : 'k12';
        
        setData('name', student.name);
        setData('email', student.email);
        setData('student_id', profile?.student_id || '');
        setData('first_name', profile?.first_name || '');
        setData('middle_name', profile?.middle_name || '');
        setData('last_name', profile?.last_name || '');
        setData('birth_date', profile?.birth_date || '');
        setData('gender', profile?.gender || 'Male');
        setData('address', profile?.address || '');
        setData('contact_number', profile?.contact_number || '');
        setData('grade_level', profile?.grade_level || '');
        setData('section', profile?.section || '');
        setData('enrollment_status', profile?.enrollment_status || 'active');
        setData('class_adviser_id', profile?.class_adviser?.id?.toString() || '');
        setData('student_type', type);
        setData('academic_level_id', profile?.academic_level?.id?.toString() || '');
        setData('academic_strand_id', profile?.academic_strand?.id?.toString() || '');
        setData('college_course_id', profile?.college_course?.id?.toString() || '');
        setData('year_level', profile?.year_level?.toString() || '');
        setData('semester', profile?.semester || '');
        
        setStudentType(type);
        if (type === 'k12' && profile?.academic_level?.id) {
            handleLevelChange(profile.academic_level.id.toString());
        }
        
        setEditingStudent(student);
    };

    const handleDelete = (student: Student) => {
        if (confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
            router.delete(`/registrar/students/${student.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingStudent(null);
        reset();
        resetFilters();
    };

    const resetFilters = () => {
        setStudentType('k12');
        setFilteredStrands([]);
    };

    const handleLevelChange = (levelId: string) => {
        setData('academic_level_id', levelId);
        setData('academic_strand_id', '');
        
        if (levelId) {
            const levelStrands = academicStrands.filter(strand => strand.academic_level_id.toString() === levelId);
            setFilteredStrands(levelStrands);
        } else {
            setFilteredStrands([]);
        }
    };

    const handleStudentTypeChange = (type: 'k12' | 'college') => {
        setStudentType(type);
        setData('student_type', type);
        setData('academic_level_id', '');
        setData('academic_strand_id', '');
        setData('college_course_id', '');
        setData('class_adviser_id', '');
        setData('year_level', '');
        setData('semester', '');
        
        resetFilters();
    };

    const getStudentType = (student: Student) => {
        return student.student_profile?.college_course ? 'College' : 'K-12';
    };

    const getStudentInfo = (student: Student) => {
        const profile = student.student_profile;
        if (!profile) return 'No profile';
        
        if (profile.college_course) {
            return `${profile.college_course.name} - Year ${profile.year_level || 'N/A'}`;
        } else {
            return `${profile.academic_level?.name || 'N/A'} - ${profile.grade_level || 'N/A'}`;
        }
    };

    return (
        <RegistrarLayout>
            <Head title="Students - Registrar" />
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
                                        <p className="text-gray-600 mt-2">Manage student accounts and information</p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            <span className="mr-2">➕</span>
                                            Add Student
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Students List */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Students List ({students.length})
                                    </h3>
                                </div>
                                
                                {students.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">
                                        No students found. Create your first student to get started.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program/Level</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {students.map((student) => (
                                                    <tr key={student.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                            <div className="text-xs text-gray-500">{student.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {student.student_profile?.student_id || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                getStudentType(student) === 'College' 
                                                                    ? 'bg-purple-100 text-purple-800' 
                                                                    : 'bg-green-100 text-green-800'
                                                            }`}>
                                                                {getStudentType(student)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{getStudentInfo(student)}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {student.student_profile?.contact_number || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                student.student_profile?.enrollment_status === 'active'
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {student.student_profile?.enrollment_status || 'Unknown'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleEdit(student)}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(student)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Delete
                                                                </button>
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
                            {(showCreateModal || editingStudent) && (
                                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                                    <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
                                        <div className="mt-3">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                                {editingStudent ? 'Edit Student' : 'Create Student'}
                                            </h3>
                                            
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Student Type
                                                    </label>
                                                    <div className="flex space-x-4">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                value="k12"
                                                                checked={studentType === 'k12'}
                                                                onChange={(e) => handleStudentTypeChange(e.target.value as 'k12' | 'college')}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-900">K-12 (Basic Education)</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                value="college"
                                                                checked={studentType === 'college'}
                                                                onChange={(e) => handleStudentTypeChange(e.target.value as 'k12' | 'college')}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-900">College (Higher Education)</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            First Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.first_name}
                                                            onChange={(e) => setData('first_name', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            required
                                                        />
                                                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Last Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.last_name}
                                                            onChange={(e) => setData('last_name', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            required
                                                        />
                                                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Middle Name (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.middle_name}
                                                        onChange={(e) => setData('middle_name', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    {errors.middle_name && <p className="text-red-500 text-xs mt-1">{errors.middle_name}</p>}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Student ID
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.student_id}
                                                            onChange={(e) => setData('student_id', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            required
                                                        />
                                                        {errors.student_id && <p className="text-red-500 text-xs mt-1">{errors.student_id}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Email
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={data.email}
                                                            onChange={(e) => setData('email', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            required
                                                        />
                                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                                    </div>
                                                </div>

                                                {!editingStudent && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Password
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={data.password}
                                                            onChange={(e) => setData('password', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            required={!editingStudent}
                                                        />
                                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Birth Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={data.birth_date}
                                                            onChange={(e) => setData('birth_date', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            required
                                                        />
                                                        {errors.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Gender
                                                        </label>
                                                        <select
                                                            value={data.gender}
                                                            onChange={(e) => setData('gender', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            required
                                                        >
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                        </select>
                                                        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Address
                                                    </label>
                                                    <textarea
                                                        value={data.address}
                                                        onChange={(e) => setData('address', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        rows={2}
                                                        required
                                                    />
                                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Contact Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.contact_number}
                                                        onChange={(e) => setData('contact_number', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    {errors.contact_number && <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>}
                                                </div>

                                                {studentType === 'k12' ? (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Academic Level
                                                                </label>
                                                                <select
                                                                    value={data.academic_level_id}
                                                                    onChange={(e) => handleLevelChange(e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    required
                                                                >
                                                                    <option value="">Select Academic Level</option>
                                                                    {academicLevels.map((level) => (
                                                                        <option key={level.id} value={level.id}>
                                                                            {level.name} ({level.code})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {errors.academic_level_id && <p className="text-red-500 text-xs mt-1">{errors.academic_level_id}</p>}
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Grade Level
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={data.grade_level}
                                                                    onChange={(e) => setData('grade_level', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="e.g., Grade 7, Grade 11"
                                                                    required
                                                                />
                                                                {errors.grade_level && <p className="text-red-500 text-xs mt-1">{errors.grade_level}</p>}
                                                            </div>
                                                        </div>

                                                        {filteredStrands.length > 0 && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Academic Strand (Optional)
                                                                </label>
                                                                <select
                                                                    value={data.academic_strand_id}
                                                                    onChange={(e) => setData('academic_strand_id', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                >
                                                                    <option value="">Select Strand (Optional)</option>
                                                                    {filteredStrands.map((strand) => (
                                                                        <option key={strand.id} value={strand.id}>
                                                                            {strand.name} ({strand.code})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {errors.academic_strand_id && <p className="text-red-500 text-xs mt-1">{errors.academic_strand_id}</p>}
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Section
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={data.section}
                                                                    onChange={(e) => setData('section', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="e.g., Section A"
                                                                />
                                                                {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Class Adviser
                                                                </label>
                                                                <select
                                                                    value={data.class_adviser_id}
                                                                    onChange={(e) => setData('class_adviser_id', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                >
                                                                    <option value="">Select Class Adviser</option>
                                                                    {classAdvisers.map((adviser) => (
                                                                        <option key={adviser.id} value={adviser.id}>
                                                                            {adviser.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {errors.class_adviser_id && <p className="text-red-500 text-xs mt-1">{errors.class_adviser_id}</p>}
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    College Course
                                                                </label>
                                                                <select
                                                                    value={data.college_course_id}
                                                                    onChange={(e) => setData('college_course_id', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    required
                                                                >
                                                                    <option value="">Select College Course</option>
                                                                    {collegeCourses.map((course) => (
                                                                        <option key={course.id} value={course.id}>
                                                                            {course.name} ({course.code})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {errors.college_course_id && <p className="text-red-500 text-xs mt-1">{errors.college_course_id}</p>}
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Year Level
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={data.year_level}
                                                                    onChange={(e) => setData('year_level', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    min="1"
                                                                    max="5"
                                                                    placeholder="e.g., 1, 2, 3, 4"
                                                                    required
                                                                />
                                                                {errors.year_level && <p className="text-red-500 text-xs mt-1">{errors.year_level}</p>}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Semester
                                                            </label>
                                                            <select
                                                                value={data.semester}
                                                                onChange={(e) => setData('semester', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            >
                                                                <option value="">Select Semester</option>
                                                                <option value="1st">1st Semester</option>
                                                                <option value="2nd">2nd Semester</option>
                                                                <option value="summer">Summer</option>
                                                            </select>
                                                            {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester}</p>}
                                                        </div>
                                                    </>
                                                )}

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Enrollment Status
                                                    </label>
                                                    <select
                                                        value={data.enrollment_status}
                                                        onChange={(e) => setData('enrollment_status', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                        <option value="graduated">Graduated</option>
                                                        <option value="transferred">Transferred</option>
                                                    </select>
                                                    {errors.enrollment_status && <p className="text-red-500 text-xs mt-1">{errors.enrollment_status}</p>}
                                                </div>

                                                <div className="flex justify-end space-x-3 pt-4">
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
                                                        {processing ? 'Saving...' : (editingStudent ? 'Update' : 'Create')}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </RegistrarLayout>
    );
};

export default StudentsIndex; 