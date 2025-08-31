import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Users, BookOpen, TrendingUp, Download } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface DepartmentStats {
    total_students: number;
    total_courses: number;
    total_instructors: number;
    average_gpa: number;
    student_enrollment: Record<string, number>;
    course_performance: any[];
    instructor_performance: any[];
    honor_statistics: Record<string, number>;
    performance_trends: any[];
}

interface Filters {
    school_year: string;
    academic_level_id?: string;
}

interface DepartmentAnalysisProps {
    user: User;
    stats: DepartmentStats;
    filters: Filters;
}

export default function DepartmentAnalysis({ user, stats, filters }: DepartmentAnalysisProps) {
    if (!user) {
        return <div>Loading...</div>;
    }

    const { data, setData, post, processing } = useForm({
        school_year: filters.school_year || '',
        academic_level_id: filters.academic_level_id || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('chairperson.reports.department-analysis.post'));
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
                                <Link href={route('chairperson.reports.index')}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Reports
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Department Analysis
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Comprehensive analysis of department performance and metrics
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Report Filters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="school_year">School Year</Label>
                                        <Input
                                            id="school_year"
                                            type="text"
                                            value={data.school_year}
                                            onChange={(e) => setData('school_year', e.target.value)}
                                            placeholder="e.g., 2024-2025"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="academic_level_id">Academic Level</Label>
                                        <Input
                                            id="academic_level_id"
                                            type="text"
                                            value={data.academic_level_id}
                                            onChange={(e) => setData('academic_level_id', e.target.value)}
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Generating...' : 'Generate Report'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Key Metrics */}
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

                        {/* Student Enrollment by Course */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Enrollment by Course</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(stats.student_enrollment).length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No enrollment data available
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {Object.entries(stats.student_enrollment)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([course, count]) => (
                                                <div key={course} className="flex items-center gap-4">
                                                    <div className="flex-1 text-sm font-medium">{course}</div>
                                                    <div className="flex-1">
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                            <div
                                                                className="bg-green-600 h-2.5 rounded-full"
                                                                style={{
                                                                    width: `${(count / stats.total_students) * 100}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <div className="w-16 text-sm text-gray-500">{count}</div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Course Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Performance Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats.course_performance.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No course performance data available
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2">Course</th>
                                                    <th className="text-left p-2">Average Grade</th>
                                                    <th className="text-left p-2">Total Grades</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.course_performance.map((course, index) => (
                                                    <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="p-2 font-medium">{course.course_name}</td>
                                                        <td className="p-2">{course.average_grade}</td>
                                                        <td className="p-2">{course.total_grades}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Instructor Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Instructor Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats.instructor_performance.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No instructor performance data available
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2">Instructor</th>
                                                    <th className="text-left p-2">Average Grade</th>
                                                    <th className="text-left p-2">Total Grades</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.instructor_performance.map((instructor, index) => (
                                                    <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="p-2 font-medium">{instructor.instructor_name}</td>
                                                        <td className="p-2">{instructor.average_grade}</td>
                                                        <td className="p-2">{instructor.total_grades}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Honor Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Honor Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(stats.honor_statistics).length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No honor statistics available
                                    </p>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {Object.entries(stats.honor_statistics).map(([honorType, count]) => (
                                            <div key={honorType} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="font-medium">{honorType}</span>
                                                <span className="text-2xl font-bold text-blue-600">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Performance Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Trends Over Time</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats.performance_trends.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No performance trend data available
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {stats.performance_trends.map((trend, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="font-medium">{trend.school_year}</span>
                                                <span className="text-lg font-semibold">{trend.avg_grade}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Export Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Export Options</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <Button asChild>
                                        <Link href={route('chairperson.reports.export', 'department-analysis')}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Full Report
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href={route('chairperson.reports.export', 'department-analysis-csv')}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Export as CSV
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
