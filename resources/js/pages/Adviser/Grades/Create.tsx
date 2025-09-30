import { Header } from '@/components/adviser/header';
import { Sidebar } from '@/components/adviser/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { useEffect } from 'react';

interface User { id: number; name: string; email: string; user_role: string }
interface AcademicLevel { id: number; name: string; key: string }
interface GradingPeriod { id: number; name: string; academic_level_id: number }
interface AssignedSubject {
  id: number;
  subject: { id: number; name: string; code: string };
  academicLevel: { id: number; name: string; key: string };
  school_year: string;
  enrolled_students: Array<{ id: number; student: { id: number; name: string; email: string } }>;
}

interface CreateProps {
  user: User;
  academicLevels: AcademicLevel[];
  gradingPeriods: GradingPeriod[];
  assignedSubjects: AssignedSubject[];
}

export default function AdviserGradesCreate({ user, academicLevels, gradingPeriods, assignedSubjects }: CreateProps) {
  const { data, setData, post, processing, errors } = useForm({
    student_id: '',
    subject_id: '',
    academic_level_id: '',
    grading_period_id: '0',
    school_year: '2024-2025',
    year_of_study: '',
    grade: '',
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('student_id');
    const subjectId = urlParams.get('subject_id');
    const academicLevelId = urlParams.get('academic_level_id');
    const schoolYear = urlParams.get('school_year');
    if (studentId && subjectId && academicLevelId) {
      setData('student_id', studentId);
      setData('subject_id', subjectId);
      setData('academic_level_id', academicLevelId);
      setData('school_year', schoolYear || '2024-2025');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setData]);

  const getStudentSubjectInfo = (studentId: string) => {
    if (!studentId) return null;
    for (const subject of assignedSubjects) {
      const enrollment = subject.enrolled_students.find(e => e.student.id.toString() === studentId);
      if (enrollment) {
        return { subjectId: subject.subject.id, academicLevelId: subject.academicLevel.id, schoolYear: subject.school_year };
      }
    }
    return null;
  };

  const handleStudentChange = (studentId: string) => {
    setData('student_id', studentId);
    if (studentId) {
      const info = getStudentSubjectInfo(studentId);
      if (info) {
        setData('subject_id', info.subjectId.toString());
        setData('academic_level_id', info.academicLevelId.toString());
        setData('school_year', info.schoolYear);
      }
    } else {
      setData('subject_id', '');
      setData('academic_level_id', '');
      setData('grade', '');
    }
  };

  const getCurrentAcademicLevelKey = () => {
    if (data.academic_level_id) {
      return academicLevels.find(level => level.id.toString() === data.academic_level_id)?.key;
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('adviser.grades.store'));
  };

  const hasPreSelectedStudent = data.student_id && data.subject_id && data.academic_level_id;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Link href={route('adviser.grades.index')}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Grades
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{hasPreSelectedStudent ? 'Input Grade' : 'Input New Grade'}</h1>
                <p className="text-gray-500 dark:text-gray-400">{hasPreSelectedStudent ? 'Enter a grade for the selected student.' : 'Enter a new grade for a student in your advisory subject.'}</p>
              </div>
            </div>

            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Grade Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasPreSelectedStudent ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Student Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Student:</span>
                          <p className="font-medium">{assignedSubjects.find(s => s.enrolled_students.some(e => e.student.id.toString() === data.student_id))?.enrolled_students.find(e => e.student.id.toString() === data.student_id)?.student.name || 'Unknown'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Subject:</span>
                          <p className="font-medium">{assignedSubjects.find(s => s.subject.id.toString() === data.subject_id)?.subject.name || 'Unknown'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Academic Level:</span>
                          <p className="font-medium">{academicLevels.find(l => l.id.toString() === data.academic_level_id)?.name || 'Unknown'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">School Year:</span>
                          <p className="font-medium">{data.school_year}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="grade">Grade</Label>
                        <Input id="grade" type="number" step="0.01" min={getCurrentAcademicLevelKey() === 'college' ? '1.0' : '75'} max={getCurrentAcademicLevelKey() === 'college' ? '5.0' : '100'} placeholder={getCurrentAcademicLevelKey() === 'college' ? 'Enter grade (1.0-5.0)' : 'Enter grade (75-100)'} value={data.grade} onChange={(e) => setData('grade', e.target.value)} className={errors.grade ? 'border-red-500' : ''} autoFocus />
                        {errors.grade && (<p className="text-sm text-red-500 mt-1">{errors.grade}</p>)}
                      </div>
                      <div>
                        <Label htmlFor="grading_period_id">Grading Period</Label>
                        <Select value={data.grading_period_id} onValueChange={(value) => setData('grading_period_id', value)}>
                          <SelectTrigger className={errors.grading_period_id ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select grading period" />
                          </SelectTrigger>
                          <SelectContent>
                            {gradingPeriods.filter(period => {
                              const currentLevel = academicLevels.find(l => l.id.toString() === data.academic_level_id);
                              if (!currentLevel) return false;

                              // Filter by academic level
                              if (period.academic_level_id !== currentLevel.id) return false;

                              // For SHS and College, only show parent semesters (no parent_id)
                              if (currentLevel.key === 'senior_highschool' || currentLevel.key === 'college') {
                                return !period.parent_id;
                              }

                              // For Elementary and JHS, show all periods
                              return true;
                            }).map(period => (
                              <SelectItem key={period.id} value={period.id.toString()}>{period.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.grading_period_id && (<p className="text-sm text-red-500 mt-1">{errors.grading_period_id}</p>)}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" disabled={processing} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        {processing ? 'Saving...' : 'Save Grade'}
                      </Button>
                      <Link href={route('adviser.grades.index')} className="flex-1">
                        <Button type="button" variant="outline" className="w-full">Cancel</Button>
                      </Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="student_id">Student</Label>
                      <Select value={data.student_id} onValueChange={handleStudentChange}>
                        <SelectTrigger className={errors.student_id ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {assignedSubjects
                            .filter(subject => subject.subject && subject.subject.id && subject.enrolled_students)
                            .flatMap(subject =>
                              subject.enrolled_students
                                .filter(enrollment => enrollment.student && enrollment.student.id)
                                .map(enrollment => (
                                  <SelectItem key={enrollment.student.id} value={enrollment.student.id.toString()}>
                                    {enrollment.student.name} - {subject.subject.name}
                                  </SelectItem>
                                ))
                            )}
                        </SelectContent>
                      </Select>
                      {errors.student_id && (<p className="text-sm text-red-500 mt-1">{errors.student_id}</p>)}
                    </div>

                    <div>
                      <Label htmlFor="subject_id">Subject</Label>
                      <Select value={data.subject_id} onValueChange={(value) => setData('subject_id', value)}>
                        <SelectTrigger className={errors.subject_id ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {assignedSubjects.filter(subject => subject.subject && subject.subject.id).map(subject => (
                            <SelectItem key={subject.subject.id} value={subject.subject.id.toString()}>
                              {subject.subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.subject_id && (<p className="text-sm text-red-500 mt-1">{errors.subject_id}</p>)}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="academic_level_id">Academic Level</Label>
                        <Select value={data.academic_level_id} onValueChange={(value) => setData({ ...data, academic_level_id: value, grading_period_id: '0' })}>
                          <SelectTrigger className={errors.academic_level_id ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select academic level" />
                          </SelectTrigger>
                          <SelectContent>
                            {academicLevels.map(level => (
                              <SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.academic_level_id && (<p className="text-sm text-red-500 mt-1">{errors.academic_level_id}</p>)}
                      </div>
                      <div>
                        <Label htmlFor="grading_period_id">Grading Period</Label>
                        <Select value={data.grading_period_id} onValueChange={(value) => setData('grading_period_id', value)} disabled={!data.academic_level_id}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grading period (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No Period</SelectItem>
                            {gradingPeriods.filter(period => {
                              const currentLevel = academicLevels.find(l => l.id.toString() === data.academic_level_id);
                              if (!currentLevel) return false;

                              // Filter by academic level
                              if (period.academic_level_id !== currentLevel.id) return false;

                              // For SHS and College, only show parent semesters (no parent_id)
                              if (currentLevel.key === 'senior_highschool' || currentLevel.key === 'college') {
                                return !period.parent_id;
                              }

                              // For Elementary and JHS, show all periods
                              return true;
                            }).map(period => (
                              <SelectItem key={period.id} value={period.id.toString()}>{period.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="school_year">School Year</Label>
                        <Input id="school_year" type="text" placeholder="e.g., 2024-2025" value={data.school_year} onChange={(e) => setData('school_year', e.target.value)} className={errors.school_year ? 'border-red-500' : ''} />
                        {errors.school_year && (<p className="text-sm text-red-500 mt-1">{errors.school_year}</p>)}
                      </div>
                      <div>
                        <Label htmlFor="year_of_study">Year of Study</Label>
                        <Input id="year_of_study" type="number" min="1" max="10" placeholder="e.g., 1, 2, 3, 4" value={data.year_of_study} onChange={(e) => setData('year_of_study', e.target.value)} className={errors.year_of_study ? 'border-red-500' : ''} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="grade">Grade</Label>
                      <Input id="grade" type="number" step="0.01" min={getCurrentAcademicLevelKey() === 'college' ? '1.0' : '75'} max={getCurrentAcademicLevelKey() === 'college' ? '5.0' : '100'} placeholder={getCurrentAcademicLevelKey() === 'college' ? 'Enter grade (1.0-5.0)' : 'Enter grade (75-100)'} value={data.grade} onChange={(e) => setData('grade', e.target.value)} className={errors.grade ? 'border-red-500' : ''} />
                      {errors.grade && (<p className="text-sm text-red-500 mt-1">{errors.grade}</p>)}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" disabled={processing} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        {processing ? 'Saving...' : 'Save Grade'}
                      </Button>
                      <Link href={route('adviser.grades.index')} className="flex-1">
                        <Button type="button" variant="outline" className="w-full">Cancel</Button>
                      </Link>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}


