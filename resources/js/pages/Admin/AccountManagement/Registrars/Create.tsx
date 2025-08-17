import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Sidebar } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, ArrowLeft, UserPlus, Save } from 'lucide-react';

interface Props {
    user: User;
    roles: string[];
}

export default function CreateRegistrar({ user, roles }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        user_role: 'registrar',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/registrars');
    };

    return (
        <>
            <Head title="Create New Registrar" />
            
            <div className="flex h-screen bg-gray-50">
                <Sidebar user={user} />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                        <div className="max-w-4xl mx-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <Link href="/admin/registrars">
                                        <Button variant="ghost" size="sm">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back to Registrars
                                        </Button>
                                    </Link>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                            <Building2 className="h-6 w-6 text-blue-600" />
                                            Create New Registrar
                                        </h1>
                                        <p className="text-gray-600 mt-1">
                                            Add a new registrar account to the system
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Create Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5 text-blue-600" />
                                        Registrar Information
                                    </CardTitle>
                                    <CardDescription>
                                        Fill in the details below to create a new registrar account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Name Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Enter full name"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter email address"
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>

                                        {/* Role Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="user_role">User Role</Label>
                                            <Select
                                                value={data.user_role}
                                                onValueChange={(value) => setData('user_role', value)}
                                            >
                                                <SelectTrigger className={errors.user_role ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select user role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role} value={role}>
                                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.user_role && (
                                                <p className="text-sm text-red-600">{errors.user_role}</p>
                                            )}
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Enter password"
                                                className={errors.password ? 'border-red-500' : ''}
                                            />
                                            {errors.password && (
                                                <p className="text-sm text-red-600">{errors.password}</p>
                                            )}
                                        </div>

                                        {/* Password Confirmation Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder="Confirm password"
                                                className={errors.password_confirmation ? 'border-red-500' : ''}
                                            />
                                            {errors.password_confirmation && (
                                                <p className="text-sm text-red-600">{errors.password_confirmation}</p>
                                            )}
                                        </div>

                                        {/* Form Actions */}
                                        <div className="flex items-center justify-end gap-4 pt-6 border-t">
                                            <Link href="/admin/registrars">
                                                <Button type="button" variant="outline">
                                                    Cancel
                                                </Button>
                                            </Link>
                                            <Button 
                                                type="submit" 
                                                disabled={processing}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {processing ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Create Registrar
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Help Text */}
                            <Card className="mt-6">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Building2 className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">About Registrar Accounts</h4>
                                            <p className="text-sm text-gray-600">
                                                Registrar accounts have access to student registration, course management, and academic records. 
                                                They can manage student enrollments, course schedules, and academic policies.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
