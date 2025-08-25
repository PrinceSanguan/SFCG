import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student/layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, BookOpen, GraduationCap, User } from 'lucide-react';
import { Grade } from '@/types';

interface Props {
  user: {
    id: number;
    name: string;
    student_number?: string;
  };
  subject: {
    id: number;
    name: string;
    code: string;
  };
  grades: Grade[];
}

export default function StudentSubjectGradesShow({ user, subject, grades }: Props) {
  // Calculate grade statistics
  const validGrades = grades.filter(g => g.grade !== null);
  const latestGrade = validGrades.length > 0 ? validGrades[validGrades.length - 1] : null;

  // Find First Quarter grade
  const firstQuarterGrade = grades.find(g =>
    g.gradingPeriod?.name === 'First Quarter' && g.grade !== null
  );

  // Determine grade status
  const getGradeStatus = (grade: number) => {
    if (grade >= 1.0 && grade <= 1.5) return { text: 'With Highest Honors', color: 'bg-green-100 text-green-800 border-green-200' };
    if (grade >= 1.51 && grade <= 1.75) return { text: 'With High Honors', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (grade >= 1.76 && grade <= 2.0) return { text: 'With Honors', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    if (grade >= 2.01 && grade <= 3.0) return { text: 'Passed', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { text: 'Failed', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  const status = latestGrade ? getGradeStatus(latestGrade.grade) : { text: 'No Grade', color: 'bg-gray-100 text-gray-800 border-gray-200' };

  return (
    <StudentLayout>
      <Head title={`${subject.name} • Grades`} />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={route('student.grades.index')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Grades</span>
            </Link>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
            <p className="text-gray-600">Subject Code: {subject.code}</p>
          </div>
        </div>

        {/* Grade Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>Grade Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {firstQuarterGrade ? firstQuarterGrade.grade : '—'}
                </div>
                <div className="text-sm text-blue-600">First Quarter</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {validGrades.length > 0 ? (validGrades.reduce((sum, g) => sum + g.grade, 0) / validGrades.length).toFixed(2) : '—'}
                </div>
                <div className="text-sm text-green-600">Average</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Badge className={status.color}>
                  {status.text}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grades Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              <span>Detailed Grades</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-gray-900 text-white">Student ID</TableHead>
                  <TableHead className="bg-gray-900 text-white">Subject</TableHead>
                  <TableHead className="bg-gray-900 text-white">Faculty</TableHead>
                  <TableHead className="bg-gray-900 text-white">First Quarter</TableHead>
                  <TableHead className="bg-gray-900 text-white">AVERAGE</TableHead>
                  <TableHead className="bg-gray-900 text-white">Grade Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{user.student_number || user.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{subject.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4 text-green-500" />
                      <span>Jane Instructor</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {firstQuarterGrade ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {firstQuarterGrade.grade}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {validGrades.length > 0 ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {(validGrades.reduce((sum, g) => sum + g.grade, 0) / validGrades.length).toFixed(2)}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge className={status.color}>
                      {status.text}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
