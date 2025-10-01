import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Header } from '@/components/adviser/header';
import { Sidebar } from '@/components/adviser/sidebar';
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

interface Props {
  user: {
    id: number;
    name: string;
    email?: string;
    user_role: string;
  };
  student: {
    id: number;
    name: string;
    email: string;
    student_number?: string;
  };
  subject: {
    id: number;
    name: string;
    code: string;
    academicLevel?: {
      id: number;
      name: string;
      key: string;
    };
  };
  grades: Grade[];
  schoolYear: string;
  gradingPeriods: GradingPeriod[];
}

export default function AdviserStudentGradesShow({ user, student, subject, grades, schoolYear, gradingPeriods }: Props) {
  // Calculate grade statistics
  const validGrades = grades.filter(g => g.grade !== null);

  // Create a map of period code to grade
  const periodGrades = gradingPeriods.reduce((acc, period) => {
    const grade = grades.find(g =>
      g.gradingPeriod?.id === period.id && g.grade !== null
    );
    acc[period.code] = grade;
    return acc;
  }, {} as Record<string, Grade | undefined>);

  // Define color classes for each period (cycling through colors)
  const colorClasses = [
    { bg: 'bg-blue-50', text: 'text-blue-600' },
    { bg: 'bg-green-50', text: 'text-green-600' },
    { bg: 'bg-yellow-50', text: 'text-yellow-600' },
    { bg: 'bg-purple-50', text: 'text-purple-600' },
    { bg: 'bg-pink-50', text: 'text-pink-600' },
    { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  ];

  // Determine grade status based on average grade and academic level
  const getGradeStatus = (averageGrade: number) => {
    const academicLevelKey = subject.academicLevel?.key;

    // For Elementary and JHS: use descriptive ratings
    if (academicLevelKey === 'elementary' || academicLevelKey === 'junior_highschool') {
      if (averageGrade >= 90) return { text: 'Outstanding', color: 'bg-green-100 text-green-800 border-green-200' };
      if (averageGrade >= 85) return { text: 'Very Satisfactory', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      if (averageGrade >= 80) return { text: 'Satisfactory', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      if (averageGrade >= 75) return { text: 'Fairly Satisfactory', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      return { text: 'Did Not Meet Expectations', color: 'bg-red-100 text-red-800 border-red-200' };
    }

    // For other levels: use honors system
    if (averageGrade >= 95) return { text: 'With Highest Honors', color: 'bg-green-100 text-green-800 border-green-200' };
    if (averageGrade >= 90) return { text: 'With High Honors', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (averageGrade >= 85) return { text: 'With Honors', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    if (averageGrade >= 75) return { text: 'Passed', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { text: 'Failed', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  // Calculate overall average from all valid grades
  const overallAverage = validGrades.length > 0 ? validGrades.reduce((sum, g) => sum + g.grade, 0) / validGrades.length : 0;
  const status = validGrades.length > 0 ? getGradeStatus(overallAverage) : { text: 'No Grade', color: 'bg-gray-100 text-gray-800 border-gray-200' };

  return (
    <div className="min-h-screen bg-white">
      <Head title={`${student.name} • ${subject.name} • Grades`} />
      <Header user={{ name: user.name, email: user.email || '' }} />
      <div className="flex">
        <Sidebar user={{ name: user.name, email: user.email || '' }} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href={route('adviser.grades.index')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Grades</span>
                </Link>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                <p className="text-gray-600">{subject.name} ({subject.code})</p>
                <p className="text-sm text-gray-500">School Year: {schoolYear}</p>
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
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(gradingPeriods.length, 4)} gap-4 mb-4`}>
                  {gradingPeriods.map((period, index) => {
                    const colors = colorClasses[index % colorClasses.length];
                    const grade = periodGrades[period.code];
                    return (
                      <div key={period.id} className={`text-center p-4 ${colors.bg} rounded-lg`}>
                        <div className={`text-2xl font-bold ${colors.text}`}>
                          {grade ? grade.grade : '—'}
                        </div>
                        <div className={`text-sm ${colors.text}`}>{period.name}</div>
                      </div>
                    );
                  })}
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
                      {gradingPeriods.map((period) => (
                        <TableHead key={period.id} className="bg-gray-900 text-white">
                          {period.name}
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
                          <span className="font-medium">{student.student_number || student.id}</span>
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
                          <span>{validGrades.length > 0 && validGrades[0].teacher_name ? validGrades[0].teacher_name : 'No Teacher Assigned'}</span>
                        </div>
                      </TableCell>
                      {gradingPeriods.map((period, index) => {
                        const colors = colorClasses[index % colorClasses.length];
                        const grade = periodGrades[period.code];
                        const badgeColor = colors.bg.replace('50', '100') + ' ' + colors.text.replace('600', '800') + ' border-' + colors.text.split('-')[1] + '-200';
                        return (
                          <TableCell key={period.id} className="px-4 py-3">
                            {grade ? (
                              <Badge className={badgeColor}>
                                {grade.grade}
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

            {/* All Grades History */}
            {grades.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>Grade History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grading Period</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grades.map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell className="font-medium">
                            {grade.gradingPeriod ? grade.gradingPeriod.name : 'General Grade'}
                          </TableCell>
                          <TableCell>
                            <Badge className={grade.grade >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {grade.grade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(grade.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {grade.is_submitted_for_validation ? (
                              <Badge variant="outline" className="text-green-600">
                                Submitted
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600">
                                Draft
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}