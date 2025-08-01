import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/pages/Admin/AdminLayout';
import StudentLayout from '@/pages/Student/StudentDashboard';

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
    certificate_type: string;
    certificate_number: string;
    upload_status: string;
    upload_notes?: string;
    uploaded_at?: string;
    approved_at?: string;
    usage_type?: string;
    usage_notes?: string;
    certificate_image_path?: string;
    uploadedBy?: {
        name: string;
    };
    approvedBy?: {
        name: string;
    };
}

interface Props {
    certificates: {
        data: Certificate[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    uploadStatuses: string[];
    certificateTypes: string[];
    usageTypes: string[];
    filters: {
        upload_status?: string;
        certificate_type?: string;
        search?: string;
    };
    userRole: string;
}

const CertificateImageUploads: React.FC<Props> = ({ 
    certificates, 
    uploadStatuses, 
    certificateTypes, 
    usageTypes,
    filters,
    userRole 
}) => {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
    const [selectedCertificates, setSelectedCertificates] = useState<number[]>([]);

    const { data, setData, get } = useForm({
        upload_status: filters.upload_status || '',
        certificate_type: filters.certificate_type || '',
        search: filters.search || '',
    });

    const { data: uploadData, setData: setUploadData, post: postUpload, processing: uploading } = useForm({
        certificate_image: null as File | null,
        usage_type: '',
        usage_notes: '',
    });

    const { data: approveData, setData: setApproveData, post: postApprove, processing: approving } = useForm({
        upload_notes: '',
    });

    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejecting } = useForm({
        upload_notes: '',
    });

    const handleFilter = () => {
        get('/certificate-images', { preserveState: true });
    };

    const handleUpload = (certificate: Certificate) => {
        setSelectedCertificate(certificate);
        setShowUploadModal(true);
    };

    const handleApprove = (certificate: Certificate) => {
        setSelectedCertificate(certificate);
        setShowApproveModal(true);
    };

    const handleReject = (certificate: Certificate) => {
        setSelectedCertificate(certificate);
        setShowRejectModal(true);
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCertificate || !uploadData.certificate_image) return;

        const formData = new FormData();
        formData.append('certificate_image', uploadData.certificate_image);
        formData.append('usage_type', uploadData.usage_type);
        formData.append('usage_notes', uploadData.usage_notes);

        router.post(`/certificate-images/${selectedCertificate.id}/upload`, formData, {
            onSuccess: () => {
                setShowUploadModal(false);
                setSelectedCertificate(null);
                setUploadData({
                    certificate_image: null,
                    usage_type: '',
                    usage_notes: '',
                });
            },
        });
    };

    const handleApproveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCertificate) return;

        router.post(`/certificate-images/${selectedCertificate.id}/approve`, approveData, {
            onSuccess: () => {
                setShowApproveModal(false);
                setSelectedCertificate(null);
                setApproveData({ upload_notes: '' });
            },
        });
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCertificate) return;

        router.post(`/certificate-images/${selectedCertificate.id}/reject`, rejectData, {
            onSuccess: () => {
                setShowRejectModal(false);
                setSelectedCertificate(null);
                setRejectData({ upload_notes: '' });
            },
        });
    };

    const handleBulkApprove = () => {
        if (selectedCertificates.length === 0) return;

        router.post('/certificate-images/bulk-approve', {
            certificate_ids: selectedCertificates,
        });
    };

    const handleBulkReject = () => {
        if (selectedCertificates.length === 0) return;

        router.post('/certificate-images/bulk-reject', {
            certificate_ids: selectedCertificates,
            upload_notes: rejectData.upload_notes,
        });
    };

    const handleCertificateSelect = (certificateId: number) => {
        setSelectedCertificates(prev => 
            prev.includes(certificateId) 
                ? prev.filter(id => id !== certificateId)
                : [...prev, certificateId]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'uploaded': return 'bg-blue-100 text-blue-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending Upload';
            case 'uploaded': return 'Awaiting Approval';
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const Layout = userRole === 'admin' ? AdminLayout : StudentLayout;

    return (
        <>
            <Head title="Certificate Image Uploads" />
            <Layout>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Certificate Image Uploads</h1>
                    <p className="text-gray-600 mt-2">
                        {userRole === 'admin' 
                            ? 'Manage student certificate image uploads and approvals'
                            : 'Upload your certificate images for approval'
                        }
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Status
                            </label>
                            <select
                                value={data.upload_status}
                                onChange={(e) => setData('upload_status', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">All Statuses</option>
                                {uploadStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {getStatusText(status)}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                        {type.replace('_', ' ').toUpperCase()}
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
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Search by name, email, or certificate number..."
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleFilter}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions for Admin */}
                {userRole === 'admin' && selectedCertificates.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                {selectedCertificates.length} certificate(s) selected
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleBulkApprove}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                                >
                                    Approve Selected
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                                >
                                    Reject Selected
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Certificates List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Certificates</h2>
                    </div>
                    
                    {certificates.data.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No certificates found matching your criteria.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {userRole === 'admin' && (
                                            <th className="px-6 py-3 text-left">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedCertificates(certificates.data.map(c => c.id));
                                                        } else {
                                                            setSelectedCertificates([]);
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Certificate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usage
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Uploaded
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {certificates.data.map((certificate) => (
                                        <tr key={certificate.id} className="hover:bg-gray-50">
                                            {userRole === 'admin' && (
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCertificates.includes(certificate.id)}
                                                        onChange={() => handleCertificateSelect(certificate.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {certificate.student.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {certificate.student.studentProfile.student_id}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {certificate.certificateTemplate.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {certificate.certificate_number}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(certificate.upload_status)}`}>
                                                    {getStatusText(certificate.upload_status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {certificate.usage_type ? certificate.usage_type.replace('_', ' ').toUpperCase() : '-'}
                                                </div>
                                                {certificate.usage_notes && (
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {certificate.usage_notes}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {certificate.uploaded_at ? formatDate(certificate.uploaded_at) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    {certificate.certificate_image_path && (
                                                        <button
                                                            onClick={() => window.open(`/certificate-images/${certificate.id}/image`, '_blank')}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            View
                                                        </button>
                                                    )}
                                                    
                                                    {certificate.upload_status === 'pending' && userRole === 'student' && (
                                                        <button
                                                            onClick={() => handleUpload(certificate)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Upload
                                                        </button>
                                                    )}
                                                    
                                                    {certificate.upload_status === 'uploaded' && userRole === 'admin' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(certificate)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(certificate)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    
                                                    {certificate.upload_status === 'rejected' && userRole === 'student' && (
                                                        <button
                                                            onClick={() => handleUpload(certificate)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Re-upload
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Upload Modal */}
                {showUploadModal && selectedCertificate && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-5 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Certificate Image</h3>
                                
                                <form onSubmit={handleUploadSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Certificate Image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setUploadData('certificate_image', e.target.files?.[0] || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Accepted formats: JPEG, PNG, JPG, GIF (Max: 10MB)
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Usage Type
                                        </label>
                                        <select
                                            value={uploadData.usage_type}
                                            onChange={(e) => setUploadData('usage_type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select Usage Type</option>
                                            {usageTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type.replace('_', ' ').toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Usage Notes
                                        </label>
                                        <textarea
                                            value={uploadData.usage_notes}
                                            onChange={(e) => setUploadData('usage_notes', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Describe how you plan to use this certificate..."
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowUploadModal(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={uploading}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {uploading ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Approve Modal */}
                {showApproveModal && selectedCertificate && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-5 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Approve Certificate</h3>
                                
                                <form onSubmit={handleApproveSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Approval Notes (Optional)
                                        </label>
                                        <textarea
                                            value={approveData.upload_notes}
                                            onChange={(e) => setApproveData('upload_notes', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Add any notes about this approval..."
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowApproveModal(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={approving}
                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {approving ? 'Approving...' : 'Approve'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && selectedCertificate && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-5 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Certificate</h3>
                                
                                <form onSubmit={handleRejectSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rejection Reason *
                                        </label>
                                        <textarea
                                            value={rejectData.upload_notes}
                                            onChange={(e) => setRejectData('upload_notes', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Please provide a reason for rejection..."
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowRejectModal(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={rejecting}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {rejecting ? 'Rejecting...' : 'Reject'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        </>
    );
};

export default CertificateImageUploads; 