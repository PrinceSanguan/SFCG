import { Header } from '@/components/principal/header';
import { Sidebar } from '@/components/principal/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Search, Filter, Download, BarChart, TrendingUp, Users, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AcademicLevel {
    id: number;
    name: string;
    key?: string;
}

interface Strand {
    id: number;
    name: string;
    code: string;
    academicLevel?: {
        id: number;
        name: string;
    };
}

interface StudentGrade {
    id: number;
    grade: number;
    school_year: string;
    year_of_study: number;
    student: {
        id: number;
        name: string;
    };
    subject: {
        id: number;
        name: string;
        course: {
            id: number;
            name: string;
        };
    };
    academicLevel: {
        id: number;
        name: string;
    };
    gradingPeriod: {
        id: number;
        name: string;
    };
}

interface Stats {
    total_grades: number;
    average_grade: number;
    highest_grade: number;
    lowest_grade: number;
    passing_rate: number;
}

interface GradingPeriod {
    id: number;
    name: string;
}

interface AcademicPerformanceProps {
    user: User;
    grades: {
        data: StudentGrade[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    filters: {
        academic_level_id?: string;
        strand_id?: string;
        year?: string;
        period?: string;
    };
    academicLevels: AcademicLevel[];
    principalAcademicLevel?: AcademicLevel | null;
    strands: Strand[];
    gradingPeriods: GradingPeriod[];
}

export default function AcademicPerformance({ user, grades, stats, filters, principalAcademicLevel, strands, gradingPeriods }: AcademicPerformanceProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStrand, setSelectedStrand] = useState(filters.strand_id || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');
    const [selectedPeriod, setSelectedPeriod] = useState(filters.period || '');

    // Log component render for debugging
    useEffect(() => {
        console.log('[Principal Reports] Academic Performance - Component Render', {
            principalAcademicLevel: principalAcademicLevel,
            academicLevelKey: principalAcademicLevel?.key,
            academicLevelName: principalAcademicLevel?.name,
            shouldShowStrand: principalAcademicLevel?.key === 'senior_highschool',
            strandsCount: strands?.length || 0,
        });
    }, [principalAcademicLevel, strands]);

    // Determine if strand filter should be shown (only for Senior High School)
    // Database uses 'senior_highschool' key (no underscore between high and school)
    const shouldShowStrandFilter = principalAcademicLevel?.key === 'senior_highschool';

    const filteredGrades = grades.data.filter(grade => {
        const matchesSearch = grade.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            grade.subject.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStrand = !selectedStrand || selectedStrand === 'all' || grade.subject.course.id.toString() === selectedStrand;
        const matchesYear = !selectedYear || grade.school_year === selectedYear;
        const matchesPeriod = !selectedPeriod || selectedPeriod === 'all' || grade.gradingPeriod.id.toString() === selectedPeriod;

        return matchesSearch && matchesStrand && matchesYear && matchesPeriod;
    });

    const getGradeColor = (grade: number) => {
        if (grade >= 90) return 'text-green-600';
        if (grade >= 80) return 'text-blue-600';
        if (grade >= 75) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getGradeBadge = (grade: number) => {
        if (grade >= 90) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
        if (grade >= 80) return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Good</Badge>;
        if (grade >= 75) return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Passing</Badge>;
        return <Badge variant="destructive">Failing</Badge>;
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
                            Academic Performance Report
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Comprehensive analysis of student academic performance across all levels and courses.
                        </p>
                    </div>
                </div>
            </div>

            {/* Performance Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Grades</p>
                                <p className="text-2xl font-bold">{stats.total_grades}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <BarChart className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Average Grade</p>
                                <p className="text-2xl font-bold">{stats.average_grade.toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Highest Grade</p>
                                <p className="text-2xl font-bold">{stats.highest_grade}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-red-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Lowest Grade</p>
                                <p className="text-2xl font-bold">{stats.lowest_grade}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <BarChart className="h-8 w-8 text-yellow-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Passing Rate</p>
                                <p className="text-2xl font-bold">{stats.passing_rate.toFixed(1)}%</p>
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
                    <div className={`grid gap-4 ${shouldShowStrandFilter ? 'md:grid-cols-2 lg:grid-cols-5' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search students or subjects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Academic Level</label>
                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-gray-50 px-3 py-2 text-sm">
                                {principalAcademicLevel?.name || 'Not Assigned'}
                            </div>
                            <p className="text-xs text-gray-500">Reports are filtered by your assigned academic level</p>
                        </div>
                        {/* Only show Strand filter for Senior High School */}
                        {shouldShowStrandFilter && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Strand</label>
                                <Select value={selectedStrand} onValueChange={setSelectedStrand}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All strands" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All strands</SelectItem>
                                        {strands.map((strand) => (
                                            <SelectItem key={strand.id} value={strand.id.toString()}>
                                                {strand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">School Year</label>
                            <Input
                                placeholder="e.g., 2024-2025"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Grading Period</label>
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All periods" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All periods</SelectItem>
                                    {gradingPeriods.map((period) => (
                                        <SelectItem key={period.id} value={period.id.toString()}>
                                            {period.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                        <Button
                            className="flex items-center gap-2"
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (selectedStrand && selectedStrand !== 'all') params.append('strand_id', selectedStrand);
                                if (selectedYear) params.append('year', selectedYear);
                                if (selectedPeriod && selectedPeriod !== 'all') params.append('period', selectedPeriod);
                                window.location.href = route('principal.reports.academic-performance.export', { format: 'pdf' }) + '?' + params.toString();
                            }}
                        >
                            <Download className="h-4 w-4" />
                            Export to PDF
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (selectedStrand && selectedStrand !== 'all') params.append('strand_id', selectedStrand);
                                if (selectedYear) params.append('year', selectedYear);
                                if (selectedPeriod && selectedPeriod !== 'all') params.append('period', selectedPeriod);
                                window.location.href = route('principal.reports.academic-performance.export', { format: 'excel' }) + '?' + params.toString();
                            }}
                        >
                            <Download className="h-4 w-4" />
                            Export to Excel
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (selectedStrand && selectedStrand !== 'all') params.append('strand_id', selectedStrand);
                                if (selectedYear) params.append('year', selectedYear);
                                if (selectedPeriod && selectedPeriod !== 'all') params.append('period', selectedPeriod);
                                window.location.href = route('principal.reports.academic-performance.export', { format: 'csv' }) + '?' + params.toString();
                            }}
                        >
                            <Download className="h-4 w-4" />
                            Export to CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Grades List */}
            <Card>
                <CardHeader>
                    <CardTitle>Grade Details ({filteredGrades.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredGrades.map((grade) => (
                            <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{grade.student.name}</h3>
                                            <span className={`text-lg font-bold ${getGradeColor(grade.grade)}`}>
                                                {grade.grade}
                                            </span>
                                            {getGradeBadge(grade.grade)}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {grade.subject.name} - {grade.subject.course.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {grade.academicLevel.name} - {grade.gradingPeriod.name} - {grade.school_year}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{grade.year_of_study}</Badge>
                                </div>
                            </div>
                        ))}
                        {filteredGrades.length === 0 && (
                            <div className="text-center py-8">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                {!principalAcademicLevel ? (
                                    <>
                                        <p className="text-gray-700 font-medium mb-2">No Academic Level Assigned</p>
                                        <p className="text-gray-500">Please contact the administrator to assign an academic level to your account.</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-gray-700 font-medium mb-2">No Grades Available</p>
                                        <p className="text-gray-500">No approved grades found for {principalAcademicLevel.name}.</p>
                                        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or check back later.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {grades.last_page > 1 && (
                <div className="flex justify-center">
                    <div className="flex gap-2">
                        {Array.from({ length: grades.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === grades.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    const params = new URLSearchParams();
                                    if (filters?.strand_id) params.set('strand_id', filters.strand_id);
                                    if (filters?.year) params.set('year', filters.year);
                                    if (filters?.period) params.set('period', filters.period);
                                    params.set('page', page.toString());
                                    router.visit(route('principal.reports.academic-performance') + '?' + params.toString(), {
                                        preserveState: true,
                                        preserveScroll: false,
                                    });
                                }}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
                    </div>
                </main>
            </div>
        </div>
    );
}
