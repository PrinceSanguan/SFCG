import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';

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

const Students: React.FC<Props> = ({ students, academicLevels, academicStrands, collegeCourses, classAdvisers }) => {
    const [selectedLevel, setSelectedLevel] = useState<string>('all');
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

    // Filter students by academic level
    const getStudentsByLevel = (levelCode: string) => {
        if (levelCode === 'all') return students;
        
        if (levelCode === 'COL') {
            return students.filter(student => student.student_profile?.college_course);
        } else {
            return students.filter(student => 
                student.student_profile?.academic_level?.code === levelCode
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingStudent) {
            put(`/admin/users/students/${editingStudent.id}`, {
                onSuccess: () => {
                    setEditingStudent(null);
                    reset();
                    resetFilters();
                },
                onError: (errors) => {
                    console.log('Update student errors:', errors);
                }
            });
        } else {
            post('/admin/users/students', {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                    resetFilters();
                },
                onError: (errors) => {
                    console.log('Create student errors:', errors);
                }
            });
        }
    };

    const handleEdit = (student: Student) => {
        const profile = student.student_profile;
        if (!profile) return;

        const isCollege = profile.college_course ? true : false;
        const type = isCollege ? 'college' : 'k12';
        
        setData('name', student.name);
        setData('email', student.email);
        setData('password', '');
        setData('student_id', profile.student_id);
        setData('first_name', profile.first_name);
        setData('middle_name', profile.middle_name || '');
        setData('last_name', profile.last_name);
        setData('birth_date', profile.birth_date);
        setData('gender', profile.gender);
        setData('address', profile.address);
        setData('contact_number', profile.contact_number || '');
        setData('grade_level', profile.grade_level);
        setData('section', profile.section || '');
        setData('enrollment_status', profile.enrollment_status);
        setData('class_adviser_id', profile.class_adviser?.id?.toString() || '');
        setData('student_type', type);
        
        setStudentType(type);
        
        if (isCollege) {
            setData('college_course_id', profile.college_course?.id?.toString() || '');
            setData('year_level', profile.year_level?.toString() || '');
            setData('semester', profile.semester || '');
            setData('class_adviser_id', '');
        } else {
            setData('academic_level_id', profile.academic_level?.id?.toString() || '');
            setData('academic_strand_id', profile.academic_strand?.id?.toString() || '');
            setData('year_level', profile.year_level?.toString() || '');
            setData('class_adviser_id', profile.class_adviser?.id?.toString() || '');
            
            if (profile.academic_level) {
                const levelStrands = academicStrands.filter(s => s.academic_level_id === profile.academic_level!.id);
                setFilteredStrands(levelStrands);
            }
        }
        
        setEditingStudent(student);
    };

    const handleDelete = (student: Student) => {
        if (confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
            router.delete(`/admin/users/students/${student.id}`);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingStudent(null);
        reset();
        resetFilters();
    };

    const resetFilters = () => {
        setFilteredStrands([]);
        setStudentType('k12');
    };

    const handleLevelChange = (levelId: string) => {
        setData('academic_level_id', levelId);
        setData('academic_strand_id', '');
        
        if (levelId) {
            const levelStrands = academicStrands.filter(s => s.academic_level_id === parseInt(levelId));
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
        
        if (type === 'college') {
            setData('class_adviser_id', '');
        }
        
        setFilteredStrands([]);
    };

    const getStudentType = (student: Student) => {
        if (student.student_profile?.college_course) {
            return 'College';
        } else if (student.student_profile?.academic_level) {
            return student.student_profile.academic_level.name;
        }
        return 'Unknown';
    };

    const getStudentInfo = (student: Student) => {
        const profile = student.student_profile;
        if (!profile) return 'No profile';

        if (profile.college_course) {
            return `${profile.college_course.name} - ${profile.grade_level}`;
        } else {
            const strand = profile.academic_strand ? ` - ${profile.academic_strand.name}` : '';
            const section = profile.section ? ` - ${profile.section}` : '';
            return `${profile.academic_level?.name}${strand}${section}`;
        }
    };

    const getLevelStats = (levelCode: string) => {
        const levelStudents = getStudentsByLevel(levelCode);
        const activeStudents = levelStudents.filter(s => s.student_profile?.enrollment_status === 'active');
        const inactiveStudents = levelStudents.filter(s => s.student_profile?.enrollment_status === 'inactive');
        
        return {
            total: levelStudents.length,
            active: activeStudents.length,
            inactive: inactiveStudents.length
        };
    };

    const getLevelColor = (levelCode: string) => {
        switch (levelCode) {
            case 'ELEM': return 'bg-blue-500';
            case 'JHS': return 'bg-green-500';
            case 'SHS': return 'bg-yellow-500';
            case 'COL': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    const getLevelIcon = (levelCode: string) => {
        switch (levelCode) {
            case 'ELEM': return '🎒';
            case 'JHS': return '📚';
            case 'SHS': return '🎓';
            case 'COL': return '🎓';
            default: return '👤';
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                <p className="text-gray-600">Manage students by academic level</p>
            </div>

            {/* Level Selection Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setSelectedLevel('all')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                selectedLevel === 'all'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            All Students ({students.length})
                        </button>
                        {academicLevels.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => setSelectedLevel(level.code)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    selectedLevel === level.code
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {level.name} ({getLevelStats(level.code).total})
                            </button>
                        ))}
                    </nav>
                </div>
                
                {/* Back to All Button */}
                {selectedLevel !== 'all' && (
                    <div className="mt-4">
                        <button
                            onClick={() => setSelectedLevel('all')}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            ← Back to All Students
                        </button>
                    </div>
                )}
            </div>

            {/* Level Cards Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {academicLevels.map((level) => {
                    const stats = getLevelStats(level.code);
                    return (
                        <div 
                            key={level.id} 
                            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all hover:shadow-md ${
                                selectedLevel === level.code 
                                    ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50' 
                                    : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedLevel(level.code)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-lg ${getLevelColor(level.code)} flex items-center justify-center text-white text-xl`}>
                                    {getLevelIcon(level.code)}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                                    <div className="text-sm text-gray-500">Total Students</div>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{level.name}</h3>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600">Active:</span>
                                    <span className="font-medium">{stats.active}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-red-600">Inactive:</span>
                                    <span className="font-medium">{stats.inactive}</span>
                                </div>
                            </div>
                            
                            <div className="flex space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        setStudentType(level.code === 'COL' ? 'college' : 'k12');
                                        setData('student_type', level.code === 'COL' ? 'college' : 'k12');
                                        if (level.code !== 'COL') {
                                            setData('academic_level_id', level.id.toString());
                                        }
                                        setShowCreateModal(true);
                                    }}
                                    className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Add {level.name} Student
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        // TODO: Implement CSV upload for specific level
                                        alert(`CSV upload for ${level.name} students coming soon!`);
                                    }}
                                    className="bg-gray-100 text-gray-700 text-sm font-medium py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
                                    title={`Upload ${level.name} Students CSV`}
                                >
                                    📁
                                </button>
                            </div>
                            
                            {/* View Students Button */}
                            <div className="mt-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        setSelectedLevel(level.code);
                                    }}
                                    className={`w-full text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                                        selectedLevel === level.code
                                            ? 'bg-green-100 text-green-700 border border-green-300'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    {selectedLevel === level.code ? '✓ Viewing Students' : 'View Students'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Students List */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {selectedLevel === 'all' ? 'All Students' : `${academicLevels.find(l => l.code === selectedLevel)?.name} Students`} 
                            ({getStudentsByLevel(selectedLevel).length})
                        </h2>
                        {selectedLevel !== 'all' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Filtered by {academicLevels.find(l => l.code === selectedLevel)?.name}
                            </span>
                        )}
                    </div>
                </div>
                
                {getStudentsByLevel(selectedLevel).length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        {selectedLevel === 'all' ? (
                            'No students found. Use the "Add Student" buttons above to create new students.'
                        ) : (
                            `No students found for ${academicLevels.find(l => l.code === selectedLevel)?.name}. Use the "Add ${academicLevels.find(l => l.code === selectedLevel)?.name} Student" button above to create new students.`
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Adviser</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {getStudentsByLevel(selectedLevel).map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-green-600">
                                                            {student.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                    <div className="text-sm text-gray-500">{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{student.student_profile?.student_id || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                getStudentType(student) === 'College' 
                                                    ? 'bg-purple-100 text-purple-800' 
                                                    : getStudentType(student) === 'Elementary'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : getStudentType(student) === 'Junior High School'
                                                    ? 'bg-green-100 text-green-800'
                                                    : getStudentType(student) === 'Senior High School'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {getStudentType(student)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{getStudentInfo(student)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                student.student_profile?.enrollment_status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : student.student_profile?.enrollment_status === 'inactive'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : student.student_profile?.enrollment_status === 'graduated'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {student.student_profile?.enrollment_status?.toUpperCase() || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {student.student_profile?.class_adviser?.name || 'Not assigned'}
                                            </div>
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
                    <div className="relative top-5 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white max-h-[95vh] overflow-y-auto">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingStudent ? 'Edit Student' : `Create ${academicLevels.find(l => l.id.toString() === data.academic_level_id)?.name || (data.student_type === 'college' ? 'College' : 'K-12')} Student`}
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Student Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Student Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value="k12"
                                                    checked={studentType === 'k12'}
                                                    onChange={(e) => handleStudentTypeChange(e.target.value as 'k12' | 'college')}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-900">Basic Education (K-12)</span>
                                            </label>
                                            <div className="ml-6 text-xs text-gray-500">
                                                • Elementary (Grades 1-6)<br/>
                                                • Junior High School (Grades 7-10)<br/>
                                                • Senior High School (Grades 11-12)
                                            </div>
                                        </div>
                                        <div>
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
                                </div>

                                {/* User Information */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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

                                {/* Password & Student ID */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password {editingStudent && '(Leave blank to keep current)'}
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
                                </div>

                                {/* Student Profile */}
                                <div className="grid grid-cols-3 gap-4">
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
                                            Middle Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.middle_name}
                                            onChange={(e) => setData('middle_name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.middle_name && <p className="text-red-500 text-xs mt-1">{errors.middle_name}</p>}
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

                                {/* Birth Date, Gender */}
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

                                {/* Academic Fields */}
                                {studentType === 'college' ? (
                                    <div className="grid grid-cols-3 gap-4">
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
                                            <select
                                                value={data.year_level}
                                                onChange={(e) => setData('year_level', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Year Level</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                            {errors.year_level && <p className="text-red-500 text-xs mt-1">{errors.year_level}</p>}
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
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-4">
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
                                                {academicLevels.filter(level => level.code !== 'COL').map((level) => (
                                                    <option key={level.id} value={level.id}>
                                                        {level.name} ({level.code})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.academic_level_id && <p className="text-red-500 text-xs mt-1">{errors.academic_level_id}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Academic Strand (Optional)
                                            </label>
                                            <select
                                                value={data.academic_strand_id}
                                                onChange={(e) => setData('academic_strand_id', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                disabled={!data.academic_level_id}
                                            >
                                                <option value="">General (All Strands)</option>
                                                {filteredStrands.map((strand) => (
                                                    <option key={strand.id} value={strand.id}>
                                                        {strand.name} ({strand.code})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.academic_strand_id && <p className="text-red-500 text-xs mt-1">{errors.academic_strand_id}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Grade Level
                                            </label>
                                            <select
                                                value={data.year_level}
                                                onChange={(e) => setData('year_level', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Grade Level</option>
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                                                    <option key={grade} value={grade}>
                                                        Grade {grade}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.year_level && <p className="text-red-500 text-xs mt-1">{errors.year_level}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Additional Information */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Grade Level
                                        </label>
                                        <input
                                            type="text"
                                            value={data.grade_level}
                                            onChange={(e) => setData('grade_level', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={studentType === 'college' ? 'e.g., 1st Year' : 'e.g., Grade 11'}
                                            required
                                        />
                                        {errors.grade_level && <p className="text-red-500 text-xs mt-1">{errors.grade_level}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Section
                                        </label>
                                        <input
                                            type="text"
                                            value={data.section}
                                            onChange={(e) => setData('section', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., A, B, STEM-1"
                                        />
                                        {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
                                    </div>
                                </div>

                                {/* Contact Information */}
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

                                <div className="grid grid-cols-2 gap-4">
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

                                    {studentType === 'k12' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Class Adviser
                                            </label>
                                            <select
                                                value={data.class_adviser_id}
                                                onChange={(e) => setData('class_adviser_id', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">No adviser assigned</option>
                                                {classAdvisers.map((adviser) => (
                                                    <option key={adviser.id} value={adviser.id}>
                                                        {adviser.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.class_adviser_id && <p className="text-red-500 text-xs mt-1">{errors.class_adviser_id}</p>}
                                        </div>
                                    )}
                                </div>

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
                                        <option value="dropped">Dropped</option>
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
                                        {processing ? 'Saving...' : (editingStudent ? 'Update' : `Create ${academicLevels.find(l => l.id.toString() === data.academic_level_id)?.name || (data.student_type === 'college' ? 'College' : 'K-12')} Student`)}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Students; 