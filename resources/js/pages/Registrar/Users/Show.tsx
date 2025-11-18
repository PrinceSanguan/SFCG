import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, User, Calendar, Mail, Shield, Key, GraduationCap, School, Users, Phone, MapPin, UserCircle } from 'lucide-react';
import { useState } from 'react';
import PasswordResetModal from '@/components/registrar/PasswordResetModal';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    created_at: string;
    student_number?: string;
    year_level?: string;
    specific_year_level?: string;
    section?: {
        id: number;
        name: string;
    };
    birth_date?: string;
    gender?: string;
    phone_number?: string;
    address?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    parents?: Array<{
        id: number;
        name: string;
        email: string;
        pivot: {
            relationship_type: string;
            emergency_contact: string;
            notes?: string;
        };
    }>;
    students?: Array<{
        id: number;
        name: string;
        email: string;
        pivot: {
            relationship_type: string;
            emergency_contact: string;
            notes?: string;
        };
    }>;
}

interface ActivityLog {
    id: number;
    action: string;
    entity_type: string;
    details: any;
    created_at: string;
    user: User;
}

interface UsersShowProps {
    user: any;
    targetUser: User;
    activityLogs: ActivityLog[];
}

export default function UsersShow({ user, targetUser, activityLogs }: UsersShowProps) {
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
                            <Link href={route('registrar.users.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Users
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                User Details
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                View information about {targetUser.name}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* User Information */}
                            <div className="lg:col-span-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            User Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Name</label>
                                            <p className="text-lg font-semibold">{targetUser.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <p className="text-lg">{targetUser.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Role</label>
                                            <Badge variant="secondary" className="mt-1">
                                                {targetUser.user_role}
                                            </Badge>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Member Since</label>
                                            <p className="text-sm">{new Date(targetUser.created_at).toLocaleDateString()}</p>
                                        </div>
                                        
                                        <div className="pt-4 space-y-2">
                                            <Link href={route('registrar.users.edit', targetUser.id)}>
                                                <Button className="w-full">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit User
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

                                {/* Student Information (for students) */}
                                {targetUser.user_role === 'student' && (targetUser.student_number || targetUser.year_level || targetUser.specific_year_level || targetUser.section) && (
                                    <Card className="mt-6">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <GraduationCap className="h-5 w-5" />
                                                Student Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {targetUser.student_number && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Student Number</label>
                                                    <p className="text-sm">{targetUser.student_number}</p>
                                                </div>
                                            )}
                                            {targetUser.year_level && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Academic Level</label>
                                                    <p className="text-sm capitalize">{targetUser.year_level.replace('_', ' ')}</p>
                                                </div>
                                            )}
                                            {targetUser.specific_year_level && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Year Level</label>
                                                    <p className="text-sm capitalize">{targetUser.specific_year_level.replace('_', ' ')}</p>
                                                </div>
                                            )}
                                            {targetUser.section && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Section</label>
                                                    <p className="text-sm">{targetUser.section.name}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Personal Information (for students) */}
                                {targetUser.user_role === 'student' && (targetUser.birth_date || targetUser.gender || targetUser.phone_number || targetUser.address || targetUser.emergency_contact_name) && (
                                    <Card className="mt-6">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <UserCircle className="h-5 w-5" />
                                                Personal Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {targetUser.birth_date && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Birth Date</label>
                                                    <p className="text-sm">{new Date(targetUser.birth_date).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                            {targetUser.gender && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Gender</label>
                                                    <p className="text-sm capitalize">{targetUser.gender}</p>
                                                </div>
                                            )}
                                            {targetUser.phone_number && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                                                    <p className="text-sm">{targetUser.phone_number}</p>
                                                </div>
                                            )}
                                            {targetUser.address && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Address</label>
                                                    <p className="text-sm">{targetUser.address}</p>
                                                </div>
                                            )}
                                            {(targetUser.emergency_contact_name || targetUser.emergency_contact_phone || targetUser.emergency_contact_relationship) && (
                                                <div className="pt-3 border-t">
                                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Emergency Contact</label>
                                                    <div className="space-y-2">
                                                        {targetUser.emergency_contact_name && (
                                                            <div>
                                                                <label className="text-xs text-gray-400">Name</label>
                                                                <p className="text-sm">{targetUser.emergency_contact_name}</p>
                                                            </div>
                                                        )}
                                                        {targetUser.emergency_contact_phone && (
                                                            <div>
                                                                <label className="text-xs text-gray-400">Phone</label>
                                                                <p className="text-sm">{targetUser.emergency_contact_phone}</p>
                                                            </div>
                                                        )}
                                                        {targetUser.emergency_contact_relationship && (
                                                            <div>
                                                                <label className="text-xs text-gray-400">Relationship</label>
                                                                <p className="text-sm capitalize">{targetUser.emergency_contact_relationship}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Linked Parents (for students) */}
                            {targetUser.user_role === 'student' && (
                                <div className="lg:col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="h-5 w-5" />
                                                Linked Parents
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {targetUser.parents && targetUser.parents.length > 0 ? (
                                                <div className="space-y-3">
                                                    {targetUser.parents.map((parent) => (
                                                        <div key={parent.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3">
                                                                    <div>
                                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                                            {parent.name}
                                                                        </h4>
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {parent.email}
                                                                        </p>
                                                                    </div>
                                                                    <Badge variant="outline">
                                                                        {parent.pivot.relationship_type.charAt(0).toUpperCase() + parent.pivot.relationship_type.slice(1)}
                                                                    </Badge>
                                                                </div>
                                                                {parent.pivot.emergency_contact && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Emergency Contact: {parent.pivot.emergency_contact}
                                                                    </p>
                                                                )}
                                                                {parent.pivot.notes && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Notes: {parent.pivot.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Link href={route('registrar.parents.show', parent.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    View Parent
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500">No parents linked to this student.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Linked Students (for parents) */}
                            {targetUser.user_role === 'parent' && (
                                <div className="lg:col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="h-5 w-5" />
                                                Linked Students
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {targetUser.students && targetUser.students.length > 0 ? (
                                                <div className="space-y-3">
                                                    {targetUser.students.map((student) => (
                                                        <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3">
                                                                    <div>
                                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                                            {student.name}
                                                                        </h4>
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {student.email}
                                                                        </p>
                                                                    </div>
                                                                    <Badge variant="outline">
                                                                        {student.pivot.relationship_type.charAt(0).toUpperCase() + student.pivot.relationship_type.slice(1)}
                                                                    </Badge>
                                                                </div>
                                                                {student.pivot.emergency_contact && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Emergency Contact: {student.pivot.emergency_contact}
                                                                    </p>
                                                                )}
                                                                {student.pivot.notes && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Notes: {student.pivot.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Link href={route('registrar.users.show', student.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    View Student
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500">No students linked to this parent.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Activity Logs */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            Recent Activity
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {activityLogs.map((log) => (
                                                <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="font-medium">{log.action}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {log.entity_type} • {new Date(log.created_at).toLocaleString()}
                                                        </p>
                                                        {log.details && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {JSON.stringify(log.details)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {activityLogs.length === 0 && (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500">No activity logs found.</p>
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
                user={targetUser}
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                routeName="registrar.users.reset-password"
            />
        </div>
    );
}
