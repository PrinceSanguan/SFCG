import { Header } from '@/components/instructor/header';
import { Sidebar } from '@/components/instructor/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { BookOpen, Users, GraduationCap, Crown, Clock, TrendingUp, User } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
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
        school_year: string;
        semester?: string;
        is_active: boolean;
    }>;
    student_count: number;
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
    created_at: string;
}

interface UpcomingDeadline {
    id: number;
    title: string;
    due_date: string;
    type: string;
}

interface Stats {
    assigned_courses: number;
    student_count: number;
    grades_entered: number;
    pending_validations: number;
}

interface DashboardProps {
    user: User;
    assignedSubjects: AssignedSubject[];
    recentGrades: StudentGrade[];
    upcomingDeadlines: UpcomingDeadline[];
    stats: Stats;
}

export default function InstructorDashboard({ 
    user, 
    assignedSubjects = [], 
    recentGrades = [], 
    upcomingDeadlines = [], 
    stats = {
        assigned_courses: 0,
        student_count: 0,
        grades_entered: 0,
        pending_validations: 0
    }
}: DashboardProps) {
    if (!user) {
        return <div>Loading...</div>;
    }

    // Ensure arrays are always arrays to prevent mapping errors
    const safeAssignedSubjects = Array.isArray(assignedSubjects) ? assignedSubjects : [];
    const safeRecentGrades = Array.isArray(recentGrades) ? recentGrades : [];
    const safeUpcomingDeadlines = Array.isArray(upcomingDeadlines) ? upcomingDeadlines : [];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Welcome back, {user.name}!
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Manage your assigned subjects and student grades from your instructor dashboard.
                                </p>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Assigned Subjects</CardTitle>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.assigned_courses}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Active subject assignments
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Students</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.student_count}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Total enrolled students
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Grades Entered</CardTitle>
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.grades_entered}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Total grades recorded
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Validation</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.pending_validations}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Awaiting approval
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Assigned Subjects */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>My Assigned Subjects</CardTitle>
                                    <Link href={route('instructor.grades.index')}>
                                        <Button variant="outline" size="sm">
                                            View All
                                        </Button>
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {safeAssignedSubjects.length > 0 ? (
                                            safeAssignedSubjects.map((assignment) => (
                                                <div key={assignment.id} className="border rounded-lg p-3 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium">{assignment.subject?.name || 'Unknown Subject'}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {assignment.subject?.code || 'No Code'} • {assignment.academicLevel?.name || 'Unknown Level'} • {assignment.school_year}
                                                            </p>
                                                            {assignment.subject?.course && (
                                                                <p className="text-xs text-blue-600">
                                                                    Course: {assignment.subject.course.name} ({assignment.subject.course.code})
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Badge variant={assignment.is_active ? "default" : "secondary"}>
                                                            {assignment.is_active ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                    
                                                    {/* Enrolled Students */}
                                                    <div className="border-t pt-2">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-xs font-medium text-gray-700">Enrolled Students ({assignment.student_count})</p>
                                                        </div>
                                                        {assignment.enrolled_students.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {assignment.enrolled_students.map((enrollment) => (
                                                                    <div key={enrollment.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                                                                        <div className="flex items-center space-x-2">
                                                                            <User className="h-3 w-3 text-gray-500" />
                                                                            <span className="text-xs font-medium">{enrollment.student.name}</span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <Badge variant="outline" className="text-xs">
                                                                                {enrollment.semester || 'No Semester'}
                                                                            </Badge>
                                                                            <Badge variant={enrollment.is_active ? "default" : "secondary"} className="text-xs">
                                                                                {enrollment.is_active ? "Active" : "Inactive"}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-gray-500 italic">No students enrolled yet</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No subjects assigned yet
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Grades */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Recent Grades</CardTitle>
                                    <Link href={route('instructor.grades.index')}>
                                        <Button variant="outline" size="sm">
                                            View All
                                        </Button>
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {safeRecentGrades.length > 0 ? (
                                            safeRecentGrades.map((grade) => (
                                                <div key={grade.id} className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium">{grade.student?.name || 'Unknown Student'}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {grade.subject?.name || 'Unknown Subject'} • {grade.school_year}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">{grade.grade}</Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(grade.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No grades entered yet
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Upcoming Deadlines */}
                        {safeUpcomingDeadlines.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Upcoming Deadlines
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {safeUpcomingDeadlines.map((deadline) => (
                                            <div key={deadline.id} className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">{deadline.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {deadline.type} • Due {new Date(deadline.due_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Badge variant="destructive">Due Soon</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <Link href={route('instructor.grades.create')}>
                                        <Button className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4" />
                                            Input New Grade
                                        </Button>
                                    </Link>
                                    <Link href={route('instructor.grades.upload')}>
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Upload Grades CSV
                                        </Button>
                                    </Link>
                                    <Link href={route('instructor.honors.index')}>
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <Crown className="h-4 w-4" />
                                            View Honor Results
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
