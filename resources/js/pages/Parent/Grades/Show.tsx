import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ParentLayout from '@/layouts/parent/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Calendar, GraduationCap, Award, User, BookCopy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GradeRow {
  id: number;
  grade?: number | null;
  gradingPeriod?: { id?: number; name: string; code?: string; type?: string; sort_order?: number };
  academicLevel?: { name: string };
}

interface GradingPeriod {
  id: number;
  name: string;
  code: string;
  type: string;
  period_type?: string;
  parent_id?: number | null;
  sort_order: number;
}

interface Subject { id: number; name: string; code: string; academic_level_id?: number }
interface Student { id: number; name: string; student_number?: string }

interface Props {
  user: { name: string };
  schoolYear: string;
  student: Student;
  subject: Subject;
  grades: GradeRow[];
  gradingPeriods?: GradingPeriod[];
}

export default function ParentGradesShow({ schoolYear, student, subject, grades, gradingPeriods = [] }: Props) {
  // Determine if this is a semester-based system (SHS/College)
  const isSemesterBased = subject.academic_level_id && subject.academic_level_id >= 3;

  // Build semester structure
  const buildSemesterStructure = () => {
    if (!isSemesterBased) {
      // For non-semester based (Elementary/JHS), just list all periods
      const periods = gradingPeriods.filter(p => p.period_type !== 'final' && p.type !== 'semester');
      return [{
        semesterNumber: 1,
        name: 'All Periods',
        periods: periods.map(p => ({
          id: p.id,
          name: p.name,
          code: p.code,
          gradingPeriodId: p.id
        }))
      }];
    }

    // For semester-based (SHS/College), group by parent_id
    const semesters: any = {};
    const parentSemesters = gradingPeriods.filter(p => p.parent_id === null && p.type === 'semester');

    console.log('🔍 Parent Grades - Parent semesters:', parentSemesters.map(p => ({ id: p.id, name: p.name })));

    gradingPeriods.forEach(period => {
      // Skip parent semesters themselves
      if (period.parent_id === null && period.type === 'semester') {
        return;
      }

      // Skip final/average periods
      const isFinalAverage = period.period_type === 'final' || period.name.toLowerCase().includes('average');
      if (isFinalAverage) {
        return;
      }

      // Find the parent semester for this period
      const parentId = period.parent_id;
      if (!parentId) {
        console.log(`⚠️ Period "${period.name}" has no parent_id, skipping`);
        return;
      }

      const parentSemester = parentSemesters.find(p => p.id === parentId);
      if (!parentSemester) {
        console.log(`⚠️ No parent semester found for period "${period.name}" (parent_id: ${parentId})`);
        return;
      }

      // Determine semester number from parent
      const semesterNum = parentSemesters.indexOf(parentSemester) + 1;

      if (!semesters[semesterNum]) {
        semesters[semesterNum] = {
          semesterNumber: semesterNum,
          name: parentSemester.name,
          periods: []
        };
      }

      semesters[semesterNum].periods.push({
        id: period.id,
        name: period.name,
        code: period.code,
        gradingPeriodId: period.id
      });

      console.log(`✓ Added period "${period.name}" to ${parentSemester.name}`);
    });

    console.log('🔍 Parent Grades - Final semester structure:', Object.values(semesters));

    return Object.values(semesters);
  };

  const semesterStructure = buildSemesterStructure();

  // Calculate averages
  const calculateAverages = () => {
    const validGrades = grades.filter(g => g.grade !== null && g.grade !== undefined);
    const overallAverage = validGrades.length > 0
      ? validGrades.reduce((sum, g) => sum + g.grade!, 0) / validGrades.length
      : null;

    // Calculate semester averages for semester-based systems
    let semester1Average = null;
    let semester2Average = null;

    if (isSemesterBased && semesterStructure.length > 1) {
      const sem1Grades = semesterStructure[0]?.periods.map((p: any) =>
        grades.find(g => g.gradingPeriod?.id === p.gradingPeriodId)?.grade
      ).filter((g): g is number => g !== undefined && g !== null);

      const sem2Grades = semesterStructure[1]?.periods.map((p: any) =>
        grades.find(g => g.gradingPeriod?.id === p.gradingPeriodId)?.grade
      ).filter((g): g is number => g !== undefined && g !== null);

      semester1Average = sem1Grades.length > 0
        ? sem1Grades.reduce((a, b) => a + b, 0) / sem1Grades.length
        : null;
      semester2Average = sem2Grades.length > 0
        ? sem2Grades.reduce((a, b) => a + b, 0) / sem2Grades.length
        : null;
    }

    return { semester1Average, semester2Average, overallAverage };
  };

  const { semester1Average, semester2Average, overallAverage: average } = calculateAverages();

  // Determine grade status based on average grade (performance descriptors)
  const getGradeStatus = (averageGrade: number) => {
    if (isSemesterBased) {
      // SHS/College: 1.0-5.0 scale (lower is better, 3.0 is passing)
      if (averageGrade >= 1.0 && averageGrade <= 1.24) return { text: 'Superior', color: 'bg-green-100 text-green-800 border-green-200' };
      if (averageGrade >= 1.25 && averageGrade <= 1.49) return { text: 'Excellent', color: 'bg-green-100 text-green-800 border-green-200' };
      if (averageGrade >= 1.5 && averageGrade <= 1.74) return { text: 'Very Good', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      if (averageGrade >= 1.75 && averageGrade <= 1.99) return { text: 'Good', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      if (averageGrade >= 2.0 && averageGrade <= 2.24) return { text: 'Satisfactory', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      if (averageGrade >= 2.25 && averageGrade <= 2.49) return { text: 'Fair', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      if (averageGrade >= 2.5 && averageGrade <= 2.74) return { text: 'Passing', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      if (averageGrade >= 2.75 && averageGrade <= 3.0) return { text: 'Conditional', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      return { text: 'Failed', color: 'bg-red-100 text-red-800 border-red-200' };
    } else {
      // Elementary/JHS: 0-100 scale (75 is passing)
      if (averageGrade >= 90) return { text: 'Outstanding', color: 'bg-green-100 text-green-800 border-green-200' };
      if (averageGrade >= 85) return { text: 'Very Satisfactory', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      if (averageGrade >= 80) return { text: 'Satisfactory', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      if (averageGrade >= 75) return { text: 'Fairly Satisfactory', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      return { text: 'Did Not Meet Expectations', color: 'bg-red-100 text-red-800 border-red-200' };
    }
  };

  const gradeStatus = average !== null ? getGradeStatus(average) : { text: 'No Grade', color: 'bg-gray-100 text-gray-800 border-gray-200' };

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
              {/* Show period grades based on system type */}
              {isSemesterBased && semesterStructure.length > 1 ? (
                // SHS/College: Show semester midterms
                <>
                  {semesterStructure.map((semester: any, semIdx: number) => {
                    const midterm = semester.periods.find((p: any) =>
                      p.name.toLowerCase().includes('midterm')
                    );
                    const grade = midterm ? grades.find(g => g.gradingPeriod?.id === midterm.gradingPeriodId)?.grade : null;
                    const colors = [
                      { bg: 'bg-blue-50', text: 'text-blue-700' },
                      { bg: 'bg-yellow-50', text: 'text-yellow-700' },
                    ];
                    const color = colors[semIdx] || colors[0];
                    return (
                      <div key={semIdx} className={`rounded-lg border p-6 ${color.bg}`}>
                        <div className={`text-3xl font-semibold text-center ${color.text}`}>
                          {grade !== null && grade !== undefined ? grade.toFixed(2) : '-'}
                        </div>
                        <div className="text-sm text-center text-muted-foreground mt-1">{midterm?.name || semester.name}</div>
                      </div>
                    );
                  })}
                  {/* Semester Averages */}
                  <div className="rounded-lg border p-6 bg-green-50">
                    <div className="text-3xl font-semibold text-center text-green-700">
                      {semester1Average !== null ? semester1Average.toFixed(2) : '-'}
                    </div>
                    <div className="text-sm text-center text-muted-foreground mt-1">First Semester</div>
                  </div>
                  <div className="rounded-lg border p-6 bg-purple-50">
                    <div className="text-3xl font-semibold text-center text-purple-700">
                      {semester2Average !== null ? semester2Average.toFixed(2) : '-'}
                    </div>
                    <div className="text-sm text-center text-muted-foreground mt-1">Second Sem</div>
                  </div>
                </>
              ) : (
                // Elementary/JHS: Show quarters
                gradingPeriods.slice(0, 4).map((period, index) => {
                  const grade = grades.find(g => g.gradingPeriod?.id === period.id);
                  const colors = [
                    { bg: 'bg-blue-50', text: 'text-blue-700' },
                    { bg: 'bg-green-50', text: 'text-green-700' },
                    { bg: 'bg-yellow-50', text: 'text-yellow-700' },
                    { bg: 'bg-purple-50', text: 'text-purple-700' },
                  ];
                  const color = colors[index] || colors[0];
                  return (
                    <div key={period.id} className={`rounded-lg border p-6 ${color.bg}`}>
                      <div className={`text-3xl font-semibold text-center ${color.text}`}>
                        {grade?.grade !== null && grade?.grade !== undefined ? grade.grade.toFixed(2) : '-'}
                      </div>
                      <div className="text-sm text-center text-muted-foreground mt-1">{period.name}</div>
                    </div>
                  );
                })
              )}
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

        {/* Detailed Grades Tables */}
        {isSemesterBased && semesterStructure.length > 1 ? (
          // Show separate table for each semester
          semesterStructure.map((semester: any) => {
            // Calculate semester average
            const semesterGrades = semester.periods
              .map((period: any) => {
                const grade = grades.find(g => g.gradingPeriod?.id === period.gradingPeriodId);
                return grade?.grade;
              })
              .filter((g): g is number => g !== undefined && g !== null);

            const semesterAvg = semesterGrades.length > 0
              ? semesterGrades.reduce((a, b) => a + b, 0) / semesterGrades.length
              : null;

            const semesterStatus = semesterAvg !== null ? getGradeStatus(semesterAvg) : { text: 'No Grade', color: 'bg-gray-100 text-gray-800 border-gray-200' };

            return (
              <Card key={semester.semesterNumber}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    {semester.name} - Detailed Grades
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
                          {semester.periods.map((period: any) => (
                            <th key={period.id} className="py-3 px-4 text-left font-medium">{period.name}</th>
                          ))}
                          <th className="py-3 px-4 text-left font-medium">AVERAGE</th>
                          <th className="py-3 px-4 text-left font-medium">Grade Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" /> {student.student_number ?? '-'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <BookCopy className="h-4 w-4 text-gray-500" /> {subject.name}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-green-600" /> Jane Instructor
                            </div>
                          </td>
                          {semester.periods.map((period: any, idx: number) => {
                            const grade = grades.find(g => g.gradingPeriod?.id === period.gradingPeriodId);
                            const colors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700'];
                            return (
                              <td key={period.id} className="py-4 px-4">
                                <span className={`inline-flex items-center justify-center text-sm px-3 py-1 rounded-full ${colors[idx % colors.length]}`}>
                                  {grade?.grade !== null && grade?.grade !== undefined ? grade.grade.toFixed(2) : '-'}
                                </span>
                              </td>
                            );
                          })}
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center justify-center text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                              {semesterAvg !== null ? semesterAvg.toFixed(2) : '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center justify-center text-sm px-3 py-1 rounded-full ${semesterStatus.color}`}>
                              {semesterStatus.text}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          // Single table for non-semester based (Elementary/JHS)
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                Detailed Grades
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
                      {gradingPeriods.slice(0, 4).map((period) => (
                        <th key={period.id} className="py-3 px-4 text-left font-medium">{period.name}</th>
                      ))}
                      <th className="py-3 px-4 text-left font-medium">AVERAGE</th>
                      <th className="py-3 px-4 text-left font-medium">Grade Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" /> {student.student_number ?? '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <BookCopy className="h-4 w-4 text-gray-500" /> {subject.name}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-green-600" /> Jane Instructor
                        </div>
                      </td>
                      {gradingPeriods.slice(0, 4).map((period, idx) => {
                        const grade = grades.find(g => g.gradingPeriod?.id === period.id);
                        const colors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700', 'bg-purple-100 text-purple-700'];
                        return (
                          <td key={period.id} className="py-4 px-4">
                            <span className={`inline-flex items-center justify-center text-sm px-3 py-1 rounded-full ${colors[idx]}`}>
                              {grade?.grade !== null && grade?.grade !== undefined ? grade.grade.toFixed(2) : '-'}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center justify-center text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                          {average !== null ? average.toFixed(2) : '-'}
                        </span>
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
        )}
      </div>
    </ParentLayout>
  );
}


