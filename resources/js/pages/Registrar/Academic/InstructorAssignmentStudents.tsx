import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, User, BookOpen, GraduationCap, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
        name: string;
    };
}

interface AcademicLevel {
    id: number;
    name: string;
    key: string;
}

interface Instructor {
    id: number;
    name: string;
    email: string;
}

interface Assignment {
    id: number;
    subject: Subject;
    instructor: Instructor;
    academicLevel: AcademicLevel;
    school_year: string;
    grading_period_id?: number;
}

interface Props {
    user: any;
    assignment: Assignment;
    enrolledStudents: Student[];
    availableStudents: Student[];
}

export default function InstructorAssignmentStudents({ user, assignment, enrolledStudents, availableStudents }: Props) {
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [semester, setSemester] = useState<string>('1st Semester');
    const [notes, setNotes] = useState<string>('');

    const { post, delete: destroy, processing } = useForm();

    const handleEnrollStudent = () => {
        if (!selectedStudent) {
            toast.error('Please select a student to enroll');
            return;
        }

        post(route('registrar.assign-instructors-subjects.enroll-student', assignment.id), {
            data: {
                student_id: selectedStudent,
                semester,
                notes,
            },
            onSuccess: () => {
                toast.success('Student enrolled successfully!');
                setSelectedStudent('');
                setSemester('1st Semester');
                setNotes('');
                // Refresh the page to show updated data
                window.location.reload();
            },
            onError: (errors) => {
                toast.error('Failed to enroll student');
                console.error(errors);
            },
        });
    };

    const handleRemoveStudent = (studentId: number) => {
        if (confirm('Are you sure you want to remove this student from the subject?')) {
            destroy(route('registrar.assign-instructors-subjects.remove-student', assignment.id), {
                data: { student_id: studentId },
                onSuccess: () => {
                    toast.success('Student removed successfully!');
                    // Refresh the page to show updated data
                    window.location.reload();
                },
                onError: () => {
                    toast.error('Failed to remove student');
                },
            });
        }
    };

    return (
        <>
            <Head title="Manage Students - Instructor Assignment" />
            
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Manage Students</h1>
                        <p className="text-muted-foreground">
                            Manage student enrollments for instructor assignment
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        Back to Assignments
                    </Button>
                </div>

                {/* Assignment Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Assignment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                                <p className="font-medium">{assignment.subject.name} ({assignment.subject.code})</p>
                                {assignment.subject.course && (
                                    <p className="text-sm text-muted-foreground">{assignment.subject.course.name}</p>
                                )}
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Instructor</Label>
                                <p className="font-medium">{assignment.instructor.name}</p>
                                <p className="text-sm text-muted-foreground">{assignment.instructor.email}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Academic Level</Label>
                                <p className="font-medium">{assignment.academicLevel.name}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">School Year</Label>
                                <p className="font-medium">{assignment.school_year}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enroll New Student */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Enroll New Student
                            </CardTitle>
                            <CardDescription>
                                Add a new student to this subject
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="student">Select Student</Label>
                                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a student to enroll" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableStudents.map((student) => (
                                            <SelectItem key={student.id} value={student.id.toString()}>
                                                {student.name} - {student.student_number || 'No ID'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {availableStudents.length === 0 && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        All students in this academic level are already enrolled
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="semester">Semester</Label>
                                <Select value={semester} onValueChange={setSemester}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1st Semester">1st Semester</SelectItem>
                                        <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                                        <SelectItem value="Summer">Summer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Input
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Additional notes about this enrollment"
                                />
                            </div>

                            <Button
                                onClick={handleEnrollStudent}
                                disabled={processing || !selectedStudent || availableStudents.length === 0}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Enroll Student
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Current Enrollments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Current Enrollments
                            </CardTitle>
                            <CardDescription>
                                Students currently enrolled in this subject
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {enrolledStudents.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No students enrolled yet</p>
                                    <p className="text-sm">Use the form on the left to enroll students</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {enrolledStudents.map((student) => (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <User className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{student.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {student.student_number || 'No ID'} • {student.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemoveStudent(student.id)}
                                                disabled={processing}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Stats */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-primary">
                                    {enrolledStudents.length}
                                </div>
                                <div className="text-sm text-muted-foreground">Enrolled Students</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {availableStudents.length}
                                </div>
                                <div className="text-sm text-muted-foreground">Available Students</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {enrolledStudents.length + availableStudents.length}
                                </div>
                                <div className="text-sm text-muted-foreground">Total Students in Level</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
