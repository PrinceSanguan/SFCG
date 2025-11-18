import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, User, Calendar, Mail, Users, Key } from 'lucide-react';
import { useState } from 'react';
import PasswordResetModal from '@/components/registrar/PasswordResetModal';

interface Parent {
    id: number;
    name: string;
    email: string;
    created_at: string;
    parent_relationships: Array<{
        id: number;
        student: {
            id: number;
            name: string;
            email: string;
            user_role: string;
        };
    }>;
}

interface ParentsShowProps {
    user: any;
    parent: Parent;
}

export default function ParentsShow({ user, parent }: ParentsShowProps) {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {/* Back Button */}
                        <div className="flex items-center gap-4">
                            <Link href={route('registrar.parents.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Parents
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Parent Details
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                View information about {parent.name}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Parent Information */}
                            <div className="lg:col-span-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Parent Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Name</label>
                                            <p className="text-lg font-semibold">{parent.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <p className="text-lg">{parent.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Member Since</label>
                                            <p className="text-sm">{new Date(parent.created_at).toLocaleDateString()}</p>
                                        </div>
                                        
                                        <div className="pt-4 space-y-2">
                                            <Link href={route('registrar.parents.edit', parent.id)}>
                                                <Button className="w-full">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Parent
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => setShowPasswordModal(true)}
                                            >
                                                <Key className="h-4 w-4 mr-2" />
                                                Change Password
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Linked Students */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Linked Students
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {parent.parent_relationships.length > 0 ? (
                                                parent.parent_relationships.map((relationship) => (
                                                    <div key={relationship.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div>
                                                                <p className="font-medium">{relationship.student.name}</p>
                                                                <p className="text-sm text-gray-500">{relationship.student.email}</p>
                                                            </div>
                                                            <Badge variant="secondary">{relationship.student.user_role}</Badge>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Link href={route('registrar.students.show', relationship.student.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    View Student
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500">No students linked to this parent.</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Password Reset Modal */}
            <PasswordResetModal
                user={parent}
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                routeName="registrar.parents.reset-password"
            />
        </div>
    );
}
