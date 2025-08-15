import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Save, 
    User,
    GraduationCap,
    Mail,
    Calendar,
    Shield,
    Eye,
    EyeOff
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AppHeader } from '@/components/app-header';
import { Sidebar } from '@/components/admin/sidebar';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    created_at: string;
    last_login_at: string | null;
}

interface PageProps {
    user: any;
    targetUser: User;
    role: string;
    roleDisplayName: string;
}

export default function StudentsEdit({ user, targetUser, role, roleDisplayName }: PageProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: targetUser.name,
        email: targetUser.email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Only include password if it's being changed
        const updateData: any = {
            name: data.name,
            email: data.email,
        };
        
        if (data.password) {
            updateData.password = data.password;
            updateData.password_confirmation = data.password_confirmation;
        }
        
        put(route('admin.students.update', targetUser.id), {
            data: updateData,
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <>
            <Head title={`Edit ${roleDisplayName} - ${targetUser.name}`} />
            
            <AppShell>
                <AppHeader user={user} />
                <Sidebar user={user} />
                
                <div className="flex-1 p-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.visit(route('admin.students.index'))}
                            >
                                <ArrowLeft size={20} />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Edit {roleDisplayName}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Update student account information
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Edit Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                            <GraduationCap size={20} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <CardTitle>Edit Student Information</CardTitle>
                                            <CardDescription>
                                                Update the student's basic information and account details
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Name Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="flex items-center gap-2">
                                                <User size={16} />
                                                Full Name
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Enter student's full name"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && <InputError message={errors.name} />}
                                        </div>

                                        {/* Email Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="flex items-center gap-2">
                                                <Mail size={16} />
                                                Email Address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter student's email address"
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && <InputError message={errors.email} />}
                                        </div>

                                        {/* Password Fields */}
                                        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Change Password (Optional)
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="password" className="flex items-center gap-2">
                                                    <Shield size={16} />
                                                    New Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        placeholder="Leave blank to keep current password"
                                                        className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </Button>
                                                </div>
                                                {errors.password && <InputError message={errors.password} />}
                                                <p className="text-sm text-gray-500">
                                                    Password must be at least 8 characters long
                                                </p>
                                            </div>

                                            {data.password && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="password_confirmation" className="flex items-center gap-2">
                                                        <Shield size={16} />
                                                        Confirm New Password
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="password_confirmation"
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            value={data.password_confirmation}
                                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                                            placeholder="Confirm the new password"
                                                            className={errors.password_confirmation ? 'border-red-500 pr-10' : 'pr-10'}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        >
                                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </Button>
                                                    </div>
                                                    {errors.password_confirmation && <InputError message={errors.password_confirmation} />}
                                                </div>
                                            )}
                                        </div>

                                        {/* Form Actions */}
                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.visit(route('admin.students.index'))}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1"
                                            >
                                                {processing ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Updating...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Save size={16} />
                                                        Update Student
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* User Info Sidebar */}
                        <div className="space-y-6">
                            {/* Current User Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Student Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                            <GraduationCap size={24} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{targetUser.name}</div>
                                            <Badge variant="default">{targetUser.user_role}</Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Mail size={14} />
                                            <span className="truncate">{targetUser.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Calendar size={14} />
                                            <span>Joined {formatDate(targetUser.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Calendar size={14} />
                                            <span>Last login: {formatDate(targetUser.last_login_at)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.visit(route('admin.students.show', targetUser.id))}
                                    >
                                        <Eye size={16} className="mr-2" />
                                        View Details
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.visit(route('admin.students.index'))}
                                    >
                                        <ArrowLeft size={16} className="mr-2" />
                                        Back to List
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </AppShell>
        </>
    );
}
