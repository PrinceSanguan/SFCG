import React, { useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Edit as EditIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Sidebar } from '@/components/teacher/sidebar';
import { Header } from '@/components/teacher/header';

interface GradingPeriod {
    id: number;
    name: string;
    code: string;
    type: string;
    period_type: string;
    semester_number: number | null;
    parent_id: number | null;
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

interface EditProps {
    user: {
        id: number;
        name: string;
        email: string;
        user_role: string;
    };
    grade: StudentGrade;
    gradingPeriods: GradingPeriod[];
}

export default function Edit({ user, grade, gradingPeriods }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        grade: grade.grade.toString(),
        grading_period_id: grade.grading_period_id?.toString() || '0',
    });

    // Get current academic level key for grade validation
    const getCurrentAcademicLevelKey = () => {
        return grade.academicLevel?.key;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(route('teacher.grades.update', grade.id), {
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
                                <Link href={route('teacher.grades.show-student', [grade.student_id, grade.subject_id])}>
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
                                                step="1"
                                                min="75"
                                                max="100"
                                                placeholder="Enter grade (75-100)"
                                                value={data.grade}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setData('grade', value);
                                                    if (value) {
                                                        console.log('[SHS_GRADE_EDIT] Grade changed:', {
                                                            grade: parseFloat(value),
                                                            scale: '75-100',
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
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Senior High School: 75 (passing) to 100 (highest). Use whole numbers or decimals.
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
                                                    {gradingPeriods && gradingPeriods.length > 0 ? (
                                                        <>
                                                            {(() => {
                                                                // Filter grading periods for the current academic level
                                                                const currentAcademicLevelId = grade.academic_level_id || 0;
                                                                const allRelevantPeriods = gradingPeriods.filter(
                                                                    period => period.academic_level_id === currentAcademicLevelId
                                                                );

                                                                // Separate parent semesters and child periods
                                                                const parentSemesters = allRelevantPeriods.filter(p => p.parent_id === null && p.type === 'semester');
                                                                const childPeriods = allRelevantPeriods.filter(p => p.parent_id !== null && p.period_type !== 'final');

                                                                if (parentSemesters.length === 0 && childPeriods.length === 0) {
                                                                    return (
                                                                        <SelectItem value="none" disabled>
                                                                            No grading periods available for this academic level
                                                                        </SelectItem>
                                                                    );
                                                                }

                                                                // Group child periods by parent
                                                                const groupedPeriods = parentSemesters
                                                                    .sort((a, b) => a.sort_order - b.sort_order)
                                                                    .map(parent => ({
                                                                        parent,
                                                                        children: childPeriods
                                                                            .filter(child => child.parent_id === parent.id)
                                                                            .sort((a, b) => a.sort_order - b.sort_order)
                                                                    }));

                                                                return (
                                                                    <>
                                                                        {groupedPeriods.map(({ parent, children }) => (
                                                                            children.length > 0 && (
                                                                                <SelectGroup key={parent.id}>
                                                                                    <SelectLabel>{parent.name}</SelectLabel>
                                                                                    {children.map((period) => (
                                                                                        <SelectItem key={period.id} value={period.id.toString()}>
                                                                                            {period.name}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectGroup>
                                                                            )
                                                                        ))}
                                                                    </>
                                                                );
                                                            })()}
                                                        </>
                                                    ) : (
                                                        <SelectItem value="0" disabled>No grading periods available</SelectItem>
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
                                        <Link href={route('teacher.grades.show-student', [grade.student_id, grade.subject_id])} className="flex-1">
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
