import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface Grade {
    id: number;
    student: {
        id: number;
        name: string;
        student_number: string;
        email: string;
    };
    subject: {
        id: number;
        name: string;
        code: string;
        course: {
            name: string;
            code: string;
        };
    };
    academicLevel: {
        name: string;
    };
    gradingPeriod?: {
        name: string;
    };
    grade: number;
    school_year: string;
    year_of_study?: number;
    is_submitted_for_validation: boolean;
    submitted_at?: string;
    is_approved: boolean;
    approved_at?: string;
    approved_by?: {
        name: string;
    };
    is_returned: boolean;
    returned_at?: string;
    returned_by?: {
        name: string;
    };
    return_reason?: string;
}

interface GradeReviewProps {
    user: User;
    grade: Grade;
}

export default function GradeReview({ user, grade }: GradeReviewProps) {
    if (!user || !grade) {
        return <div>Loading...</div>;
    }

    const getStatusBadge = () => {
        if (grade.is_returned) {
            return <Badge variant="destructive">Returned</Badge>;
        }
        if (grade.is_approved) {
            return <Badge variant="default">Approved</Badge>;
        }
        if (grade.is_submitted_for_validation) {
            return <Badge variant="secondary">Pending Approval</Badge>;
        }
        return <Badge variant="outline">Unknown</Badge>;
    };

    const getStatusIcon = () => {
        if (grade.is_returned) {
            return <XCircle className="h-5 w-5 text-red-500" />;
        }
        if (grade.is_approved) {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        }
        if (grade.is_submitted_for_validation) {
            return <Clock className="h-5 w-5 text-yellow-500" />;
        }
        return <Eye className="h-5 w-5 text-gray-500" />;
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Button asChild variant="outline" size="sm">
                                <Link href={route('chairperson.grades.index')}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Grades
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Grade Review
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    View grade details and status
                                </p>
                            </div>
                        </div>

                        {/* Status Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {getStatusIcon()}
                                    Grade Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    {getStatusBadge()}
                                    <div className="text-sm text-gray-500">
                                        {grade.is_submitted_for_validation && 'Submitted for validation'}
                                        {grade.is_approved && 'Approved'}
                                        {grade.is_returned && 'Returned for correction'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Grade Details */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Student Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Student Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Name</Label>
                                        <p className="text-lg font-semibold">{grade.student?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Student Number</Label>
                                        <p className="text-lg">{grade.student?.student_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                                        <p className="text-lg">{grade.student?.email || 'N/A'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Subject Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Subject Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Subject</Label>
                                        <p className="text-lg font-semibold">{grade.subject?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Subject Code</Label>
                                        <p className="text-lg">{grade.subject?.code || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Course</Label>
                                        <p className="text-lg">{grade.subject?.course?.name || 'N/A'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Academic Details */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Grade Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Grade Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Grade</Label>
                                        <p className="text-3xl font-bold text-blue-600">{grade.grade}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">School Year</Label>
                                        <p className="text-lg">{grade.school_year}</p>
                                    </div>
                                    {grade.year_of_study && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Year of Study</Label>
                                            <p className="text-lg">{grade.year_of_study}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Academic Context */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Academic Context</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Academic Level</Label>
                                        <p className="text-lg">{grade.academicLevel?.name || 'N/A'}</p>
                                    </div>
                                    {grade.gradingPeriod && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Grading Period</Label>
                                            <p className="text-lg">{grade.gradingPeriod?.name || 'N/A'}</p>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Submitted At</Label>
                                        <p className="text-lg">
                                            {grade.submitted_at ? new Date(grade.submitted_at).toLocaleString() : 'Not specified'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Approval History */}
                        {(grade.is_approved || grade.is_returned) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Approval History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {grade.is_approved && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="font-medium">Approved</span>
                                            </div>
                                            <div className="ml-6 text-sm text-gray-600">
                                                <p>Approved by: {grade.approved_by?.name || 'Unknown'}</p>
                                                <p>Approved at: {grade.approved_at ? new Date(grade.approved_at).toLocaleString() : 'Unknown'}</p>
                                            </div>
                                        </div>
                                    )}
                                    {grade.is_returned && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-500" />
                                                <span className="font-medium">Returned for Correction</span>
                                            </div>
                                            <div className="ml-6 text-sm text-gray-600">
                                                <p>Returned by: {grade.returned_by?.name || 'Unknown'}</p>
                                                <p>Returned at: {grade.returned_at ? new Date(grade.returned_at).toLocaleString() : 'Unknown'}</p>
                                                {grade.return_reason && (
                                                    <div>
                                                        <p className="font-medium">Reason:</p>
                                                        <p className="italic">{grade.return_reason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}
