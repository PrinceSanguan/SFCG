import { Header } from '@/components/instructor/header';
import { Sidebar } from '@/components/instructor/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import { BookOpen, Edit, Plus, Upload, Search } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface AssignedCourse {
    id: number;
    course: {
        id: number;
        name: string;
        code: string;
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



interface IndexProps {
    user: User;
    grades: {
        data: StudentGrade[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    assignedCourses: AssignedCourse[];
}

export default function GradesIndex({ user, grades, assignedCourses }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedStudent, setSelectedStudent] = useState<{
        id: number;
        name: string;
        email: string;
        latestGrade: number;
        latestGradeDate: string;
        academicLevel: { key: string; name: string };
        gradingPeriod?: { name: string };
        schoolYear: string;
    } | null>(null);
    const [showStudentModal, setShowStudentModal] = useState(false);

    // Safety check for required props
    if (!assignedCourses || !Array.isArray(assignedCourses)) {
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Loading...
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Please wait while we load your assigned courses.
                        </p>
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
        if (academicLevelKey === 'college') {
            return grade <= 3.0 ? 'Passing' : 'Failing';
        }
        return grade >= 75 ? 'Passing' : 'Failing';
    };

    // Get students for selected subject
    const getStudentsForSubject = (subjectId: string) => {
        if (!subjectId || !grades?.data || !Array.isArray(grades.data)) return [];
        
        // Filter grades by subject and get unique students
        const subjectGrades = grades.data.filter(grade => 
            grade?.subject?.id?.toString() === subjectId
        ) || [];
        
        // Get unique students with their latest grade for this subject
        const studentsMap = new Map();
        subjectGrades.forEach(grade => {
            if (grade?.student && grade?.academicLevel) {
                const existing = studentsMap.get(grade.student.id);
                if (!existing || new Date(grade.updated_at || '') > new Date(existing.latestGradeDate || '')) {
                    studentsMap.set(grade.student.id, {
                        ...grade.student,
                        latestGrade: grade.grade || 0,
                        latestGradeDate: grade.updated_at || '',
                        academicLevel: grade.academicLevel,
                        gradingPeriod: grade.gradingPeriod,
                        schoolYear: grade.school_year || ''
                    });
                }
            }
        });
        
        return Array.from(studentsMap.values());
    };

    // Get available subjects from assigned courses with safe access
    const availableSubjects = (assignedCourses || []).map(course => {
        // Skip courses that don't have the required structure
        if (!course?.course?.id || !course?.course?.name || !course?.academicLevel?.name) {
            return null;
        }
        
        return {
            id: course.course.id.toString(),
            name: course.course.name,
            code: course.course.code || 'N/A',
            academicLevel: course.academicLevel.name,
            schoolYear: course.school_year || 'N/A'
        };
    }).filter((subject): subject is NonNullable<typeof subject> => subject !== null); // Remove null entries with proper typing

    const handleStudentClick = (student: {
        id: number;
        name: string;
        email: string;
        latestGrade: number;
        latestGradeDate: string;
        academicLevel: { key: string; name: string };
        gradingPeriod?: { name: string };
        schoolYear: string;
    }) => {
        setSelectedStudent(student);
        setShowStudentModal(true);
    };

    const handleCloseStudentModal = () => {
        setShowStudentModal(false);
        setSelectedStudent(null);
    };

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
                                View and manage student grades for your assigned courses.
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
                                <Link href={route('instructor.grades.create')}>
                                    <Button className="flex items-center gap-2">
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
                                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            No Assigned Courses
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            You don't have any assigned courses yet. Please contact your administrator.
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
                                        <div className="text-sm text-muted-foreground">
                                            {getStudentsForSubject(selectedSubject).length} students
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {getStudentsForSubject(selectedSubject).length > 0 ? (
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
                                                    {getStudentsForSubject(selectedSubject)
                                                        .filter(student => 
                                                            student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            student.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                                        )
                                                        .map((student) => (
                                                            <tr 
                                                                key={student.id} 
                                                                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                                                onClick={() => handleStudentClick(student)}
                                                            >
                                                                <td className="p-3">
                                                                    <div>
                                                                        <p className="font-medium">{student.name}</p>
                                                                        <p className="text-sm text-muted-foreground">{student.email}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="p-3">
                                                                    <Badge className={getGradeColor(student.latestGrade, student.academicLevel?.key)}>
                                                                        {student.latestGrade}
                                                                    </Badge>
                                                                </td>
                                                                <td className="p-3">
                                                                    <span className={`text-sm ${
                                                                        getGradeStatus(student.latestGrade, student.academicLevel?.key) === 'Passing' 
                                                                            ? 'text-green-600 dark:text-green-400' 
                                                                            : 'text-red-600 dark:text-red-400'
                                                                    }`}>
                                                                        {getGradeStatus(student.latestGrade, student.academicLevel?.key)}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 text-sm text-muted-foreground">
                                                                    {student.latestGradeDate ? new Date(student.latestGradeDate).toLocaleDateString() : 'N/A'}
                                                                </td>
                                                                <td className="p-3">
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleStudentClick(student);
                                                                        }}
                                                                    >
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        View/Edit
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">
                                                No students found for this subject.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* No Subject Selected State */}
                        {!selectedSubject && (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        Select a Subject
                                    </h3>
                                    <p className="text-gray-400 dark:text-gray-400 mb-4">
                                        Choose a subject from above to view and manage student grades.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pagination */}
                        {grades?.last_page && grades.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    disabled={grades.current_page === 1}
                                    onClick={() => {}}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {grades.current_page} of {grades.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={grades.current_page === grades.last_page}
                                    onClick={() => {}}
                                >
                                    Next
                                </Button>
                            </div>
                        )}

                        {/* Student Details Modal */}
                        {showStudentModal && selectedStudent && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            Student Details - {selectedStudent.name}
                                        </h2>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCloseStudentModal}
                                        >
                                            ✕
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Student Information */}
                                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                                <p className="font-medium">{selectedStudent.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                                <p className="font-medium">{selectedStudent.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                                                <p className="font-medium">{availableSubjects.find(s => s.id === selectedSubject)?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Academic Level</p>
                                                <p className="font-medium">{selectedStudent.academicLevel?.name}</p>
                                            </div>
                                        </div>

                                        {/* Current Grade */}
                                        <div className="p-4 border rounded-lg">
                                            <h3 className="font-medium mb-2">Current Grade</h3>
                                            <div className="flex items-center gap-4">
                                                <Badge className={getGradeColor(selectedStudent.latestGrade, selectedStudent.academicLevel?.key)}>
                                                    {selectedStudent.latestGrade}
                                                </Badge>
                                                <span className={`text-sm ${
                                                    getGradeStatus(selectedStudent.latestGrade, selectedStudent.academicLevel?.key) === 'Passing' 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {getGradeStatus(selectedStudent.latestGrade, selectedStudent.academicLevel?.key)}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    Last updated: {selectedStudent.latestGradeDate ? new Date(selectedStudent.latestGradeDate).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4">
                                            <Link href={route('instructor.grades.create')} className="flex-1">
                                                <Button className="w-full">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Input New Grade
                                                </Button>
                                            </Link>
                                            <Button variant="outline" className="flex-1">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Grade
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
