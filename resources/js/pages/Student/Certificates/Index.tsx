import { StudentHeader } from '@/components/student/app-header';
import { StudentAppSidebar } from '@/components/student/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Award, Calendar, GraduationCap, Eye, ExternalLink } from 'lucide-react';

interface Certificate {
    id: number;
    serial_number: string;
    school_year: string;
    status: string;
    generated_at: string;
    template: {
        name: string;
    };
    academicLevel: {
        name: string;
    };
}

interface IndexProps {
    user: {
        name: string;
        email: string;
        user_role: string;
    };
    certificates: Certificate[];
}

export default function CertificatesIndex({ user, certificates }: IndexProps) {
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
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                My Honor Certificates
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                View and manage your academic achievement certificates.
                            </p>
                        </div>

                        {/* Statistics */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                                            <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Total Certificates
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {certificates.length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-green-100 p-3 dark:bg-green-900">
                                            <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Academic Levels
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {new Set(certificates.map(c => c.academicLevel.name)).size}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
                                            <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                School Years
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {new Set(certificates.map(c => c.school_year)).size}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Certificates List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Honor Certificates
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {certificates.length > 0 ? (
                                    <div className="space-y-4">
                                        {certificates.map((certificate) => (
                                            <div
                                                key={certificate.id}
                                                className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                                        <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                            {certificate.template.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {certificate.academicLevel.name} • {certificate.school_year}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                            Serial: {certificate.serial_number}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Badge className={getStatusColor(certificate.status)}>
                                                        {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                                                    </Badge>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(certificate.generated_at)}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Link href={route('student.certificates.show', certificate.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('student.certificates.view', certificate.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                                Full View
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="h-16 w-16 text-gray-400 mx-auto mb-4">
                                            <Award className="h-16 w-16" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            No certificates yet
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Your honor certificates will appear here once you qualify for academic honors.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
