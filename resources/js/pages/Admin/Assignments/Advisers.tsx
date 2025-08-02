import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface AcademicLevel {
    id: number;
    name: string;
    code: string;
}

interface AcademicStrand {
    id: number;
    name: string;
    code: string;
}

interface CollegeCourse {
    id: number;
    name: string;
    code: string;
}

interface StudentProfile {
    academic_level?: AcademicLevel;
    academic_strand?: AcademicStrand;
    college_course?: CollegeCourse;
    class_adviser?: User;
    grade_level?: string;
}

interface Student extends User {
    student_profile?: StudentProfile;
}

interface ClassAdviser extends User {
    advised_students: Student[];
}

interface Props {
    advisers: ClassAdviser[];
    students: Student[];
    classAdvisers: User[];
    levels: AcademicLevel[];
}

const AdviserAssignments: React.FC<Props> = ({ advisers, students, classAdvisers, levels }) => {
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [filterLevel, setFilterLevel] = useState<string>('');
    const [filterAdviser, setFilterAdviser] = useState<string>('');

    const { data, setData, processing, errors, reset } = useForm({
        student_ids: [] as number[],
        class_adviser_id: '',
    });

    const handleAssignAdviser = (e: React.FormEvent) => {
        e.preventDefault();
        
        router.post('/admin/assignments/advisers/assign', {
            student_ids: selectedStudents,
            class_adviser_id: data.class_adviser_id,
        }, {
            onSuccess: () => {
                setSelectedStudents([]);
                reset();
            }
        });
    };

    const handleRemoveAdviser = () => {
        if (selectedStudents.length === 0) {
            alert('Please select students first.');
            return;
        }

        if (confirm(`Are you sure you want to remove class advisers from ${selectedStudents.length} students?`)) {
            router.post('/admin/assignments/advisers/remove', {
                student_ids: selectedStudents,
            }, {
                onSuccess: () => {
                    setSelectedStudents([]);
                }
            });
        }
    };

    const handleStudentToggle = (studentId: number) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    const handleSelectAll = () => {
        const filteredStudentIds = getFilteredStudents().map(s => s.id);
        setSelectedStudents(filteredStudentIds);
    };

    const handleDeselectAll = () => {
        setSelectedStudents([]);
    };

    const getFilteredStudents = () => {
        return students.filter(student => {
            // Exclude college students - only show Elementary, Junior High, and Senior High students
            if (student.student_profile?.college_course) {
                return false;
            }
            
            // Filter by academic level if selected
            if (filterLevel && student.student_profile?.academic_level?.id.toString() !== filterLevel) {
                return false;
            }
            
            // Filter by adviser if selected
            if (filterAdviser) {
                const hasAdviser = student.student_profile?.class_adviser?.id.toString() === filterAdviser;
                if (filterAdviser === 'unassigned') {
                    return !hasAdviser;
                }
                return hasAdviser;
            }
            
            return true;
        });
    };

    const filteredStudents = getFilteredStudents();

    // Calculate statistics
    const unassignedStudents = students.filter(s => !s.student_profile?.class_adviser).length;
    const totalAssignments = students.filter(s => s.student_profile?.class_adviser).length;

    return (
        <>
            <Head title="Class Adviser Assignments" />
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Class Adviser Assignments</h1>
                                    <p className="text-gray-600 mt-2">Assign class advisers to students and manage advisory relationships</p>
                                </div>
                            </div>
                        </div>

                        {/* Summary Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-md">
                                            <span className="text-white text-sm">👥</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Total Students</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{students.length}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-md">
                                            <span className="text-white text-sm">✅</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Assigned</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{totalAssignments}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-md">
                                            <span className="text-white text-sm">⚠️</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Unassigned</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{unassignedStudents}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-md">
                                            <span className="text-white text-sm">👨‍🏫</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Active Advisers</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{advisers.filter(a => a.advised_students.length > 0).length}</dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Assignments Overview */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Adviser Assignments</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {advisers.filter(adviser => adviser.advised_students.length > 0).map((adviser) => (
                                    <div key={adviser.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">{adviser.name}</h3>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {adviser.advised_students.length} students
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <p className="mb-2">{adviser.email}</p>
                                            {adviser.advised_students.length > 0 && (
                                                <div>
                                                    <p className="font-medium mb-2">Recent students:</p>
                                                    <ul className="space-y-1">
                                                        {adviser.advised_students.slice(0, 3).map((student) => (
                                                            <li key={student.id} className="text-xs">
                                                                {student.name} - {student.student_profile?.academic_level?.name || student.student_profile?.grade_level || 'No Level'}
                                                                {student.student_profile?.academic_strand && ` (${student.student_profile.academic_strand.name})`}
                                                                {student.student_profile?.college_course && ` (${student.student_profile.college_course.name})`}
                                                            </li>
                                                        ))}
                                                        {adviser.advised_students.length > 3 && (
                                                            <li className="text-xs text-gray-500">
                                                                +{adviser.advised_students.length - 3} more...
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                {advisers.filter(adviser => adviser.advised_students.length > 0).length === 0 && (
                                    <div className="col-span-full text-center py-8">
                                        <div className="text-gray-500 text-lg">No adviser assignments yet</div>
                                        <p className="text-gray-400 mt-2">Start by assigning students to class advisers below</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assignment Form */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Class Adviser</h2>
                            
                            <form onSubmit={handleAssignAdviser} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Class Adviser
                                        </label>
                                        <select
                                            value={data.class_adviser_id}
                                            onChange={(e) => setData('class_adviser_id', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
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

                                    <div className="flex items-end space-x-2">
                                        <button
                                            type="submit"
                                            disabled={processing || selectedStudents.length === 0 || !data.class_adviser_id}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {processing ? 'Assigning...' : `Assign to ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRemoveAdviser}
                                            disabled={selectedStudents.length === 0}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Remove Adviser
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Students List */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">Students ({filteredStudents.length})</h2>
                                    <div className="flex items-center space-x-4">
                                        {/* Filters */}
                                        <select
                                            value={filterLevel}
                                            onChange={(e) => setFilterLevel(e.target.value)}
                                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="">All Levels</option>
                                            {levels.map((level) => (
                                                <option key={level.id} value={level.id}>
                                                    {level.name}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={filterAdviser}
                                            onChange={(e) => setFilterAdviser(e.target.value)}
                                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="">All Students</option>
                                            <option value="unassigned">Unassigned</option>
                                            {classAdvisers.map((adviser) => (
                                                <option key={adviser.id} value={adviser.id}>
                                                    {adviser.name}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Selection Controls */}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleSelectAll}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                Select All
                                            </button>
                                            <button
                                                onClick={handleDeselectAll}
                                                className="text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                Deselect All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                {selectedStudents.length > 0 && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            {selectedStudents.length} student(s) selected
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {filteredStudents.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    <div className="text-lg">No students found</div>
                                    <p className="text-gray-400 mt-2">Try adjusting your filters or add more students</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <input
                                                        type="checkbox"
                                                        checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedStudents.includes(s.id))}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                handleSelectAll();
                                                            } else {
                                                                handleDeselectAll();
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Level</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strand/Course</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Adviser</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredStudents.map((student) => (
                                                <tr key={student.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudents.includes(student.id)}
                                                            onChange={() => handleStudentToggle(student.id)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                        <div className="text-sm text-gray-500">{student.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                                                <div className="text-sm text-gray-900">{student.student_profile?.academic_level?.name || student.student_profile?.grade_level || 'No Level'}</div>
                                        <div className="text-sm text-gray-500">{student.student_profile?.academic_level?.code || 'N/A'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {student.student_profile?.college_course ? 
                                                                student.student_profile.college_course.name :
                                                                (student.student_profile?.academic_strand?.name || 'General')
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {student.student_profile?.class_adviser ? (
                                                            <div className="text-sm text-gray-900">
                                                                {student.student_profile.class_adviser.name}
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                Unassigned
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default AdviserAssignments; 