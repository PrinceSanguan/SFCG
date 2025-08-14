import { Header } from '@/components/admin/header'; // Import the Header component
import { Sidebar } from '@/components/admin/sidebar'; // Import the Sidebar component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Users, UserPlus, Activity, Shield } from 'lucide-react';

interface User {
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
    details?: any;
}

interface Stats {
    total_users: number;
    admin_count: number;
    instructor_count: number;
    teacher_count: number;
    adviser_count: number;
    chairperson_count: number;
    principal_count: number;
    student_count: number;
    parent_count: number;
}

interface DashboardProps {
    user: User;
    stats: Stats;
    recentUsers: User[];
    recentActivities: ActivityLog[];
}

export default function AdminDashboard({ user, stats, recentUsers, recentActivities }: DashboardProps) {
    // Safety check for user data
    if (!user) {
        return <div>Loading...</div>;
    }
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Pass user data to the Sidebar component */}
            <Sidebar user={user} />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Pass user data to the Header component */}
                <Header user={user} />

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Welcome back, {user.name}! Manage your school system from here.
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total_users}</div>
                                    <p className="text-xs text-muted-foreground">
                                        All registered users
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Students</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.student_count}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Active students
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Staff</CardTitle>
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.teacher_count + stats.instructor_count + stats.adviser_count + stats.chairperson_count + stats.principal_count}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Teachers & Staff
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Parents</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.parent_count}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Registered parents
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Role Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle>User Role Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Admins</span>
                                        <Badge variant="default">{stats.admin_count}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Teachers</span>
                                        <Badge variant="secondary">{stats.teacher_count}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Instructors</span>
                                        <Badge variant="secondary">{stats.instructor_count}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Advisers</span>
                                        <Badge variant="secondary">{stats.adviser_count}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Chairpersons</span>
                                        <Badge variant="secondary">{stats.chairperson_count}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Principals</span>
                                        <Badge variant="secondary">{stats.principal_count}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Students</span>
                                        <Badge variant="outline">{stats.student_count}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Parents</span>
                                        <Badge variant="outline">{stats.parent_count}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Recent Users */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Recent Users</CardTitle>
                                    <Link href={route('admin.users.index')}>
                                        <Button variant="outline" size="sm">
                                            View All
                                        </Button>
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentUsers.map((recentUser) => (
                                            <div key={recentUser.id} className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">{recentUser.name}</p>
                                                    <p className="text-xs text-muted-foreground">{recentUser.email}</p>
                                                </div>
                                                <Badge variant="secondary">
                                                    {recentUser.user_role}
                                                </Badge>
                                            </div>
                                        ))}
                                        {recentUsers.length === 0 && (
                                            <p className="text-sm text-muted-foreground">No users yet</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activities */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Recent Activities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentActivities.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm">
                                                        <span className="font-medium">{activity.user.name}</span>{' '}
                                                        {activity.action.replace('_', ' ')}{' '}
                                                        {activity.target_user && (
                                                            <span className="font-medium">{activity.target_user.name}</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(activity.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {recentActivities.length === 0 && (
                                            <p className="text-sm text-muted-foreground">No recent activities</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <Link href={route('admin.users.create')}>
                                        <Button className="flex items-center gap-2">
                                            <UserPlus className="h-4 w-4" />
                                            Add New User
                                        </Button>
                                    </Link>
                                    <Link href={route('admin.users.index')}>
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            Manage Users
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
