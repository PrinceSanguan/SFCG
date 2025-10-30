import { Header } from '@/components/teacher/header';
import { Sidebar } from '@/components/teacher/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit as EditIcon, Plus, User, BookOpen, GraduationCap, Calendar, Mail } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface StudentGrade {
    id: number;
    student: {
        id: number;
        name: string;
        student_number?: string;
    };
    subject: {
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
    grading_period_id?: number;
    grade: number;
    school_year: string;
    year_of_study?: number;
    is_submitted_for_validation: boolean;
    created_at: string;
    updated_at: string;
    // Editability fields (5-day edit window)
    is_editable?: boolean;
    days_remaining?: number;
    edit_status?: 'editable' | 'locked' | 'expired';
}

interface Parent {
    id: number;
    name: string;
    email: string;
    pivot: {
        relationship_type: string;
        emergency_contact: string;
        notes?: string;
    };
}



interface GradingPeriod {
    id: number;
    name: string;
    code: string;
    start_date: string;
    end_date: string;
    sort_order: number;
    is_active: boolean;
}

interface ShowProps {
    user: User;
    student: {
        id: number;
        name: string;
        email: string;
        student_number?: string;
        parents?: Parent[];
    };
    subject: {
        id: number;
        name: string;
        code: string;
        course?: {
            id: number;
            name: string;
            code: string;
        };
    };
    academicLevel: {
        id: number;
        name: string;
        key: string;
    };
    grades: StudentGrade[];
    gradingPeriods: GradingPeriod[];
}

export default function Show({ user, student, subject, academicLevel, grades, gradingPeriods }: ShowProps) {
    const latestGrade = grades.length > 0 ? grades[0] : null;
    
    const getGradeColor = (grade: number, academicLevelKey?: string) => {
        // College grading system: 1.0 (highest) to 5.0 (lowest), 3.0 is passing
        if (academicLevelKey === 'college') {
            if (grade <= 1.5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            if (grade <= 2.5) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            if (grade <= 3.0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        }
        
        // Elementary to Senior High grading system: 75 (passing) to 100 (highest)
        if (grade >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        if (grade >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        if (grade >= 75) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    };

    const getGradeStatus = (grade: number, academicLevelKey?: string) => {
        if (academicLevelKey === 'college') {
            // College grading system: 1.0 (highest) to 5.0 (lowest)
            if (grade <= 1.5) return 'Superior';
            if (grade <= 2.0) return 'Very Good';
            if (grade <= 2.5) return 'Good';
            if (grade <= 3.0) return 'Satisfactory';
            return 'Failing';
        }
        
        // Elementary to Senior High grading system: 75 (passing) to 100 (highest)
        if (grade >= 95) return 'Outstanding';
        if (grade >= 90) return 'Very Good';
        if (grade >= 85) return 'Good';
        if (grade >= 80) return 'Satisfactory';
        if (grade >= 75) return 'Fair';
        return 'Failing';
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
                            <div className="flex items-center gap-4">
                                <Link href={route('teacher.grades.index')}>
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Grades
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        Student Details
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        View and manage grades for {student.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Student Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                            <p className="font-medium">{student.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Student ID</p>
                                            <p className="font-medium">{student.student_number || student.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="font-medium">{student.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Linked Parents */}
                        {student.parents && student.parents.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Linked Parents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {student.parents.map((parent) => (
                                            <div key={parent.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                                {parent.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {parent.email}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline">
                                                            {parent.pivot.relationship_type.charAt(0).toUpperCase() + parent.pivot.relationship_type.slice(1)}
                                                        </Badge>
                                                    </div>
                                                    {parent.pivot.emergency_contact && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Emergency Contact: {parent.pivot.emergency_contact}
                                                        </p>
                                                    )}
                                                    {parent.pivot.notes && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Notes: {parent.pivot.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Subject Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Subject & Course Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                            <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                                            <p className="font-medium">{subject.name} ({subject.code})</p>
                                        </div>
                                    </div>
                                    {subject.course && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                                                <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Course</p>
                                                <p className="font-medium">{subject.course.name} ({subject.course.code})</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                            <GraduationCap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Academic Level</p>
                                            <p className="font-medium">{academicLevel.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">School Year</p>
                                            <p className="font-medium">{latestGrade?.school_year || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Grading Periods Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Grading Periods
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Available grading periods for {academicLevel.name}
                                </p>
                            </CardHeader>
                            <CardContent>
                                {gradingPeriods.length > 0 ? (
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {gradingPeriods.map((period) => (
                                            <div key={period.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                        {period.name}
                                                    </h4>
                                                    <Badge variant="outline" className="text-xs">
                                                        {period.code}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                                                </p>
                                                <div className="mt-2">
                                                    <Badge className={period.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}>
                                                        {period.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500 dark:text-gray-400">
                                            No grading periods configured for {academicLevel.name}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Current Grade Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Current Grade Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {latestGrade ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Latest Grade</p>
                                            <Badge className={`text-2xl px-6 py-3 ${getGradeColor(latestGrade.grade, academicLevel.key)}`}>
                                                {latestGrade.grade}
                                            </Badge>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Status</p>
                                            <p className={`text-lg font-medium ${
                                                ['Superior', 'Very Good', 'Good', 'Satisfactory', 'Fair', 'Outstanding'].includes(getGradeStatus(latestGrade.grade, academicLevel.key))
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {getGradeStatus(latestGrade.grade, academicLevel.key)}
                                            </p>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Last Updated</p>
                                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {new Date(latestGrade.updated_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            No Grade Yet
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            This student hasn't received a grade for this subject yet.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Grade History */}
                        {grades.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Grade History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-800 text-white">
                                                    <th className="text-left p-3 font-medium border-r border-gray-700">Student ID</th>
                                                    <th className="text-left p-3 font-medium border-r border-gray-700">Subject</th>
                                                    <th className="text-left p-3 font-medium border-r border-gray-700">Faculty</th>
                                                    {gradingPeriods
                                                        .filter(period => !period.name.toLowerCase().includes('final average') && !period.code.includes('FA'))
                                                        .map((period) => (
                                                        <th key={period.id} className="text-left p-3 font-medium border-r border-gray-700">
                                                            {period.name}
                                                        </th>
                                                    ))}
                                                    <th className="text-left p-3 font-medium border-r border-gray-700">AVERAGE</th>
                                                    <th className="text-left p-3 font-medium border-r border-gray-700">Grade Status</th>
                                                    <th className="text-left p-3 font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Since this is a single student view, we'll create one row with all grades mapped to periods */}
                                                <tr className="border-b bg-gray-100 dark:bg-gray-800">
                                                    <td className="p-3 border-r border-gray-200 dark:border-gray-600 font-medium">
                                                        {student.student_number || student.id}
                                                    </td>
                                                    <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {subject.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {subject.code}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 border-r border-gray-200 dark:border-gray-600">
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {user.name}
                                                        </p>
                                                    </td>
                                                    {gradingPeriods
                                                        .filter(period => !period.name.toLowerCase().includes('final average') && !period.code.includes('FA'))
                                                        .map((period) => {
                                                        // Find the grade for this specific period
                                                        const gradeForPeriod = grades.find(g => {
                                                            // Check if the grade has a grading period and it matches
                                                            if (g.gradingPeriod && g.gradingPeriod.id === period.id) {
                                                                return true;
                                                            }
                                                            // Also check the direct grading_period_id field as fallback
                                                            if (g.grading_period_id === period.id) {
                                                                return true;
                                                            }
                                                            return false;
                                                        });

                                                        const gradeValue = gradeForPeriod ? gradeForPeriod.grade : null;

                                                        return (
                                                            <td key={period.id} className="p-3 border-r border-gray-200 dark:border-gray-600 text-center">
                                                                {gradeValue ? (
                                                                    <Badge className={getGradeColor(gradeValue, academicLevel.key)}>
                                                                        {gradeValue}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-3 border-r border-gray-200 dark:border-gray-600 text-center">
                                                        {(() => {
                                                            const validGrades = grades.map(g => g.grade).filter(g => g !== null);
                                                            const average = validGrades.length > 0
                                                                ? validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length
                                                                : 0;

                                                            return average > 0 ? (
                                                                <Badge className={`text-lg px-3 py-1 ${getGradeColor(average, academicLevel.key)}`}>
                                                                    {average.toFixed(1)}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="p-3 border-r border-gray-200 dark:border-gray-600 text-center">
                                                        {(() => {
                                                            const validGrades = grades.map(g => g.grade).filter(g => g !== null);
                                                            const average = validGrades.length > 0
                                                                ? validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length
                                                                : 0;

                                                            return average > 0 ? (
                                                                <span className={`text-sm font-medium ${
                                                                    ['Superior', 'Very Good', 'Good', 'Satisfactory', 'Fair', 'Outstanding'].includes(getGradeStatus(average, academicLevel.key))
                                                                        ? 'text-green-600 dark:text-green-400'
                                                                        : 'text-red-600 dark:text-red-400'
                                                                }`}>
                                                                    {getGradeStatus(average, academicLevel.key)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">No Grade</span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="p-3 border-r border-gray-200 dark:border-gray-600 text-center">
                                                        <div className="flex justify-center gap-2 items-center">
                                                            {/* Show countdown badge if less than 3 days remaining */}
                                                            {grades.length > 0 && grades[0].is_editable && grades[0].days_remaining !== undefined && grades[0].days_remaining < 3 && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {grades[0].days_remaining} {grades[0].days_remaining === 1 ? 'day' : 'days'} left
                                                                </Badge>
                                                            )}
                                                            {/* Show edit button only if editable */}
                                                            {grades.length > 0 && grades[0].is_editable && (
                                                                <Link href={route('teacher.grades.edit', grades[0].id)}>
                                                                    <Button size="sm" variant="outline">
                                                                        <EditIcon className="h-4 w-4 mr-2" />
                                                                        Edit
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {/* Show lock icon if not editable */}
                                                            {grades.length > 0 && !grades[0].is_editable && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {grades[0].edit_status === 'locked' ? '🔒 Locked' : '⏰ Expired'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex gap-4 flex-col sm:flex-row">
                                    <Link href={route('teacher.grades.create')} className="flex-1">
                                        <Button className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Input New Grade
                                        </Button>
                                    </Link>
                                    {latestGrade && latestGrade.is_editable && (
                                        <div className="flex-1 flex flex-col gap-2">
                                            <Link href={route('teacher.grades.edit', latestGrade.id)} className="w-full">
                                                <Button variant="outline" className="w-full">
                                                    <EditIcon className="h-4 w-4 mr-2" />
                                                    Edit Current Grade
                                                </Button>
                                            </Link>
                                            {latestGrade.days_remaining !== undefined && latestGrade.days_remaining < 3 && (
                                                <p className="text-xs text-center text-muted-foreground">
                                                    ⏰ Editable for {latestGrade.days_remaining} more {latestGrade.days_remaining === 1 ? 'day' : 'days'}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {latestGrade && !latestGrade.is_editable && (
                                        <div className="flex-1">
                                            <Button variant="outline" className="w-full" disabled>
                                                {latestGrade.edit_status === 'locked' ? '🔒 Grade Locked' : '⏰ Edit Window Expired'}
                                            </Button>
                                            <p className="text-xs text-center text-muted-foreground mt-2">
                                                {latestGrade.edit_status === 'locked'
                                                    ? 'Grade submitted for validation'
                                                    : '5-day edit period has ended'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
