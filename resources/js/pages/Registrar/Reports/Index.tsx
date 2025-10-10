import React, { useState, useEffect } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    FileText, 
    Award, 
    Archive, 
    Download, 
    GraduationCap,
    Users,
    FileSpreadsheet,
    FileX
} from 'lucide-react';
import { Sidebar } from '@/components/registrar/sidebar';
import { Header } from '@/components/registrar/header';

interface User { 
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
    academic_level_id: number; 
}

interface HonorType {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    academic_level_id: number;
    specific_year_level: string;
}

interface Props {
    user: User;
    academicLevels: AcademicLevel[];
    schoolYears: string[];
    gradingPeriods: GradingPeriod[];
    honorTypes: HonorType[];
    sections: Section[];
    stats: {
        total_students: number;
        total_certificates: number;
        total_honors: number;
        active_periods: number;
    };
}

export default function RegistrarReportsIndex({ user, academicLevels, schoolYears, gradingPeriods, honorTypes, sections, stats }: Props) {
    const [activeTab, setActiveTab] = useState('grade-reports');
    const [filteredSections, setFilteredSections] = useState<Section[]>([]);

    // Get CSRF token from Inertia page props
    const { props } = usePage();
    const csrfToken = (props as any).csrf_token || document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
    const [isGenerating, setIsGenerating] = useState(false);

    // Grade Report Form
    const { data: gradeData, setData: setGradeData, processing: gradeProcessing } = useForm({
        academic_level_id: 'all',
        grading_period_id: 'all',
        school_year: schoolYears[0] || '',
        format: 'pdf',
        include_statistics: '1',
    });

    // Honor Statistics Form
    const { data: honorData, setData: setHonorData, processing: honorProcessing } = useForm({
        academic_level_id: 'all',
        school_year: schoolYears[0] || '',
        honor_type_id: 'all',
        format: 'pdf',
    });

    // Archive Records Form
    const { data: archiveData, setData: setArchiveData, processing: archiveProcessing } = useForm({
        academic_level_id: '',
        school_year: schoolYears[0] || '',
        include_grades: '1',
        include_honors: '1',
        include_certificates: '1',
        format: 'excel',
    });

    // Class Section Report Form
    const { data: sectionData, setData: setSectionData, processing: sectionProcessing } = useForm({
        academic_level_id: '',
        section_id: 'all',
        school_year: schoolYears[0] || '',
        include_grades: false,
        format: 'pdf',
    });

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
        form.action = route('registrar.reports.grade-report');
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
            input.value = value?.toString() || '';
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
        form.action = route('registrar.reports.honor-statistics');
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
            input.value = value?.toString() || '';
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
        form.action = route('registrar.reports.archive-records');
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
            input.value = value?.toString() || '';
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
        form.action = route('registrar.reports.class-section-report');
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
            input.value = value?.toString() || '';
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        // Reset loading state after a delay
        setTimeout(() => setIsGenerating(false), 2000);
    };

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

    const filteredGradingPeriods = gradingPeriods.filter(period =>
        period.academic_level_id.toString() === gradeData.academic_level_id || gradeData.academic_level_id === 'all'
    );

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
                            <Link href={route('registrar.dashboard')}>
                                <Button variant="outline">Back to Dashboard</Button>
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total_students}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                            <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Periods</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.active_periods}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                            <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Honors</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total_honors}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                            <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Certificates</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total_certificates}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Reports Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="grade-reports" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Grade Reports
                                </TabsTrigger>
                                <TabsTrigger value="honor-statistics" className="flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    Honor Statistics
                                </TabsTrigger>
                                <TabsTrigger value="archiving" className="flex items-center gap-2">
                                    <Archive className="h-4 w-4" />
                                    Archiving
                                </TabsTrigger>
                                <TabsTrigger value="class-section-reports" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Class Section Reports
                                </TabsTrigger>
                            </TabsList>

                            {/* Grade Reports Tab */}
                            <TabsContent value="grade-reports" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Generate Grade Reports
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleGradeReport} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="academic_level">Academic Level</Label>
                                                    <Select
                                                        value={gradeData.academic_level_id}
                                                        onValueChange={(value) => setGradeData('academic_level_id', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select academic level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Levels</SelectItem>
                                                            {academicLevels.map((level) => (
                                                                <SelectItem key={level.id} value={level.id.toString()}>
                                                                    {level.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="grading_period">Grading Period</Label>
                                                    <Select
                                                        value={gradeData.grading_period_id}
                                                        onValueChange={(value) => setGradeData('grading_period_id', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select grading period" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Periods</SelectItem>
                                                            {filteredGradingPeriods.map((period) => (
                                                                <SelectItem key={period.id} value={period.id.toString()}>
                                                                    {period.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="school_year">School Year</Label>
                                                    <Select
                                                        value={gradeData.school_year}
                                                        onValueChange={(value) => setGradeData('school_year', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select school year" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {schoolYears.map((year) => (
                                                                <SelectItem key={year} value={year}>
                                                                    {year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="format">Format</Label>
                                                    <Select
                                                        value={gradeData.format}
                                                        onValueChange={(value) => setGradeData('format', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pdf">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4" />
                                                                    PDF
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="excel">
                                                                <div className="flex items-center gap-2">
                                                                    <FileSpreadsheet className="h-4 w-4" />
                                                                    Excel
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="include_statistics"
                                                    checked={gradeData.include_statistics === '1'}
                                                    onCheckedChange={(checked) => setGradeData('include_statistics', checked === true ? '1' : '0')}
                                                />
                                                <Label htmlFor="include_statistics">Include statistical analysis</Label>
                                            </div>

                                            <Button 
                                                type="submit" 
                                                disabled={gradeProcessing || isGenerating}
                                                className="w-full md:w-auto"
                                            >
                                                {gradeProcessing || isGenerating ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Generating Report...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Generate Grade Report
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Honor Statistics Tab */}
                            <TabsContent value="honor-statistics" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5" />
                                            Generate Honor Statistics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleHonorStatistics} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="honor_academic_level">Academic Level</Label>
                                                    <Select
                                                        value={honorData.academic_level_id}
                                                        onValueChange={(value) => setHonorData('academic_level_id', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select academic level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Levels</SelectItem>
                                                            {academicLevels.map((level) => (
                                                                <SelectItem key={level.id} value={level.id.toString()}>
                                                                    {level.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="honor_school_year">School Year</Label>
                                                    <Select
                                                        value={honorData.school_year}
                                                        onValueChange={(value) => setHonorData('school_year', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select school year" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {schoolYears.map((year) => (
                                                                <SelectItem key={year} value={year}>
                                                                    {year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="honor_type">Honor Type</Label>
                                                    <Select
                                                        value={honorData.honor_type_id}
                                                        onValueChange={(value) => setHonorData('honor_type_id', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select honor type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Types</SelectItem>
                                                            {honorTypes.map((type) => (
                                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="honor_format">Format</Label>
                                                    <Select
                                                        value={honorData.format}
                                                        onValueChange={(value) => setHonorData('format', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pdf">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4" />
                                                                    PDF
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="excel">
                                                                <div className="flex items-center gap-2">
                                                                    <FileSpreadsheet className="h-4 w-4" />
                                                                    Excel
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <Button 
                                                type="submit" 
                                                disabled={honorProcessing || isGenerating}
                                                className="w-full md:w-auto"
                                            >
                                                {honorProcessing || isGenerating ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Generating Statistics...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Generate Honor Statistics
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Archiving Tab */}
                            <TabsContent value="archiving" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Archive className="h-5 w-5" />
                                            Archive Academic Records
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                                <strong>Note:</strong> Archiving will create a backup of academic records for the specified period. 
                                                This process helps maintain system performance while preserving historical data.
                                            </p>
                                        </div>

                                        <form onSubmit={handleArchiveRecords} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="archive_academic_level">Academic Level</Label>
                                                    <Select
                                                        value={archiveData.academic_level_id}
                                                        onValueChange={(value) => setArchiveData('academic_level_id', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select academic level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {academicLevels.map((level) => (
                                                                <SelectItem key={level.id} value={level.id.toString()}>
                                                                    {level.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="archive_school_year">School Year</Label>
                                                    <Select
                                                        value={archiveData.school_year}
                                                        onValueChange={(value) => setArchiveData('school_year', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select school year" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {schoolYears.map((year) => (
                                                                <SelectItem key={year} value={year}>
                                                                    {year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Include in Archive</Label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="include_grades"
                                                            checked={archiveData.include_grades === '1'}
                                                            onCheckedChange={(checked) => setArchiveData('include_grades', checked === true ? '1' : '0')}
                                                        />
                                                        <Label htmlFor="include_grades">Student Grades</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="include_honors"
                                                            checked={archiveData.include_honors === '1'}
                                                            onCheckedChange={(checked) => setArchiveData('include_honors', checked === true ? '1' : '0')}
                                                        />
                                                        <Label htmlFor="include_honors">Honor Records</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="include_certificates"
                                                            checked={archiveData.include_certificates === '1'}
                                                            onCheckedChange={(checked) => setArchiveData('include_certificates', checked === true ? '1' : '0')}
                                                        />
                                                        <Label htmlFor="include_certificates">Certificates</Label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="archive_format">Archive Format</Label>
                                                <Select
                                                    value={archiveData.format}
                                                    onValueChange={(value) => setArchiveData('format', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="excel">
                                                            <div className="flex items-center gap-2">
                                                                <FileSpreadsheet className="h-4 w-4" />
                                                                Excel
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="csv">
                                                            <div className="flex items-center gap-2">
                                                                <FileX className="h-4 w-4" />
                                                                CSV
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <Button 
                                                type="submit" 
                                                disabled={archiveProcessing || isGenerating}
                                                className="w-full md:w-auto"
                                            >
                                                {archiveProcessing || isGenerating ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Archiving Records...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Archive className="h-4 w-4 mr-2" />
                                                        Archive Records
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Class Section Reports Tab */}
                            <TabsContent value="class-section-reports" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Generate Class Section Reports
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleClassSectionReport} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="section_academic_level">Academic Level</Label>
                                                    <Select
                                                        value={sectionData.academic_level_id}
                                                        onValueChange={(value) => {
                                                            setSectionData('academic_level_id', value);
                                                            setSectionData('section_id', 'all');
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select academic level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {academicLevels.map((level) => (
                                                                <SelectItem key={level.id} value={level.id.toString()}>
                                                                    {level.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="section">Section</Label>
                                                    <Select
                                                        value={sectionData.section_id}
                                                        onValueChange={(value) => setSectionData('section_id', value)}
                                                        disabled={!sectionData.academic_level_id}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={sectionData.academic_level_id ? "All sections" : "Select level first"} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Sections</SelectItem>
                                                            {filteredSections.map((section) => (
                                                                <SelectItem key={section.id} value={section.id.toString()}>
                                                                    {section.name} {section.specific_year_level ? `(${section.specific_year_level})` : ''}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="section_school_year">School Year</Label>
                                                    <Select
                                                        value={sectionData.school_year}
                                                        onValueChange={(value) => setSectionData('school_year', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select school year" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {schoolYears.map((year) => (
                                                                <SelectItem key={year} value={year}>
                                                                    {year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="section_format">Format</Label>
                                                    <Select
                                                        value={sectionData.format}
                                                        onValueChange={(value) => setSectionData('format', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pdf">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4" />
                                                                    PDF
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="excel">
                                                                <div className="flex items-center gap-2">
                                                                    <FileSpreadsheet className="h-4 w-4" />
                                                                    Excel
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
                                                className="w-full md:w-auto"
                                            >
                                                {sectionProcessing || isGenerating ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Generating Report...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="h-4 w-4 mr-2" />
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
