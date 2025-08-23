import React, { useEffect, useState } from 'react';
import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from '@inertiajs/react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, Printer, ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';
  
interface User { 
    name?: string; 
    email?: string; 
    user_role?: string; 
}

interface AcademicLevel { 
    id: number; 
    name: string; 
    key: string; 
}

interface Template { 
    id: number; 
    name: string; 
    key: string; 
    academic_level_id: number; 
    is_active: boolean; 
}

interface Certificate { 
    id: number; 
    serial_number: string; 
    school_year: string; 
    status: string; 
    student: { 
        id: number; 
        name: string; 
        student_number?: string; 
    }; 
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

export default function Certificates({ user, academicLevels, templates, recentCertificates, schoolYears }: Props) {
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

    const { data: genData, setData: setGenData, post: postGen, processing: genProcessing } = useForm({
        student_id: '',
        template_id: '',
        academic_level_id: '',
        school_year: '',
        notes: '',
    });

    const { data: templateData, setData: setTemplateData, post: postTemplate, processing: templateProcessing } = useForm({
        academic_level_id: '',
        key: '',
        name: '',
        title: 'Certificate',
        intro_line: 'This is to certify that',
        student_id_label: 'Student ID:',
        requirement_text: 'has fulfilled the requirements for',
        additional_rules: '',
    });

    const { data: bulk, setData: setBulk, post: postBulk, processing: bulkProcessing } = useForm({
        template_id: '',
        academic_level_id: '',
        school_year: '',
        student_ids_text: '',
    });

    // Set default values when component mounts
    useEffect(() => {
        if (academicLevels && academicLevels.length > 0) {
            setTemplateData('academic_level_id', academicLevels[0].id.toString());
        }
        if (schoolYears && schoolYears.length > 0) {
            setSchoolYear(schoolYears[0]);
            setGenData('school_year', schoolYears[0]);
        }
    }, [academicLevels, schoolYears]);

    const handleGenerateCertificate = () => {
        postGen(route('admin.academic.certificates.generate'), {
            onSuccess: () => {
                setGenData({
                    student_id: '',
                    template_id: '',
                    academic_level_id: '',
                    school_year: '',
                    notes: '',
                });
            },
        });
    };

    const handleSaveTemplate = () => {
        postTemplate(route('admin.academic.certificates.templates.store'), {
            onSuccess: () => {
                setTemplateData({
                    academic_level_id: '',
                    key: '',
                    name: '',
                    title: 'Certificate',
                    intro_line: 'This is to certify that',
                    student_id_label: 'Student ID:',
                    requirement_text: 'has fulfilled the requirements for',
                    additional_rules: '',
                });
            },
        });
    };

    const handleBulkGenerate = () => {
        postBulk(route('admin.academic.certificates.generate-bulk'), {
            onSuccess: () => {
                setBulk({
                    template_id: '',
                    academic_level_id: '',
                    school_year: '',
                    student_ids_text: '',
                });
            },
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchLoading(true);
        // Simulate search - in real app, this would call an API
        setTimeout(() => {
            setSearchLoading(false);
            setSearchResults(recentCertificates.filter(cert => 
                cert.serial_number.toLowerCase().includes(searchFilters.serial_number.toLowerCase()) ||
                cert.student.name.toLowerCase().includes(searchFilters.student_name.toLowerCase())
            ));
        }, 500);
    };

    const handleFilterChange = (key: string, value: string) => {
        setSearchFilters(prev => ({ ...prev, [key]: value }));
    };

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
        setSearchResults([]);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'generated': { variant: 'secondary' as const, text: 'Generated' },
            'downloaded': { variant: 'default' as const, text: 'Downloaded' },
            'printed': { variant: 'outline' as const, text: 'Printed' },
            'pending': { variant: 'destructive' as const, text: 'Pending' },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, text: status };
        return <Badge variant={config.variant}>{config.text}</Badge>;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    const filteredTemplates = templates?.filter(
        (t) => !genData.academic_level_id || t.academic_level_id.toString() === genData.academic_level_id
    ) ?? [];

    const filteredBulkTemplates = templates?.filter(
        (t) => !bulk.academic_level_id || t.academic_level_id.toString() === bulk.academic_level_id
    ) ?? [];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {/* Back Button */}
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get('/registrar/academic')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Academic
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Certificates
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Templates, generation (individual/bulk), download and print tracking.
                            </p>
                        </div>

                        {/* Main Content Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="templates">Templates</TabsTrigger>
                                <TabsTrigger value="generate">Generate</TabsTrigger>
                                <TabsTrigger value="bulk">Bulk Generate</TabsTrigger>
                                <TabsTrigger value="certificates">All Certificates</TabsTrigger>
                            </TabsList>

                            {/* Templates Tab */}
                            <TabsContent value="templates" className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                Template Builder & Preview
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={(e) => { e.preventDefault(); handleSaveTemplate(); }} className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="academic_level_id">Academic Level</Label>
                                                        <Select value={templateData.academic_level_id} onValueChange={(value) => setTemplateData('academic_level_id', value)}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select level" />
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
                                                    <div>
                                                        <Label htmlFor="school_year">School Year (Preview)</Label>
                                                        <Select value={schoolYear} onValueChange={setSchoolYear}>
                                                            <SelectTrigger>
                                                                <SelectValue />
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

                                                <div>
                                                    <Label htmlFor="key">Template Key</Label>
                                                    <Input
                                                        id="key"
                                                        value={templateData.key}
                                                        onChange={(e) => setTemplateData('key', e.target.value)}
                                                        placeholder="e.g., elementary_recognition_v2"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="name">Template Name</Label>
                                                    <Input
                                                        id="name"
                                                        value={templateData.name}
                                                        onChange={(e) => setTemplateData('name', e.target.value)}
                                                        placeholder="Display name"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="title">Title</Label>
                                                    <Input
                                                        id="title"
                                                        value={templateData.title}
                                                        onChange={(e) => setTemplateData('title', e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="intro_line">Intro line</Label>
                                                    <Input
                                                        id="intro_line"
                                                        value={templateData.intro_line}
                                                        onChange={(e) => setTemplateData('intro_line', e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="student_id_label">Student ID label</Label>
                                                    <Input
                                                        id="student_id_label"
                                                        value={templateData.student_id_label}
                                                        onChange={(e) => setTemplateData('student_id_label', e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="requirement_text">Requirement text</Label>
                                                    <Input
                                                        id="requirement_text"
                                                        value={templateData.requirement_text}
                                                        onChange={(e) => setTemplateData('requirement_text', e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="additional_rules">Additional Rules</Label>
                                                    <Textarea
                                                        id="additional_rules"
                                                        value={templateData.additional_rules}
                                                        onChange={(e) => setTemplateData('additional_rules', e.target.value)}
                                                        placeholder="Any additional rules or requirements..."
                                                    />
                                                </div>

                                                <Button type="submit" disabled={templateProcessing} className="w-full">
                                                    {templateProcessing ? 'Saving...' : 'Save Template'}
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Template Preview</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <div className="space-y-4">
                                                    <h3 className="text-xl font-bold">{templateData.title}</h3>
                                                    <p className="text-gray-600">{templateData.intro_line}</p>
                                                    <p className="text-gray-600">[Student Name]</p>
                                                    <p className="text-gray-600">{templateData.student_id_label} [ID]</p>
                                                    <p className="text-gray-600">{templateData.requirement_text}</p>
                                                    {templateData.additional_rules && (
                                                        <p className="text-gray-600 text-sm">{templateData.additional_rules}</p>
                                                    )}
                                                    <div className="mt-8">
                                                        <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Existing Templates */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Existing Templates</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {templates.map((template) => (
                                                <div key={template.id} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-medium">{template.name}</h4>
                                                            <p className="text-sm text-gray-600">Key: {template.key}</p>
                                                            <p className="text-sm text-gray-600">
                                                                Level: {academicLevels.find(l => l.id === template.academic_level_id)?.name}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={template.is_active ? 'default' : 'secondary'}>
                                                                {template.is_active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                            <Button variant="outline" size="sm">Edit</Button>
                                                            <Button variant="outline" size="sm">Duplicate</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {templates.length === 0 && (
                                                <div className="text-center py-8 text-gray-500">
                                                    No templates created yet.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Generate Tab */}
                            <TabsContent value="generate" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Generate Individual Certificate</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={(e) => { e.preventDefault(); handleGenerateCertificate(); }} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="gen_template_id">Template</Label>
                                                    <Select value={genData.template_id} onValueChange={(value) => setGenData('template_id', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select template" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {filteredTemplates.map((template) => (
                                                                <SelectItem key={template.id} value={template.id.toString()}>
                                                                    {template.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor="gen_academic_level_id">Academic Level</Label>
                                                    <Select value={genData.academic_level_id} onValueChange={(value) => setGenData('academic_level_id', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select level" />
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
                                            </div>

                                            <div>
                                                <Label htmlFor="gen_school_year">School Year</Label>
                                                <Select value={genData.school_year} onValueChange={(value) => setGenData('school_year', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
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

                                            <div>
                                                <Label htmlFor="gen_student_id">Student ID</Label>
                                                <Input
                                                    id="gen_student_id"
                                                    value={genData.student_id}
                                                    onChange={(e) => setGenData('student_id', e.target.value)}
                                                    placeholder="Enter student ID or search..."
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="gen_notes">Notes</Label>
                                                <Textarea
                                                    id="gen_notes"
                                                    value={genData.notes}
                                                    onChange={(e) => setGenData('notes', e.target.value)}
                                                    placeholder="Any additional notes..."
                                                />
                                            </div>

                                            <Button type="submit" disabled={genProcessing} className="w-full">
                                                {genProcessing ? 'Generating...' : 'Generate Certificate'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Bulk Generate Tab */}
                            <TabsContent value="bulk" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Bulk Certificate Generation</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={(e) => { e.preventDefault(); handleBulkGenerate(); }} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Template</Label>
                                                    <Select value={bulk.template_id} onValueChange={(value) => setBulk('template_id', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select template" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {filteredBulkTemplates.map((template) => (
                                                                <SelectItem key={template.id} value={template.id.toString()}>
                                                                    {template.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Academic Level</Label>
                                                    <Select value={bulk.academic_level_id} onValueChange={(value) => setBulk('academic_level_id', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select level" />
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
                                            </div>

                                            <div>
                                                <Label>School Year</Label>
                                                <Select value={bulk.school_year} onValueChange={(value) => setBulk('school_year', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
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

                                            <div>
                                                <Label>Student IDs (one per line)</Label>
                                                <Textarea
                                                    value={bulk.student_ids_text}
                                                    onChange={(e) => setBulk('student_ids_text', e.target.value)}
                                                    placeholder="Enter student IDs, one per line:&#10;EL-2024-001&#10;EL-2024-002&#10;EL-2024-003"
                                                    rows={6}
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Enter one student ID per line. The system will generate certificates for all listed students.
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button type="submit" disabled={bulkProcessing} className="flex-1">
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

                            {/* All Certificates Tab */}
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
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="All templates" />
                                                        </SelectTrigger>
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
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="All levels" />
                                                        </SelectTrigger>
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
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="All years" />
                                                        </SelectTrigger>
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
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="All statuses" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All statuses</SelectItem>
                                                            <SelectItem value="generated">Generated</SelectItem>
                                                            <SelectItem value="downloaded">Downloaded</SelectItem>
                                                            <SelectItem value="printed">Printed</SelectItem>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button type="submit" disabled={searchLoading} className="flex-1">
                                                    {searchLoading ? 'Searching...' : 'Search Certificates'}
                                                </Button>
                                                <Button type="button" variant="outline" onClick={clearFilters}>
                                                    Clear Filters
                                                </Button>
                                            </div>
                                        </form>

                                        {/* Search Results */}
                                        {searchResults.length > 0 ? (
                                            <>
                                                <div className="mt-6">
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
                                                                <TableHead>Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {searchResults.map((certificate) => (
                                                                <TableRow key={certificate.id}>
                                                                    <TableCell className="font-mono text-sm">
                                                                        {certificate.serial_number}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div>
                                                                            <div className="font-medium">{certificate.student.name}</div>
                                                                            {certificate.student.student_number && (
                                                                                <div className="text-sm text-gray-500">
                                                                                    ID: {certificate.student.student_number}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>{certificate.template.name}</TableCell>
                                                                    <TableCell>{certificate.academicLevel.name}</TableCell>
                                                                    <TableCell>{certificate.school_year}</TableCell>
                                                                    <TableCell>{getStatusBadge(certificate.status)}</TableCell>
                                                                    <TableCell>{formatDate(certificate.generated_at)}</TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-2">
                                                                            <Button variant="outline" size="sm">
                                                                                <Download className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button variant="outline" size="sm">
                                                                                <Printer className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
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

                        {/* Recent Certificates Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Certificates</CardTitle>
                            </CardHeader>
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
                                        {recentCertificates.map((certificate) => (
                                            <TableRow key={certificate.id}>
                                                <TableCell>{certificate.serial_number}</TableCell>
                                                <TableCell>{certificate.student?.name}</TableCell>
                                                <TableCell>{certificate.template?.name}</TableCell>
                                                <TableCell>{certificate.academicLevel?.name}</TableCell>
                                                <TableCell>{certificate.school_year}</TableCell>
                                                <TableCell>
                                                    <Badge variant={certificate.status === 'generated' ? 'secondary' : certificate.status === 'downloaded' ? 'default' : 'outline'}>
                                                        {certificate.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{certificate.generated_at ? new Date(certificate.generated_at).toLocaleString() : '-'}</TableCell>
                                                <TableCell>{certificate.downloaded_at ? new Date(certificate.downloaded_at).toLocaleString() : '-'}</TableCell>
                                                <TableCell>{certificate.printed_at ? new Date(certificate.printed_at).toLocaleString() : '-'}</TableCell>
                                                <TableCell className="space-x-2">
                                                    <Button variant="outline" size="sm">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {recentCertificates.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                                                    No certificates found.
                                                </TableCell>
                                            </TableRow>
                                        )}
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
