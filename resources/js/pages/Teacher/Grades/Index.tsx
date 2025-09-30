import { Header } from '@/components/teacher/header';
import { Sidebar } from '@/components/teacher/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Upload, Edit } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

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
    };
    grade: number;
    school_year: string;
    is_submitted_for_validation: boolean;
    created_at: string;
    updated_at: string;
}

interface AssignedSubject {
    id: number;
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
    };
    school_year: string;
    is_active: boolean;
    enrolled_students: Array<{
        id: number;
        student: {
            id: number;
            name: string;
            email: string;
        };
        semester?: string;
        is_active: boolean;
        school_year: string;
    }>;
    student_count: number;
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
        // SHS and College both use 1.0-5.0 scale (1.0 is highest, 5.0 is lowest, 3.0 is passing)
        if (academicLevelKey === 'college' || academicLevelKey === 'senior_highschool') {
            if (grade <= 1.5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            if (grade <= 2.5) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            if (grade <= 3.0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        }

        // Elementary and JHS use 75-100 scale
        if (grade >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        if (grade >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        if (grade >= 75) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    };

    const getGradeStatus = (grade: number, academicLevelKey?: string) => {
        // If no grade (0), return "No Grade"
        if (grade === 0) return 'No Grade';

        // SHS and College both use 1.0-5.0 scale (1.0 is highest, 5.0 is lowest, 3.0 is passing)
        if (academicLevelKey === 'college' || academicLevelKey === 'senior_highschool') {
            if (grade <= 1.5) return 'Superior';
            if (grade <= 2.0) return 'Very Good';
            if (grade <= 2.5) return 'Good';
            if (grade <= 3.0) return 'Satisfactory';
            return 'Failing';
        }

        // Elementary and JHS use 75-100 scale
        if (grade >= 95) return 'Outstanding';
        if (grade >= 90) return 'Very Good';
        if (grade >= 85) return 'Good';
        if (grade >= 80) return 'Satisfactory';
        if (grade >= 75) return 'Fair';
        return 'Failing';
    };

    // Calculate semester average for a student
    const calculateOverallAverage = (studentId: number, subjectId: number, academicLevelKey: string) => {
        // Get all grades for this student and subject
        const studentGrades = grades?.data?.filter(grade =>
            grade.student.id === studentId &&
            grade.subject.id === subjectId
        ) || [];

        if (studentGrades.length === 0) return 0;

        const isSemesterBased = academicLevelKey === 'senior_highschool' || academicLevelKey === 'college';

        if (!isSemesterBased) {
            // For Elementary/JHS: simple average
            const validGrades = studentGrades.filter(g => g.grade !== null && g.grade !== undefined);
            if (validGrades.length === 0) return 0;
            return validGrades.reduce((sum, g) => sum + g.grade, 0) / validGrades.length;
        }

        // For SHS/College: Calculate semester averages
        const s1Midterm = studentGrades.find(g =>
            g.gradingPeriod?.code?.toUpperCase().includes('S1_MT')
        );
        const s1PreFinal = studentGrades.find(g =>
            g.gradingPeriod?.code?.toUpperCase().includes('S1_PF')
        );
        const s2Midterm = studentGrades.find(g =>
            g.gradingPeriod?.code?.toUpperCase().includes('S2_MT')
        );
        const s2PreFinal = studentGrades.find(g =>
            g.gradingPeriod?.code?.toUpperCase().includes('S2_PF')
        );

        let semester1Avg = null;
        if (s1Midterm?.grade && s1PreFinal?.grade) {
            semester1Avg = (parseFloat(s1Midterm.grade.toString()) + parseFloat(s1PreFinal.grade.toString())) / 2;
        }

        let semester2Avg = null;
        if (s2Midterm?.grade && s2PreFinal?.grade) {
            semester2Avg = (parseFloat(s2Midterm.grade.toString()) + parseFloat(s2PreFinal.grade.toString())) / 2;
        }

        // Calculate overall average
        if (semester1Avg !== null && semester2Avg !== null) {
            return (semester1Avg + semester2Avg) / 2;
        } else if (semester1Avg !== null) {
            return semester1Avg;
        } else if (semester2Avg !== null) {
            return semester2Avg;
        }

        return 0;
    };

    // Get students for selected subject
    const getStudentsForSubject = (subjectId: string) => {
        if (!subjectId || !assignedSubjects || !Array.isArray(assignedSubjects)) return [];

        // Find the subject assignment
        const subjectAssignment = assignedSubjects.find(subject =>
            subject.subject?.id?.toString() === subjectId
        );

        if (!subjectAssignment || !subjectAssignment.enrolled_students) return [];

        const academicLevelKey = subjectAssignment.academicLevel?.key || '';

        // Return enrolled students with their calculated averages
        return subjectAssignment.enrolled_students.map(enrollment => {
            // Calculate overall average for this student
            const overallAverage = calculateOverallAverage(
                enrollment.student.id,
                parseInt(subjectId),
                academicLevelKey
            );

            // Find the most recent grade date
            const studentGrades = grades?.data?.filter(grade =>
                grade.student.id === enrollment.student.id &&
                grade.subject.id === parseInt(subjectId)
            ) || [];
            const latestGradeDate = studentGrades.length > 0
                ? studentGrades.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0].updated_at
                : '';

            return {
                id: enrollment.student.id,
                name: enrollment.student.name,
                email: enrollment.student.email,
                latestGrade: overallAverage,
                latestGradeDate: latestGradeDate,
                academicLevel: {
                    key: academicLevelKey,
                    name: subjectAssignment.academicLevel?.name || ''
                },
                gradingPeriod: subjectAssignment.gradingPeriod ? {
                    name: subjectAssignment.gradingPeriod.name
                } : undefined,
                schoolYear: enrollment.school_year
            };
        });
    };

    // Get available subjects from assigned subjects with safe access
    const availableSubjects = (assignedSubjects || []).map(subject => {
        console.log('Processing subject assignment:', subject);
        
        // Skip subjects that don't have the required structure
        if (!subject?.subject?.id || !subject?.subject?.name || !subject?.academicLevel?.name) {
            console.log('Skipping subject - missing required structure:', subject);
            return null;
        }
        
        const mappedSubject = {
            id: subject.subject.id.toString(),
            name: subject.subject.name,
            code: subject.subject.code || 'N/A',
            academicLevel: subject.academicLevel.name,
            schoolYear: subject.school_year || 'N/A'
        };
        
        console.log('Mapped subject:', mappedSubject);
        return mappedSubject;
    }).filter((subject): subject is NonNullable<typeof subject> => subject !== null); // Remove null entries with proper typing

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
        const subjectAssignment = assignedSubjects.find(subject =>
            subject.enrolled_students.some(enrollment => enrollment.student.id === student.id)
        );

        if (subjectAssignment) {
            window.location.href = route('teacher.grades.create') +
                `?student_id=${student.id}` +
                `&subject_id=${subjectAssignment.subject.id}` +
                `&academic_level_id=${subjectAssignment.academicLevel.id}` +
                `&academic_level_key=${subjectAssignment.academicLevel.key}` +
                `&school_year=${subjectAssignment.school_year}`;
        }
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
                                <Link href={route('teacher.grades.create')} className={!selectedSubject ? 'pointer-events-none' : ''}>
                                    <Button className="flex items-center gap-2" disabled={!selectedSubject}>
                                        <Plus className="h-4 w-4" />
                                        Input Grade
                                    </Button>
                                </Link>
                                <Link href={route('teacher.grades.upload')}>
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
                                                            {subject.academicLevel} • {subject.schoolYear}
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
                                                                        {(student.academicLevel.key === 'senior_highschool' || student.academicLevel.key === 'college')
                                                                            ? student.latestGrade.toFixed(2)
                                                                            : Math.round(student.latestGrade)}
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
                                                                    <Link href={route('teacher.grades.show-student', [student.id, selectedSubject])}>
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
        </div>
    );
}
