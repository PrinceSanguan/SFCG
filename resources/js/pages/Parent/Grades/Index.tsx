import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ParentLayout from '@/layouts/parent/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, BookOpen, GraduationCap, Calendar, User } from 'lucide-react';

interface LinkedStudent {
  id: number;
  name: string;
  email: string;
  student_number?: string;
  year_level?: string;
}

interface GradeRow {
  id: number;
  subject: { id?: number; name: string; code: string };
  academicLevel?: { name: string };
  gradingPeriod?: { name: string };
  school_year: string;
  grade?: number | null;
  grade_id?: number;
}

interface Props {
  user: { name: string };
  schoolYear: string;
  linkedStudents: LinkedStudent[];
  grades: GradeRow[];
  selectedStudent: LinkedStudent | null;
}

export default function ParentGradesIndex({ schoolYear, grades, linkedStudents, selectedStudent }: Props) {
  const [selectedStudentId, setSelectedStudentId] = useState(selectedStudent?.id?.toString() || '');

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    // Redirect to the same page with new student ID
    window.location.href = route('parent.grades.index', { student_id: studentId });
  };

  return (
    <ParentLayout>
      <Head title="Children's Grades" />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">Children's Grades</h1>
          <p className="text-sm text-muted-foreground">School Year: {schoolYear}</p>
        </div>

        {/* Student Selector */}
        {linkedStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} /> Select Child
              </CardTitle>
              <CardDescription>Choose which child's grades to view</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedStudentId} onValueChange={handleStudentChange}>
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {linkedStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} {student.student_number && `(${student.student_number})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Grades Display */}
        {selectedStudent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Academic Performance - {selectedStudent.name}
              </CardTitle>
              <CardDescription>View grades across all enrolled subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {grades.map((g) => (
                  <Link 
                    key={g.id} 
                    href={g.subject?.id ? route('parent.grades.show', [selectedStudent.id, g.subject.id]) : '#'} 
                    className="block"
                  >
                    <div className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{g.subject?.name} ({g.subject?.code})</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {g.academicLevel?.name && (
                              <>
                                <GraduationCap className="h-3 w-3" />
                                {g.academicLevel.name}
                              </>
                            )}
                            {g.gradingPeriod?.name && (
                              <>
                                <Calendar className="h-3 w-3" />
                                {g.gradingPeriod.name}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">{g.grade ?? '-'}</div>
                          <div className="text-xs text-muted-foreground">Latest Grade</div>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                ))}
                {grades.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <div className="text-lg font-medium text-gray-500">No grades available</div>
                    <div className="text-sm text-muted-foreground">
                      Grades will appear here once they are posted by instructors
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Students Message */}
        {linkedStudents.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <div className="text-lg font-medium text-gray-500">No children linked</div>
              <div className="text-sm text-muted-foreground">
                Contact the school administration to link your account to your children
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ParentLayout>
  );
}
