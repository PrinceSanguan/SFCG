import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Users, BookOpen, Award, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

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
}

interface Activity {
    type: string;
    title: string;
    description: string;
    timestamp: string;
    data: any;
}

interface Stats {
    total_students: number;
    total_courses: number;
    total_instructors: number;
    pending_grades: number;
    pending_honors: number;
    average_gpa: number;
}

interface DashboardProps {
    user: User;
    department: Department | null;
    stats: Stats;
    recentActivities: Activity[];
    pendingGrades: any[];
    pendingHonors: any[];
}

export default function ChairpersonDashboard({ 
    user, 
    department, 
    stats, 
    recentActivities, 
    pendingGrades, 
    pendingHonors 
}: DashboardProps) {
    if (!user) {
        return <div>Loading...</div>;
    }

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
                                Welcome back, {user.name}! {department ? `Managing ${department.name} department.` : 'No department assigned.'}
                            </p>
                        </div>

                        {/* Department Info */}
                        {department && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        Department Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</p>
                                            <p className="text-lg font-semibold">{department.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Code</p>
                                            <p className="text-lg font-semibold">{department.code}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                                            <p className="text-lg font-semibold">{department.description || 'No description'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
                                        Enrolled in department
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total_courses}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Available courses
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Instructors</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total_instructors}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Teaching staff
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
                                    <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.average_gpa}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Department average
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
                                            <Link href={route('chairperson.grades.pending')}>
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
                    </div>
                </main>
            </div>
        </div>
    );
}
