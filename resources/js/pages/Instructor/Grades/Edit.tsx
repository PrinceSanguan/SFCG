import React, { useMemo } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Edit as EditIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Sidebar } from '@/components/instructor/sidebar';
import { Header } from '@/components/instructor/header';

interface GradingPeriod {
    id: number;
    name: string;
    code: string;
    start_date: string;
    end_date: string;
    sort_order: number;
    is_active: boolean;
    academic_level_id: number;
}

interface StudentGrade {
    id: number;
    student_id: number;
    subject_id: number;
    academic_level_id: number;
    grading_period_id?: number;
    school_year: string;
    year_of_study?: number;
    grade: number;
    is_submitted_for_validation: boolean;
    submitted_at?: string;
    validated_at?: string;
    validated_by?: number;
    created_at: string;
    updated_at: string;
    // Editability fields (5-day edit window)
    is_editable?: boolean;
    days_remaining?: number;
    edit_status?: 'editable' | 'locked' | 'expired';
    student: {
        id: number;
        name: string;
        email: string;
        student_number?: string;
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
    gradingPeriod?: {
        id: number;
        name: string;
        code: string;
    };
}

interface AssignedSubject {
    id: number;
    subject: {
        id: number;
        name: string;
        code: string;
        grading_period_ids?: number[];
        semester_ids?: number[];
        course?: { id: number; name: string; code: string; };
    };
    grading_period_ids?: number[];
    semester_ids?: number[];
    academicLevel: { id: number; name: string; key: string; };
    gradingPeriod?: { id: number; name: string; };
    school_year: string;
    is_active: boolean;
    enrolled_students: Array<{
        id: number;
        student: { id: number; name: string; email: string; };
        semester?: string;
        is_active: boolean;
        school_year: string;
    }>;
    student_count: number;
}

interface EditProps {
    user: {
        id: number;
        name: string;
        email: string;
        user_role: string;
    };
    grade: StudentGrade;
    gradingPeriods: GradingPeriod[];
    assignedSubjects: AssignedSubject[];
}

export default function Edit({ user, grade, gradingPeriods, assignedSubjects }: EditProps) {
    // Helper functions for college grade conversion
    const gradeToPercentage = (grade: number): string => {
        const gradeMap: { [key: number]: string } = {
            1.0: '99-100%', 1.1: '97-98%', 1.2: '95-96%', 1.3: '93-94%', 1.4: '91-92%',
            1.5: '90%', 1.6: '89%', 1.7: '88%', 1.8: '87%', 1.9: '86%',
            2.0: '85%', 2.1: '84%', 2.2: '83%', 2.3: '82%', 2.4: '81%',
            2.5: '80%', 2.6: '79%', 2.7: '78%', 2.8: '77%', 2.9: '76%',
            3.0: '75%', 3.1: '74%', 3.2: '73%', 3.3: '72%', 3.4: '71%',
            3.5: '70%', 5.0: 'Below 70%',
        };
        const roundedGrade = Math.round(grade * 10) / 10;
        return gradeMap[roundedGrade] || '';
    };

    const getQualityDescription = (grade: number): string => {
        if (grade >= 1.0 && grade <= 1.2) return 'Excellent';
        if (grade >= 1.3 && grade <= 1.5) return 'Superior';
        if (grade >= 1.6 && grade <= 1.8) return 'Very Good';
        if (grade >= 1.9 && grade <= 2.1) return 'Good';
        if (grade >= 2.2 && grade <= 2.4) return 'Average';
        if (grade >= 2.5 && grade <= 2.7) return 'Satisfactory';
        if (grade >= 2.8 && grade <= 3.0) return 'Fair';
        if (grade > 3.0 && grade <= 3.5) return 'Conditional';
        if (grade === 5.0) return 'Failing';
        return '';
    };

    const { data, setData, put, processing, errors } = useForm({
        grade: grade.grade.toString(),
        grading_period_id: grade.grading_period_id?.toString() || '0',
    });

    // Extract unique semesters from instructor's assignments
    const assignedSemesters = useMemo(() => {
        const semesters = new Set<string>();
        assignedSubjects.forEach(subject => {
            subject.enrolled_students.forEach(enrollment => {
                if (enrollment.semester) {
                    semesters.add(enrollment.semester.toLowerCase());
                }
            });
        });
        return Array.from(semesters);
    }, [assignedSubjects]);

    // Check if instructor teaches first or second semester
    const teachesFirstSemester = useMemo(() =>
        assignedSemesters.some(s => s.includes('1st') || s.includes('first')),
        [assignedSemesters]
    );

    const teachesSecondSemester = useMemo(() =>
        assignedSemesters.some(s => s.includes('2nd') || s.includes('second')),
        [assignedSemesters]
    );

    // Filter grading periods based on the current grade's subject
    const allowedGradingPeriods = useMemo(() => {
        const currentSubjectId = grade.subject_id;
        const currentGradingPeriodId = grade.grading_period_id;

        console.log('=== Edit Grading Period Filtering ===');
        console.log('Current grade subject_id:', currentSubjectId);
        console.log('Current grade subject:', grade.subject?.name);
        console.log('Current grade grading_period_id:', currentGradingPeriodId);
        console.log('Current grade grading_period:', grade.gradingPeriod);

        // Find the assignment for this subject
        const assignment = assignedSubjects.find(
            s => s.subject.id === currentSubjectId
        );

        if (!assignment) {
            console.log('Edit: No assignment found for current subject, showing all periods');
            return gradingPeriods;
        }

        const gradingPeriodIds = assignment.grading_period_ids || assignment.subject?.grading_period_ids || [];

        console.log('Assignment grading_period_ids:', gradingPeriodIds);
        console.log('All grading periods:', gradingPeriods.length);

        if (gradingPeriodIds.length === 0) {
            console.log('Edit: No grading_period_ids assigned, showing all periods');
            return gradingPeriods;
        }

        const filtered = gradingPeriods.filter(period => gradingPeriodIds.includes(period.id));
        console.log('Edit: Filtered grading periods:', filtered.length, filtered.map(p => ({ id: p.id, name: p.name })));

        // IMPORTANT: Always include the grade's current grading period if it exists
        // This ensures that when editing, the user can see the existing grading period
        // even if it's not in the subject's assigned grading_period_ids
        if (currentGradingPeriodId && !filtered.find(p => p.id === currentGradingPeriodId)) {
            const currentPeriod = gradingPeriods.find(p => p.id === currentGradingPeriodId);
            if (currentPeriod) {
                console.log('Edit: Adding current grading period to list:', { id: currentPeriod.id, name: currentPeriod.name });
                filtered.push(currentPeriod);
                // Sort by sort_order to maintain proper ordering
                filtered.sort((a, b) => a.sort_order - b.sort_order);
            }
        }

        return filtered;
    }, [grade.subject_id, grade.grading_period_id, grade.gradingPeriod, assignedSubjects, gradingPeriods]);

    // Get current academic level key for grade validation
    const getCurrentAcademicLevelKey = () => {
        // Debug logging to see what we're getting
        console.log('Academic Level Data:', grade.academicLevel);
        console.log('Academic Level Key:', grade.academicLevel?.key);
        console.log('Academic Level Name:', grade.academicLevel?.name);
        console.log('Subject Course:', grade.subject?.course);
        console.log('Full Grade Object:', grade);
        
        // First try to get from the direct academic level relationship
        if (grade.academicLevel?.key) {
            const isCollege = grade.academicLevel.key === 'college';
            console.log('Using direct academic level, Is College:', isCollege);
            return isCollege ? 'college' : grade.academicLevel.key;
        }
        
        // Fallback: try to determine from subject course or other indicators
        if (grade.subject?.course) {
            // If there's a course, it's likely college level
            console.log('Using course fallback, assuming college level');
            return 'college';
        }
        
        // Check if the grade value itself suggests college level (1-5 scale)
        const currentGrade = typeof grade.grade === 'string' ? parseFloat(grade.grade) : grade.grade;
        if (currentGrade >= 1 && currentGrade <= 5) {
            console.log('Using grade value fallback, assuming college level (1-5 scale)');
            return 'college';
        }
        
        // Default to elementary if we can't determine
        console.log('Using default fallback: elementary');
        return 'elementary';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(route('instructor.grades.update', grade.id), {
            onSuccess: () => {
                console.log('Grade updated successfully');
            },
            onError: (errors) => {
                console.log('Grade update failed:', errors);
            },
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
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <Link href={route('instructor.grades.show-student', [grade.student_id, grade.subject_id])}>
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Student
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        Edit Grade
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Update the grade for {grade.student.name} in {grade.subject.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Edit Window Status - Days Remaining Warning */}
                        {grade.days_remaining !== undefined && (
                            <Card className={`max-w-2xl border-l-4 ${
                                grade.days_remaining === 0 ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                                grade.days_remaining <= 1 ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                                grade.days_remaining <= 2 ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            }`}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-full ${
                                            grade.days_remaining === 0 ? 'bg-red-100 dark:bg-red-800' :
                                            grade.days_remaining <= 1 ? 'bg-orange-100 dark:bg-orange-800' :
                                            grade.days_remaining <= 2 ? 'bg-yellow-100 dark:bg-yellow-800' :
                                            'bg-blue-100 dark:bg-blue-800'
                                        }`}>
                                            <svg className={`h-5 w-5 ${
                                                grade.days_remaining === 0 ? 'text-red-600 dark:text-red-300' :
                                                grade.days_remaining <= 1 ? 'text-orange-600 dark:text-orange-300' :
                                                grade.days_remaining <= 2 ? 'text-yellow-600 dark:text-yellow-300' :
                                                'text-blue-600 dark:text-blue-300'
                                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-semibold ${
                                                grade.days_remaining === 0 ? 'text-red-900 dark:text-red-100' :
                                                grade.days_remaining <= 1 ? 'text-orange-900 dark:text-orange-100' :
                                                grade.days_remaining <= 2 ? 'text-yellow-900 dark:text-yellow-100' :
                                                'text-blue-900 dark:text-blue-100'
                                            }`}>
                                                {grade.days_remaining === 0 ? '⚠️ Last Day to Edit!' :
                                                 grade.days_remaining === 1 ? '⏰ 1 Day Remaining' :
                                                 `⏰ ${grade.days_remaining} Days Remaining`}
                                            </h3>
                                            <p className={`text-sm mt-1 ${
                                                grade.days_remaining === 0 ? 'text-red-700 dark:text-red-200' :
                                                grade.days_remaining <= 1 ? 'text-orange-700 dark:text-orange-200' :
                                                grade.days_remaining <= 2 ? 'text-yellow-700 dark:text-yellow-200' :
                                                'text-blue-700 dark:text-blue-200'
                                            }`}>
                                                {grade.days_remaining === 0
                                                    ? 'This is your last opportunity to edit this grade before the 5-day window expires.'
                                                    : grade.days_remaining === 1
                                                    ? 'You have 1 day left to edit this grade within the 5-day edit window.'
                                                    : `You have ${grade.days_remaining} days left to edit this grade within the 5-day edit window.`}
                                                {grade.edit_status === 'locked' && ' Once submitted for validation, this grade cannot be edited.'}
                                            </p>
                                            <p className={`text-xs mt-2 ${
                                                grade.days_remaining === 0 ? 'text-red-600 dark:text-red-300' :
                                                grade.days_remaining <= 2 ? 'text-yellow-600 dark:text-yellow-300' :
                                                'text-blue-600 dark:text-blue-300'
                                            }`}>
                                                Grade created: {new Date(grade.created_at).toLocaleString()} •
                                                Status: {grade.is_submitted_for_validation ? 'Submitted for Validation' : 'Draft'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Grade Information Display */}
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <EditIcon className="h-5 w-5" />
                                    Grade Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                        Current Grade Details
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Student:</span>
                                            <p className="font-medium">{grade.student?.name || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Subject:</span>
                                            <p className="font-medium">{grade.subject?.name || 'Unknown'} ({grade.subject?.code || 'N/A'})</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Academic Level:</span>
                                            <p className="font-medium">{grade.academicLevel?.name || 'Unknown'}</p>
                                            {!grade.academicLevel?.name && (
                                                <p className="text-xs text-yellow-600 mt-1">
                                                    Detected: {getCurrentAcademicLevelKey() === 'college' ? 'College (5-1 scale)' : 'Elementary/Senior High (75-100 scale)'}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">School Year:</span>
                                            <p className="font-medium">{grade.school_year || 'N/A'}</p>
                                        </div>
                                        {grade.subject?.course && (
                                            <div className="col-span-2">
                                                <span className="text-gray-500 dark:text-gray-400">Course:</span>
                                                <p className="font-medium">{grade.subject.course.name} ({grade.subject.course.code})</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Edit Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="grade">Grade</Label>
                                            <Input
                                                id="grade"
                                                type="number"
                                                step={getCurrentAcademicLevelKey() === 'college' ? '0.1' : '0.01'}
                                                min={getCurrentAcademicLevelKey() === 'college' ? '1.0' : '75'}
                                                max={getCurrentAcademicLevelKey() === 'college' ? '5.0' : '100'}
                                                placeholder={getCurrentAcademicLevelKey() === 'college' ? 'Valid: 1.0-3.5 or 5.0' : 'Enter grade (0-100)'}
                                                value={data.grade}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setData('grade', value);
                                                    if (value && getCurrentAcademicLevelKey() === 'college') {
                                                        const numGrade = parseFloat(value);
                                                        console.log('[GRADE_EDIT] Grade changed:', {
                                                            grade: numGrade,
                                                            percentage: gradeToPercentage(numGrade),
                                                            quality: getQualityDescription(numGrade),
                                                            student: grade.student.name
                                                        });
                                                    }
                                                }}
                                                className={errors.grade ? 'border-red-500' : ''}
                                                autoFocus
                                            />
                                            {errors.grade && (
                                                <p className="text-sm text-red-500 mt-1">{errors.grade}</p>
                                            )}
                                            {data.grade && getCurrentAcademicLevelKey() === 'college' && (
                                                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                                        {gradeToPercentage(parseFloat(data.grade)) && (
                                                            <>
                                                                {gradeToPercentage(parseFloat(data.grade))}
                                                                {getQualityDescription(parseFloat(data.grade)) &&
                                                                    ` - ${getQualityDescription(parseFloat(data.grade))}`
                                                                }
                                                            </>
                                                        )}
                                                        {!gradeToPercentage(parseFloat(data.grade)) && (
                                                            <span className="text-red-600 dark:text-red-400">Invalid grade (use 1.0-3.5 or 5.0)</span>
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {getCurrentAcademicLevelKey() === 'college'
                                                    ? 'Valid grades: 1.0-3.5 (0.1 increments) or 5.0. 3.0 is passing (75%).'
                                                    : 'Elementary to Senior High: 75 (passing) to 100 (highest).'
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="grading_period_id">Grading Period</Label>
                                            <Select value={data.grading_period_id} onValueChange={(value) => setData('grading_period_id', value)}>
                                                <SelectTrigger className={errors.grading_period_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select grading period" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">No Period</SelectItem>
                                                    {allowedGradingPeriods && allowedGradingPeriods.length > 0 ? (
                                                        <>
                                                            {/* First Semester - Only show if instructor teaches it */}
                                                            {teachesFirstSemester && allowedGradingPeriods.filter(period => period.code.startsWith('COL_S1_') && !period.code.includes('_FA')).length > 0 && (
                                                                <SelectGroup>
                                                                    <SelectLabel>First Semester</SelectLabel>
                                                                    {allowedGradingPeriods
                                                                        .filter(period => period.code.startsWith('COL_S1_') && !period.code.includes('_FA'))
                                                                        .sort((a, b) => a.sort_order - b.sort_order)
                                                                        .map((period) => (
                                                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                                                {period.name}
                                                                            </SelectItem>
                                                                        ))
                                                                    }
                                                                </SelectGroup>
                                                            )}

                                                            {/* Second Semester - Only show if instructor teaches it */}
                                                            {teachesSecondSemester && allowedGradingPeriods.filter(period => period.code.startsWith('COL_S2_') && !period.code.includes('_FA')).length > 0 && (
                                                                <SelectGroup>
                                                                    <SelectLabel>Second Semester</SelectLabel>
                                                                    {allowedGradingPeriods
                                                                        .filter(period => period.code.startsWith('COL_S2_') && !period.code.includes('_FA'))
                                                                        .sort((a, b) => a.sort_order - b.sort_order)
                                                                        .map((period) => (
                                                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                                                {period.name}
                                                                            </SelectItem>
                                                                        ))
                                                                    }
                                                                </SelectGroup>
                                                            )}

                                                            {/* Fallback: Show all periods if no semester-specific periods are showing */}
                                                            {(() => {
                                                                const s1Periods = allowedGradingPeriods.filter(period => period.code.startsWith('COL_S1_') && !period.code.includes('_FA'));
                                                                const s2Periods = allowedGradingPeriods.filter(period => period.code.startsWith('COL_S2_') && !period.code.includes('_FA'));
                                                                const showS1 = teachesFirstSemester && s1Periods.length > 0;
                                                                const showS2 = teachesSecondSemester && s2Periods.length > 0;

                                                                // If no semester-specific periods are shown, show all available periods
                                                                if (!showS1 && !showS2) {
                                                                    return (
                                                                        <SelectGroup>
                                                                            <SelectLabel>Available Grading Periods</SelectLabel>
                                                                            {allowedGradingPeriods
                                                                                .filter(period => !period.code.includes('_FA'))
                                                                                .sort((a, b) => a.sort_order - b.sort_order)
                                                                                .map((period) => (
                                                                                    <SelectItem key={period.id} value={period.id.toString()}>
                                                                                        {period.name}
                                                                                    </SelectItem>
                                                                                ))
                                                                            }
                                                                        </SelectGroup>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </>
                                                    ) : (
                                                        <SelectItem value="none" disabled>No grading periods assigned to this subject</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.grading_period_id && (
                                                <p className="text-sm text-red-500 mt-1">{errors.grading_period_id}</p>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Select which grading period this grade belongs to
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 pt-4">
                                        <Button type="submit" disabled={processing} className="flex-1">
                                            <Save className="h-4 w-4 mr-2" />
                                            {processing ? 'Updating...' : 'Update Grade'}
                                        </Button>
                                        <Link href={route('instructor.grades.show-student', [grade.student_id, grade.subject_id])} className="flex-1">
                                            <Button type="button" variant="outline" className="w-full">
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
