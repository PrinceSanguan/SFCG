import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';

type User = { id: number; name: string; email: string; user_role: string };

export default function SectionsHome() {
    const { props } = usePage<{ user: User }>();
    const { user } = props;

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Sections</h1>
                            <p className="text-gray-500 dark:text-gray-400">Choose an academic level to manage its sections.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader><CardTitle>Elementary</CardTitle></CardHeader>
                                <CardContent>
                                    <Link href={route('admin.academic.sections.elementary')}><Button variant="outline" className="w-full">Open</Button></Link>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Junior High School</CardTitle></CardHeader>
                                <CardContent>
                                    <Link href={route('admin.academic.sections.junior')}><Button variant="outline" className="w-full">Open</Button></Link>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Senior High School</CardTitle></CardHeader>
                                <CardContent>
                                    <Link href={route('admin.academic.sections.senior')}><Button variant="outline" className="w-full">Open</Button></Link>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>College</CardTitle></CardHeader>
                                <CardContent>
                                    <Link href={route('admin.academic.sections.college')}><Button variant="outline" className="w-full">Open</Button></Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}




































































































