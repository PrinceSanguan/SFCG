import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, RotateCcw, Activity, Calendar, Mail, UserCheck, Clock, Users, Award, Building, School } from 'lucide-react';
import { useState } from 'react';
import PasswordResetModal from '@/components/admin/PasswordResetModal';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface ViewUser {
    id: number;
    name: string;
    email: string;
    user_role: string;
    created_at: string;
    last_login_at?: string;
}

interface ActivityLog {
    id: number;
    action: string;
    user: User;
    target_user?: User;
    created_at: string;
    details?: Record<string, unknown>;
    ip_address?: string;
}

interface PaginatedActivityLogs {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface AdviserClassAssignment {
    id: number;
    academicLevel: {
        id: number;
        name: string;
    };
    subject?: {
        id: number;
        name: string;
        code: string;
    };
    adviser?: {
        id: number;
        name: string;
    };
    grade_level: string;
    section: string;
    school_year: string;
    is_active: boolean;
}

interface AssignedStudent {
    id: number;
    name: string;
    email: string;
    student_number?: string;
    year_level?: string;
    specific_year_level?: string;
    academicLevel?: {
        id: number;
        name: string;
    };
}

interface ViewProps {
    user: User; // Current admin user
    targetUser: ViewUser; // User being viewed
    activityLogs: PaginatedActivityLogs;
    adviserClassAssignments: AdviserClassAssignment[];
    assignedStudents: AssignedStudent[];
    currentSchoolYear: string;
}

export default function ViewAdviser({ user, targetUser, activityLogs, adviserClassAssignments, assignedStudents, currentSchoolYear }: ViewProps) {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { errors } = usePage().props;

    // Safety check for user data
    if (!user || !targetUser) {
        return <div>Loading...</div>;
    }

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'default';
            case 'registrar':
            case 'teacher':
            case 'instructor':
            case 'adviser':
            case 'chairperson':
            case 'principal':
                return 'secondary';
            case 'student':
            case 'parent':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getRoleDisplayName = (role: string) => {
        const roleMap: Record<string, string> = {
            'admin': 'Administrator',
            'registrar': 'Registrar',
            'instructor': 'Instructor',
            'teacher': 'Teacher',
            'adviser': 'Adviser',
            'chairperson': 'Chairperson',
            'principal': 'Principal',
            'student': 'Student',
            'parent': 'Parent',
        };
        return roleMap[role] || role;
    };

    const formatActionText = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getActionIcon = (action: string) => {
        if (action.includes('login')) return <UserCheck className="h-4 w-4" />;
        if (action.includes('password')) return <RotateCcw className="h-4 w-4" />;
        if (action.includes('created')) return <UserCheck className="h-4 w-4" />;
        if (action.includes('updated')) return <Edit className="h-4 w-4" />;
        return <Activity className="h-4 w-4" />;
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <Link href={route('admin.advisers.index')}>
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Advisers
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Adviser Profile</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Complete profile and activity history for {targetUser.name}.
                                </p>
                            </div>
                        </div>

                        {/* User Profile Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                                    {/* Avatar and Basic Info */}
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarFallback className="text-2xl">
                                                {targetUser.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="text-xl font-semibold">{targetUser.name}</h2>
                                            <Badge variant={getRoleBadgeVariant(targetUser.user_role)} className="mt-1">
                                                {getRoleDisplayName(targetUser.user_role)}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="flex-1 grid gap-4 md:grid-cols-2">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                                                <p className="text-sm">{targetUser.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</p>
                                                <p className="text-sm">{new Date(targetUser.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</p>
                                                <p className="text-sm">
                                                    {targetUser.last_login_at 
                                                        ? new Date(targetUser.last_login_at).toLocaleString()
                                                        : 'Never logged in'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <UserCheck className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</p>
                                                <p className="text-sm text-green-600 dark:text-green-400">Active</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <Link href={route('admin.advisers.edit', targetUser.id)}>
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <Edit className="h-4 w-4" />
                                            Edit Profile
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={() => setShowPasswordModal(true)}
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Change Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Logs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Activity History ({activityLogs.total} total)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {activityLogs.data.length > 0 ? (
                                    <div className="space-y-4">
                                        {activityLogs.data.map((log) => (
                                            <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getActionIcon(log.action)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {formatActionText(log.action)}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                Performed by: <span className="font-medium">{log.user.name}</span>
                                                                {log.target_user && log.target_user.id !== log.user.id && (
                                                                    <span> • Target: <span className="font-medium">{log.target_user.name}</span></span>
                                                                )}
                                                            </p>
                                                            {log.ip_address && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    IP: {log.ip_address}
                                                                </p>
                                                            )}
                                                            {log.details && (
                                                                <div className="mt-2">
                                                                    <details className="text-xs">
                                                                        <summary className="cursor-pointer text-blue-600 dark:text-blue-400">
                                                                            View Details
                                                                        </summary>
                                                                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto dark:bg-gray-700">
                                                                            {JSON.stringify(log.details, null, 2)}
                                                                        </pre>
                                                                    </details>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {new Date(log.created_at).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {new Date(log.created_at).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pagination */}
                                        {activityLogs.last_page > 1 && (
                                            <div className="mt-6 flex items-center justify-between">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Page {activityLogs.current_page} of {activityLogs.last_page}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {activityLogs.current_page > 1 && (
                                                        <Link 
                                                            href={route('admin.advisers.show', { 
                                                                user: targetUser.id, 
                                                                page: activityLogs.current_page - 1 
                                                            })}
                                                        >
                                                            <Button variant="outline" size="sm">Previous</Button>
                                                        </Link>
                                                    )}
                                                    
                                                    {activityLogs.current_page < activityLogs.last_page && (
                                                        <Link 
                                                            href={route('admin.advisers.show', { 
                                                                user: targetUser.id, 
                                                                page: activityLogs.current_page + 1 
                                                            })}
                                                        >
                                                            <Button variant="outline" size="sm">Next</Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">No activity logs found for this user.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Adviser Class Assignments */}
                        {adviserClassAssignments && adviserClassAssignments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <School className="h-5 w-5" />
                                        Class Assignments - {currentSchoolYear}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {adviserClassAssignments.map((assignment) => (
                                            <div key={assignment.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-lg">
                                                            Grade {assignment.grade_level} - Section {assignment.section}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Adviser: {assignment.adviser?.name || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Level: {assignment.academicLevel?.name || 'N/A'}
                                                        </p>
                                                        {assignment.subject && (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                Subject: {assignment.subject?.name || 'N/A'} ({assignment.subject?.code || 'N/A'})
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            Grade {assignment.grade_level}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            Section {assignment.section}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-gray-500" />
                                                        <span className="text-gray-600 dark:text-gray-400">Level:</span>
                                                        <span>{assignment.academicLevel?.name || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Award className="h-4 w-4 text-gray-500" />
                                                        <span className="text-gray-600 dark:text-gray-400">School Year:</span>
                                                        <span>{assignment.school_year || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Assigned Students */}
                        {assignedStudents && assignedStudents.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Assigned Students - {currentSchoolYear}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {assignedStudents.map((student) => (
                                            <div key={student.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback className="text-sm">
                                                                {student.name.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h4 className="font-medium">{student.name}</h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {student.email}
                                                            </p>
                                                            {student.student_number && (
                                                                <p className="text-xs text-gray-500">
                                                                    {student.student_number}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium">
                                                            {student.specific_year_level || student.year_level || 'N/A'}
                                                        </div>
                                                        {student.academicLevel && (
                                                            <div className="text-xs text-gray-500">
                                                                {student.academicLevel?.name || 'N/A'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>

            {/* Password Reset Modal */}
            <PasswordResetModal
                user={targetUser}
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                errors={errors as Record<string, string>}
            />
        </div>
    );
}
