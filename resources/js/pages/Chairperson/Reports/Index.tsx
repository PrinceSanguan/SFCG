import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { BarChart, TrendingUp, Building2, FileText, Download } from 'lucide-react';

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

interface Stats {
    total_students: number;
    total_courses: number;
    total_instructors: number;
    average_gpa: number;
}

interface RecentData {
    recent_grades: any[];
    recent_honors: any[];
}

interface ReportsIndexProps {
    user: User;
    department: Department | null;
    stats: Stats;
    recentData: RecentData;
}

export default function ReportsIndex({
    user,
    department,
    stats,
    recentData
}: ReportsIndexProps) {
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
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports & Analysis</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                View academic performance trends and department analysis
                            </p>
                        </div>

                        {/* Department Info */}
                        {department && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
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

                        {/* Quick Stats */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                                    <BarChart className="h-4 w-4 text-muted-foreground" />
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
                                    <FileText className="h-4 w-4 text-muted-foreground" />
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
                                    <BarChart className="h-4 w-4 text-muted-foreground" />
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

                        {/* Report Types */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Academic Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Analyze student performance trends, grade distributions, and subject performance across different academic levels and grading periods.
                                    </p>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href={route('chairperson.reports.academic-performance')}>
                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                View Report
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline">
                                            <Link href={route('chairperson.reports.export', 'academic-performance')}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Export
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Department Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Comprehensive analysis of department performance, including student enrollment, course effectiveness, and instructor performance metrics.
                                    </p>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href={route('chairperson.reports.department-analysis')}>
                                                <Building2 className="mr-2 h-4 w-4" />
                                                View Report
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline">
                                            <Link href={route('chairperson.reports.export', 'department-analysis')}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Export
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Data Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-medium mb-2">Recent Grades</h4>
                                        {recentData.recent_grades.length === 0 ? (
                                            <p className="text-sm text-gray-500">No recent grades</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {recentData.recent_grades.slice(0, 5).map((grade) => (
                                                    <div key={grade.id} className="text-sm">
                                                        <span className="font-medium">{grade.student?.name}</span>
                                                        <span className="text-gray-500"> - {grade.subject?.name}</span>
                                                        <span className="text-gray-400"> ({grade.grade})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Recent Honors</h4>
                                        {recentData.recent_honors.length === 0 ? (
                                            <p className="text-sm text-gray-500">No recent honors</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {recentData.recent_honors.slice(0, 5).map((honor) => (
                                                    <div key={honor.id} className="text-sm">
                                                        <span className="font-medium">{honor.student?.name}</span>
                                                        <span className="text-gray-500"> - {honor.honorType?.name}</span>
                                                        <span className="text-gray-400"> (GPA: {honor.gpa})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
