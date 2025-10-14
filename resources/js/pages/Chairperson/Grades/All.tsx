import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, router } from '@inertiajs/react';
import { GraduationCap, Eye, ArrowLeft, Filter } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface Grade {
    id: number;
    student: {
        id: number;
        name: string;
        student_number: string;
    };
    subject: {
        id: number;
        name: string;
        course?: {
            name: string;
        };
    };
    academicLevel?: {
        id: number;
        name: string;
    };
    academic_level?: {
        id: number;
        name: string;
    };
    gradingPeriod?: {
        id: number;
        name: string;
    };
    grading_period?: {
        id: number;
        name: string;
    };
    grade: number;
    school_year: string;
    is_submitted_for_validation: boolean;
    is_approved: boolean;
    is_returned: boolean;
    submitted_at?: string;
    approved_at?: string;
    created_at?: string;
}

interface AcademicLevel {
    id: number;
    key: string;
    name: string;
    sort_order: number;
    is_active: boolean;
}

interface AllGradesProps {
    user: User;
    grades: {
        data: Grade[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    academicLevels: AcademicLevel[];
    selectedAcademicLevel: string | null;
}

export default function AllGrades({ user, grades, academicLevels, selectedAcademicLevel }: AllGradesProps) {
    if (!user) {
        return <div>Loading...</div>;
    }

    // Add safety checks for undefined props
    const safeGrades = grades || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
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
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Button asChild variant="outline" size="sm">
                                <Link href={route('chairperson.grades.index')}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Grades
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    All Grades
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    View all grades in your department (view only)
                                </p>
                            </div>
                        </div>

                        {/* Academic Level Filter */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filter by Academic Level
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select
                                    value={selectedAcademicLevel || 'all'}
                                    onValueChange={handleAcademicLevelChange}
                                >
                                    <SelectTrigger className="w-full md:w-64">
                                        <SelectValue placeholder="Select academic level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Levels</SelectItem>
                                        {safeAcademicLevels.map((level) => (
                                            <SelectItem key={level.id} value={level.id.toString()}>
                                                {level.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Grades</p>
                                        <p className="text-2xl font-bold">{safeGrades.total}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Page</p>
                                        <p className="text-2xl font-bold">{safeGrades.current_page} of {safeGrades.last_page}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Grades per Page</p>
                                        <p className="text-2xl font-bold">{safeGrades.per_page}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Grades Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>All Grades</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {safeGrades.data.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No grades found
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2">Student</th>
                                                    <th className="text-left p-2">Subject</th>
                                                    <th className="text-left p-2">Grade</th>
                                                    <th className="text-left p-2">Academic Level</th>
                                                    <th className="text-left p-2">Grading Period</th>
                                                    <th className="text-left p-2">School Year</th>
                                                    <th className="text-left p-2">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {safeGrades.data.map((grade) => (
                                                    <tr key={grade.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="p-2">
                                                            <div>
                                                                <div className="font-medium">{grade.student?.name || 'N/A'}</div>
                                                                <div className="text-sm text-gray-500">{grade.student?.student_number || 'N/A'}</div>
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <div>
                                                                <div className="font-medium">{grade.subject?.name || 'N/A'}</div>
                                                                <div className="text-sm text-gray-500">{grade.subject?.course?.name || 'N/A'}</div>
                                                            </div>
                                                        </td>
                                                        <td className="p-2 font-medium">{grade.grade}</td>
                                                        <td className="p-2">{grade.academic_level?.name || grade.academicLevel?.name || 'N/A'}</td>
                                                        <td className="p-2">{grade.grading_period?.name || grade.gradingPeriod?.name || 'N/A'}</td>
                                                        <td className="p-2">{grade.school_year}</td>
                                                        <td className="p-2">
                                                            <div className="flex gap-2">
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={route('chairperson.grades.review', grade.id)}>
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
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
