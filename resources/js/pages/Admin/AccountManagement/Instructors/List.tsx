import React from 'react';
import { Head } from '@inertiajs/react';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InstructorsList() {
    return (
        <>
            <Head title="Instructors Management" />
            
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                        <div className="max-w-7xl mx-auto">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Instructors Management</CardTitle>
                                    <CardDescription>
                                        Manage instructor accounts in the system
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>Instructors management page - coming soon!</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
