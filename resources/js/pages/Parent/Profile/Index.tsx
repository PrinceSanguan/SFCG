import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ParentLayout from '@/layouts/parent/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Crown, FileText, ArrowRight, User, Mail, Hash } from 'lucide-react';

interface LinkedStudent {
  id: number;
  name: string;
  email: string;
  student_number?: string;
  year_level?: string;
  parentRelationships?: Array<{
    relationship_type: string;
    emergency_contact: string;
    notes?: string;
  }>;
  studentGrades?: Array<{
    id: number;
    subject: { name: string };
    grade: number;
  }>;
  honorResults?: Array<{
    id: number;
    honorType: { name: string };
  }>;
}

interface Props {
  user: { name: string };
  schoolYear: string;
  linkedStudents: LinkedStudent[];
}

export default function ParentProfileIndex({ schoolYear, linkedStudents }: Props) {
  return (
    <ParentLayout>
      <Head title="My Children" />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">My Children</h1>
          <p className="text-sm text-muted-foreground">School Year: {schoolYear}</p>
        </div>

        {linkedStudents.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {linkedStudents.map((student) => {
              const relationship = student.parentRelationships?.[0];
              const totalGrades = student.studentGrades?.length || 0;
              const totalHonors = student.honorResults?.length || 0;
              
              return (
                <Card key={student.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <Badge variant="outline">{relationship?.relationship_type || 'Child'}</Badge>
                    </div>
                    <CardDescription>
                      {student.student_number && `Student #${student.student_number}`}
                      {student.year_level && ` • ${student.year_level}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Information */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{student.email}</span>
                      </div>
                      {student.student_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{student.student_number}</span>
                        </div>
                      )}
                    </div>

                    {/* Academic Summary */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-semibold text-blue-900">{totalGrades}</div>
                        <div className="text-blue-600">Grades</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <div className="font-semibold text-yellow-900">{totalHonors}</div>
                        <div className="text-yellow-600">Honors</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <Link href={route('parent.profile.show', student.id)} className="w-full">
                        <Button variant="outline" size="sm" className="w-full">
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                      <div className="grid grid-cols-3 gap-2">
                        <Link href={route('parent.grades.index', { student_id: student.id })} className="w-full">
                          <Button variant="ghost" size="sm" className="w-full p-2">
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={route('parent.honors.index', { student_id: student.id })} className="w-full">
                          <Button variant="ghost" size="sm" className="w-full p-2">
                            <Crown className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={route('parent.certificates.index', { student_id: student.id })} className="w-full">
                          <Button variant="ghost" size="sm" className="w-full p-2">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-xl font-medium text-gray-500 mb-2">No children linked</div>
              <div className="text-sm text-muted-foreground mb-4">
                Your account is not currently linked to any student accounts.
              </div>
              <div className="text-xs text-muted-foreground">
                Please contact the school administration to link your account to your children.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ParentLayout>
  );
}
