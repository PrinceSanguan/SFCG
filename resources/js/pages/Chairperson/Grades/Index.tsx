import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { GraduationCap, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

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
    };
    subject: {
        id: number;
        name: string;
        course: {
            name: string;
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
    is_submitted_for_validation: boolean;
    is_approved: boolean;
    is_returned: boolean;
    submitted_at?: string;
    approved_at?: string;
    returned_at?: string;
}

interface Stats {
    pending: number;
    approved: number;
    returned: number;
}

interface GradesIndexProps {
    user: User;
    grades: {
        data: Grade[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
}

export default function GradesIndex({ user, grades, stats }: GradesIndexProps) {
    if (!user) {
        return <div>Loading...</div>;
    }



    // Add safety checks for undefined props
    const safeGrades = grades || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
    const safeStats = stats || { pending: 0, approved: 0, returned: 0 };

    const getStatusBadge = (grade: Grade) => {
        if (grade.is_returned) {
            return <Badge variant="destructive">Returned</Badge>;
        }
        if (grade.is_approved) {
            return <Badge variant="default">Approved</Badge>;
        }
        if (grade.is_submitted_for_validation) {
            return <Badge variant="secondary">Pending</Badge>;
        }
        return <Badge variant="outline">Draft</Badge>;
    };

    const getStatusIcon = (grade: Grade) => {
        if (grade.is_returned) {
            return <XCircle className="h-4 w-4 text-red-500" />;
        }
        if (grade.is_approved) {
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
        if (grade.is_submitted_for_validation) {
            return <Clock className="h-4 w-4 text-yellow-500" />;
        }
        return <GraduationCap className="h-4 w-4 text-gray-500" />;
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Grade Management</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Review and manage grades in your department
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
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
                                    <CardTitle className="text-sm font-medium">Approved Grades</CardTitle>
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
                                    <CardTitle className="text-sm font-medium">Returned Grades</CardTitle>
                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{safeStats.returned}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Sent back for correction
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
                                        <Link href={route('chairperson.grades.pending')}>
                                            <Clock className="mr-2 h-4 w-4" />
                                            Review Pending Grades
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Grades Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>All Grades</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {safeGrades.data.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No grades found
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2">Student</th>
                                                    <th className="text-left p-2">Subject</th>
                                                    <th className="text-left p-2">Grade</th>
                                                    <th className="text-left p-2">Academic Level</th>
                                                    <th className="text-left p-2">Grading Period</th>
                                                    <th className="text-left p-2">School Year</th>
                                                    <th className="text-left p-2">Status</th>
                                                    <th className="text-left p-2">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {safeGrades.data.map((grade) => (
                                                    <tr key={grade.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="p-2">
                                                            <div>
                                                                <div className="font-medium">{grade.student?.name || 'N/A'}</div>
                                                                <div className="text-sm text-gray-500">{grade.student?.student_number || 'N/A'}</div>
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <div>
                                                                <div className="font-medium">{grade.subject?.name || 'N/A'}</div>
                                                                <div className="text-sm text-gray-500">{grade.subject?.course?.name || 'N/A'}</div>
                                                            </div>
                                                        </td>
                                                        <td className="p-2 font-medium">{grade.grade}</td>
                                                        <td className="p-2">{grade.academicLevel?.name || 'N/A'}</td>
                                                        <td className="p-2">{grade.gradingPeriod?.name || 'N/A'}</td>
                                                        <td className="p-2">{grade.school_year}</td>
                                                        <td className="p-2">
                                                            <div className="flex items-center gap-2">
                                                                {getStatusIcon(grade)}
                                                                {getStatusBadge(grade)}
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <Button asChild size="sm" variant="outline">
                                                                <Link href={route('chairperson.grades.review', grade.id)}>
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
