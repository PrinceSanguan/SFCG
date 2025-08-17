import React from 'react';
import { Head } from '@inertiajs/react';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrincipalsList() {
    return (
        <>
            <Head title="Principals Management" />
            
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                        <div className="max-w-7xl mx-auto">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Principals Management</CardTitle>
                                    <CardDescription>
                                        Manage principal accounts in the system
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>Principals management page - coming soon!</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
