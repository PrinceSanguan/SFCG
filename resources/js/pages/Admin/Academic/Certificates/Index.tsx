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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Download, Printer } from 'lucide-react';
  
interface User { name: string; email: string; user_role: string; }
interface AcademicLevel { id: number; name: string; key: string; }
interface Template { id: number; name: string; key: string; academic_level_id: number; is_active: boolean; }
interface Certificate { 
  id: number; 
  serial_number: string; 
  school_year: string; 
  status: string; 
  student: { id: number; name: string; student_number?: string; }; 
  template: Template; 
  academicLevel: AcademicLevel;
  generated_at?: string;
  downloaded_at?: string;
  printed_at?: string;
}

interface Props {
  user: User;
  academicLevels: AcademicLevel[];
  templates: Template[];
  recentCertificates: Certificate[];
  schoolYears: string[];
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Certificate component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="flex flex-1 flex-col items-center justify-center p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-4">There was an error loading the certificates page.</p>
              <Button onClick={() => window.location.reload()}>Reload Page</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function CertificatesIndex({ user, academicLevels, templates, recentCertificates, schoolYears }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(academicLevels?.[0]?.id ?? null);
  const [schoolYear, setSchoolYear] = useState<string>(schoolYears?.[0] ?? '2024-2025');
  const [activeTab, setActiveTab] = useState('templates');

  // Search and filter state
  const [searchFilters, setSearchFilters] = useState({
    serial_number: '',
    student_name: '',
    student_number: '',
    template_id: 'all',
    academic_level_id: 'all',
    school_year: 'all',
    status: 'all',
    date_from: '',
    date_to: '',
  });

  const [searchResults, setSearchResults] = useState<Certificate[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { data: genData, setData: setGenData, post: postGen, processing: genProcessing } = useForm({
    template_id: '',
    academic_level_id: selectedLevel ? selectedLevel.toString() : '',
    school_year: schoolYear,
    student_id: '',
  });

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

  // Bulk generation form
  const { data: bulk, setData: setBulk, post: postBulk, processing: bulkProcessing, reset: resetBulk } = useForm({
    template_id: '',
    academic_level_id: selectedLevel ? selectedLevel.toString() : '',
    school_year: schoolYear,
    student_ids_text: '', // textarea input, one identifier per line
    student_ids: [] as string[], // processed student IDs for submission
  });

  // Update bulk form when selectedLevel or schoolYear changes
  useEffect(() => {
    if (selectedLevel) {
      setBulk('academic_level_id', selectedLevel.toString());
    }
    setBulk('school_year', schoolYear);
  }, [selectedLevel, schoolYear, setBulk]);

  // Initialize search filters with default values
  useEffect(() => {
    if (academicLevels?.length > 0 && searchFilters.academic_level_id === 'all') {
      setSearchFilters(prev => ({ ...prev, academic_level_id: academicLevels[0].id.toString() }));
    }
    if (schoolYears?.length > 0 && searchFilters.school_year === 'all') {
      setSearchFilters(prev => ({ ...prev, school_year: schoolYears[0] }));
    }
  }, [academicLevels, schoolYears]);

  // Auto-populate forms when switching tabs for better UX
  useEffect(() => {
    if (activeTab === 'generate' && selectedLevel && schoolYear) {
      setGenData(prev => ({
        ...prev,
        academic_level_id: selectedLevel.toString(),
        school_year: schoolYear
      }));
    }
    if (activeTab === 'bulk' && selectedLevel && schoolYear) {
      setBulk(prev => ({
        ...prev,
        academic_level_id: selectedLevel.toString(),
        school_year: schoolYear
      }));
    }
  }, [activeTab, selectedLevel, schoolYear]);

  // Quick actions for common operations
  const quickActions = [
    { label: 'Generate Today\'s Certificates', action: () => setActiveTab('bulk') },
    { label: 'View Recent Downloads', action: () => {
      setSearchFilters(prev => ({ ...prev, status: 'downloaded' }));
      setActiveTab('certificates');
    }},
    { label: 'Pending Certificates', action: () => {
      setSearchFilters(prev => ({ ...prev, status: 'generated' }));
      setActiveTab('certificates');
    }}
  ];

  // Search certificates function
  const searchCertificates = async (page = 1) => {
    setSearchLoading(true);
    try {
      // Filter out "all" values before sending to API
      const apiFilters: Record<string, string> = {};
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          apiFilters[key] = value;
        }
      });
      
      const params = new URLSearchParams({
        ...apiFilters,
        page: page.toString(),
      });
      
      const response = await fetch(`/admin/academic/certificates/search?${params}`);
      const data = await response.json();
      
      setSearchResults(data.data || []);
      setCurrentPage(data.current_page || 1);
      setTotalPages(data.last_page || 1);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search filter changes
  const handleFilterChange = (key: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    searchCertificates(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    searchCertificates(page);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchFilters({
      serial_number: '',
      student_name: '',
      student_number: '',
      template_id: 'all',
      academic_level_id: 'all',
      school_year: 'all',
      status: 'all',
      date_from: '',
      date_to: '',
    });
    setCurrentPage(1);
    searchCertificates(1);
  };

  const generateSample = (e: React.FormEvent) => {
    e.preventDefault();
    postGen(route('admin.academic.certificates.generate'));
  };

  const filteredTemplates = templates?.filter(
    (t) => !genData.academic_level_id || t.academic_level_id.toString() === genData.academic_level_id
  ) ?? [];

  const filteredBulkTemplates = templates?.filter(
    (t) => !bulk.academic_level_id || t.academic_level_id.toString() === bulk.academic_level_id
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

  const submitBulk = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = (bulk.student_ids_text || '')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    // Set the student_ids data before posting
    setBulk('student_ids', lines);
    postBulk(route('admin.academic.certificates.generate-bulk'), {
      preserveScroll: true,
      onSuccess: () => {
        resetBulk('student_ids_text');
        // Refresh search results after bulk generation
        searchCertificates(currentPage);
      },
    });
  };

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar user={user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header user={user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
            <div className="flex flex-col gap-6 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Certificates</h1>
                  <p className="text-gray-500 dark:text-gray-400">Templates, generation (individual/bulk), download and print tracking.</p>
                </div>
                <Link href={route('admin.academic.index')}><Button variant="outline">Back to Academic</Button></Link>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={action.action}
                    className="flex items-center gap-2"
                  >
                    <span>{action.label}</span>
                  </Button>
                ))}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="generate">Generate</TabsTrigger>
                  <TabsTrigger value="bulk">Bulk Generate</TabsTrigger>
                  <TabsTrigger value="certificates">All Certificates</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-6">
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
                                {academicLevels && academicLevels.length > 0 ? (
                                  academicLevels.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>)
                                ) : (
                                  <SelectItem value="no-levels" disabled>No levels available</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>School Year (Preview)</Label>
                            <Select value={genData.school_year} onValueChange={(v) => setGenData('school_year', v)}>
                              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                              <SelectContent>
                                {schoolYears && schoolYears.length > 0 ? (
                                  schoolYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)
                                ) : (
                                  <SelectItem value="no-years" disabled>No years available</SelectItem>
                                )}
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
                </TabsContent>

                <TabsContent value="generate" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generate (Individual)</CardTitle>
                      <p className="text-sm text-gray-600">Generate a single certificate for one student. Fill in the details below.</p>
                    </CardHeader>
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
                          <p className="text-xs text-gray-500 mt-1">Choose the certificate template to use</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Academic Level</Label>
                            <Select value={genData.academic_level_id} onValueChange={(v) => setGenData('academic_level_id', v)}>
                              <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                              <SelectContent>
                                {academicLevels && academicLevels.length > 0 ? (
                                  academicLevels.map(l => (
                                    <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-levels" disabled>No levels available</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>School Year</Label>
                            <Select value={genData.school_year} onValueChange={(v) => setGenData('school_year', v)}>
                              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                              <SelectContent>
                                {schoolYears && schoolYears.length > 0 ? (
                                  schoolYears.map(y => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-years" disabled>No years available</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Student Identifier</Label>
                          <Input 
                            value={genData.student_id} 
                            onChange={(e) => setGenData('student_id', e.target.value)} 
                            placeholder="Enter numeric user ID or student_number (e.g., EL-2024-001)" 
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter the student's User ID or Student Number</p>
                          {genData.student_id && (
                            <ResolveHint identifier={genData.student_id} onResolved={(name) => setResolvedStudentName(name)} />
                          )}
                          {resolvedStudentName && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                              <p className="text-sm text-green-800">✓ Student Found: {resolvedStudentName}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <Button type="submit" disabled={genProcessing} className="flex items-center gap-2">
                            {genProcessing ? 'Generating...' : 'Generate Certificate'}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setGenData('student_id', '')}>
                            Clear Form
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="bulk" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generate (Bulk)</CardTitle>
                      <p className="text-sm text-gray-600">Generate multiple certificates at once. Enter student identifiers (one per line) in the text area below.</p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={submitBulk} className="space-y-4">
                        <div>
                          <Label>Template</Label>
                          <Select value={bulk.template_id} onValueChange={(v) => setBulk('template_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                            <SelectContent>
                              {filteredBulkTemplates.map(t => (
                                <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">Choose the certificate template to use for all students</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Academic Level</Label>
                            <Select value={bulk.academic_level_id} onValueChange={(v) => setBulk('academic_level_id', v)}>
                              <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                              <SelectContent>
                                {academicLevels && academicLevels.length > 0 ? (
                                  academicLevels.map(l => (
                                    <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-levels" disabled>No levels available</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>School Year</Label>
                            <Select value={bulk.school_year} onValueChange={(v) => setBulk('school_year', v)}>
                              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                              <SelectContent>
                                {schoolYears && schoolYears.length > 0 ? (
                                  schoolYears.map(y => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-years" disabled>No years available</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Student Identifiers (one per line)</Label>
                          <Textarea 
                            value={bulk.student_ids_text} 
                            onChange={(e) => setBulk('student_ids_text', e.target.value)} 
                            placeholder="Enter user IDs or student numbers, one per line&#10;Example:&#10;EL-2024-001&#10;EL-2024-002&#10;12345" 
                            rows={8} 
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {bulk.student_ids_text ? 
                                `${bulk.student_ids_text.split('\n').filter(line => line.trim()).length} student(s) detected` : 
                                'Enter student identifiers above'
                              }
                            </p>
                            <p className="text-xs text-gray-500">Supports: User ID, Student Number</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button type="submit" disabled={bulkProcessing} className="flex items-center gap-2">
                            {bulkProcessing ? 'Generating...' : 'Generate Bulk Certificates'}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setBulk('student_ids_text', '')}>
                            Clear List
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="certificates" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search & Filter Certificates
                      </CardTitle>
                      <p className="text-sm text-gray-600">Use the filters below to find specific certificates. Leave filters empty or set to "All" to see broader results.</p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Serial Number</Label>
                            <Input 
                              value={searchFilters.serial_number} 
                              onChange={(e) => handleFilterChange('serial_number', e.target.value)} 
                              placeholder="e.g., CERT-2024-001" 
                            />
                            <p className="text-xs text-gray-500 mt-1">Search by partial serial number</p>
                          </div>
                          <div>
                            <Label>Student Name</Label>
                            <Input 
                              value={searchFilters.student_name} 
                              onChange={(e) => handleFilterChange('student_name', e.target.value)} 
                              placeholder="e.g., Maria Santos" 
                            />
                            <p className="text-xs text-gray-500 mt-1">Search by student's full or partial name</p>
                          </div>
                          <div>
                            <Label>Student Number</Label>
                            <Input 
                              value={searchFilters.student_number} 
                              onChange={(e) => handleFilterChange('student_number', e.target.value)} 
                              placeholder="e.g., EL-2024-001" 
                            />
                            <p className="text-xs text-gray-500 mt-1">Search by student number</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Template</Label>
                            <Select value={searchFilters.template_id} onValueChange={(v) => handleFilterChange('template_id', v)}>
                              <SelectTrigger><SelectValue placeholder="All templates" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All templates</SelectItem>
                                {templates && templates.length > 0 ? (
                                  templates.map(t => (
                                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-templates" disabled>No templates available</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Academic Level</Label>
                            <Select value={searchFilters.academic_level_id} onValueChange={(v) => handleFilterChange('academic_level_id', v)}>
                              <SelectTrigger><SelectValue placeholder="All levels" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All levels</SelectItem>
                                {academicLevels && academicLevels.length > 0 ? (
                                  academicLevels.map(l => (
                                    <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-levels" disabled>No levels available</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>School Year</Label>
                            <Select value={searchFilters.school_year} onValueChange={(v) => handleFilterChange('school_year', v)}>
                              <SelectTrigger><SelectValue placeholder="All years" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All years</SelectItem>
                                {schoolYears && schoolYears.length > 0 ? (
                                  schoolYears.map(y => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-years" disabled>No years available</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <Select value={searchFilters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="generated">Generated</SelectItem>
                                <SelectItem value="downloaded">Downloaded</SelectItem>
                                <SelectItem value="printed">Printed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Date From</Label>
                            <Input 
                              type="date" 
                              value={searchFilters.date_from} 
                              onChange={(e) => handleFilterChange('date_from', e.target.value)} 
                            />
                          </div>
                          <div>
                            <Label>Date To</Label>
                            <Input 
                              type="date" 
                              value={searchFilters.date_to} 
                              onChange={(e) => handleFilterChange('date_to', e.target.value)} 
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" disabled={searchLoading} className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            {searchLoading ? 'Searching...' : 'Search'}
                          </Button>
                          <Button type="button" variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Clear Filters
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Search Results</CardTitle>
                      {searchResults.length > 0 && (
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Found {searchResults.length} certificate(s)</span>
                          {searchFilters.serial_number && <span>• Serial: {searchFilters.serial_number}</span>}
                          {searchFilters.student_name && <span>• Student: {searchFilters.student_name}</span>}
                          {searchFilters.status !== 'all' && <span>• Status: {searchFilters.status}</span>}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      {searchResults.length > 0 ? (
                        <>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Serial</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Student Number</TableHead>
                                <TableHead>Template</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>School Year</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Generated</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {searchResults.map((c: Certificate) => (
                                <TableRow key={c.id} className="hover:bg-gray-50">
                                  <TableCell className="font-mono text-sm">{c.serial_number}</TableCell>
                                  <TableCell className="font-medium">{c.student?.name}</TableCell>
                                  <TableCell>{c.student?.student_number || '-'}</TableCell>
                                  <TableCell>{c.template?.name}</TableCell>
                                  <TableCell>{c.academicLevel?.name}</TableCell>
                                  <TableCell>{c.school_year}</TableCell>
                                  <TableCell>
                                    <Badge variant={c.status === 'generated' ? 'secondary' : c.status === 'downloaded' ? 'default' : 'outline'}>
                                      {c.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{c.generated_at ? new Date(c.generated_at).toLocaleDateString() : '-'}</TableCell>
                                  <TableCell className="space-x-2">
                                    <Button size="sm" variant="outline" asChild>
                                      <a href={route('admin.academic.certificates.download', { certificate: c.id })}>
                                        <Download className="h-4 w-4" />
                                      </a>
                                    </Button>
                                    <Button size="sm" variant="outline" asChild>
                                      <a href={route('admin.academic.certificates.print', { certificate: c.id })} target="_blank">
                                        <Printer className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                              <div className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePageChange(currentPage - 1)}
                                  disabled={currentPage <= 1}
                                >
                                  Previous
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePageChange(currentPage + 1)}
                                  disabled={currentPage >= totalPages}
                                >
                                  Next
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          {searchLoading ? 'Searching...' : 'No certificates found. Use the search filters above to find certificates.'}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

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
                        <TableHead>Generated</TableHead>
                        <TableHead>Downloaded</TableHead>
                        <TableHead>Printed</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentCertificates.map((c: Certificate) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.serial_number}</TableCell>
                          <TableCell>{c.student?.name}</TableCell>
                          <TableCell>{c.template?.name}</TableCell>
                          <TableCell>{c.academicLevel?.name}</TableCell>
                          <TableCell>{c.school_year}</TableCell>
                          <TableCell>
                            <Badge variant={c.status === 'generated' ? 'secondary' : c.status === 'downloaded' ? 'default' : 'outline'}>{c.status}</Badge>
                          </TableCell>
                          <TableCell>{c.generated_at ? new Date(c.generated_at).toLocaleString() : '-'}</TableCell>
                          <TableCell>{c.downloaded_at ? new Date(c.downloaded_at).toLocaleString() : '-'}</TableCell>
                          <TableCell>{c.printed_at ? new Date(c.printed_at).toLocaleString() : '-'}</TableCell>
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
    </ErrorBoundary>
  );
}

function ResolveHint({ identifier, onResolved }: { identifier: string; onResolved: (name: string) => void }) {
  useEffect(() => {
    let active = true;
    if (!identifier) return;
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
      })
      .catch(() => {
        if (!active) return;
        onResolved('');
      });
    return () => { active = false; };
  }, [identifier]);
  return null;
}



