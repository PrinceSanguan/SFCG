import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useForm } from '@inertiajs/react';
import { GraduationCap, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    department_id?: number;
}

interface Student {
    id: number;
    name: string;
    student_number?: string;
}

interface Subject {
    id: number;
    name: string;
    code?: string;
    course?: {
        id: number;
        name: string;
    };
}

interface AcademicLevel {
    id: number;
    name: string;
}

interface GradingPeriod {
    id: number;
    name: string;
    period_type: string;
}

interface FinalAverage {
    id: number;
    student: Student;
    subject: Subject;
    academic_level: AcademicLevel;
    grading_period: GradingPeriod;
    grade: number;
    school_year: string;
    is_submitted_for_validation: boolean;
    is_approved: boolean;
    is_returned: boolean;
    submitted_at?: string;
    approved_at?: string;
    returned_at?: string;
    return_reason?: string;
}

interface ReviewFinalAverageProps {
    user: User;
    grade: FinalAverage;
}

export default function ReviewFinalAverage({ user, grade }: ReviewFinalAverageProps) {
    if (!user) {
        return <div>Loading...</div>;
    }

    const [showReturnForm, setShowReturnForm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        return_reason: '',
    });

    const handleApprove = () => {
        post(route('chairperson.final-averages.approve', grade.id));
    };

    const handleReturn = () => {
        if (data.return_reason.trim()) {
            post(route('chairperson.final-averages.return', grade.id));
            setShowReturnForm(false);
            setData('return_reason', '');
        }
    };

    const getStatusBadge = () => {
        if (grade.is_returned) {
            return <Badge variant="destructive">Returned</Badge>;
        }
        if (grade.is_approved) {
            return <Badge variant="default">Approved</Badge>;
        }
        return <Badge variant="secondary">Pending</Badge>;
    };

    const getStatusIcon = () => {
        if (grade.is_returned) {
            return <XCircle className="h-5 w-5 text-red-500" />;
        }
        if (grade.is_approved) {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        }
        return <Clock className="h-5 w-5 text-yellow-500" />;
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col gap-6">
                            {/* Header */}
                            <div className="flex items-center gap-4">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={route('chairperson.final-averages.index')}>
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Final Averages
                                    </Link>
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        Review Final Average
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Review and approve final average grade
                                    </p>
                                </div>
                            </div>

                            {/* Final Average Details */}
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Student Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5" />
                                            Student Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Student Name</Label>
                                            <p className="text-lg font-semibold">{grade.student?.name}</p>
                                        </div>
                                        {grade.student?.student_number && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Student Number</Label>
                                                <p className="text-lg">{grade.student.student_number}</p>
                                            </div>
                                        )}
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Academic Level</Label>
                                            <p className="text-lg">{grade.academic_level?.name}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Subject Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5" />
                                            Subject Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Subject Name</Label>
                                            <p className="text-lg font-semibold">{grade.subject?.name}</p>
                                        </div>
                                        {grade.subject?.code && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Subject Code</Label>
                                                <p className="text-lg">{grade.subject.code}</p>
                                            </div>
                                        )}
                                        {grade.subject?.course && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Course</Label>
                                                <p className="text-lg">{grade.subject.course.name}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Grade Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5" />
                                        Final Average Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Final Average</Label>
                                            <p className="text-3xl font-bold text-blue-600">{grade.grade}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">School Year</Label>
                                            <p className="text-lg">{grade.school_year}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Status</Label>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon()}
                                                {getStatusBadge()}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Grading Period</Label>
                                            <p className="text-lg">{grade.grading_period?.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Submitted At</Label>
                                            <p className="text-lg">
                                                {grade.submitted_at 
                                                    ? new Date(grade.submitted_at).toLocaleString()
                                                    : 'Not submitted'
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {grade.is_returned && grade.return_reason && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Return Reason</Label>
                                            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <p className="text-red-800 dark:text-red-200">{grade.return_reason}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            {!grade.is_approved && !grade.is_returned && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-4">
                                            <Button
                                                onClick={handleApprove}
                                                disabled={processing}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve Final Average
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => setShowReturnForm(true)}
                                                disabled={processing}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Return for Correction
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Return Final Average Modal */}
            {showReturnForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Return Final Average for Correction</h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Returning final average for <strong>{grade.student?.name}</strong> in <strong>{grade.subject?.name}</strong>
                            </p>
                            <Label htmlFor="return_reason">Reason for Return</Label>
                            <Textarea
                                id="return_reason"
                                value={data.return_reason}
                                onChange={(e) => setData('return_reason', e.target.value)}
                                placeholder="Please provide a reason for returning this final average..."
                                className="mt-2"
                                rows={4}
                            />
                            {errors.return_reason && (
                                <p className="text-sm text-red-500 mt-1">{errors.return_reason}</p>
                            )}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setShowReturnForm(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReturn}
                                disabled={processing || !data.return_reason.trim()}
                            >
                                {processing ? 'Returning...' : 'Return Final Average'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
