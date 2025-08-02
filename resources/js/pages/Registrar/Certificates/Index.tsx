import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import RegistrarLayout from '@/pages/Registrar/RegistrarLayout';

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
    education_level: string;
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
    templates: CertificateTemplate[];
    students: Student[];
}

const CertificatesIndex: React.FC<Props> = ({ 
    certificates = { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 },
    templates = [],
    students = []
}) => {
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        template_id: '',
        student_ids: [] as number[],
        certificate_type: '',
    });

    const handleGenerateCertificate = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/registrar/certificates/generate', {
            onSuccess: () => {
                setShowGenerateModal(false);
                reset();
                setSelectedStudents([]);
            }
        });
    };

    const handleBulkGenerate = () => {
        if (selectedStudents.length === 0) {
            alert('Please select students first.');
            return;
        }

        if (!selectedTemplate) {
            alert('Please select a template first.');
            return;
        }

        const template = templates.find(t => t.id.toString() === selectedTemplate);
        if (!template) return;

        setData({
            template_id: selectedTemplate,
            student_ids: selectedStudents,
            certificate_type: template.certificate_type,
        });

        post('/registrar/certificates/bulk-generate', {
            onSuccess: () => {
                setSelectedStudents([]);
                setSelectedTemplate('');
            }
        });
    };

    const handleDownload = (certificate: GeneratedCertificate) => {
        window.open(`/registrar/certificates/${certificate.id}/download`, '_blank');
    };

    const handlePrint = (certificate: GeneratedCertificate) => {
        window.open(`/registrar/certificates/${certificate.id}/print`, '_blank');
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
            <RegistrarLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Certificates</h1>
                            <p className="text-gray-600 mt-2">Generate and manage student certificates</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowGenerateModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Generate Certificate
                            </button>
                            <button
                                onClick={handleBulkGenerate}
                                disabled={selectedStudents.length === 0 || !selectedTemplate}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                Bulk Generate ({selectedStudents.length})
                            </button>
                            <Link
                                href="/registrar/certificates/templates"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Templates
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Total Certificates</h3>
                        <p className="text-3xl font-bold text-blue-600">{certificates.total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Available Templates</h3>
                        <p className="text-3xl font-bold text-green-600">{templates.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Total Students</h3>
                        <p className="text-3xl font-bold text-yellow-600">{students.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">This Month</h3>
                        <p className="text-3xl font-bold text-purple-600">
                            {certificates.data.filter(c => {
                                const created = new Date(c.created_at);
                                const now = new Date();
                                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                            }).length}
                        </p>
                    </div>
                </div>

                {/* Template Selection */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Certificate Generation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Template
                            </label>
                            <select
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Choose a template</option>
                                {templates.map((template) => (
                                    <option key={template.id} value={template.id}>
                                        {template.name} ({template.certificate_type.replace('_', ' ').toUpperCase()})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Selected Students: {selectedStudents.length}
                            </label>
                            <button
                                onClick={() => setSelectedStudents(students.map(s => s.id))}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 mr-2"
                            >
                                Select All
                            </button>
                            <button
                                onClick={() => setSelectedStudents([])}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                Clear Selection
                            </button>
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
                                                <div className="text-sm font-medium text-gray-900">{certificate.student.name}</div>
                                                <div className="text-sm text-gray-500">{certificate.student.student_profile?.student_id}</div>
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
                                            <button
                                                onClick={() => handleDownload(certificate)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Download
                                            </button>
                                            <button
                                                onClick={() => handlePrint(certificate)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Print
                                            </button>
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

                {/* Generate Certificate Modal */}
                {showGenerateModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Certificate</h3>
                                <form onSubmit={handleGenerateCertificate}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Template
                                        </label>
                                        <select
                                            value={data.template_id}
                                            onChange={(e) => setData('template_id', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select a template</option>
                                            {templates.map((template) => (
                                                <option key={template.id} value={template.id}>
                                                    {template.name} ({template.certificate_type.replace('_', ' ').toUpperCase()})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.template_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.template_id}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Student
                                        </label>
                                        <select
                                            value={data.student_ids[0] || ''}
                                            onChange={(e) => setData('student_ids', [parseInt(e.target.value)])}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select a student</option>
                                            {students.map((student) => (
                                                <option key={student.id} value={student.id}>
                                                    {student.name} ({student.student_profile?.student_id})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.student_ids && (
                                            <p className="mt-1 text-sm text-red-600">{errors.student_ids}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowGenerateModal(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Generating...' : 'Generate'}
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

export default CertificatesIndex; 