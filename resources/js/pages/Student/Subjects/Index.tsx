import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, GraduationCap, Clock, Calendar, User } from 'lucide-react';

interface Subject {
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
  gradingPeriod?: {
    id: number;
    name: string;
  };
}

interface SubjectAssignment {
  id: number;
  semester?: string;
  is_active: boolean;
  enrolled_at: string;
  notes?: string;
  subject: Subject;
  enrolledBy?: {
    id: number;
    name: string;
  };
}

interface Props {
  user: { 
    name: string;
    year_level?: string;
    specific_year_level?: string;
    student_number?: string;
    course?: {
      id: number;
      name: string;
    };
    strand?: {
      id: number;
      name: string;
    };
  };
  schoolYear: string;
  assignedSubjects: SubjectAssignment[];
  subjectsBySemester: Record<string, SubjectAssignment[]>;
  stats: {
    total_subjects: number;
    core_subjects: number;
    total_units: number;
    semesters: number;
  };
}

export default function StudentSubjectsIndex({ user, schoolYear, assignedSubjects, subjectsBySemester, stats }: Props) {
  return (
    <StudentLayout>
      <Head title="My Subjects" />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">My Subjects</h1>
          <p className="text-sm text-muted-foreground">School Year: {schoolYear}</p>
          {/* Academic Information */}
          <div className="flex flex-wrap gap-4 mt-2 text-sm">
            {user?.year_level && (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  {user.year_level.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            )}
            {user?.specific_year_level && (
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                <School className="h-4 w-4 text-green-600" />
                <span className="text-green-800 dark:text-green-200 font-medium">
                  {user.specific_year_level.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            )}
            {user?.student_number && (
              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                <span className="text-xs">🎓</span>
                <span className="text-purple-800 dark:text-purple-200 font-medium">
                  {user.student_number}
                </span>
              </div>
            )}
            {user?.course && (
              <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                <BookOpen className="h-4 w-4 text-orange-600" />
                <span className="text-orange-800 dark:text-orange-200 font-medium">
                  {user.course.name}
                </span>
              </div>
            )}
            {user?.strand && (
              <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-900/20 px-3 py-1 rounded-full">
                <School className="h-4 w-4 text-pink-600" />
                <span className="text-pink-800 dark:text-pink-200 font-medium">
                  {user.strand.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Subjects</CardDescription>
              <CardTitle className="text-2xl font-semibold">{stats.total_subjects}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Core Subjects</CardDescription>
              <CardTitle className="text-2xl font-semibold">{stats.core_subjects}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Units</CardDescription>
              <CardTitle className="text-2xl font-semibold">{stats.total_units}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Semesters</CardDescription>
              <CardTitle className="text-2xl font-semibold">{stats.semesters}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Subjects Display */}
        {assignedSubjects && assignedSubjects.length > 0 ? (
          <div className="space-y-6">
            {/* Group by Semester */}
            {Object.keys(subjectsBySemester).length > 1 ? (
              Object.entries(subjectsBySemester).map(([semester, subjects]) => (
                <div key={semester || 'no-semester'} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">
                      {semester || 'No Semester Specified'}
                    </h2>
                    <Badge variant="outline" className="ml-2">
                      {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((assignment) => (
                      <SubjectCard key={assignment.id} assignment={assignment} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignedSubjects.map((assignment) => (
                  <SubjectCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-xl font-medium text-gray-500 mb-2">No subjects assigned</div>
              <div className="text-sm text-muted-foreground mb-4">
                You are not currently enrolled in any subjects for this school year.
              </div>
              <div className="text-xs text-muted-foreground">
                Contact your registrar to enroll in subjects.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}

function SubjectCard({ assignment }: { assignment: SubjectAssignment }) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
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
      <CardContent className="space-y-4">
        {/* Subject Details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          {assignment.subject.course && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Course: {assignment.subject.course.name}</span>
            </div>
          )}
          {assignment.subject.academicLevel && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>Level: {assignment.subject.academicLevel.name}</span>
            </div>
          )}
          {assignment.subject.units && (
            <div className="flex items-center gap-2">
              <span className="text-xs">📚</span>
              <span>Units: {assignment.subject.units}</span>
            </div>
          )}
          {assignment.subject.hours_per_week && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Hours/Week: {assignment.subject.hours_per_week}</span>
            </div>
          )}
          {assignment.enrolledBy && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Enrolled by: {assignment.enrolledBy.name}</span>
            </div>
          )}
        </div>

        {/* Subject Description */}
        {assignment.subject.description && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {assignment.subject.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={route('student.grades.show', assignment.subject.id)} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              View Grades
            </Button>
          </Link>
        </div>

        {/* Enrollment Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Enrolled: {new Date(assignment.enrolled_at).toLocaleDateString()}
          {assignment.notes && (
            <div className="mt-1 text-xs italic">{assignment.notes}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
