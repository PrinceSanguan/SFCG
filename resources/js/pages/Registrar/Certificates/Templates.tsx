import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import RegistrarLayout from '@/pages/Registrar/RegistrarLayout';

interface CertificateTemplate {
    id: number;
    name: string;
    certificate_type: string;
    template_type: string;
    education_level: string;
    is_active: boolean;
    image_description?: string;
    template_image_path?: string;
    created_at: string;
}

interface Props {
    templates: CertificateTemplate[];
}

const CertificateTemplates: React.FC<Props> = ({ templates = [] }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<CertificateTemplate | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        certificate_type: '',
        template_type: 'image',
        education_level: '',
        image_description: '',
        template_image: null as File | null,
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('certificate_type', data.certificate_type);
        formData.append('template_type', data.template_type);
        formData.append('education_level', data.education_level);
        formData.append('image_description', data.image_description);
        formData.append('is_active', data.is_active.toString());
        
        if (data.template_image) {
            formData.append('template_image', data.template_image);
        }
        
        if (editingTemplate) {
            router.post(`/registrar/certificates/templates/${editingTemplate.id}`, formData, {
                onSuccess: () => {
                    setEditingTemplate(null);
                    setShowCreateModal(false);
                    reset();
                }
            });
        } else {
            router.post('/registrar/certificates/templates', formData, {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (template: CertificateTemplate) => {
        setData('name', template.name);
        setData('certificate_type', template.certificate_type);
        setData('template_type', template.template_type);
        setData('education_level', template.education_level);
        setData('image_description', template.image_description || '');
        setData('is_active', template.is_active);
        setEditingTemplate(template);
        setShowCreateModal(true);
    };

    const handleDelete = (template: CertificateTemplate) => {
        setShowDeleteModal(template);
    };

    const confirmDelete = () => {
        if (showDeleteModal) {
            router.delete(`/registrar/certificates/templates/${showDeleteModal.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(null);
                }
            });
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingTemplate(null);
        setShowDeleteModal(null);
        reset();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('template_image', e.target.files[0]);
        }
    };

    const getCertificateTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            'honor_roll': 'bg-blue-100 text-blue-800',
            'achievement': 'bg-green-100 text-green-800',
            'completion': 'bg-purple-100 text-purple-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getEducationLevelColor = (level: string) => {
        const colors: { [key: string]: string } = {
            'elementary': 'bg-yellow-100 text-yellow-800',
            'junior_high': 'bg-orange-100 text-orange-800',
            'senior_high': 'bg-red-100 text-red-800',
            'college': 'bg-indigo-100 text-indigo-800',
        };
        return colors[level] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Head title="Certificate Templates - Registrar" />
            <RegistrarLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Certificate Templates</h1>
                            <p className="text-gray-600 mt-2">Create and manage certificate templates</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Add Template
                            </button>
                            <Link
                                href="/registrar/certificates"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Certificates
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Total Templates</h3>
                        <p className="text-3xl font-bold text-blue-600">{templates.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Active Templates</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {templates.filter(t => t.is_active).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Honor Roll</h3>
                        <p className="text-3xl font-bold text-yellow-600">
                            {templates.filter(t => t.certificate_type === 'honor_roll').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-medium text-gray-900">Achievement</h3>
                        <p className="text-3xl font-bold text-purple-600">
                            {templates.filter(t => t.certificate_type === 'achievement').length}
                        </p>
                    </div>
                </div>

                {/* Certificate Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* Template Image Preview */}
                            {template.template_image_path && (
                                <div className="aspect-[3/2] bg-gray-100 flex items-center justify-center">
                                    <img
                                        src={`/storage/${template.template_image_path}`}
                                        alt={template.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            
                            {/* Template Info */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        template.is_active 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {template.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCertificateTypeColor(template.certificate_type)}`}>
                                            {template.certificate_type.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEducationLevelColor(template.education_level)}`}>
                                            {template.education_level.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    
                                    {template.image_description && (
                                        <p className="text-sm text-gray-600">{template.image_description}</p>
                                    )}
                                    
                                    <p className="text-xs text-gray-500">
                                        Created: {new Date(template.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(template)}
                                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template)}
                                        className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create/Edit Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingTemplate ? 'Edit Template' : 'Add Template'}
                                </h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Template Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Certificate Type
                                        </label>
                                        <select
                                            value={data.certificate_type}
                                            onChange={(e) => setData('certificate_type', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select certificate type</option>
                                            <option value="honor_roll">Honor Roll</option>
                                            <option value="achievement">Achievement</option>
                                            <option value="completion">Completion</option>
                                        </select>
                                        {errors.certificate_type && (
                                            <p className="mt-1 text-sm text-red-600">{errors.certificate_type}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Education Level
                                        </label>
                                        <select
                                            value={data.education_level}
                                            onChange={(e) => setData('education_level', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select education level</option>
                                            <option value="elementary">Elementary</option>
                                            <option value="junior_high">Junior High</option>
                                            <option value="senior_high">Senior High</option>
                                            <option value="college">College</option>
                                        </select>
                                        {errors.education_level && (
                                            <p className="mt-1 text-sm text-red-600">{errors.education_level}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Image Description
                                        </label>
                                        <textarea
                                            value={data.image_description}
                                            onChange={(e) => setData('image_description', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        {errors.image_description && (
                                            <p className="mt-1 text-sm text-red-600">{errors.image_description}</p>
                                        )}
                                    </div>

                                    {!editingTemplate && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Template Image
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required={!editingTemplate}
                                            />
                                            {errors.template_image && (
                                                <p className="mt-1 text-sm text-red-600">{errors.template_image}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Active</span>
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : (editingTemplate ? 'Update' : 'Create')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                                <p className="text-gray-600 mb-4">
                                    Are you sure you want to delete the template "{showDeleteModal.name}"?
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowDeleteModal(null)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </RegistrarLayout>
        </>
    );
};

export default CertificateTemplates; 