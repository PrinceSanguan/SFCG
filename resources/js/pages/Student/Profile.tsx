import React from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/student/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, GraduationCap, School } from 'lucide-react';

interface Props {
  user: { name: string; email: string; student_number?: string; year_level?: string };
}

export default function StudentProfile({ user }: Props) {
  return (
    <StudentLayout>
      <Head title="My Profile" />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal information and account details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your basic account details and student information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Full Name
                </div>
                <div className="text-lg font-semibold text-gray-900">{user.name}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email Address
                </div>
                <div className="text-lg font-semibold text-gray-900">{user.email}</div>
              </div>

              {user.student_number && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    Student Number
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{user.student_number}</div>
                </div>
              )}

              {user.year_level && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <School className="h-4 w-4" />
                    Academic Level
                  </div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">{user.year_level}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
