import { Header } from '@/components/principal/header';
import { Sidebar } from '@/components/principal/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Users, BookOpen, CheckCircle, Award, TrendingUp, Activity, UserCheck } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface ActivityLog {
    id: number;
    action: string;
    user: User;
    target_user?: User;
    created_at: string;
    details?: Record<string, unknown>;
}

interface StudentGrade {
    id: number;
    grade: number;
    student: User;
    subject: {
        name: string;
        course: {
            name: string;
        };
    };
    academicLevel: {
        name: string;
    };
    gradingPeriod: {
        name: string;
    };
    submitted_at: string;
}

interface HonorResult {
    id: number;
    gpa: number;
    student: User;
    honorType: {
        name: string;
    };
    academicLevel: {
        name: string;
    };
    created_at: string;
}

interface Stats {
    total_students: number;
    total_teachers: number;
    pending_grades: number;
    pending_honors: number;
    approved_grades_today: number;
    approved_honors_today: number;
}

interface DashboardProps {
    user: User;
    stats: Stats;
    recentActivities: ActivityLog[];
    recentGrades: StudentGrade[];
    recentHonors: HonorResult[];
}

export default function PrincipalDashboard({ 
    user, 
    stats, 
    recentActivities, 
    recentGrades, 
    recentHonors 
}: DashboardProps) {
    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Pass user data to the Sidebar component */}
            <Sidebar user={user} />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Pass user data to the Header component */}
                <Header user={user} />

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Principal Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Welcome back, {user.name}! Monitor and manage academic operations from here.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_students}</div>
                        <p className="text-xs text-muted-foreground">
                            Enrolled students
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_teachers}</div>
                        <p className="text-xs text-muted-foreground">
                            Teaching staff
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
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
            </div>

            {/* Today's Approvals */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Grades Approved Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.approved_grades_today}</div>
                        <p className="text-xs text-muted-foreground">
                            Grade approvals today
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Honors Approved Today</CardTitle>
                        <Award className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.approved_honors_today}</div>
                        <p className="text-xs text-muted-foreground">
                            Honor approvals today
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Recent Grade Submissions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Grade Submissions</CardTitle>
                        <Link href={route('principal.grades.pending')}>
                            <Button variant="outline" size="sm">
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentGrades.map((grade) => (
                                <div key={grade.id} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{grade.student?.name || 'Unknown Student'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {grade.subject?.name || 'Unknown Subject'} - {grade.subject?.course?.name || 'Unknown Course'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {grade.academicLevel?.name || 'Unknown Level'} - {grade.gradingPeriod?.name || 'Unknown Period'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{grade.grade}</Badge>
                                        <Badge variant="secondary">Pending</Badge>
                                    </div>
                                </div>
                            ))}
                            {recentGrades.length === 0 && (
                                <p className="text-sm text-muted-foreground">No recent grade submissions</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Honor Submissions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Honor Submissions</CardTitle>
                        <Link href={route('principal.honors.pending')}>
                            <Button variant="outline" size="sm">
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentHonors.map((honor) => (
                                <div key={honor.id} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{honor.student?.name || 'Unknown Student'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {honor.honorType?.name || 'Unknown Type'} - {honor.academicLevel?.name || 'Unknown Level'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            GPA: {honor.gpa}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{honor.gpa}</Badge>
                                        <Badge variant="secondary">Pending</Badge>
                                    </div>
                                </div>
                            ))}
                            {recentHonors.length === 0 && (
                                <p className="text-sm text-muted-foreground">No recent honor submissions</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activities */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Recent Activities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm">
                                        <span className="font-medium">{activity.user.name}</span>{' '}
                                        {activity.action.replace('_', ' ')}{' '}
                                        {activity.target_user && (
                                            <span className="font-medium">{activity.target_user.name}</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(activity.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentActivities.length === 0 && (
                            <p className="text-sm text-muted-foreground">No recent activities</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 flex-wrap">
                        <Link href={route('principal.grades.pending')}>
                            <Button className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Review Pending Grades
                            </Button>
                        </Link>
                        <Link href={route('principal.honors.pending')}>
                            <Button className="flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                Review Pending Honors
                            </Button>
                        </Link>
                        <Link href={route('principal.reports.index')}>
                            <Button variant="outline" className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                View Reports
                            </Button>
                        </Link>
                        <Link href={route('principal.account.index')}>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Account Settings
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
