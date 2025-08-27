import React from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/student/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, GraduationCap, School, Users } from 'lucide-react';

interface Props {
  user: { 
    name: string; 
    email: string; 
    student_number?: string; 
    year_level?: string;
    parents?: Array<{
      id: number;
      name: string;
      email: string;
      pivot: {
        relationship_type: string;
        emergency_contact: string;
        notes?: string;
      };
    }>;
  };
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

        {/* Linked Parents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Linked Parents
            </CardTitle>
            <CardDescription>Parents linked to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {user.parents && user.parents.length > 0 ? (
              <div className="space-y-3">
                {user.parents.map((parent) => (
                  <div key={parent.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {parent.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {parent.email}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {parent.pivot.relationship_type.charAt(0).toUpperCase() + parent.pivot.relationship_type.slice(1)}
                        </Badge>
                      </div>
                      {parent.pivot.emergency_contact && (
                        <p className="text-xs text-gray-500 mt-1">
                          Emergency Contact: {parent.pivot.emergency_contact}
                        </p>
                      )}
                      {parent.pivot.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          Notes: {parent.pivot.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <div className="text-lg font-medium text-gray-500">No parents linked</div>
                <div className="text-sm text-muted-foreground">
                  Contact the school administration to link parent accounts
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
