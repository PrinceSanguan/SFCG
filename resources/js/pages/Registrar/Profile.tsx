import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import Header from '@/pages/Registrar/Header';
import Sidebar from '@/pages/Registrar/Sidebar';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface Props {
    user: User;
}

const Profile: React.FC<Props> = ({ user }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
    });

    const { data: passwordData, setData: setPasswordData, put: putPassword, processing: passwordProcessing, errors: passwordErrors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/registrar/profile');
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        putPassword('/registrar/password', {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <>
            <Head title="Profile - Registrar" />
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-8">
                        <div className="max-w-4xl mx-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                                <p className="text-gray-600 mt-2">Manage your account information and security settings</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Profile Information */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                                        <p className="text-sm text-gray-600 mt-1">Update your account profile information</p>
                                    </div>
                                    <div className="p-6">
                                        <form onSubmit={handleProfileSubmit}>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                        Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        required
                                                    />
                                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                                </div>

                                                <div>
                                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        required
                                                    />
                                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Role
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={user.user_role}
                                                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                                                        disabled
                                                    />
                                                </div>

                                                <div className="pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                                    >
                                                        {processing ? 'Updating...' : 'Update Profile'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Change Password */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                                        <p className="text-sm text-gray-600 mt-1">Update your password to keep your account secure</p>
                                    </div>
                                    <div className="p-6">
                                        <form onSubmit={handlePasswordSubmit}>
                                            <div className="space-y-4">
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
                                                    {passwordErrors.current_password && <p className="mt-1 text-sm text-red-600">{passwordErrors.current_password}</p>}
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
                                                    {passwordErrors.password && <p className="mt-1 text-sm text-red-600">{passwordErrors.password}</p>}
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
                                                    {passwordErrors.password_confirmation && <p className="mt-1 text-sm text-red-600">{passwordErrors.password_confirmation}</p>}
                                                </div>

                                                <div className="pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={passwordProcessing}
                                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                                    >
                                                        {passwordProcessing ? 'Updating...' : 'Change Password'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default Profile; 