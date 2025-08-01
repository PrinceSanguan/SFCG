import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Header from '@/pages/Admin/Header';
import Sidebar from '@/pages/Admin/Sidebar';

interface CertificateTemplate {
    id: number;
    name: string;
    type: string;
    template_content: string;
    template_image_path?: string;
    image_description?: string;
    education_level?: string;
    template_type: 'code' | 'image';
    created_by?: number;
    image_uploaded_at?: string;
    variables?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    createdBy?: {
        name: string;
    };
}

interface Props {
    templates: {
        data: CertificateTemplate[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const TemplatesIndex: React.FC<Props> = ({ templates }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);
    const [previewData, setPreviewData] = useState<{ template: CertificateTemplate; preview: string } | null>(null);
    const [filterType, setFilterType] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const { data, setData, processing, errors, reset } = useForm({
        name: '',
        type: 'honor_roll',
        template_image: null as File | null,
        image_description: '',
        education_level: '',
        is_active: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('type', data.type);
        formData.append('template_type', 'image');
        formData.append('is_active', data.is_active.toString());
        
        if (data.template_image) {
            formData.append('template_image', data.template_image);
        }
        formData.append('image_description', data.image_description);
        formData.append('education_level', data.education_level);
        
        if (editingTemplate) {
            router.put(`/admin/certificates/templates/${editingTemplate.id}`, formData, {
                onSuccess: () => {
                    setEditingTemplate(null);
                    setShowCreateModal(false);
                    reset();
                }
            });
        } else {
            router.post('/admin/certificates/templates', formData, {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (template: CertificateTemplate) => {
        setData('name', template.name);
        setData('type', template.type);
        setData('image_description', template.image_description || '');
        setData('education_level', template.education_level || '');
        setData('is_active', template.is_active);
        setEditingTemplate(template);
        setShowCreateModal(true);
    };

    const handleDelete = (template: CertificateTemplate) => {
        if (confirm(`Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`)) {
            router.delete(`/admin/certificates/templates/${template.id}`);
        }
    };

    const handleDuplicate = (template: CertificateTemplate) => {
        setData('name', `${template.name} (Copy)`);
        setData('type', template.type);
        setData('image_description', template.image_description || '');
        setData('education_level', template.education_level || '');
        setData('is_active', template.is_active);
        setEditingTemplate(null); // Clear editing state to create new
        setShowCreateModal(true);
    };

    const handlePreview = (template: CertificateTemplate) => {
        // Create sample data for preview
        const sampleData = {
            student_name: 'John Doe',
            student_id: '2024-001',
            honor_type: 'Magna Cum Laude',
            gpa: '3.95',
            academic_period: '2023-2024',
            academic_level: 'Senior High School',
            section: 'STEM-A',
            date: new Date().toLocaleDateString(),
        };
        
        // Replace variables in template content
        let previewContent = template.template_content;
        Object.entries(sampleData).forEach(([key, value]) => {
            previewContent = previewContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        
        setPreviewData({ template, preview: previewContent });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingTemplate(null);
        setPreviewData(null);
        setData({
            name: '',
            type: 'honor_roll',
            template_image: null,
            image_description: '',
            education_level: '',
            is_active: true,
        });
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'honor_roll':
                return 'bg-blue-100 text-blue-800';
            case 'graduation':
                return 'bg-green-100 text-green-800';
            case 'achievement':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeDisplayName = (type: string) => {
        switch (type) {
            case 'honor_roll':
                return 'Honor Roll';
            case 'graduation':
                return 'Graduation';
            case 'achievement':
                return 'Achievement';
            default:
                return type;
        }
    };

    return (
        <>
            <Head title="Certificate Templates" />
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Certificate Templates</h1>
                                    <p className="text-gray-600 mt-2">Manage certificate templates for different types of certificates</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/admin/certificates"
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        ← Back to Certificates
                                    </Link>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        <span className="mr-2">➕</span>
                                        Add Template
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-md">
                                            <span className="text-white text-sm">📄</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Total Templates</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{templates.total}</dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-md">
                                            <span className="text-white text-sm">🏆</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Honor Roll</dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {templates.data.filter(t => t.type === 'honor_roll').length}
                                        </dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-md">
                                            <span className="text-white text-sm">🎓</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Graduation</dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {templates.data.filter(t => t.type === 'graduation').length}
                                        </dd>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-md">
                                            <span className="text-white text-sm">🏅</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <dt className="text-sm font-medium text-gray-500">Achievement</dt>
                                        <dd className="text-2xl font-bold text-gray-900">
                                            {templates.data.filter(t => t.type === 'achievement').length}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search Templates
                                    </label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Search by template name..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Filter by Type
                                    </label>
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">All Types</option>
                                        <option value="honor_roll">Honor Roll</option>
                                        <option value="graduation">Graduation</option>
                                        <option value="achievement">Achievement</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Templates List */}
                        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Certificate Templates</h2>
                            </div>
                            
                            {(() => {
                                const filteredTemplates = templates.data.filter(template => {
                                    const matchesSearch = !searchTerm || 
                                        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        template.template_content.toLowerCase().includes(searchTerm.toLowerCase());
                                    const matchesType = !filterType || template.type === filterType;
                                    return matchesSearch && matchesType;
                                });

                                if (filteredTemplates.length === 0) {
                                    return (
                                        <div className="p-6 text-center text-gray-500">
                                            <div className="text-lg">No templates match your filters</div>
                                            <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
                                        </div>
                                    );
                                }

                                return (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Education Level</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredTemplates.map((template) => (
                                                <tr key={template.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {template.image_description || 'Image-based template'}
                                                        </div>
                                                        {template.template_image_path && (
                                                            <button
                                                                onClick={() => window.open(`/admin/certificates/templates/${template.id}/image`, '_blank')}
                                                                className="text-xs text-blue-600 hover:text-blue-900 mt-1"
                                                            >
                                                                View Image
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                                                            {getTypeDisplayName(template.type)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {template.education_level ? 
                                                                template.education_level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                                                                'All Levels'
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            template.is_active 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {template.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(template.updated_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handlePreview(template)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                Preview
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(template)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDuplicate(template)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Duplicate
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(template)}
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
                                </div>
                            );
                        })()}
                        </div>

                        {/* Create/Edit Modal */}
                        {showCreateModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        {editingTemplate ? 'Edit Certificate Template' : 'Create Certificate Template'}
                                    </h3>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Template Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    placeholder="e.g., Honor Roll Certificate 2024"
                                                    required
                                                />
                                                {errors.name && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Certificate Type
                                                </label>
                                                <select
                                                    value={data.type}
                                                    onChange={(e) => setData('type', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
                                                >
                                                    <option value="honor_roll">Honor Roll</option>
                                                    <option value="graduation">Graduation</option>
                                                    <option value="achievement">Achievement</option>
                                                </select>
                                                {errors.type && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.type}</p>
                                                )}
                                            </div>
                                        </div>



                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Template Image
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setData('template_image', e.target.files?.[0] || null)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Accepted formats: JPEG, PNG, JPG, GIF (Max: 10MB)
                                                </p>
                                                {errors.template_image && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.template_image}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Image Description
                                                </label>
                                                <textarea
                                                    value={data.image_description}
                                                    onChange={(e) => setData('image_description', e.target.value)}
                                                    rows={3}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    placeholder="Describe the template image and its intended use..."
                                                />
                                                {errors.image_description && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.image_description}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Education Level
                                                </label>
                                                <select
                                                    value={data.education_level}
                                                    onChange={(e) => setData('education_level', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
                                                >
                                                    <option value="">Select Education Level</option>
                                                    <option value="elementary">Elementary</option>
                                                    <option value="junior_high">Junior High School</option>
                                                    <option value="senior_high">Senior High School</option>
                                                    <option value="college">College</option>
                                                </select>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    This template will be available for students at this education level
                                                </p>
                                                {errors.education_level && (
                                                    <p className="text-red-600 text-sm mt-1">{errors.education_level}</p>
                                                )}
                                            </div>
                                        </div>



                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label className="ml-2 text-sm text-gray-700">Active</label>
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
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
                        )}

                        {/* Preview Modal */}
                        {previewData && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Template Preview: {previewData.template.name}
                                        </h3>
                                        <button
                                            onClick={() => setPreviewData(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    
                                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div 
                                            className="prose max-w-none"
                                            dangerouslySetInnerHTML={{ __html: previewData.preview }}
                                        />
                                    </div>
                                    
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => setPreviewData(null)}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};

export default TemplatesIndex; 