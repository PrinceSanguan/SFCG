import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, GraduationCap, CheckCircle, XCircle } from 'lucide-react';

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

interface Subject {
    id: number;
    name: string;
    code: string;
    description?: string;
    academic_level_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    academic_level: AcademicLevel;
}

interface SubjectsProps {
    user: User;
    subjects: Subject[];
    academicLevels: AcademicLevel[];
}

export default function Subjects({ user, subjects, academicLevels }: SubjectsProps) {
    // Group subjects by academic level
    const groupedSubjects = subjects.reduce((acc, subject) => {
        const levelKey = subject.academic_level.key;
        if (!acc[levelKey]) {
            acc[levelKey] = [];
        }
        acc[levelKey].push(subject);
        return acc;
    }, {} as Record<string, Subject[]>);

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
                                Subjects
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                View subjects configured for each academic level.
                            </p>
                        </div>

                        {/* Info Card */}
                        <Card className="bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <BookOpen className="h-5 w-5 text-indigo-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-indigo-900 dark:text-indigo-100">
                                            Subjects Overview
                                        </h3>
                                        <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                                            Subjects define the curriculum for each academic level. 
                                            They are used for teacher assignments, grade recording, and academic planning.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subjects by Level */}
                        {Object.entries(groupedSubjects).map(([levelKey, levelSubjects]) => (
                            <Card key={levelKey}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5 text-blue-600" />
                                        {levelSubjects[0]?.academic_level.name} - Subjects
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {levelSubjects
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map((subject) => (
                                                <div key={subject.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col">
                                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                                {subject.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Code: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{subject.code}</code>
                                                            </p>
                                                            {subject.description && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                    {subject.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {subject.is_active ? (
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
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Created: {new Date(subject.created_at).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Updated: {new Date(subject.updated_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {subjects.length === 0 && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8">
                                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">No subjects configured yet.</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                            Subjects must be configured by an administrator.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Additional Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">About Subjects</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Subjects are the foundation of the curriculum:
                                    </p>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                                        <li>• Define course content and objectives</li>
                                        <li>• Structure teacher assignments</li>
                                        <li>• Organize grade recording</li>
                                        <li>• Plan academic schedules</li>
                                        <li>• Support honor calculations</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">System Integration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Subjects integrate with other system components:
                                    </p>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                                        <li>• Teacher-subject assignments</li>
                                        <li>• Student grade recording</li>
                                        <li>• Academic reporting</li>
                                        <li>• Honor system criteria</li>
                                        <li>• Certificate generation</li>
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
