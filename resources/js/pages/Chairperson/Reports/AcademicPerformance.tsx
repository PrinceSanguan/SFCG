import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, TrendingUp, Download, BarChart } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface Performance {
    total_grades: number;
    average_grade: number;
    grade_distribution: Record<string, number>;
    subject_performance: any[];
    student_performance: any[];
}

interface Filters {
    school_year: string;
    academic_level_id?: string;
    grading_period_id?: string;
}

interface AcademicLevel {
    id: number;
    name: string;
    key: string;
}

interface GradingPeriod {
    id: number;
    name: string;
    code: string;
}

interface AcademicPerformanceProps {
    user: User;
    performance: Performance;
    filters: Filters;
    academicLevels: AcademicLevel[];
    gradingPeriods: GradingPeriod[];
    availableSchoolYears: string[];
}

export default function AcademicPerformance({
    user,
    performance,
    filters,
    academicLevels,
    gradingPeriods,
    availableSchoolYears
}: AcademicPerformanceProps) {
    if (!user) {
        return <div>Loading...</div>;
    }

    const { data, setData, post, processing } = useForm({
        school_year: filters.school_year || '',
        academic_level_id: filters.academic_level_id || '',
        grading_period_id: filters.grading_period_id || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('chairperson.reports.academic-performance.post'));
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
                                    Academic Performance Report
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Analyze student performance trends and grade distributions
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Report Filters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <Label htmlFor="school_year">School Year</Label>
                                        <Select
                                            value={data.school_year}
                                            onValueChange={(value) => setData('school_year', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select school year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSchoolYears.map((year) => (
                                                    <SelectItem key={year} value={year}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="academic_level_id">Academic Level</Label>
                                        <Select
                                            value={data.academic_level_id}
                                            onValueChange={(value) => setData('academic_level_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All levels (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Levels</SelectItem>
                                                {academicLevels.map((level) => (
                                                    <SelectItem key={level.id} value={level.id.toString()}>
                                                        {level.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="grading_period_id">Grading Period</Label>
                                        <Select
                                            value={data.grading_period_id}
                                            onValueChange={(value) => setData('grading_period_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All periods (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Periods</SelectItem>
                                                {gradingPeriods.map((period) => (
                                                    <SelectItem key={period.id} value={period.id.toString()}>
                                                        {period.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="md:col-span-3">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Generating...' : 'Generate Report'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Performance Overview */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
                                    <BarChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{performance.total_grades}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Grades analyzed
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{performance.average_grade}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Overall performance
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Export Report</CardTitle>
                                    <Download className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <Button asChild size="sm" className="w-full">
                                        <Link href={route('chairperson.reports.export', 'academic-performance')}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Export
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Grade Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Grade Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(performance.grade_distribution).length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No grade distribution data available
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {Object.entries(performance.grade_distribution)
                                            .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                            .map(([grade, count]) => (
                                                <div key={grade} className="flex items-center gap-4">
                                                    <div className="w-16 text-sm font-medium">Grade {grade}</div>
                                                    <div className="flex-1">
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                            <div
                                                                className="bg-blue-600 h-2.5 rounded-full"
                                                                style={{
                                                                    width: `${(count / performance.total_grades) * 100}%`
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

                        {/* Subject Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Subject Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {performance.subject_performance.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No subject performance data available
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2">Subject</th>
                                                    <th className="text-left p-2">Average Grade</th>
                                                    <th className="text-left p-2">Total Students</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {performance.subject_performance.map((subject, index) => (
                                                    <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="p-2 font-medium">{subject.subject_name}</td>
                                                        <td className="p-2">{subject.average_grade}</td>
                                                        <td className="p-2">{subject.total_students}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Student Performance - Rankings by GPA */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Rankings by GPA (Department)</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Top performing students in your department, ranked by average grade
                                </p>
                            </CardHeader>
                            <CardContent>
                                {performance.student_performance.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No student performance data available
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2 w-20">Rank</th>
                                                    <th className="text-left p-2">Student</th>
                                                    <th className="text-left p-2">GPA / Avg Grade</th>
                                                    <th className="text-left p-2">Total Subjects</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {performance.student_performance.slice(0, 10).map((student, index) => {
                                                    const getRankBadge = (rank: number) => {
                                                        if (rank === 1) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">🥇 1st</span>;
                                                        if (rank === 2) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">🥈 2nd</span>;
                                                        if (rank === 3) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">🥉 3rd</span>;
                                                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">#{rank}</span>;
                                                    };

                                                    return (
                                                        <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                            <td className="p-2">{getRankBadge(index + 1)}</td>
                                                            <td className="p-2 font-medium">{student.student_name}</td>
                                                            <td className="p-2 font-bold text-blue-600 dark:text-blue-400">{student.average_grade}</td>
                                                            <td className="p-2">{student.total_subjects}</td>
                                                        </tr>
                                                    );
                                                })}
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
