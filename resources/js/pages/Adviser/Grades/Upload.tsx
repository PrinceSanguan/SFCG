import { Header } from '@/components/adviser/header';
import { Sidebar } from '@/components/adviser/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, usePage } from '@inertiajs/react';
import { Upload as UploadIcon, Download, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  user_role: string;
}

interface AcademicLevel {
  id: number;
  name: string;
  key: string;
}

interface GradingPeriod {
  id: number;
  name: string;
  academic_level_id?: number;
  parent_id?: number;
}

interface AssignedSubject {
  id: number;
  subject: {
    id: number;
    name: string;
    code: string;
  };
  academicLevel: AcademicLevel;
}

interface UploadProps {
  user: User;
  assignedSubjects: AssignedSubject[];
  academicLevels: AcademicLevel[];
  gradingPeriods: GradingPeriod[];
  schoolYear: string;
}

export default function AdviserGradesUpload({ user, assignedSubjects, academicLevels, gradingPeriods, schoolYear }: UploadProps) {
  const { flash } = usePage().props as any;
  const { data, setData, post, processing, errors } = useForm({
    csv_file: null as File | null,
    subject_id: '',
    academic_level_id: '',
    grading_period_ids: [] as string[],
    school_year: schoolYear || '2024-2025',
    year_of_study: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData: any = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v as any));
    post(route('adviser.grades.upload.process'), { forceFormData: true });
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
          <div className="space-y-4">
            {/* Success Message */}
            {flash?.success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">{flash.success}</p>
                </div>
              </div>
            )}

            {/* Warning Message */}
            {flash?.warning && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 whitespace-pre-line">{flash.warning}</p>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  {Object.values(errors).map((error, idx) => (
                    <p key={idx} className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  ))}
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Upload Grades CSV</CardTitle>
                <p className="text-sm text-gray-500 mt-2">
                  Upload multiple student grades at once using a CSV file. Select the subject and academic level, then download the template pre-filled with your students.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                <div>
                  <Label>Subject <span className="text-red-500">*</span></Label>
                  <Select value={data.subject_id} onValueChange={(v) => setData('subject_id', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedSubjects.map(s => (
                        <SelectItem key={s.subject.id} value={s.subject.id.toString()}>{s.subject.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subject_id && <p className="text-sm text-red-500 mt-1">{errors.subject_id}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Academic Level <span className="text-red-500">*</span></Label>
                    <Select value={data.academic_level_id} onValueChange={(v) => setData({ ...data, academic_level_id: v, grading_period_ids: [] })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic level" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicLevels.map(l => (
                          <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.academic_level_id && <p className="text-sm text-red-500 mt-1">{errors.academic_level_id}</p>}
                  </div>

                  <div>
                    <Label>Grading Periods <span className="text-red-500">*</span></Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Select one or more grading periods to apply these grades to.
                    </p>
                    {!data.academic_level_id && (
                      <p className="text-sm text-gray-500 italic py-3 px-4 border rounded-lg">
                        Please select an academic level first
                      </p>
                    )}
                    {data.academic_level_id && (
                      <div className="space-y-2 border rounded-lg p-3 max-h-48 overflow-y-auto bg-white dark:bg-gray-800">
                        {gradingPeriods
                          .filter(p => {
                            // Filter by academic level
                            if (p.academic_level_id?.toString() !== data.academic_level_id) {
                              return false;
                            }

                            // For semester-based levels (Senior High, College), only show root semesters
                            // For quarter-based levels (Elementary, Junior High), only show quarters
                            const academicLevel = academicLevels.find(l => l.id.toString() === data.academic_level_id);
                            if (academicLevel?.key === 'senior_highschool' || academicLevel?.key === 'college') {
                              // Only show root semesters (no parent_id)
                              return !p.parent_id;
                            } else {
                              // For elementary and junior high, show all periods (quarters)
                              return true;
                            }
                          })
                          .map(p => (
                            <div key={p.id} className="flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                              <Checkbox
                                id={`period-${p.id}`}
                                checked={data.grading_period_ids.includes(p.id.toString())}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setData('grading_period_ids', [...data.grading_period_ids, p.id.toString()]);
                                  } else {
                                    setData('grading_period_ids', data.grading_period_ids.filter(id => id !== p.id.toString()));
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`period-${p.id}`}
                                className="cursor-pointer font-normal flex-1"
                              >
                                {p.name}
                              </Label>
                            </div>
                          ))}
                        {gradingPeriods.filter(p => {
                          if (p.academic_level_id?.toString() !== data.academic_level_id) return false;
                          const academicLevel = academicLevels.find(l => l.id.toString() === data.academic_level_id);
                          if (academicLevel?.key === 'senior_highschool' || academicLevel?.key === 'college') {
                            return !p.parent_id;
                          }
                          return true;
                        }).length === 0 && (
                          <p className="text-sm text-gray-500 italic">No grading periods available for this academic level</p>
                        )}
                      </div>
                    )}
                    {data.grading_period_ids.length > 0 && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                        ✓ {data.grading_period_ids.length} grading period{data.grading_period_ids.length > 1 ? 's' : ''} selected
                      </p>
                    )}
                    {data.grading_period_ids.length === 0 && data.academic_level_id && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                        ⚠️ Please select at least one grading period
                      </p>
                    )}
                    {errors.grading_period_ids && <p className="text-sm text-red-500 mt-1">{errors.grading_period_ids}</p>}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>School Year</Label>
                    <Input value={data.school_year} onChange={(e) => setData('school_year', e.target.value)} />
                  </div>
                  <div>
                    <Label>CSV File <span className="text-red-500">*</span></Label>
                    <Input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(e) => setData('csv_file', e.target.files ? e.target.files[0] : null)}
                    />
                    {errors.csv_file && <p className="text-sm text-red-500 mt-1">{errors.csv_file}</p>}
                    {data.csv_file && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ File selected: {data.csv_file.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">📋 How to Upload Grades</h4>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                    <li>Select the <strong>Subject</strong> and <strong>Academic Level</strong></li>
                    <li>Select <strong>one or more Grading Periods</strong> to apply grades to</li>
                    <li>Click <strong>"Download Template"</strong> to get a CSV with enrolled students</li>
                    <li>Fill in the <strong>Grade</strong> column (values: 75-100)</li>
                    <li>Save the file and upload it using the form above</li>
                    <li>Grades will be created/updated for <strong>ALL selected periods</strong></li>
                  </ol>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={processing || !data.subject_id || !data.academic_level_id || !data.csv_file || data.grading_period_ids.length === 0}
                      className="flex items-center gap-2"
                      title={
                        !data.subject_id
                          ? 'Please select a subject'
                          : !data.academic_level_id
                          ? 'Please select an academic level'
                          : data.grading_period_ids.length === 0
                          ? 'Please select at least one grading period'
                          : !data.csv_file
                          ? 'Please select a CSV file'
                          : 'Upload grades from CSV'
                      }
                    >
                      <UploadIcon className="h-4 w-4" />
                      {processing ? 'Uploading...' : 'Upload CSV'}
                    </Button>
                    <a
                      href={route('adviser.grades.template', {
                        subject_id: data.subject_id || undefined,
                        school_year: data.school_year
                      })}
                      download
                    >
                      <Button type="button" variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        {data.subject_id ? 'Download Template (with students)' : 'Download Template'}
                      </Button>
                    </a>
                  </div>
                  {(!data.subject_id || !data.academic_level_id || !data.csv_file) && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      ⚠️ Please fill in all required fields (*) to enable upload
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        </main>
      </div>
    </div>
  );
}


