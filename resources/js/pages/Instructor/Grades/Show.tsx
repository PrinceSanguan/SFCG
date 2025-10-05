import { Header } from '@/components/instructor/header';
import { Sidebar } from '@/components/instructor/sidebar';
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
    const academicLevelKey = academicLevel.key;
    
    const getGradeColor = (grade: number, academicLevelKey?: string) => {
        // SHS and College both use 1.0-5.0 scale (1.0 is highest, 5.0 is lowest, 3.0 is passing)
        if (academicLevelKey === 'college' || academicLevelKey === 'senior_highschool') {
            if (grade <= 1.5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            if (grade <= 2.5) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            if (grade <= 3.0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        }

        // Elementary and JHS use 75-100 scale
        if (grade >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        if (grade >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        if (grade >= 75) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    };

    const getGradeStatus = (grade: number, academicLevelKey?: string) => {
        // SHS and College both use 1.0-5.0 scale (1.0 is highest, 5.0 is lowest, 3.0 is passing)
        if (academicLevelKey === 'college' || academicLevelKey === 'senior_highschool') {
            if (grade <= 1.5) return 'Superior';
            if (grade <= 2.0) return 'Very Good';
            if (grade <= 2.5) return 'Good';
            if (grade <= 3.0) return 'Satisfactory';
            return 'Failing';
        }

        // Elementary and JHS use 75-100 scale
        if (grade >= 95) return 'Outstanding';
        if (grade >= 90) return 'Very Good';
        if (grade >= 85) return 'Good';
        if (grade >= 80) return 'Satisfactory';
        if (grade >= 75) return 'Fair';
        return 'Failing';
    };

    // Create semester-based grading period structure
    const getSemesterStructure = () => {
        console.log('🔍 DEBUG - getSemesterStructure called with:', {
            academicLevelKey,
            allGradingPeriods: gradingPeriods.map(p => ({ id: p.id, name: p.name, code: p.code }))
        });

        // Filter periods for current academic level (improved matching for admin-created periods)
        let relevantPeriods = gradingPeriods.filter(period => {
            const currentAcademicLevel = academicLevelKey;
            const periodName = period.name.toLowerCase();
            const periodCode = period.code.toLowerCase();

            // Check multiple patterns for academic level matching
            const levelPatterns = [
                currentAcademicLevel.toLowerCase(),
                currentAcademicLevel.toLowerCase().replace('_', ''),
                currentAcademicLevel.toLowerCase().replace('_', ' '),
            ];

            // For college, also check common variations
            if (currentAcademicLevel === 'college') {
                levelPatterns.push('tertiary', 'university', 'higher');
            }

            // For senior_highschool, also check variations
            if (currentAcademicLevel === 'senior_highschool') {
                levelPatterns.push('senior high', 'shs', 'senior_high', 'seniorhigh');
            }

            // Check if period matches any of the level patterns
            const isRelevant = levelPatterns.some(pattern =>
                periodCode.includes(pattern) || periodName.includes(pattern)
            );

            console.log(`🔍 Period "${period.name}" (${period.code}) relevant for ${currentAcademicLevel}:`, isRelevant);
            return isRelevant;
        });

        // If no level-specific periods found, use all active periods as fallback
        if (relevantPeriods.length === 0) {
            console.log('🔍 No level-specific periods found, using all active periods as fallback');
            relevantPeriods = gradingPeriods.filter(period => period.is_active);
        }

        console.log('🔍 DEBUG - Relevant periods after filtering:', relevantPeriods.map(p => ({ id: p.id, name: p.name, code: p.code })));

        // Check if this is a semester-based system (Senior High/College)
        const isSemesterBased = ['senior_highschool', 'college'].includes(academicLevelKey);

        if (isSemesterBased) {
            // Group periods by semester with improved detection
            const semesters: any = {};


            relevantPeriods.forEach(period => {
                // Enhanced semester detection logic for admin-created periods
                let semesterNum = 1;

                // Check various patterns for semester 2
                const periodName = period.name.toLowerCase();
                const periodCode = period.code.toLowerCase();

                // Comprehensive semester 2 detection patterns
                const semester2Patterns = [
                    's2', '2nd', 'second', '_s2', 'semester_2', 'sem_2', 'sem2',
                    '2nd semester', 'second semester', 'semester 2', 'sem 2',
                    '2nd sem', 'second sem', 'ii', ' 2 ', '_2_', '-2-',
                    'spring', 'winter' // some institutions use seasonal terms
                ];

                if (semester2Patterns.some(pattern =>
                    periodCode.includes(pattern) || periodName.includes(pattern)
                )) {
                    semesterNum = 2;
                }

                console.log(`🔍 Period "${period.name}" (${period.code}) assigned to Semester ${semesterNum}`);


                if (!semesters[semesterNum]) {
                    semesters[semesterNum] = {
                        name: `${semesterNum === 1 ? 'First' : 'Second'} Semester`,
                        periods: []
                    };
                }

                // Only include input periods (exclude calculated Final Average and parent semester containers)
                const isParentContainer = period.name.toLowerCase() === 'first semester' ||
                                          period.name.toLowerCase() === 'second semester' ||
                                          period.code.match(/^(COL|SHS|EL|JHS)_S[12]$/i);

                // Exclude Final Average but NOT Pre-Final
                const isFinalAverage = period.name.toLowerCase().includes('final average') ||
                                       period.code.includes('FA') ||
                                       (period.name.toLowerCase() === 'final' && !period.name.toLowerCase().includes('pre'));

                if (!isFinalAverage && !isParentContainer) {
                    semesters[semesterNum].periods.push({
                        id: period.id,
                        name: period.name,
                        code: period.code,
                        gradingPeriodId: period.id
                    });
                }
            });

            let result = Object.keys(semesters).map(semNum => ({
                semesterNumber: parseInt(semNum),
                ...semesters[semNum]
            }));

            // If no periods were grouped, create a fallback structure
            if (result.length === 0 || result.every(sem => sem.periods.length === 0)) {
                console.log('🔍 No periods grouped by semester, creating fallback structure');
                const allInputPeriods = relevantPeriods.filter(period =>
                    !period.name.toLowerCase().includes('final average') &&
                    !period.code.includes('FA') &&
                    !period.name.toLowerCase().includes('final') &&
                    !period.code.toLowerCase().includes('final')
                );

                console.log('🔍 All input periods for fallback:', allInputPeriods.map(p => ({ id: p.id, name: p.name, code: p.code })));

                if (allInputPeriods.length > 0) {
                    // For semester-based systems, create meaningful semester grouping
                    if (allInputPeriods.length >= 2) {
                        // Split periods roughly in half for two semesters
                        const mid = Math.ceil(allInputPeriods.length / 2);
                        result = [
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
                        result = [
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

            console.log('🔍 Final semester structure (semester-based):', result);
            return result;
        } else {
            // Quarter-based system (Elementary/Junior High)
            const quarterStructure = [{
                semesterNumber: 1,
                name: 'Academic Year',
                periods: relevantPeriods
                    .filter(period =>
                        !period.name.toLowerCase().includes('final average') &&
                        !period.code.includes('FA')
                    )
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
    console.log('🔍 DEBUG - Show component data:', {
        academicLevelKey,
        academicLevel,
        gradingPeriods: gradingPeriods.map(p => ({ id: p.id, name: p.name, code: p.code })),
        semesterStructure,
        totalGradingPeriods: gradingPeriods.length,
        semesterStructureLength: semesterStructure.length,
        totalPeriodsInStructure: semesterStructure.reduce((total, sem) => total + sem.periods.length, 0)
    });

    // Calculate semester averages and overall average
    // For SHS/College: Each semester average = average of all grades in that semester
    // Overall average = (Semester 1 Average + Semester 2 Average) / 2
    const calculateSemesterAverages = () => {
        const isSemesterBased = ['college', 'senior_highschool'].includes(academicLevelKey);

        if (!isSemesterBased) {
            // For Elementary and Junior High, use simple average of all valid grades
            const validGrades = grades
                .filter(g => g.grade !== null && g.grade !== undefined)
                .map(g => g.grade);

            if (validGrades.length > 0) {
                return {
                    semester1Average: null,
                    semester2Average: null,
                    overallAverage: validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length
                };
            }
            return { semester1Average: null, semester2Average: null, overallAverage: null };
        }

        // Calculate averages based on semester structure
        let semester1Average = null;
        let semester2Average = null;

        // Find semester 1 and calculate its average
        const semester1 = semesterStructure.find(s => s.semesterNumber === 1);
        if (semester1 && semester1.periods.length > 0) {
            const semester1GradingPeriodIds = semester1.periods.map((p: any) => p.gradingPeriodId);
            const semester1Grades = grades.filter(g =>
                g.grading_period_id && semester1GradingPeriodIds.includes(g.grading_period_id)
            );

            console.log('🔍 Semester 1 calculation:', {
                periodIds: semester1GradingPeriodIds,
                foundGrades: semester1Grades.map(g => ({ id: g.grading_period_id, grade: g.grade })),
                grades: semester1Grades.map(g => g.grade)
            });

            if (semester1Grades.length > 0) {
                const sum = semester1Grades.reduce((acc, g) => acc + parseFloat(g.grade.toString()), 0);
                semester1Average = sum / semester1Grades.length;
            }
        }

        // Find semester 2 and calculate its average
        const semester2 = semesterStructure.find(s => s.semesterNumber === 2);
        if (semester2 && semester2.periods.length > 0) {
            const semester2GradingPeriodIds = semester2.periods.map((p: any) => p.gradingPeriodId);
            const semester2Grades = grades.filter(g =>
                g.grading_period_id && semester2GradingPeriodIds.includes(g.grading_period_id)
            );

            console.log('🔍 Semester 2 calculation:', {
                periodIds: semester2GradingPeriodIds,
                foundGrades: semester2Grades.map(g => ({ id: g.grading_period_id, grade: g.grade })),
                grades: semester2Grades.map(g => g.grade)
            });

            if (semester2Grades.length > 0) {
                const sum = semester2Grades.reduce((acc, g) => acc + parseFloat(g.grade.toString()), 0);
                semester2Average = sum / semester2Grades.length;
            }
        }

        // Calculate Overall Average
        let overallAverage = null;
        if (semester1Average !== null && semester2Average !== null) {
            overallAverage = (semester1Average + semester2Average) / 2;
        } else if (semester1Average !== null) {
            overallAverage = semester1Average;
        } else if (semester2Average !== null) {
            overallAverage = semester2Average;
        }

        console.log('🔍 Final semester averages:', {
            semester1Average,
            semester2Average,
            overallAverage
        });

        return { semester1Average, semester2Average, overallAverage };
    };

    const { semester1Average, semester2Average, overallAverage } = calculateSemesterAverages();
    const finalGrade = overallAverage;

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
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <Link href={route('instructor.grades.index')}>
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



                        {/* Detailed Grades - Separate Tables per Semester */}
                        {semesterStructure.length > 0 && semesterStructure.some(sem => sem.periods.length > 0) ? (
                            <>
                                {/* Final Average Card - Displayed at the top */}
                                {finalGrade && (
                                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Overall Average</h3>
                                                    <p className="text-sm text-gray-600">Combined average for {latestGrade?.school_year}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-4xl font-bold text-gray-900 mb-2">
                                                        {finalGrade.toFixed(2)}
                                                    </div>
                                                    <Badge className={`text-sm px-4 py-2 ${
                                                        ['Superior', 'Very Good', 'Good', 'Satisfactory', 'Fair', 'Outstanding'].includes(getGradeStatus(finalGrade, academicLevelKey))
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {getGradeStatus(finalGrade, academicLevelKey)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Semester Tables */}
                                {semesterStructure.map((semester, semesterIndex) => {
                                    if (semester.periods.length === 0) return null;

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
                                                            <tr className="bg-gray-800 text-white">
                                                                <th className="text-left p-3 font-medium border-r border-gray-700">Student ID</th>
                                                                <th className="text-left p-3 font-medium border-r border-gray-700">Subject</th>
                                                                <th className="text-left p-3 font-medium border-r border-gray-700">Faculty</th>
                                                                {semester.periods.map((period: any) => (
                                                                    <th key={period.id} className="text-center p-3 font-medium border-r border-gray-700">
                                                                        {period.name
                                                                            .replace(/First Semester /, '')
                                                                            .replace(/Second Semester /, '')
                                                                            .replace(/First /, '')
                                                                            .replace(/Second /, '')
                                                                            .replace(/Semester /, '')
                                                                            .trim()}
                                                                    </th>
                                                                ))}
                                                                <th className="text-center p-3 font-medium border-r border-gray-700">Semester Average</th>
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
                                                                {semester.periods.map((period: any) => {
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
                                                                    {(() => {
                                                                        const semesterAvg = semester.semesterNumber === 1 ? semester1Average : semester2Average;
                                                                        return semesterAvg ? (
                                                                            <Badge className={`text-lg px-3 py-1 ${getGradeColor(semesterAvg, academicLevelKey)}`}>
                                                                                {semesterAvg.toFixed(2)}
                                                                            </Badge>
                                                                        ) : (
                                                                            <span className="text-gray-400">-</span>
                                                                        );
                                                                    })()}
                                                                </td>
                                                                <td className="p-3 text-center">
                                                                    {(() => {
                                                                        const semesterAvg = semester.semesterNumber === 1 ? semester1Average : semester2Average;
                                                                        if (semesterAvg) {
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
                                                                        }
                                                                        return <span className="text-gray-400">No Grade</span>;
                                                                    })()}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </>
                        ) : (
                            <Card className="bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                        <Calendar className="h-5 w-5 text-gray-600" />
                                        Detailed Grades
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <div className="h-16 w-16 text-gray-400 mx-auto mb-4">📊</div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No grading periods configured</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">
                                            Please contact the registrar to set up grading periods for {academicLevel.name}.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                                                {/* Action Buttons */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex gap-4">
                                    <Link 
                                        href={route('instructor.grades.create') + 
                                            `?student_id=${student.id}` +
                                            `&subject_id=${subject.id}` +
                                            `&academic_level_id=${academicLevel.id}` +
                                            `&academic_level_key=${academicLevel.key}` +
                                            `&school_year=${latestGrade?.school_year || '2024-2025'}`
                                        } 
                                        className="flex-1"
                                        onClick={() => {
                                            console.log('Navigating to grade creation with params:', {
                                                student_id: student.id,
                                                subject_id: subject.id,
                                                academic_level_id: academicLevel.id,
                                                academic_level_key: academicLevel.key,
                                                school_year: latestGrade?.school_year || '2024-2025'
                                            });
                                        }}
                                    >
                                        <Button className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Input New Grade
                                        </Button>
                                    </Link>
                                    {latestGrade && (
                                        <Link href={route('instructor.grades.edit', latestGrade.id)} className="flex-1">
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
