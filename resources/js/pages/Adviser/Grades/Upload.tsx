import { Header } from '@/components/adviser/header';
import { Sidebar } from '@/components/adviser/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Link } from '@inertiajs/react';
import { Upload as UploadIcon, Download } from 'lucide-react';

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
  const { data, setData, post, processing, errors } = useForm({
    csv_file: null as File | null,
    subject_id: '',
    academic_level_id: '',
    grading_period_id: '0',
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
          <Card>
            <CardHeader><CardTitle>Upload Grades CSV</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                <div>
                  <Label>Subject</Label>
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
                    <Label>Academic Level</Label>
                    <Select value={data.academic_level_id} onValueChange={(v) => setData({ ...data, academic_level_id: v, grading_period_id: '0' })}>
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
                    <Label>Grading Period</Label>
                    <Select value={data.grading_period_id} onValueChange={(v) => setData('grading_period_id', v)} disabled={!data.academic_level_id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grading period (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Period</SelectItem>
                        {data.academic_level_id && gradingPeriods
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
                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>School Year</Label>
                    <Input value={data.school_year} onChange={(e) => setData('school_year', e.target.value)} />
                  </div>
                  <div>
                    <Label>CSV File</Label>
                    <Input type="file" accept=".csv,text/csv" onChange={(e) => setData('csv_file', e.target.files ? e.target.files[0] : null)} />
                    {errors.csv_file && <p className="text-sm text-red-500 mt-1">{errors.csv_file}</p>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={processing} className="flex items-center gap-2">
                    <UploadIcon className="h-4 w-4" />
                    {processing ? 'Uploading...' : 'Upload CSV'}
                  </Button>
                  <Link href={route('adviser.grades.template')}><Button type="button" variant="outline" className="flex items-center gap-2"><Download className="h-4 w-4" />Download Template</Button></Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}


