import React, { useState, useRef } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Upload as UploadIcon, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sidebar } from '@/components/teacher/sidebar';
import { Header } from '@/components/teacher/header';

interface AcademicLevel {
    id: number;
    name: string;
    key: string;
}

interface GradingPeriod {
    id: number;
    name: string;
    code: string;
    type: string;
    period_type: string;
    semester_number: number | null;
    parent_id: number | null;
    sort_order: number;
    is_active: boolean;
    academic_level_id: number;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    course?: {
        id: number;
        name: string;
        code: string;
    };
    academicLevel: AcademicLevel;
    gradingPeriod: GradingPeriod;
}

interface AssignedSubject {
    id: number;
    subject: Subject;
    academicLevel: AcademicLevel;
    gradingPeriod?: GradingPeriod;
    school_year: string;
    is_active: boolean;
}

interface UploadProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
    assignedSubjects: AssignedSubject[];
    academicLevels: AcademicLevel[];
    gradingPeriods: GradingPeriod[];
}

export default function Upload({ user, assignedSubjects, academicLevels, gradingPeriods }: UploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        csv_file: null as File | null,
        subject_id: '',
        academic_level_id: '',
        grading_period_ids: [] as string[],
        school_year: '',
        year_of_study: '',
    });

    // Safety check for required props
    if (!assignedSubjects || !Array.isArray(assignedSubjects) || !academicLevels || !Array.isArray(academicLevels) || !gradingPeriods || !Array.isArray(gradingPeriods)) {
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="h-16 w-16 text-gray-400 mx-auto mb-4">📚</div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Loading...
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Please wait while we load your assigned subjects and academic data.
                        </p>
                        <div className="mt-4 text-sm text-gray-400">
                            Debug: assignedSubjects = {JSON.stringify(assignedSubjects)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setData('csv_file', file);
        }
    };

    const handleSubjectChange = (subjectId: string) => {
        // Find the selected subject to auto-fill other fields
        const subject = assignedSubjects.find(s => s.subject.id.toString() === subjectId);
        if (subject) {
            console.log('Subject selected:', {
                subjectId,
                subject: subject.subject.name,
                academicLevel: subject.academicLevel.name,
                gradingPeriod: subject.gradingPeriod?.name || 'None',
                schoolYear: subject.school_year
            });

            setData({
                ...data,
                subject_id: subjectId,
                academic_level_id: subject.academicLevel.id.toString(),
                school_year: subject.school_year,
                grading_period_ids: [] // Reset grading period selection when subject changes
            });

            // Log available grading periods for this academic level
            const availablePeriods = gradingPeriods.filter(
                period => period.academic_level_id.toString() === subject.academicLevel.id.toString()
            );
            console.log('Available grading periods for academic level:', availablePeriods);
        } else {
            setData('subject_id', subjectId);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('csv_file', selectedFile);
        formData.append('subject_id', data.subject_id);
        formData.append('academic_level_id', data.academic_level_id);
        formData.append('school_year', data.school_year);
        formData.append('year_of_study', data.year_of_study || '');

        // Append each grading period ID
        data.grading_period_ids.forEach((periodId) => {
            formData.append('grading_period_ids[]', periodId);
        });

        // Simulate upload progress
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        post(route('teacher.grades.upload.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setUploadProgress(100);
                setTimeout(() => {
                    setIsUploading(false);
                    setUploadProgress(0);
                    setSelectedFile(null);
                    reset();
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }, 1000);
            },
            onError: () => {
                setIsUploading(false);
                setUploadProgress(0);
            },
        });
    };

    const downloadTemplate = () => {
        const academicLevelKey = data.academic_level_id ?
            academicLevels.find(l => l.id.toString() === data.academic_level_id)?.key || 'senior_highschool'
            : 'senior_highschool';
        const url = route('teacher.grades.template') + '?academic_level=' + academicLevelKey;

        console.log('Downloading CSV template for academic level:', academicLevelKey);

        window.open(url, '_blank');
    };

    const downloadSubjectTemplate = () => {
        if (!data.subject_id || !data.school_year) {
            alert('Please select a subject and enter school year first');
            return;
        }

        const url = route('teacher.grades.subject-template') +
            `?subject_id=${data.subject_id}&school_year=${encodeURIComponent(data.school_year)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Upload Grades CSV
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Bulk upload student grades using a CSV file
                                </p>
                            </div>
                            <Link href={route('teacher.grades.index')}>
                                <Button variant="outline">
                                    Back to Grades
                                </Button>
                            </Link>
                        </div>

                        {/* Upload Form */}
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UploadIcon className="h-5 w-5" />
                                    Upload Grades CSV
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* File Upload */}
                                    <div>
                                        <Label htmlFor="csv_file">CSV File</Label>
                                        <div className="mt-2">
                                            <Input
                                                id="csv_file"
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".csv,.txt"
                                                onChange={handleFileSelect}
                                                className="cursor-pointer"
                                                disabled={isUploading}
                                            />
                                        </div>
                                        {selectedFile && (
                                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <FileText className="h-4 w-4" />
                                                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                            </div>
                                        )}
                                        {errors.csv_file && (
                                            <p className="text-sm text-red-500 mt-1">{errors.csv_file}</p>
                                        )}
                                    </div>

                                    {/* Subject Selection */}
                                    <div>
                                        <Label htmlFor="subject_id">Subject *</Label>
                                        <Select value={data.subject_id} onValueChange={handleSubjectChange}>
                                            <SelectTrigger className={errors.subject_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select a subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assignedSubjects.map((assignment) => (
                                                    <SelectItem key={assignment.id} value={assignment.subject.id.toString()}>
                                                        {assignment.subject.name} ({assignment.subject.code})
                                                        {assignment.subject.course && ` - ${assignment.subject.course.name}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.subject_id && (
                                            <p className="text-sm text-red-500 mt-1">{errors.subject_id}</p>
                                        )}
                                    </div>

                                    {/* Academic Level */}
                                    <div>
                                        <Label htmlFor="academic_level_id">Academic Level *</Label>
                                        <Select value={data.academic_level_id} onValueChange={(value) => setData({ ...data, academic_level_id: value, grading_period_ids: [] })}>
                                            <SelectTrigger className={errors.academic_level_id ? 'border-red-500' : ''}>
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
                                        {errors.academic_level_id && (
                                            <p className="text-sm text-red-500 mt-1">{errors.academic_level_id}</p>
                                        )}
                                    </div>

                                    {/* Grading Periods */}
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

                                                        // For Senior High School, only show root semesters (no parent_id)
                                                        const academicLevel = academicLevels.find(l => l.id.toString() === data.academic_level_id);
                                                        if (academicLevel?.key === 'senior_highschool') {
                                                            return !p.parent_id;
                                                        }
                                                        return true;
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
                                                    if (academicLevel?.key === 'senior_highschool') {
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

                                    {/* School Year */}
                                    <div>
                                        <Label htmlFor="school_year">School Year *</Label>
                                        <Input
                                            id="school_year"
                                            type="text"
                                            placeholder="e.g., 2024-2025"
                                            value={data.school_year}
                                            onChange={(e) => setData('school_year', e.target.value)}
                                            className={errors.school_year ? 'border-red-500' : ''}
                                        />
                                        {errors.school_year && (
                                            <p className="text-sm text-red-500 mt-1">{errors.school_year}</p>
                                        )}
                                    </div>

                                    {/* Year of Study */}
                                    <div>
                                        <Label htmlFor="year_of_study">Year of Study</Label>
                                        <Input
                                            id="year_of_study"
                                            type="number"
                                            min="1"
                                            max="10"
                                            placeholder="e.g., 1"
                                            value={data.year_of_study}
                                            onChange={(e) => setData('year_of_study', e.target.value)}
                                            className={errors.year_of_study ? 'border-red-500' : ''}
                                        />
                                        {errors.year_of_study && (
                                            <p className="text-sm text-red-500 mt-1">{errors.year_of_study}</p>
                                        )}
                                    </div>

                                    {/* Grade System Info */}
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            <strong>Grade System:</strong> Teachers use 1.0-5.0 scale (1.0 highest, 3.0 passing)
                                        </AlertDescription>
                                    </Alert>

                                    {/* Upload Progress */}
                                    {isUploading && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Uploading... {uploadProgress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="space-y-3 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={processing || isUploading || !selectedFile || !data.subject_id || !data.academic_level_id || !data.school_year || data.grading_period_ids.length === 0}
                                            className="w-full"
                                            title={
                                                !data.subject_id
                                                    ? 'Please select a subject'
                                                    : !data.academic_level_id
                                                    ? 'Please select an academic level'
                                                    : data.grading_period_ids.length === 0
                                                    ? 'Please select at least one grading period'
                                                    : !data.school_year
                                                    ? 'Please enter school year'
                                                    : !selectedFile
                                                    ? 'Please select a CSV file'
                                                    : 'Upload grades from CSV'
                                            }
                                        >
                                            <UploadIcon className="h-4 w-4 mr-2" />
                                            {isUploading ? 'Uploading...' : 'Upload Grades'}
                                        </Button>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={downloadSubjectTemplate}
                                                disabled={!data.subject_id || !data.school_year}
                                                className="w-full"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download Subject Template
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={downloadTemplate}
                                                className="w-full"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Multi-Subject Template
                                            </Button>
                                        </div>

                                        {data.subject_id && data.school_year && (
                                            <p className="text-sm text-muted-foreground text-center">
                                                Tip: Download the subject template to get a pre-filled CSV with your enrolled students!
                                            </p>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Instructions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>CSV Format Instructions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2 text-green-600">Subject-Specific Template (Recommended):</h4>
                                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                                            <li>• Select a subject and school year above</li>
                                            <li>• Click "Download Subject Template" to get a pre-filled CSV with enrolled students</li>
                                            <li>• Fill in <strong>MIDTERM</strong> and <strong>FINAL TERM</strong> grade columns (1.0-5.0 scale)</li>
                                            <li>• Upload the completed CSV</li>
                                            <li>• The system will create separate grade entries for midterm and final periods</li>
                                        </ul>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            This format is perfect for uploading grades for a specific subject with all enrolled students already listed!
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">Multi-Subject CSV Format:</h4>
                                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                                            <li>• <strong>Student ID:</strong> Student number or database ID</li>
                                            <li>• <strong>Student Name:</strong> Full name of student</li>
                                            <li>• <strong>Subject Code:</strong> Subject code (e.g., MATH101, ENG102)</li>
                                            <li>• <strong>Grade:</strong> Numeric grade value</li>
                                            <li>• <strong>Grading Period:</strong> Period code (optional)</li>
                                            <li>• <strong>Notes:</strong> Optional comments</li>
                                        </ul>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Use this format for uploading grades across multiple subjects in one file.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">Single-Subject CSV Format:</h4>
                                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                                            <li>• <strong>Student ID:</strong> Student number or database ID</li>
                                            <li>• <strong>Student Name:</strong> Full name of student</li>
                                            <li>• <strong>Grade:</strong> Numeric grade value</li>
                                            <li>• <strong>Notes:</strong> Optional comments</li>
                                        </ul>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Simple 4-column format for uploading one grade per student. Subject and grading period must be selected in the form above.
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                        <h4 className="font-medium mb-2">Grade Values:</h4>
                                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            <li>• <strong>Grading Scale:</strong> 1.0 to 5.0 (1.0 = highest, 3.0 = passing)</li>
                                            <li>• <strong>Sample Grades:</strong> 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 4.0, 5.0</li>
                                        </ul>
                                    </div>
                                </div>

                                <Alert>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription>
                                        <strong>Tip:</strong> The system will automatically detect the CSV format and process it accordingly. It will update existing grades or create new ones if they don't exist. Grades can be edited within 5 days of creation if not yet submitted for validation.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}

