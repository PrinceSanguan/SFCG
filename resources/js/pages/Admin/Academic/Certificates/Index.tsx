import React, { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm, Link } from '@inertiajs/react';

interface User { name: string; email: string; user_role: string; }
interface AcademicLevel { id: number; name: string; key: string; }
interface Template { id: number; name: string; key: string; academic_level_id: number; is_active: boolean; }
interface Certificate { id: number; serial_number: string; school_year: string; status: string; student: { id: number; name: string; }; template: Template; academicLevel: AcademicLevel; }

interface Props {
  user: User;
  academicLevels: AcademicLevel[];
  templates: Template[];
  recentCertificates: Certificate[];
  schoolYears: string[];
}

export default function CertificatesIndex({ user, academicLevels, templates, recentCertificates, schoolYears }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(academicLevels?.[0]?.id ?? null);
  const [schoolYear, setSchoolYear] = useState<string>(schoolYears?.[0] ?? '2024-2025');

  const { data: genData, setData: setGenData, post: postGen, processing: genProcessing } = useForm({
    template_id: '',
    academic_level_id: selectedLevel ? selectedLevel.toString() : '',
    school_year: schoolYear,
    student_id: '',
  });

  const [previewTemplateId, setPreviewTemplateId] = useState<string>('');
  const [resolvedStudentName, setResolvedStudentName] = useState<string>('');

  // Form-based template builder state and submitter
  const [builder, setBuilder] = useState({
    title: 'Certificate',
    introText: 'This is to certify that',
    studentIdLabel: 'Student ID:',
    requirementText: 'has fulfilled the requirements for',
    schoolYearLabel: 'School Year:',
    issuedOnLabel: 'Issued on',
    signatoryLabel: 'Authorized Signatory',
  });

  const { data: tpl, setData: setTpl, post: postTpl, processing: savingTpl } = useForm({
    academic_level_id: selectedLevel ? selectedLevel.toString() : '',
    key: '',
    name: '',
    content_html: '',
  });

  const generateSample = (e: React.FormEvent) => {
    e.preventDefault();
    postGen(route('admin.academic.certificates.generate'));
  };

  const filteredTemplates = templates?.filter(
    (t) => !genData.academic_level_id || t.academic_level_id.toString() === genData.academic_level_id
  ) ?? [];

  const buildHtml = () => `
<div style="text-align:center; padding:24px; border:4px double #333;">
  <h1 style="margin:0; font-size:28px;">${builder.title}</h1>
  <p style="margin:8px 0 0 0;">${builder.introText}</p>
  <h2 style="margin:8px 0;">{{student_name}}</h2>
  <p style="margin:0;">${builder.studentIdLabel} <strong>{{student_number}}</strong></p>
  <p style="margin:8px 0 0 0;">${builder.requirementText}</p>
  <h3 style="margin:8px 0;">{{academic_level}}</h3>
  <p style="margin:0;">${builder.schoolYearLabel} <strong>{{school_year}}</strong></p>
  <div style="margin-top:24px;">${builder.issuedOnLabel} {{date_now}}</div>
  <div style="margin-top:32px;">_________________________<br/>${builder.signatoryLabel}</div>
  <div style="margin-top:8px; font-size:10px;">Serial: will appear in PDF filename</div>
</div>`;

  const previewHtml = useMemo(() => {
    const level = academicLevels.find(l => l.id.toString() === (genData.academic_level_id || selectedLevel?.toString() || ''));
    const html = buildHtml();
    const replacements: Record<string, string> = {
      '{{student_name}}': 'Sample Student',
      '{{student_number}}': 'EL-2024-001',
      '{{school_year}}': genData.school_year || schoolYear,
      '{{academic_level}}': level?.name || 'Elementary',
      '{{date_now}}': new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
    };
    return Object.keys(replacements).reduce((acc, k) => acc.replaceAll(k, replacements[k]), html);
  }, [builder, genData.school_year, academicLevels, selectedLevel, schoolYear, genData.academic_level_id]);

  const saveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    setTpl('content_html', buildHtml());
    postTpl(route('admin.academic.certificates.templates.store'));
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Certificates</h1>
                <p className="text-gray-500 dark:text-gray-400">Templates, generation (individual/bulk), download and print tracking.</p>
              </div>
              <Link href={route('admin.academic.index')}><Button variant="outline">Back to Academic</Button></Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Template Builder & Preview</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={saveTemplate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Academic Level</Label>
                        <Select value={tpl.academic_level_id} onValueChange={(v) => { setTpl('academic_level_id', v); setGenData('academic_level_id', v); }}>
                          <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                          <SelectContent>
                            {academicLevels.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>School Year (Preview)</Label>
                        <Select value={genData.school_year} onValueChange={(v) => setGenData('school_year', v)}>
                          <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                          <SelectContent>
                            {schoolYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Template Key</Label>
                        <Input value={tpl.key} onChange={(e) => setTpl('key', e.target.value)} placeholder="e.g., elementary_recognition_v2" />
                      </div>
                      <div>
                        <Label>Template Name</Label>
                        <Input value={tpl.name} onChange={(e) => setTpl('name', e.target.value)} placeholder="Display name" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input value={builder.title} onChange={(e) => setBuilder({ ...builder, title: e.target.value })} />
                      </div>
                      <div>
                        <Label>Intro line</Label>
                        <Input value={builder.introText} onChange={(e) => setBuilder({ ...builder, introText: e.target.value })} />
                      </div>
                      <div>
                        <Label>Student ID label</Label>
                        <Input value={builder.studentIdLabel} onChange={(e) => setBuilder({ ...builder, studentIdLabel: e.target.value })} />
                      </div>
                      <div>
                        <Label>Requirement text</Label>
                        <Input value={builder.requirementText} onChange={(e) => setBuilder({ ...builder, requirementText: e.target.value })} />
                      </div>
                      <div>
                        <Label>School year label</Label>
                        <Input value={builder.schoolYearLabel} onChange={(e) => setBuilder({ ...builder, schoolYearLabel: e.target.value })} />
                      </div>
                      <div>
                        <Label>Issued on label</Label>
                        <Input value={builder.issuedOnLabel} onChange={(e) => setBuilder({ ...builder, issuedOnLabel: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <Label>Signatory label</Label>
                        <Input value={builder.signatoryLabel} onChange={(e) => setBuilder({ ...builder, signatoryLabel: e.target.value })} />
                      </div>
                    </div>
                    <div className="rounded border bg-white p-4 shadow-sm dark:bg-gray-800 overflow-auto max-h-[600px]">
                      <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    </div>
                    <div>
                      <Button type="submit" disabled={savingTpl}>Save Template</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Generate (Individual)</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={generateSample} className="space-y-4">
                    <div>
                      <Label>Template</Label>
                      <Select value={genData.template_id} onValueChange={(v) => setGenData('template_id', v)}>
                        <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                        <SelectContent>
                          {filteredTemplates.length > 0 ? (
                            filteredTemplates.map(t => (
                              <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>No templates for this level</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Academic Level</Label>
                        <Select value={genData.academic_level_id} onValueChange={(v) => setGenData('academic_level_id', v)}>
                          <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                          <SelectContent>
                            {academicLevels.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>School Year</Label>
                        <Select value={genData.school_year} onValueChange={(v) => setGenData('school_year', v)}>
                          <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                          <SelectContent>
                            {schoolYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Student Identifier</Label>
                      <Input value={genData.student_id} onChange={(e) => setGenData('student_id', e.target.value)} placeholder="Enter numeric user ID or student_number (e.g., EL-2024-001)" />
                      {genData.student_id && (
                        <ResolveHint identifier={genData.student_id} onResolved={(name) => setResolvedStudentName(name)} />
                      )}
                      {resolvedStudentName && (
                        <p className="text-sm text-gray-600 mt-1">Student: {resolvedStudentName}</p>
                      )}
                    </div>
                    <div>
                      <Button type="submit" disabled={genProcessing}>Generate</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Recent Certificates</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>School Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCertificates.map(c => (
                      <TableRow key={c.id}>
                        <TableCell>{c.serial_number}</TableCell>
                        <TableCell>{c.student?.name}</TableCell>
                        <TableCell>{c.template?.name}</TableCell>
                        <TableCell>{c.academicLevel?.name}</TableCell>
                        <TableCell>{c.school_year}</TableCell>
                        <TableCell>{c.status}</TableCell>
                        <TableCell className="space-x-2">
                          <a className="text-blue-600" href={route('admin.academic.certificates.download', { certificate: c.id })}>Download</a>
                          <a className="text-blue-600" href={route('admin.academic.certificates.print', { certificate: c.id })} target="_blank">Print</a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function ResolveHint({ identifier, onResolved }: { identifier: string; onResolved: (name: string) => void }) {
  const [status, setStatus] = useState<'idle'|'loading'|'done'>('idle');
  useEffect(() => {
    let active = true;
    if (!identifier) return;
    setStatus('loading');
    const url = route('admin.academic.certificates.resolve-student', { q: identifier });
    fetch(url)
      .then(r => r.json())
      .then(json => {
        if (!active) return;
        if (json.found) {
          onResolved(json.name + (json.student_number ? ` (${json.student_number})` : ''));
        } else {
          onResolved('');
        }
        setStatus('done');
      })
      .catch(() => {
        if (!active) return;
        onResolved('');
        setStatus('done');
      });
    return () => { active = false; };
  }, [identifier]);
  return null;
}



