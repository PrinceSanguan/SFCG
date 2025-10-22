import React, { useState, useEffect } from 'react';
import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, User, BookOpen, Calendar, Users } from 'lucide-react';
import { Link, router } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface Course {
    id: number;
    name: string;
    code: string;
    academicLevel: {
        id: number;
        name: string;
        key: string;
    };
}

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
    units: number;
    course_id: number | null;
    academic_level_id: number;
    course: Course | null;
    academicLevel: {
        id: number;
        name: string;
        key: string;
    };
    shs_year_level?: string | null;
    jhs_year_level?: string | null;
    college_year_level?: string | null;
    selected_grade_level?: string | null;
}

interface AcademicLevel {
    id: number;
    name: string;
    key: string;
}

interface GradingPeriod {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    code: string;
    course_id?: number | null;
    specific_year_level?: string | null;
    academic_level_id?: number;
    department_id?: number | null;
    track_id?: number | null;
    strand_id?: number | null;
    department?: { id: number; name: string; code: string } | null;
    course?: { id: number; name: string; code: string } | null;
    track?: { id: number; name: string; code: string } | null;
    strand?: { id: number; name: string; code: string } | null;
}

interface InstructorSubjectAssignment {
    id: number;
    instructor_id: number;
    subject_id: number;
    section_id: number;
    academic_level_id: number;
    grading_period_id: number | null;
    school_year: string;
    notes: string | null;
    is_active: boolean;
    instructor: User;
    subject: Subject;
    section: Section;
    academicLevel: AcademicLevel;
    gradingPeriod: GradingPeriod | null;
    assignedBy: User;
    auto_enroll_students?: boolean;
}

interface Props {
    user: User;
    assignments: InstructorSubjectAssignment[];
    instructors: User[];
    subjects: Subject[];
    sections: Section[];
    academicLevels: AcademicLevel[];
    gradingPeriods: GradingPeriod[];
}

export default function AssignInstructorsSubjects({
    user,
    assignments,
    instructors,
    subjects,
    sections,
    academicLevels,
    gradingPeriods
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAcademicLevel, setSelectedAcademicLevel] = useState<string>('');
    const [selectedYearLevel, setSelectedYearLevel] = useState<string>('');
    const [selectedDepartmentOrTrack, setSelectedDepartmentOrTrack] = useState<string>('');
    const [selectedCourseOrStrand, setSelectedCourseOrStrand] = useState<string>('');
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
    const [filteredSections, setFilteredSections] = useState<Section[]>([]);
    const [availableDepartments, setAvailableDepartments] = useState<any[]>([]);
    const [availableCourses, setAvailableCourses] = useState<any[]>([]);
    const [availableTracks, setAvailableTracks] = useState<any[]>([]);
    const [availableStrands, setAvailableStrands] = useState<any[]>([]);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<InstructorSubjectAssignment | null>(null);
    const [formData, setFormData] = useState({
        instructor_id: '',
        subject_id: '',
        section_id: '',
        academic_level_id: '',
        grading_period_id: '',
        school_year: '2024-2025',
        notes: '',
        auto_enroll_students: true,
    });

    // Extract unique departments, courses, tracks, and strands based on academic level and year level
    useEffect(() => {
        if (!selectedAcademicLevel) {
            setAvailableDepartments([]);
            setAvailableCourses([]);
            setAvailableTracks([]);
            setAvailableStrands([]);
            return;
        }

        const academicLevelId = parseInt(selectedAcademicLevel);
        const selectedLevel = academicLevels.find(level => level.id === academicLevelId);

        if (!selectedLevel) return;

        // Filter sections by academic level and optionally by year level
        let relevantSections = sections.filter(section => section.academic_level_id === academicLevelId);
        if (selectedYearLevel) {
            relevantSections = relevantSections.filter(section => section.specific_year_level === selectedYearLevel);
        }

        // Extract unique values based on academic level type
        if (selectedLevel.key === 'college') {
            // Extract unique departments
            const deptMap = new Map();
            relevantSections.forEach(section => {
                if (section.department && section.department_id) {
                    deptMap.set(section.department_id, section.department);
                }
            });
            setAvailableDepartments(Array.from(deptMap.values()));

            // Extract unique courses filtered by selected department
            if (selectedDepartmentOrTrack) {
                const courseMap = new Map();
                relevantSections
                    .filter(section => section.department_id?.toString() === selectedDepartmentOrTrack)
                    .forEach(section => {
                        if (section.course && section.course_id) {
                            courseMap.set(section.course_id, section.course);
                        }
                    });
                setAvailableCourses(Array.from(courseMap.values()));
            } else {
                setAvailableCourses([]);
            }
        } else if (selectedLevel.key === 'senior_highschool') {
            // Extract unique tracks
            const trackMap = new Map();
            relevantSections.forEach(section => {
                if (section.track && section.track_id) {
                    trackMap.set(section.track_id, section.track);
                }
            });
            setAvailableTracks(Array.from(trackMap.values()));

            // Extract unique strands filtered by selected track
            if (selectedDepartmentOrTrack) {
                const strandMap = new Map();
                relevantSections
                    .filter(section => section.track_id?.toString() === selectedDepartmentOrTrack)
                    .forEach(section => {
                        if (section.strand && section.strand_id) {
                            strandMap.set(section.strand_id, section.strand);
                        }
                    });
                setAvailableStrands(Array.from(strandMap.values()));
            } else {
                setAvailableStrands([]);
            }
        }
    }, [selectedAcademicLevel, selectedYearLevel, selectedDepartmentOrTrack, sections, academicLevels]);

    // Filter sections based on cascading selections: year level → department/track → course/strand
    useEffect(() => {
        if (!selectedAcademicLevel) {
            setFilteredSections([]);
            return;
        }

        const academicLevelId = parseInt(selectedAcademicLevel);
        const selectedLevel = academicLevels.find(level => level.id === academicLevelId);

        if (!selectedLevel) {
            setFilteredSections([]);
            return;
        }

        // Start with sections for the selected academic level
        let filtered = sections.filter(section => section.academic_level_id === academicLevelId);

        // Filter by year level if selected
        if (selectedYearLevel) {
            filtered = filtered.filter(section => section.specific_year_level === selectedYearLevel);
        }

        // For College: filter by department and course
        if (selectedLevel.key === 'college') {
            if (selectedDepartmentOrTrack) {
                const deptId = parseInt(selectedDepartmentOrTrack);
                filtered = filtered.filter(section => section.department_id === deptId);
            }
            if (selectedCourseOrStrand) {
                const courseId = parseInt(selectedCourseOrStrand);
                filtered = filtered.filter(section => section.course_id === courseId);
            }
        }

        // For SHS: filter by track and strand
        if (selectedLevel.key === 'senior_highschool') {
            if (selectedDepartmentOrTrack) {
                const trackId = parseInt(selectedDepartmentOrTrack);
                filtered = filtered.filter(section => section.track_id === trackId);
            }
            if (selectedCourseOrStrand) {
                const strandId = parseInt(selectedCourseOrStrand);
                filtered = filtered.filter(section => section.strand_id === strandId);
            }
        }

        console.log('Filtered sections:', filtered);
        setFilteredSections(filtered);
    }, [selectedAcademicLevel, selectedYearLevel, selectedDepartmentOrTrack, selectedCourseOrStrand, sections, academicLevels]);

    // Filter subjects based on selected section (subjects should only show after section is selected)
    useEffect(() => {
        if (!formData.section_id || !selectedAcademicLevel) {
            setFilteredSubjects([]);
            return;
        }

        const selectedSection = sections.find(s => s.id.toString() === formData.section_id);
        if (!selectedSection) {
            setFilteredSubjects([]);
            return;
        }

        const academicLevelId = parseInt(selectedAcademicLevel);
        const selectedLevel = academicLevels.find(level => level.id === academicLevelId);

        if (!selectedLevel) {
            setFilteredSubjects([]);
            return;
        }

        // Filter subjects based on the selected section's properties
        let filtered = subjects.filter(subject =>
            subject.academic_level_id === academicLevelId
        );

        // For College: filter by course and year level
        if (selectedLevel.key === 'college' && selectedSection.course_id) {
            filtered = filtered.filter(subject => {
                const matchesCourse = subject.course_id === selectedSection.course_id;
                const collegeYearLevel = (subject as any).college_year_level;

                if (collegeYearLevel && selectedSection.specific_year_level) {
                    return matchesCourse && collegeYearLevel === selectedSection.specific_year_level;
                }

                return matchesCourse;
            });
        }

        // For SHS: filter by strand and year level
        if (selectedLevel.key === 'senior_highschool') {
            filtered = filtered.filter(subject => {
                const subjectYearLevel = subject.shs_year_level;

                if (subjectYearLevel && selectedSection.specific_year_level) {
                    return subjectYearLevel === selectedSection.specific_year_level;
                }

                return true;
            });
        }

        // For JHS: filter by year level
        if (selectedLevel.key === 'junior_highschool') {
            filtered = filtered.filter(subject => {
                const subjectYearLevel = subject.jhs_year_level;

                if (subjectYearLevel && selectedSection.specific_year_level) {
                    return subjectYearLevel === selectedSection.specific_year_level;
                }

                return true;
            });
        }

        // For Elementary: filter by year level
        if (selectedLevel.key === 'elementary') {
            filtered = filtered.filter(subject => {
                const subjectYearLevel = subject.selected_grade_level;

                if (subjectYearLevel && selectedSection.specific_year_level) {
                    return subjectYearLevel === selectedSection.specific_year_level;
                }

                return true;
            });
        }

        console.log('Filtered subjects:', filtered);
        setFilteredSubjects(filtered);
    }, [formData.section_id, selectedAcademicLevel, subjects, sections, academicLevels]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const url = editingAssignment 
            ? `/admin/academic/assign-instructors-subjects/${editingAssignment.id}`
            : '/admin/academic/assign-instructors-subjects';
        
        const method = editingAssignment ? 'put' : 'post';
        
        // Use Inertia router to submit the form
        router.visit(url, {
            method,
            data: formData,
            onSuccess: () => {
                setShowAssignmentModal(false);
                setEditingAssignment(null);
                resetForm();
            },
        });
    };

    const handleEdit = (assignment: InstructorSubjectAssignment) => {
        setEditingAssignment(assignment);

        // Get the section to extract year level and other properties
        const section = sections.find(s => s.id === assignment.section_id);

        setFormData({
            instructor_id: assignment.instructor_id.toString(),
            subject_id: assignment.subject_id.toString(),
            section_id: assignment.section_id.toString(),
            academic_level_id: assignment.academic_level_id.toString(),
            grading_period_id: assignment.grading_period_id?.toString() || '',
            school_year: assignment.school_year,
            notes: assignment.notes || '',
            auto_enroll_students: assignment.auto_enroll_students || true,
        });
        setSelectedAcademicLevel(assignment.academic_level_id.toString());

        // Set the cascading selections based on the section
        if (section) {
            setSelectedYearLevel(section.specific_year_level || '');
            if (section.department_id) {
                setSelectedDepartmentOrTrack(section.department_id.toString());
            } else if (section.track_id) {
                setSelectedDepartmentOrTrack(section.track_id.toString());
            }
            if (section.course_id) {
                setSelectedCourseOrStrand(section.course_id.toString());
            } else if (section.strand_id) {
                setSelectedCourseOrStrand(section.strand_id.toString());
            }
        }

        setShowAssignmentModal(true);
    };

    const handleDelete = (assignment: InstructorSubjectAssignment) => {
        if (confirm('Are you sure you want to delete this assignment?')) {
            router.delete(`/admin/academic/assign-instructors-subjects/${assignment.id}`);
        }
    };

    const resetForm = () => {
        setFormData({
            instructor_id: '',
            subject_id: '',
            section_id: '',
            academic_level_id: '',
            grading_period_id: '',
            school_year: '2024-2025',
            notes: '',
            auto_enroll_students: true,
        });
        setSelectedAcademicLevel('');
        setSelectedYearLevel('');
        setSelectedDepartmentOrTrack('');
        setSelectedCourseOrStrand('');
        setFilteredSections([]);
        setFilteredSubjects([]);
        setEditingAssignment(null);
    };

    const filteredAssignments = assignments.filter(assignment => {
        const searchLower = searchTerm.toLowerCase();
        return (
            assignment.instructor.name.toLowerCase().includes(searchLower) ||
            assignment.subject.name.toLowerCase().includes(searchLower) ||
            (assignment.subject.course?.name.toLowerCase().includes(searchLower) || false) ||
            assignment.academicLevel.name.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Link href="/admin/academic" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Academic Management
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Assign Instructors (Subjects)
                            </h1>
                        </div>

                        {/* Information Banner */}
                        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-blue-900 dark:text-blue-100">
                                            Instructor Subject Assignments
                                        </h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                            Manage instructor assignments by subject and section. Select the academic level, choose the subject, then select the section. When an instructor is assigned to a section's subject, all students enrolled in that section will automatically be assigned to that instructor.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions Bar */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <Input
                                        placeholder="Search assignments..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-64"
                                    />
                                </div>
                            </div>
                            <Button 
                                onClick={() => {
                                    resetForm();
                                    setShowAssignmentModal(true);
                                }}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Assign Instructor
                            </Button>
                        </div>

                        {/* Assignments List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Instructor Subject Assignments</span>
                                    <span className="text-sm text-muted-foreground">
                                        {filteredAssignments.length} assignments
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {filteredAssignments.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredAssignments.map((assignment) => (
                                            <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <User className="h-5 w-5 text-gray-400" />
                                                        <div>
                                                            <p className="font-medium">{assignment.instructor.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {assignment.subject.name}
                                                                {assignment.subject.course && (
                                                                    <> • {assignment.subject.course.name}</>
                                                                )}
                                                                {assignment.section && (
                                                                    <> • Section {assignment.section.name}</>
                                                                )}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {assignment.academicLevel.name}
                                                                </Badge>
                                                                {assignment.subject.course && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {assignment.subject.course.code}
                                                                    </Badge>
                                                                )}
                                                                {assignment.section && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {assignment.section.code || assignment.section.name}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-muted-foreground">
                                                            {assignment.school_year}
                                                        </span>
                                                    </div>
                                                    <Badge 
                                                        variant={assignment.is_active ? "default" : "secondary"}
                                                        className={assignment.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                                    >
                                                        {assignment.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link href={route('admin.assign-instructors-subjects.students', assignment.id)}>
                                                                <Users className="h-4 w-4 mr-2" />
                                                                Manage Students
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleEdit(assignment)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDelete(assignment)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {searchTerm ? 'No assignments found matching your search.' : 'No instructor subject assignments have been created yet.'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Assignment Modal */}
            <Dialog open={showAssignmentModal} onOpenChange={setShowAssignmentModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAssignment ? 'Edit Instructor Assignment' : 'Assign Instructor to Subject'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Instructor and Academic Level */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="instructor_id">Instructor *</Label>
                                <Select
                                    value={formData.instructor_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, instructor_id: value }))}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select instructor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {instructors.map((instructor) => (
                                            <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                                {instructor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="academic_level_id">Academic Level *</Label>
                                <Select
                                    value={formData.academic_level_id}
                                    onValueChange={(value) => {
                                        setFormData(prev => ({ ...prev, academic_level_id: value, section_id: '', subject_id: '' }));
                                        setSelectedAcademicLevel(value);
                                        setSelectedYearLevel('');
                                        setSelectedDepartmentOrTrack('');
                                        setSelectedCourseOrStrand('');
                                    }}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select academic level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicLevels.map((level) => (
                                            <SelectItem key={level.id} value={level.id.toString()}>
                                                {level.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Year Level - Show for all academic levels */}
                        {selectedAcademicLevel && (() => {
                            const selectedLevel = academicLevels.find(l => l.id.toString() === selectedAcademicLevel);
                            if (!selectedLevel) return null;

                            let yearLevelOptions: { value: string; label: string }[] = [];

                            if (selectedLevel.key === 'elementary') {
                                yearLevelOptions = [
                                    { value: 'grade_1', label: 'Grade 1' },
                                    { value: 'grade_2', label: 'Grade 2' },
                                    { value: 'grade_3', label: 'Grade 3' },
                                    { value: 'grade_4', label: 'Grade 4' },
                                    { value: 'grade_5', label: 'Grade 5' },
                                    { value: 'grade_6', label: 'Grade 6' },
                                ];
                            } else if (selectedLevel.key === 'junior_highschool') {
                                yearLevelOptions = [
                                    { value: 'grade_7', label: 'Grade 7' },
                                    { value: 'grade_8', label: 'Grade 8' },
                                    { value: 'grade_9', label: 'Grade 9' },
                                    { value: 'grade_10', label: 'Grade 10' },
                                ];
                            } else if (selectedLevel.key === 'senior_highschool') {
                                yearLevelOptions = [
                                    { value: 'grade_11', label: 'Grade 11' },
                                    { value: 'grade_12', label: 'Grade 12' },
                                ];
                            } else if (selectedLevel.key === 'college') {
                                yearLevelOptions = [
                                    { value: '1st_year', label: '1st Year' },
                                    { value: '2nd_year', label: '2nd Year' },
                                    { value: '3rd_year', label: '3rd Year' },
                                    { value: '4th_year', label: '4th Year' },
                                ];
                            }

                            return (
                                <div>
                                    <Label htmlFor="year_level">Year Level *</Label>
                                    <Select
                                        value={selectedYearLevel}
                                        onValueChange={(value) => {
                                            setSelectedYearLevel(value);
                                            setSelectedDepartmentOrTrack('');
                                            setSelectedCourseOrStrand('');
                                            setFormData(prev => ({ ...prev, section_id: '', subject_id: '' }));
                                        }}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select year level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearLevelOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            );
                        })()}

                        {/* Department/Track and Course/Strand for College and SHS */}
                        {selectedAcademicLevel && selectedYearLevel && (() => {
                            const selectedLevel = academicLevels.find(l => l.id.toString() === selectedAcademicLevel);
                            if (!selectedLevel) return null;

                            if (selectedLevel.key === 'college') {
                                return (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="department">Department *</Label>
                                            <Select
                                                value={selectedDepartmentOrTrack}
                                                onValueChange={(value) => {
                                                    setSelectedDepartmentOrTrack(value);
                                                    setSelectedCourseOrStrand('');
                                                    setFormData(prev => ({ ...prev, section_id: '', subject_id: '' }));
                                                }}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableDepartments.map((dept) => (
                                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                                            {dept.name} ({dept.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="course">Course *</Label>
                                            <Select
                                                value={selectedCourseOrStrand}
                                                onValueChange={(value) => {
                                                    setSelectedCourseOrStrand(value);
                                                    setFormData(prev => ({ ...prev, section_id: '', subject_id: '' }));
                                                }}
                                                disabled={!selectedDepartmentOrTrack || availableCourses.length === 0}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={selectedDepartmentOrTrack ? "Select course" : "Select department first"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableCourses.map((course) => (
                                                        <SelectItem key={course.id} value={course.id.toString()}>
                                                            {course.name} ({course.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                );
                            }

                            if (selectedLevel.key === 'senior_highschool') {
                                return (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="track">Track *</Label>
                                            <Select
                                                value={selectedDepartmentOrTrack}
                                                onValueChange={(value) => {
                                                    setSelectedDepartmentOrTrack(value);
                                                    setSelectedCourseOrStrand('');
                                                    setFormData(prev => ({ ...prev, section_id: '', subject_id: '' }));
                                                }}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select track" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableTracks.map((track) => (
                                                        <SelectItem key={track.id} value={track.id.toString()}>
                                                            {track.name} ({track.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="strand">Strand *</Label>
                                            <Select
                                                value={selectedCourseOrStrand}
                                                onValueChange={(value) => {
                                                    setSelectedCourseOrStrand(value);
                                                    setFormData(prev => ({ ...prev, section_id: '', subject_id: '' }));
                                                }}
                                                disabled={!selectedDepartmentOrTrack || availableStrands.length === 0}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={selectedDepartmentOrTrack ? "Select strand" : "Select track first"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableStrands.map((strand) => (
                                                        <SelectItem key={strand.id} value={strand.id.toString()}>
                                                            {strand.name} ({strand.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })()}

                        {/* Section - Show after year level (and department/course for College, track/strand for SHS) */}
                        {selectedAcademicLevel && selectedYearLevel && (() => {
                            const selectedLevel = academicLevels.find(l => l.id.toString() === selectedAcademicLevel);
                            if (!selectedLevel) return null;

                            // For College and SHS, require department/track and course/strand
                            if ((selectedLevel.key === 'college' || selectedLevel.key === 'senior_highschool') &&
                                (!selectedDepartmentOrTrack || !selectedCourseOrStrand)) {
                                return null;
                            }

                            return (
                                <div>
                                    <Label htmlFor="section_id">Section *</Label>
                                    <Select
                                        value={formData.section_id}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, section_id: value, subject_id: '' }))}
                                        disabled={filteredSections.length === 0}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredSections.map((section) => (
                                                <SelectItem key={section.id} value={section.id.toString()}>
                                                    {section.name}{section.code ? ` (${section.code})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {filteredSections.length === 0 && (
                                        <p className="text-sm text-amber-600 mt-1">
                                            No sections available. Please add sections first or adjust your selections.
                                        </p>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Subject - Only show after section is selected */}
                        {formData.section_id && (
                            <div>
                                <Label htmlFor="subject_id">Subject *</Label>
                                <Select
                                    value={formData.subject_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, subject_id: value }))}
                                    disabled={filteredSubjects.length === 0}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredSubjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id.toString()}>
                                                <div className="flex flex-col">
                                                    <span>{subject.name} ({subject.code})</span>
                                                    {subject.course && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Course: {subject.course.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {filteredSubjects.length === 0 && (
                                    <p className="text-sm text-amber-600 mt-1">
                                        No subjects available for the selected section. Please add subjects first.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="grading_period_id">Grading Period</Label>
                                <Select 
                                    value={formData.grading_period_id} 
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, grading_period_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grading period (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">No grading period</SelectItem>
                                        {gradingPeriods.map((period) => (
                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                {period.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="school_year">School Year</Label>
                                <Input
                                    id="school_year"
                                    type="text"
                                    value={formData.school_year}
                                    onChange={(e) => setFormData(prev => ({ ...prev, school_year: e.target.value }))}
                                    placeholder="e.g., 2024-2025"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes about this assignment..."
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="auto_enroll_students"
                                checked={formData.auto_enroll_students}
                                onChange={(e) => setFormData(prev => ({ ...prev, auto_enroll_students: e.target.checked }))}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="auto_enroll_students" className="text-sm">
                                Automatically enroll all students in this academic level to this subject
                            </Label>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                    setShowAssignmentModal(false);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingAssignment ? 'Update Assignment' : 'Assign Instructor'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
