import { Header } from '@/components/principal/header';
import { Sidebar } from '@/components/principal/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, X, User, Award, Calendar, GraduationCap } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface HonorType {
    id: number;
    name: string;
}

interface AcademicLevel {
    id: number;
    name: string;
}

interface HonorResult {
    id: number;
    gpa: number;
    school_year: string;
    is_pending_approval: boolean;
    is_approved: boolean;
    is_rejected: boolean;
    created_at: string;
    approved_at?: string;
    rejected_at?: string;
    rejection_reason?: string;
    student: User;
    honorType: HonorType;
    academicLevel: AcademicLevel;
}

interface ReviewHonorProps {
    user: User;
    honor: HonorResult;
}

export default function ReviewHonor({ user, honor }: ReviewHonorProps) {
    const { data, setData, post, processing, errors } = useForm({
        rejection_reason: '',
    });

    const handleApprove = () => {
        post(route('principal.honors.approve', honor.id));
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('principal.honors.reject', honor.id));
    };

    const getStatusBadge = () => {
        if (honor.is_approved) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
        }
        if (honor.is_rejected) {
            return <Badge variant="destructive">Rejected</Badge>;
        }
        if (honor.is_pending_approval) {
            return <Badge variant="secondary">Pending</Badge>;
        }
        return <Badge variant="outline">Draft</Badge>;
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <Link href={route('principal.honors.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Honors
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Review Honor Submission
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Review honor details and approve or reject the submission.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Honor Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Honor Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Student Name</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{honor.student.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Honor Type</span>
                            <Badge variant="outline">{honor.honorType.name}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Academic Level</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{honor.academicLevel.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">School Year</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{honor.school_year}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">GPA</span>
                            <Badge variant="outline" className="text-lg font-bold">{honor.gpa}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Status</span>
                            {getStatusBadge()}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Submitted At</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(honor.created_at).toLocaleString()}
                            </span>
                        </div>
                        {honor.approved_at && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Approved At</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(honor.approved_at).toLocaleString()}
                                </span>
                            </div>
                        )}
                        {honor.rejected_at && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Rejected At</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(honor.rejected_at).toLocaleString()}
                                </span>
                            </div>
                        )}
                        {honor.rejection_reason && (
                            <div className="space-y-2">
                                <span className="text-sm font-medium">Rejection Reason</span>
                                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                    {honor.rejection_reason}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!honor.is_approved && !honor.is_rejected && (
                            <>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        This honor is pending your approval. You can either approve it or reject it with a reason.
                                    </p>
                                </div>
                                
                                <div className="space-y-4">
                                    <Button 
                                        onClick={handleApprove}
                                        disabled={processing}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve Honor
                                    </Button>
                                    
                                    <form onSubmit={handleReject} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="rejection_reason">Rejection Reason (Required)</Label>
                                            <Textarea
                                                id="rejection_reason"
                                                placeholder="Please provide a reason for rejecting this honor..."
                                                value={data.rejection_reason}
                                                onChange={(e) => setData('rejection_reason', e.target.value)}
                                                className={errors.rejection_reason ? 'border-red-500' : ''}
                                                rows={3}
                                            />
                                            {errors.rejection_reason && (
                                                <p className="text-sm text-red-500">{errors.rejection_reason}</p>
                                            )}
                                        </div>
                                        <Button 
                                            type="submit"
                                            disabled={processing || !data.rejection_reason.trim()}
                                            variant="destructive"
                                            className="w-full"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Reject Honor
                                        </Button>
                                    </form>
                                </div>
                            </>
                        )}

                        {honor.is_approved && (
                            <div className="text-center py-4">
                                <Check className="h-12 w-12 text-green-600 mx-auto mb-2" />
                                <p className="text-green-600 font-medium">This honor has been approved</p>
                                <p className="text-sm text-gray-500">
                                    Approved on {new Date(honor.approved_at!).toLocaleString()}
                                </p>
                            </div>
                        )}

                        {honor.is_rejected && (
                            <div className="text-center py-4">
                                <X className="h-12 w-12 text-red-600 mx-auto mb-2" />
                                <p className="text-red-600 font-medium">This honor has been rejected</p>
                                <p className="text-sm text-gray-500">
                                    Rejected on {new Date(honor.rejected_at!).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
