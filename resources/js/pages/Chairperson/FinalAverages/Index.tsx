import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, router } from '@inertiajs/react';
import { GraduationCap, Clock, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';

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
}

interface Stats {
    pending: number;
    approved: number;
    returned: number;
}

interface AcademicLevel {
    id: number;
    key: string;
    name: string;
    is_active: boolean;
}

interface FinalAveragesIndexProps {
    user: User;
    finalAverages: {
        data: FinalAverage[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    academicLevels: AcademicLevel[];
    selectedAcademicLevel: string | null;
}

export default function FinalAveragesIndex({ user, finalAverages, stats, academicLevels, selectedAcademicLevel }: FinalAveragesIndexProps) {
    if (!user) {
        return <div>Loading...</div>;
    }

    // Add safety checks for undefined props
    const safeFinalAverages = finalAverages || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
    const safeStats = stats || { pending: 0, approved: 0, returned: 0 };
    const safeAcademicLevels = academicLevels || [];

    const handleAcademicLevelChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value === 'all') {
            params.delete('academic_level_id');
        } else {
            params.set('academic_level_id', value);
        }
        router.get(window.location.pathname, Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (finalAverage: FinalAverage) => {
        if (finalAverage.is_returned) {
            return <Badge variant="destructive">Returned</Badge>;
        }
        if (finalAverage.is_approved) {
            return <Badge variant="default">Approved</Badge>;
        }
        return <Badge variant="secondary">Pending</Badge>;
    };

    const getStatusIcon = (finalAverage: FinalAverage) => {
        if (finalAverage.is_returned) {
            return <XCircle className="h-4 w-4 text-red-500" />;
        }
        if (finalAverage.is_approved) {
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
        return <Clock className="h-4 w-4 text-yellow-500" />;
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Final Averages
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Review and approve final average grades
                                </p>
                            </div>
                        </div>

                        {/* Academic Level Filter */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filter by Academic Level
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select value={selectedAcademicLevel || 'all'} onValueChange={handleAcademicLevelChange}>
                                    <SelectTrigger className="w-full md:w-64">
                                        <SelectValue placeholder="Select academic level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Academic Levels</SelectItem>
                                        {safeAcademicLevels.map((level) => (
                                            <SelectItem key={level.id} value={level.id.toString()}>
                                                {level.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Final Averages</CardTitle>
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
                                    <CardTitle className="text-sm font-medium">Approved Final Averages</CardTitle>
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
                                    <CardTitle className="text-sm font-medium">Returned Final Averages</CardTitle>
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

                        {/* Final Averages Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Final Averages ({safeFinalAverages.total} total)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {safeFinalAverages.data.length === 0 ? (
                                    <div className="text-center py-8">
                                        <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            No final averages found
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2 font-medium">Student</th>
                                                    <th className="text-left p-2 font-medium">Subject</th>
                                                    <th className="text-left p-2 font-medium">Academic Level</th>
                                                    <th className="text-left p-2 font-medium">Final Average</th>
                                                    <th className="text-left p-2 font-medium">School Year</th>
                                                    <th className="text-left p-2 font-medium">Status</th>
                                                    <th className="text-left p-2 font-medium">Submitted</th>
                                                    <th className="text-left p-2 font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {safeFinalAverages.data.map((finalAverage) => (
                                                    <tr key={finalAverage.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="p-2">
                                                            <div>
                                                                <div className="font-medium">{finalAverage.student?.name}</div>
                                                                {finalAverage.student?.student_number && (
                                                                    <div className="text-sm text-gray-500">{finalAverage.student.student_number}</div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <div>
                                                                <div className="font-medium">{finalAverage.subject?.name}</div>
                                                                {finalAverage.subject?.code && (
                                                                    <div className="text-sm text-gray-500">{finalAverage.subject.code}</div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <span className="text-sm">{finalAverage.academic_level?.name}</span>
                                                        </td>
                                                        <td className="p-2">
                                                            <span className="font-medium text-lg">{finalAverage.grade}</span>
                                                        </td>
                                                        <td className="p-2">
                                                            <span className="text-sm">{finalAverage.school_year}</span>
                                                        </td>
                                                        <td className="p-2">
                                                            <div className="flex items-center gap-2">
                                                                {getStatusIcon(finalAverage)}
                                                                {getStatusBadge(finalAverage)}
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            {finalAverage.submitted_at ? (
                                                                <span className="text-sm text-gray-600">
                                                                    {new Date(finalAverage.submitted_at).toLocaleDateString()}
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-gray-400">Not submitted</span>
                                                            )}
                                                        </td>
                                                        <td className="p-2">
                                                            <div className="flex gap-2">
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={route('chairperson.final-averages.review', finalAverage.id)}>
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
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
        </div>
    );
}
