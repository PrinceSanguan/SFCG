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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Users, Calendar, User, School } from 'lucide-react';
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

interface Subject {
    id: number;
    name: string;
    code: string;
    description: string;
    units: number;
    academic_level_id: number;
    section_id?: number;
    section?: {
        id: number;
        name: string;
        code: string;
        specific_year_level: string;
    };
}

interface GradingPeriod {
    id: number;
    name: string;
    code: string;
    academic_level_id: number;
    type: string;
    period_type: string;
    parent_id: number | null;
}

interface Section {
    id: number;
    name: string;
    code: string;
    academic_level_id: number;
    specific_year_level: string;
}

interface ClassAdviserAssignment {
    id: number;
    adviser_id: number;
    subject_id: number;
    academic_level_id: number;
    grade_level: string;
    section: string;
    school_year: string;
    notes: string | null;
    is_active: boolean;
    adviser: User;
    subject: Subject;
    academicLevel?: AcademicLevel;
}

interface Props {
    user: User;
    assignments: ClassAdviserAssignment[];
    advisers: User[];
    subjects: Subject[];
    academicLevels: AcademicLevel[];
    sections: Section[];
    gradingPeriods: GradingPeriod[];
}

export default function AssignAdvisers({ user, assignments, advisers, subjects, academicLevels, sections, gradingPeriods }: Props) {
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
        adviser_id: '',
        subject_id: '',
        academic_level_id: '',
        grade_level: '',
        section_id: '',
        grading_period_ids: [] as string[],
        school_year: '',
        notes: '',
        is_active: true,
    });

    const [filteredGradingPeriods, setFilteredGradingPeriods] = useState<GradingPeriod[]>([]);

    const [assignmentModal, setAssignmentModal] = useState(false);
    const [editAssignment, setEditAssignment] = useState<ClassAdviserAssignment | null>(null);
    const [editModal, setEditModal] = useState(false);

    // Filter for Elementary and Junior High School levels only
    const elementaryLevel = academicLevels.find(level => level.key === 'elementary');
    const jhsLevel = academicLevels.find(level => level.key === 'junior_highschool');
    const relevantLevels = [elementaryLevel, jhsLevel].filter((level): level is AcademicLevel => level !== null && level !== undefined);
    
    // Safety check: only proceed if we have valid levels
    if (relevantLevels.length === 0) {
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
                        <h1 className="text-2xl font-bold text-gray-900">Assign Class Advisers (Elementary to JHS)</h1>
                    </div>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Academic Levels Not Found</h3>
                            <p className="text-gray-600 mb-4">
                                Elementary or Junior High School academic levels are not configured in the system.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const relevantAssignments = assignments.filter(assignment => 
        relevantLevels.some(level => level.id === assignment.academic_level_id)
    );
    

    const schoolYearOptions = [
        '2024-2025',
        '2025-2026',
        '2026-2027',
        '2027-2028',
    ];

    const getGradeLevelOptions = (academicLevelKey: string) => {
        if (academicLevelKey === 'elementary') {
            return ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
        } else if (academicLevelKey === 'junior_highschool') {
            return ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
        }
        return [];
    };

    const getFilteredSections = () => {
        if (!assignmentForm.academic_level_id || !assignmentForm.grade_level) {
            return [];
        }

        // Convert grade level to specific year level format
        const gradeMapping: Record<string, string> = {
            'Grade 1': 'grade_1',
            'Grade 2': 'grade_2',
            'Grade 3': 'grade_3',
            'Grade 4': 'grade_4',
            'Grade 5': 'grade_5',
            'Grade 6': 'grade_6',
            'Grade 7': 'grade_7',
            'Grade 8': 'grade_8',
            'Grade 9': 'grade_9',
            'Grade 10': 'grade_10',
        };

        const specificYearLevel = gradeMapping[assignmentForm.grade_level];

        return sections.filter(section =>
            section.academic_level_id.toString() === assignmentForm.academic_level_id &&
            section.specific_year_level === specificYearLevel
        );
    };

    const getFilteredSubjects = () => {
        if (!assignmentForm.academic_level_id || !assignmentForm.grade_level || !assignmentForm.section_id) {
            return [];
        }

        const selectedLevel = relevantLevels.find(l => l?.id.toString() === assignmentForm.academic_level_id);
        if (!selectedLevel) return [];

        // Filter subjects by academic level and section
        const filteredSubjects = subjects.filter(subject =>
            subject.academic_level_id.toString() === assignmentForm.academic_level_id &&
            subject.section_id?.toString() === assignmentForm.section_id
        );

        return filteredSubjects;
    };

    const submitAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/academic/assign-advisers', assignmentForm, {
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

        router.put(`/admin/academic/assign-advisers/${editAssignment.id}`, assignmentForm, {
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
            router.delete(`/admin/academic/assign-advisers/${id}`, {
                onSuccess: () => {
                    // Flash message will be handled by useEffect
                },
                onError: (errors) => {
                    console.error(errors);
                },
            });
        }
    };

    const openEditModal = (assignment: ClassAdviserAssignment) => {
        setEditAssignment(assignment);
        setAssignmentForm({
            adviser_id: assignment.adviser_id.toString(),
            subject_id: assignment.subject_id?.toString() || '',
            academic_level_id: assignment.academic_level_id.toString(),
            grade_level: assignment.grade_level,
            section_id: assignment.subject?.section_id?.toString() || '',
            grading_period_ids: [],
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

    const getLevelIcon = (levelKey: string) => {
        switch (levelKey) {
            case 'elementary':
                return '🎓';
            case 'junior_highschool':
                return '📚';
            default:
                return '📖';
        }
    };

    // Filter grading periods based on selected academic level
    useEffect(() => {
        if (assignmentForm.academic_level_id) {
            const levelId = parseInt(assignmentForm.academic_level_id);
            const filtered = gradingPeriods.filter(period => period.academic_level_id === levelId);
            setFilteredGradingPeriods(filtered);
        } else {
            setFilteredGradingPeriods([]);
        }
    }, [assignmentForm.academic_level_id, gradingPeriods]);

    const resetForm = () => {
        setAssignmentForm({
            adviser_id: '',
            subject_id: '',
            academic_level_id: '',
            grade_level: '',
            section_id: '',
            grading_period_ids: [],
            school_year: '',
            notes: '',
            is_active: true,
        });
        setFilteredGradingPeriods([]);
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
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assign Class Advisers (Elementary to JHS)</h1>
                            </div>
                        </div>

            {/* Info Card */}
            <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                        <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-purple-900">Elementary & Junior High School Class Adviser Assignments</h3>
                            <p className="text-purple-700 text-sm mt-1">
                                Manage class adviser assignments for Elementary and Junior High School classes. This page is specifically for assigning advisers to manage specific grade levels and sections.
                            </p>
                        </div>
                    </div>
                        </CardContent>
                    </Card>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-900">Class Adviser Assignments</h2>
                    <Badge variant="secondary">{relevantAssignments.length} assignments</Badge>
                </div>
                <Dialog open={assignmentModal} onOpenChange={setAssignmentModal}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setAssignmentModal(true); resetForm(); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Assign Class Adviser
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Assign Class Adviser</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitAssignment} className="space-y-4 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Label htmlFor="adviser_id">Class Adviser</Label>
                                    <Select
                                        value={assignmentForm.adviser_id}
                                        onValueChange={(value) => setAssignmentForm({ ...assignmentForm, adviser_id: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select class adviser" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {advisers
                                                .filter(adviser => adviser.user_role === 'adviser')
                                                .map((adviser) => (
                                                    <SelectItem key={adviser.id} value={adviser.id.toString()}>
                                                        {adviser.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="academic_level_id">Academic Level</Label>
                                    <Select
                                        value={assignmentForm.academic_level_id}
                                        onValueChange={(value) => {
                                            setAssignmentForm({
                                                ...assignmentForm,
                                                academic_level_id: value,
                                                grade_level: '',
                                                section_id: '',
                                                subject_id: ''
                                            });
                                        }}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select academic level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {relevantLevels.map((level) => (
                                                <SelectItem key={level.id} value={level.id.toString()}>
                                                    <span className="flex items-center space-x-2">
                                                        <span>{getLevelIcon(level.key)}</span>
                                                        <span>{level.name}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="grade_level">Grade Level</Label>
                                    <Select
                                        value={assignmentForm.grade_level}
                                        onValueChange={(value) => setAssignmentForm({ ...assignmentForm, grade_level: value, section_id: '', subject_id: '' })}
                                        required
                                        disabled={!assignmentForm.academic_level_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select grade level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assignmentForm.academic_level_id &&
                                                getGradeLevelOptions(
                                                    relevantLevels.find(l => l?.id.toString() === assignmentForm.academic_level_id)?.key || ''
                                                ).map((grade) => (
                                                    <SelectItem key={grade} value={grade}>
                                                        {grade}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="section_id">Section</Label>
                                    <Select
                                        value={assignmentForm.section_id}
                                        onValueChange={(value) => setAssignmentForm({ ...assignmentForm, section_id: value, subject_id: '' })}
                                        required
                                        disabled={!assignmentForm.academic_level_id || !assignmentForm.grade_level}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getFilteredSections().map((section) => (
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
                                        onValueChange={(value) => setAssignmentForm({ ...assignmentForm, subject_id: value })}
                                        required
                                        disabled={!assignmentForm.academic_level_id || !assignmentForm.grade_level || !assignmentForm.section_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getFilteredSubjects().map((subject) => (
                                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                                    {subject.name} ({subject.code}) - {subject.section?.name || 'No Section'}
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
                            </div>

                            {filteredGradingPeriods.length > 0 && (
                                <div className="border rounded-lg p-4">
                                    <Label className="text-base font-semibold mb-3 block">Grading Periods (Optional)</Label>
                                    <p className="text-sm text-gray-500 mb-3">Select specific grading periods for this assignment, or leave empty to apply to all periods.</p>
                                    <div className="space-y-2">
                                        {filteredGradingPeriods
                                            .filter(p => !p.parent_id)
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map((period) => (
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
                                                    <Label htmlFor={`period-${period.id}`} className="text-sm font-normal cursor-pointer">
                                                        {period.name} ({period.code})
                                                    </Label>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

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
                                <Button type="submit">Assign Adviser</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Assignments Table */}
            {relevantAssignments.length > 0 ? (
                <div className="grid gap-4">
                    {relevantAssignments.map((assignment) => (
                        <Card key={assignment.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">{assignment.adviser.name}</span>
                                        </div>
                                        <span className="text-gray-400">→</span>
                                        <div className="flex items-center space-x-2">
                                            <School className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">{assignment.grade_level}</span>
                                            <Badge variant="outline">{assignment.section}</Badge>
                                            <Badge variant="outline">
                                                <span className="flex items-center space-x-1">
                                                    <span>{getLevelIcon(assignment.academicLevel?.key || '')}</span>
                                                    <span>{assignment.academicLevel?.name || 'Unknown Level'}</span>
                                                </span>
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>{assignment.school_year}</span>
                                        </div>
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
                                <div className="flex items-center space-x-2 mt-2">
                                    <span className="text-sm font-semibold text-gray-700">Subject:</span>
                                    <span className="text-sm text-gray-600">{assignment.subject?.name || 'No Subject'}</span>
                                    {assignment.subject?.code && (
                                        <Badge variant="secondary" className="text-xs">{assignment.subject.code}</Badge>
                                    )}
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
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Class Adviser Assignments</h3>
                            <p className="text-gray-600 mb-4">
                                No class advisers have been assigned to Elementary or Junior High School classes yet.
                            </p>
                            <Button onClick={() => setAssignmentModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Assign Your First Class Adviser
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Edit Assignment Modal */}
            <Dialog open={editModal} onOpenChange={setEditModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Class Adviser Assignment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={updateAssignment} className="space-y-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="edit_adviser_id">Class Adviser</Label>
                                <Select
                                    value={assignmentForm.adviser_id}
                                    onValueChange={(value) => setAssignmentForm({ ...assignmentForm, adviser_id: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select class adviser" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {advisers
                                            .filter(adviser => adviser.user_role === 'adviser')
                                            .map((adviser) => (
                                                <SelectItem key={adviser.id} value={adviser.id.toString()}>
                                                    {adviser.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit_academic_level_id">Academic Level</Label>
                                <Select
                                    value={assignmentForm.academic_level_id}
                                    onValueChange={(value) => {
                                        setAssignmentForm({
                                            ...assignmentForm,
                                            academic_level_id: value,
                                            grade_level: '',
                                            section_id: '',
                                            subject_id: ''
                                        });
                                    }}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select academic level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {relevantLevels.map((level) => (
                                            <SelectItem key={level.id} value={level.id.toString()}>
                                                <span className="flex items-center space-x-2">
                                                    <span>{getLevelIcon(level.key)}</span>
                                                    <span>{level.name}</span>
                                            </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit_grade_level">Grade Level</Label>
                                <Select
                                    value={assignmentForm.grade_level}
                                    onValueChange={(value) => setAssignmentForm({ ...assignmentForm, grade_level: value, section_id: '', subject_id: '' })}
                                    required
                                    disabled={!assignmentForm.academic_level_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grade level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assignmentForm.academic_level_id &&
                                            getGradeLevelOptions(
                                                relevantLevels.find(l => l?.id.toString() === assignmentForm.academic_level_id)?.key || ''
                                            ).map((grade) => (
                                                <SelectItem key={grade} value={grade}>
                                                    {grade}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit_section_id">Section</Label>
                                <Select
                                    value={assignmentForm.section_id}
                                    onValueChange={(value) => setAssignmentForm({ ...assignmentForm, section_id: value, subject_id: '' })}
                                    required
                                    disabled={!assignmentForm.academic_level_id || !assignmentForm.grade_level}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getFilteredSections().map((section) => (
                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                {section.name}
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
                                    disabled={!assignmentForm.academic_level_id || !assignmentForm.grade_level || !assignmentForm.section_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getFilteredSubjects().map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id.toString()}>
                                                {subject.name} ({subject.code}) - {subject.section?.name || 'No Section'}
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

                            <div className="md:col-span-2">
                                <Label htmlFor="edit_notes">Notes</Label>
                                <Textarea
                                    id="edit_notes"
                                    value={assignmentForm.notes}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                                    placeholder="Additional notes..."
                                />
                            </div>

                            <div className="md:col-span-2 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="edit_is_active"
                                    checked={assignmentForm.is_active}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, is_active: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="edit_is_active">Active</Label>
                            </div>
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


