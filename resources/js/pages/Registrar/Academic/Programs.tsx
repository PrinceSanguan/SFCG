import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Building2, GraduationCap, BookOpen, Users, CheckCircle, XCircle } from 'lucide-react';

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
    strands?: Strand[];
}

interface Strand {
    id: number;
    name: string;
    description?: string;
    academic_level_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Department {
    id: number;
    name: string;
    description?: string;
    academic_level_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    courses?: Course[];
}

interface Course {
    id: number;
    name: string;
    code: string;
    description?: string;
    department_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ProgramsProps {
    user: User;
    academicLevels: AcademicLevel[];
    departments: Department[];
}

export default function Programs({ user, academicLevels, departments }: ProgramsProps) {
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
                                Academic Programs & Structure
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                View academic programs, strands, departments, and courses for each level.
                            </p>
                        </div>

                        {/* Info Card */}
                        <Card className="bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Building2 className="h-5 w-5 text-teal-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-teal-900 dark:text-teal-100">
                                            Academic Structure Overview
                                        </h3>
                                        <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">
                                            This page displays the complete academic structure including programs, strands, 
                                            departments, and courses organized by academic level.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academic Levels with Strands */}
                        {academicLevels.map((level) => (
                            <Card key={level.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5 text-blue-600" />
                                        {level.name} - Academic Structure
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Strands Section */}
                                        {level.strands && level.strands.length > 0 && (
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 text-indigo-600" />
                                                    Strands
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {level.strands.map((strand) => (
                                                        <div key={strand.id} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {strand.name}
                                                                </h5>
                                                                {strand.is_active ? (
                                                                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-xs">
                                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                                        Active
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-xs">
                                                                        <XCircle className="h-3 w-3 mr-1" />
                                                                        Inactive
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {strand.description && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {strand.description}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                                Created: {new Date(strand.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Departments Section */}
                                        {departments.filter(dept => dept.academic_level_id === level.id).length > 0 && (
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-purple-600" />
                                                    Departments
                                                </h4>
                                                <div className="space-y-4">
                                                    {departments
                                                        .filter(dept => dept.academic_level_id === level.id)
                                                        .map((department) => (
                                                            <div key={department.id} className="border rounded-lg p-4">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                                                        {department.name}
                                                                    </h5>
                                                                    {department.is_active ? (
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
                                                                </div>
                                                                {department.description && (
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                                        {department.description}
                                                                    </p>
                                                                )}
                                                                
                                                                {/* Courses in Department */}
                                                                {department.courses && department.courses.length > 0 && (
                                                                    <div>
                                                                        <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                                            <BookOpen className="h-3 w-3 text-blue-600" />
                                                                            Courses ({department.courses.length})
                                                                        </h6>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                            {department.courses.map((course) => (
                                                                                <div key={course.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <div>
                                                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                                                {course.name}
                                                                                            </p>
                                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                                Code: {course.code}
                                                                                            </p>
                                                                                        </div>
                                                                                        {course.is_active ? (
                                                                                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-xs">
                                                                                                Active
                                                                                            </Badge>
                                                                                        ) : (
                                                                                            <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-xs">
                                                                                                Inactive
                                                                                            </Badge>
                                                                                        )}
                                                                                    </div>
                                                                                    {course.description && (
                                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                                            {course.description}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                                                    Created: {new Date(department.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* No Content Message */}
                                        {(!level.strands || level.strands.length === 0) && 
                                         departments.filter(dept => dept.academic_level_id === level.id).length === 0 && (
                                            <div className="text-center py-6">
                                                <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    No programs or departments configured for {level.name} yet.
                                                </p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                                    Academic structure must be configured by an administrator.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Additional Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Academic Structure</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        The academic structure provides the foundation for:
                                    </p>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                                        <li>• Student enrollment and programs</li>
                                        <li>• Course offerings and curriculum</li>
                                        <li>• Teacher and instructor assignments</li>
                                        <li>• Academic planning and scheduling</li>
                                        <li>• Grade computation and reporting</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">System Integration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Programs integrate with other system components:
                                    </p>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                                        <li>• Student registration and enrollment</li>
                                        <li>• Course scheduling and assignments</li>
                                        <li>• Grade recording and computation</li>
                                        <li>• Academic reporting and analytics</li>
                                        <li>• Certificate and transcript generation</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
