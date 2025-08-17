import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Sidebar } from '@/components/admin/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, ArrowLeft, Save, UserCog, Trash2, Eye } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    user: User;
    targetUser: User;
    roles: string[];
}

export default function EditRegistrar({ user, targetUser, roles }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: targetUser.name,
        email: targetUser.email,
        user_role: targetUser.user_role,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/registrars/${targetUser.id}`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this registrar?')) {
            router.delete(`/admin/registrars/${targetUser.id}`);
        }
    };

    const getRoleDisplayName = (role: string) => {
        return roles[role] || role.charAt(0).toUpperCase() + role.slice(1);
    };

    return (
        <>
            <Head title={`Edit Registrar - ${targetUser.name}`} />
            
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
                                            Edit Registrar
                                        </h1>
                                        <p className="text-gray-600 mt-1">
                                            Update registrar account information
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/admin/registrars/${targetUser.id}`}>
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={handleDelete}
                                        disabled={processing}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            {/* Edit Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserCog className="h-5 w-5 text-blue-600" />
                                        Registrar Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update the details below to modify this registrar account
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
                                                            {getRoleDisplayName(role)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.user_role && (
                                                <p className="text-sm text-red-600">{errors.user_role}</p>
                                            )}
                                        </div>

                                        {/* Password Fields */}
                                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                            <h4 className="font-medium text-gray-900">Change Password (Optional)</h4>
                                            <p className="text-sm text-gray-600">
                                                Leave blank if you don't want to change the password
                                            </p>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="password">New Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder="Enter new password"
                                                    className={errors.password ? 'border-red-500' : ''}
                                                />
                                                {errors.password && (
                                                    <p className="text-sm text-red-600">{errors.password}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    placeholder="Confirm new password"
                                                    className={errors.password_confirmation ? 'border-red-500' : ''}
                                                />
                                                {errors.password_confirmation && (
                                                    <p className="text-sm text-red-600">{errors.password_confirmation}</p>
                                                )}
                                            </div>
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
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Update Registrar
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Account Information */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Account Information</CardTitle>
                                    <CardDescription>
                                        Additional details about this registrar account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">User ID</Label>
                                            <p className="text-gray-900">{targetUser.id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Current Role</Label>
                                            <p className="text-gray-900">{getRoleDisplayName(targetUser.user_role)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Created</Label>
                                            <p className="text-gray-900">
                                                {new Date(targetUser.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                                            <p className="text-gray-900">
                                                {new Date(targetUser.updated_at).toLocaleDateString()}
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
