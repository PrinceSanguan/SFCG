import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import InstructorLayout from './InstructorLayout';

interface Instructor {
    id: number;
    name: string;
    email: string;
    created_at: string;
    last_login_at: string;
    role_display: string;
}

interface Props {
    instructor: Instructor;
}

const Profile: React.FC<Props> = ({ instructor }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

    const { data: profileData, setData: setProfileData, put: putProfile, processing: profileProcessing, errors: profileErrors, reset: resetProfile } = useForm({
        name: instructor.name,
        email: instructor.email,
    });

    const { data: passwordData, setData: setPasswordData, put: putPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        putProfile('/instructor/profile', {
            onSuccess: () => {
                resetProfile();
            }
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        putPassword('/instructor/password', {
            onSuccess: () => {
                resetPassword();
            }
        });
    };

    return (
        <>
            <Head title="Profile - Instructor" />
            <InstructorLayout>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-600 mt-2">Manage your account information and security settings.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'profile'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Profile Information
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('password')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'password'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {activeTab === 'profile' ? (
                                    <form onSubmit={handleProfileSubmit}>
                                        <div className="space-y-6">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData('name', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
                                                />
                                                {profileErrors.name && (
                                                    <p className="mt-1 text-sm text-red-600">{profileErrors.name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData('email', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
                                                />
                                                {profileErrors.email && (
                                                    <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>
                                                )}
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={profileProcessing}
                                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                                >
                                                    {profileProcessing ? 'Updating...' : 'Update Profile'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handlePasswordSubmit}>
                                        <div className="space-y-6">
                                            <div>
                                                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                                                    Current Password
                                                </label>
                                                <input
                                                    type="password"
                                                    id="current_password"
                                                    value={passwordData.current_password}
                                                    onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
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
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
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
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required
                                                />
                                                {passwordErrors.password_confirmation && (
                                                    <p className="mt-1 text-sm text-red-600">{passwordErrors.password_confirmation}</p>
                                                )}
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={passwordProcessing}
                                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                                >
                                                    {passwordProcessing ? 'Updating...' : 'Change Password'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Role</p>
                                    <p className="text-sm text-gray-900">{instructor.role_display}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                                    <p className="text-sm text-gray-900">{instructor.created_at}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Last Login</p>
                                    <p className="text-sm text-gray-900">{instructor.last_login_at}</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Tips */}
                        <div className="mt-6 bg-blue-50 rounded-lg p-6">
                            <h4 className="text-sm font-medium text-blue-900 mb-3">Security Tips</h4>
                            <ul className="text-sm text-blue-800 space-y-2">
                                <li>• Use a strong, unique password</li>
                                <li>• Never share your login credentials</li>
                                <li>• Log out when using shared devices</li>
                                <li>• Keep your email address updated</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </InstructorLayout>
        </>
    );
};

export default Profile; 