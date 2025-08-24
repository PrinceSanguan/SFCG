import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface User {
    name: string;
    email: string;
    user_role: string;
}

export default function AcademicIndex({ user }: { user: User }) {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Academic & Curriculum Management</h1>
                            <p className="text-gray-500 dark:text-gray-400">Configure academic levels, grading terms, programs, assignments, and subjects.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader><CardTitle>Define academic levels</CardTitle></CardHeader>
                                <CardContent>
                                    <Link href={route('registrar.academic.levels')}><Button variant="outline">Manage Levels</Button></Link>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Add/Edit grading periods or semesters</CardTitle></CardHeader>
                                <CardContent>
                                    <Link href={route('registrar.academic.grading')}><Button variant="outline">Manage Grading</Button></Link>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Manage strands, courses, and departments</CardTitle></CardHeader>
                                <CardContent>
                                    <Link href={route('registrar.academic.programs')}><Button variant="outline">Manage Programs</Button></Link>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Assign instructors (College)</CardTitle></CardHeader>
                                <CardContent>
                                    <Link href={route('registrar.academic.assign-instructors')}><Button variant="outline">Assign Instructors</Button></Link>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Assign teachers (SHS)</CardTitle></CardHeader>
                                <CardContent>
                                    <Link href={route('registrar.academic.assign-teachers')}><Button variant="outline">Assign Teachers</Button></Link>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Assign class advisers (Elementary to JHS)</CardTitle></CardHeader>
                                <CardContent>
                                    <Link href={route('registrar.academic.assign-advisers')}><Button variant="outline">Assign Advisers</Button></Link>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Manage subjects per level</CardTitle></CardHeader>
                                <CardContent>
                                    <Link href={route('registrar.academic.subjects')}><Button variant="outline">Manage Subjects</Button></Link>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Student Subject Management</CardTitle></CardHeader>
                                <CardContent>
                                    <Link href={route('registrar.academic.student-subjects.index')}><Button variant="outline">Manage Student Subjects</Button></Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
