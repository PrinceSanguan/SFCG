import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Building2, Calendar, User, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

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
    type?: string;
    parent_id?: number | null;
    semester_number?: number | null;
}

interface Department {
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
    department_id: number;
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
    course_id?: number;
    course?: {
        id: number;
        name: string;
        code: string;
    };
}

interface InstructorCourseAssignment {
    id: number;
    instructor_id: number;
    course_id: number;
    academic_level_id: number;
    year_level: string | null;
    grading_period_id: number | null;
    school_year: string;
    notes: string | null;
    is_active: boolean;
    instructor: User;
    course: Course;
    academicLevel: AcademicLevel;
    gradingPeriod: GradingPeriod | null;
    subject?: Subject | null;
}

interface Props {
    user: User;
    assignments: InstructorCourseAssignment[];
    instructors: User[];
    departments: Department[];
    courses: Course[];
    subjects: Subject[];
    gradingPeriods: GradingPeriod[];
    academicLevels: AcademicLevel[];
    yearLevels: Record<string, string>;
}

export default function AssignInstructors({ user, assignments, instructors, departments, courses, subjects, gradingPeriods, academicLevels, yearLevels }: Props) {
    const { addToast } = useToast();
    const { props } = usePage<any>();

    // Handle flash messages
    useEffect(() => {
        if (props.flash?.success) {
            addToast(props.flash.success, 'success');
        }
        if (props.flash?.error) {
            addToast(props.flash.error, 'error');
        }
    }, [props.flash]);

    const [assignmentForm, setAssignmentForm] = useState({
        instructor_id: '',
        year_level: '',
        department_id: '',
        course_id: '',
        subject_id: '',
        academic_level_id: '',
        semester_ids: [] as string[],
        grading_period_ids: [] as string[],
        school_year: '',
        notes: '',
        is_active: true,
    });

    const [assignmentModal, setAssignmentModal] = useState(false);
    const [editAssignment, setEditAssignment] = useState<InstructorCourseAssignment | null>(null);
    const [editModal, setEditModal] = useState(false);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);

    // Filter for College level only
    const collegeLevel = academicLevels.find(level => level.key === 'college');
    
    // Initialize filtered data when component loads
    useEffect(() => {
        console.log('Subjects data:', subjects);
        console.log('Courses data:', courses);
        console.log('Departments data:', departments);
        
        if (assignmentForm.department_id) {
            const filtered = courses.filter(c => c.department_id === parseInt(assignmentForm.department_id));
            setFilteredCourses(filtered);
        }
        if (assignmentForm.course_id) {
            const filtered = subjects.filter(s => s.course_id == null || s.course_id === parseInt(assignmentForm.course_id));
            setFilteredSubjects(filtered);
        }
    }, [assignmentForm.department_id, assignmentForm.course_id, courses, subjects, departments]);
    
    // Safety check: only proceed if we have valid level
    if (!collegeLevel) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.get('/admin/academic')}
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
    
    const collegeAssignments = assignments.filter(assignment => 
        assignment.academic_level_id === collegeLevel.id
    );
    // Courses are already filtered by college level in the backend
    const collegeCourses = courses;
    const collegeSemesters = gradingPeriods.filter(period => 
        period.academic_level_id === collegeLevel.id &&
        (period.parent_id == null) &&
        ((period.type === 'semester') || /semester/i.test(period.name))
    );

    const allCollegeGradingPeriods = gradingPeriods.filter(period =>
        period.academic_level_id === collegeLevel?.id &&
        period.parent_id != null // Only child periods (not main semesters)
    );

    // Get grading periods for selected semesters only
    const getGradingPeriodsForSelectedSemesters = () => {
        return allCollegeGradingPeriods.filter(period =>
            period.parent_id && assignmentForm.semester_ids.includes(period.parent_id.toString())
        );
    };

    const schoolYearOptions = [
        '2024-2025',
        '2025-2026',
        '2026-2027',
        '2027-2028',
    ];

    const submitAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/academic/assign-instructors', {
            ...assignmentForm,
            academic_level_id: collegeLevel?.id,
        }, {
            onSuccess: () => {
                setAssignmentModal(false);
                resetForm();
            },
            onError: (errors) => {
                console.error(errors);
            },
        });
    };

    const updateAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editAssignment) return;

        router.put(`/admin/academic/assign-instructors/${editAssignment.id}`, {
            ...assignmentForm,
            academic_level_id: collegeLevel?.id,
        }, {
            onSuccess: () => {
                setEditModal(false);
            },
            onError: (errors) => {
                console.error(errors);
            },
        });
    };

    const destroyAssignment = (id: number) => {
        if (confirm('Are you sure you want to delete this assignment?')) {
            router.delete(`/admin/academic/assign-instructors/${id}`, {
                onSuccess: () => {
                    // Flash message will be handled by useEffect
                },
                onError: (errors) => {
                    console.error(errors);
                },
            });
        }
    };

    const openEditModal = (assignment: InstructorCourseAssignment) => {
        setEditAssignment(assignment);
        setAssignmentForm({
            instructor_id: assignment.instructor_id.toString(),
            year_level: assignment.year_level || '',
            department_id: '',
            course_id: assignment.course_id.toString(),
            subject_id: '',
            academic_level_id: assignment.academic_level_id.toString(),
            semester_ids: assignment.gradingPeriod?.parent_id ? [assignment.gradingPeriod.parent_id.toString()] : [],
            grading_period_ids: assignment.grading_period_id ? [assignment.grading_period_id.toString()] : [],
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
            year_level: '',
            department_id: '',
            course_id: '',
            subject_id: '',
            academic_level_id: '',
            semester_ids: [],
            grading_period_ids: [],
            school_year: '',
            notes: '',
            is_active: true,
        });
        setFilteredCourses([]);
        setFilteredSubjects([]);
    };

    // Helper functions for checkbox handling
    const handleSemesterChange = (semesterId: string, checked: boolean) => {
        const updatedSemesters = checked
            ? [...assignmentForm.semester_ids, semesterId]
            : assignmentForm.semester_ids.filter(id => id !== semesterId);

        // If unchecking a semester, also uncheck its grading periods
        let updatedGradingPeriods = assignmentForm.grading_period_ids;
        if (!checked) {
            const periodsToRemove = allCollegeGradingPeriods
                .filter(period => period.parent_id?.toString() === semesterId)
                .map(period => period.id.toString());

            updatedGradingPeriods = assignmentForm.grading_period_ids.filter(
                periodId => !periodsToRemove.includes(periodId)
            );
        }

        setAssignmentForm({
            ...assignmentForm,
            semester_ids: updatedSemesters,
            grading_period_ids: updatedGradingPeriods,
        });
    };

    const handleGradingPeriodChange = (periodId: string, checked: boolean) => {
        const updatedPeriods = checked
            ? [...assignmentForm.grading_period_ids, periodId]
            : assignmentForm.grading_period_ids.filter(id => id !== periodId);

        setAssignmentForm({
            ...assignmentForm,
            grading_period_ids: updatedPeriods,
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
                                    onClick={() => router.get('/admin/academic')}
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
                                Manage instructor assignments for college-level courses. This page shows instructors assigned to courses and displays the subjects available in each course.
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
                            Assign Instructor to Subject
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Assign Instructor to Subject</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitAssignment} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            {instructors
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
                                    <Label htmlFor="academic_level_id">Academic Level *</Label>
                                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                                        <div className="text-sm font-medium text-blue-800">
                                            College
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="year_level">Year Level *</Label>
                                    <Select
                                        value={assignmentForm.year_level}
                                        onValueChange={(value) => {
                                            setAssignmentForm({ 
                                                ...assignmentForm, 
                                                year_level: value, 
                                                department_id: '', 
                                                course_id: '', 
                                                subject_id: '' 
                                            });
                                            setFilteredCourses([]);
                                            setFilteredSubjects([]);
                                        }}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select year level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(yearLevels).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>
                                                    {value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="department_id">Department *</Label>
                                    <Select
                                        value={assignmentForm.department_id}
                                        onValueChange={(value) => {
                                            setAssignmentForm({ 
                                                ...assignmentForm, 
                                                department_id: value, 
                                                course_id: '', 
                                                subject_id: '' 
                                            });
                                            const filtered = courses.filter(c => c.department_id === parseInt(value));
                                            setFilteredCourses(filtered);
                                            setFilteredSubjects([]);
                                        }}
                                        required
                                        disabled={!assignmentForm.year_level}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((department) => (
                                                <SelectItem key={department.id} value={department.id.toString()}>
                                                    {department.name} ({department.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="course_id">Course *</Label>
                                    <Select
                                        value={assignmentForm.course_id}
                                        onValueChange={(value) => {
                                            setAssignmentForm({ ...assignmentForm, course_id: value, subject_id: '' });
                                            const filtered = subjects.filter(s => s.course_id == null || s.course_id === parseInt(value));
                                            setFilteredSubjects(filtered);
                                        }}
                                        required
                                        disabled={!assignmentForm.department_id}
                                    >
                                        <SelectTrigger className="min-h-[48px] h-auto py-2 whitespace-normal text-left items-start">
                                            <SelectValue placeholder="Select course" className="whitespace-normal text-left" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredCourses.map((course) => (
                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                    <span className="whitespace-normal break-words text-left inline-block">
                                                        {course.name} ({course.code})
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="subject_id">Subject *</Label>
                                    <Select
                                        value={assignmentForm.subject_id}
                                        onValueChange={(value) => setAssignmentForm({ ...assignmentForm, subject_id: value })}
                                        required
                                        disabled={!assignmentForm.course_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={assignmentForm.course_id ? "Select subject" : "Select course first"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredSubjects.map((subject) => (
                                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                                    {subject.name} ({subject.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Semesters</Label>
                                    <div className="space-y-3 p-4 border rounded-md bg-gray-50">
                                        {collegeSemesters.map((semester) => (
                                            <div key={semester.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`semester-${semester.id}`}
                                                    checked={assignmentForm.semester_ids.includes(semester.id.toString())}
                                                    onCheckedChange={(checked) =>
                                                        handleSemesterChange(semester.id.toString(), checked as boolean)
                                                    }
                                                />
                                                <Label htmlFor={`semester-${semester.id}`} className="text-sm font-medium">
                                                    {semester.name}
                                                </Label>
                                            </div>
                                        ))}
                                        {collegeSemesters.length === 0 && (
                                            <p className="text-sm text-gray-500 italic">No semesters available</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label>Grading Periods</Label>
                                    <div className="space-y-3 p-4 border rounded-md bg-gray-50 max-h-40 overflow-y-auto">
                                        {assignmentForm.semester_ids.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">Select a semester first to see grading periods</p>
                                        ) : (
                                            assignmentForm.semester_ids.map((semesterId) => {
                                                const semester = collegeSemesters.find(s => s.id.toString() === semesterId);
                                                const periodsForSemester = allCollegeGradingPeriods
                                                    .filter(period =>
                                                        period.parent_id?.toString() === semesterId &&
                                                        !period.name.toLowerCase().includes('final average')
                                                    )
                                                    .filter((p, i, arr) => arr.findIndex(x => x.name.toLowerCase() === p.name.toLowerCase()) === i);

                                                return (
                                                    <div key={semesterId} className="border-l-2 border-blue-300 pl-3">
                                                        <div className="text-sm font-medium text-blue-700 mb-2">
                                                            {semester?.name} Periods:
                                                        </div>
                                                        <div className="space-y-2">
                                                            {periodsForSemester.map((period) => (
                                                                <div key={period.id} className="flex items-center space-x-2 ml-2">
                                                                    <Checkbox
                                                                        id={`period-${period.id}`}
                                                                        checked={assignmentForm.grading_period_ids.includes(period.id.toString())}
                                                                        onCheckedChange={(checked) =>
                                                                            handleGradingPeriodChange(period.id.toString(), checked as boolean)
                                                                        }
                                                                    />
                                                                    <Label htmlFor={`period-${period.id}`} className="text-sm">
                                                                        {period.name}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                            {periodsForSemester.length === 0 && (
                                                                <p className="text-xs text-gray-400 italic ml-2">No periods available for this semester</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
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
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setAssignmentModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Assign Instructor to Subject</Button>
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
                                        {/* Show the specifically assigned subject if present; otherwise show course subjects */}
                                        <div className="ml-8 mt-2">
                                            <div className="text-sm text-gray-600 mb-1">Subjects:</div>
                                            {assignment.subject ? (
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {assignment.subject.name} ({assignment.subject.code})
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {subjects
                                                        .filter(subject => subject.course_id?.toString() === assignment.course_id.toString())
                                                        .map(subject => (
                                                            <Badge key={subject.id} variant="secondary" className="text-xs">
                                                                {subject.name} ({subject.code})
                                                            </Badge>
                                                        ))}
                                                    {subjects.filter(subject => subject.course_id?.toString() === assignment.course_id.toString()).length === 0 && (
                                                        <span className="text-xs text-gray-400 italic">No subjects for this course</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>{assignment.school_year}</span>
                                        </div>
                                        {assignment.year_level && (
                                            <Badge variant="outline">{yearLevels[assignment.year_level] || assignment.year_level}</Badge>
                                        )}
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
                                    {instructors
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
                                <SelectTrigger className="min-h-[48px] h-auto py-2 whitespace-normal text-left items-start">
                                    <SelectValue placeholder="Select course" className="whitespace-normal text-left" />
                                </SelectTrigger>
                                <SelectContent>
                                    {collegeCourses.map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                            <span className="whitespace-normal break-words text-left inline-block">
                                                {course.name} ({course.department?.name || 'No Department'})
                                            </span>
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
                                    {subjects.map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id.toString()}>
                                            {subject.name} ({subject.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="edit_year_level">Year Level</Label>
                            <Select
                                value={assignmentForm.year_level}
                                onValueChange={(value) => setAssignmentForm({ ...assignmentForm, year_level: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select year level (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(yearLevels).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Semesters</Label>
                            <div className="space-y-2 p-3 border rounded-md bg-gray-50 max-h-24 overflow-y-auto">
                                {collegeSemesters.map((semester) => (
                                    <div key={semester.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`edit-semester-${semester.id}`}
                                            checked={assignmentForm.semester_ids.includes(semester.id.toString())}
                                            onCheckedChange={(checked) =>
                                                handleSemesterChange(semester.id.toString(), checked as boolean)
                                            }
                                        />
                                        <Label htmlFor={`edit-semester-${semester.id}`} className="text-sm">
                                            {semester.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Grading Periods</Label>
                            <div className="space-y-2 p-3 border rounded-md bg-gray-50 max-h-32 overflow-y-auto">
                                {assignmentForm.semester_ids.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic">Select a semester first to see grading periods</p>
                                ) : (
                                    assignmentForm.semester_ids.map((semesterId) => {
                                        const semester = collegeSemesters.find(s => s.id.toString() === semesterId);
                                        const periodsForSemester = allCollegeGradingPeriods
                                            .filter(period =>
                                                period.parent_id?.toString() === semesterId &&
                                                !period.name.toLowerCase().includes('final average')
                                            )
                                            .filter((p, i, arr) => arr.findIndex(x => x.name.toLowerCase() === p.name.toLowerCase()) === i);

                                        return (
                                            <div key={semesterId} className="border-l-2 border-blue-300 pl-2">
                                                <div className="text-xs font-medium text-blue-700 mb-1">
                                                    {semester?.name} Periods:
                                                </div>
                                                <div className="space-y-1">
                                                    {periodsForSemester.map((period) => (
                                                        <div key={period.id} className="flex items-center space-x-2 ml-1">
                                                            <Checkbox
                                                                id={`edit-period-${period.id}`}
                                                                checked={assignmentForm.grading_period_ids.includes(period.id.toString())}
                                                                onCheckedChange={(checked) =>
                                                                    handleGradingPeriodChange(period.id.toString(), checked as boolean)
                                                                }
                                                            />
                                                            <Label htmlFor={`edit-period-${period.id}`} className="text-xs">
                                                                {period.name}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                    {periodsForSemester.length === 0 && (
                                                        <p className="text-xs text-gray-400 italic ml-1">No periods for this semester</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
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


