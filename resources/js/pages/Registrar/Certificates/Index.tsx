import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from '@/pages/Registrar/Header';
import Sidebar from '@/pages/Registrar/Sidebar';

interface Student {
    id: number;
    name: string;
    student_profile?: {
        student_id: string;
        grade_level: string;
        section: string;
    };
}

interface CertificateTemplate {
    id: number;
    name: string;
    certificate_type: string;
}

interface GeneratedCertificate {
    id: number;
    student: Student;
    template: CertificateTemplate;
    certificate_type: string;
    filename: string;
    file_path: string;
    generated_at: string;
    created_at: string;
}

interface Props {
    certificates: {
        data: GeneratedCertificate[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const CertificatesIndex: React.FC<Props> = ({ certificates }) => {
    const getCertificateTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            'honor_roll': 'bg-blue-100 text-blue-800',
            'achievement': 'bg-green-100 text-green-800',
            'completion': 'bg-purple-100 text-purple-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Head title="Certificates - Registrar" />
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">Certificates</h1>
                                        <p className="text-gray-600 mt-2">View and manage generated certificates</p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <Link
                                            href="/registrar/certificates/templates"
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Templates
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Certificates Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Generated Certificates ({certificates.total})
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
                                                    Certificate Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Template
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Generated Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {certificates.data.map((certificate) => (
                                                <tr key={certificate.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {certificate.student.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {certificate.student.student_profile?.student_id || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCertificateTypeColor(certificate.certificate_type)}`}>
                                                            {certificate.certificate_type.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {certificate.template.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(certificate.generated_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={`/registrar/certificates/${certificate.id}/download`}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                Download
                                                            </Link>
                                                            <Link
                                                                href={`/registrar/certificates/${certificate.id}/print`}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Print
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {certificates.last_page > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-700">
                                                Showing {((certificates.current_page - 1) * certificates.per_page) + 1} to{' '}
                                                {Math.min(certificates.current_page * certificates.per_page, certificates.total)} of{' '}
                                                {certificates.total} results
                                            </div>
                                            <div className="flex space-x-2">
                                                {certificates.current_page > 1 && (
                                                    <Link
                                                        href={`/registrar/certificates?page=${certificates.current_page - 1}`}
                                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        Previous
                                                    </Link>
                                                )}
                                                {certificates.current_page < certificates.last_page && (
                                                    <Link
                                                        href={`/registrar/certificates?page=${certificates.current_page + 1}`}
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
                    </main>
                </div>
            </div>
        </>
    );
};

export default CertificatesIndex; 