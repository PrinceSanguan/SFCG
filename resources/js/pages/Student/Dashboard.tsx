import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Crown, FileText, User as UserIcon, ArrowRight, GraduationCap } from 'lucide-react';

interface SubjectAssignment {
  id: number;
  semester?: string;
  is_active: boolean;
  enrolled_at: string;
  notes?: string;
  subject: {
    id: number;
    name: string;
    code: string;
    description?: string;
    units?: number;
    hours_per_week?: number;
    is_core: boolean;
    course?: {
      id: number;
      name: string;
    };
    academicLevel?: {
      id: number;
      name: string;
    };
  };
}

interface Props {
  user: { name: string };
  schoolYear: string;
  stats: { grades: number; honor_count: number; certificates: number; subjects: number };
  assignedSubjects: SubjectAssignment[];
}

export default function StudentDashboard({ user, schoolYear, stats, assignedSubjects }: Props) {
  return (
    <StudentLayout>
      <Head title="Student Dashboard" />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Welcome, {user?.name ?? 'Student'} 👋</h1>
          <p className="text-sm text-muted-foreground">School Year: {schoolYear}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Subjects</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stats.subjects}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Grades</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stats.grades}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Honor Entries</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stats.honor_count}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Certificates</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stats.certificates}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><BookOpen size={18} /> My Grades</CardTitle>
              <CardDescription>See detailed grades by subject and period.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={route('student.grades.index')}>
                <Button variant="secondary" className="inline-flex items-center gap-2">Open Grades <ArrowRight size={16} /></Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Crown size={18} /> Honor Status</CardTitle>
              <CardDescription>Check current honor qualification and history.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={route('student.honors.index')}>
                <Button variant="secondary" className="inline-flex items-center gap-2">View Honor Status <ArrowRight size={16} /></Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><FileText size={18} /> Certificates</CardTitle>
              <CardDescription>Download available certificates. Read-only.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={route('student.certificates.index')}>
                <Button variant="secondary" className="inline-flex items-center gap-2">View Certificates <ArrowRight size={16} /></Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><UserIcon size={18} /> My Profile</CardTitle>
              <CardDescription>Personal information and account details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={route('student.profile.index')}>
                <Button variant="secondary" className="inline-flex items-center gap-2">Open Profile <ArrowRight size={16} /></Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Subjects Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap size={20} /> My Subjects
            </CardTitle>
            <CardDescription>
              Subjects you are currently enrolled in for {schoolYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignedSubjects && assignedSubjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignedSubjects.map((assignment) => (
                  <Card key={assignment.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold">
                            {assignment.subject.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {assignment.subject.code}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          {assignment.subject.is_core && (
                            <Badge variant="secondary" className="text-xs">
                              Core
                            </Badge>
                          )}
                          {assignment.semester && (
                            <Badge variant="outline" className="text-xs">
                              {assignment.semester}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {assignment.subject.course && (
                          <div>Course: {assignment.subject.course.name}</div>
                        )}
                        {assignment.subject.academicLevel && (
                          <div>Level: {assignment.subject.academicLevel.name}</div>
                        )}
                        {assignment.subject.units && (
                          <div>Units: {assignment.subject.units}</div>
                        )}
                        {assignment.subject.hours_per_week && (
                          <div>Hours/Week: {assignment.subject.hours_per_week}</div>
                        )}
                      </div>
                      {assignment.subject.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {assignment.subject.description}
                        </p>
                      )}
                      <div className="mt-3">
                        <Link href={route('student.grades.show', assignment.subject.id)}>
                          <Button variant="outline" size="sm" className="w-full">
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Grades
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <div className="text-lg font-medium text-gray-500">No subjects assigned</div>
                <div className="text-sm text-muted-foreground">
                  Contact your registrar to enroll in subjects for this school year.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
