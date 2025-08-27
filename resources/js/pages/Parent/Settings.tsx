import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import ParentLayout from '@/layouts/parent/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Lock, Save, Key } from 'lucide-react';

interface Props {
  user: { 
    name: string; 
    email: string; 
  };
}

export default function ParentSettings({ user }: Props) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const profileForm = useForm({
    name: user.name,
    email: user.email,
  });

  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileForm.put(route('parent.settings.updateProfile'));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    passwordForm.put(route('parent.settings.updatePassword'), {
      onSuccess: () => {
        passwordForm.reset();
      },
    });
  };

  return (
    <ParentLayout>
      <Head title="Settings" />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2"
          >
            <User size={16} />
            Profile
          </Button>
          <Button
            variant={activeTab === 'password' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('password')}
            className="flex items-center gap-2"
          >
            <Lock size={16} />
            Password
          </Button>
        </div>

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} /> Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={profileForm.data.name}
                      onChange={(e) => profileForm.setData('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                    {profileForm.errors.name && (
                      <p className="text-sm text-red-600">{profileForm.errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.data.email}
                      onChange={(e) => profileForm.setData('email', e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                    {profileForm.errors.email && (
                      <p className="text-sm text-red-600">{profileForm.errors.email}</p>
                    )}
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={profileForm.processing}
                  className="flex items-center gap-2"
                >
                  <Save size={16} />
                  {profileForm.processing ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Password Settings */}
        {activeTab === 'password' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key size={18} /> Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordForm.data.current_password}
                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                    placeholder="Enter your current password"
                    required
                  />
                  {passwordForm.errors.current_password && (
                    <p className="text-sm text-red-600">{passwordForm.errors.current_password}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={passwordForm.data.password}
                      onChange={(e) => passwordForm.setData('password', e.target.value)}
                      placeholder="Enter your new password"
                      required
                    />
                    {passwordForm.errors.password && (
                      <p className="text-sm text-red-600">{passwordForm.errors.password}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm New Password</Label>
                    <Input
                      id="password_confirmation"
                      type="password"
                      value={passwordForm.data.password_confirmation}
                      onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                      placeholder="Confirm your new password"
                      required
                    />
                    {passwordForm.errors.password_confirmation && (
                      <p className="text-sm text-red-600">{passwordForm.errors.password_confirmation}</p>
                    )}
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={passwordForm.processing}
                  className="flex items-center gap-2"
                >
                  <Key size={16} />
                  {passwordForm.processing ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </ParentLayout>
  );
}
