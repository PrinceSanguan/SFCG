import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';

interface StudentProfile {
    id: number;
    student_id: string;
    grade_level: string;
    section: string;
    academic_level?: {
        name: string;
    };
    college_course?: {
        name: string;
    };
}

interface Honor {
    id: number;
    honor_type: string;
    gpa: number;
    awarded_date: string;
    academic_period: {
        name: string;
    };
}

interface CertificateTemplate {
    id: number;
    name: string;
    description: string;
    education_level: string;
    template_image_path?: string;
}

interface Props {
    student: {
        id: number;
        name: string;
        email: string;
    };
    studentProfile: StudentProfile;
    honors: Honor[];
    templates: CertificateTemplate[];
    isCollege: boolean;
}

const CertificateSelection: React.FC<Props> = ({ 
    student, 
    studentProfile, 
    honors, 
    templates, 
    isCollege 
}) => {
    const [selectedHonor, setSelectedHonor] = useState<Honor | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const { post, processing, errors } = useForm({
        honor_id: '',
        template_id: '',
    });

    const getHonorDisplayName = (honorType: string) => {
        switch (honorType) {
            case 'with_honors':
                return 'With Honors';
            case 'with_high_honors':
                return 'With High Honors';
            case 'with_highest_honors':
                return 'With Highest Honors';
            case 'deans_list':
                return "Dean's List";
            case 'cum_laude':
                return 'Cum Laude';
            case 'magna_cum_laude':
                return 'Magna Cum Laude';
            case 'summa_cum_laude':
                return 'Summa Cum Laude';
            case 'college_honors':
                return 'College Honors';
            default:
                return honorType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    };

    const getHonorColor = (honorType: string) => {
        switch (honorType) {
            case 'with_honors':
                return 'bg-blue-100 text-blue-800';
            case 'with_high_honors':
                return 'bg-green-100 text-green-800';
            case 'with_highest_honors':
                return 'bg-purple-100 text-purple-800';
            case 'deans_list':
                return 'bg-yellow-100 text-yellow-800';
            case 'cum_laude':
                return 'bg-indigo-100 text-indigo-800';
            case 'magna_cum_laude':
                return 'bg-pink-100 text-pink-800';
            case 'summa_cum_laude':
                return 'bg-red-100 text-red-800';
            case 'college_honors':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleGenerateCertificate = () => {
        if (!selectedHonor || !selectedTemplate) {
            return;
        }

        post('/student/certificates/generate', {
            honor_id: selectedHonor.id,
            template_id: selectedTemplate.id,
        });
    };

    const getStudentInfo = () => {
        if (studentProfile.college_course) {
            return `${studentProfile.college_course.name}`;
        } else if (studentProfile.academic_level) {
            return `${studentProfile.academic_level.name} - ${studentProfile.grade_level}`;
        }
        return studentProfile.grade_level || 'N/A';
    };

    return (
        <>
            <Head title="Certificate Selection - Student" />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Certificate Selection</h1>
                                <p className="text-gray-600 mt-2">
                                    Select a certificate template for your approved honors
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => router.get('/student/dashboard')}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    ← Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Student Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Student Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Name</p>
                                <p className="text-sm text-gray-900">{student.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Student ID</p>
                                <p className="text-sm text-gray-900">{studentProfile.student_id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Program/Level</p>
                                <p className="text-sm text-gray-900">{getStudentInfo()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Honors Selection */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Honor</h2>
                        {honors.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="text-4xl mb-4 block">🏆</span>
                                <p className="text-gray-500">No approved honors found.</p>
                                <p className="text-sm text-gray-400">You need to have approved honors to generate certificates.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {honors.map((honor) => (
                                    <div
                                        key={honor.id}
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                                            selectedHonor?.id === honor.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setSelectedHonor(honor)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHonorColor(honor.honor_type)}`}>
                                                {getHonorDisplayName(honor.honor_type)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            GPA: {honor.gpa.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-1">
                                            Period: {honor.academic_period.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Awarded: {new Date(honor.awarded_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Template Selection */}
                    {selectedHonor && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Select Certificate Template</h2>
                            {templates.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="text-4xl mb-4 block">📜</span>
                                    <p className="text-gray-500">No certificate templates available for your education level.</p>
                                    <p className="text-sm text-gray-400">Please contact your administrator.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {templates.map((template) => (
                                        <div
                                            key={template.id}
                                            className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-colors ${
                                                selectedTemplate?.id === template.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => setSelectedTemplate(template)}
                                        >
                                            {template.template_image_path ? (
                                                <div className="aspect-[3/2] bg-gray-100 flex items-center justify-center">
                                                    <img
                                                        src={`/storage/${template.template_image_path}`}
                                                        alt={template.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-[3/2] bg-gray-100 flex items-center justify-center">
                                                    <span className="text-4xl">📜</span>
                                                </div>
                                            )}
                                            <div className="p-4">
                                                <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    template.education_level === 'college' 
                                                        ? 'bg-purple-100 text-purple-800' 
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {template.education_level === 'college' ? 'College' : 'K-12'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Generate Certificate Button */}
                    {selectedHonor && selectedTemplate && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Ready to Generate Certificate</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Honor: {getHonorDisplayName(selectedHonor.honor_type)} | 
                                        Template: {selectedTemplate.name}
                                    </p>
                                </div>
                                <button
                                    onClick={handleGenerateCertificate}
                                    disabled={processing}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {processing ? 'Generating...' : 'Generate Certificate'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error Messages */}
                    {errors.honor_id && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-sm text-red-600">{errors.honor_id}</p>
                        </div>
                    )}
                    {errors.template_id && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-sm text-red-600">{errors.template_id}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CertificateSelection; 