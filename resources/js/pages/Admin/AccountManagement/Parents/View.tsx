import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Users, Trash2, Link2, Unlink } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    created_at: string;
    last_login_at?: string;
    students?: Array<{
        id: number;
        name: string;
        email: string;
        user_role: string;
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
    created_at: string;
    details: any;
    user?: User;
    target_user?: User;
}

interface PaginatedActivityLogs {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ViewParentProps {
    user: User;
    parent: User;
    activityLogs: PaginatedActivityLogs;
}

export default function ViewParent({ user, parent, activityLogs }: ViewParentProps) {
    const handleUnlinkStudent = (studentId: number, studentName: string) => {
        if (confirm(`Are you sure you want to unlink ${studentName} from this parent? This action cannot be undone.`)) {
            router.delete(route('admin.parents.unlink-student', [parent.id, studentId]));
        }
    };

    const getRelationshipBadgeVariant = (type: string) => {
        switch (type) {
            case 'father':
                return 'default';
            case 'mother':
                return 'secondary';
            case 'guardian':
                return 'outline';
            case 'other':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatRelationshipType = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const formatActionName = (action: string) => {
        return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <Link href={route('admin.parents.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Parents
                                </Button>
                            </Link>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{parent.name}</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Parent Account Details
                                </p>
                            </div>
                            <Link href={route('admin.parents.edit', parent.id)}>
                                <Button className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    Edit Parent
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Parent Information */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Parent Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                                                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{parent.name}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                                                <p className="text-gray-900 dark:text-gray-100">{parent.email}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</label>
                                                <p className="text-gray-900 dark:text-gray-100">
                                                    {new Date(parent.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</label>
                                                <p className="text-gray-900 dark:text-gray-100">
                                                    {parent.last_login_at 
                                                        ? new Date(parent.last_login_at).toLocaleDateString()
                                                        : 'Never logged in'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Linked Students */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5" />
                                                Linked Students ({parent.students?.length || 0})
                                            </CardTitle>
                                            <Link href={route('admin.parents.edit', parent.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Link2 className="h-4 w-4 mr-2" />
                                                    Manage Links
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {parent.students && parent.students.length > 0 ? (
                                            <div className="space-y-4">
                                                {parent.students.map((student) => (
                                                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                                                                <Badge variant={getRelationshipBadgeVariant(student.pivot.relationship_type)}>
                                                                    {formatRelationshipType(student.pivot.relationship_type)}
                                                                </Badge>
                                                                {student.pivot.emergency_contact === 'yes' && (
                                                                    <Badge variant="secondary">
                                                                        Emergency Contact
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {student.pivot.notes && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                                    <span className="font-medium">Notes:</span> {student.pivot.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Link href={route('admin.users.show', student.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    View
                                                                </Button>
                                                            </Link>
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm"
                                                                onClick={() => handleUnlinkStudent(student.id, student.name)}
                                                            >
                                                                <Unlink className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p>No students linked to this parent account.</p>
                                                <Link href={route('admin.parents.edit', parent.id)}>
                                                    <Button variant="outline" className="mt-4">
                                                        <Link2 className="h-4 w-4 mr-2" />
                                                        Link Students
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Stats and Activity */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Stats</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Students Linked</span>
                                                <span className="font-medium">{parent.students?.length || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Emergency Contacts</span>
                                                <span className="font-medium">
                                                    {parent.students?.filter(s => s.pivot.emergency_contact === 'yes').length || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Account Status</span>
                                                <Badge variant="secondary">Active</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Activity */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {activityLogs.data.slice(0, 5).map((log) => (
                                                <div key={log.id} className="flex flex-col gap-1 pb-3 border-b last:border-b-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {formatActionName(log.action)}
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {new Date(log.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                            {activityLogs.total === 0 && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
