import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Award, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

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
    honor_type: {
        id: number;
        name: string;
        description?: string;
    };
    academic_level: {
        name: string;
    };
    gpa: number;
    school_year: string;
    is_pending_approval: boolean;
    is_approved: boolean;
    is_rejected: boolean;
    created_at: string;
    approved_at?: string;
    rejected_at?: string;
}

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
}

interface HonorsIndexProps {
    user: User;
    honors: {
        data: Honor[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
}

export default function HonorsIndex({ user, honors, stats }: HonorsIndexProps) {
    if (!user) {
        return <div>Loading...</div>;
    }

    // Add safety checks for undefined props
    const safeHonors = honors || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
    const safeStats = stats || { pending: 0, approved: 0, rejected: 0 };

    const getStatusBadge = (honor: Honor) => {
        if (honor.is_rejected) {
            return <Badge variant="destructive">Rejected</Badge>;
        }
        if (honor.is_approved) {
            return <Badge variant="default">Approved</Badge>;
        }
        if (honor.is_pending_approval) {
            return <Badge variant="secondary">Pending</Badge>;
        }
        return <Badge variant="outline">Unknown</Badge>;
    };

    const getStatusIcon = (honor: Honor) => {
        if (honor.is_rejected) {
            return <XCircle className="h-4 w-4 text-red-500" />;
        }
        if (honor.is_approved) {
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
        if (honor.is_pending_approval) {
            return <Clock className="h-4 w-4 text-yellow-500" />;
        }
        return <Award className="h-4 w-4 text-gray-500" />;
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Honor Tracking</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Review and manage honor results in your department
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Honors</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{safeStats.pending}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Awaiting approval
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Approved Honors</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{safeStats.approved}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Successfully approved
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Rejected Honors</CardTitle>
                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{safeStats.rejected}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Not approved
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <Button asChild>
                                        <Link href={route('chairperson.honors.pending')}>
                                            <Clock className="mr-2 h-4 w-4" />
                                            Review Pending Honors
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Honors Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>All Honors</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {safeHonors.data.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No honors found
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
                                                    <th className="text-left p-2">Status</th>
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
                                                                <div className="font-medium">{honor.honor_type?.name || 'N/A'}</div>
                                                                {honor.honor_type?.description && (
                                                                    <div className="text-sm text-gray-500">{honor.honor_type.description}</div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-2 font-medium">{honor.gpa || 'N/A'}</td>
                                                        <td className="p-2">{honor.academic_level?.name || 'N/A'}</td>
                                                        <td className="p-2">{honor.school_year || 'N/A'}</td>
                                                        <td className="p-2">
                                                            <div className="flex items-center gap-2">
                                                                {getStatusIcon(honor)}
                                                                {getStatusBadge(honor)}
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <Button asChild size="sm" variant="outline">
                                                                <Link href={route('chairperson.honors.review', honor.id)}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
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
        </div>
    );
}
