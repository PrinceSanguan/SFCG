import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ParentLayout from '@/layouts/parent/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Calendar, GraduationCap, Award, User, BookCopy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GradeRow {
  id: number;
  grade?: number | null;
  gradingPeriod?: { id?: number; name: string };
  academicLevel?: { name: string };
}

interface Subject { id: number; name: string; code: string }
interface Student { id: number; name: string; student_number?: string }

interface Props {
  user: { name: string };
  schoolYear: string;
  student: Student;
  subject: Subject;
  grades: GradeRow[];
}

export default function ParentGradesShow({ schoolYear, student, subject, grades }: Props) {
  // Find all quarter grades for elementary students
  const findQuarterGrades = () => {
    const quarterGrades = {
      Q1: grades.find(g => g.gradingPeriod?.name?.includes('First Quarter') && g.grade !== null && g.grade !== undefined),
      Q2: grades.find(g => g.gradingPeriod?.name?.includes('Second Quarter') && g.grade !== null && g.grade !== undefined),
      Q3: grades.find(g => g.gradingPeriod?.name?.includes('Third Quarter') && g.grade !== null && g.grade !== undefined),
      Q4: grades.find(g => g.gradingPeriod?.name?.includes('Fourth Quarter') && g.grade !== null && g.grade !== undefined),
    };
    return quarterGrades;
  };
  
  const quarterGrades = findQuarterGrades();
  const firstQuarter = quarterGrades.Q1?.grade ?? null;
  const average = grades.length > 0 ?
    (grades.map(g => (g.grade ?? 0)).reduce((a, b) => a + b, 0) / grades.filter(g => g.grade !== null && g.grade !== undefined).length || 0)
    : null;
  
  // Determine grade status based on average grade (0-100 scale for elementary/junior high)
  const getGradeStatus = (averageGrade: number) => {
    if (averageGrade >= 95) return { text: 'With Highest Honors', isHonor: true, color: 'bg-green-100 text-green-800 border-green-200' };
    if (averageGrade >= 90) return { text: 'With High Honors', isHonor: true, color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (averageGrade >= 85) return { text: 'With Honors', isHonor: true, color: 'bg-purple-100 text-purple-800 border-purple-200' };
    if (averageGrade >= 75) return { text: 'Passed', isHonor: false, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { text: 'Failed', isHonor: false, color: 'bg-red-100 text-red-800 border-red-200' };
  };
  
  const gradeStatus = average !== null ? getGradeStatus(average) : { text: 'No Grade', isHonor: false, color: 'bg-gray-100 text-gray-800 border-gray-200' };
  const isHonor = gradeStatus.isHonor;

  return (
    <ParentLayout>
      <Head title={`${student.name} - ${subject.name}`} />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href={route('parent.grades.index', { student_id: student.id })} className="inline-flex items-center text-sm text-muted-foreground hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Grades
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">{subject.name}</h1>
          <p className="text-sm text-muted-foreground">Subject Code: {subject.code}</p>
        </div>

        {/* Summary cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Grade Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="rounded-lg border p-6 bg-blue-50">
                <div className="text-3xl font-semibold text-center text-blue-700">{quarterGrades.Q1?.grade ?? '-'}</div>
                <div className="text-sm text-center text-muted-foreground mt-1">First Quarter</div>
              </div>
              <div className="rounded-lg border p-6 bg-green-50">
                <div className="text-3xl font-semibold text-center text-green-700">{quarterGrades.Q2?.grade ?? '-'}</div>
                <div className="text-sm text-center text-muted-foreground mt-1">Second Quarter</div>
              </div>
              <div className="rounded-lg border p-6 bg-yellow-50">
                <div className="text-3xl font-semibold text-center text-yellow-700">{quarterGrades.Q3?.grade ?? '-'}</div>
                <div className="text-sm text-center text-muted-foreground mt-1">Third Quarter</div>
              </div>
              <div className="rounded-lg border p-6 bg-purple-50">
                <div className="text-3xl font-semibold text-center text-purple-700">{quarterGrades.Q4?.grade ?? '-'}</div>
                <div className="text-sm text-center text-muted-foreground mt-1">Fourth Quarter</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-6 bg-gray-50">
                <div className="text-3xl font-semibold text-center text-gray-700">{average !== null ? average.toFixed(2) : '-'}</div>
                <div className="text-sm text-center text-muted-foreground mt-1">Overall Average</div>
              </div>
              <div className="rounded-lg border p-6 bg-red-50 flex items-center justify-center">
                <Badge className={gradeStatus.color}>
                  {gradeStatus.text}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Grades Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" /> Detailed Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <table className="min-w-full border rounded-lg">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium">Student ID</th>
                    <th className="py-3 px-4 text-left font-medium">Subject</th>
                    <th className="py-3 px-4 text-left font-medium">Faculty</th>
                    <th className="py-3 px-4 text-left font-medium">Q1</th>
                    <th className="py-3 px-4 text-left font-medium">Q2</th>
                    <th className="py-3 px-4 text-left font-medium">Q3</th>
                    <th className="py-3 px-4 text-left font-medium">Q4</th>
                    <th className="py-3 px-4 text-left font-medium">AVERAGE</th>
                    <th className="py-3 px-4 text-left font-medium">Grade Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-500" /> {student.student_number ?? '-'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2"><BookCopy className="h-4 w-4 text-gray-500" /> {subject.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-green-600" /> Jane Instructor</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">{quarterGrades.Q1?.grade ?? '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center text-sm px-3 py-1 rounded-full bg-green-100 text-green-700">{quarterGrades.Q2?.grade ?? '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">{quarterGrades.Q3?.grade ?? '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-700">{quarterGrades.Q4?.grade ?? '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">{average !== null ? average.toFixed(2) : '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center justify-center text-sm px-3 py-1 rounded-full ${gradeStatus.color}`}>
                        {gradeStatus.text}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ParentLayout>
  );
}


