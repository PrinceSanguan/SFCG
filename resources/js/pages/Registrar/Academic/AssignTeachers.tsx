import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, GraduationCap, Calendar, User, BookOpen } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface AcademicLevel {
    id: number;
    name: string;
    key: string;
}

interface GradingPeriod {
    id: number;
    name: string;
    code: string;
    academic_level_id: number;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
    units: number;
    hours_per_week: number;
    is_core: boolean;
    is_active: boolean;
    academicLevel: AcademicLevel;
}

interface TeacherSubjectAssignment {
    id: number;
    teacher_id: number;
    subject_id: number;
    academic_level_id: number;
    grading_period_id: number | null;
    school_year: string;
    notes: string | null;
    is_active: boolean;
    teacher: User;
    subject: Subject;
    academicLevel: AcademicLevel;
    gradingPeriod: GradingPeriod | null;
}

interface Props {
    user: User;
    assignments: TeacherSubjectAssignment[];
    teachers: User[];
    subjects: Subject[];
    gradingPeriods: GradingPeriod[];
    academicLevels: AcademicLevel[];
}

export default function AssignTeachers({ user, assignments = [], teachers = [], subjects = [], gradingPeriods = [], academicLevels = [] }: Props) {
    const [assignmentForm, setAssignmentForm] = useState({
        teacher_id: '',
        subject_id: '',
        academic_level_id: '',
        grading_period_id: '',
        school_year: '',
        notes: '',
        is_active: true,
    });

    const [assignmentModal, setAssignmentModal] = useState(false);
    const [editAssignment, setEditAssignment] = useState<TeacherSubjectAssignment | null>(null);
    const [editModal, setEditModal] = useState(false);

    // Filter for Senior High School level only
    const shsLevel = academicLevels.find(level => level.key === 'senior_highschool');
    
    // Safety check: only proceed if we have valid level
    if (!shsLevel) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.get('/registrar/academic')}
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Academic Management</span>
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <h1 className="text-2xl font-bold text-gray-900">Assign Teachers (SHS)</h1>
                    </div>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Academic Level Not Found</h3>
                            <p className="text-gray-600 mb-4">
                                Senior High School academic level is not configured in the system.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const shsAssignments = (assignments || []).filter(assignment => 
        assignment.academic_level_id === shsLevel.id
    );
    // Subjects are already filtered by SHS level in the backend
    const shsSubjects = subjects || [];
    const shsGradingPeriods = (gradingPeriods || []).filter(period => 
        period.academic_level_id === shsLevel.id
    );

    const schoolYearOptions = [
        '2024-2025',
        '2025-2026',
        '2026-2027',
        '2027-2028',
    ];

    const submitAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            '/registrar/academic/assign-teachers',
            {
                ...assignmentForm,
                academic_level_id: shsLevel?.id,
            },
            {
                onSuccess: () => {
                    setAssignmentModal(false);
                    resetForm();
                },
                preserveScroll: true,
            }
        );
    };

    const updateAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editAssignment) return;
        
        router.put(
            `/registrar/academic/assign-teachers/${editAssignment.id}`,
            {
                ...assignmentForm,
                academic_level_id: shsLevel?.id,
            },
            {
                onSuccess: () => {
                    setEditModal(false);
                },
                preserveScroll: true,
            }
        );
    };

    const destroyAssignment = (id: number) => {
        if (confirm('Are you sure you want to delete this assignment?')) {
            router.delete(`/registrar/academic/assign-teachers/${id}`);
        }
    };

    const openEditModal = (assignment: TeacherSubjectAssignment) => {
        setEditAssignment(assignment);
        setAssignmentForm({
            teacher_id: assignment.teacher_id.toString(),
            subject_id: assignment.subject_id.toString(),
            academic_level_id: assignment.academic_level_id.toString(),
            grading_period_id: assignment.grading_period_id?.toString() || '',
            school_year: assignment.school_year,
            notes: assignment.notes || '',
            is_active: assignment.is_active,
        });
        setEditModal(true);
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge className="bg-green-100 text-green-800">Active</Badge>
        ) : (
            <Badge className="bg-red-100 text-red-800">Inactive</Badge>
        );
    };

    const getCoreBadge = (isCore: boolean) => {
        return isCore ? (
            <Badge className="bg-blue-100 text-blue-800">Core</Badge>
        ) : (
            <Badge className="bg-gray-100 text-gray-800">Elective</Badge>
        );
    };

    const resetForm = () => {
        setAssignmentForm({
            teacher_id: '',
            subject_id: '',
            academic_level_id: '',
            grading_period_id: '',
            school_year: '',
            notes: '',
            is_active: true,
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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/registrar/academic')}
                                    className="flex items-center space-x-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Back to Academic Management</span>
                                </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assign Teachers (SHS)</h1>
                            </div>
                        </div>

            {/* Info Card */}
            <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                        <GraduationCap className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-green-900">Senior High School Teacher Assignments</h3>
                            <p className="text-green-700 text-sm mt-1">
                                Manage teacher assignments for Senior High School subjects. This page is specifically for assigning teachers to SHS subjects and strands.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-900">Teacher Assignments</h2>
                    <Badge variant="secondary">{shsAssignments.length} assignments</Badge>
                </div>
                <Dialog open={assignmentModal} onOpenChange={setAssignmentModal}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setAssignmentModal(true); resetForm(); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Assign Teacher
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Assign Teacher to Subject</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitAssignment} className="space-y-4">
                            <div>
                                <Label htmlFor="teacher_id">Teacher</Label>
                                <Select
                                    value={assignmentForm.teacher_id}
                                    onValueChange={(value) => setAssignmentForm({ ...assignmentForm, teacher_id: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(teachers || [])
                                            .filter(teacher => teacher.user_role === 'teacher')
                                            .map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="subject_id">Subject</Label>
                                <Select
                                    value={assignmentForm.subject_id}
                                    onValueChange={(value) => setAssignmentForm({ ...assignmentForm, subject_id: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(shsSubjects || []).map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id.toString()}>
                                                {subject.name} ({subject.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="grading_period_id">Grading Period</Label>
                                <Select
                                    value={assignmentForm.grading_period_id}
                                    onValueChange={(value) => setAssignmentForm({ ...assignmentForm, grading_period_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grading period (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(shsGradingPeriods || []).map((period) => (
                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                {period.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="school_year">School Year</Label>
                                <Select
                                    value={assignmentForm.school_year}
                                    onValueChange={(value) => setAssignmentForm({ ...assignmentForm, school_year: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select school year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {schoolYearOptions.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={assignmentForm.notes}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                                    placeholder="Additional notes..."
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={assignmentForm.is_active}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, is_active: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setAssignmentModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Assign Teacher</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Assignments Table */}
            {shsAssignments.length > 0 ? (
                <div className="grid gap-4">
                    {shsAssignments.map((assignment) => (
                        <Card key={assignment.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">{assignment.teacher.name}</span>
                                        </div>
                                        <span className="text-gray-400">→</span>
                                        <div className="flex items-center space-x-2">
                                            <BookOpen className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">{assignment.subject.name}</span>
                                            <Badge variant="outline">{assignment.subject.code}</Badge>
                                            {getCoreBadge(assignment.subject.is_core)}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>{assignment.school_year}</span>
                                        </div>
                                        {assignment.gradingPeriod && (
                                            <Badge variant="secondary">{assignment.gradingPeriod.name}</Badge>
                                        )}
                                        {getStatusBadge(assignment.is_active)}
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(assignment)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => destroyAssignment(assignment.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                    <span>Units: {assignment.subject.units}</span>
                                    <span>Hours/Week: {assignment.subject.hours_per_week}</span>
                                </div>
                                {assignment.notes && (
                                    <p className="text-sm text-gray-600 mt-2">{assignment.notes}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Teacher Assignments</h3>
                            <p className="text-gray-600 mb-4">
                                No teachers have been assigned to Senior High School subjects yet.
                            </p>
                            <Button onClick={() => setAssignmentModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Assign Your First Teacher
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Edit Assignment Modal */}
            <Dialog open={editModal} onOpenChange={setEditModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Teacher Assignment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={updateAssignment} className="space-y-4">
                        <div>
                            <Label htmlFor="edit_teacher_id">Teacher</Label>
                            <Select
                                value={assignmentForm.teacher_id}
                                onValueChange={(value) => setAssignmentForm({ ...assignmentForm, teacher_id: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(teachers || [])
                                        .filter(teacher => teacher.user_role === 'teacher')
                                        .map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                {teacher.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="edit_subject_id">Subject</Label>
                            <Select
                                value={assignmentForm.subject_id}
                                onValueChange={(value) => setAssignmentForm({ ...assignmentForm, subject_id: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(shsSubjects || []).map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id.toString()}>
                                            {subject.name} ({subject.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="edit_grading_period_id">Grading Period</Label>
                            <Select
                                value={assignmentForm.grading_period_id}
                                onValueChange={(value) => setAssignmentForm({ ...assignmentForm, grading_period_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select grading period (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(shsGradingPeriods || []).map((period) => (
                                        <SelectItem key={period.id} value={period.id.toString()}>
                                            {period.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="edit_school_year">School Year</Label>
                            <Select
                                value={assignmentForm.school_year}
                                onValueChange={(value) => setAssignmentForm({ ...assignmentForm, school_year: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select school year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {schoolYearOptions.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="edit_notes">Notes</Label>
                            <Textarea
                                id="edit_notes"
                                value={assignmentForm.notes}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                                placeholder="Additional notes..."
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="edit_is_active"
                                checked={assignmentForm.is_active}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, is_active: e.target.checked })}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="edit_is_active">Active</Label>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Update Assignment</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
                    </div>
                </main>
            </div>
        </div>
    );
}
