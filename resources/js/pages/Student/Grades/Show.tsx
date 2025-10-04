import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student/layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, GraduationCap, User, Calendar, Award } from 'lucide-react';
import { Grade } from '@/types';

interface GradingPeriod {
    id: number;
    name: string;
    code: string;
    type?: string;
    period_type?: string;
    parent_id?: number | null;
    academic_level_id?: number;
    sort_order: number;
}

interface Teacher {
    id: number;
    name: string;
    role: string;
}

interface Props {
    user: {
        id: number;
        name: string;
        student_number?: string;
    };
    subject: {
        id: number;
        name: string;
        code: string;
        academic_level_id?: number;
    };
    grades: Grade[];
    gradingPeriods: GradingPeriod[];
    teacher?: Teacher | null;
}

export default function StudentSubjectGradesShow({ user, subject, grades, gradingPeriods, teacher }: Props) {
    // Determine if this is a semester-based system
    const academicLevelId = subject.academic_level_id || grades[0]?.academic_level_id;
    const isSemesterBased = gradingPeriods.some(p => p.type === 'semester');

    console.log('🔍 Student Grades Show - Data:', {
        subject,
        gradesCount: grades.length,
        grades: grades.map(g => ({ id: g.id, grade: g.grade, period_id: g.grading_period_id, period: g.gradingPeriod })),
        gradingPeriods: gradingPeriods.map(p => ({ id: p.id, name: p.name, parent_id: p.parent_id, type: p.type, period_type: p.period_type })),
        isSemesterBased
    });

    // Build semester structure
    const buildSemesterStructure = () => {
        if (!isSemesterBased) {
            // For non-semester based (Elementary/JHS), just list all periods
            const periods = gradingPeriods.filter(p => p.period_type !== 'final');
            return [{
                semesterNumber: 1,
                name: 'All Periods',
                periods: periods.map(p => ({
                    id: p.id,
                    name: p.name,
                    code: p.code,
                    gradingPeriodId: p.id
                }))
            }];
        }

        // For semester-based (SHS/College), group by parent
        const semesters: any = {};
        const parentSemesters = gradingPeriods.filter(p => p.parent_id === null && p.type === 'semester');

        console.log('🔍 Parent semesters for student view:', parentSemesters.map(p => ({ id: p.id, name: p.name })));

        gradingPeriods.forEach(period => {
            // Skip parent semesters themselves
            if (period.parent_id === null && period.type === 'semester') {
                return;
            }

            // Skip final/average periods
            const isFinalAverage = period.period_type === 'final' || period.name.toLowerCase().includes('average');
            if (isFinalAverage) {
                return;
            }

            // Find the parent semester for this period
            const parentId = period.parent_id;
            if (!parentId) {
                console.log(`⚠️ Period "${period.name}" has no parent_id, skipping`);
                return;
            }

            const parentSemester = parentSemesters.find(p => p.id === parentId);
            if (!parentSemester) {
                console.log(`⚠️ No parent semester found for period "${period.name}" (parent_id: ${parentId})`);
                return;
            }

            // Determine semester number based on parent
            const semesterNum = parentSemesters.findIndex(p => p.id === parentId) + 1;

            console.log(`🔍 Period "${period.name}" (${period.code}) assigned to Semester ${semesterNum} (parent: ${parentSemester.name})`);

            if (!semesters[semesterNum]) {
                semesters[semesterNum] = {
                    name: parentSemester.name,
                    periods: []
                };
            }

            semesters[semesterNum].periods.push({
                id: period.id,
                name: period.name,
                code: period.code,
                gradingPeriodId: period.id
            });
        });

        return Object.keys(semesters).map(semNum => ({
            semesterNumber: parseInt(semNum),
            ...semesters[semNum]
        })).sort((a, b) => a.semesterNumber - b.semesterNumber);
    };

    const semesterStructure = buildSemesterStructure();

    console.log('🔍 Semester structure:', semesterStructure);

    // Calculate semester averages and overall average
    const calculateAverages = () => {
        if (!isSemesterBased) {
            // For Elementary/JHS: simple average of all valid grades
            const validGrades = grades.filter(g => g.grade !== null && g.grade !== undefined);
            const overallAverage = validGrades.length > 0
                ? validGrades.reduce((sum, g) => sum + g.grade, 0) / validGrades.length
                : null;
            return { semester1Average: null, semester2Average: null, overallAverage };
        }

        // For SHS/College: Calculate semester averages using parent_id
        const parentSemesters = gradingPeriods.filter(p => p.parent_id === null && p.type === 'semester');
        const semesterAverages: { [key: number]: number | null } = {};

        parentSemesters.forEach(parentSemester => {
            // Get all grades for this semester (where grading_period.parent_id = parentSemester.id)
            const semesterGrades = grades.filter(g => {
                const gradingPeriod = gradingPeriods.find(gp => gp.id === g.grading_period_id);
                return gradingPeriod &&
                       gradingPeriod.parent_id === parentSemester.id &&
                       gradingPeriod.period_type !== 'final' &&
                       g.grade !== null &&
                       g.grade !== undefined;
            });

            if (semesterGrades.length > 0) {
                const avg = semesterGrades.reduce((sum, g) => sum + parseFloat(g.grade.toString()), 0) / semesterGrades.length;
                semesterAverages[parentSemester.id] = avg;
                console.log(`🔍 Semester "${parentSemester.name}" (ID: ${parentSemester.id}) average:`, avg, 'from', semesterGrades.length, 'grades');
            } else {
                semesterAverages[parentSemester.id] = null;
            }
        });

        const semester1Average = parentSemesters[0] ? semesterAverages[parentSemesters[0].id] : null;
        const semester2Average = parentSemesters[1] ? semesterAverages[parentSemesters[1].id] : null;

        // Calculate Overall Average from semester averages
        const validSemesterAverages = Object.values(semesterAverages).filter((avg): avg is number => avg !== null);
        const overallAverage = validSemesterAverages.length > 0
            ? validSemesterAverages.reduce((sum, avg) => sum + avg, 0) / validSemesterAverages.length
            : null;

        console.log('🔍 Student averages:', { semester1Average, semester2Average, overallAverage });

        return { semester1Average, semester2Average, overallAverage };
    };

    const { semester1Average, semester2Average, overallAverage } = calculateAverages();

    // Determine grade status
    const getGradeStatus = (averageGrade: number) => {
        // Check if SHS/College (academic_level_id 3=SHS, 4=College) - uses 1.0-5.0 scale
        if (isSemesterBased) {
            // SHS/College: 1.0-5.0 scale (lower is better, 3.0 is passing)
            if (averageGrade >= 1.0 && averageGrade <= 1.24) return 'Superior';
            if (averageGrade >= 1.25 && averageGrade <= 1.49) return 'Excellent';
            if (averageGrade >= 1.5 && averageGrade <= 1.74) return 'Very Good';
            if (averageGrade >= 1.75 && averageGrade <= 1.99) return 'Good';
            if (averageGrade >= 2.0 && averageGrade <= 2.24) return 'Satisfactory';
            if (averageGrade >= 2.25 && averageGrade <= 2.49) return 'Fair';
            if (averageGrade >= 2.5 && averageGrade <= 2.74) return 'Passing';
            if (averageGrade >= 2.75 && averageGrade <= 3.0) return 'Conditional';
            return 'Failed';
        } else {
            // Elementary/JHS: 0-100 scale (75 is passing)
            if (averageGrade >= 90) return 'Outstanding';
            if (averageGrade >= 85) return 'Very Satisfactory';
            if (averageGrade >= 80) return 'Satisfactory';
            if (averageGrade >= 75) return 'Fairly Satisfactory';
            return 'Did Not Meet Expectations';
        }
    };

    const getGradeColor = (grade: number) => {
        if (isSemesterBased) {
            // SHS/College: 1.0-5.0 scale
            if (grade >= 1.0 && grade <= 1.49) return 'bg-green-100 text-green-800 border-green-200';
            if (grade >= 1.5 && grade <= 1.99) return 'bg-blue-100 text-blue-800 border-blue-200';
            if (grade >= 2.0 && grade <= 2.49) return 'bg-purple-100 text-purple-800 border-purple-200';
            if (grade >= 2.5 && grade <= 2.99) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            return 'bg-red-100 text-red-800 border-red-200';
        } else {
            // Elementary/JHS: 0-100 scale
            if (grade >= 90) return 'bg-green-100 text-green-800 border-green-200';
            if (grade >= 85) return 'bg-blue-100 text-blue-800 border-blue-200';
            if (grade >= 80) return 'bg-purple-100 text-purple-800 border-purple-200';
            if (grade >= 75) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            return 'bg-red-100 text-red-800 border-red-200';
        }
    };

    const periodColors = [
        { bg: 'bg-blue-500', label: 'bg-blue-100 text-blue-800' },
        { bg: 'bg-green-500', label: 'bg-green-100 text-green-800' },
        { bg: 'bg-orange-500', label: 'bg-orange-100 text-orange-800' },
        { bg: 'bg-purple-500', label: 'bg-purple-100 text-purple-800' },
    ];

    return (
        <StudentLayout>
            <Head title={`${subject.name} • Grades`} />
            <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('student.grades.index')}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Back to Grades</span>
                        </Link>
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
                        <p className="text-gray-600">Subject Code: {subject.code}</p>
                    </div>
                </div>

                {/* Grade Summary Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Award className="h-5 w-5 text-blue-600" />
                            <span>Grade Summary</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {/* Display individual period grades */}
                            {semesterStructure.flatMap(semester =>
                                semester.periods.map((period: any, index: number) => {
                                    const grade = grades.find(g => g.grading_period_id === period.gradingPeriodId);
                                    const color = periodColors[index % periodColors.length];
                                    return (
                                        <div key={period.id} className={`text-center p-6 ${color.bg} text-white rounded-lg`}>
                                            <div className="text-4xl font-bold mb-2">
                                                {grade ? grade.grade : '—'}
                                            </div>
                                            <div className="text-sm opacity-90">{period.name}</div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Semester Averages for SHS/College */}
                        {isSemesterBased && (
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 mb-1">
                                        {semester1Average !== null ? semester1Average.toFixed(2) : '—'}
                                    </div>
                                    <div className="text-sm text-blue-600">First Semester</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                        {semester2Average !== null ? semester2Average.toFixed(2) : '—'}
                                    </div>
                                    <div className="text-sm text-green-600">Second Sem</div>
                                </div>
                            </div>
                        )}

                        {/* Overall Average */}
                        <div className="flex justify-center">
                            <div className="bg-gray-100 rounded-lg p-6 text-center min-w-48">
                                <div className="text-4xl font-bold text-gray-800 mb-2">
                                    {overallAverage !== null ? overallAverage.toFixed(2) : '—'}
                                </div>
                                <div className="text-gray-600 mb-2">Overall Average</div>
                                {overallAverage !== null && (
                                    <Badge className={getGradeColor(overallAverage)}>
                                        {getGradeStatus(overallAverage)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Grades Tables */}
                {isSemesterBased && semesterStructure.length > 1 ? (
                    // Show separate table for each semester
                    semesterStructure.map((semester) => {
                        if (semester.periods.length === 0) return null;

                        // Calculate semester average
                        const semesterGrades = semester.periods
                            .map((period: any) => {
                                const grade = grades.find(g => g.grading_period_id === period.gradingPeriodId);
                                return grade?.grade;
                            })
                            .filter((g): g is number => g !== undefined && g !== null);

                        const semesterAvg = semesterGrades.length > 0
                            ? semesterGrades.reduce((sum, g) => sum + g, 0) / semesterGrades.length
                            : null;

                        return (
                            <Card key={semester.semesterNumber}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-gray-600" />
                                        {semester.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-900 text-white">
                                                    <th className="p-2 border-r border-gray-600">Student ID</th>
                                                    <th className="p-2 border-r border-gray-600">Subject</th>
                                                    <th className="p-2 border-r border-gray-600">Faculty</th>
                                                    {semester.periods.map((period: any) => (
                                                        <th key={period.id} className="text-center p-2 border-r border-gray-600">
                                                            {period.name}
                                                        </th>
                                                    ))}
                                                    <th className="p-2 border-r border-gray-600">SEM{semester.semesterNumber} Average</th>
                                                    <th className="p-2">Grade Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b bg-white hover:bg-gray-50">
                                                    <td className="p-3 border-r border-gray-200 font-medium">
                                                        <div className="flex items-center">
                                                            <User className="h-4 w-4 mr-2 text-gray-400" />
                                                            {user.student_number || user.id}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 border-r border-gray-200">
                                                        <div className="flex items-center">
                                                            <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                                                            <div>
                                                                <div className="font-medium text-gray-900">{subject.name}</div>
                                                                <div className="text-sm text-gray-500">{subject.code}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 border-r border-gray-200">
                                                        <div className="flex items-center">
                                                            <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                                                            <div className="text-sm text-gray-600">{teacher ? teacher.name : 'N/A'}</div>
                                                        </div>
                                                    </td>
                                                    {semester.periods.map((period: any) => {
                                                        const grade = grades.find(g => g.grading_period_id === period.gradingPeriodId);
                                                        return (
                                                            <td key={period.id} className="p-3 border-r border-gray-200 text-center">
                                                                {grade ? (
                                                                    <Badge className={getGradeColor(grade.grade)}>
                                                                        {grade.grade}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-gray-400">—</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-3 border-r border-gray-200 text-center">
                                                        {semesterAvg ? (
                                                            <Badge className={`text-lg px-3 py-1 ${getGradeColor(semesterAvg)}`}>
                                                                {semesterAvg.toFixed(2)}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {semesterAvg ? (
                                                            <Badge className={getGradeColor(semesterAvg)}>
                                                                {getGradeStatus(semesterAvg)}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-gray-400">No Grade</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    // Single table for non-semester based or single semester
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-gray-600" />
                                Detailed Grades
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-900 text-white">
                                            <th className="p-2 border-r border-gray-600">Student ID</th>
                                            <th className="p-2 border-r border-gray-600">Subject</th>
                                            <th className="p-2 border-r border-gray-600">Faculty</th>
                                            {semesterStructure.flatMap(semester => semester.periods).map((period: any) => (
                                                <th key={period.id} className="text-center p-2 border-r border-gray-600">
                                                    {period.name}
                                                </th>
                                            ))}
                                            <th className="p-2 border-r border-gray-600">AVERAGE</th>
                                            <th className="p-2">Grade Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b bg-white hover:bg-gray-50">
                                            <td className="p-3 border-r border-gray-200 font-medium">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-2 text-gray-400" />
                                                    {user.student_number || user.id}
                                                </div>
                                            </td>
                                            <td className="p-3 border-r border-gray-200">
                                                <div className="flex items-center">
                                                    <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{subject.name}</div>
                                                        <div className="text-sm text-gray-500">{subject.code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 border-r border-gray-200">
                                                <div className="flex items-center">
                                                    <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                                                    <div className="text-sm text-gray-600">{teacher ? teacher.name : 'N/A'}</div>
                                                </div>
                                            </td>
                                            {semesterStructure.flatMap(semester => semester.periods).map((period: any) => {
                                                const grade = grades.find(g => g.grading_period_id === period.gradingPeriodId);
                                                return (
                                                    <td key={period.id} className="p-3 border-r border-gray-200 text-center">
                                                        {grade ? (
                                                            <Badge className={getGradeColor(grade.grade)}>
                                                                {grade.grade}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="p-3 border-r border-gray-200 text-center">
                                                {overallAverage ? (
                                                    <Badge className={`text-lg px-3 py-1 ${getGradeColor(overallAverage)}`}>
                                                        {overallAverage.toFixed(2)}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                {overallAverage ? (
                                                    <Badge className={getGradeColor(overallAverage)}>
                                                        {getGradeStatus(overallAverage)}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400">No Grade</span>
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StudentLayout>
    );
}
