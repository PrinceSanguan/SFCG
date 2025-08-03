import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import RegistrarLayout from '@/pages/Registrar/RegistrarLayout';

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

const AdviserAssignments: React.FC<Props> = ({ 
    advisers = [], 
    students = [], 
    classAdvisers = [], 
    levels = [] 
}) => {
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [filterLevel, setFilterLevel] = useState<string>('');
    const [filterAdviser, setFilterAdviser] = useState<string>('');
    const [showAssignModal, setShowAssignModal] = useState(false);

    const { data, setData, processing, errors, reset } = useForm({
        student_ids: [] as number[],
        class_adviser_id: '',
    });

    const handleAssignAdviser = (e: React.FormEvent) => {
        e.preventDefault();
        
        router.post('/registrar/assignments/advisers/assign', {
            student_ids: selectedStudents,
            class_adviser_id: data.class_adviser_id,
        }, {
            onSuccess: () => {
                setSelectedStudents([]);
                reset();
                setShowAssignModal(false);
            }
        });
    };

    const handleRemoveAdviser = () => {
        if (selectedStudents.length === 0) {
            alert('Please select students first.');
            return;
        }

        if (confirm(`Are you sure you want to remove class advisers from ${selectedStudents.length} students?`)) {
            router.post('/registrar/assignments/advisers/remove', {
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
        const filteredStudents = getFilteredStudents();
        setSelectedStudents(filteredStudents.map(student => student.id));
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
            
            const levelMatch = !filterLevel || student.student_profile?.academic_level?.id.toString() === filterLevel;
            const adviserMatch = !filterAdviser || student.student_profile?.class_adviser?.id.toString() === filterAdviser;
            return levelMatch && adviserMatch;
        });
    };

    const getFilteredAdvisers = () => {
        return advisers.filter(adviser => {
            if (!filterAdviser) return true;
            return adviser.id.toString() === filterAdviser;
        });
    };

    const filteredStudents = getFilteredStudents();

    // Calculate statistics based on filtered students (excluding college students)
    const unassignedStudents = filteredStudents.filter(s => !s.student_profile?.class_adviser).length;
    const totalAssignments = filteredStudents.filter(s => s.student_profile?.class_adviser).length;

    return (
        <>
            <Head title="Class Adviser Assignments - Registrar" />
            <RegistrarLayout>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Class Adviser Assignments</h1>
                    <p className="text-gray-600 mt-2">Manage class adviser assignments for students</p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Total Students</h3>
                        <p className="text-3xl font-bold text-blue-600">{filteredStudents.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Total Advisers</h3>
                        <p className="text-3xl font-bold text-green-600">{classAdvisers.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Assigned Students</h3>
                        <p className="text-3xl font-bold text-yellow-600">
                            {totalAssignments}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Unassigned Students</h3>
                        <p className="text-3xl font-bold text-red-600">
                            {unassignedStudents}
                        </p>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Level Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by Level
                                </label>
                                <select
                                    value={filterLevel}
                                    onChange={(e) => setFilterLevel(e.target.value)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">All Levels</option>
                                    {levels?.map((level) => (
                                        <option key={level.id} value={level.id}>
                                            {level.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Adviser Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by Adviser
                                </label>
                                <select
                                    value={filterAdviser}
                                    onChange={(e) => setFilterAdviser(e.target.value)}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">All Advisers</option>
                                    {classAdvisers?.map((adviser) => (
                                        <option key={adviser.id} value={adviser.id}>
                                            {adviser.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowAssignModal(true)}
                                disabled={selectedStudents.length === 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Assign Adviser ({selectedStudents.length})
                            </button>
                            <button
                                onClick={handleRemoveAdviser}
                                disabled={selectedStudents.length === 0}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Remove Adviser
                            </button>
                        </div>
                    </div>

                    {/* Select All/Deselect All */}
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={handleSelectAll}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                            Select All
                        </button>
                        <button
                            onClick={handleDeselectAll}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                            Deselect All
                        </button>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.length === getFilteredStudents().length && getFilteredStudents().length > 0}
                                            onChange={() => {
                                                if (selectedStudents.length === getFilteredStudents().length) {
                                                    handleDeselectAll();
                                                } else {
                                                    handleSelectAll();
                                                }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Grade Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Class Adviser
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
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
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                <div className="text-sm text-gray-500">{student.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {student.student_profile?.academic_level?.name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {student.student_profile?.grade_level || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {student.student_profile?.class_adviser?.name || 'Unassigned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                student.student_profile?.class_adviser 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {student.student_profile?.class_adviser ? 'Assigned' : 'Unassigned'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Assign Adviser Modal */}
                {showAssignModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Class Adviser</h3>
                                <form onSubmit={handleAssignAdviser}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Class Adviser
                                        </label>
                                        <select
                                            value={data.class_adviser_id}
                                            onChange={(e) => setData('class_adviser_id', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select a class adviser</option>
                                            {classAdvisers?.map((adviser) => (
                                                <option key={adviser.id} value={adviser.id}>
                                                    {adviser.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.class_adviser_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.class_adviser_id}</p>
                                        )}
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">
                                            Assigning adviser to {selectedStudents.length} selected student(s)
                                        </p>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAssignModal(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing || !data.class_adviser_id}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Assigning...' : 'Assign'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </RegistrarLayout>
        </>
    );
};

export default AdviserAssignments; 