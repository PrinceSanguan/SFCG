import { Header } from '@/components/instructor/header';
import { Sidebar } from '@/components/instructor/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Upload, Edit, Save, X, Check } from 'lucide-react';
import { Link, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface StudentGrade {
    id: number;
    student: {
        id: number;
        name: string;
    };
    subject: {
        id: number;
        name: string;
    };
    academicLevel: {
        id: number;
        name: string;
    };
    gradingPeriod?: {
        id: number;
        name: string;
        semester_number?: number;
        type?: string;
        full_name?: string;
    };
    grade: number;
    school_year: string;
    is_submitted_for_validation: boolean;
    created_at: string;
    updated_at: string;
}

interface AssignedSubject {
    id: number;
    subject_id: number;
    academic_level_id: number;
    grading_period_id: number | null;
    section_id: number;
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
        semester_number?: number;
        type?: string;
        full_name?: string;
    };
    school_year: string;
    is_active: boolean;
    enrolled_students: Array<{
        id: number;
        student: {
            id: number;
            name: string;
            email: string;
            student_number?: string;
        };
        semester?: string;
        is_active: boolean;
        school_year: string;
    }>;
    student_count: number;
}

// Grouped subject for display (combining multiple grading periods)
interface GroupedSubject {
    id: string; // subject ID
    name: string;
    code: string;
    academicLevel: string;
    schoolYear: string;
    gradingPeriods: string; // Comma-separated list
    assignments: Array<{
        assignmentId: number;
        gradingPeriodId: number | null;
        gradingPeriod: { id: number; name: string } | null;
        sectionId: number;
        enrolledStudents: AssignedSubject['enrolled_students'];
    }>;
}

interface IndexProps {
    user: User;
    grades: {
        data: StudentGrade[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    assignedSubjects: AssignedSubject[];
}

export default function GradesIndex({ user, grades, assignedSubjects }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [showPeriodSelector, setShowPeriodSelector] = useState(false);
    const [selectedSubjectForPeriodSelection, setSelectedSubjectForPeriodSelection] = useState<string | null>(null);
    const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
    const [editingGrade, setEditingGrade] = useState<string>('');
    const [editingRemarks, setEditingRemarks] = useState<string>('');
    const [selectedGradingPeriodForEdit, setSelectedGradingPeriodForEdit] = useState<number | null>(null);
    const [showPeriodSelectorForEdit, setShowPeriodSelectorForEdit] = useState(false);
    const [savingGrade, setSavingGrade] = useState(false);
    const [gradeError, setGradeError] = useState<string>('');

    // Debug logging
    console.log('GradesIndex props:', { user, grades, assignedSubjects });
    console.log('assignedSubjects type:', typeof assignedSubjects);
    console.log('assignedSubjects is array:', Array.isArray(assignedSubjects));
    console.log('assignedSubjects length:', assignedSubjects?.length);

    // Safety check for required props
    if (!assignedSubjects || !Array.isArray(assignedSubjects)) {
        console.log('Safety check failed - showing loading state');
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="h-16 w-16 text-gray-400 mx-auto mb-4">📚</div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Loading...
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Please wait while we load your assigned subjects.
                        </p>
                        <div className="mt-4 text-sm text-gray-400">
                            Debug: assignedSubjects = {JSON.stringify(assignedSubjects)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getGradeColor = (grade: number, academicLevelKey?: string) => {
        // College grading system: 1.0 (highest) to 5.0 (lowest), 3.0 is passing
        if (academicLevelKey === 'college') {
            if (grade <= 1.5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            if (grade <= 2.5) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            if (grade <= 3.0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        }
        
        // Elementary to Senior High grading system: 75 (passing) to 100 (highest)
        if (grade >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        if (grade >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        if (grade >= 75) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    };

    const getGradeStatus = (grade: number, academicLevelKey?: string) => {
        // If no grade (0), return "No Grade"
        if (grade === 0) return 'No Grade';
        
        if (academicLevelKey === 'college') {
            // College grading system: 1.0 (highest) to 5.0 (lowest)
            if (grade <= 1.5) return 'Superior';
            if (grade <= 2.0) return 'Very Good';
            if (grade <= 2.5) return 'Good';
            if (grade <= 3.0) return 'Satisfactory';
            return 'Failing';
        }
        
        // Elementary to Senior High grading system: 75 (passing) to 100 (highest)
        if (grade >= 95) return 'Outstanding';
        if (grade >= 90) return 'Very Good';
        if (grade >= 85) return 'Good';
        if (grade >= 80) return 'Satisfactory';
        if (grade >= 75) return 'Fair';
        return 'Failing';
    };

    // Get students for selected subject (across all grading periods)
    const getStudentsForSubject = (subjectId: string) => {
        if (!subjectId || !assignedSubjects || !Array.isArray(assignedSubjects)) return [];

        console.log('Getting students for subject ID:', subjectId);

        // Get all assignments for this subject (there may be multiple grading periods)
        const subjectAssignments = assignedSubjects.filter(
            assignment => assignment.subject?.id?.toString() === subjectId
        );

        console.log('Found assignments:', subjectAssignments.length);

        if (subjectAssignments.length === 0) return [];

        // Collect all unique students across all grading periods
        const studentsMap = new Map();

        subjectAssignments.forEach(assignment => {
            if (!assignment.enrolled_students) return;

            assignment.enrolled_students.forEach(enrollment => {
                const studentId = enrollment.student.id;

                if (!studentsMap.has(studentId)) {
                    // Find all grades for this student in this subject
                    const studentGrades = grades?.data?.filter(grade =>
                        grade.student.id === studentId &&
                        grade.subject.id.toString() === subjectId
                    ) || [];

                    // Get the latest grade
                    const latestGrade = studentGrades.length > 0 ? studentGrades[0] : null;

                    studentsMap.set(studentId, {
                        id: enrollment.student.id,
                        name: enrollment.student.name,
                        email: enrollment.student.email,
                        student_number: enrollment.student.student_number,
                        latestGrade: latestGrade ? latestGrade.grade : 0,
                        latestGradeDate: latestGrade ? latestGrade.updated_at : '',
                        academicLevel: {
                            key: assignment.academicLevel?.key || '',
                            name: assignment.academicLevel?.name || ''
                        },
                        gradingPeriod: assignment.gradingPeriod ? {
                            name: assignment.gradingPeriod.name
                        } : undefined,
                        schoolYear: enrollment.school_year,
                        enrolledInPeriods: []
                    });
                }

                // Track which grading periods this student is enrolled in
                const student = studentsMap.get(studentId);
                if (assignment.gradingPeriod?.name) {
                    student.enrolledInPeriods.push(assignment.gradingPeriod.full_name || assignment.gradingPeriod.name);
                }
            });
        });

        const result = Array.from(studentsMap.values());
        console.log('Returning students:', result.length);
        return result;
    };

    // Get available subjects from assigned subjects with grouping by subject ID
    // This combines multiple grading period assignments into single cards
    const availableSubjects = useMemo((): GroupedSubject[] => {
        if (!assignedSubjects || !Array.isArray(assignedSubjects)) {
            console.log('No assignedSubjects available');
            return [];
        }

        console.log('Processing assignments for grouping:', assignedSubjects);

        // Group assignments by subject ID
        const grouped = assignedSubjects.reduce((acc, assignment) => {
            // Skip if missing required structure
            if (!assignment?.subject?.id || !assignment?.subject?.name || !assignment?.academicLevel?.name) {
                console.log('Skipping assignment - missing required structure:', assignment);
                return acc;
            }

            const subjectId = assignment.subject.id;

            if (!acc[subjectId]) {
                // Initialize group for this subject
                acc[subjectId] = {
                    subject: assignment.subject,
                    academicLevel: assignment.academicLevel,
                    schoolYear: assignment.school_year,
                    assignments: []
                };
            }

            // Add this assignment to the group
            acc[subjectId].assignments.push({
                assignmentId: assignment.id,
                gradingPeriodId: assignment.grading_period_id,
                gradingPeriod: assignment.gradingPeriod || null,
                sectionId: assignment.section_id,
                enrolledStudents: assignment.enrolled_students || []
            });

            return acc;
        }, {} as Record<number, any>);

        // Convert to array and format for display
        const result = Object.values(grouped).map((group: any): GroupedSubject => {
            // Collect grading period names
            const gradingPeriodNames = group.assignments
                .map((a: any) => a.gradingPeriod?.full_name || a.gradingPeriod?.name)
                .filter((name: string | undefined): name is string => Boolean(name));

            return {
                id: group.subject.id.toString(),
                name: group.subject.name,
                code: group.subject.code || 'N/A',
                academicLevel: group.academicLevel.name,
                schoolYear: group.schoolYear || 'N/A',
                gradingPeriods: gradingPeriodNames.length > 0 ? gradingPeriodNames.join(', ') : 'No Period',
                assignments: group.assignments
            };
        });

        console.log('Grouped available subjects:', result);
        return result;
    }, [assignedSubjects]);

    const handleInputGrade = (student: {
        id: number;
        name: string;
        email: string;
        latestGrade: number;
        latestGradeDate: string;
        academicLevel: { key: string; name: string };
        gradingPeriod?: { name: string };
        schoolYear: string;
    }) => {
        if (!selectedSubject || !assignedSubjects) return;

        // Get all assignments for the selected subject
        const subjectAssignments = assignedSubjects.filter(
            assignment => assignment.subject.id.toString() === selectedSubject
        );

        if (subjectAssignments.length === 0) {
            console.error('No subject assignment found for selectedSubject:', selectedSubject);
            return;
        }

        if (subjectAssignments.length === 1) {
            // Single assignment - show inline grade input
            const assignment = subjectAssignments[0];
            setEditingStudentId(student.id);
            setEditingGrade(student.latestGrade > 0 ? student.latestGrade.toString() : '');
            setEditingRemarks('');
            setSelectedGradingPeriodForEdit(assignment.gradingPeriod?.id || null);
            setGradeError('');
        } else {
            // Multiple assignments - need to select grading period first
            console.log('Multiple assignments found, showing period selector for edit');
            (window as any).__pendingGradeStudent = student;
            setShowPeriodSelectorForEdit(true);
        }
    };

    const handleSaveGrade = async (student: {
        id: number;
        name: string;
        academicLevel: { key: string; name: string };
        schoolYear: string;
    }) => {
        if (!selectedSubject || !assignedSubjects || !editingGrade) {
            setGradeError('Please enter a grade.');
            return;
        }

        // Validate grade based on academic level
        const gradeNum = parseFloat(editingGrade);
        if (isNaN(gradeNum)) {
            setGradeError('Please enter a valid number.');
            return;
        }

        if (student.academicLevel.key === 'college') {
            if (gradeNum < 1.0 || gradeNum > 5.0) {
                setGradeError('College grades must be between 1.0 and 5.0');
                return;
            }
        } else {
            if (gradeNum < 0 || gradeNum > 100) {
                setGradeError('Grades must be between 0 and 100');
                return;
            }
        }

        setSavingGrade(true);
        setGradeError('');

        // Get the assignment
        const assignment = assignedSubjects.find(
            a => a.subject.id.toString() === selectedSubject &&
            a.gradingPeriod?.id === selectedGradingPeriodForEdit
        );

        if (!assignment) {
            setGradeError('Assignment not found.');
            setSavingGrade(false);
            return;
        }

        try {
            // Submit the grade
            await router.post(route('instructor.grades.store'), {
                student_id: student.id,
                subject_id: assignment.subject.id,
                assignment_id: assignment.id,
                academic_level_id: assignment.academicLevel.id,
                grading_period_id: assignment.gradingPeriod?.id || null,
                school_year: assignment.school_year,
                grade: gradeNum,
                remarks: editingRemarks || null,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingStudentId(null);
                    setEditingGrade('');
                    setEditingRemarks('');
                    setSelectedGradingPeriodForEdit(null);
                    setSavingGrade(false);
                },
                onError: (errors) => {
                    setGradeError(Object.values(errors).join(', '));
                    setSavingGrade(false);
                },
            });
        } catch (error) {
            setGradeError('Failed to save grade. Please try again.');
            setSavingGrade(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingStudentId(null);
        setEditingGrade('');
        setEditingRemarks('');
        setSelectedGradingPeriodForEdit(null);
        setGradeError('');
    };

    // Filter students based on search term
    const filteredStudents = selectedSubject 
        ? getStudentsForSubject(selectedSubject).filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Grade Management
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                View and manage student grades for your assigned subjects.
                            </p>
                        </div>

                        {/* Actions Bar */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search students or subjects..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-full sm:w-64"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('instructor.grades.create')} className={!selectedSubject ? 'pointer-events-none' : ''}>
                                    <Button className="flex items-center gap-2" disabled={!selectedSubject}>
                                        <Plus className="h-4 w-4" />
                                        Input Grade
                                    </Button>
                                </Link>
                                <Link href={route('instructor.grades.upload')}>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        Upload CSV
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Subject Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Select Subject</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Choose a subject to view and manage student grades
                                </p>
                            </CardHeader>
                            <CardContent>
                                {availableSubjects.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {availableSubjects.map((subject) => (
                                            <div
                                                key={subject.id}
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                    selectedSubject === subject.id
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50'
                                                }`}
                                                onClick={() => setSelectedSubject(selectedSubject === subject.id ? '' : subject.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                            <div>
                                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                            {subject.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {subject.code}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                            {subject.academicLevel} • SY {subject.schoolYear} • {subject.gradingPeriods}
                                                        </p>
                                                    </div>
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        selectedSubject === subject.id ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                                    }`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="h-16 w-16 text-gray-400 mx-auto mb-4">📚</div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            No Subjects Assigned
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            You haven't been assigned to any subjects yet.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Student Grades Table */}
                        {selectedSubject && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Student Grades - {availableSubjects.find(s => s.id === selectedSubject)?.name}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {filteredStudents.length} students
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {filteredStudents.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-3 font-medium">Student</th>
                                                        <th className="text-left p-3 font-medium">Latest Grade</th>
                                                        <th className="text-left p-3 font-medium">Status</th>
                                                        <th className="text-left p-3 font-medium">Last Updated</th>
                                                        <th className="text-left p-3 font-medium">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredStudents.map((student) => (
                                                        editingStudentId === student.id ? (
                                                            // Editing row with inline input
                                                            <tr key={student.id} className="border-b bg-blue-50 dark:bg-blue-900/20">
                                                                <td className="p-3" colSpan={5}>
                                                                    <div className="space-y-3">
                                                                        <div className="flex items-center justify-between">
                                                                            <div>
                                                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                                    {student.name}
                                                                                </p>
                                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                                    {student.email}
                                                                                </p>
                                                                            </div>
                                                                            <Badge className="bg-blue-500 text-white">
                                                                                <Edit className="h-3 w-3 mr-1" />
                                                                                Editing
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                    Grade {student.academicLevel.key === 'college' ? '(1.0 - 5.0)' : '(0 - 100)'}
                                                                                </label>
                                                                                <Input
                                                                                    type="number"
                                                                                    step={student.academicLevel.key === 'college' ? '0.25' : '1'}
                                                                                    min={student.academicLevel.key === 'college' ? '1.0' : '0'}
                                                                                    max={student.academicLevel.key === 'college' ? '5.0' : '100'}
                                                                                    value={editingGrade}
                                                                                    onChange={(e) => setEditingGrade(e.target.value)}
                                                                                    placeholder={student.academicLevel.key === 'college' ? 'e.g., 1.75' : 'e.g., 85'}
                                                                                    className="w-full"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                    Remarks (Optional)
                                                                                </label>
                                                                                <Input
                                                                                    type="text"
                                                                                    value={editingRemarks}
                                                                                    onChange={(e) => setEditingRemarks(e.target.value)}
                                                                                    placeholder="e.g., Excellent work"
                                                                                    className="w-full"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        {gradeError && (
                                                                            <Alert variant="destructive">
                                                                                <AlertDescription>{gradeError}</AlertDescription>
                                                                            </Alert>
                                                                        )}
                                                                        <div className="flex gap-2 justify-end">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={handleCancelEdit}
                                                                                disabled={savingGrade}
                                                                            >
                                                                                <X className="h-4 w-4 mr-2" />
                                                                                Cancel
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => handleSaveGrade(student)}
                                                                                disabled={savingGrade || !editingGrade}
                                                                            >
                                                                                <Save className="h-4 w-4 mr-2" />
                                                                                {savingGrade ? 'Saving...' : 'Save Grade'}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            // Normal row
                                                            <tr key={student.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                                <td className="p-3">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                            {student.name}
                                                                        </p>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            {student.email}
                                                                        </p>
                                                                    </div>
                                                                </td>
                                                                <td className="p-3">
                                                                    {student.latestGrade === 0 ? (
                                                                        <Badge variant="outline" className="text-gray-500">
                                                                            No Grade
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className={getGradeColor(student.latestGrade, student.academicLevel.key)}>
                                                                            {student.latestGrade}
                                                                        </Badge>
                                                                    )}
                                                                </td>
                                                                <td className="p-3">
                                                                    <span className={`text-sm ${
                                                                        getGradeStatus(student.latestGrade, student.academicLevel.key) === 'No Grade'
                                                                            ? 'text-gray-600 dark:text-gray-400'
                                                                            : ['Superior', 'Very Good', 'Good', 'Satisfactory', 'Fair', 'Outstanding'].includes(getGradeStatus(student.latestGrade, student.academicLevel.key))
                                                                            ? 'text-green-600 dark:text-green-400'
                                                                            : 'text-red-600 dark:text-red-400'
                                                                    }`}>
                                                                        {getGradeStatus(student.latestGrade, student.academicLevel.key)}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                                                                    {student.latestGradeDate ? new Date(student.latestGradeDate).toLocaleDateString() : 'N/A'}
                                                                </td>
                                                                <td className="p-3">
                                                                    <div className="flex gap-2">
                                                                        <Link href={route('instructor.grades.show-student', [student.id, selectedSubject])}>
                                    <Button
                                        variant="outline"
                                                                                size="sm"
                                                                                onClick={(e) => e.stopPropagation()}
                                    >
                                                                                <Edit className="h-4 w-4 mr-2" />
                                                                                View Details
                                    </Button>
                                                                        </Link>
                                    <Button
                                                                            size="sm"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleInputGrade(student);
                                                                            }}
                                                                        >
                                                                            <Plus className="h-4 w-4 mr-2" />
                                                                            Input Grade
                                    </Button>
                                </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="h-16 w-16 text-gray-400 mx-auto mb-4">👥</div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                No Students Found
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                {searchTerm ? 'No students match your search criteria.' : 'No students are enrolled in this subject.'}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>

            {/* Grading Period Selector Modal for Inline Edit */}
            {showPeriodSelectorForEdit && selectedSubject && assignedSubjects && (
                <Dialog open={showPeriodSelectorForEdit} onOpenChange={setShowPeriodSelectorForEdit}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Select Grading Period</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                                This subject has multiple grading periods. Please select which period you want to input grades for.
                            </p>
                        </DialogHeader>
                        <div className="space-y-2 mt-4">
                            {assignedSubjects
                                .filter(a => a.subject.id.toString() === selectedSubject)
                                .map(assignment => (
                                    <Button
                                        key={assignment.id}
                                        onClick={() => {
                                            const student = (window as any).__pendingGradeStudent;
                                            if (student) {
                                                setEditingStudentId(student.id);
                                                setEditingGrade(student.latestGrade > 0 ? student.latestGrade.toString() : '');
                                                setEditingRemarks('');
                                                setSelectedGradingPeriodForEdit(assignment.gradingPeriod?.id || null);
                                                setGradeError('');
                                            }
                                            setShowPeriodSelectorForEdit(false);
                                            delete (window as any).__pendingGradeStudent;
                                        }}
                                        variant="outline"
                                        className="w-full justify-start h-auto py-4 px-4"
                                    >
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-medium">
                                                {assignment.gradingPeriod?.full_name || assignment.gradingPeriod?.name || 'No Period Assigned'}
                                            </span>
                                            <span className="text-xs text-muted-foreground mt-1">
                                                {assignment.school_year} • {assignment.subject.code}
                                            </span>
                                        </div>
                                    </Button>
                                ))
                            }
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
