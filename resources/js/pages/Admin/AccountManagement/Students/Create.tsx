import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { 
    ArrowLeft, 
    Save, 
    UserPlus,
    GraduationCap,
    Mail,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AppHeader } from '@/components/app-header';
import { Sidebar } from '@/components/admin/sidebar';

interface PageProps {
    user: any;
    role: string;
    roleDisplayName: string;
}

export default function StudentsCreate({ user, role, roleDisplayName }: PageProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.students.store'));
    };

    return (
        <>
            <Head title={`Create New ${roleDisplayName}`} />
            
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
                                    Create New {roleDisplayName}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Add a new student account to the system
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-2xl">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                        <GraduationCap size={20} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle>Student Information</CardTitle>
                                        <CardDescription>
                                            Enter the student's basic information and account details
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="flex items-center gap-2">
                                            <UserPlus size={16} />
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

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="flex items-center gap-2">
                                            <Lock size={16} />
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Enter a secure password"
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

                                    {/* Confirm Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="flex items-center gap-2">
                                            <Lock size={16} />
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder="Confirm the password"
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

                                    {/* Role Information */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                            <GraduationCap size={16} />
                                            <span className="font-medium">Account Type</span>
                                        </div>
                                        <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                                            This account will be created as a <strong>{roleDisplayName}</strong> with appropriate permissions and access levels.
                                        </p>
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
                                                    Creating...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Save size={16} />
                                                    Create Student
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppShell>
        </>
    );
}
