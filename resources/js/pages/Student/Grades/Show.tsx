import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student/layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, BookOpen, GraduationCap, User } from 'lucide-react';
import { Grade } from '@/types';

interface GradingPeriod {
  id: number;
  name: string;
  code: string;
  sort_order: number;
}

interface Teacher {
  id: number;
  name: string;
  role: string;
}

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
  gradingPeriods: GradingPeriod[];
  teacher?: Teacher | null;
}

export default function StudentSubjectGradesShow({ user, subject, grades, gradingPeriods, teacher }: Props) {
  // Calculate grade statistics
  const validGrades = grades.filter(g => g.grade !== null);
  const latestGrade = validGrades.length > 0 ? validGrades[validGrades.length - 1] : null;

  // Map grades to their respective grading periods dynamically
  const periodGrades = gradingPeriods.map(period => {
    const grade = grades.find(g => g.gradingPeriod?.id === period.id && g.grade !== null);
    return {
      period,
      grade: grade?.grade || null,
    };
  });

  // Define colors for each period (cycle through colors)
  const periodColors = [
    { bg: 'bg-blue-50', text: 'text-blue-600' },
    { bg: 'bg-green-50', text: 'text-green-600' },
    { bg: 'bg-yellow-50', text: 'text-yellow-600' },
    { bg: 'bg-purple-50', text: 'text-purple-600' },
    { bg: 'bg-pink-50', text: 'text-pink-600' },
    { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  ];

  // Determine grade status based on average grade (performance descriptors)
  const getGradeStatus = (averageGrade: number) => {
    if (averageGrade >= 90) return { text: 'Outstanding', color: 'bg-green-100 text-green-800 border-green-200' };
    if (averageGrade >= 85) return { text: 'Very Satisfactory', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (averageGrade >= 80) return { text: 'Satisfactory', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    if (averageGrade >= 75) return { text: 'Fairly Satisfactory', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { text: 'Did Not Meet Expectations', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  // Calculate overall average from all valid grades
  const overallAverage = validGrades.length > 0 ? validGrades.reduce((sum, g) => sum + g.grade, 0) / validGrades.length : 0;
  const status = validGrades.length > 0 ? getGradeStatus(overallAverage) : { text: 'No Grade', color: 'bg-gray-100 text-gray-800 border-gray-200' };

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
            <div className={`grid grid-cols-1 ${gradingPeriods.length === 2 ? 'md:grid-cols-2' : gradingPeriods.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-4 mb-4`}>
              {periodGrades.map((pg, index) => {
                const color = periodColors[index % periodColors.length];
                return (
                  <div key={pg.period.id} className={`text-center p-4 ${color.bg} rounded-lg`}>
                    <div className={`text-2xl font-bold ${color.text}`}>
                      {pg.grade !== null ? pg.grade : '—'}
                    </div>
                    <div className={`text-sm ${color.text}`}>{pg.period.name}</div>
                  </div>
                );
              })}
              {periodGrades.length === 0 && (
                <div className="text-center p-4 bg-gray-50 rounded-lg col-span-full">
                  <div className="text-sm text-gray-600">No grading periods available</div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {validGrades.length > 0 ? (validGrades.reduce((sum, g) => sum + g.grade, 0) / validGrades.length).toFixed(2) : '—'}
                </div>
                <div className="text-sm text-gray-600">Overall Average</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
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
                  {periodGrades.map((pg) => (
                    <TableHead key={pg.period.id} className="bg-gray-900 text-white">
                      {pg.period.code || pg.period.name}
                    </TableHead>
                  ))}
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
                      <span>{teacher ? teacher.name : 'No Teacher Assigned'}</span>
                    </div>
                  </TableCell>
                  {periodGrades.map((pg, index) => {
                    const color = periodColors[index % periodColors.length];
                    const badgeColor = color.bg.replace('50', '100') + ' ' + color.text.replace('600', '800') + ' border-' + color.text.replace('text-', '').replace('600', '200');
                    return (
                      <TableCell key={pg.period.id} className="px-4 py-3">
                        {pg.grade !== null ? (
                          <Badge className={badgeColor}>
                            {pg.grade}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="px-4 py-3">
                    {validGrades.length > 0 ? (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
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
