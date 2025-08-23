import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { ArrowLeft, UserCheck, GraduationCap, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';

interface User {
    name?: string;
    email?: string;
    user_role?: string;
}

interface AcademicLevel {
    id: number;
    key: string;
    name: string;
    sort_order: number;
}

interface GradingPeriod {
    id: number;
    name: string;
    academic_level_id: number;
    sort_order: number;
}

interface Adviser {
    id: number;
    name: string;
    email: string;
}

interface AdviserAssignment {
    id: number;
    adviser_id: number;
    academic_level_id: number;
    grading_period_id: number;
    school_year: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    adviser: Adviser;
    academicLevel: AcademicLevel;
    gradingPeriod: GradingPeriod;
}

interface AssignAdvisersProps {
    user: User;
    assignments: AdviserAssignment[];
    advisers: Adviser[];
    academicLevels: AcademicLevel[];
    gradingPeriods: GradingPeriod[];
}

export default function AssignAdvisers({ user, assignments, advisers, academicLevels, gradingPeriods }: AssignAdvisersProps) {
    // Group assignments by school year
    const groupedAssignments = assignments.reduce((acc, assignment) => {
        if (!acc[assignment.school_year]) {
            acc[assignment.school_year] = [];
        }
        acc[assignment.school_year].push(assignment);
        return acc;
    }, {} as Record<string, AdviserAssignment[]>);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {/* Back Button */}
                        <div className="flex items-center gap-4">
                            <Link href={route('registrar.academic.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Academic Management
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Class Adviser Assignments
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                View and manage class adviser assignments to academic levels.
                            </p>
                        </div>

                        {/* Info Card */}
                        <Card className="bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <UserCheck className="h-5 w-5 text-pink-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-pink-900 dark:text-pink-100">
                                            Adviser Assignment Overview
                                        </h3>
                                        <p className="text-sm text-pink-700 dark:text-pink-300 mt-1">
                                            This page displays all class adviser assignments organized by school year. 
                                            Assignments link advisers to specific academic levels and grading periods.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <UserCheck className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {assignments.length}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Total Assignments
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-8 w-8 text-green-600" />
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {advisers.length}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Available Advisers
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <GraduationCap className="h-8 w-8 text-orange-600" />
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {academicLevels.length}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Academic Levels
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-8 w-8 text-purple-600" />
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {Object.keys(groupedAssignments).length}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                School Years
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Assignments by School Year */}
                        {Object.entries(groupedAssignments).map(([schoolYear, yearAssignments]) => (
                            <Card key={schoolYear}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-green-600" />
                                        School Year: {schoolYear}
                                        <Badge variant="outline" className="ml-2">
                                            {yearAssignments.length} assignments
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {yearAssignments.map((assignment) => (
                                            <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex flex-col">
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                            {assignment.adviser.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {assignment.adviser.email}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <UserCheck className="h-4 w-4" />
                                                    </div>
                                                    
                                                    <div className="flex flex-col">
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                            {assignment.academicLevel.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Academic Level
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex flex-col">
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {assignment.gradingPeriod.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Grading Period
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3">
                                                    {assignment.is_active ? (
                                                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                    
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Created: {new Date(assignment.created_at).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Updated: {new Date(assignment.updated_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {assignments.length === 0 && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8">
                                        <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">No adviser assignments found.</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                            Adviser assignments must be configured by an administrator.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Additional Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">About Adviser Assignments</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Class adviser assignments are essential for:
                                    </p>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                                        <li>• Student guidance and counseling</li>
                                        <li>• Academic monitoring and support</li>
                                        <li>• Class management and coordination</li>
                                        <li>• Parent communication and liaison</li>
                                        <li>• Student welfare and development</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Assignment Structure</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Each assignment includes:
                                    </p>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                                        <li>• Adviser and academic level pairing</li>
                                        <li>• Grading period assignment</li>
                                        <li>• School year designation</li>
                                        <li>• Active/inactive status</li>
                                        <li>• Assignment tracking and history</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Adviser Role Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Class Adviser Responsibilities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 border rounded-lg">
                                        <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Student Guidance</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Provide academic and personal guidance to assigned students.
                                        </p>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <GraduationCap className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Academic Monitoring</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Monitor student progress and academic performance.
                                        </p>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Class Coordination</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Coordinate class activities and parent communications.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
