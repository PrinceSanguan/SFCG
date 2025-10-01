import { StudentHeader } from '@/components/student/app-header';
import { StudentAppSidebar } from '@/components/student/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Award, ArrowLeft, Download, ExternalLink, Calendar, User, FileText } from 'lucide-react';

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

export default function CertificatesShow({ user, certificate }: ShowProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'generated':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'downloaded':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'printed':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <StudentAppSidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <StudentHeader user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                        {/* Back Button */}
                        <Link href={route('student.certificates.index')}>
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
                                        <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <CardTitle className="text-2xl">{certificate.template.name}</CardTitle>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                                                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                                                <p className="font-medium">{certificate.payload.student_name}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Student Number:</span>
                                                <p className="font-medium">{certificate.payload.student_number}</p>
                                            </div>
                                            {certificate.payload.grade_level && (
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Grade Level:</span>
                                                    <p className="font-medium">{certificate.payload.grade_level}</p>
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
                                                <span className="text-gray-500 dark:text-gray-400">Honor Type:</span>
                                                <p className="font-medium text-blue-600 dark:text-blue-400">
                                                    {certificate.payload.honor_type}
                                                </p>
                                            </div>
                                            {certificate.payload.average_grade && (
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Average Grade:</span>
                                                    <p className="font-medium">{certificate.payload.average_grade}</p>
                                                </div>
                                            )}
                                            {certificate.payload.gpa && (
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">GPA:</span>
                                                    <p className="font-medium">{certificate.payload.gpa}</p>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">School Year:</span>
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
                                                <span className="text-gray-500 dark:text-gray-400">Serial Number:</span>
                                                <p className="font-medium font-mono">{certificate.serial_number}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Date Issued:</span>
                                                <p className="font-medium">{certificate.payload.date_issued}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Generated:</span>
                                                <p className="font-medium">{formatDate(certificate.generated_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-6 pt-6 border-t">
                                    <a href={route('student.certificates.view', certificate.id)} target="_blank">
                                        <Button className="flex items-center gap-2">
                                            <ExternalLink className="h-4 w-4" />
                                            View Full Certificate
                                        </Button>
                                    </a>
                                    <Link href={route('student.certificates.index')}>
                                        <Button variant="outline">
                                            Back to List
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
