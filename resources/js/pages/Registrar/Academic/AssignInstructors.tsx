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
import { ArrowLeft, Plus, Edit, Trash2, Building2, Calendar, User, BookOpen } from 'lucide-react';

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

interface Course {
    id: number;
    name: string;
    code: string;
    description: string;
    units: number;
    department?: {
        id: number;
        name: string;
    };
}

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
    units: number;
    academic_level_id: number;
}

interface InstructorCourseAssignment {
    id: number;
    instructor_id: number;
    course_id: number;
    academic_level_id: number;
    grading_period_id: number | null;
    school_year: string;
    notes: string | null;
    is_active: boolean;
    instructor: User;
    course: Course;
    academicLevel: AcademicLevel;
    gradingPeriod: GradingPeriod | null;
}

interface Props {
    user: User;
    assignments: InstructorCourseAssignment[];
    instructors: User[];
    courses: Course[];
    subjects: Subject[];
    gradingPeriods: GradingPeriod[];
    academicLevels: AcademicLevel[];
}

export default function AssignInstructors({ user, assignments = [], instructors = [], courses = [], subjects = [], gradingPeriods = [], academicLevels = [] }: Props) {
    const [assignmentForm, setAssignmentForm] = useState({
        instructor_id: '',
        course_id: '',
        subject_id: '',
        academic_level_id: '',
        grading_period_id: '',
        school_year: '',
        notes: '',
        is_active: true,
    });

    const [assignmentModal, setAssignmentModal] = useState(false);
    const [editAssignment, setEditAssignment] = useState<InstructorCourseAssignment | null>(null);
    const [editModal, setEditModal] = useState(false);

    // Filter for College level only
    const collegeLevel = academicLevels.find(level => level.key === 'college');
    
    // Safety check: only proceed if we have valid level
    if (!collegeLevel) {
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
                        <h1 className="text-2xl font-bold text-gray-900">Assign Instructors (College)</h1>
                    </div>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Academic Level Not Found</h3>
                            <p className="text-gray-600 mb-4">
                                College academic level is not configured in the system.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const collegeAssignments = (assignments || []).filter(assignment => 
        assignment.academic_level_id === collegeLevel.id
    );
    // Courses are already filtered by college level in the backend
    const collegeCourses = courses || [];
    const collegeGradingPeriods = (gradingPeriods || []).filter(period => 
        period.academic_level_id === collegeLevel.id
    );

    const schoolYearOptions = [
        '2024-2025',
        '2025-2026',
        '2026-2027',
        '2027-2028',
    ];

    const submitAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/registrar/academic/assign-instructors', {
            ...assignmentForm,
            academic_level_id: collegeLevel?.id,
        });
    };

    const updateAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editAssignment) return;
        
        router.put(`/registrar/academic/assign-instructors/${editAssignment.id}`, {
            ...assignmentForm,
            academic_level_id: collegeLevel?.id,
        });
    };

    const destroyAssignment = (id: number) => {
        if (confirm('Are you sure you want to delete this assignment?')) {
            router.delete(`/registrar/academic/assign-instructors/${id}`);
        }
    };

    const openEditModal = (assignment: InstructorCourseAssignment) => {
        setEditAssignment(assignment);
        setAssignmentForm({
            instructor_id: assignment.instructor_id.toString(),
            course_id: assignment.course_id.toString(),
            subject_id: '', // Will be filled from assignment data when we update the backend
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

    const resetForm = () => {
        setAssignmentForm({
            instructor_id: '',
            course_id: '',
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
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assign Instructors (College)</h1>
                            </div>
                        </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                        <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-blue-900">College Instructor Assignments</h3>
                            <p className="text-blue-700 text-sm mt-1">
                                Manage instructor assignments for college-level courses. This page is specifically for assigning instructors to college courses and departments.
                            </p>
                        </div>
                    </div>
                        </CardContent>
                    </Card>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-900">Instructor Assignments</h2>
                    <Badge variant="secondary">{collegeAssignments.length} assignments</Badge>
                </div>
                <Dialog open={assignmentModal} onOpenChange={setAssignmentModal}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setAssignmentModal(true); resetForm(); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Assign Instructor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Assign Instructor to Course</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitAssignment} className="space-y-4">
                            <div>
                                <Label htmlFor="instructor_id">Instructor</Label>
                                <Select
                                    value={assignmentForm.instructor_id}
                                    onValueChange={(value) => setAssignmentForm({ ...assignmentForm, instructor_id: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select instructor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(instructors || [])
                                            .filter(instructor => instructor.user_role === 'instructor')
                                            .map((instructor) => (
                                                <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                                    {instructor.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="course_id">Course</Label>
                                <Select
                                    value={assignmentForm.course_id}
                                    onValueChange={(value) => setAssignmentForm({ ...assignmentForm, course_id: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(collegeCourses || []).map((course) => (
                                            <SelectItem key={course.id} value={course.id.toString()}>
                                                {course.name} ({course.department?.name || 'No Department'})
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
                                        {(subjects || []).map((subject) => (
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
                                        {(collegeGradingPeriods || []).map((period) => (
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
                                <Button type="submit">Assign Instructor</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Assignments Table */}
            {collegeAssignments.length > 0 ? (
                <div className="grid gap-4">
                    {collegeAssignments.map((assignment) => (
                        <Card key={assignment.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">{assignment.instructor.name}</span>
                                        </div>
                                        <span className="text-gray-400">→</span>
                                        <div className="flex items-center space-x-2">
                                            <BookOpen className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">{assignment.course.name}</span>
                                            <Badge variant="outline">{assignment.course.department?.name || 'No Department'}</Badge>
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Instructor Assignments</h3>
                            <p className="text-gray-600 mb-4">
                                No instructors have been assigned to college courses yet.
                            </p>
                            <Button onClick={() => setAssignmentModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Assign Your First Instructor
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Edit Assignment Modal */}
            <Dialog open={editModal} onOpenChange={setEditModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Instructor Assignment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={updateAssignment} className="space-y-4">
                        <div>
                            <Label htmlFor="edit_instructor_id">Instructor</Label>
                            <Select
                                value={assignmentForm.instructor_id}
                                onValueChange={(value) => setAssignmentForm({ ...assignmentForm, instructor_id: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select instructor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(instructors || [])
                                        .filter(instructor => instructor.user_role === 'instructor')
                                        .map((instructor) => (
                                            <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                                {instructor.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="edit_course_id">Course</Label>
                            <Select
                                value={assignmentForm.course_id}
                                onValueChange={(value) => setAssignmentForm({ ...assignmentForm, course_id: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(collegeCourses || []).map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                            {course.name} ({course.department?.name || 'No Department'})
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
                                    {(subjects || []).map((subject) => (
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
                                    {(collegeGradingPeriods || []).map((period) => (
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
