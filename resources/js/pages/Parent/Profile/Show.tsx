import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ParentLayout from '@/layouts/parent/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Hash, BookOpen, Crown, User } from 'lucide-react';

type Maybe<T> = T | null | undefined;

interface Relationship {
  relationship_type?: string;
  emergency_contact?: string;
  notes?: string;
}

interface StudentGrade {
  id: number;
  grade?: number | null;
  subject?: { name?: string };
}

interface HonorResult {
  id: number;
  honorType?: { name?: string };
}

interface Student {
  id: number;
  name: string;
  email?: string;
  student_number?: string;
  year_level?: string;
  parentRelationships?: Relationship[];
  studentGrades?: StudentGrade[];
  honorResults?: HonorResult[];
}

interface AcademicSummary {
  total_subjects?: number;
  total_grading_periods?: number;
  average_grade?: number | null;
  honor_count?: number;
  grade_count?: number;
}

interface Props {
  user: { name: string };
  schoolYear: string;
  student: Student;
  relationship?: Maybe<Relationship>;
  academicSummary?: Maybe<AcademicSummary>;
}

export default function ParentProfileShow({ schoolYear, student, relationship, academicSummary }: Props) {
  const rel = relationship ?? student.parentRelationships?.[0];
  const summary = academicSummary ?? {};

  return (
    <ParentLayout>
      <Head title={`${student.name} - Profile`} />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">Child Profile</h1>
          <p className="text-sm text-muted-foreground">School Year: {schoolYear}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{student.name}</CardTitle>
              <Badge variant="outline">{rel?.relationship_type || 'Child'}</Badge>
            </div>
            <CardDescription>
              {student.student_number && `Student #${student.student_number}`}
              {student.year_level && ` • ${student.year_level}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-semibold text-blue-900">{summary.grade_count ?? student.studentGrades?.length ?? 0}</div>
                <div className="text-blue-600">Grades</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="font-semibold text-yellow-900">{summary.honor_count ?? student.honorResults?.length ?? 0}</div>
                <div className="text-yellow-600">Honors</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Link href={route('parent.grades.index', { student_id: student.id })} className="w-full">
                <Button variant="outline" className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" /> View Grades
                </Button>
              </Link>
              <Link href={route('parent.honors.index', { student_id: student.id })} className="w-full">
                <Button variant="outline" className="w-full">
                  <Crown className="h-4 w-4 mr-2" /> Honor Status
                </Button>
              </Link>
              <Link href={route('parent.certificates.index', { student_id: student.id })} className="w-full">
                <Button variant="outline" className="w-full">
                  <User className="h-4 w-4 mr-2" /> Certificates
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ParentLayout>
  );
}


