import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import RegistrarLayout from '@/pages/Registrar/RegistrarLayout';

interface StudentProfile {
    id: number;
    student_id: string;
    grade_level: string;
    section: string;
}

interface HonorCriterion {
    id: number;
    name: string;
    honor_type: string;
    minimum_grade: number;
}

interface Student {
    id: number;
    name: string;
    email: string;
    student_profile?: StudentProfile;
}

interface StudentHonor {
    id: number;
    student: Student;
    honor_criterion: HonorCriterion;
    honor_type: string;
    gpa: number;
    is_approved: boolean;
    awarded_date: string;
    created_at: string;
}

interface Props {
    honors: {
        data: StudentHonor[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const HonorsIndex: React.FC<Props> = ({ honors = { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 } }) => {
    const { post, processing } = useForm();

    const handleCalculateHonors = () => {
        post('/registrar/honors/calculate');
    };

    const handleExportHonors = () => {
        post('/registrar/honors/export');
    };

    const getHonorTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            'honor_roll': 'bg-blue-100 text-blue-800',
            'dean_list': 'bg-green-100 text-green-800',
            'president_list': 'bg-purple-100 text-purple-800',
            'academic_excellence': 'bg-yellow-100 text-yellow-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getApprovalStatusColor = (approved: boolean) => {
        return approved 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800';
    };

    return (
        <>
            <Head title="Honors - Registrar" />
            <RegistrarLayout>
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">Student Honors</h1>
                                        <p className="text-gray-600 mt-2">Manage and track student academic honors</p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleCalculateHonors}
                                            disabled={processing}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            {processing ? 'Calculating...' : 'Calculate Honors'}
                                        </button>
                                        <button
                                            onClick={handleExportHonors}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Export
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Honors Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Honors ({honors?.total || 0})
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Student
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Honor Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    GPA
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Awarded Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {honors?.data?.map((honor) => (
                                                <tr key={honor.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {honor.student.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {honor.student.student_profile?.student_id || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHonorTypeColor(honor.honor_type)}`}>
                                                            {honor.honor_criterion.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {honor.gpa.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApprovalStatusColor(honor.is_approved)}`}>
                                                            {honor.is_approved ? 'Approved' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(honor.awarded_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <Link
                                                            href={`/registrar/honors/${honor.id}`}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {honors?.last_page > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-700">
                                                                                            Showing {((honors?.current_page || 1) - 1) * (honors?.per_page || 20) + 1} to{' '}
                                            {Math.min((honors?.current_page || 1) * (honors?.per_page || 20), honors?.total || 0)} of{' '}
                                            {honors?.total || 0} results
                                            </div>
                                            <div className="flex space-x-2">
                                                {honors?.current_page > 1 && (
                                                    <Link
                                                                                                                  href={`/registrar/honors?page=${(honors?.current_page || 1) - 1}`}
                                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        Previous
                                                    </Link>
                                                )}
                                                {honors?.current_page < honors?.last_page && (
                                                    <Link
                                                                                                                  href={`/registrar/honors?page=${(honors?.current_page || 1) + 1}`}
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
                        </div>
            </RegistrarLayout>
        </>
    );
};

export default HonorsIndex; 