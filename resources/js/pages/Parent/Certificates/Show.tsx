import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ParentLayout from '@/layouts/parent/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, ArrowLeft, ExternalLink, User, FileText } from 'lucide-react';

interface Certificate {
    id: number;
    serial_number: string;
    school_year: string;
    status: string;
    generated_at: string;
    payload: {
        student_name: string;
        student_number: string;
        honor_type: string;
        school_year: string;
        date_issued: string;
        grade_level?: string;
        average_grade?: string;
        gpa?: string;
        course_name?: string;
        department_name?: string;
        year_level?: string;
    };
    template: {
        name: string;
    };
    academicLevel: {
        name: string;
    };
}

interface ShowProps {
    user: {
        name: string;
        email: string;
        user_role: string;
    };
    certificate: Certificate;
}

export default function ParentCertificatesShow({ user, certificate }: ShowProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'generated':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'downloaded':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'printed':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <ParentLayout>
            <Head title={`Certificate - ${certificate.payload.student_name}`} />
            <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
                <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                    {/* Back Button */}
                    <Link href={route('parent.certificates.index')}>
                        <Button variant="ghost" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Certificates
                        </Button>
                    </Link>

                    {/* Certificate Details Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Award className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <CardTitle className="text-2xl">{certificate.template.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {certificate.academicLevel.name} • {certificate.school_year}
                                        </p>
                                    </div>
                                </div>
                                <Badge className={getStatusColor(certificate.status)}>
                                    {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Student Information */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Student Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Name:</span>
                                            <p className="font-medium">{certificate.payload.student_name}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Student Number:</span>
                                            <p className="font-medium">{certificate.payload.student_number}</p>
                                        </div>
                                        {certificate.payload.grade_level && (
                                            <div>
                                                <span className="text-muted-foreground">Grade Level:</span>
                                                <p className="font-medium">{certificate.payload.grade_level}</p>
                                            </div>
                                        )}
                                        {certificate.payload.year_level && (
                                            <div>
                                                <span className="text-muted-foreground">Year Level:</span>
                                                <p className="font-medium">{certificate.payload.year_level}</p>
                                            </div>
                                        )}
                                        {certificate.payload.course_name && (
                                            <div>
                                                <span className="text-muted-foreground">Course:</span>
                                                <p className="font-medium">{certificate.payload.course_name}</p>
                                            </div>
                                        )}
                                        {certificate.payload.department_name && (
                                            <div>
                                                <span className="text-muted-foreground">Department:</span>
                                                <p className="font-medium">{certificate.payload.department_name}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Honor Information */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        Honor Details
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Honor Type:</span>
                                            <p className="font-medium text-blue-600">
                                                {certificate.payload.honor_type}
                                            </p>
                                        </div>
                                        {certificate.payload.average_grade && (
                                            <div>
                                                <span className="text-muted-foreground">Average Grade:</span>
                                                <p className="font-medium">{certificate.payload.average_grade}</p>
                                            </div>
                                        )}
                                        {certificate.payload.gpa && (
                                            <div>
                                                <span className="text-muted-foreground">GPA:</span>
                                                <p className="font-medium">{certificate.payload.gpa}</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-muted-foreground">School Year:</span>
                                            <p className="font-medium">{certificate.payload.school_year}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Certificate Information */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Certificate Details
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Serial Number:</span>
                                            <p className="font-medium font-mono">{certificate.serial_number}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Date Issued:</span>
                                            <p className="font-medium">{certificate.payload.date_issued}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Generated:</span>
                                            <p className="font-medium">{formatDate(certificate.generated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons - View Only, No Download */}
                            <div className="flex gap-3 mt-6 pt-6 border-t">
                                <a href={route('parent.certificates.view', certificate.id)} target="_blank" rel="noopener noreferrer">
                                    <Button className="flex items-center gap-2">
                                        <ExternalLink className="h-4 w-4" />
                                        View Full Certificate
                                    </Button>
                                </a>
                                <Link href={route('parent.certificates.index')}>
                                    <Button variant="outline">
                                        Back to List
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ParentLayout>
    );
}
