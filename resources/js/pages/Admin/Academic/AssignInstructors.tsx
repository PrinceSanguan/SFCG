import React, { useState, useEffect } from 'react';
import { router, usePage, useForm } from '@inertiajs/react';
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
    period_type?: string | null;
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
    section_id?: number | null;
    course_id?: number;
    course?: {
        id: number;
        name: string;
        code: string;
    };
    shs_year_level?: string | null;
    jhs_year_level?: string | null;
    college_year_level?: string | null;
    selected_grade_level?: string | null;
}

interface InstructorCourseAssignment {
    id: number;
    instructor_id: number;
    course_id: number;
    academic_level_id: number;
    year_level: string | null;
    grading_period_id: number | null;
    section_id: number | null;
    school_year: string;
    notes: string | null;
    is_active: boolean;
    instructor: User;
    course: Course;
    academicLevel: AcademicLevel;
    gradingPeriod: GradingPeriod | null;
    subject?: Subject | null;
}

interface Section {
    id: number;
    name: string;
    code: string;
    course_id: number;
    academic_level_id: number;
    specific_year_level?: string | null;
}

interface Props {
    user: User;
    assignments: InstructorCourseAssignment[];
    instructors: User[];
    departments: Department[];
    courses: Course[];
    sections: Section[];
    subjects: Subject[];
    gradingPeriods: GradingPeriod[];
    academicLevels: AcademicLevel[];
    yearLevels: Record<string, string>;
}

export default function AssignInstructors({ user, assignments, instructors, departments, courses, sections, subjects, gradingPeriods, academicLevels, yearLevels }: Props) {
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

    const { data: assignmentForm, setData: setAssignmentForm, processing, reset: resetFormData } = useForm({
        instructor_id: '',
        year_level: '',
        department_id: '',
        course_id: '',
        section_id: '',
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
    const [filteredSections, setFilteredSections] = useState<Section[]>([]);
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
    const [sectionJustSelected, setSectionJustSelected] = useState(false);

    // Filter for College level only
    const collegeLevel = academicLevels.find(level => level.key === 'college');
    
    // Initialize filtered data when component loads
    useEffect(() => {
        console.log('Subjects data:', subjects);
        console.log('Courses data:', courses);
        console.log('Departments data:', departments);
        console.log('Sections data:', sections);

        if (assignmentForm.department_id) {
            const filtered = courses.filter(c => c.department_id === parseInt(assignmentForm.department_id));
            setFilteredCourses(filtered);
        }
        if (assignmentForm.course_id) {
            // Filter sections by both course_id AND year level
            const filteredSect = sections.filter(s => {
                const matchesCourse = s.course_id === parseInt(assignmentForm.course_id);
                const matchesYearLevel = !assignmentForm.year_level ||
                    s.specific_year_level === assignmentForm.year_level;
                return matchesCourse && matchesYearLevel;
            });
            console.log('[ADMIN] Filtering sections:', {
                selectedCourseId: assignmentForm.course_id,
                selectedYearLevel: assignmentForm.year_level,
                totalSections: sections.length,
                filteredSections: filteredSect.length,
                sections: filteredSect.map(s => ({ name: s.name, code: s.code, yearLevel: s.specific_year_level }))
            });
            setFilteredSections(filteredSect);
        }

        // Only filter subjects AFTER section is selected
        if (assignmentForm.section_id && sectionJustSelected) {
            const selectedSection = sections.find(s => s.id.toString() === assignmentForm.section_id);
            if (selectedSection) {
                // Filter subjects by section_id - show ONLY subjects assigned to this specific section
                const filteredSubj = subjects.filter(s => {
                    return s.section_id === selectedSection.id;
                });
                console.log('[ADMIN] Filtering subjects by section:', {
                    selectedSectionId: assignmentForm.section_id,
                    sectionCourseId: selectedSection.course_id,
                    sectionYearLevel: selectedSection.specific_year_level,
                    totalSubjects: subjects.length,
                    filteredSubjects: filteredSubj.length,
                    subjects: filteredSubj.map(s => ({ name: s.name, code: s.code, section_id: s.section_id, course_id: s.course_id, yearLevel: s.college_year_level }))
                });
                setFilteredSubjects(filteredSubj);
            }
        } else if (!editModal) {
            // Only clear subjects if NOT in edit mode
            // In edit mode, subjects are already set by openEditModal()
            setFilteredSubjects([]);
        }
    }, [assignmentForm.department_id, assignmentForm.course_id, assignmentForm.year_level, assignmentForm.section_id, sectionJustSelected, courses, subjects, sections, departments, editModal]);
    
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

        console.log('[ADMIN ASSIGN] === DEBUGGING DATA EXTRACTION ===', {
            'assignmentForm.section_id': assignmentForm.section_id,
            'assignmentForm.subject_id': assignmentForm.subject_id,
            'assignmentForm.academic_level_id': assignmentForm.academic_level_id,
            'sections array': sections.map(s => ({ id: s.id, name: s.name, academic_level_id: s.academic_level_id })),
            'subjects array': subjects.map(s => ({ id: s.id, name: s.name, academic_level_id: s.academic_level_id })),
            'collegeLevel': collegeLevel
        });

        // Get academic_level_id from selected section or subject
        let academic_level_id = assignmentForm.academic_level_id;

        console.log('[ADMIN ASSIGN] Step 1 - Initial academic_level_id:', academic_level_id);

        // If not set in form, try to get from selected section
        if (!academic_level_id && assignmentForm.section_id) {
            console.log('[ADMIN ASSIGN] Step 2 - Trying to get from section, section_id:', assignmentForm.section_id);
            const selectedSection = sections.find(s => s.id.toString() === assignmentForm.section_id);
            console.log('[ADMIN ASSIGN] Step 2 - Found section:', selectedSection);
            if (selectedSection) {
                academic_level_id = selectedSection.academic_level_id?.toString();
                console.log('[ADMIN ASSIGN] Step 2 - Extracted academic_level_id from section:', academic_level_id);
            }
        }

        // If still not set, try to get from selected subject
        if (!academic_level_id && assignmentForm.subject_id) {
            console.log('[ADMIN ASSIGN] Step 3 - Trying to get from subject, subject_id:', assignmentForm.subject_id);
            const selectedSubject = subjects.find(s => s.id.toString() === assignmentForm.subject_id);
            console.log('[ADMIN ASSIGN] Step 3 - Found subject:', selectedSubject);
            if (selectedSubject) {
                academic_level_id = selectedSubject.academic_level_id?.toString();
                console.log('[ADMIN ASSIGN] Step 3 - Extracted academic_level_id from subject:', academic_level_id);
            }
        }

        // Fallback to collegeLevel if available
        if (!academic_level_id && collegeLevel) {
            console.log('[ADMIN ASSIGN] Step 4 - Using collegeLevel fallback');
            academic_level_id = collegeLevel.id.toString();
            console.log('[ADMIN ASSIGN] Step 4 - Extracted academic_level_id from collegeLevel:', academic_level_id);
        }

        console.log('[ADMIN ASSIGN] Final academic_level_id:', academic_level_id);

        console.log('[ADMIN ASSIGN] === FORM SUBMISSION STARTED ===', {
            timestamp: new Date().toISOString(),
            instructor_id: assignmentForm.instructor_id,
            subject_id: assignmentForm.subject_id,
            section_id: assignmentForm.section_id,
            grading_period_ids: assignmentForm.grading_period_ids,
            grading_period_ids_count: assignmentForm.grading_period_ids.length,
            academic_level_id: academic_level_id,
            academic_level_id_source: assignmentForm.academic_level_id ? 'form' : assignmentForm.section_id ? 'section' : assignmentForm.subject_id ? 'subject' : 'collegeLevel',
            processing
        });

        // Remove semester_ids (not used for instructors), keep grading_period_ids
        const { semester_ids, ...restForm } = assignmentForm;

        const dataToSubmit = {
            ...restForm,
            grading_period_ids: assignmentForm.grading_period_ids,
            academic_level_id: academic_level_id,
        };

        console.log('[ADMIN ASSIGN] Data being sent to backend:', dataToSubmit);

        router.post('/admin/academic/assign-instructors', dataToSubmit, {
            onSuccess: () => {
                console.log('[ADMIN ASSIGN] === ASSIGNMENT CREATED SUCCESSFULLY ===', {
                    timestamp: new Date().toISOString()
                });
                setAssignmentModal(false);
                resetForm();
            },
            onError: (errors) => {
                console.error('[ADMIN ASSIGN] === ASSIGNMENT CREATION FAILED ===', {
                    timestamp: new Date().toISOString(),
                    errors,
                    errorKeys: Object.keys(errors),
                    errorMessages: Object.values(errors)
                });
            },
        });
    };

    const updateAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editAssignment) return;

        // Get academic_level_id from selected section or subject
        let academic_level_id = assignmentForm.academic_level_id;

        // If not set in form, try to get from selected section
        if (!academic_level_id && assignmentForm.section_id) {
            const selectedSection = sections.find(s => s.id.toString() === assignmentForm.section_id);
            if (selectedSection) {
                academic_level_id = selectedSection.academic_level_id?.toString();
            }
        }

        // If still not set, try to get from selected subject
        if (!academic_level_id && assignmentForm.subject_id) {
            const selectedSubject = subjects.find(s => s.id.toString() === assignmentForm.subject_id);
            if (selectedSubject) {
                academic_level_id = selectedSubject.academic_level_id?.toString();
            }
        }

        // Fallback to collegeLevel if available
        if (!academic_level_id && collegeLevel) {
            academic_level_id = collegeLevel.id.toString();
        }

        // FIXED: Send full array of grading_period_ids to support multi-period editing
        // Backend now handles adding/removing periods based on the array
        console.log('[UPDATE_ASSIGNMENT] Sending grading_period_ids array:', {
            grading_period_ids: assignmentForm.grading_period_ids,
            count: assignmentForm.grading_period_ids.length,
            academic_level_id: academic_level_id
        });

        // Remove semester_ids (not used for instructors), keep grading_period_ids
        const { semester_ids, ...restForm } = assignmentForm;

        router.put(`/admin/academic/assign-instructors/${editAssignment.id}`, {
            ...restForm,
            grading_period_ids: assignmentForm.grading_period_ids, // Send full array
            academic_level_id: academic_level_id,
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
        // CRITICAL DEBUG: Check all properties on the assignment object
        console.log('[EDIT_MODAL] Assignment object keys:', Object.keys(assignment));
        console.log('[EDIT_MODAL] Full assignment object:', assignment);
        console.log('[EDIT_MODAL] gradingPeriod property:', assignment.gradingPeriod);
        console.log('[EDIT_MODAL] grading_period property:', (assignment as any).grading_period);

        console.log('[EDIT_MODAL] Opening edit modal for assignment:', JSON.stringify({
            id: assignment.id,
            instructor_id: assignment.instructor_id,
            instructor_name: assignment.instructor?.name,
            course_id: assignment.course_id,
            course_name: assignment.course?.name,
            subject_id: assignment.subject?.id,
            subject_name: assignment.subject?.name,
            grading_period_id: assignment.grading_period_id,
            gradingPeriod_camelCase: assignment.gradingPeriod,
            grading_period_snakeCase: (assignment as any).grading_period,
            year_level: assignment.year_level,
            school_year: assignment.school_year
        }, null, 2));

        setEditAssignment(assignment);

        // Find the department for the selected course
        const selectedCourse = courses.find(c => c.id === assignment.course_id);
        const departmentId = selectedCourse?.department_id?.toString() || '';

        console.log('[EDIT_MODAL] Selected course and department:', JSON.stringify({
            course_id: assignment.course_id,
            course_name: selectedCourse?.name,
            department_id: departmentId
        }, null, 2));

        // Filter subjects for this course AND year level
        const filteredSubj = subjects.filter(s => {
            const matchesCourse = s.course_id == null || s.course_id === assignment.course_id;
            const matchesYearLevel = !assignment.year_level ||
                s.college_year_level === assignment.year_level;
            return matchesCourse && matchesYearLevel;
        });

        // IMPORTANT: Ensure the currently assigned subject is included in the list
        // even if it doesn't match the filter criteria
        if (assignment.subject && !filteredSubj.find(s => s.id === assignment.subject!.id)) {
            console.log('[EDIT_MODAL] Adding current subject to filtered list (not in initial filter):', {
                subject_id: assignment.subject.id,
                subject_name: assignment.subject.name,
                subject_code: assignment.subject.code
            });
            filteredSubj.unshift(assignment.subject);
        }

        console.log('[EDIT_MODAL] Filtered subjects:', {
            count: filteredSubj.length,
            subjects: filteredSubj.map(s => ({ id: s.id, name: s.name, code: s.code, course_id: s.course_id }))
        });

        setFilteredSubjects(filteredSubj);

        // Filter courses for this department
        if (departmentId) {
            const filtered = courses.filter(c => c.department_id === parseInt(departmentId));
            setFilteredCourses(filtered);
        }

        // Filter sections for this course and year level
        if (assignment.course_id && assignment.year_level) {
            const filteredSect = sections.filter(s => {
                const matchesCourse = s.course_id === assignment.course_id;
                const matchesYearLevel = !assignment.year_level || s.specific_year_level === assignment.year_level;
                return matchesCourse && matchesYearLevel;
            });
            console.log('[EDIT_MODAL] Filtered sections:', {
                count: filteredSect.length,
                sections: filteredSect.map(s => ({ id: s.id, name: s.name, code: s.code, yearLevel: s.specific_year_level }))
            });
            setFilteredSections(filteredSect);
        }

        // MULTI-PERIOD EDIT: Find ALL assignments for this instructor-course-subject-year
        // and collect all their grading_period_ids to pre-populate the checkboxes
        const relatedAssignments = assignments.filter(a =>
            a.instructor_id === assignment.instructor_id &&
            a.course_id === assignment.course_id &&
            a.subject?.id === assignment.subject?.id &&
            a.school_year === assignment.school_year &&
            a.is_active
        );

        console.log('[EDIT_MODAL] Found related assignments for multi-period edit:', {
            count: relatedAssignments.length,
            assignments: relatedAssignments.map(a => ({
                id: a.id,
                grading_period_id: a.grading_period_id,
                grading_period_name: (a as any).grading_period?.name
            }))
        });

        // Determine semester IDs and grading period IDs from ALL related assignments
        let semesterIds: string[] = [];
        let gradingPeriodIds: string[] = [];
        const semesterIdSet = new Set<string>();

        // Process each related assignment to collect all grading periods
        for (const relatedAssignment of relatedAssignments) {
            // CRITICAL FIX: Laravel sends snake_case, not camelCase
            const gradingPeriod = (relatedAssignment as any).grading_period || relatedAssignment.gradingPeriod;

            if (gradingPeriod && relatedAssignment.grading_period_id) {
                // If the grading period has a parent_id, it's a child period
                if (gradingPeriod.parent_id) {
                    semesterIdSet.add(gradingPeriod.parent_id.toString());
                    gradingPeriodIds.push(relatedAssignment.grading_period_id.toString());
                } else {
                    // If no parent_id, the grading period itself IS the semester
                    semesterIdSet.add(relatedAssignment.grading_period_id.toString());
                }
            }
        }

        semesterIds = Array.from(semesterIdSet);

        console.log('[EDIT_MODAL] Collected grading periods from all related assignments:', {
            semester_ids: semesterIds,
            grading_period_ids: gradingPeriodIds,
            total_periods: gradingPeriodIds.length
        });

        const formData = {
            instructor_id: assignment.instructor_id.toString(),
            year_level: assignment.year_level || '',
            department_id: departmentId,
            course_id: assignment.course_id.toString(),
            subject_id: assignment.subject?.id.toString() || '',
            section_id: assignment.section_id?.toString() || '',
            academic_level_id: assignment.academic_level_id.toString(),
            semester_ids: semesterIds,
            grading_period_ids: gradingPeriodIds,
            school_year: assignment.school_year,
            notes: assignment.notes || '',
            is_active: assignment.is_active,
        };

        console.log('[EDIT_MODAL] Setting assignment form data:', JSON.stringify({
            ...formData,
            semester_ids_length: formData.semester_ids.length,
            semester_ids_values: formData.semester_ids,
            grading_period_ids_length: formData.grading_period_ids.length,
            grading_period_ids_values: formData.grading_period_ids,
        }, null, 2));

        setAssignmentForm(formData);

        console.log('[EDIT_MODAL] Assignment form state set, opening modal...');

        setEditModal(true);

        console.log('[EDIT_MODAL] Edit modal opened successfully');

        // Log the state after a small delay to ensure it's updated
        setTimeout(() => {
            console.log('[EDIT_MODAL] Form state after modal opened (delayed check):', JSON.stringify({
                semester_ids: assignmentForm.semester_ids,
                grading_period_ids: assignmentForm.grading_period_ids,
                semester_ids_length: assignmentForm.semester_ids.length,
                grading_period_ids_length: assignmentForm.grading_period_ids.length,
            }, null, 2));
        }, 100);
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge className="bg-green-100 text-green-800">Active</Badge>
        ) : (
            <Badge className="bg-red-100 text-red-800">Inactive</Badge>
        );
    };

    const resetForm = () => {
        resetFormData();
        setFilteredCourses([]);
        setFilteredSubjects([]);
        setFilteredSections([]);
        setSectionJustSelected(false);
        console.log('[ADMIN] Form reset - sectionJustSelected set to false');
    };

    // Helper functions for checkbox handling
    const handleSemesterChange = (semesterId: string, checked: boolean) => {
        setAssignmentForm(data => {
            const updatedSemesters = checked
                ? [...data.semester_ids, semesterId]
                : data.semester_ids.filter(id => id !== semesterId);

            // If unchecking a semester, also uncheck its grading periods
            let updatedGradingPeriods = data.grading_period_ids;
            if (!checked) {
                const periodsToRemove = allCollegeGradingPeriods
                    .filter(period => period.parent_id?.toString() === semesterId)
                    .map(period => period.id.toString());

                updatedGradingPeriods = data.grading_period_ids.filter(
                    periodId => !periodsToRemove.includes(periodId)
                );
            }

            return {
                ...data,
                semester_ids: updatedSemesters,
                grading_period_ids: updatedGradingPeriods,
            };
        });
    };

    const handleGradingPeriodChange = (periodId: string, checked: boolean) => {
        setAssignmentForm(data => {
            const updatedPeriods = checked
                ? [...data.grading_period_ids, periodId]
                : data.grading_period_ids.filter(id => id !== periodId);

            return {
                ...data,
                grading_period_ids: updatedPeriods,
            };
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
                    <Badge variant="secondary">
                        {(() => {
                            // Calculate grouped count
                            const grouped = collegeAssignments.reduce((acc, assignment) => {
                                const key = `${assignment.instructor_id}-${assignment.course_id}-${assignment.school_year}`;
                                acc[key] = true;
                                return acc;
                            }, {} as Record<string, boolean>);
                            return Object.keys(grouped).length;
                        })()} assignments
                    </Badge>
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

                            <div>
                                <Label htmlFor="course_id">Course *</Label>
                                <Select
                                    value={assignmentForm.course_id}
                                    onValueChange={(value) => {
                                        console.log('[ADMIN] Course changed to:', value);
                                        setAssignmentForm({ ...assignmentForm, course_id: value, section_id: '', subject_id: '' });
                                        setSectionJustSelected(false);
                                        console.log('[ADMIN] sectionJustSelected reset to false (course changed)');
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
                                <Label htmlFor="section_id">Section</Label>
                                <Select
                                    value={assignmentForm.section_id}
                                    onValueChange={(value) => {
                                        console.log('[ADMIN] ===== SECTION SELECTED =====');
                                        console.log('[ADMIN] Section changed to:', value);
                                        setAssignmentForm({ ...assignmentForm, section_id: value, subject_id: '' });
                                        setSectionJustSelected(true);
                                        console.log('[ADMIN] sectionJustSelected set to TRUE - Subject should now appear');
                                    }}
                                    disabled={!assignmentForm.course_id || filteredSections.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={assignmentForm.course_id ? (filteredSections.length > 0 ? "Select section" : "No sections available") : "Select course first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredSections.map((section) => (
                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                {section.name}{section.code ? ` (${section.code})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Optional: Select a section to assign this instructor to specific students
                                </p>
                            </div>

                            {/* Subject - Only show after section is selected */}
                            {sectionJustSelected && assignmentForm.section_id && (
                                <div>
                                    <Label htmlFor="subject_id">Subject *</Label>
                                    <Select
                                        value={assignmentForm.subject_id}
                                        onValueChange={(value) => setAssignmentForm({ ...assignmentForm, subject_id: value })}
                                        required
                                        disabled={filteredSubjects.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={filteredSubjects.length > 0 ? "Select subject" : "No subjects available"} />
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
                            )}

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
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Assigning...' : 'Assign Instructor to Subject'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Assignments Table */}
            {collegeAssignments.length > 0 ? (
                <div className="grid gap-4">
                    {(() => {
                        // FIXED: Group assignments by instructor-course-year only (NOT grading_period_id)
                        // This displays one card per instructor-course-year, showing all grading periods
                        const grouped = collegeAssignments.reduce((acc, assignment) => {
                            const key = `${assignment.instructor_id}-${assignment.course_id}-${assignment.school_year}`;
                            if (!acc[key]) {
                                acc[key] = {
                                    instructor: assignment.instructor,
                                    course: assignment.course,
                                    year_level: assignment.year_level,
                                    gradingPeriods: [], // Array of all grading periods for this group
                                    school_year: assignment.school_year,
                                    is_active: assignment.is_active,
                                    assignments: []
                                };
                            }
                            // Collect unique grading periods
                            const gradingPeriod = (assignment as any).grading_period || assignment.gradingPeriod;
                            if (gradingPeriod && !acc[key].gradingPeriods.find((p: any) => p.id === gradingPeriod.id)) {
                                acc[key].gradingPeriods.push(gradingPeriod);
                            }
                            acc[key].assignments.push(assignment);
                            return acc;
                        }, {} as Record<string, {
                            instructor: User,
                            course: Course,
                            year_level: string | null,
                            gradingPeriods: GradingPeriod[],
                            school_year: string,
                            is_active: boolean,
                            assignments: InstructorCourseAssignment[]
                        }>);

                        return Object.values(grouped).map((group, idx) => (
                            <Card key={idx}>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <User className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium">{group.instructor.name}</span>
                                                    </div>
                                                    <span className="text-gray-400">→</span>
                                                    <div className="flex items-center space-x-2">
                                                        <BookOpen className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium">{group.course.name}</span>
                                                        <Badge variant="outline">{group.course.department?.name || 'No Department'}</Badge>
                                                    </div>
                                                </div>

                                                {/* Show all assigned subjects for this instructor/course/period */}
                                                <div className="ml-8 mt-3">
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        {(() => {
                                                            // Get unique subjects
                                                            const uniqueSubjects = new Set(group.assignments.map(a => a.subject?.id).filter(Boolean));
                                                            const subjectCount = uniqueSubjects.size;

                                                            // If only one subject but multiple assignments, they're for different semesters/periods
                                                            if (subjectCount === 1 && group.assignments.length > 1) {
                                                                // List the semester/period names
                                                                const periodNames = group.gradingPeriods.map(p => p.name).join(', ');
                                                                return `Subjects (${periodNames}):`;
                                                            }

                                                            // Otherwise show normal assignment count
                                                            return `Subjects (${group.assignments.length} ${group.assignments.length === 1 ? 'assignment' : 'assignments'}):`;
                                                        })()}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(() => {
                                                            // Get unique subjects using a Map to deduplicate by subject ID
                                                            const subjectsMap = new Map();
                                                            group.assignments.forEach(assignment => {
                                                                if (assignment.subject) {
                                                                    subjectsMap.set(assignment.subject.id, assignment.subject);
                                                                }
                                                            });
                                                            const uniqueSubjects = Array.from(subjectsMap.values());

                                                            return uniqueSubjects.length > 0 ? (
                                                                uniqueSubjects.map((subject, subIdx) => (
                                                                    <Badge key={subIdx} variant="secondary" className="text-xs">
                                                                        {subject.name} ({subject.code})
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic">No specific subjects assigned</span>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{group.school_year}</span>
                                                </div>
                                                {group.year_level && (
                                                    <Badge variant="outline">{yearLevels[group.year_level] || group.year_level}</Badge>
                                                )}
                                                {/* Display all grading periods for this group */}
                                                {group.gradingPeriods.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {group.gradingPeriods.map((period, pIdx) => (
                                                            <Badge key={pIdx} variant="secondary" className="text-xs">
                                                                {period.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                {getStatusBadge(group.is_active)}
                                            </div>
                                        </div>

                                        {/* Individual assignment actions - grouped by subject */}
                                        <div className="border-t pt-3">
                                            <div className="text-xs text-gray-500 mb-2">Individual Subject Actions:</div>
                                            <div className="space-y-2">
                                                {(() => {
                                                    // Group assignments by subject within this instructor-course-year group
                                                    const subjectGroups = group.assignments.reduce((acc, assignment) => {
                                                        const subjectKey = assignment.subject?.id || 'all';
                                                        if (!acc[subjectKey]) {
                                                            acc[subjectKey] = {
                                                                subject: assignment.subject,
                                                                assignments: []
                                                            };
                                                        }
                                                        acc[subjectKey].assignments.push(assignment);
                                                        return acc;
                                                    }, {} as Record<string, { subject: typeof group.assignments[0]['subject'], assignments: typeof group.assignments }>);

                                                    return Object.values(subjectGroups).map((subjectGroup, sgIdx) => (
                                                        <div key={sgIdx} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                                                            <div className="flex items-center space-x-2">
                                                                <BookOpen className="h-3 w-3 text-gray-400" />
                                                                <span className="text-sm font-medium">
                                                                    {subjectGroup.subject?.name || 'All Course Subjects'}
                                                                </span>
                                                                {subjectGroup.subject && (
                                                                    <span className="text-xs text-gray-500">({subjectGroup.subject.code})</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openEditModal(subjectGroup.assignments[0])}
                                                                    title="Edit assignment (will load all grading periods)"
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        if (confirm(`Delete ALL grading periods for this subject (${subjectGroup.assignments.length} assignments)?`)) {
                                                                            // Delete all assignments for this subject
                                                                            subjectGroup.assignments.forEach(assignment => {
                                                                                router.delete(`/admin/academic/assign-instructors/${assignment.id}`, {
                                                                                    preserveScroll: true,
                                                                                });
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="text-red-600 hover:text-red-700"
                                                                    title="Delete all grading periods for this subject"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>

                                        {group.assignments[0].notes && (
                                            <p className="text-sm text-gray-600 border-t pt-3">{group.assignments[0].notes}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ));
                    })()}
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
                <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Instructor Assignment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={updateAssignment} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <Label htmlFor="edit_year_level">Year Level</Label>
                                <Select
                                    value={assignmentForm.year_level}
                                    onValueChange={(value) => setAssignmentForm({ ...assignmentForm, year_level: value })}
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit_department_id">Department</Label>
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

                            <div>
                                <Label htmlFor="edit_course_id">Course</Label>
                                <Select
                                    value={assignmentForm.course_id}
                                    onValueChange={(value) => {
                                        console.log('[ADMIN EDIT] Course changed to:', value);
                                        setAssignmentForm({ ...assignmentForm, course_id: value, section_id: '', subject_id: '' });

                                        // Filter sections for the new course and current year level
                                        const filteredSect = sections.filter(s => {
                                            const matchesCourse = s.course_id === parseInt(value);
                                            const matchesYearLevel = !assignmentForm.year_level || s.specific_year_level === assignmentForm.year_level;
                                            return matchesCourse && matchesYearLevel;
                                        });
                                        setFilteredSections(filteredSect);

                                        setSectionJustSelected(false);
                                        console.log('[ADMIN EDIT] sectionJustSelected reset to false (course changed)');
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
                        </div>

                        <div>
                            <Label htmlFor="edit_section_id">Section</Label>
                            <Select
                                value={assignmentForm.section_id}
                                onValueChange={(value) => {
                                    console.log('[ADMIN EDIT] Section changed to:', value);
                                    setAssignmentForm({ ...assignmentForm, section_id: value });
                                }}
                                disabled={!assignmentForm.course_id || filteredSections.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={assignmentForm.course_id ? (filteredSections.length > 0 ? "Select section" : "No sections available") : "Select course first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredSections.map((section) => (
                                        <SelectItem key={section.id} value={section.id.toString()}>
                                            {section.name}{section.code ? ` (${section.code})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                                Optional: Section assignment for this instructor
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="edit_subject_id">Subject</Label>
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

                        <div>
                            <Label>Semesters</Label>
                            <div className="space-y-2 p-3 border rounded-md bg-gray-50 max-h-24 overflow-y-auto">
                                {(() => {
                                    console.log('[EDIT_MODAL_RENDER] Semester Checkboxes:', JSON.stringify({
                                        semester_ids_in_form: assignmentForm.semester_ids,
                                        semester_ids_type: typeof assignmentForm.semester_ids,
                                        is_array: Array.isArray(assignmentForm.semester_ids),
                                        available_semesters: collegeSemesters.map(s => ({ id: s.id, name: s.name }))
                                    }, null, 2));
                                    return null;
                                })()}
                                {collegeSemesters.map((semester) => {
                                    const isChecked = assignmentForm.semester_ids.includes(semester.id.toString());
                                    console.log('[EDIT_MODAL_RENDER] Semester checkbox:', JSON.stringify({
                                        semester_id: semester.id,
                                        semester_name: semester.name,
                                        semester_id_as_string: semester.id.toString(),
                                        form_semester_ids: assignmentForm.semester_ids,
                                        includes_check: isChecked,
                                    }, null, 2));
                                    return (
                                        <div key={semester.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`edit-semester-${semester.id}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) =>
                                                    handleSemesterChange(semester.id.toString(), checked as boolean)
                                                }
                                            />
                                            <Label htmlFor={`edit-semester-${semester.id}`} className="text-sm">
                                                {semester.name} {isChecked && '✓'}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <Label>Grading Periods</Label>
                            <div className="space-y-2 p-3 border rounded-md bg-gray-50 max-h-32 overflow-y-auto">
                                {(() => {
                                    console.log('[EDIT_MODAL_RENDER] Grading Periods Section:', JSON.stringify({
                                        semester_ids_count: assignmentForm.semester_ids.length,
                                        semester_ids: assignmentForm.semester_ids,
                                        grading_period_ids: assignmentForm.grading_period_ids
                                    }, null, 2));
                                    return null;
                                })()}
                                {assignmentForm.semester_ids.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic">Select a semester first to see grading periods</p>
                                ) : (
                                    assignmentForm.semester_ids.map((semesterId) => {
                                        const semester = collegeSemesters.find(s => s.id.toString() === semesterId);
                                        // FIXED: Use period_type instead of name checking to filter out final average periods
                                        const periodsForSemester = allCollegeGradingPeriods
                                            .filter(period => {
                                                const matchesParent = period.parent_id?.toString() === semesterId;
                                                const isFinalPeriod = period.period_type === 'final';
                                                return matchesParent && !isFinalPeriod;
                                            })
                                            .filter((p, i, arr) => arr.findIndex(x => x.name.toLowerCase() === p.name.toLowerCase()) === i);

                                        console.log('[EDIT_MODAL_RENDER] Periods for semester:', JSON.stringify({
                                            semester_id: semesterId,
                                            semester_name: semester?.name,
                                            periods_count: periodsForSemester.length,
                                            periods: periodsForSemester.map(p => ({ id: p.id, name: p.name, period_type: p.period_type }))
                                        }, null, 2));

                                        return (
                                            <div key={semesterId} className="border-l-2 border-blue-300 pl-2">
                                                <div className="text-xs font-medium text-blue-700 mb-1">
                                                    {semester?.name} Periods:
                                                </div>
                                                <div className="space-y-1">
                                                    {periodsForSemester.map((period) => {
                                                        const isChecked = assignmentForm.grading_period_ids.includes(period.id.toString());
                                                        console.log('[EDIT_MODAL_RENDER] Grading period checkbox:', JSON.stringify({
                                                            period_id: period.id,
                                                            period_name: period.name,
                                                            period_id_as_string: period.id.toString(),
                                                            form_grading_period_ids: assignmentForm.grading_period_ids,
                                                            includes_check: isChecked,
                                                        }, null, 2));
                                                        return (
                                                            <div key={period.id} className="flex items-center space-x-2 ml-1">
                                                                <Checkbox
                                                                    id={`edit-period-${period.id}`}
                                                                    checked={isChecked}
                                                                    onCheckedChange={(checked) =>
                                                                        handleGradingPeriodChange(period.id.toString(), checked as boolean)
                                                                    }
                                                                />
                                                                <Label htmlFor={`edit-period-${period.id}`} className="text-xs">
                                                                    {period.name} {isChecked && '✓'}
                                                                </Label>
                                                            </div>
                                                        );
                                                    })}
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


