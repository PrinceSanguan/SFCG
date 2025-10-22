import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, router } from '@inertiajs/react';
import { Users, BookOpen, Award, TrendingUp, Clock, Filter, CheckCircle, GraduationCap, Building2, Shield } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    department_id?: number;
}

interface Department {
    id: number;
    name: string;
    code: string;
    description?: string;
    filtered_by?: string;
}

interface Activity {
    type: string;
    title: string;
    description: string;
    timestamp: string;
    data: unknown;
}

interface Stats {
    total_students: number;
    total_teachers: number;
    total_subjects: number;
    pending_grades: number;
    pending_honors: number;
    approved_honors: number;
    average_gpa: number;
}

interface AcademicLevel {
    id: number;
    key: string;
    name: string;
    sort_order: number;
    is_active: boolean;
}

interface Honor {
    id: number;
    student?: {
        name: string;
    };
    honorType?: {
        name: string;
    };
    gpa: number;
    approved_at?: string;
}

interface GradeDistribution {
    outstanding_count: number;
    excellent_count: number;
    very_good_count: number;
    good_count: number;
    satisfactory_count: number;
    needs_improvement_count: number;
    total_grades: number;
}

interface AcademicLevelInsight {
    academic_level?: string;
    total_sections?: number;
    honor_distribution?: any[];
    grade_performance?: any;
    name?: string;
    student_count?: number;
    honor_count?: number;
}

interface SystemActivity {
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: string;
}

interface DashboardProps {
    user: User;
    stats: Stats;
    recentActivities: Activity[];
    pendingGrades: unknown[];
    pendingHonors: unknown[];
    approvedHonors: Honor[];
    academicLevelInsights: AcademicLevelInsight[] | AcademicLevelInsight;
    gradeDistribution: GradeDistribution;
    systemActivities: SystemActivity[];
    academicLevels: AcademicLevel[];
    selectedAcademicLevel: string | null;
    dashboardMessage: string;
    department: Department | null;
}

export default function ChairpersonDashboard({
    user,
    stats,
    recentActivities,
    pendingGrades,
    pendingHonors,
    approvedHonors,
    academicLevelInsights,
    gradeDistribution,
    systemActivities,
    academicLevels,
    selectedAcademicLevel,
    dashboardMessage,
    department
}: DashboardProps) {
    if (!user) {
        return <div>Loading...</div>;
    }

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

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Chairperson Dashboard
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                {dashboardMessage}
                            </p>
                        </div>

                        {/* Academic Level & Department Info - Enhanced UI */}
                        <Card className="border-l-4 border-l-blue-600">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                    Your Oversight Area
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Academic Level Badge */}
                                {safeAcademicLevels.length > 0 ? (
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-100 dark:border-blue-900">
                                        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                                            <GraduationCap className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700">
                                                    {safeAcademicLevels[0].name}
                                                </Badge>
                                                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                                                    Academic Level
                                                </span>
                                            </div>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                You manage College-level academic oversight
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                        <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-lg">
                                            <GraduationCap className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            No academic level assigned
                                        </p>
                                    </div>
                                )}

                                {/* Department Info */}
                                {department ? (
                                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-100 dark:border-green-900">
                                        <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-lg">
                                            <Building2 className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                                                    {department.name}
                                                </span>
                                                <Badge variant="outline" className="text-xs px-2 py-0.5 border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                                                    {department.code}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                Your assigned department
                                            </p>
                                        </div>
                                    </div>
                                ) : user.department_id ? (
                                    <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-100 dark:border-amber-900">
                                        <div className="flex items-center justify-center w-10 h-10 bg-amber-500 rounded-lg">
                                            <Building2 className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                                Department ID: {user.department_id}
                                            </p>
                                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                                Department details not loaded
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                        <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-lg">
                                            <Building2 className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            No department assigned
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Academic Level Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Academic Overview
                                    {selectedAcademicLevel && (
                                        <Badge variant="secondary" className="ml-2">
                                            {safeAcademicLevels.find(level => level.id.toString() === selectedAcademicLevel)?.name || 'All Levels'}
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {dashboardMessage}
                                </p>
                                
                                {selectedAcademicLevel && Array.isArray(academicLevelInsights) === false && (
                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Academic Level</p>
                                            <p className="text-lg font-semibold">{(academicLevelInsights as AcademicLevelInsight).academic_level}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sections</p>
                                            <p className="text-lg font-semibold">{(academicLevelInsights as AcademicLevelInsight).total_sections || 0}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total_students}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedAcademicLevel ? 'In selected level' : 'Across all levels'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Teachers & Instructors</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total_teachers}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Active teaching staff
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total_subjects}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Available subjects
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.pending_grades}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Awaiting approval
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Honors</CardTitle>
                                    <Award className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.pending_honors}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Awaiting approval
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Approved Honors</CardTitle>
                                    <Award className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.approved_honors}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Successfully awarded
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.average_gpa}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Overall academic performance
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Pending Approvals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Grades to Review</span>
                                        <Badge variant="secondary">{stats.pending_grades}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Honors to Review</span>
                                        <Badge variant="secondary">{stats.pending_honors}</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button asChild size="sm">
                                            <Link href={route('chairperson.grades.all')}>
                                                Review Grades
                                            </Link>
                                        </Button>
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={route('chairperson.honors.pending')}>
                                                Review Honors
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Quick Reports
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Button asChild size="sm">
                                            <Link href={route('chairperson.reports.index')}>
                                                View Reports
                                            </Link>
                                        </Button>
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={route('chairperson.reports.department-analysis')}>
                                                Department Analysis
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activities */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Recent Activities
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentActivities.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                        No recent activities
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {recentActivities.map((activity, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                                                <div className="flex-shrink-0">
                                                    {activity.type === 'grade_submission' ? (
                                                        <Clock className="h-5 w-5 text-blue-500" />
                                                    ) : (
                                                        <Award className="h-5 w-5 text-green-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {activity.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {activity.description}
                                                    </p>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {new Date(activity.timestamp).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Approved Honors */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Recently Approved Honors
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {approvedHonors.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                        No approved honors found
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {approvedHonors.map((honor: Honor, index: number) => (
                                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                                                <div className="flex-shrink-0">
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        Honor Approved
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {honor.student?.name} - {honor.honorType?.name} (GPA: {honor.gpa})
                                                    </p>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {honor.approved_at ? new Date(honor.approved_at).toLocaleDateString() : 'Recently'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {approvedHonors.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <Button asChild variant="outline" size="sm" className="w-full">
                                            <Link href={route('chairperson.honors.index')}>
                                                View All Honors
                                            </Link>
                                        </Button>
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
