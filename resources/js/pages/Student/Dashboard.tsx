import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Crown, FileText, User as UserIcon, ArrowRight } from 'lucide-react';

interface Props {
  user: { name: string };
  schoolYear: string;
  stats: { grades: number; honor_count: number; certificates: number };
}

export default function StudentDashboard({ user, schoolYear, stats }: Props) {
  return (
    <StudentLayout>
      <Head title="Student Dashboard" />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Welcome, {user?.name ?? 'Student'} 👋</h1>
          <p className="text-sm text-muted-foreground">School Year: {schoolYear}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
      </div>
    </StudentLayout>
  );
}
