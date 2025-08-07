import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ClassAdviserLayout from '../ClassAdviserLayout';

interface Student {
    id: number;
    name: string;
    email: string;
    studentProfile: {
        student_id: string;
        academicLevel: {
            name: string;
        };
        year_level: string;
        section: string;
    };
}

interface Props {
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const StudentsIndex: React.FC<Props> = ({ students }) => {
    return (
        <>
            <Head title="My Students - Class Adviser" />
            <ClassAdviserLayout>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
                                <p className="text-gray-600 mt-2">Students assigned to your advisory class.</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{students.total}</p>
                            </div>
                        </div>
                    </div>

                    {/* Students Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Assigned Students</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Academic Level
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Year Level
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Section
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.data.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {student.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {student.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.studentProfile.student_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.studentProfile.academicLevel.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.studentProfile.year_level}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.studentProfile.section}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={`/class-adviser/grades/create?student=${student.id}`}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    Add Grades
                                                </Link>
                                                <Link
                                                    href={`/class-adviser/grades?student=${student.id}`}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    View Grades
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {students.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {((students.current_page - 1) * students.per_page) + 1} to{' '}
                                        {Math.min(students.current_page * students.per_page, students.total)} of{' '}
                                        {students.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {students.current_page > 1 && (
                                            <Link
                                                href={`/class-adviser/students?page=${students.current_page - 1}`}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {students.current_page < students.last_page && (
                                            <Link
                                                href={`/class-adviser/students?page=${students.current_page + 1}`}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                            <p className="text-sm text-gray-600 mt-1">Common tasks you can perform</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link
                                    href="/class-adviser/grades/create"
                                    className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <div className="p-2 bg-blue-100 rounded-lg mr-4">
                                        <span className="text-xl">✏️</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-blue-900">Add Grades</h3>
                                        <p className="text-sm text-blue-700">Add grades for your students</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/class-adviser/grades"
                                    className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                    <div className="p-2 bg-green-100 rounded-lg mr-4">
                                        <span className="text-xl">📊</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-green-900">View All Grades</h3>
                                        <p className="text-sm text-green-700">View and manage all grades</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </ClassAdviserLayout>
        </>
    );
};

export default StudentsIndex; 