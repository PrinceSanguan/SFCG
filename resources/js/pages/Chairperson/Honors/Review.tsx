import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle, Award, Clock } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface Honor {
    id: number;
    student: {
        id: number;
        name: string;
        student_number: string;
        email: string;
    };
    honorType: {
        id: number;
        name: string;
        description?: string;
        criteria?: string;
    };
    academicLevel: {
        name: string;
    };
    gpa: number;
    school_year: string;
    is_pending_approval: boolean;
    is_approved: boolean;
    approved_at?: string;
    approved_by?: {
        name: string;
    };
    is_rejected: boolean;
    rejected_at?: string;
    rejected_by?: {
        name: string;
    };
    rejection_reason?: string;
    created_at: string;
}

interface HonorReviewProps {
    user: User;
    honor: Honor;
}

export default function HonorReview({ user, honor }: HonorReviewProps) {
    if (!user || !honor) {
        return <div>Loading...</div>;
    }

    const [showRejectForm, setShowRejectForm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        rejection_reason: '',
    });

    const handleApprove = () => {
        post(route('chairperson.honors.approve', honor.id));
    };

    const handleReject = () => {
        if (data.rejection_reason.trim()) {
            post(route('chairperson.honors.reject', honor.id));
            setShowRejectForm(false);
            setData('rejection_reason', '');
        }
    };

    const getStatusBadge = () => {
        if (honor.is_rejected) {
            return <Badge variant="destructive">Rejected</Badge>;
        }
        if (honor.is_approved) {
            return <Badge variant="default">Approved</Badge>;
        }
        if (honor.is_pending_approval) {
            return <Badge variant="secondary">Pending Approval</Badge>;
        }
        return <Badge variant="outline">Unknown</Badge>;
    };

    const getStatusIcon = () => {
        if (honor.is_rejected) {
            return <XCircle className="h-5 w-5 text-red-500" />;
        }
        if (honor.is_approved) {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        }
        if (honor.is_pending_approval) {
            return <Clock className="h-5 w-5 text-yellow-500" />;
        }
        return <Award className="h-5 w-5 text-gray-500" />;
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
                                <Link href={route('chairperson.honors.index')}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Honors
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Honor Review
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Review honor details and make approval decisions
                                </p>
                            </div>
                        </div>

                        {/* Status Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {getStatusIcon()}
                                    Honor Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    {getStatusBadge()}
                                    <div className="text-sm text-gray-500">
                                        {honor.is_pending_approval && 'Pending approval'}
                                        {honor.is_approved && 'Approved'}
                                        {honor.is_rejected && 'Rejected'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Honor Details */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Student Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Student Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Name</Label>
                                        <p className="text-lg font-semibold">{honor.student?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Student Number</Label>
                                        <p className="text-lg">{honor.student?.student_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                                        <p className="text-lg">{honor.student?.email || 'N/A'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Honor Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Honor Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Honor Type</Label>
                                        <p className="text-lg font-semibold">{honor.honorType?.name || 'N/A'}</p>
                                    </div>
                                    {honor.honorType?.description && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Description</Label>
                                            <p className="text-lg">{honor.honorType?.description}</p>
                                        </div>
                                    )}
                                    {honor.honorType?.criteria && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Criteria</Label>
                                            <p className="text-lg">{honor.honorType?.criteria}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Academic Details */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Academic Performance */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Academic Performance</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">GPA</Label>
                                        <p className="text-3xl font-bold text-blue-600">{honor.gpa}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">School Year</Label>
                                        <p className="text-lg">{honor.school_year}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Academic Level</Label>
                                        <p className="text-lg">{honor.academicLevel?.name || 'N/A'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Submission Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Submission Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Created At</Label>
                                        <p className="text-lg">
                                            {new Date(honor.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Status</Label>
                                        <p className="text-lg">
                                            {honor.is_pending_approval && 'Pending Approval'}
                                            {honor.is_approved && 'Approved'}
                                            {honor.is_rejected && 'Rejected'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Approval History */}
                        {(honor.is_approved || honor.is_rejected) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Approval History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {honor.is_approved && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="font-medium">Approved</span>
                                            </div>
                                            <div className="ml-6 text-sm text-gray-600">
                                                <p>Approved by: {honor.approved_by?.name || 'Unknown'}</p>
                                                <p>Approved at: {honor.approved_at ? new Date(honor.approved_at).toLocaleString() : 'Unknown'}</p>
                                            </div>
                                        </div>
                                    )}
                                    {honor.is_rejected && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-500" />
                                                <span className="font-medium">Rejected</span>
                                            </div>
                                            <div className="ml-6 text-sm text-gray-600">
                                                <p>Rejected by: {honor.rejected_by?.name || 'Unknown'}</p>
                                                <p>Rejected at: {honor.rejected_at ? new Date(honor.rejected_at).toLocaleString() : 'Unknown'}</p>
                                                {honor.rejection_reason && (
                                                    <div>
                                                        <p className="font-medium">Reason:</p>
                                                        <p className="italic">{honor.rejection_reason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        {honor.is_pending_approval && !honor.is_approved && !honor.is_rejected && (
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
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            {processing ? 'Approving...' : 'Approve Honor'}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => setShowRejectForm(true)}
                                            disabled={processing}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Reject Honor
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>

            {/* Reject Honor Modal */}
            {showRejectForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Reject Honor</h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Rejecting honor for <strong>{honor.student?.name || 'N/A'}</strong> - <strong>{honor.honorType?.name || 'N/A'}</strong>
                            </p>
                            <Label htmlFor="rejection_reason">Reason for Rejection</Label>
                            <Textarea
                                id="rejection_reason"
                                value={data.rejection_reason}
                                onChange={(e) => setData('rejection_reason', e.target.value)}
                                placeholder="Please provide a reason for rejecting this honor..."
                                className="mt-2"
                                rows={4}
                            />
                            {errors.rejection_reason && (
                                <p className="text-sm text-red-500 mt-1">{errors.rejection_reason}</p>
                            )}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={processing || !data.rejection_reason.trim()}
                            >
                                {processing ? 'Rejecting...' : 'Reject Honor'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
