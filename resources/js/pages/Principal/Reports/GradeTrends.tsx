import { Header } from '@/components/principal/header';
import { Sidebar } from '@/components/principal/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Filter, Download, TrendingUp, BarChart, Calendar, Users } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface GradingPeriod {
    id: number;
    name: string;
}

interface TrendData {
    grading_period_id: number;
    average_grade: number;
    total_grades: number;
    passing_count: number;
    gradingPeriod: GradingPeriod;
}

interface AcademicLevel {
    id: number;
    name: string;
}

interface Course {
    id: number;
    name: string;
    department: {
        id: number;
        name: string;
    };
}

interface GradeTrendsProps {
    user: User;
    trends: TrendData[];
    filters: {
        academic_level_id?: string;
        course_id?: string;
        year?: string;
    };
    academicLevels: AcademicLevel[];
    courses: Course[];
    gradingPeriods: GradingPeriod[];
}

export default function GradeTrends({ user, trends, filters, academicLevels, courses, gradingPeriods }: GradeTrendsProps) {
    const [selectedLevel, setSelectedLevel] = useState(filters.academic_level_id || '');
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');

    const calculatePassingRate = (trend: TrendData) => {
        return trend.total_grades > 0 ? (trend.passing_count / trend.total_grades) * 100 : 0;
    };

    const getTrendColor = (averageGrade: number) => {
        if (averageGrade >= 90) return 'text-green-600';
        if (averageGrade >= 80) return 'text-blue-600';
        if (averageGrade >= 75) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getTrendBadge = (averageGrade: number) => {
        if (averageGrade >= 90) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
        if (averageGrade >= 80) return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Good</Badge>;
        if (averageGrade >= 75) return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Passing</Badge>;
        return <Badge variant="destructive">Below Average</Badge>;
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
                    <Link href={route('principal.reports.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Reports
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Grade Trends Analysis
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Track grade trends over time and identify patterns in academic performance.
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Periods</p>
                                <p className="text-2xl font-bold">{trends.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <BarChart className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Overall Average</p>
                                <p className="text-2xl font-bold">
                                    {trends.length > 0 ? (trends.reduce((sum, trend) => sum + trend.average_grade, 0) / trends.length).toFixed(2) : '0.00'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Grades</p>
                                <p className="text-2xl font-bold">
                                    {trends.reduce((sum, trend) => sum + trend.total_grades, 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Academic Level</label>
                            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All levels</SelectItem>
                                    {academicLevels.map((level) => (
                                        <SelectItem key={level.id} value={level.id.toString()}>
                                            {level.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Course</label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All courses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All courses</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                            {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">School Year</label>
                            <Input
                                placeholder="e.g., 2024-2025"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Export Options
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Button className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export to PDF
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export to Excel
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export to CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Trends Chart Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Grade Trends Visualization
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Chart visualization would be implemented here</p>
                            <p className="text-sm text-gray-400">Using libraries like Chart.js or Recharts</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Trends Data */}
            <Card>
                <CardHeader>
                    <CardTitle>Trends by Grading Period</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {trends.map((trend, index) => (
                            <div key={trend.grading_period_id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{trend.gradingPeriod.name}</h3>
                                            <span className={`text-lg font-bold ${getTrendColor(trend.average_grade)}`}>
                                                {trend.average_grade.toFixed(2)}
                                            </span>
                                            {getTrendBadge(trend.average_grade)}
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Total Grades:</span> {trend.total_grades}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Passing:</span> {trend.passing_count}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Passing Rate:</span> {calculatePassingRate(trend).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">Period {index + 1}</Badge>
                                </div>
                            </div>
                        ))}
                        {trends.length === 0 && (
                            <div className="text-center py-8">
                                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No trend data available for the selected criteria.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Analysis Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Analysis Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Performance Insights</h4>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <p>• Average grade across all periods: {trends.length > 0 ? (trends.reduce((sum, trend) => sum + trend.average_grade, 0) / trends.length).toFixed(2) : 'N/A'}</p>
                                <p>• Total grades analyzed: {trends.reduce((sum, trend) => sum + trend.total_grades, 0)}</p>
                                <p>• Overall passing rate: {trends.length > 0 ? (trends.reduce((sum, trend) => sum + trend.passing_count, 0) / trends.reduce((sum, trend) => sum + trend.total_grades, 0) * 100).toFixed(1) : '0.0'}%</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Recommendations</h4>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <p>• Monitor periods with below-average performance</p>
                                <p>• Identify subjects that may need additional support</p>
                                <p>• Track improvement trends over time</p>
                            </div>
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
