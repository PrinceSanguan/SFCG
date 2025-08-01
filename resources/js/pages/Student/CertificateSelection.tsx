import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/pages/Student/StudentDashboard';

interface CertificateTemplate {
    id: number;
    name: string;
    type: string;
    template_image_path?: string;
    image_description?: string;
    education_level?: string;
}

interface StudentHonor {
    id: number;
    honor_type: string;
    academic_period: {
        name: string;
    };
    is_active: boolean;
}

interface Props {
    studentHonors: StudentHonor[];
    studentEducationLevel: string;
}

const CertificateSelection: React.FC<Props> = ({ studentHonors, studentEducationLevel }) => {
    const [selectedHonor, setSelectedHonor] = useState<StudentHonor | null>(null);
    const [availableTemplates, setAvailableTemplates] = useState<CertificateTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
    const [loading, setLoading] = useState(false);

    const getEducationLevelKey = (level: string) => {
        switch (level.toLowerCase()) {
            case 'elementary':
                return 'elementary';
            case 'junior high':
            case 'junior high school':
                return 'junior_high';
            case 'senior high':
            case 'senior high school':
                return 'senior_high';
            case 'college':
                return 'college';
            default:
                return 'elementary';
        }
    };

    const handleHonorSelect = async (honor: StudentHonor) => {
        setSelectedHonor(honor);
        setSelectedTemplate(null);
        setLoading(true);

        try {
            const educationLevelKey = getEducationLevelKey(studentEducationLevel);
            const response = await fetch(`/certificate-templates/by-education-level?education_level=${educationLevelKey}&certificate_type=honor_roll`);
            const templates = await response.json();
            setAvailableTemplates(templates);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateSelect = (template: CertificateTemplate) => {
        setSelectedTemplate(template);
    };

    const handleGenerateCertificate = () => {
        if (!selectedHonor || !selectedTemplate) return;

        router.post('/certificate-images/generate-from-honor', {
            honor_id: selectedHonor.id,
            template_id: selectedTemplate.id,
        });
    };

    const getHonorTypeDisplay = (honorType: string) => {
        switch (honorType.toLowerCase()) {
            case 'with highest honors':
                return '🏆 With Highest Honors';
            case 'with high honors':
                return '🥇 With High Honors';
            case 'with honors':
                return '🥈 With Honors';
            default:
                return honorType;
        }
    };

    return (
        <>
            <Head title="Certificate Selection" />
            <StudentLayout>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Certificate Selection</h1>
                    <p className="text-gray-600 mt-2">
                        Select a certificate template for your academic achievements
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Available Honors */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Your Achievements</h2>
                            <p className="text-sm text-gray-600">Select an honor to generate a certificate</p>
                        </div>
                        
                        <div className="p-6">
                            {studentHonors.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-6xl mb-4">🎓</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Honors Yet</h3>
                                    <p className="text-gray-500">
                                        You haven't earned any honors yet. Keep up the great work!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {studentHonors.map((honor) => (
                                        <div
                                            key={honor.id}
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                selectedHonor?.id === honor.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => handleHonorSelect(honor)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        {getHonorTypeDisplay(honor.honor_type)}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {honor.academic_period.name}
                                                    </p>
                                                </div>
                                                <div className={`w-3 h-3 rounded-full ${
                                                    honor.is_active ? 'bg-green-500' : 'bg-gray-300'
                                                }`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Template Selection */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Certificate Templates</h2>
                            <p className="text-sm text-gray-600">
                                Choose a template for your {studentEducationLevel} level
                            </p>
                        </div>
                        
                        <div className="p-6">
                            {!selectedHonor ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-6xl mb-4">📜</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Honor First</h3>
                                    <p className="text-gray-500">
                                        Choose an honor from the left to see available certificate templates
                                    </p>
                                </div>
                            ) : loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading templates...</p>
                                </div>
                            ) : availableTemplates.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Available</h3>
                                    <p className="text-gray-500">
                                        No certificate templates are available for your education level
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {availableTemplates.map((template) => (
                                        <div
                                            key={template.id}
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                selectedTemplate?.id === template.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => handleTemplateSelect(template)}
                                        >
                                            <div className="flex items-start space-x-4">
                                                {template.template_image_path && (
                                                    <div className="flex-shrink-0">
                                                        <img
                                                            src={`/admin/certificates/templates/${template.id}/image`}
                                                            alt={template.name}
                                                            className="w-16 h-12 object-cover rounded border"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {template.image_description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Generate Certificate Button */}
                {selectedHonor && selectedTemplate && (
                    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Ready to Generate Certificate
                            </h3>
                            <div className="mb-6">
                                <p className="text-gray-600">
                                    <strong>{getHonorTypeDisplay(selectedHonor.honor_type)}</strong> for{' '}
                                    <strong>{selectedHonor.academic_period.name}</strong>
                                </p>
                                <p className="text-gray-600">
                                    Using template: <strong>{selectedTemplate.name}</strong>
                                </p>
                            </div>
                            <button
                                onClick={handleGenerateCertificate}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                🖨️ Generate Certificate
                            </button>
                        </div>
                    </div>
                )}
            </StudentLayout>
        </>
    );
};

export default CertificateSelection; 