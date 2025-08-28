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
  const findFirstQuarter = () => {
    const byName = grades.find(g => {
      const n = (g.gradingPeriod?.name || '').toLowerCase().trim();
      return n.includes('first') || n.includes('1st') || n.includes('quarter 1') || n.includes('first grading') || n.includes('prelim');
    });
    if (byName && byName.grade !== undefined && byName.grade !== null) return byName.grade;
    // Fallback: use the earliest entry if sorted by period
    return grades.length > 0 ? grades[0].grade ?? null : null;
  };
  const firstQuarter = findFirstQuarter();
  const average = grades.length > 0 ?
    (grades.map(g => (g.grade ?? 0)).reduce((a, b) => a + b, 0) / grades.filter(g => g.grade !== null && g.grade !== undefined).length || 0)
    : null;
  const isHonor = average !== null && average <= 2.0; // sample rule matching screenshot

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-6 bg-blue-50">
                <div className="text-3xl font-semibold text-center text-blue-700">{firstQuarter ?? '-'}</div>
                <div className="text-sm text-center text-muted-foreground mt-1">First Quarter</div>
              </div>
              <div className="rounded-lg border p-6 bg-green-50">
                <div className="text-3xl font-semibold text-center text-green-700">{average !== null ? average.toFixed(2) : '-'}</div>
                <div className="text-sm text-center text-muted-foreground mt-1">Average</div>
              </div>
              <div className="rounded-lg border p-6 bg-purple-50 flex items-center justify-center">
                {isHonor ? (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">With Honors</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">&nbsp;</span>
                )}
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
                    <th className="py-3 px-4 text-left font-medium">First Quarter</th>
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
                      <span className="inline-flex items-center justify-center text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">{firstQuarter ?? '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center text-sm px-3 py-1 rounded-full bg-green-100 text-green-700">{average !== null ? average.toFixed(2) : '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      {isHonor ? (
                        <span className="inline-flex items-center justify-center text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-700">With Honors</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
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


