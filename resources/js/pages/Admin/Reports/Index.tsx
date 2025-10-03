import React, { useState, useEffect } from 'react';
import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, Link, usePage } from '@inertiajs/react';
import { 
  FileText, 
  Award, 
  Archive, 
  Download, 
  BarChart3, 
  GraduationCap,
  Calendar,
  Users,
  TrendingUp,
  FileSpreadsheet,
  FileX
} from 'lucide-react';

interface User { name: string; email: string; user_role: string; }
interface AcademicLevel { id: number; name: string; key: string; }
interface GradingPeriod {
  id: number;
  name: string;
  academic_level_id: number;
  semester_number: number | null;
  parent_id: number | null;
  type: string;
}
interface HonorType { id: number; name: string; }
interface Section { id: number; name: string; academic_level_id: number; specific_year_level: string; }

interface Props {
  user: User;
  academicLevels: AcademicLevel[];
  schoolYears: string[];
  currentSchoolYear: string;
  gradingPeriods: GradingPeriod[];
  honorTypes: HonorType[];
  sections: Section[];
  stats: {
    total_students: number;
    total_certificates: number;
    total_honors: number;
    active_periods: number;
    active_sections: number;
  };
}

export default function ReportsIndex({ user, academicLevels, schoolYears, currentSchoolYear, gradingPeriods, honorTypes, sections, stats }: Props) {
  const [activeTab, setActiveTab] = useState('honor-statistics');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [filteredGradingPeriods, setFilteredGradingPeriods] = useState<GradingPeriod[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);

  // Get CSRF token from Inertia page props
  const { props } = usePage();
  const csrfToken = (props as any).csrf_token || document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';

  // Grade Report Form
  const { data: gradeData, setData: setGradeData, post: postGrade, processing: gradeProcessing } = useForm({
    academic_level_id: 'all',
    semester_id: '',
    grading_period_id: 'all',
    school_year: currentSchoolYear || schoolYears[0] || '',
    format: 'pdf',
    include_statistics: true,
  });

  // Honor Statistics Form
  const { data: honorData, setData: setHonorData, post: postHonor, processing: honorProcessing } = useForm({
    academic_level_id: 'all',
    school_year: currentSchoolYear || schoolYears[0] || '',
    honor_type_id: 'all',
    format: 'pdf',
  });

  // Archive Records Form
  const { data: archiveData, setData: setArchiveData, post: postArchive, processing: archiveProcessing } = useForm({
    academic_level_id: '',
    school_year: currentSchoolYear || schoolYears[0] || '',
    include_grades: true,
    include_honors: true,
    include_certificates: true,
    format: 'excel',
  });

  // Class Section Report Form
  const { data: sectionData, setData: setSectionData, post: postSection, processing: sectionProcessing } = useForm({
    academic_level_id: '',
    section_id: 'all',
    school_year: currentSchoolYear || schoolYears[0] || '',
    include_grades: false,
    format: 'pdf',
  });

  // Filter grading periods based on selected academic level and semester
  useEffect(() => {
    if (gradeData.academic_level_id && gradeData.academic_level_id !== 'all') {
      const levelId = parseInt(gradeData.academic_level_id);
      let filtered = gradingPeriods.filter(period => period.academic_level_id === levelId);

      // If semester is selected, filter by semester
      if (selectedSemester) {
        const semesterId = parseInt(selectedSemester);
        // Get main semester periods and their children
        filtered = filtered.filter(period =>
          period.id === semesterId || period.parent_id === semesterId
        );
      }

      setFilteredGradingPeriods(filtered);
    } else {
      setFilteredGradingPeriods([]);
    }
  }, [gradeData.academic_level_id, selectedSemester, gradingPeriods]);

  // Filter sections based on selected academic level
  useEffect(() => {
    if (sectionData.academic_level_id) {
      const levelId = parseInt(sectionData.academic_level_id);
      const filtered = sections.filter(section => section.academic_level_id === levelId);
      setFilteredSections(filtered);
    } else {
      setFilteredSections([]);
    }
  }, [sectionData.academic_level_id, sections]);

  const handleGradeReport = (e: React.FormEvent) => {
    e.preventDefault();

    if (!csrfToken) {
      console.error('CSRF token not found');
      alert('Session expired. Please refresh the page and try again.');
      return;
    }

    setIsGenerating(true);

    // Create a hidden iframe for download
    let iframe = document.getElementById('download-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'download-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    // Create a temporary form for file download
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = route('admin.reports.grade-report');
    form.target = 'download-iframe';

    // Add CSRF token
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_token';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    // Add form data
    Object.entries(gradeData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      // Handle boolean values properly for backend validation
      if (typeof value === 'boolean') {
        input.value = value ? '1' : '0';
      } else {
        input.value = value?.toString() || '';
      }
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    // Reset loading state after a delay
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleHonorStatistics = (e: React.FormEvent) => {
    e.preventDefault();

    if (!csrfToken) {
      console.error('CSRF token not found');
      alert('Session expired. Please refresh the page and try again.');
      return;
    }

    setIsGenerating(true);

    // Create a hidden iframe for download
    let iframe = document.getElementById('download-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'download-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    // Create a temporary form for file download
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = route('admin.reports.honor-statistics');
    form.target = 'download-iframe';

    // Add CSRF token
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_token';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    // Add form data
    Object.entries(honorData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      // Handle boolean values properly for backend validation
      if (typeof value === 'boolean') {
        input.value = value ? '1' : '0';
      } else {
        input.value = value?.toString() || '';
      }
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    // Reset loading state after a delay
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleArchiveRecords = (e: React.FormEvent) => {
    e.preventDefault();

    if (!csrfToken) {
      console.error('CSRF token not found');
      alert('Session expired. Please refresh the page and try again.');
      return;
    }

    setIsGenerating(true);

    // Create a hidden iframe for download
    let iframe = document.getElementById('download-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'download-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    // Create a temporary form for file download
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = route('admin.reports.archive-records');
    form.target = 'download-iframe';

    // Add CSRF token
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_token';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    // Add form data
    Object.entries(archiveData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      // Handle boolean values properly for backend validation
      if (typeof value === 'boolean') {
        input.value = value ? '1' : '0';
      } else {
        input.value = value?.toString() || '';
      }
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    // Reset loading state after a delay
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleClassSectionReport = (e: React.FormEvent) => {
    e.preventDefault();

    if (!csrfToken) {
      console.error('CSRF token not found');
      alert('Session expired. Please refresh the page and try again.');
      return;
    }

    setIsGenerating(true);

    // Create a hidden iframe for download
    let iframe = document.getElementById('download-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'download-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    // Create a temporary form for file download
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = route('admin.reports.class-section-report');
    form.target = 'download-iframe';

    // Add CSRF token
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_token';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    // Add form data
    Object.entries(sectionData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      // Handle boolean values properly for backend validation
      if (typeof value === 'boolean') {
        input.value = value ? '1' : '0';
      } else {
        input.value = value?.toString() || '';
      }
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    // Reset loading state after a delay
    setTimeout(() => setIsGenerating(false), 2000);
  };

  // Get semester options for College/SHS
  const getSemesterOptions = () => {
    if (gradeData.academic_level_id && gradeData.academic_level_id !== 'all') {
      const levelId = parseInt(gradeData.academic_level_id);
      const selectedLevel = academicLevels.find(level => level.id === levelId);

      // Only show semester selector for College and SHS
      if (selectedLevel && (selectedLevel.key === 'college' || selectedLevel.key === 'senior_highschool')) {
        return gradingPeriods.filter(period =>
          period.academic_level_id === levelId &&
          period.parent_id === null &&
          period.type === 'semester'
        );
      }
    }
    return [];
  };

  const semesterOptions = getSemesterOptions();

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
          <div className="flex flex-col gap-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports & Archiving</h1>
                <p className="text-gray-500 dark:text-gray-400">Generate comprehensive reports and archive academic records.</p>
              </div>
              <Link href={route('admin.dashboard')}>
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="flex items-center p-6">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_students}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Certificates</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_certificates}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <Award className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Honor Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_honors}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Periods</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_periods}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <GraduationCap className="h-8 w-8 text-indigo-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Sections</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_sections}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="honor-statistics">Honor Statistics</TabsTrigger>
                <TabsTrigger value="archive-records">Archive Records</TabsTrigger>
                <TabsTrigger value="class-section-reports">Class Section Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="honor-statistics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Generate Honor Statistics
                    </CardTitle>
                    <p className="text-sm text-gray-600">Generate comprehensive honor roll statistics and distribution analysis.</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleHonorStatistics} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Academic Level</Label>
                          <Select value={honorData.academic_level_id} onValueChange={(v) => setHonorData('academic_level_id', v)}>
                            <SelectTrigger><SelectValue placeholder="All levels" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Levels</SelectItem>
                              {academicLevels.map(level => (
                                <SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Honor Type</Label>
                          <Select value={honorData.honor_type_id} onValueChange={(v) => setHonorData('honor_type_id', v)}>
                            <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              {honorTypes.map(type => (
                                <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>School Year</Label>
                          <Select value={honorData.school_year} onValueChange={(v) => setHonorData('school_year', v)}>
                            <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                            <SelectContent>
                              {schoolYears.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Export Format</Label>
                          <Select value={honorData.format} onValueChange={(v) => setHonorData('format', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  PDF Report
                                </div>
                              </SelectItem>
                              <SelectItem value="excel">
                                <div className="flex items-center gap-2">
                                  <FileSpreadsheet className="h-4 w-4" />
                                  Excel Spreadsheet
                                </div>
                              </SelectItem>
                              <SelectItem value="csv">
                                <div className="flex items-center gap-2">
                                  <FileX className="h-4 w-4" />
                                  CSV File
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button type="submit" disabled={honorProcessing || isGenerating} className="flex items-center gap-2">
                        {isGenerating ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Generate Honor Statistics
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="archive-records" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Archive className="h-5 w-5" />
                      Archive Academic Records
                    </CardTitle>
                    <p className="text-sm text-gray-600">Create comprehensive archives of academic records for specific levels and years.</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleArchiveRecords} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Academic Level *</Label>
                          <Select value={archiveData.academic_level_id} onValueChange={(v) => setArchiveData('academic_level_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                            <SelectContent>
                              {academicLevels.map(level => (
                                <SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">Academic level is required for archiving</p>
                        </div>
                        <div>
                          <Label>School Year *</Label>
                          <Select value={archiveData.school_year} onValueChange={(v) => setArchiveData('school_year', v)}>
                            <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                            <SelectContent>
                              {schoolYears.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Include in Archive</Label>
                        <div className="space-y-3 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="include_grades"
                              checked={archiveData.include_grades}
                              onCheckedChange={(checked) => setArchiveData('include_grades', checked === true)}
                            />
                            <Label htmlFor="include_grades" className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4" />
                              Student grades and academic records
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="include_honors"
                              checked={archiveData.include_honors}
                              onCheckedChange={(checked) => setArchiveData('include_honors', checked === true)}
                            />
                            <Label htmlFor="include_honors" className="flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              Honor roll and academic achievements
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="include_certificates"
                              checked={archiveData.include_certificates}
                              onCheckedChange={(checked) => setArchiveData('include_certificates', checked === true)}
                            />
                            <Label htmlFor="include_certificates" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Certificates and recognitions
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Export Format</Label>
                        <Select value={archiveData.format} onValueChange={(v) => setArchiveData('format', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excel">
                              <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4" />
                                Excel Workbook (Multiple Sheets)
                              </div>
                            </SelectItem>
                            <SelectItem value="csv">
                              <div className="flex items-center gap-2">
                                <FileX className="h-4 w-4" />
                                CSV Files (Zip Archive)
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={archiveProcessing || !archiveData.academic_level_id || !archiveData.school_year} 
                        className="flex items-center gap-2"
                      >
                        <Archive className="h-4 w-4" />
                        {isGenerating ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Archive...
                          </>
                        ) : (
                          'Create Academic Archive'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="class-section-reports" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Generate Class Section Reports
                    </CardTitle>
                    <p className="text-sm text-gray-600">Generate comprehensive class section rosters and student lists by academic level.</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleClassSectionReport} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Academic Level *</Label>
                          <Select
                            value={sectionData.academic_level_id}
                            onValueChange={(v) => {
                              setSectionData('academic_level_id', v);
                              setSectionData('section_id', 'all');
                            }}
                          >
                            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                            <SelectContent>
                              {academicLevels.map(level => (
                                <SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">Academic level is required for class section reports</p>
                        </div>
                        <div>
                          <Label>Section</Label>
                          <Select
                            value={sectionData.section_id}
                            onValueChange={(v) => setSectionData('section_id', v)}
                            disabled={!sectionData.academic_level_id}
                          >
                            <SelectTrigger><SelectValue placeholder={sectionData.academic_level_id ? "All sections" : "Select level first"} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Sections</SelectItem>
                              {filteredSections.map(section => (
                                <SelectItem key={section.id} value={section.id.toString()}>
                                  {section.name} {section.specific_year_level ? `(${section.specific_year_level})` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">Leave empty to generate for all sections</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>School Year *</Label>
                          <Select value={sectionData.school_year} onValueChange={(v) => setSectionData('school_year', v)}>
                            <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                            <SelectContent>
                              {schoolYears.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Export Format</Label>
                          <Select value={sectionData.format} onValueChange={(v) => setSectionData('format', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  PDF Report
                                </div>
                              </SelectItem>
                              <SelectItem value="excel">
                                <div className="flex items-center gap-2">
                                  <FileSpreadsheet className="h-4 w-4" />
                                  Excel Spreadsheet
                                </div>
                              </SelectItem>
                              <SelectItem value="csv">
                                <div className="flex items-center gap-2">
                                  <FileX className="h-4 w-4" />
                                  CSV File
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include_grades_section"
                          checked={sectionData.include_grades}
                          onCheckedChange={(checked) => setSectionData('include_grades', checked === true)}
                        />
                        <Label htmlFor="include_grades_section">Include student average grades in the report</Label>
                      </div>

                      <Button
                        type="submit"
                        disabled={sectionProcessing || !sectionData.academic_level_id || !sectionData.school_year || isGenerating}
                        className="flex items-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Generate Class Section Report
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
