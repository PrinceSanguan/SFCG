import { Header } from '@/components/principal/header';
import { Sidebar } from '@/components/principal/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@inertiajs/react';
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, Check, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AcademicLevel {
    id: number;
    name: string;
}

interface GradingPeriod {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    name: string;
    course: {
        id: number;
        name: string;
    };
}

interface StudentGrade {
    id: number;
    grade: number;
    school_year: string;
    year_of_study: number;
    is_submitted_for_validation: boolean;
    is_approved: boolean;
    is_returned: boolean;
    submitted_at: string;
    approved_at?: string;
    returned_at?: string;
    return_reason?: string;
    student: User;
    subject: Subject;
    academicLevel: AcademicLevel;
    gradingPeriod: GradingPeriod;
    approvedBy?: User;
    returnedBy?: User;
}

interface GradesIndexProps {
    user: User;
    grades: {
        data: StudentGrade[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    academicLevels: AcademicLevel[];
    gradingPeriods: GradingPeriod[];
}

export default function GradesIndex({ user, grades, academicLevels, gradingPeriods }: GradesIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const getStatusBadge = (grade: StudentGrade) => {
        if (grade.is_approved) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
        }
        if (grade.is_returned) {
            return <Badge variant="destructive">Returned</Badge>;
        }
        if (grade.is_submitted_for_validation) {
            return <Badge variant="secondary">Pending</Badge>;
        }
        return <Badge variant="outline">Draft</Badge>;
    };

    const getStatusIcon = (grade: StudentGrade) => {
        if (grade.is_approved) {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        }
        if (grade.is_returned) {
            return <XCircle className="h-4 w-4 text-red-600" />;
        }
        if (grade.is_submitted_for_validation) {
            return <Clock className="h-4 w-4 text-yellow-600" />;
        }
        return <Clock className="h-4 w-4 text-gray-400" />;
    };

    const filteredGrades = grades.data.filter(grade => {
        const matchesSearch = (grade.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (grade.subject?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = !selectedLevel || selectedLevel === 'all' || grade.academicLevel?.id.toString() === selectedLevel;
        const matchesPeriod = !selectedPeriod || selectedPeriod === 'all' || grade.gradingPeriod?.id.toString() === selectedPeriod;
        const matchesStatus = !statusFilter || statusFilter === 'all' ||
            (statusFilter === 'approved' && grade.is_approved) ||
            (statusFilter === 'pending' && grade.is_submitted_for_validation && !grade.is_approved && !grade.is_returned) ||
            (statusFilter === 'returned' && grade.is_returned);

        return matchesSearch && matchesLevel && matchesPeriod && matchesStatus;
    });

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Grade Management
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Review and manage grade submissions across all departments.
                </p>
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="returned">Returned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Grades List */}
            <Card>
                <CardHeader>
                    <CardTitle>Grade Submissions ({filteredGrades.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredGrades.map((grade) => (
                            <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(grade)}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{grade.student?.name || 'Unknown Student'}</h3>
                                            <Badge variant="outline">{grade.grade}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {grade.subject?.name || 'Unknown Subject'} - {grade.subject?.course?.name || 'Unknown Course'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {grade.academicLevel?.name || 'Unknown Level'} - {grade.gradingPeriod?.name || 'Unknown Period'} - {grade.school_year}
                                        </p>
                                        {grade.return_reason && (
                                            <p className="text-xs text-red-600 mt-1">
                                                Return reason: {grade.return_reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(grade)}
                                    <Link href={route('principal.grades.review', grade.id)}>
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-1" />
                                            Review
                                        </Button>
                                    </Link>
                                    {grade.is_submitted_for_validation && !grade.is_approved && !grade.is_returned && (
                                        <div className="flex gap-1">
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    // Handle approve
                                                }}
                                                className="inline"
                                            >
                                                <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                            </form>
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    // Handle return
                                                }}
                                                className="inline"
                                            >
                                                <Button type="submit" size="sm" variant="destructive">
                                                    <RotateCcw className="h-4 w-4 mr-1" />
                                                    Return
                                                </Button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredGrades.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No grades found matching your criteria.</p>
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
