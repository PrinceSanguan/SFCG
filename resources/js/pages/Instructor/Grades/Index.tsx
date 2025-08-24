import { Header } from '@/components/instructor/header';
import { Sidebar } from '@/components/instructor/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Edit, Trash2, CheckCircle, XCircle, Plus, Upload, Search, Filter } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface AssignedCourse {
    id: number;
    course: {
        id: number;
        name: string;
        code: string;
    };
    academicLevel: {
        id: number;
        name: string;
        key: string;
    };
    gradingPeriod?: {
        id: number;
        name: string;
    };
    school_year: string;
    is_active: boolean;
}

interface StudentGrade {
    id: number;
    student: {
        id: number;
        name: string;
    };
    subject: {
        id: number;
        name: string;
    };
    academicLevel: {
        id: number;
        name: string;
    };
    gradingPeriod?: {
        id: number;
        name: string;
    };
    grade: number;
    school_year: string;
    is_submitted_for_validation: boolean;
    created_at: string;
    updated_at: string;
}

interface Filters {
    subject?: string;
    academic_level?: string;
    grading_period?: string;
    school_year?: string;
}

interface IndexProps {
    user: User;
    grades: {
        data: StudentGrade[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    assignedCourses: AssignedCourse[];
    filters: Filters;
}

export default function GradesIndex({ user, grades, assignedCourses, filters }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const filteredGrades = grades.data.filter(grade => 
        grade.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getGradeColor = (grade: number) => {
        if (grade >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        if (grade >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        if (grade >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    };

    const getValidationStatus = (grade: StudentGrade) => {
        if (grade.is_submitted_for_validation) {
            return {
                icon: <CheckCircle className="h-4 w-4 text-blue-600" />,
                text: 'Submitted',
                variant: 'secondary' as const
            };
        }
        return {
            icon: <XCircle className="h-4 w-4 text-gray-400" />,
            text: 'Draft',
            variant: 'outline' as const
        };
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Grade Management
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                View and manage student grades for your assigned courses.
                            </p>
                        </div>

                        {/* Actions Bar */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search students or subjects..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-full sm:w-64"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2"
                                >
                                    <Filter className="h-4 w-4" />
                                    Filters
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('instructor.grades.create')}>
                                    <Button className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Input Grade
                                    </Button>
                                </Link>
                                <Link href={route('instructor.grades.upload')}>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        Upload CSV
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Filters</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-4">
                                        <div>
                                            <label className="text-sm font-medium">Subject</label>
                                            <Select value={filters.subject || ''} onValueChange={(value) => {}}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All Subjects" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">All Subjects</SelectItem>
                                                    {assignedCourses.map((course) => (
                                                        <SelectItem key={course.course.id} value={course.course.id.toString()}>
                                                            {course.course.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Academic Level</label>
                                            <Select value={filters.academic_level || ''} onValueChange={(value) => {}}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All Levels" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">All Levels</SelectItem>
                                                    {assignedCourses.map((course) => (
                                                        <SelectItem key={course.academicLevel.id} value={course.academicLevel.id.toString()}>
                                                            {course.academicLevel.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Grading Period</label>
                                            <Select value={filters.grading_period || ''} onValueChange={(value) => {}}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All Periods" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">All Periods</SelectItem>
                                                    {assignedCourses
                                                        .filter(course => course.gradingPeriod)
                                                        .map((course) => (
                                                            <SelectItem key={course.gradingPeriod!.id} value={course.gradingPeriod!.id.toString()}>
                                                                {course.gradingPeriod!.name}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">School Year</label>
                                            <Select value={filters.school_year || ''} onValueChange={(value) => {}}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All Years" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">All Years</SelectItem>
                                                    {Array.from(new Set(assignedCourses.map(course => course.school_year))).map((year) => (
                                                        <SelectItem key={year} value={year}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Grades Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Student Grades ({grades.total})</span>
                                    <div className="text-sm text-muted-foreground">
                                        Page {grades.current_page} of {grades.last_page}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {filteredGrades.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredGrades.map((grade) => {
                                            const validationStatus = getValidationStatus(grade);
                                            return (
                                                <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <div>
                                                                <p className="font-medium">{grade.student.name}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {grade.subject.name} • {grade.academicLevel.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {grade.school_year}
                                                                    {grade.gradingPeriod && ` • ${grade.gradingPeriod.name}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge className={getGradeColor(grade.grade)}>
                                                            {grade.grade}
                                                        </Badge>
                                                        <Badge variant={validationStatus.variant} className="flex items-center gap-1">
                                                            {validationStatus.icon}
                                                            {validationStatus.text}
                                                        </Badge>
                                                        <div className="flex gap-2">
                                                            <Link href={route('instructor.grades.edit', grade.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {searchTerm ? 'No grades found matching your search.' : 'No grades have been entered yet.'}
                                        </p>
                                        {!searchTerm && (
                                            <Link href={route('instructor.grades.create')}>
                                                <Button className="mt-4">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Input Your First Grade
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pagination */}
                        {grades.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    disabled={grades.current_page === 1}
                                    onClick={() => {}}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {grades.current_page} of {grades.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={grades.current_page === grades.last_page}
                                    onClick={() => {}}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
