import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Plus, User, BookOpen, Calendar, Award, GraduationCap, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '@/components/teacher/sidebar';
import { Header } from '@/components/teacher/header';

interface AcademicLevel {
    id: number;
    name: string;
    key: string;
}

interface GradingPeriod {
    id: number;
    name: string;
    code: string;
    start_date?: string;
    end_date?: string;
    is_active?: boolean;
}

interface Grade {
    id: number;
    grade: number;
    school_year: string;
    year_of_study?: number;
    grading_period_id?: number;
    gradingPeriod?: GradingPeriod;
    academicLevel: AcademicLevel;
    created_at: string;
    updated_at: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
    student_number?: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    course?: {
        id: number;
        name: string;
        code: string;
    };
}

interface ShowStudentProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
    student: Student;
    subject: Subject;
    grades: Grade[];
    gradingPeriods: GradingPeriod[];
}

interface TableGradingPeriod {
    id: number;
    name: string;
    code: string;
    gradingPeriodId: number;
}

export default function ShowStudent({ user, student, subject, grades, gradingPeriods }: ShowStudentProps) {
    // Debug logging
    console.log('ShowStudent props:', { user, student, subject, grades, gradingPeriods });
    
    const getGradeColor = (grade: number, academicLevelKey: string) => {
        if (academicLevelKey === 'college') {
            if (grade <= 1.5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            if (grade <= 2.5) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            if (grade <= 3.0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        } else {
            if (grade >= 95) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            if (grade >= 90) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            if (grade >= 85) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            if (grade >= 75) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        }
    };

    const getGradeStatus = (grade: number, academicLevelKey: string) => {
        if (academicLevelKey === 'college') {
            if (grade <= 1.5) return 'Outstanding';
            if (grade <= 2.0) return 'Superior';
            if (grade <= 2.5) return 'Very Good';
            if (grade <= 3.0) return 'Good';
            if (grade <= 4.0) return 'Satisfactory';
            return 'Failed';
        } else {
            if (grade >= 95) return 'Outstanding';
            if (grade >= 90) return 'Superior';
            if (grade >= 85) return 'Very Good';
            if (grade >= 80) return 'Good';
            if (grade >= 75) return 'Satisfactory';
            return 'Failed';
        }
    };

    const latestGrade = grades.length > 0 ? grades[0] : null;
    const academicLevelKey = latestGrade?.academicLevel?.key || 'senior_high';
    const academicLevelName = latestGrade?.academicLevel?.name || 'Senior High School';
    
    // Create dynamic grading period display based on what's actually available
    const getTableGradingPeriods = (): TableGradingPeriod[] => {
        // Filter grading periods to only show those relevant to the current subject's academic level
        const relevantGradingPeriods = gradingPeriods.filter(period => {
            const currentAcademicLevel = academicLevelKey; // e.g., 'senior_highschool'
            return period.code.toLowerCase().includes(currentAcademicLevel.toLowerCase());
        });
        
        // Sort by ID for consistent ordering
        return relevantGradingPeriods
            .sort((a, b) => a.id - b.id)
            .map((period) => ({
                id: period.id,
                name: period.name, // Use the actual name from database (e.g., "First Quarter", "Second Quarter")
                code: period.code, // Use the actual code from database (e.g., "Q1_senior_highschool")
                gradingPeriodId: period.id // Use the period ID directly
            }));
    };
    
    const tableGradingPeriods = getTableGradingPeriods();
    

    
    // Debug logging to see what's available
    console.log('ShowStudent component data:', {
        gradingPeriods: gradingPeriods.map(period => ({ id: period.id, name: period.name, code: period.code })),
        tableGradingPeriods: tableGradingPeriods.map(period => ({ 
            id: period.id, 
            name: period.name, 
            code: period.code, 
            gradingPeriodId: period.gradingPeriodId 
        })),
        availableQuarters: tableGradingPeriods.map(q => q.name),
        academicLevelKey: academicLevelKey,
        academicLevelName: academicLevelName,
        grades: grades.map(g => ({ 
            id: g.id, 
            grade: g.grade, 
            grading_period_id: g.grading_period_id,
            academicLevel: g.academicLevel?.key 
        }))
    });



    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
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
                                    <p className="text-gray-600 dark:text-gray-400">
                                        View and manage grades for {student.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content Cards */}
                        <div className="space-y-6">
                            {/* Personal Information Card */}
                            <Card className="bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                        <User className="h-5 w-5 text-gray-600" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Name</p>
                                            <p className="text-base font-semibold text-gray-900">{student.name}</p>
                                        </div>
                                    </div>
                                    {student.student_number && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                                <User className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Student ID</p>
                                                <p className="text-base font-semibold text-gray-900">{student.student_number}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                            <Mail className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Email</p>
                                            <p className="text-base font-semibold text-gray-900">{student.email}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Subject & Course Information Card */}
                            <Card className="bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                        <BookOpen className="h-5 w-5 text-gray-600" />
                                        Subject & Course Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                                <BookOpen className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Subject</p>
                                                <p className="text-base font-semibold text-gray-900">{subject.name} ({subject.code})</p>
                                            </div>
                                        </div>
                                        {subject.course && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                    <GraduationCap className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Course</p>
                                                    <p className="text-base font-semibold text-gray-900">{subject.course.name} ({subject.course.code})</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                                                <GraduationCap className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Academic Level</p>
                                                <p className="text-base font-semibold text-gray-900">{academicLevelName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                                                <Calendar className="h-5 w-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">School Year</p>
                                                <p className="text-base font-semibold text-gray-900">{latestGrade?.school_year || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Grading Periods Card */}
                            {gradingPeriods.length > 0 && (
                                <Card className="bg-white shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                            <Calendar className="h-5 w-5 text-gray-600" />
                                            Grading Periods
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Available grading periods for {academicLevelName}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {gradingPeriods
                                                .filter(period => {
                                                    const currentAcademicLevel = academicLevelKey;
                                                    return period.code.toLowerCase().includes(currentAcademicLevel.toLowerCase());
                                                })
                                                .map((period) => (
                                                    <div key={period.id} className="relative border rounded-lg p-4 bg-gray-50">
                                                        <div className="absolute top-2 right-2">
                                                            <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                                                                {period.code}
                                                            </Badge>
                                                        </div>
                                                        <h4 className="font-medium mb-2 text-gray-900">{period.name}</h4>
                                                        {period.start_date && period.end_date && (
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                        <Badge variant={period.is_active ? "default" : "secondary"} className="text-xs">
                                                            {period.is_active ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Current Grade Summary Card */}
                            <Card className="bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                        <Award className="h-5 w-5 text-gray-600" />
                                        Current Grade Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {(() => {
                                        // Calculate average grade across all grading periods
                                        const validGrades = grades
                                            .filter(g => g.grade !== null && g.grade !== undefined)
                                            .map(g => g.grade);
                                        
                                        if (validGrades.length > 0) {
                                            const average = validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;
                                            const status = getGradeStatus(average, academicLevelKey);
                                            
                                            return (
                                                <div className="grid gap-4 md:grid-cols-3">
                                                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                                                        <p className="text-sm font-medium text-gray-500 mb-2">Average Grade</p>
                                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg text-2xl font-bold ${getGradeColor(average, academicLevelKey)}`}>
                                                            {average.toFixed(1)}
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                                                        <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
                                                        <p className={`text-lg font-semibold ${
                                                            ['Superior', 'Very Good', 'Good', 'Satisfactory', 'Fair', 'Outstanding'].includes(status)
                                                                ? 'text-green-600' 
                                                                : 'text-red-600'
                                                        }`}>
                                                            {status}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                                                        <p className="text-sm font-medium text-gray-500 mb-2">Periods Graded</p>
                                                        <p className="text-lg font-semibold text-blue-600">
                                                            {validGrades.length} of {tableGradingPeriods.length}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="text-center py-8">
                                                    <div className="h-16 w-16 text-gray-400 mx-auto mb-4">📊</div>
                                                    <p className="text-gray-500">No grades recorded yet</p>
                                                </div>
                                            );
                                        }
                                    })()}
                                </CardContent>
                            </Card>

                            {/* Grade History Card */}
                            <Card className="bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                        <Calendar className="h-5 w-5 text-gray-600" />
                                        Grade History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {grades.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-800 text-white">
                                                        <th className="text-left p-3 font-medium border-r border-gray-700">Student ID</th>
                                                        <th className="text-left p-3 font-medium border-r border-gray-700">Subject</th>
                                                        <th className="text-left p-3 font-medium border-r border-gray-700">Faculty</th>
                                                        {tableGradingPeriods.map((period) => (
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
                                                    <tr className="border-b bg-gray-100 dark:bg-gray-800">
                                                        <td className="p-3 border-r border-gray-200 dark:border-gray-600 font-medium">
                                                            <span className="font-medium">{student.student_number || student.id}</span>
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
                                                        {tableGradingPeriods.map((period) => {
                                                            const grade = grades.find(g => g.grading_period_id === period.gradingPeriodId);
                                                            return (
                                                                <td key={period.id} className="p-3 border-r border-gray-200 dark:border-gray-600 text-center">
                                                                    {grade ? (
                                                                        <Badge className={getGradeColor(grade.grade, grade.academicLevel?.key || 'senior_high')}>
                                                                            {grade.grade}
                                                                        </Badge>
                                                                    ) : (
                                                                        <span className="text-gray-400">-</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="p-3 border-r border-gray-200 dark:border-gray-600 text-center">
                                                            {(() => {
                                                                // Calculate average grade across all grading periods
                                                                const validGrades = grades
                                                                    .filter(g => g.grade !== null && g.grade !== undefined)
                                                                    .map(g => g.grade);
                                                                
                                                                if (validGrades.length > 0) {
                                                                    const average = validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;
                                                                    return (
                                                                        <Badge className={`text-lg px-3 py-1 ${getGradeColor(average, academicLevelKey)}`}>
                                                                            {average.toFixed(1)}
                                                                        </Badge>
                                                                    );
                                                                } else {
                                                                    return <span className="text-gray-400">-</span>;
                                                                }
                                                            })()}
                                                        </td>
                                                        <td className="p-3 border-r border-gray-200 dark:border-gray-600 text-center">
                                                            {(() => {
                                                                // Calculate average grade across all grading periods for status
                                                                const validGrades = grades
                                                                    .filter(g => g.grade !== null && g.grade !== undefined)
                                                                    .map(g => g.grade);
                                                                
                                                                if (validGrades.length > 0) {
                                                                    const average = validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;
                                                                    const status = getGradeStatus(average, academicLevelKey);
                                                                    return (
                                                                        <span className={`text-sm font-medium ${
                                                                            ['Superior', 'Very Good', 'Good', 'Satisfactory', 'Fair', 'Outstanding'].includes(status)
                                                                                ? 'text-green-600 dark:text-green-400' 
                                                                                : 'text-red-600 dark:text-red-400'
                                                                        }`}>
                                                                            {status}
                                                                        </span>
                                                                    );
                                                                } else {
                                                                    return <span className="text-gray-400">No Grade</span>;
                                                                }
                                                            })()}
                                                        </td>
                                                        <td className="p-3 border-r border-gray-200 dark:border-gray-600 text-center">
                                                            <div className="flex justify-center gap-2">
                                                                {latestGrade && (
                                                                    <Link href={route('teacher.grades.edit', latestGrade.id)}>
                                                                        <Button size="sm" variant="outline">
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Edit
                                                                        </Button>
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="h-16 w-16 text-gray-400 mx-auto mb-4">📊</div>
                                            <p className="text-gray-500">No grade history available</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Link href={route('teacher.grades.create', { 
                                student_id: student.id, 
                                subject_id: subject.id,
                                academic_level_key: academicLevelKey 
                            })} className="flex-1">
                                <Button className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Input New Grade
                                </Button>
                            </Link>
                            {latestGrade && (
                                <Link href={route('teacher.grades.edit', latestGrade.id)} className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Current Grade
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
