import React, { useState } from 'react';
import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, GraduationCap, School, BookOpen, Users, FileText, Printer, Package, MoreVertical } from 'lucide-react';
import { router } from '@inertiajs/react';

interface User {
    name: string;
    email: string;
    user_role?: string;
}

interface AcademicLevel {
    id: number;
    name: string;
    key: string;
}

interface HonorType {
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

interface Section {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
    student_number?: string;
    year_level?: string;
    section_id?: number;
    section?: Section;
}

interface HonorResult {
    id: number;
    student: Student;
    honor_type: HonorType;
    academic_level: AcademicLevel;
    gpa: number;
    school_year: string;
    is_approved: boolean;
    approved_at?: string;
    year_level?: string;
    section_id?: number;
}

interface Certificate {
    id: number;
    serial_number: string;
    student: Student;
    template: Template;
    academic_level: AcademicLevel;
    status: string;
    generated_at: string;
    school_year: string;
}

interface Props {
    user: User;
    academicLevels: AcademicLevel[];
    honorTypes?: HonorType[];
    templates: Template[];
    allHonors?: HonorResult[];
    generatedCertificates?: Certificate[];
    schoolYears: string[];
    currentSchoolYear?: string;
    stats?: Record<string, unknown>;
}

const CATEGORIES = [
    {
        key: 'elementary',
        name: 'Elementary',
        icon: School,
        color: 'bg-blue-500 hover:bg-blue-600',
        iconColor: 'text-blue-600'
    },
    {
        key: 'junior_highschool',
        name: 'Junior High School',
        icon: BookOpen,
        color: 'bg-green-500 hover:bg-green-600',
        iconColor: 'text-green-600'
    },
    {
        key: 'senior_highschool',
        name: 'Senior High School',
        icon: GraduationCap,
        color: 'bg-orange-500 hover:bg-orange-600',
        iconColor: 'text-orange-600'
    },
    {
        key: 'college',
        name: 'College',
        icon: Users,
        color: 'bg-purple-500 hover:bg-purple-600',
        iconColor: 'text-purple-600'
    }
];

export default function CertificatesIndex({
    user,
    academicLevels,
    templates,
    allHonors = [],
    generatedCertificates = [],
    schoolYears,
    currentSchoolYear,
}: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [schoolYear, setSchoolYear] = useState<string>(currentSchoolYear || schoolYears?.[0] || '2024-2025');

    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

    // Multi-category selection state
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Forms for certificate generation
    const { setData: setGenerateData, post: postGenerate, processing: generating } = useForm({
        student_id: '',
        template_id: '',
        academic_level_id: '',
        school_year: schoolYear,
    });

    const { setData: setBulkData, post: postBulk, processing: bulkGenerating } = useForm({
        student_ids: [] as number[],
        template_id: '',
        academic_level_id: '',
        school_year: schoolYear,
    });

    const { setData: setBulkPrintData, post: postBulkPrint, processing: bulkPrinting } = useForm({
        certificate_ids: [] as number[],
    });

    const { setData: setBulkByLevelData, post: postBulkByLevel, processing: bulkByLevelGenerating } = useForm({
        academic_level_id: '',
        school_year: schoolYear,
        honor_type_id: '',
    });

    // Get students for selected category
    const getCategoryStudents = (categoryKey: string) => {
        if (!allHonors.length) return [];

        return allHonors
            .filter(honor =>
                honor &&
                honor.academic_level &&
                honor.academic_level.key === categoryKey &&
                honor.school_year === schoolYear
            )
            .sort((a, b) => {
                // Sort by year level first, then section, then GPA
                // For GPA: Lower is better (1.0 is better than 2.0 in college grading)
                if (a.year_level !== b.year_level) {
                    return (a.year_level || '').localeCompare(b.year_level || '');
                }
                if (a.section_id !== b.section_id) {
                    return (a.section_id || 0) - (b.section_id || 0);
                }
                // ASCENDING order for GPA (lower GPA = higher rank)
                return (a.gpa || 0) - (b.gpa || 0);
            });
    };

    // Get templates for selected category
    const getCategoryTemplates = (categoryKey: string) => {
        const academicLevel = academicLevels.find(level => level.key === categoryKey);
        if (!academicLevel) return [];

        return templates.filter(template =>
            template.academic_level_id === academicLevel.id && template.is_active
        );
    };

    // Handle individual certificate generation
    const handleGenerateIndividual = (honor: HonorResult) => {
        setGenerateData({
            student_id: honor.student.id.toString(),
            template_id: selectedTemplate,
            academic_level_id: honor.academic_level.id.toString(),
            school_year: schoolYear,
        });

        postGenerate(route('admin.academic.certificates.generate'), {
            onSuccess: () => {
                router.reload();
            }
        });
    };

    // Handle bulk certificate generation
    const handleBulkGenerate = () => {
        if (selectedStudents.length === 0 || !selectedTemplate) {
            return;
        }

        const academicLevel = academicLevels.find(level => level.key === selectedCategory);
        if (!academicLevel) return;

        setBulkData({
            student_ids: selectedStudents,
            template_id: selectedTemplate,
            academic_level_id: academicLevel.id.toString(),
            school_year: schoolYear,
        });

        postBulk(route('admin.academic.certificates.generate-bulk'), {
            onSuccess: () => {
                setSelectedStudents([]);
                router.reload();
            }
        });
    };

    // Handle student selection
    const handleStudentSelect = (studentId: number) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    // Handle select all students
    const handleSelectAll = () => {
        const categoryStudents = getCategoryStudents(selectedCategory!);
        const allIds = categoryStudents.map(honor => honor.student.id);

        setSelectedStudents(
            selectedStudents.length === allIds.length ? [] : allIds
        );
    };

    // Handle generate all missing certificates for current level
    const handleGenerateAllMissing = () => {
        const academicLevel = academicLevels.find(level => level.key === selectedCategory);
        if (!academicLevel) return;

        setBulkByLevelData({
            academic_level_id: academicLevel.id.toString(),
            school_year: schoolYear,
            honor_type_id: '',
        });

        postBulkByLevel(route('admin.academic.certificates.bulk-generate-by-level'), {
            onSuccess: () => {
                router.reload();
            }
        });
    };

    // Handle multi-category selection
    const handleCategoryToggle = (categoryKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        setSelectedCategories(prev =>
            prev.includes(categoryKey)
                ? prev.filter(key => key !== categoryKey)
                : [...prev, categoryKey]
        );
    };

    // Handle batch download for selected categories
    const handleBatchDownloadCategories = () => {
        if (selectedCategories.length === 0) return;

        // Get all certificate IDs for selected categories
        const certificateIds: number[] = [];

        selectedCategories.forEach(categoryKey => {
            const categoryHonors = allHonors.filter(honor =>
                honor?.academic_level?.key === categoryKey &&
                honor.school_year === schoolYear
            );

            categoryHonors.forEach(honor => {
                const cert = generatedCertificates?.find(c =>
                    c.student.id === honor.student.id &&
                    c.academic_level.id === honor.academic_level.id &&
                    c.school_year === honor.school_year
                );
                if (cert) {
                    certificateIds.push(cert.id);
                }
            });
        });

        if (certificateIds.length > 0) {
            setBulkPrintData({ certificate_ids: certificateIds });
            postBulkPrint(route('admin.academic.certificates.bulk-print-pdf'));
        } else {
            alert('No generated certificates found for selected categories. Please generate certificates first.');
        }
    };

    const selectedCategoryData = selectedCategory ? getCategoryStudents(selectedCategory) : [];
    const categoryTemplates = selectedCategory ? getCategoryTemplates(selectedCategory) : [];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get('/admin/academic')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Academic
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Certificate Management
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Generate and manage honor certificates by academic level.
                            </p>
                        </div>

                        {/* School Year Filter */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-medium">School Year:</label>
                                    <Select value={schoolYear} onValueChange={setSchoolYear}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schoolYears.map((year) => (
                                                <SelectItem key={year} value={year}>{year}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {!selectedCategory ? (
                            /* Category Selection */
                            <>
                                {/* Batch Actions Bar */}
                                {selectedCategories.length > 0 && (
                                    <Card className="bg-blue-50 border-blue-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Package className="h-5 w-5 text-blue-600" />
                                                    <span className="font-medium text-blue-900">
                                                        {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                                                    </span>
                                                    <Badge variant="secondary">
                                                        {(() => {
                                                            let totalCerts = 0;
                                                            selectedCategories.forEach(categoryKey => {
                                                                const categoryHonors = allHonors.filter(honor =>
                                                                    honor?.academic_level?.key === categoryKey &&
                                                                    honor.school_year === schoolYear
                                                                );
                                                                categoryHonors.forEach(honor => {
                                                                    const cert = generatedCertificates?.find(c =>
                                                                        c.student.id === honor.student.id &&
                                                                        c.academic_level.id === honor.academic_level.id &&
                                                                        c.school_year === honor.school_year
                                                                    );
                                                                    if (cert) totalCerts++;
                                                                });
                                                            });
                                                            return `${totalCerts} certificates`;
                                                        })()}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedCategories([])}
                                                    >
                                                        Clear Selection
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={handleBatchDownloadCategories}
                                                        disabled={bulkPrinting}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        {bulkPrinting ? 'Preparing...' : 'Download Selected'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {CATEGORIES.map((category) => {
                                        const Icon = category.icon;
                                        const categoryCount = allHonors.filter(honor =>
                                            honor?.academic_level?.key === category.key &&
                                            honor.school_year === schoolYear
                                        ).length;

                                        const generatedCount = (() => {
                                            const categoryHonors = allHonors.filter(honor =>
                                                honor?.academic_level?.key === category.key &&
                                                honor.school_year === schoolYear
                                            );
                                            return categoryHonors.filter(honor => {
                                                return generatedCertificates?.some(cert =>
                                                    cert.student.id === honor.student.id &&
                                                    cert.academic_level.id === honor.academic_level.id &&
                                                    cert.school_year === honor.school_year
                                                );
                                            }).length;
                                        })();

                                        const isSelected = selectedCategories.includes(category.key);

                                        return (
                                            <Card
                                                key={category.key}
                                                className={`cursor-pointer transition-all hover:shadow-lg ${
                                                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                                }`}
                                                onClick={() => setSelectedCategory(category.key)}
                                            >
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col items-center text-center space-y-4">
                                                        {/* Checkbox */}
                                                        <div className="absolute top-3 right-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => handleCategoryToggle(category.key, e)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                            />
                                                        </div>

                                                        <div className={`p-4 rounded-full bg-gray-100`}>
                                                            <Icon className={`h-8 w-8 ${category.iconColor}`} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {category.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {categoryCount} honor students
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {generatedCount} certificates generated
                                                            </p>
                                                        </div>
                                                        <Button className={`w-full ${category.color} text-white`}>
                                                            View Students
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            /* Category Detail View */
                            <div className="space-y-6">
                                {/* Category Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedCategory(null);
                                                setSelectedStudents([]);
                                                setSelectedTemplate('');
                                            }}
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back to Categories
                                        </Button>
                                        <h2 className="text-2xl font-bold">
                                            {CATEGORIES.find(c => c.key === selectedCategory)?.name} Honor Students
                                        </h2>
                                        <Badge variant="outline">
                                            {selectedCategoryData.length} students
                                        </Badge>
                                    </div>
                                </div>

                                {/* Template Selection & Bulk Actions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Certificate Generation</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col md:flex-row gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="text-sm font-medium mb-2 block">
                                                    Select Certificate Template
                                                    {categoryTemplates.length === 0 && (
                                                        <span className="ml-2 text-xs text-red-600 font-normal">
                                                            (No templates - Run: php artisan db:seed --class=CertificateTemplateSeeder)
                                                        </span>
                                                    )}
                                                </label>
                                                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                                    <SelectTrigger className={categoryTemplates.length === 0 ? 'border-red-300' : ''}>
                                                        <SelectValue placeholder={categoryTemplates.length > 0 ? "Choose a template..." : "⚠️ No templates available - seed database first"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categoryTemplates.length > 0 ? (
                                                            categoryTemplates.map((template) => (
                                                                <SelectItem key={template.id} value={template.id.toString()}>
                                                                    {template.name}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <SelectItem value="none" disabled>
                                                                No templates available - run CertificateTemplateSeeder
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleGenerateAllMissing}
                                                    disabled={selectedCategoryData.length === 0 || bulkByLevelGenerating}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                                >
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    {bulkByLevelGenerating ? 'Generating All...' : 'Generate All Missing Certificates'}
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline">
                                                            <MoreVertical className="h-4 w-4 mr-2" />
                                                            More Actions
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56">
                                                        <DropdownMenuItem
                                                            onClick={handleBulkGenerate}
                                                            disabled={selectedStudents.length === 0 || !selectedTemplate || bulkGenerating}
                                                        >
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            {bulkGenerating ? 'Generating...' : `Generate ${selectedStudents.length} Selected`}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                const certificateIds = selectedCategoryData
                                                                    .filter(honor => selectedStudents.includes(honor.student.id))
                                                                    .map(honor => {
                                                                        const cert = generatedCertificates?.find(c =>
                                                                            c.student.id === honor.student.id &&
                                                                            c.academic_level.id === honor.academic_level.id
                                                                        );
                                                                        return cert?.id;
                                                                    })
                                                                    .filter((id): id is number => id !== undefined);

                                                                if (certificateIds.length > 0) {
                                                                    setBulkPrintData({ certificate_ids: certificateIds });
                                                                    postBulkPrint(route('admin.academic.certificates.bulk-print-pdf'));
                                                                }
                                                            }}
                                                            disabled={selectedStudents.length === 0 || bulkPrinting}
                                                        >
                                                            <Package className="h-4 w-4 mr-2" />
                                                            {bulkPrinting ? 'Preparing...' : `Download ${selectedStudents.length} Selected`}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => window.open(`/admin/academic/certificates/honor-roll/pdf?academic_level_id=${academicLevels.find(l => l.key === selectedCategory)?.id}&school_year=${schoolYear}`, '_blank')}
                                                        >
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Honor Roll PDF
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Students Table */}
                                <Card>
                                    <CardContent>
                                        {selectedCategoryData.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-12">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedStudents.length === selectedCategoryData.length && selectedCategoryData.length > 0}
                                                                onChange={handleSelectAll}
                                                            />
                                                        </TableHead>
                                                        <TableHead>Rank</TableHead>
                                                        <TableHead>Student Name</TableHead>
                                                        <TableHead>Student Number</TableHead>
                                                        <TableHead>Year Level</TableHead>
                                                        <TableHead>Section</TableHead>
                                                        <TableHead>Honor Type</TableHead>
                                                        <TableHead>GPA</TableHead>
                                                        <TableHead>Certificate</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedCategoryData.map((honor, index) => {
                                                        if (!honor || !honor.student) return null;

                                                        return (
                                                            <TableRow key={honor.id || index}>
                                                                <TableCell>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedStudents.includes(honor.student.id)}
                                                                        onChange={() => handleStudentSelect(honor.student.id)}
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="font-medium">
                                                                    #{index + 1}
                                                                </TableCell>
                                                                <TableCell className="font-medium">
                                                                    {honor.student.name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {honor.student.student_number || 'N/A'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {honor.year_level || honor.student.year_level || 'N/A'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {honor.student.section?.name || 'N/A'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="secondary">
                                                                        {honor.honor_type?.name || 'Unknown Honor'}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="font-mono">
                                                                    {honor.gpa ? honor.gpa.toFixed(2) : 'N/A'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {(() => {
                                                                        const certificate = generatedCertificates?.find(cert =>
                                                                            cert.student.id === honor.student.id &&
                                                                            cert.academic_level.id === honor.academic_level.id &&
                                                                            cert.school_year === honor.school_year
                                                                        );
                                                                        return certificate ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <Badge variant="default" className="text-xs">
                                                                                    Generated
                                                                                </Badge>
                                                                                <span className="text-xs text-gray-500">
                                                                                    {certificate.serial_number}
                                                                                </span>
                                                                            </div>
                                                                        ) : (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                Pending
                                                                            </Badge>
                                                                        );
                                                                    })()
                                                                }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex gap-1">
                                                                        {(() => {
                                                                            const certificate = generatedCertificates?.find(cert =>
                                                                                cert.student.id === honor.student.id &&
                                                                                cert.academic_level.id === honor.academic_level.id &&
                                                                                cert.school_year === honor.school_year
                                                                            );
                                                                            return certificate ? (
                                                                                <>
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="outline"
                                                                                        onClick={() => window.open(`/admin/academic/certificates/${certificate.id}/download`, '_blank')}
                                                                                        className="h-8 px-2"
                                                                                    >
                                                                                        <Download className="h-3 w-3" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="outline"
                                                                                        onClick={() => window.open(`/admin/academic/certificates/${certificate.id}/print`, '_blank')}
                                                                                        className="h-8 px-2"
                                                                                    >
                                                                                        <Printer className="h-3 w-3" />
                                                                                    </Button>
                                                                                </>
                                                                            ) : (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => handleGenerateIndividual(honor)}
                                                                                    disabled={!selectedTemplate || generating}
                                                                                    className="h-8 px-2"
                                                                                >
                                                                                    <FileText className="h-3 w-3 mr-1" />
                                                                                    Generate
                                                                                </Button>
                                                                            );
                                                                        })()
                                                                    }
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">
                                                <h3 className="text-lg font-medium mb-2">No Honor Students Found</h3>
                                                <p className="text-sm">
                                                    No approved honor students for {CATEGORIES.find(c => c.key === selectedCategory)?.name} in {schoolYear}.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}