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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, GraduationCap, Calendar, User, BookOpen } from 'lucide-react';
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
    semester_number: number | null;
    parent_id: number | null;
    type: string;
    period_type?: string;
}

interface Track {
    id: number;
    name: string;
    code: string;
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
    academic_level_id: number;
    strand_id?: number;
    shs_year_level?: string;
    section_id?: number;
    academicLevel: AcademicLevel;
    strand?: {
        id: number;
        name: string;
        code: string;
        track_id?: number;
        track?: Track;
    };
}

interface Strand {
    id: number;
    name: string;
    code: string;
    academic_level_id: number;
    track_id?: number;
    track?: Track;
}

interface TeacherSubjectAssignment {
    id: number;
    teacher_id: number;
    subject_id: number;
    academic_level_id: number;
    grade_level: string | null;
    grading_period_id: number | null;
    school_year: string;
    notes: string | null;
    is_active: boolean;
    teacher: User;
    subject: Subject;
    academicLevel: AcademicLevel;
    gradingPeriod: GradingPeriod | null;
    strand?: Strand | null;
}

interface Section {
    id: number;
    name: string;
    academic_level_id: number;
    specific_year_level?: string;
    track_id?: number;
    strand_id?: number;
    department_id?: number;
    course_id?: number;
    max_students?: number;
}

interface Props {
    user: User;
    assignments: TeacherSubjectAssignment[];
    teachers: User[];
    subjects: Subject[];
    gradingPeriods: GradingPeriod[];
    academicLevels: AcademicLevel[];
    strands: Strand[];
    tracks: Track[];
    departments: Department[];
    courses: Course[];
    sections: Section[];
}

interface Department {
    id: number;
    name: string;
    code: string;
    description?: string;
    academic_level_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Course {
    id: number;
    name: string;
    code: string;
    description?: string;
    department_id: number;
    units: number;
    is_active: boolean;
    department?: Department;
    created_at: string;
    updated_at: string;
}

export default function AssignTeachers({ user, assignments, teachers, subjects, gradingPeriods, academicLevels, strands, tracks = [], departments = [], courses = [], sections = [] }: Props) {
    const { addToast } = useToast();
    const { props } = usePage<any>();

    // Log initial data on component mount
    useEffect(() => {
        console.log('=== ASSIGN TEACHERS PAGE LOADED ===');
        console.log('All Subjects:', subjects);
        console.log('All Strands:', strands);
        console.log('All Tracks:', tracks);
        console.log('All Sections:', sections);
        console.log('Academic Levels:', academicLevels);
    }, []);

    // Handle flash messages
    useEffect(() => {
        if (props.flash?.success) {
            addToast(props.flash.success, 'success');
        }
        if (props.flash?.error) {
            addToast(props.flash.error, 'error');
        }
    }, [props.flash]);

    // Find Senior High School level ID
    const shsLevel = academicLevels.find(level => level.key === 'senior_highschool');

    const [assignmentForm, setAssignmentForm] = useState({
        teacher_id: '',
        subject_id: '',
        academic_level_id: shsLevel?.id.toString() || '',
        grade_level: '',
        track_id: '',
        strand_id: '',
        section_id: '',
        department_id: '',
        course_id: '',
        semester_ids: [] as string[],
        grading_period_ids: [] as string[],
        school_year: '',
        notes: '',
        is_active: true,
    });

    const [assignmentModal, setAssignmentModal] = useState(false);
    const [editAssignment, setEditAssignment] = useState<TeacherSubjectAssignment | null>(null);
    const [editModal, setEditModal] = useState(false);
    const [filteredStrands, setFilteredStrands] = useState<Strand[]>([]);
    const [filteredSections, setFilteredSections] = useState<Section[]>([]);
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [filteredGradingPeriods, setFilteredGradingPeriods] = useState<GradingPeriod[]>([]);
    // const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);

    // Get academic levels
    // const collegeLevel = academicLevels.find(level => level.key === 'college');
    const jhsLevel = academicLevels.find(level => level.key === 'junior_highschool');
    const elemLevel = academicLevels.find(level => level.key === 'elementary');
    
    // Determine filtering hierarchy based on selected academic level
    const getFilteringHierarchy = (academicLevelId: string) => {
        const level = academicLevels.find(l => l.id.toString() === academicLevelId);
        if (!level) return 'none';
        
        switch (level.key) {
            case 'senior_highschool':
                return 'grade_track_strand_subject';
            case 'college':
                return 'department_course_subject';
            case 'junior_highschool':
            case 'elementary':
                return 'grade_subject';
            default:
                return 'none';
        }
    };
    
    const currentHierarchy = getFilteringHierarchy(assignmentForm.academic_level_id);

    // Get semester options for College/SHS
    const getSemesterOptions = () => {
        if (assignmentForm.academic_level_id) {
            const levelId = parseInt(assignmentForm.academic_level_id);
            const selectedLevel = academicLevels.find(level => level.id === levelId);

            // Only show semester selector for College and SHS
            if (selectedLevel && (selectedLevel.key === 'college' || selectedLevel.key === 'senior_highschool')) {
                return gradingPeriods.filter(period =>
                    period.academic_level_id === levelId &&
                    period.parent_id === null &&
                    period.type === 'semester'
                );
            }
        }
        return [];
    };

    const semesterOptions = getSemesterOptions();

    // Filter grading periods based on selected academic level and semesters
    useEffect(() => {
        if (assignmentForm.academic_level_id) {
            const levelId = parseInt(assignmentForm.academic_level_id);
            let filtered = gradingPeriods.filter(period => period.academic_level_id === levelId);

            // If semesters are selected, filter by selected semesters
            if (assignmentForm.semester_ids.length > 0) {
                const semesterIds = assignmentForm.semester_ids.map(id => parseInt(id));
                // Get periods that belong to selected semesters (children of selected semesters)
                // Exclude "Average" or "final" type periods for SHS
                filtered = filtered.filter(period =>
                    period.parent_id &&
                    semesterIds.includes(period.parent_id) &&
                    !period.name.toLowerCase().includes('average') &&
                    period.type !== 'final_average' &&
                    period.type !== 'final'
                );
            }

            setFilteredGradingPeriods(filtered);
        } else {
            setFilteredGradingPeriods([]);
        }
    }, [assignmentForm.academic_level_id, assignmentForm.semester_ids, gradingPeriods]);


    const shsAssignments = assignments.filter(assignment =>
        shsLevel && assignment.academic_level_id === shsLevel.id
    );

    // Group assignments by teacher+subject+school_year to combine multiple grading periods
    const groupedAssignments = shsAssignments.reduce((groups: any[], assignment) => {
        const key = `${assignment.teacher_id}-${assignment.subject_id}-${assignment.school_year}`;
        const existingGroup = groups.find(g => g.key === key);

        if (existingGroup) {
            // Add this grading period to existing group
            existingGroup.gradingPeriods.push(assignment.gradingPeriod);
            existingGroup.assignmentIds.push(assignment.id);
        } else {
            // Create new group
            groups.push({
                key,
                ...assignment,
                gradingPeriods: assignment.gradingPeriod ? [assignment.gradingPeriod] : [],
                assignmentIds: [assignment.id],
                originalAssignment: assignment, // Keep reference to original for edit/delete
            });
        }

        return groups;
    }, []);

    console.log('[ASSIGN TEACHERS] Grouped assignments:', {
        total_assignments: shsAssignments.length,
        grouped_count: groupedAssignments.length,
        groups: groupedAssignments.map(g => ({
            teacher: g.teacher.name,
            subject: g.subject.name,
            grading_periods: g.gradingPeriods.map((gp: any) => gp?.name || 'N/A'),
        })),
    });

    // Subjects are already filtered by SHS level in the backend
    const shsSubjects = subjects;

    const schoolYearOptions = [
        '2024-2025',
        '2025-2026',
        '2026-2027',
        '2027-2028',
    ];

    const submitAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            '/admin/academic/assign-teachers',
            {
                ...assignmentForm,
                academic_level_id: assignmentForm.academic_level_id,
            },
            {
                onSuccess: () => {
                    setAssignmentModal(false);
                    resetForm();
                },
                onError: (errors) => {
                    console.error(errors);
                },
                preserveScroll: true,
            }
        );
    };

    const updateAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editAssignment) return;

        router.put(
            `/admin/academic/assign-teachers/${editAssignment.id}`,
            {
                ...assignmentForm,
                academic_level_id: shsLevel?.id,
            },
            {
                onSuccess: () => {
                    setEditModal(false);
                },
                onError: (errors) => {
                    console.error(errors);
                },
                preserveScroll: true,
            }
        );
    };

    const destroyAssignment = (id: number) => {
        if (confirm('Are you sure you want to delete this assignment?')) {
            router.delete(`/admin/academic/assign-teachers/${id}`, {
                onSuccess: () => {
                    // Flash message will be handled by useEffect
                },
                onError: (errors) => {
                    console.error(errors);
                },
            });
        }
    };

    const openEditModal = (assignmentOrGroup: any) => {
        // Check if we received a grouped assignment (has gradingPeriods array) or single assignment
        const isGrouped = assignmentOrGroup.gradingPeriods && Array.isArray(assignmentOrGroup.gradingPeriods);
        const assignment = isGrouped ? assignmentOrGroup.originalAssignment : assignmentOrGroup;

        console.log('[EDIT_TEACHER] Opening edit modal:', {
            isGrouped,
            teacher_id: assignment.teacher_id,
            teacher_name: assignment.teacher?.name,
            subject_id: assignment.subject_id,
            subject_name: assignment.subject?.name,
            grading_period_id_single: assignment.grading_period_id,
            grading_periods_count: isGrouped ? assignmentOrGroup.gradingPeriods.length : 1,
            all_grading_periods: isGrouped ? assignmentOrGroup.gradingPeriods.map((gp: any) => ({ id: gp?.id, name: gp?.name })) : [assignment.gradingPeriod]
        });

        // Extract ALL grading period IDs from the grouped assignment
        let gradingPeriodIds: string[] = [];
        if (isGrouped) {
            // Get all grading period IDs from the group
            gradingPeriodIds = assignmentOrGroup.gradingPeriods
                .filter((gp: any) => gp && gp.id) // Filter out null/undefined
                .map((gp: any) => gp.id.toString());

            console.log('[EDIT_TEACHER] Extracted grading period IDs from group:', gradingPeriodIds);
        } else {
            // Single assignment - just use its grading period
            gradingPeriodIds = assignment.grading_period_id ? [assignment.grading_period_id.toString()] : [];
            console.log('[EDIT_TEACHER] Using single grading period ID:', gradingPeriodIds);
        }

        setEditAssignment(assignment);

        const formData = {
            teacher_id: assignment.teacher_id.toString(),
            subject_id: assignment.subject_id.toString(),
            academic_level_id: assignment.academic_level_id.toString(),
            grade_level: assignment.grade_level || '',
            strand_id: assignment.strand ? assignment.strand.id.toString() : '',
            track_id: assignment.strand && assignment.strand.track_id ? assignment.strand.track_id.toString() : '',
            section_id: '',
            department_id: '',
            course_id: '',
            semester_ids: [],
            grading_period_ids: gradingPeriodIds,
            school_year: assignment.school_year,
            notes: assignment.notes || '',
            is_active: assignment.is_active,
        };

        console.log('[EDIT_TEACHER] Setting form data:', formData);

        setAssignmentForm(formData);
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
            academic_level_id: shsLevel?.id.toString() || '',
            grade_level: '',
            track_id: '',
            strand_id: '',
            section_id: '',
            department_id: '',
            course_id: '',
            semester_ids: [],
            grading_period_ids: [],
            school_year: '',
            notes: '',
            is_active: true,
        });
        setFilteredStrands([]);
        setFilteredSections([]);
        setFilteredSubjects([]);
        setFilteredCourses([]);
        setFilteredGradingPeriods([]);
        // setFilteredDepartments([]);
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
                    <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Assign Teacher to Subject</DialogTitle>
                            <DialogDescription>Select a teacher and subject to create a new assignment.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitAssignment} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            {teachers
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
                                    <Label htmlFor="academic_level_id">Academic Level *</Label>
                                    <div className="bg-blue-50 p-3 rounded-md">
                                        <div className="text-sm font-medium text-blue-800">
                                            {shsLevel?.name || 'Senior High School'}
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Dynamic filtering based on academic level */}
                            {currentHierarchy === 'grade_track_strand_subject' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="grade_level">Grade Level *</Label>
                                        <Select
                                            value={assignmentForm.grade_level}
                                            onValueChange={(value) => {
                                                console.log('=== GRADE LEVEL CHANGED ===');
                                                console.log('Selected Grade Level:', value);
                                                setAssignmentForm({ ...assignmentForm, grade_level: value, track_id: '', strand_id: '', subject_id: '' });
                                                setFilteredStrands([]);
                                                setFilteredSubjects([]);
                                            }}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select grade level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="grade_11">Grade 11</SelectItem>
                                                <SelectItem value="grade_12">Grade 12</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="track_id">Track</Label>
                                        <Select
                                            value={assignmentForm.track_id}
                                            onValueChange={(value) => {
                                                console.log('=== TRACK CHANGED ===');
                                                console.log('Selected Track ID:', value);
                                                console.log('All Strands:', strands);
                                                setAssignmentForm({ ...assignmentForm, track_id: value, strand_id: '', subject_id: '' });
                                                const filtered = strands.filter(s => s.track_id === parseInt(value));
                                                console.log('Filtered Strands for Track:', filtered);
                                                setFilteredStrands(filtered);
                                                setFilteredSubjects([]);
                                            }}
                                            disabled={!assignmentForm.grade_level}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select track" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(tracks || []).map((track) => (
                                                    <SelectItem key={track.id} value={track.id.toString()}>
                                                        {track.name} ({track.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="strand_id">Strand</Label>
                                        <Select
                                            value={assignmentForm.strand_id}
                                            onValueChange={(value) => {
                                                console.log('=== STRAND CHANGED ===');
                                                console.log('Selected Strand ID:', value);
                                                console.log('Current Grade Level:', assignmentForm.grade_level);
                                                console.log('Current Track ID:', assignmentForm.track_id);

                                                setAssignmentForm({ ...assignmentForm, strand_id: value, section_id: '', subject_id: '' });

                                                // Filter sections by SHS level, track, strand, and grade level
                                                const filteredSectionsResult = sections.filter(s =>
                                                    s.academic_level_id === shsLevel?.id &&
                                                    s.track_id?.toString() === assignmentForm.track_id &&
                                                    s.strand_id?.toString() === value &&
                                                    s.specific_year_level === assignmentForm.grade_level
                                                );
                                                console.log('Filtered Sections:', filteredSectionsResult);
                                                setFilteredSections(filteredSectionsResult);

                                                // Clear subjects - they will be filtered when section is selected
                                                setFilteredSubjects([]);
                                            }}
                                            disabled={!assignmentForm.track_id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select strand" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredStrands.map((strand) => (
                                                    <SelectItem key={strand.id} value={strand.id.toString()}>
                                                        {strand.name} ({strand.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="section_id">Section</Label>
                                        <Select
                                            value={assignmentForm.section_id}
                                            onValueChange={(value) => {
                                                console.log('=== SECTION CHANGED ===');
                                                console.log('Selected Section ID:', value);
                                                console.log('Current Strand ID:', assignmentForm.strand_id);
                                                console.log('Current Grade Level:', assignmentForm.grade_level);

                                                setAssignmentForm({ ...assignmentForm, section_id: value, subject_id: '' });

                                                // Filter subjects by grade level, strand, and section
                                                console.log('All subjects:', subjects);
                                                const filteredSubjectsResult = subjects.filter(s => {
                                                    // Match by strand (specific to the strand)
                                                    const matchesStrand = s.strand_id === parseInt(assignmentForm.strand_id);
                                                    // Or general subjects (no strand specified)
                                                    const isGeneral = s.strand_id == null;
                                                    // Match by grade level if specified on subject
                                                    const matchesGradeLevel = !s.shs_year_level || s.shs_year_level === assignmentForm.grade_level;
                                                    // Match by section if specified on subject
                                                    const matchesSection = !s.section_id || s.section_id === parseInt(value);

                                                    console.log(`Subject: ${s.name} (${s.code})`, {
                                                        subject_strand_id: s.strand_id,
                                                        selected_strand_id: parseInt(assignmentForm.strand_id),
                                                        matchesStrand,
                                                        isGeneral,
                                                        shs_year_level: s.shs_year_level,
                                                        selected_grade_level: assignmentForm.grade_level,
                                                        matchesGradeLevel,
                                                        subject_section_id: s.section_id,
                                                        selected_section_id: parseInt(value),
                                                        matchesSection,
                                                        passes: (matchesStrand || isGeneral) && matchesGradeLevel && matchesSection
                                                    });

                                                    return (matchesStrand || isGeneral) && matchesGradeLevel && matchesSection;
                                                });
                                                console.log('Filtered Subjects after Section selection:', filteredSubjectsResult);
                                                setFilteredSubjects(filteredSubjectsResult);
                                            }}
                                            disabled={!assignmentForm.strand_id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select section" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredSections.map((section) => (
                                                    <SelectItem key={section.id} value={section.id.toString()}>
                                                        {section.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="subject_id">Subject</Label>
                                        <Select
                                            value={assignmentForm.subject_id}
                                            onValueChange={(value) => {
                                                console.log('=== SUBJECT CHANGED ===');
                                                console.log('Selected Subject ID:', value);
                                                const selectedSubject = filteredSubjects.find(s => s.id.toString() === value);
                                                console.log('Selected Subject:', selectedSubject);
                                                setAssignmentForm({ ...assignmentForm, subject_id: value });
                                            }}
                                            required
                                            disabled={!assignmentForm.section_id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredSubjects.length === 0 ? (
                                                    <SelectItem value="no-subjects" disabled>No subjects available for this selection</SelectItem>
                                                ) : (
                                                    filteredSubjects.map((subject) => (
                                                        <SelectItem key={subject.id} value={subject.id.toString()}>
                                                            {subject.name} ({subject.code})
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {currentHierarchy === 'department_course_subject' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="department_id">Department</Label>
                                        <Select
                                            value={assignmentForm.department_id}
                                            onValueChange={(value) => {
                                                setAssignmentForm({ ...assignmentForm, department_id: value, course_id: '', subject_id: '' });
                                                const filtered = courses.filter(c => c.department_id === parseInt(value));
                                                setFilteredCourses(filtered);
                                                setFilteredSubjects([]);
                                            }}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(departments || []).map((department) => (
                                                    <SelectItem key={department.id} value={department.id.toString()}>
                                                        {department.name} ({department.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="course_id">Course</Label>
                                        <Select
                                            value={assignmentForm.course_id}
                                            onValueChange={(value) => {
                                                setAssignmentForm({ ...assignmentForm, course_id: value, subject_id: '' });
                                                const filtered = subjects.filter(s => (s as unknown as { course_id?: number }).course_id === parseInt(value));
                                                setFilteredSubjects(filtered);
                                            }}
                                            disabled={!assignmentForm.department_id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select course" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredCourses.map((course) => (
                                                    <SelectItem key={course.id} value={course.id.toString()}>
                                                        {course.name} ({course.code})
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
                                            disabled={!assignmentForm.course_id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select subject" />
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
                            )}

                            {currentHierarchy === 'grade_subject' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="grade_level">Grade Level *</Label>
                                        <Select
                                            value={assignmentForm.grade_level}
                                            onValueChange={(value) => {
                                                setAssignmentForm({ ...assignmentForm, grade_level: value, section_id: '', subject_id: '' });
                                                // Filter sections by academic level and year level
                                                const filtered = sections.filter(s =>
                                                    s.academic_level_id === parseInt(assignmentForm.academic_level_id) &&
                                                    s.specific_year_level === value
                                                );
                                                setFilteredSections(filtered);
                                                // Filter subjects by academic level
                                                const filteredSubs = subjects.filter(s => s.academic_level_id === parseInt(assignmentForm.academic_level_id));
                                                setFilteredSubjects(filteredSubs);
                                            }}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select grade level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assignmentForm.academic_level_id === jhsLevel?.id.toString() && (
                                                    <>
                                                        <SelectItem value="grade_7">Grade 7</SelectItem>
                                                        <SelectItem value="grade_8">Grade 8</SelectItem>
                                                        <SelectItem value="grade_9">Grade 9</SelectItem>
                                                        <SelectItem value="grade_10">Grade 10</SelectItem>
                                                    </>
                                                )}
                                                {assignmentForm.academic_level_id === elemLevel?.id.toString() && (
                                                    <>
                                                        <SelectItem value="grade_1">Grade 1</SelectItem>
                                                        <SelectItem value="grade_2">Grade 2</SelectItem>
                                                        <SelectItem value="grade_3">Grade 3</SelectItem>
                                                        <SelectItem value="grade_4">Grade 4</SelectItem>
                                                        <SelectItem value="grade_5">Grade 5</SelectItem>
                                                        <SelectItem value="grade_6">Grade 6</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="section_id">Section *</Label>
                                        <Select
                                            value={assignmentForm.section_id}
                                            onValueChange={(value) => setAssignmentForm({ ...assignmentForm, section_id: value })}
                                            required
                                            disabled={!assignmentForm.grade_level}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select section" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredSections.length === 0 ? (
                                                    <SelectItem value="no-sections" disabled>No sections available</SelectItem>
                                                ) : (
                                                    filteredSections.map((section) => (
                                                        <SelectItem key={section.id} value={section.id.toString()}>
                                                            {section.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="subject_id">Subject</Label>
                                        <Select
                                            value={assignmentForm.subject_id}
                                            onValueChange={(value) => setAssignmentForm({ ...assignmentForm, subject_id: value })}
                                            required
                                            disabled={!assignmentForm.section_id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select subject" />
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
                            )}

                            {semesterOptions.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border rounded-lg p-4">
                                        <Label className="text-lg font-semibold mb-3 block">Semesters</Label>
                                        <div className="space-y-3">
                                            {semesterOptions.map((semester) => (
                                                <div key={semester.id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`semester-${semester.id}`}
                                                        checked={assignmentForm.semester_ids.includes(semester.id.toString())}
                                                        onChange={(e) => {
                                                            const semesterId = semester.id.toString();
                                                            if (e.target.checked) {
                                                                setAssignmentForm({
                                                                    ...assignmentForm,
                                                                    semester_ids: [...assignmentForm.semester_ids, semesterId],
                                                                    grading_period_ids: []
                                                                });
                                                            } else {
                                                                setAssignmentForm({
                                                                    ...assignmentForm,
                                                                    semester_ids: assignmentForm.semester_ids.filter(id => id !== semesterId),
                                                                    grading_period_ids: []
                                                                });
                                                            }
                                                        }}
                                                        className="w-5 h-5 rounded border-gray-300"
                                                    />
                                                    <Label htmlFor={`semester-${semester.id}`} className="text-base font-normal cursor-pointer">
                                                        {semester.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border rounded-lg p-4">
                                        <Label className="text-lg font-semibold mb-3 block">Grading Periods</Label>
                                        {assignmentForm.semester_ids.length === 0 ? (
                                            <p className="text-sm text-gray-500">Select a semester first</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {assignmentForm.semester_ids.map((semesterId) => {
                                                    const semester = semesterOptions.find(s => s.id.toString() === semesterId);
                                                    const periods = filteredGradingPeriods.filter(
                                                        p => p.parent_id === parseInt(semesterId) && p.period_type !== 'final'
                                                    );

                                                    return periods.length > 0 ? (
                                                        <div key={semesterId}>
                                                            <div className="text-sm font-medium text-blue-600 mb-2 border-l-4 border-blue-600 pl-2">
                                                                {semester?.name} Periods:
                                                            </div>
                                                            <div className="space-y-2 ml-2">
                                                                {periods.map((period) => (
                                                                    <div key={period.id} className="flex items-center space-x-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`period-${period.id}`}
                                                                            checked={assignmentForm.grading_period_ids.includes(period.id.toString())}
                                                                            onChange={(e) => {
                                                                                const periodId = period.id.toString();
                                                                                if (e.target.checked) {
                                                                                    setAssignmentForm({
                                                                                        ...assignmentForm,
                                                                                        grading_period_ids: [...assignmentForm.grading_period_ids, periodId]
                                                                                    });
                                                                                } else {
                                                                                    setAssignmentForm({
                                                                                        ...assignmentForm,
                                                                                        grading_period_ids: assignmentForm.grading_period_ids.filter(id => id !== periodId)
                                                                                    });
                                                                                }
                                                                            }}
                                                                            className="w-4 h-4 rounded border-gray-300"
                                                                        />
                                                                        <Label htmlFor={`period-${period.id}`} className="text-base font-normal cursor-pointer">
                                                                            {period.name}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <Button type="submit">Assign Teacher</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Assignments Table */}
            {groupedAssignments.length > 0 ? (
                <div className="grid gap-4">
                    {groupedAssignments.map((group) => (
                        <Card key={group.key}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">{group.teacher.name}</span>
                                        </div>
                                        <span className="text-gray-400">→</span>
                                        <div className="flex items-center space-x-2">
                                            <BookOpen className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">{group.subject.name}</span>
                                            <Badge variant="outline">{group.subject.code}</Badge>
                                            {getCoreBadge(group.subject.is_core)}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>{group.school_year}</span>
                                        </div>
                                        {getStatusBadge(group.is_active)}
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(group)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => destroyAssignment(group.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                    <span>Units: {group.subject.units}</span>
                                    <span>Hours/Week: {group.subject.hours_per_week}</span>
                                </div>
                                {/* Display Grading Periods as badges */}
                                {group.gradingPeriods.length > 0 && (
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-sm font-medium text-gray-700">Grading Periods:</span>
                                        <div className="flex flex-wrap gap-1">
                                            {group.gradingPeriods.map((gp: any, index: number) => (
                                                gp && <Badge key={index} variant="secondary" className="text-xs">{gp.name}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {group.notes && (
                                    <p className="text-sm text-gray-600 mt-2">{group.notes}</p>
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
                <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Teacher Assignment</DialogTitle>
                        <DialogDescription>Update the teacher assignment details.</DialogDescription>
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
                                    {teachers
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
                                    {shsSubjects.map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id.toString()}>
                                            {subject.name} ({subject.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="edit_strand_id">Strand</Label>
                            <Select
                                value={assignmentForm.strand_id}
                                onValueChange={(value) => setAssignmentForm({ ...assignmentForm, strand_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select strand (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {strands.filter(s => s.academic_level_id === (shsLevel?.id ?? 0)).map((strand) => (
                                        <SelectItem key={strand.id} value={strand.id.toString()}>
                                            {strand.name} ({strand.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="edit_grading_periods">Grading Periods</Label>
                            <div className="border rounded-lg p-3">
                                {(() => {
                                    console.log('[EDIT_TEACHER_RENDER] Rendering grading periods:', {
                                        grading_period_ids: assignmentForm.grading_period_ids,
                                        filteredGradingPeriods_count: filteredGradingPeriods.length
                                    });

                                    // Filter out "Average" periods (auto-calculated)
                                    const assignablePeriods = filteredGradingPeriods.filter(
                                        p => p.parent_id !== null && p.period_type !== 'final'
                                    );

                                    console.log('[EDIT_TEACHER_RENDER] Assignable periods:', {
                                        count: assignablePeriods.length,
                                        periods: assignablePeriods.map(p => ({ id: p.id, name: p.name, parent_id: p.parent_id }))
                                    });

                                    // Get unique parent semester IDs from assignable periods
                                    const uniqueParentIds = [...new Set(
                                        assignablePeriods.map(p => p.parent_id).filter(id => id !== null)
                                    )];

                                    if (uniqueParentIds.length === 0) {
                                        return <p className="text-sm text-gray-500">No grading periods available</p>;
                                    }

                                    return (
                                        <div className="space-y-4">
                                            {uniqueParentIds.map((parentId) => {
                                                const semester = semesterOptions.find(s => s.id === parentId);
                                                const periods = assignablePeriods.filter(p => p.parent_id === parentId);

                                                return periods.length > 0 ? (
                                                    <div key={parentId}>
                                                        <div className="text-sm font-medium text-blue-600 mb-2 border-l-4 border-blue-600 pl-2">
                                                            {semester?.name} Periods:
                                                        </div>
                                                        <div className="space-y-2 ml-2">
                                                            {periods.map((period) => (
                                                                <div key={period.id} className="flex items-center space-x-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`edit-period-${period.id}`}
                                                                        checked={assignmentForm.grading_period_ids.includes(period.id.toString())}
                                                                        onChange={(e) => {
                                                                            const periodId = period.id.toString();
                                                                            if (e.target.checked) {
                                                                                setAssignmentForm({
                                                                                    ...assignmentForm,
                                                                                    grading_period_ids: [...assignmentForm.grading_period_ids, periodId]
                                                                                });
                                                                            } else {
                                                                                setAssignmentForm({
                                                                                    ...assignmentForm,
                                                                                    grading_period_ids: assignmentForm.grading_period_ids.filter(id => id !== periodId)
                                                                                });
                                                                            }
                                                                        }}
                                                                        className="w-4 h-4 rounded border-gray-300"
                                                                    />
                                                                    <Label htmlFor={`edit-period-${period.id}`} className="text-sm font-normal cursor-pointer">
                                                                        {period.name}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    );
                                })()}
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


