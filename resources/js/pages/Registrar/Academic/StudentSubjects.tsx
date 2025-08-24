import { useState } from 'react';
import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Edit, Trash2, Users, BookOpen, Calendar, UserCheck } from 'lucide-react';
import { router } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    academic_level_id?: number;
}

interface AcademicLevel {
    id: number;
    name: string;
    key: string;
    sort_order: number;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    academic_level_id: number;
    course?: {
        id: number;
        name: string;
        code: string;
    };
}

interface StudentSubjectAssignment {
    id: number;
    student: {
        id: number;
        name: string;
        email: string;
    };
    subject: {
        id: number;
        name: string;
        code: string;
        academic_level: AcademicLevel;
        course?: {
            id: number;
            name: string;
            code: string;
        };
    };
    school_year: string;
    semester?: string;
    is_active: boolean;
    enrolled_at: string;
    enrolled_by: {
        id: number;
        name: string;
    };
    notes?: string;
}

interface DashboardProps {
    user: User;
    academicLevels: AcademicLevel[];
    assignmentsByLevel: Record<string, StudentSubjectAssignment[]>;
    students: User[];
    subjects: Subject[];
}

export default function StudentSubjects({ 
    user, 
    academicLevels, 
    assignmentsByLevel, 
    students, 
    subjects 
}: DashboardProps) {
    const [activeTab, setActiveTab] = useState('all');
    const [assignmentModal, setAssignmentModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editAssignment, setEditAssignment] = useState<StudentSubjectAssignment | null>(null);
    
    // Assignment form state
    const [assignmentForm, setAssignmentForm] = useState({
        student_id: '',
        subject_id: '',
        school_year: '',
        semester: '',
        notes: '',
    });

    const schoolYearOptions = [
        '2024-2025',
        '2025-2026',
        '2026-2027',
        '2027-2028',
    ];

    const semesterOptions = [
        '1st Semester',
        '2nd Semester',
        'Summer',
        'N/A'
    ];

    const submitAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/registrar/academic/student-subjects', assignmentForm);
        setAssignmentModal(false);
        setAssignmentForm({
            student_id: '',
            subject_id: '',
            school_year: '',
            semester: '',
            notes: '',
        });
    };

    const updateAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editAssignment) return;
        
        router.put(`/registrar/academic/student-subjects/${editAssignment.id}`, {
            ...assignmentForm,
            is_active: editAssignment.is_active,
        });
        setEditModal(false);
        setEditAssignment(null);
        setAssignmentForm({
            student_id: '',
            subject_id: '',
            school_year: '',
            semester: '',
            notes: '',
        });
    };

    const destroyAssignment = (id: number) => {
        if (confirm('Are you sure you want to remove this student subject enrollment?')) {
            router.delete(`/registrar/academic/student-subjects/${id}`);
        }
    };

    const openEditModal = (assignment: StudentSubjectAssignment) => {
        setEditAssignment(assignment);
        setAssignmentForm({
            student_id: assignment.student.id.toString(),
            subject_id: assignment.subject.id.toString(),
            school_year: assignment.school_year,
            semester: assignment.semester || '',
            notes: assignment.notes || '',
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

    const getLevelBadge = (level: AcademicLevel) => {
        const colors = {
            elementary: 'bg-blue-100 text-blue-800',
            junior_highschool: 'bg-green-100 text-green-800',
            senior_highschool: 'bg-purple-100 text-purple-800',
            college: 'bg-orange-100 text-orange-800',
        };
        
        return (
            <Badge variant="outline" className={colors[level.key as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
                {level.name}
            </Badge>
        );
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
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
                                <h1 className="text-2xl font-bold text-gray-900">Student Subject Management</h1>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Students</p>
                                            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-2">
                                        <BookOpen className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                                            <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-2">
                                        <UserCheck className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {Object.values(assignmentsByLevel).flat().length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Current Year</p>
                                            <p className="text-2xl font-bold text-gray-900">2024-2025</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Add New Assignment */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5" />
                                    Enroll Student in Subject
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={() => setAssignmentModal(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Enrollment
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Assignments by Academic Level */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="all">All Enrollments</TabsTrigger>
                                <TabsTrigger value="elementary">Elementary</TabsTrigger>
                                <TabsTrigger value="junior_highschool">Junior High</TabsTrigger>
                                <TabsTrigger value="senior_highschool">Senior High</TabsTrigger>
                                <TabsTrigger value="college">College</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>All Student Subject Enrollments</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                    <tr>
                                                        <th className="text-left p-3">Student</th>
                                                        <th className="text-left p-3">Subject</th>
                                                        <th className="text-left p-3">Level</th>
                                                        <th className="text-left p-3">Course</th>
                                                        <th className="text-left p-3">Year</th>
                                                        <th className="text-left p-3">Semester</th>
                                                        <th className="text-left p-3">Status</th>
                                                        <th className="text-left p-3">Enrolled By</th>
                                                        <th className="text-left p-3">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.values(assignmentsByLevel).flat().map((assignment) => (
                                                        <tr key={assignment.id} className="border-t">
                                                            <td className="p-3">
                                                                <div>
                                                                    <p className="font-medium">{assignment.student.name}</p>
                                                                    <p className="text-xs text-gray-500">{assignment.student.email}</p>
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div>
                                                                    <p className="font-medium">{assignment.subject.name}</p>
                                                                    <p className="text-xs text-gray-500">{assignment.subject.code}</p>
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                {getLevelBadge(assignment.subject.academic_level)}
                                                            </td>
                                                            <td className="p-3">
                                                                {assignment.subject.course ? (
                                                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                                        {assignment.subject.course.code}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="p-3">{assignment.school_year}</td>
                                                            <td className="p-3">{assignment.semester || 'N/A'}</td>
                                                            <td className="p-3">{getStatusBadge(assignment.is_active)}</td>
                                                            <td className="p-3">
                                                                <span className="text-sm text-gray-600">{assignment.enrolled_by.name}</span>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex gap-2">
                                                                    <Button variant="outline" size="sm" onClick={() => openEditModal(assignment)}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button variant="destructive" size="sm" onClick={() => destroyAssignment(assignment.id)}>
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {academicLevels.map((level) => (
                                <TabsContent key={level.key} value={level.key} className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{level.name} Enrollments</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                                        <tr>
                                                            <th className="text-left p-3">Student</th>
                                                            <th className="text-left p-3">Subject</th>
                                                            <th className="text-left p-3">Course</th>
                                                            <th className="text-left p-3">Year</th>
                                                            <th className="text-left p-3">Semester</th>
                                                            <th className="text-left p-3">Status</th>
                                                            <th className="text-left p-3">Enrolled By</th>
                                                            <th className="text-left p-3">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {assignmentsByLevel[level.key]?.map((assignment) => (
                                                            <tr key={assignment.id} className="border-t">
                                                                <td className="p-3">
                                                                    <div>
                                                                        <p className="font-medium">{assignment.student.name}</p>
                                                                        <p className="text-xs text-gray-500">{assignment.student.email}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="p-3">
                                                                    <div>
                                                                        <p className="font-medium">{assignment.subject.name}</p>
                                                                        <p className="text-xs text-gray-500">{assignment.subject.code}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="p-3">
                                                                    {assignment.subject.course ? (
                                                                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                                            {assignment.subject.course.code}
                                                                        </Badge>
                                                                    ) : (
                                                                        <span className="text-gray-400">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-3">{assignment.school_year}</td>
                                                                <td className="p-3">{assignment.semester || 'N/A'}</td>
                                                                <td className="p-3">{getStatusBadge(assignment.is_active)}</td>
                                                                <td className="p-3">
                                                                    <span className="text-sm text-gray-600">{assignment.enrolled_by.name}</span>
                                                                </td>
                                                                <td className="p-3">
                                                                    <div className="flex gap-2">
                                                                        <Button variant="outline" size="sm" onClick={() => openEditModal(assignment)}>
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button variant="destructive" size="sm" onClick={() => destroyAssignment(assignment.id)}>
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )) || (
                                                            <tr>
                                                                <td colSpan={8} className="p-3 text-center text-gray-500">
                                                                    No enrollments found for {level.name}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            ))}
                        </Tabs>

                        {/* New Assignment Modal */}
                        <Dialog open={assignmentModal} onOpenChange={setAssignmentModal}>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Enroll Student in Subject</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submitAssignment} className="space-y-4">
                                    <div>
                                        <Label htmlFor="student">Student</Label>
                                        <Select 
                                            value={assignmentForm.student_id} 
                                            onValueChange={(value) => setAssignmentForm({ ...assignmentForm, student_id: value })}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select student" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students.map((student) => (
                                                    <SelectItem key={student.id} value={student.id.toString()}>
                                                        {student.name} ({student.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="subject">Subject</Label>
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
                                        <Label htmlFor="semester">Semester</Label>
                                        <Select 
                                            value={assignmentForm.semester} 
                                            onValueChange={(value) => setAssignmentForm({ ...assignmentForm, semester: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select semester (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {semesterOptions.map((semester) => (
                                                    <SelectItem key={semester} value={semester}>
                                                        {semester}
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
                                            placeholder="Optional notes about this enrollment"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setAssignmentModal(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            Enroll Student
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Edit Assignment Modal */}
                        <Dialog open={editModal} onOpenChange={setEditModal}>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Edit Student Subject Enrollment</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={updateAssignment} className="space-y-4">
                                    <div>
                                        <Label htmlFor="edit-student">Student</Label>
                                        <Select 
                                            value={assignmentForm.student_id} 
                                            onValueChange={(value) => setAssignmentForm({ ...assignmentForm, student_id: value })}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select student" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students.map((student) => (
                                                    <SelectItem key={student.id} value={student.id.toString()}>
                                                        {student.name} ({student.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-subject">Subject</Label>
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
                                        <Label htmlFor="edit-school_year">School Year</Label>
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
                                        <Label htmlFor="edit-semester">Semester</Label>
                                        <Select 
                                            value={assignmentForm.semester} 
                                            onValueChange={(value) => setAssignmentForm({ ...assignmentForm, semester: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select semester (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {semesterOptions.map((semester) => (
                                                    <SelectItem key={semester} value={semester}>
                                                        {semester}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-notes">Notes</Label>
                                        <Textarea 
                                            id="edit-notes"
                                            value={assignmentForm.notes}
                                            onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                                            placeholder="Optional notes about this enrollment"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setEditModal(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            Update Enrollment
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </main>
            </div>
        </div>
    );
}
