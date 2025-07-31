import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';

interface Certificate {
    id: number;
    student: {
        name: string;
        email: string;
        studentProfile: {
            student_id: string;
            grade_level: string;
        };
    };
    certificateTemplate: {
        name: string;
        type: string;
    };
    academicPeriod?: {
        name: string;
    };
    generatedBy: {
        name: string;
    };
    certificate_type: string;
    certificate_number: string;
    generated_at: string;
    is_digitally_signed: boolean;
    file_path?: string;
}

interface CertificateTemplate {
    id: number;
    name: string;
    type: string;
}

interface AcademicPeriod {
    id: number;
    name: string;
}

interface Props {
    certificates: {
        data: Certificate[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    certificateTypes: string[];
    academicPeriods: AcademicPeriod[];
    templates: CertificateTemplate[];
    stats: {
        total_certificates: number;
        honor_roll_certificates: number;
        graduation_certificates: number;
        achievement_certificates: number;
    };
    filters: {
        certificate_type?: string;
        academic_period_id?: number;
        search?: string;
    };
}

const CertificatesIndex: React.FC<Props> = ({ 
    certificates, 
    certificateTypes, 
    academicPeriods, 
    templates,
    stats,
    filters 
}) => {
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    const { data, setData, get } = useForm({
        certificate_type: filters.certificate_type || '',
        academic_period_id: filters.academic_period_id || '',
        search: filters.search || '',
    });

    const { data: generateData, setData: setGenerateData, post: postGenerate, processing: generating } = useForm({
        certificate_type: '',
        template_id: '',
        academic_period_id: '',
        student_ids: [] as number[],
    });

    const handleFilter = () => {
        get('/admin/certificates', { preserveState: true });
    };

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        
        postGenerate('/admin/certificates/generate', {
            onSuccess: () => {
                setShowGenerateModal(false);
                setGenerateData({
                    certificate_type: '',
                    template_id: '',
                    academic_period_id: '',
                    student_ids: [],
                });
            }
        });
    };

    const handleDownload = (certificate: Certificate) => {
        if (certificate.file_path) {
            window.open(`/admin/certificates/${certificate.id}/download`, '_blank');
        }
    };

    const handleDelete = (certificate: Certificate) => {
        if (confirm(`Are you sure you want to delete certificate ${certificate.certificate_number}?`)) {
            router.delete(`/admin/certificates/${certificate.id}`);
        }
    };

    const getTypeColor = (type: string) => {
        const colors = {
            honor_roll: 'bg-yellow-100 text-yellow-800',
            graduation: 'bg-green-100 text-green-800',
            achievement: 'bg-blue-100 text-blue-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <>
            <Head title="Certificates Management" />
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Certificates Management</h1>
                                    <p className="text-gray-600 mt-2">Generate and manage academic certificates</p>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowGenerateModal(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        📜 Generate Certificate
                                    </button>
                                    <Link
                                        href="/admin/certificates/templates"
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        🛠️ Manage Templates
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-md">
                                            <span className="text-white text-sm">📜</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Total Certificates</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.total_certificates}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-md">
                                            <span className="text-white text-sm">🏆</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Honor Roll</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.honor_roll_certificates}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-md">
                                            <span className="text-white text-sm">🎓</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Graduation</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.graduation_certificates}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-md">
                                            <span className="text-white text-sm">🏅</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Achievement</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{stats.achievement_certificates}</dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Certificate Type
                                    </label>
                                    <select
                                        value={data.certificate_type}
                                        onChange={(e) => setData('certificate_type', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Types</option>
                                        {certificateTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Academic Period
                                    </label>
                                    <select
                                        value={data.academic_period_id}
                                        onChange={(e) => setData('academic_period_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Periods</option>
                                        {academicPeriods.map((period) => (
                                            <option key={period.id} value={period.id}>
                                                {period.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                        placeholder="Search certificates..."
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <button
                                    onClick={handleFilter}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>

                        {/* Certificates Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Certificate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Period
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Generated
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
                                                        {certificate.student.studentProfile.student_id} • {certificate.student.studentProfile.grade_level}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {certificate.certificateTemplate.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        #{certificate.certificate_number}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(certificate.certificate_type)}`}>
                                                    {certificate.certificate_type.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {certificate.academicPeriod?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(certificate.generated_at)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    by {certificate.generatedBy.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    {certificate.file_path && (
                                                        <button
                                                            onClick={() => handleDownload(certificate)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Download
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(certificate)}
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

                            {certificates.data.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-gray-500 text-lg">No certificates found</div>
                                    <p className="text-gray-400 mt-2">Try adjusting your filters or generate some certificates</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {certificates.total > certificates.per_page && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {((certificates.current_page - 1) * certificates.per_page) + 1} to {Math.min(certificates.current_page * certificates.per_page, certificates.total)} of {certificates.total} results
                                </div>
                                
                                <div className="flex space-x-2">
                                    {Array.from({ length: certificates.last_page }, (_, i) => (
                                        <Link
                                            key={i + 1}
                                            href={`/admin/certificates?page=${i + 1}`}
                                            className={`px-3 py-2 rounded-md text-sm ${
                                                certificates.current_page === i + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            }`}
                                        >
                                            {i + 1}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Generate Certificate Modal */}
                        {showGenerateModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Certificate</h3>
                                    
                                    <form onSubmit={handleGenerate} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Certificate Type
                                            </label>
                                            <select
                                                value={generateData.certificate_type}
                                                onChange={(e) => setGenerateData('certificate_type', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                <option value="honor_roll">Honor Roll</option>
                                                <option value="graduation">Graduation</option>
                                                <option value="achievement">Achievement</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Template
                                            </label>
                                            <select
                                                value={generateData.template_id}
                                                onChange={(e) => setGenerateData('template_id', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="">Select Template</option>
                                                {templates
                                                    .filter(template => !generateData.certificate_type || template.type === generateData.certificate_type)
                                                    .map((template) => (
                                                        <option key={template.id} value={template.id}>
                                                            {template.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Academic Period
                                            </label>
                                            <select
                                                value={generateData.academic_period_id}
                                                onChange={(e) => setGenerateData('academic_period_id', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="">Select Period</option>
                                                {academicPeriods.map((period) => (
                                                    <option key={period.id} value={period.id}>
                                                        {period.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowGenerateModal(false)}
                                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={generating}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {generating ? 'Generating...' : 'Generate'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};

export default CertificatesIndex; 