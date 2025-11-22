import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit as EditIcon, Plus, User, BookOpen, Calendar, Award, GraduationCap, Mail } from 'lucide-react';
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
    type?: string;
    period_type?: string;
    parent_id?: number | null;
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
    academicLevel: AcademicLevel;
    grades: Grade[];
    gradingPeriods: GradingPeriod[];
}

interface TableGradingPeriod {
    id: number;
    name: string;
    code: string;
    gradingPeriodId: number;
}

export default function ShowStudent({ user, student, subject, academicLevel, grades, gradingPeriods }: ShowStudentProps) {
    // Enhanced debug logging
    console.log('🔍 [COMPONENT INIT] ShowStudent Component Loaded');
    console.log('🔍 [COMPONENT INIT] Student:', { id: student.id, name: student.name, student_number: student.student_number });
    console.log('🔍 [COMPONENT INIT] Subject:', { id: subject.id, name: subject.name, code: subject.code });
    console.log('🔍 [COMPONENT INIT] Academic Level:', { id: academicLevel.id, name: academicLevel.name, key: academicLevel.key });
    console.log('🔍 [COMPONENT INIT] Grades:', {
        count: grades.length,
        grades: grades.map(g => ({
            id: g.id,
            grade: g.grade,
            grading_period_id: g.grading_period_id,
            period_name: g.gradingPeriod?.name,
            period_parent_id: g.gradingPeriod?.parent_id,
            school_year: g.school_year
        }))
    });
    console.log('🔍 [COMPONENT INIT] Grading Periods:', {
        count: gradingPeriods.length,
        periods: gradingPeriods.map(p => ({
            id: p.id,
            name: p.name,
            code: p.code,
            parent_id: p.parent_id,
            type: p.type,
            period_type: p.period_type,
            is_active: p.is_active
        }))
    });

    const getGradeColor = (grade: number, academicLevelKey: string) => {
        // College uses 1.0-5.0 GPA scale (1.0 is highest, 5.0 is lowest, 3.0 is passing)
        if (academicLevelKey === 'college') {
            if (grade <= 1.5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            if (grade <= 2.5) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            if (grade <= 3.0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        } else {
            // SHS, Elementary, and JHS use 75-100 percentage scale
            if (grade >= 95) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            if (grade >= 90) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            if (grade >= 85) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            if (grade >= 75) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        }
    };

    const getGradeStatus = (grade: number, academicLevelKey: string) => {
        // College uses 1.0-5.0 GPA scale (1.0 is highest, 5.0 is lowest, 3.0 is passing)
        if (academicLevelKey === 'college') {
            if (grade <= 1.5) return 'Superior';
            if (grade <= 2.0) return 'Very Good';
            if (grade <= 2.5) return 'Good';
            if (grade <= 3.0) return 'Satisfactory';
            return 'Not Qualified';
        } else {
            // SHS, Elementary, and JHS use 75-100 percentage scale
            if (grade >= 95) return 'Outstanding';
            if (grade >= 90) return 'Very Good';
            if (grade >= 85) return 'Good';
            if (grade >= 80) return 'Satisfactory';
            if (grade >= 75) return 'Fair';
            return 'Not Qualified';
        }
    };

    const latestGrade = grades.length > 0 ? grades[0] : null;
    const academicLevelKey = academicLevel.key;
    const academicLevelName = academicLevel.name;
    
    // Create semester-based grading period structure
    const getSemesterStructure = () => {
        console.log('🔍 DEBUG - getSemesterStructure called with:', {
            academicLevelKey,
            allGradingPeriods: gradingPeriods.map(p => ({ id: p.id, name: p.name, code: p.code }))
        });

        // Trust the backend data - it already filters by academic level
        // Use all provided grading periods (they're already filtered by the controller)
        let relevantPeriods = gradingPeriods.filter(period => period.is_active !== false);

        // If no periods available, use all periods as fallback
        if (relevantPeriods.length === 0) {
            console.log('🔍 No active periods found, using all provided periods as fallback');
            relevantPeriods = [...gradingPeriods];
        }

        console.log('🔍 DEBUG - Relevant periods (trusting backend):', relevantPeriods.map(p => ({ id: p.id, name: p.name, code: p.code })));

        // Check if this is a semester-based system (Senior High/College)
        const isSemesterBased = ['senior_highschool', 'college'].includes(academicLevelKey);

        if (isSemesterBased) {
            // Group periods by parent_id (semester)
            const semesters: any = {};
            const periodsWithoutParent: any[] = [];

            // First, identify all parent semesters
            const parentSemesters = relevantPeriods.filter(p => p.parent_id === null && p.type === 'semester');

            console.log('🔍 [FIXED] Parent semesters found:', parentSemesters.map(p => ({ id: p.id, name: p.name })));

            // Group child periods by their parent_id
            relevantPeriods.forEach(period => {
                // Skip parent semesters themselves
                if (period.parent_id === null && period.type === 'semester') {
                    console.log(`🔍 [FIXED] Skipping parent semester: "${period.name}"`);
                    return;
                }

                // Skip final/average periods
                const isFinalAverage = period.period_type === 'final' ||
                                      period.name.toLowerCase().includes('average') ||
                                      period.name.toLowerCase().includes('final');
                if (isFinalAverage) {
                    console.log(`🔍 [FIXED] Skipping final/average period: "${period.name}"`);
                    return;
                }

                // Find the parent semester for this period
                const parentId = period.parent_id;

                // FIX: Handle periods without parent_id
                if (!parentId) {
                    console.log(`✅ [FIXED] Period "${period.name}" has no parent_id, adding to flat list`);
                    periodsWithoutParent.push({
                        id: period.id,
                        name: period.name,
                        code: period.code,
                        gradingPeriodId: period.id,
                        originalPeriod: period
                    });
                    return;
                }

                const parentSemester = parentSemesters.find(p => p.id === parentId);
                if (!parentSemester) {
                    console.log(`⚠️ [FIXED] No parent semester found for period "${period.name}" (parent_id: ${parentId}), adding to flat list`);
                    periodsWithoutParent.push({
                        id: period.id,
                        name: period.name,
                        code: period.code,
                        gradingPeriodId: period.id,
                        originalPeriod: period
                    });
                    return;
                }

                // Determine semester number based on parent
                const semesterNum = parentSemesters.findIndex(p => p.id === parentId) + 1;

                console.log(`🔍 [FIXED] Period "${period.name}" (${period.code}) assigned to Semester ${semesterNum} (parent: ${parentSemester.name})`);

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

            console.log(`🔍 [FIXED] Periods without parent: ${periodsWithoutParent.length}`, periodsWithoutParent.map(p => ({ id: p.id, name: p.name })));

            let result = Object.keys(semesters).map(semNum => ({
                semesterNumber: parseInt(semNum),
                ...semesters[semNum]
            }));

            // FIX: If we have periods without parent, group them into semesters
            if (periodsWithoutParent.length > 0) {
                console.log(`✅ [FIXED] Creating semester structure from ${periodsWithoutParent.length} flat periods`);

                // If no hierarchical structure exists at all, create it from flat periods
                if (result.length === 0 || result.every(sem => sem.periods.length === 0)) {
                    console.log(`✅ [FIXED] No hierarchical structure, creating from flat periods`);

                    // Split periods into semesters based on their names/codes or evenly
                    const firstSemPeriods = periodsWithoutParent.filter(p =>
                        p.name.toLowerCase().includes('first') ||
                        p.code.toLowerCase().includes('1') ||
                        p.code.toLowerCase().includes('q1') ||
                        p.code.toLowerCase().includes('q2')
                    );
                    const secondSemPeriods = periodsWithoutParent.filter(p =>
                        p.name.toLowerCase().includes('second') ||
                        p.code.toLowerCase().includes('2') ||
                        p.code.toLowerCase().includes('q3') ||
                        p.code.toLowerCase().includes('q4')
                    );

                    // If can't determine from names, split evenly
                    if (firstSemPeriods.length === 0 && secondSemPeriods.length === 0) {
                        const mid = Math.ceil(periodsWithoutParent.length / 2);
                        result = [];
                        if (periodsWithoutParent.length > 1) {
                            result.push({
                                semesterNumber: 1,
                                name: 'First Semester',
                                periods: periodsWithoutParent.slice(0, mid)
                            });
                            result.push({
                                semesterNumber: 2,
                                name: 'Second Semester',
                                periods: periodsWithoutParent.slice(mid)
                            });
                        } else {
                            result.push({
                                semesterNumber: 1,
                                name: 'Semester',
                                periods: periodsWithoutParent
                            });
                        }
                    } else {
                        result = [];
                        if (firstSemPeriods.length > 0) {
                            result.push({
                                semesterNumber: 1,
                                name: 'First Semester',
                                periods: firstSemPeriods
                            });
                        }
                        if (secondSemPeriods.length > 0) {
                            result.push({
                                semesterNumber: 2,
                                name: 'Second Semester',
                                periods: secondSemPeriods
                            });
                        }
                    }

                    console.log(`✅ [FIXED] Created structure:`, result.map(s => ({
                        semester: s.name,
                        periodCount: s.periods.length,
                        periods: s.periods.map(p => p.name)
                    })));
                } else {
                    // Add orphan periods to existing structure
                    console.log(`✅ [FIXED] Adding ${periodsWithoutParent.length} orphan periods to existing structure`);
                    if (result.length > 0) {
                        result[0].periods.push(...periodsWithoutParent);
                    }
                }
            }

            let finalResult = result;

            // If still no periods after all fixes, create final fallback structure
            if (finalResult.length === 0 || finalResult.every(sem => sem.periods.length === 0)) {
                console.log('⚠️ [FIXED] No periods in structure after fixes, creating final fallback');
                const allInputPeriods = relevantPeriods.filter(period => {
                    const periodName = period.name.toLowerCase();
                    const isParentSemester = (period.parent_id === null && period.type === 'semester') ||
                                            periodName === 'first semester' ||
                                            periodName === 'second semester';
                    const isFinalAverage = period.name.toLowerCase().includes('final average') ||
                                          period.name.toLowerCase().includes('final') ||
                                          period.code.includes('FA') ||
                                          period.code.toLowerCase().includes('_fa');
                    return !isParentSemester && !isFinalAverage;
                });

                console.log('🔍 [FIXED] All input periods for final fallback:', allInputPeriods.map(p => ({ id: p.id, name: p.name, code: p.code, parent_id: p.parent_id })));

                if (allInputPeriods.length > 0) {
                    // For semester-based systems, create meaningful semester grouping
                    if (allInputPeriods.length >= 2) {
                        // Split periods roughly in half for two semesters
                        const mid = Math.ceil(allInputPeriods.length / 2);
                        finalResult = [
                            {
                                semesterNumber: 1,
                                name: 'First Semester',
                                periods: allInputPeriods.slice(0, mid).map(period => ({
                                    id: period.id,
                                    name: period.name,
                                    code: period.code,
                                    gradingPeriodId: period.id
                                }))
                            },
                            {
                                semesterNumber: 2,
                                name: 'Second Semester',
                                periods: allInputPeriods.slice(mid).map(period => ({
                                    id: period.id,
                                    name: period.name,
                                    code: period.code,
                                    gradingPeriodId: period.id
                                }))
                            }
                        ].filter(sem => sem.periods.length > 0);
                    } else {
                        // Single semester fallback
                        finalResult = [
                            {
                                semesterNumber: 1,
                                name: 'Semester',
                                periods: allInputPeriods.map(period => ({
                                    id: period.id,
                                    name: period.name,
                                    code: period.code,
                                    gradingPeriodId: period.id
                                }))
                            }
                        ];
                    }
                }
            }

            console.log('✅ [FIXED] Final semester structure (semester-based):', finalResult.map(s => ({
                semester: s.name,
                semesterNum: s.semesterNumber,
                periodCount: s.periods.length,
                periods: s.periods.map(p => ({ id: p.id, name: p.name, gradingPeriodId: p.gradingPeriodId }))
            })));

            return finalResult;
        } else {
            // Quarter-based system (Elementary/Junior High)
            const quarterStructure = [{
                semesterNumber: 1,
                name: 'Academic Year',
                periods: relevantPeriods
                    .filter(period => {
                        const periodName = period.name.toLowerCase();
                        const isParentSemester = periodName === 'first semester' || periodName === 'second semester';
                        const isFinalAverage = period.name.toLowerCase().includes('final average') ||
                                              period.code.includes('FA') ||
                                              period.code.toLowerCase().includes('_fa');
                        return !isParentSemester && !isFinalAverage;
                    })
                    .sort((a, b) => a.id - b.id)
                    .map(period => ({
                        id: period.id,
                        name: period.name,
                        code: period.code,
                        gradingPeriodId: period.id
                    }))
            }];
            console.log('🔍 Final quarter structure:', quarterStructure);
            return quarterStructure;
        }
    };

    const semesterStructure = getSemesterStructure();

    // Debug logging to identify the issue
    console.log('🔍 DEBUG - ShowStudent component data:', {
        academicLevelKey,
        academicLevel,
        gradingPeriods: gradingPeriods.map(p => ({ id: p.id, name: p.name, code: p.code })),
        semesterStructure,
        totalGradingPeriods: gradingPeriods.length,
        semesterStructureLength: semesterStructure.length,
        totalPeriodsInStructure: semesterStructure.reduce((total, sem) => total + sem.periods.length, 0)
    });

    // Calculate semester averages and overall average
    // For SHS/College: Each semester average = (Midterm + Pre-Final) / 2
    // Overall average = (Semester 1 Average + Semester 2 Average) / 2
    const calculateSemesterAverages = () => {
        console.log('🔍 [CALCULATION] ========== CALCULATING SEMESTER AVERAGES ==========');
        console.log('🔍 [CALCULATION] Academic Level:', academicLevelKey);
        console.log('🔍 [CALCULATION] Total Grades:', grades.length);
        console.log('🔍 [CALCULATION] Grades Data:', grades.map(g => ({
            id: g.id,
            grade: g.grade,
            period_id: g.grading_period_id,
            period_name: g.gradingPeriod?.name,
            period_parent_id: g.gradingPeriod?.parent_id
        })));

        const isSemesterBased = ['college', 'senior_highschool'].includes(academicLevelKey);
        console.log('🔍 [CALCULATION] Is Semester Based:', isSemesterBased);

        if (!isSemesterBased) {
            // For Elementary and Junior High, use simple average of all valid grades
            const validGrades = grades
                .filter(g => g.grade !== null && g.grade !== undefined)
                .map(g => g.grade);

            console.log('🔍 [CALCULATION] Valid Grades (Elementary/JHS):', validGrades);

            if (validGrades.length > 0) {
                const avg = validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;
                console.log('🔍 [CALCULATION] Overall Average (Elementary/JHS):', avg);
                return {
                    semester1Average: null,
                    semester2Average: null,
                    overallAverage: avg
                };
            }
            console.log('🔍 [CALCULATION] No valid grades found');
            return { semester1Average: null, semester2Average: null, overallAverage: null };
        }

        // Calculate semester averages using parent_id
        // First, get all parent semesters from gradingPeriods
        const parentSemesters = gradingPeriods.filter(p => p.parent_id === null && p.type === 'semester');

        console.log('🔍 [CALCULATION] Parent semesters found:', parentSemesters.map(p => ({ id: p.id, name: p.name })));

        // Calculate average for each semester
        const semesterAverages: { [key: number]: number | null } = {};

        parentSemesters.forEach(parentSemester => {
            console.log(`🔍 [CALCULATION] Processing semester: "${parentSemester.name}" (ID: ${parentSemester.id})`);

            // Get all grades for this semester (where grading_period.parent_id = parentSemester.id)
            const semesterGrades = grades.filter(g => {
                // Check if this grade's period is a child of this parent semester
                const gradingPeriod = gradingPeriods.find(gp => gp.id === g.grading_period_id);
                const isChild = gradingPeriod && gradingPeriod.parent_id === parentSemester.id;
                const notFinal = gradingPeriod && gradingPeriod.period_type !== 'final';
                const hasGrade = g.grade !== null && g.grade !== undefined;

                console.log(`🔍 [CALCULATION]   Grade ID ${g.id}: period=${g.grading_period_id}, isChild=${isChild}, notFinal=${notFinal}, hasGrade=${hasGrade}, grade=${g.grade}`);

                return isChild && notFinal && hasGrade;
            });

            console.log(`🔍 [CALCULATION] Found ${semesterGrades.length} grades for semester "${parentSemester.name}":`, semesterGrades.map(g => ({ id: g.id, grade: g.grade, period: g.gradingPeriod?.name })));

            if (semesterGrades.length > 0) {
                // Calculate sum and count
                const gradeSum = semesterGrades.reduce((sum, g) => sum + parseFloat(g.grade.toString()), 0);
                const gradeCount = semesterGrades.length;
                const avg = gradeSum / gradeCount;

                semesterAverages[parentSemester.id] = avg;
                console.log(`✅ [CALCULATION] Semester "${parentSemester.name}" (ID: ${parentSemester.id}):`, {
                    gradeCount,
                    gradeSum: gradeSum.toFixed(2),
                    average: avg.toFixed(2),
                    grades: semesterGrades.map(g => g.grade),
                    calculation: `${semesterGrades.map(g => g.grade).join(' + ')} = ${gradeSum.toFixed(2)}, divided by ${gradeCount} = ${avg.toFixed(2)}`
                });
            } else {
                semesterAverages[parentSemester.id] = null;
                console.log(`⚠️ [CALCULATION] Semester "${parentSemester.name}" (ID: ${parentSemester.id}) has NO GRADES`);
            }
        });

        // Extract semester1 and semester2 averages
        const semester1Average = parentSemesters[0] ? semesterAverages[parentSemesters[0].id] : null;
        const semester2Average = parentSemesters[1] ? semesterAverages[parentSemesters[1].id] : null;

        console.log('🔍 [CALCULATION] Semester 1 Average:', semester1Average);
        console.log('🔍 [CALCULATION] Semester 2 Average:', semester2Average);

        // Calculate Overall Average from semester averages
        let overallAverage = null;
        const validSemesterAverages = Object.values(semesterAverages).filter((avg): avg is number => avg !== null);

        console.log('🔍 [CALCULATION] Valid Semester Averages:', validSemesterAverages);

        if (validSemesterAverages.length > 0) {
            const overallSum = validSemesterAverages.reduce((sum, avg) => sum + avg, 0);
            const overallCount = validSemesterAverages.length;
            overallAverage = overallSum / overallCount;
            console.log(`✅ [CALCULATION] Overall Average:`, {
                semesterAverages: validSemesterAverages.map(avg => avg.toFixed(2)),
                count: overallCount,
                sum: overallSum.toFixed(2),
                average: overallAverage.toFixed(2),
                calculation: `(${validSemesterAverages.map(avg => avg.toFixed(2)).join(' + ')}) / ${overallCount} = ${overallSum.toFixed(2)} / ${overallCount} = ${overallAverage.toFixed(2)}`
            });
        } else {
            console.log('⚠️ [CALCULATION] NO VALID SEMESTER AVERAGES FOUND - Overall Average is NULL');
        }

        console.log('🔍 [CALCULATION] Final Result:', {
            semester1Average,
            semester2Average,
            overallAverage,
            allSemesterAverages: semesterAverages
        });
        console.log('🔍 [CALCULATION] ========== END CALCULATION ==========');

        return { semester1Average, semester2Average, overallAverage };
    };

    const { semester1Average, semester2Average, overallAverage } = calculateSemesterAverages();
    const finalGrade = overallAverage;

    // Debug logging
    console.log('🔍 FINAL CALCULATION RESULT:', {
        grades: grades.map(g => ({
            id: g.id,
            grade: g.grade,
            period_id: g.grading_period_id,
            period_code: g.gradingPeriod?.code,
            period_name: g.gradingPeriod?.name
        })),
        semester1Average,
        semester2Average,
        overallAverage,
        finalGrade
    });

    // Calculate total available periods for summary
    const totalAvailablePeriods = semesterStructure.reduce((total, semester) => total + semester.periods.length, 0);



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

                            {/* Grade Summary Cards - Student Portal Style */}
                            <Card className="bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                        <Award className="h-5 w-5 text-gray-600" />
                                        Grade Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {(() => {
                                        const validGrades = grades.filter(g => g.grade !== null && g.grade !== undefined);

                                        if (validGrades.length > 0 || semesterStructure.length > 0) {
                                            // Use the calculated final grade instead of averaging all periods
                                            const average = finalGrade || 0;
                                            const status = average > 0 ? getGradeStatus(average, academicLevelKey) : 'No Grade';

                                            // Get all periods from semester structure
                                            const allPeriods = semesterStructure.flatMap(semester =>
                                                semester.periods.map((period: any) => ({
                                                    ...period,
                                                    semesterName: semester.name
                                                }))
                                            );

                                            // Color scheme for cards
                                            const cardColors = [
                                                'bg-blue-500 text-white',
                                                'bg-green-500 text-white',
                                                'bg-orange-500 text-white',
                                                'bg-purple-500 text-white',
                                                'bg-pink-500 text-white',
                                                'bg-indigo-500 text-white'
                                            ];

                                            // Add debug logging for grade matching
                                            console.log('🔍 [GRADE MATCHING] Attempting to match grades to periods', {
                                                allPeriodsCount: allPeriods.length,
                                                allPeriods: allPeriods.map(p => ({ id: p.id, name: p.name, gradingPeriodId: p.gradingPeriodId })),
                                                gradesCount: grades.length,
                                                gradesPeriodIds: grades.map(g => ({ gradeId: g.id, periodId: g.grading_period_id, grade: g.grade }))
                                            });

                                            return (
                                                <div className="space-y-6">
                                                    {/* Individual Period Cards */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {allPeriods.map((period: any, index: number) => {
                                                            const grade = grades.find(g => g.grading_period_id === period.gradingPeriodId);

                                                            // Log each match attempt
                                                            if (!grade) {
                                                                console.log(`⚠️ [GRADE MATCHING] No grade found for period "${period.name}" (gradingPeriodId: ${period.gradingPeriodId})`);
                                                            } else {
                                                                console.log(`✅ [GRADE MATCHING] Grade found for period "${period.name}": ${grade.grade}`);
                                                            }

                                                            const colorClass = cardColors[index % cardColors.length];

                                                            return (
                                                                <div key={period.id} className={`${colorClass} rounded-lg p-4 text-center`}>
                                                                    <div className="text-3xl font-bold mb-1">
                                                                        {grade ? grade.grade : '-'}
                                                                    </div>
                                                                    <div className="text-sm opacity-90">
                                                                        {period.name}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Overall Average Card */}
                                                    <div className="flex justify-center">
                                                        <div className="bg-gray-100 rounded-lg p-6 text-center min-w-48">
                                                            <div className="text-4xl font-bold text-gray-800 mb-2">
                                                                {average > 0 ? average.toFixed(2) : '-'}
                                                            </div>
                                                            <div className="text-gray-600 mb-2">Overall Average</div>
                                                            {average > 0 && (
                                                                <Badge className={`${
                                                                    ['Superior', 'Very Good', 'Good', 'Satisfactory', 'Fair', 'Outstanding'].includes(status)
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {status}
                                                                </Badge>
                                                            )}
                                                        </div>
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

                            {/* Detailed Grades - Separate Tables for Each Semester */}
                            {(() => {
                                const isSemesterBased = ['senior_highschool', 'college'].includes(academicLevelKey);
                                const showSeparateTables = isSemesterBased && semesterStructure.length > 1;

                                if (showSeparateTables) {
                                    // Show separate table for each semester
                                    return semesterStructure.map((semester) => {
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
                                            <Card key={semester.semesterNumber} className="bg-white shadow-sm">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
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
                                                                            {student.student_number || student.id}
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
                                                                            <User className="h-4 w-4 mr-2 text-gray-400" />
                                                                            <div className="text-sm text-gray-600">{user.name}</div>
                                                                        </div>
                                                                    </td>
                                                                    {semester.periods.map((period: any) => {
                                                                        const grade = grades.find(g => g.grading_period_id === period.gradingPeriodId);

                                                                        // Log detailed matching for table
                                                                        if (!grade) {
                                                                            console.log(`⚠️ [TABLE] No grade for "${period.name}" (ID: ${period.gradingPeriodId}) - Available: [${grades.map(g => g.grading_period_id).join(', ')}]`);
                                                                        } else {
                                                                            console.log(`✅ [TABLE] Grade ${grade.grade} matched for "${period.name}" (ID: ${period.gradingPeriodId})`);
                                                                        }

                                                                        return (
                                                                            <td key={period.id} className="p-3 border-r border-gray-200 text-center">
                                                                                {grade ? (
                                                                                    <Badge className={getGradeColor(grade.grade, academicLevelKey)}>
                                                                                        {grade.grade}
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <span className="text-gray-400">-</span>
                                                                                )}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                    <td className="p-3 border-r border-gray-200 text-center">
                                                                        {semesterAvg ? (
                                                                            <Badge className={`text-lg px-3 py-1 ${getGradeColor(semesterAvg, academicLevelKey)}`}>
                                                                                {semesterAvg.toFixed(2)}
                                                                            </Badge>
                                                                        ) : (
                                                                            <span className="text-gray-400">-</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="p-3 text-center">
                                                                        {semesterAvg ? (
                                                                            (() => {
                                                                                const status = getGradeStatus(semesterAvg, academicLevelKey);
                                                                                return (
                                                                                    <Badge className={`${
                                                                                        ['Superior', 'Very Good', 'Good', 'Satisfactory', 'Fair', 'Outstanding'].includes(status)
                                                                                            ? 'bg-blue-100 text-blue-800'
                                                                                            : 'bg-red-100 text-red-800'
                                                                                    }`}>
                                                                                        {status}
                                                                                    </Badge>
                                                                                );
                                                                            })()
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
                                    });
                                } else {
                                    // Single table for non-semester based or single semester
                                    return (
                                        <Card className="bg-white shadow-sm">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                                    <Calendar className="h-5 w-5 text-gray-600" />
                                                    Detailed Grades
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
                                                                    {semesterStructure.flatMap(semester => semester.periods).map((period: any) => (
                                                                        <th key={period.id} className="text-center p-3 font-medium border-r border-gray-700">
                                                                            {period.name}
                                                                        </th>
                                                                    ))}
                                                                    <th className="text-center p-3 font-medium border-r border-gray-700">AVERAGE</th>
                                                                    <th className="text-center p-3 font-medium">Grade Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr className="border-b bg-white hover:bg-gray-50">
                                                                    <td className="p-3 border-r border-gray-200 font-medium">
                                                                        <div className="flex items-center">
                                                                            <User className="h-4 w-4 mr-2 text-gray-400" />
                                                                            {student.student_number || student.id}
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
                                                                            <User className="h-4 w-4 mr-2 text-gray-400" />
                                                                            <div className="text-sm text-gray-600">{user.name}</div>
                                                                        </div>
                                                                    </td>
                                                                    {semesterStructure.flatMap(semester => semester.periods).map((period: any) => {
                                                                        const grade = grades.find(g => g.grading_period_id === period.gradingPeriodId);
                                                                        return (
                                                                            <td key={period.id} className="p-3 border-r border-gray-200 text-center">
                                                                                {grade ? (
                                                                                    <Badge className={getGradeColor(grade.grade, academicLevelKey)}>
                                                                                        {grade.grade}
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <span className="text-gray-400">-</span>
                                                                                )}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                    <td className="p-3 border-r border-gray-200 text-center">
                                                                        {finalGrade ? (
                                                                            <Badge className={`text-lg px-3 py-1 ${getGradeColor(finalGrade, academicLevelKey)}`}>
                                                                                {finalGrade.toFixed(2)}
                                                                            </Badge>
                                                                        ) : (
                                                                            <span className="text-gray-400">-</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="p-3 text-center">
                                                                        {finalGrade ? (
                                                                            (() => {
                                                                                const status = getGradeStatus(finalGrade, academicLevelKey);
                                                                                return (
                                                                                    <Badge className={`${
                                                                                        ['Superior', 'Very Good', 'Good', 'Satisfactory', 'Fair', 'Outstanding'].includes(status)
                                                                                            ? 'bg-blue-100 text-blue-800'
                                                                                            : 'bg-red-100 text-red-800'
                                                                                    }`}>
                                                                                        {status}
                                                                                    </Badge>
                                                                                );
                                                                            })()
                                                                        ) : (
                                                                            <span className="text-gray-400">No Grade</span>
                                                                        )}
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
                                    );
                                }
                            })()}
                        </div>

                        {/* Action Buttons */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex gap-4">
                                    <Link href={route('teacher.grades.create', {
                                        student_id: student.id,
                                        subject_id: subject.id,
                                        academic_level_id: academicLevel.id,
                                        academic_level_key: academicLevelKey,
                                        school_year: latestGrade?.school_year || '2024-2025'
                                    })} className="flex-1">
                                        <Button className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Input New Grade
                                        </Button>
                                    </Link>
                                    {latestGrade && (
                                        <Link href={route('teacher.grades.edit', latestGrade.id)} className="flex-1">
                                            <Button variant="outline" className="w-full">
                                                <EditIcon className="h-4 w-4 mr-2" />
                                                Edit Current Grade
                                            </Button>
                                        </Link>
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
