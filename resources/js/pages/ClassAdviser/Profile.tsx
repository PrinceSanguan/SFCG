import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import ClassAdviserLayout from './ClassAdviserLayout';

interface Props {
    adviser: {
        id: number;
        name: string;
        email: string;
        created_at: string;
        last_login_at: string;
        role_display: string;
    };
}

const ClassAdviserProfile: React.FC<Props> = ({ adviser }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

    const { data, setData, put, processing, errors, reset } = useForm({
        name: adviser.name,
        email: adviser.email,
    });

    const { 
        data: passwordData, 
        setData: setPasswordData, 
        put: putPassword, 
        processing: passwordProcessing, 
        errors: passwordErrors, 
        reset: resetPassword 
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/class-adviser/profile', {
            onSuccess: () => {
                reset();
            },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        putPassword('/class-adviser/password', {
            onSuccess: () => {
                resetPassword();
            },
        });
    };

    return (
        <>
            <Head title="Profile - Class Adviser" />
            <ClassAdviserLayout>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="text-gray-600 mt-2">Manage your account information and security settings.</p>
                    </div>

                    {/* Tabs */}
                    <div className="mb-8">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'profile'
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'password'
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Change Password
                            </button>
                        </nav>
                    </div>

                    {/* Profile Information Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                                <p className="text-sm text-gray-600 mt-1">Update your account profile information.</p>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            {processing ? 'Updating...' : 'Update Profile'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Change Password Tab */}
                    {activeTab === 'password' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                                <p className="text-sm text-gray-600 mt-1">Update your password to keep your account secure.</p>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            id="current_password"
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData('current_password', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                        />
                                        {passwordErrors.current_password && (
                                            <p className="mt-1 text-sm text-red-600">{passwordErrors.current_password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData('password', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                        />
                                        {passwordErrors.password && (
                                            <p className="mt-1 text-sm text-red-600">{passwordErrors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="password_confirmation"
                                            value={passwordData.password_confirmation}
                                            onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={passwordProcessing}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            {passwordProcessing ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Account Information */}
                    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
                            <p className="text-sm text-gray-600 mt-1">Your account details and statistics.</p>
                        </div>
                        <div className="p-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{adviser.role_display}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{adviser.created_at}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{adviser.last_login_at}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                                    <dd className="mt-1">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </ClassAdviserLayout>
        </>
    );
};

export default ClassAdviserProfile; 