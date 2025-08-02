import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import InstructorLayout from '../InstructorLayout';

interface Student {
    id: number;
    name: string;
    email: string;
    student_profile?: {
        student_id: string;
        grade_level: string;
        section: string;
        academic_level?: {
            name: string;
        };
        college_course?: {
            name: string;
        };
    };
}

interface Honor {
    id: number;
    student_id: number;
    honor_type: string;
    gpa: number;
    is_approved: boolean;
    awarded_date: string;
    remarks?: string;
    created_at: string;
    updated_at: string;
    student: Student;
}

interface HonorCriterion {
    id: number;
    honor_type: string;
    minimum_grade: number;
    maximum_grade: number;
    criteria_description: string;
    academic_level_id?: number;
    is_active: boolean;
}

interface Props {
    honors: Honor[];
    honorCriteria: HonorCriterion[];
    filters: {
        honor_type?: string;
        is_approved?: string;
        academic_level_id?: string;
    };
}

const HonorsIndex: React.FC<Props> = ({ 
    honors = [], 
    honorCriteria = [],
    filters = {} 
}) => {
    const [selectedHonor, setSelectedHonor] = useState<Honor | null>(null);

    const getHonorTypeColor = (honorType: string) => {
        switch (honorType) {
            case 'honor_roll': return 'bg-blue-100 text-blue-800';
            case 'dean_list': return 'bg-green-100 text-green-800';
            case 'president_list': return 'bg-purple-100 text-purple-800';
            case 'academic_excellence': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getHonorTypeDisplay = (honorType: string) => {
        switch (honorType) {
            case 'honor_roll': return 'Honor Roll';
            case 'dean_list': return "Dean's List";
            case 'president_list': return "President's List";
            case 'academic_excellence': return 'Academic Excellence';
            default: return honorType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    };

    const getStudentType = (student: Student) => {
        return student.student_profile?.college_course ? 'College' : 'K-12';
    };

    const getStudentInfo = (student: Student) => {
        if (student.student_profile?.college_course) {
            return `${student.student_profile.college_course.name}`;
        } else if (student.student_profile?.academic_level) {
            return `${student.student_profile.academic_level.name} - ${student.student_profile.grade_level}`;
        }
        return student.student_profile?.grade_level || 'N/A';
    };

    return (
        <>
            <Head title="Honor Tracking - Instructor" />
            <InstructorLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Honor Tracking</h1>
                            <p className="text-gray-600 mt-2">View honor results and achievements of your students.</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => router.get('/instructor/honors/export')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <span className="mr-2">📊</span>
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-2xl">🏆</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Honors</p>
                                <p className="text-2xl font-bold text-gray-900">{honors.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {honors.filter(h => h.is_approved).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-2xl">⏳</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {honors.filter(h => !h.is_approved).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <span className="text-2xl">📋</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Criteria</p>
                                <p className="text-2xl font-bold text-gray-900">{honorCriteria.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Honor Type</label>
                            <select 
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filters.honor_type || ''}
                                onChange={(e) => router.get('/instructor/honors', { honor_type: e.target.value })}
                            >
                                <option value="">All Types</option>
                                <option value="honor_roll">Honor Roll</option>
                                <option value="dean_list">Dean's List</option>
                                <option value="president_list">President's List</option>
                                <option value="academic_excellence">Academic Excellence</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filters.is_approved || ''}
                                onChange={(e) => router.get('/instructor/honors', { is_approved: e.target.value })}
                            >
                                <option value="">All Status</option>
                                <option value="1">Approved</option>
                                <option value="0">Pending</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Level</label>
                            <select 
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filters.academic_level_id || ''}
                                onChange={(e) => router.get('/instructor/honors', { academic_level_id: e.target.value })}
                            >
                                <option value="">All Levels</option>
                                <option value="1">Elementary</option>
                                <option value="2">Junior High School</option>
                                <option value="3">Senior High School</option>
                                <option value="4">College</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => router.get('/instructor/honors')}
                                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Honors Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Honor Results ({honors.length})
                        </h3>
                    </div>
                    
                    {honors.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <span className="text-4xl mb-4 block">🏆</span>
                            <p>No honor results found.</p>
                            <p className="text-sm">Honor results will appear here once calculated.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Honor Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GPA</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program/Level</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Awarded Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {honors.map((honor) => (
                                        <tr key={honor.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{honor.student.name}</div>
                                                    <div className="text-sm text-gray-500">{honor.student.student_profile?.student_id}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHonorTypeColor(honor.honor_type)}`}>
                                                    {getHonorTypeDisplay(honor.honor_type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {honor.gpa?.toFixed(2) || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        getStudentType(honor.student) === 'College' 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {getStudentType(honor.student)}
                                                    </span>
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        {getStudentInfo(honor.student)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    honor.is_approved 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {honor.is_approved ? 'Approved' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {honor.awarded_date ? new Date(honor.awarded_date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedHonor(honor)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Honor Criteria Information */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Honor Criteria</h3>
                    </div>
                    <div className="p-6">
                        {honorCriteria.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                                <p>No honor criteria defined.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {honorCriteria.map((criterion) => (
                                    <div key={criterion.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">
                                                {getHonorTypeDisplay(criterion.honor_type)}
                                            </h4>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                criterion.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {criterion.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            GPA Range: {criterion.minimum_grade} - {criterion.maximum_grade}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {criterion.criteria_description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Honor Details Modal */}
                {selectedHonor && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Honor Details</h3>
                                    <button
                                        onClick={() => setSelectedHonor(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Student Information</h4>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <p><strong>Name:</strong> {selectedHonor.student.name}</p>
                                            <p><strong>Student ID:</strong> {selectedHonor.student.student_profile?.student_id}</p>
                                            <p><strong>Email:</strong> {selectedHonor.student.email}</p>
                                            <p><strong>Program/Level:</strong> {getStudentInfo(selectedHonor.student)}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium text-gray-900">Honor Information</h4>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <p><strong>Type:</strong> {getHonorTypeDisplay(selectedHonor.honor_type)}</p>
                                            <p><strong>GPA:</strong> {selectedHonor.gpa?.toFixed(2) || 'N/A'}</p>
                                            <p><strong>Status:</strong> {selectedHonor.is_approved ? 'Approved' : 'Pending'}</p>
                                            <p><strong>Awarded Date:</strong> {selectedHonor.awarded_date ? new Date(selectedHonor.awarded_date).toLocaleDateString() : 'N/A'}</p>
                                            {selectedHonor.remarks && (
                                                <p><strong>Remarks:</strong> {selectedHonor.remarks}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium text-gray-900">Timeline</h4>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <p><strong>Created:</strong> {new Date(selectedHonor.created_at).toLocaleString()}</p>
                                            <p><strong>Last Updated:</strong> {new Date(selectedHonor.updated_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={() => setSelectedHonor(null)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </InstructorLayout>
        </>
    );
};

export default HonorsIndex; 