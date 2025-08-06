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
    const [showCsvModal, setShowCsvModal] = useState(false);
    const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
    const [csvLevel, setCsvLevel] = useState<string>('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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

    const { data: csvData, setData: setCsvData, post: postCsv, processing: csvProcessing, errors: csvErrors, reset: resetCsv } = useForm({
        csv_file: null as File | null,
        academic_level: '',
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
    };

    const closeCsvModal = () => {
        setShowCsvModal(false);
        setCsvLevel('');
        resetCsv();
    };

    const openStudentDetailModal = (student: Student) => {
        setSelectedStudent(student);
        setShowStudentDetailModal(true);
    };

    const closeStudentDetailModal = () => {
        setShowStudentDetailModal(false);
        setSelectedStudent(null);
    };

    const openCsvModal = (level: string) => {
        setCsvLevel(level);
        setCsvData('academic_level', level);
        setShowCsvModal(true);
    };

    const handleCsvUpload = (e: React.FormEvent) => {
        e.preventDefault();
        postCsv(route('admin.users.upload.by-level'), {
            onSuccess: () => {
                closeCsvModal();
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCsvData('csv_file', e.target.files[0]);
        }
    };

    const downloadTemplate = (level: string) => {
        const link = document.createElement('a');
        link.href = route('admin.users.download-template', { level });
        link.download = `${level}_students_template.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

    const downloadStudentCsv = (student: Student) => {
        const profile = student.student_profile;
        
        // Determine the academic level for proper CSV format
        const academicLevel = profile?.academic_level?.code;
        
        // Create headers based on academic level
        let headers = ['name', 'email'];
        let data = [student.name, student.email];
        
        if (academicLevel === 'ELEM') {
            // Elementary format
            headers = ['name', 'email', 'password', 'student_id', 'first_name', 'middle_name', 'last_name', 'birth_date', 'gender', 'address', 'contact_number', 'section', 'grade_level', 'year_level'];
            data = [
                student.name,
                student.email,
                'password123', // Default password
                profile?.student_id || '',
                profile?.first_name || '',
                profile?.middle_name || '',
                profile?.last_name || '',
                profile?.birth_date ? new Date(profile.birth_date).toISOString().split('T')[0] : '',
                profile?.gender || '',
                profile?.address || '',
                profile?.contact_number || '',
                profile?.section || '',
                String(profile?.grade_level || ''),
                String(profile?.year_level || '')
            ];
        } else if (academicLevel === 'JHS' || academicLevel === 'SHS') {
            // Junior High / Senior High format
            headers = ['name', 'email', 'password', 'student_id', 'first_name', 'middle_name', 'last_name', 'birth_date', 'gender', 'address', 'contact_number', 'section', 'grade_level', 'year_level', 'academic_strand'];
            data = [
                student.name,
                student.email,
                'password123', // Default password
                profile?.student_id || '',
                profile?.first_name || '',
                profile?.middle_name || '',
                profile?.last_name || '',
                profile?.birth_date ? new Date(profile.birth_date).toISOString().split('T')[0] : '',
                profile?.gender || '',
                profile?.address || '',
                profile?.contact_number || '',
                profile?.section || '',
                String(profile?.grade_level || ''),
                String(profile?.year_level || ''),
                profile?.academic_strand?.name || ''
            ];
        } else if (profile?.college_course) {
            // College format
            headers = ['name', 'email', 'password', 'student_id', 'first_name', 'middle_name', 'last_name', 'birth_date', 'gender', 'address', 'contact_number', 'section', 'year_level', 'semester', 'college_course'];
            data = [
                student.name,
                student.email,
                'password123', // Default password
                profile?.student_id || '',
                profile?.first_name || '',
                profile?.middle_name || '',
                profile?.last_name || '',
                profile?.birth_date ? new Date(profile.birth_date).toISOString().split('T')[0] : '',
                profile?.gender || '',
                profile?.address || '',
                profile?.contact_number || '',
                profile?.section || '',
                String(profile?.year_level || ''),
                profile?.semester || '',
                profile?.college_course?.name || ''
            ];
        }

        // Create CSV content
        const csvContent = [
            headers.join(','),
            data.map(field => `"${field}"`).join(',') // Wrap fields in quotes to handle commas
        ];

        const csvString = csvContent.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${student.name.toLowerCase().replace(/\s+/g, '_')}_student_data.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success notification
        alert(`CSV file for ${student.name} has been downloaded successfully!`);
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
                                        openCsvModal(level.code === 'COL' ? 'college' : 
                                                   level.code === 'ELEM' ? 'elementary' : 'junior_high');
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
                                    <tr 
                                        key={student.id} 
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => openStudentDetailModal(student)}
                                    >
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(student);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(student);
                                                    }}
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

                                {/* CSV Upload Section */}
                                <div className="border-t border-gray-200 pt-6 mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-medium text-gray-900">
                                            📁 Bulk Upload Students
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => downloadTemplate(
                                                data.student_type === 'college' ? 'college' : 
                                                data.academic_level_id ? 
                                                    academicLevels.find(l => l.id.toString() === data.academic_level_id)?.code === 'ELEM' ? 'elementary' : 'junior_high'
                                                : 'elementary'
                                            )}
                                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                                        >
                                            📥 Download Template
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Upload CSV File
                                            </label>
                                            <input
                                                type="file"
                                                accept=".csv,.txt"
                                                onChange={handleFileChange}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {csvErrors.csv_file && (
                                                <p className="text-red-500 text-sm mt-1">{csvErrors.csv_file}</p>
                                            )}
                                        </div>

                                        <div className="flex space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!csvData.csv_file) {
                                                        alert('Please select a CSV file first.');
                                                        return;
                                                    }
                                                    
                                                    const level = data.student_type === 'college' ? 'college' : 
                                                        data.academic_level_id ? 
                                                            academicLevels.find(l => l.id.toString() === data.academic_level_id)?.code === 'ELEM' ? 'elementary' : 'junior_high'
                                                        : 'elementary';
                                                    
                                                    console.log('CSV Upload Debug:', {
                                                        file: csvData.csv_file,
                                                        level: level,
                                                        formData: csvData
                                                    });
                                                    
                                                    // Set the academic level in the CSV form data
                                                    setCsvData('academic_level', level);
                                                    
                                                    // Submit the CSV form
                                                    postCsv(route('admin.users.upload.by-level'), {
                                                        onSuccess: () => {
                                                            console.log('CSV upload successful');
                                                            // Reset CSV form
                                                            setCsvData('csv_file', null);
                                                            resetCsv();
                                                        },
                                                        onError: (errors) => {
                                                            console.error('CSV upload errors:', errors);
                                                            // Handle specific validation errors
                                                            if (errors.csv_file) {
                                                                alert('CSV File Error: ' + errors.csv_file);
                                                            } else if (errors.academic_level) {
                                                                alert('Academic Level Error: ' + errors.academic_level);
                                                            } else {
                                                                alert('Upload failed. Please check your CSV file and try again.');
                                                            }
                                                        },
                                                    });
                                                }}
                                                disabled={csvProcessing || !csvData.csv_file}
                                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                            >
                                                {csvProcessing ? 'Uploading...' : 'Upload CSV'}
                                            </button>
                                        </div>

                                        <div className="p-3 bg-blue-50 rounded-md">
                                            <h5 className="font-medium text-blue-900 mb-2">CSV Upload Info:</h5>
                                            <ul className="text-sm text-blue-800 space-y-1">
                                                <li>• Upload multiple students at once</li>
                                                <li>• Students will be created with current form settings</li>
                                                <li>• Academic level: <span className="font-medium">
                                                    {data.student_type === 'college' ? 'College' : 
                                                     data.academic_level_id ? 
                                                         academicLevels.find(l => l.id.toString() === data.academic_level_id)?.name || 'Not selected'
                                                     : 'Not selected'}
                                                </span></li>
                                                <li>• Download template for exact format</li>
                                            </ul>
                                        </div>
                                    </div>
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

            {/* CSV Upload Modal */}
            {showCsvModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Upload {csvLevel === 'elementary' ? 'Elementary' : 
                                        csvLevel === 'junior_high' ? 'Junior High' : 'College'} Students CSV
                            </h3>
                            <button
                                onClick={closeCsvModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCsvUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CSV File
                                </label>
                                <input
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {csvErrors.csv_file && (
                                    <p className="text-red-500 text-sm mt-1">{csvErrors.csv_file}</p>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => downloadTemplate(csvLevel)}
                                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    📥 Download Template
                                </button>
                                <button
                                    type="submit"
                                    disabled={csvProcessing || !csvData.csv_file}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {csvProcessing ? 'Uploading...' : 'Upload CSV'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-4 p-3 bg-blue-50 rounded-md">
                            <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• First row must contain headers</li>
                                <li>• Required fields: name, email</li>
                                <li>• Optional: password (default: password123)</li>
                                <li>• Download template for exact format</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Detail Modal */}
            {showStudentDetailModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Student Details - {selectedStudent.name}
                            </h3>
                            <button
                                onClick={closeStudentDetailModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Student Information */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">📋 Student Information</h4>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Full Name:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Email:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Student ID:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.student_id || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">First Name:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.first_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Middle Name:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.middle_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Last Name:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.last_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Birth Date:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.birth_date || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Gender:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.gender || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Address:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.address || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Contact Number:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.contact_number || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Information */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">🎓 Academic Information</h4>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Academic Level:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.academic_level?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Academic Strand:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.academic_strand?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">College Course:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.college_course?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Grade Level:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.grade_level || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Year Level:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.year_level || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Semester:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.semester || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Section:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.section || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Enrollment Status:</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                selectedStudent.student_profile?.enrollment_status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : selectedStudent.student_profile?.enrollment_status === 'inactive'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : selectedStudent.student_profile?.enrollment_status === 'graduated'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {selectedStudent.student_profile?.enrollment_status?.toUpperCase() || 'UNKNOWN'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Class Adviser:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.class_adviser?.name || 'Not assigned'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CSV Data Section */}
                            <div className="space-y-6">
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">📁 CSV Upload Data</h4>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Upload Source:</span>
                                            <span className="text-sm text-gray-900">
                                                {selectedStudent.student_profile?.academic_level?.code === 'ELEM' ? 'Elementary CSV' :
                                                 selectedStudent.student_profile?.academic_level?.code === 'JHS' ? 'Junior High CSV' :
                                                 selectedStudent.student_profile?.academic_level?.code === 'SHS' ? 'Senior High CSV' :
                                                 selectedStudent.student_profile?.college_course ? 'College CSV' : 'Manual Entry'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Created Date:</span>
                                            <span className="text-sm text-gray-900">{new Date(selectedStudent.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Account Type:</span>
                                            <span className="text-sm text-gray-900">{selectedStudent.student_profile?.college_course ? 'College Student' : 'K-12 Student'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* CSV Template Information */}
                                <div className="bg-yellow-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">📋 CSV Template Used</h4>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Template Type:</span>
                                            <span className="text-sm text-gray-900">
                                                {selectedStudent.student_profile?.academic_level?.code === 'ELEM' ? 'Elementary Template' :
                                                 selectedStudent.student_profile?.academic_level?.code === 'JHS' ? 'Junior High Template' :
                                                 selectedStudent.student_profile?.academic_level?.code === 'SHS' ? 'Senior High Template' :
                                                 selectedStudent.student_profile?.college_course ? 'College Template' : 'Unknown'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Required Fields:</span>
                                            <span className="text-sm text-gray-900">name, email</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Optional Fields:</span>
                                            <span className="text-sm text-gray-900">password, student_id, first_name, middle_name, last_name, birth_date, gender, address, contact_number, section</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Level-Specific Fields:</span>
                                            <span className="text-sm text-gray-900">
                                                {selectedStudent.student_profile?.academic_level?.code === 'ELEM' ? 'grade_level, year_level' :
                                                 selectedStudent.student_profile?.academic_level?.code === 'JHS' ? 'grade_level, year_level, academic_strand' :
                                                 selectedStudent.student_profile?.academic_level?.code === 'SHS' ? 'grade_level, year_level, academic_strand' :
                                                 selectedStudent.student_profile?.college_course ? 'year_level, semester, college_course' : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Section */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">⚙️ Actions</h4>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => {
                                                closeStudentDetailModal();
                                                handleEdit(selectedStudent);
                                            }}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Edit Student
                                        </button>
                                        <button
                                            onClick={() => {
                                                closeStudentDetailModal();
                                                handleDelete(selectedStudent);
                                            }}
                                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                                        >
                                            Delete Student
                                        </button>
                                        <button
                                            onClick={() => downloadStudentCsv(selectedStudent)}
                                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            📥 Download CSV
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Students; 