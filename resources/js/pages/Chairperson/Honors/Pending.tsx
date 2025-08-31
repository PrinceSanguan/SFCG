import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Link, useForm } from '@inertiajs/react';
import { Award, Clock, CheckCircle, XCircle, Eye, ArrowLeft } from 'lucide-react';
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
    };
    honorType: {
        id: number;
        name: string;
        description?: string;
    };
    academicLevel: {
        name: string;
    };
    gpa: number;
    school_year: string;
    is_pending_approval: boolean;
    created_at: string;
}

interface PendingHonorsProps {
    user: User;
    honors: {
        data: Honor[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function PendingHonors({ user, honors }: PendingHonorsProps) {
    if (!user) {
        return <div>Loading...</div>;
    }

    // Add safety checks for undefined props
    const safeHonors = honors || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };

    const [selectedHonor, setSelectedHonor] = useState<Honor | null>(null);
    const [showRejectForm, setShowRejectForm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        rejection_reason: '',
    });

    const handleApprove = (honorId: number) => {
        post(route('chairperson.honors.approve', honorId));
    };

    const handleReject = (honorId: number) => {
        if (data.rejection_reason.trim()) {
            post(route('chairperson.honors.reject', honorId));
            setShowRejectForm(false);
            setSelectedHonor(null);
            setData('rejection_reason', '');
        }
    };

    const openRejectForm = (honor: Honor) => {
        setSelectedHonor(honor);
        setShowRejectForm(true);
    };

    const closeRejectForm = () => {
        setShowRejectForm(false);
        setSelectedHonor(null);
        setData('rejection_reason', '');
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
                                    Pending Honors
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Review and approve honors pending approval
                                </p>
                            </div>
                        </div>

                        {/* Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pending</p>
                                        <p className="text-2xl font-bold">{safeHonors.total}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Page</p>
                                        <p className="text-2xl font-bold">{safeHonors.current_page} of {safeHonors.last_page}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Honors per Page</p>
                                        <p className="text-2xl font-bold">{safeHonors.per_page}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Honors Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Honors Pending Approval</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {safeHonors.data.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No pending honors found
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2">Student</th>
                                                    <th className="text-left p-2">Honor Type</th>
                                                    <th className="text-left p-2">GPA</th>
                                                    <th className="text-left p-2">Academic Level</th>
                                                    <th className="text-left p-2">School Year</th>
                                                    <th className="text-left p-2">Created</th>
                                                    <th className="text-left p-2">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {safeHonors.data.map((honor) => (
                                                    <tr key={honor.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="p-2">
                                                            <div>
                                                                <div className="font-medium">{honor.student?.name || 'N/A'}</div>
                                                                <div className="text-sm text-gray-500">{honor.student?.student_number || 'N/A'}</div>
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <div>
                                                                <div className="font-medium">{honor.honorType?.name || 'N/A'}</div>
                                                                {honor.honorType?.description && (
                                                                    <div className="text-sm text-gray-500">{honor.honorType?.description}</div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-2 font-medium">{honor.gpa}</td>
                                                        <td className="p-2">{honor.academicLevel?.name || 'N/A'}</td>
                                                        <td className="p-2">{honor.school_year}</td>
                                                        <td className="p-2">
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(honor.created_at).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td className="p-2">
                                                            <div className="flex gap-2">
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={route('chairperson.honors.review', honor.id)}>
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleApprove(honor.id)}
                                                                    disabled={processing}
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => openRejectForm(honor)}
                                                                    disabled={processing}
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Reject Honor Modal */}
            {showRejectForm && selectedHonor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Reject Honor</h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Rejecting honor for <strong>{selectedHonor.student?.name}</strong> - <strong>{selectedHonor.honorType?.name}</strong>
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
                            <Button variant="outline" onClick={closeRejectForm}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleReject(selectedHonor.id)}
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
