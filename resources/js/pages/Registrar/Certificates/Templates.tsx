import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from '@/pages/Registrar/Header';
import Sidebar from '@/pages/Registrar/Sidebar';

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

const CertificateTemplates: React.FC<Props> = ({ templates }) => {
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
                                        <h1 className="text-3xl font-bold text-gray-900">Certificate Templates</h1>
                                        <p className="text-gray-600 mt-2">View and manage certificate templates</p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <Link
                                            href="/registrar/certificates"
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Certificates
                                        </Link>
                                    </div>
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
                                                
                                                <div className="text-sm text-gray-500">
                                                    Type: {template.template_type}
                                                </div>
                                                
                                                {template.image_description && (
                                                    <div className="text-sm text-gray-600">
                                                        {template.image_description}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {templates.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No certificate templates</h3>
                                    <p className="text-gray-500">No certificate templates have been created yet.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default CertificateTemplates; 