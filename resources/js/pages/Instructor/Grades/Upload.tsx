import React, { useState, useRef, useMemo } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Upload as UploadIcon, Download, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sidebar } from '@/components/instructor/sidebar';
import { Header } from '@/components/instructor/header';

interface AcademicLevel {
    id: number;
    name: string;
    key: string;
}

interface GradingPeriod {
    id: number;
    name: string;
    code: string;
    academic_level_id: number;
    sort_order: number;
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
    subject_id: number;
    subject: {
        id: number;
        name: string;
        code: string;
        grading_period_ids?: number[];
        semester_ids?: number[];
        course?: {
            id: number;
            name: string;
            code: string;
        };
        academicLevel: AcademicLevel;
        gradingPeriod: GradingPeriod;
    };
    grading_period_ids?: number[];
    semester_ids?: number[];
    academicLevel: AcademicLevel;
    gradingPeriod: GradingPeriod;
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
        grading_period_id: '',
        school_year: '',
        year_of_study: '',
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setData('csv_file', file);
        }
    };

    const handleSubjectChange = (subjectId: string) => {
        setData('subject_id', subjectId);
        
        // Find the selected subject to auto-fill other fields
        const subject = assignedSubjects.find(s => s.subject_id.toString() === subjectId);
        if (subject) {
            setData('academic_level_id', subject.academicLevel.id.toString());
            setData('school_year', subject.school_year);
            if (subject.gradingPeriod) {
                setData('grading_period_id', subject.gradingPeriod.id.toString());
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

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

        // Inertia will automatically convert form data with files to FormData
        post(route('instructor.grades.upload.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                clearInterval(progressInterval);
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
                clearInterval(progressInterval);
                setIsUploading(false);
                setUploadProgress(0);
            },
        });
    };

    const downloadTemplate = () => {
        window.open(route('instructor.grades.template'), '_blank');
    };

    const downloadSubjectTemplate = () => {
        if (!data.subject_id || !data.school_year) {
            alert('Please select a subject and enter school year first');
            return;
        }

        const url = route('instructor.grades.subject-template') +
            `?subject_id=${data.subject_id}&school_year=${encodeURIComponent(data.school_year)}`;
        window.open(url, '_blank');
    };

    const getCurrentAcademicLevelKey = () => {
        const level = academicLevels.find(l => l.id.toString() === data.academic_level_id);
        return level?.key || 'college';
    };

    const isCollegeLevel = getCurrentAcademicLevelKey() === 'college';

    // Filter grading periods based on selected subject
    const allowedGradingPeriods = useMemo(() => {
        if (!data.subject_id) {
            console.log('Upload: No subject selected, returning all periods');
            return gradingPeriods;
        }

        const selectedAssignment = assignedSubjects.find(
            s => s.subject_id.toString() === data.subject_id
        );

        if (!selectedAssignment) {
            console.log('Upload: No assignment found for subject_id:', data.subject_id);
            return gradingPeriods;
        }

        const gradingPeriodIds = selectedAssignment.grading_period_ids || selectedAssignment.subject?.grading_period_ids || [];

        console.log('=== Upload Grading Period Filtering ===');
        console.log('Selected subject:', selectedAssignment.subject?.name);
        console.log('Assignment grading_period_ids:', gradingPeriodIds);
        console.log('All grading periods:', gradingPeriods.length);

        if (gradingPeriodIds.length === 0) {
            console.log('Upload: No grading_period_ids assigned, showing all periods');
            return gradingPeriods;
        }

        const filtered = gradingPeriods.filter(period => gradingPeriodIds.includes(period.id));
        console.log('Upload: Filtered grading periods:', filtered.length, filtered.map(p => ({ id: p.id, name: p.name })));

        return filtered;
    }, [data.subject_id, assignedSubjects, gradingPeriods]);

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
                            <Link href={route('instructor.grades.index')}>
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

                                    {/* Subject Selection - Optional for multi-subject CSV */}
                                    <div>
                                        <Label htmlFor="subject_id">Subject (Optional for multi-subject CSV)</Label>
                                        <Select value={data.subject_id} onValueChange={handleSubjectChange}>
                                            <SelectTrigger className={errors.subject_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select a subject (or leave blank for multi-subject CSV)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assignedSubjects.map((assignment) => (
                                                    <SelectItem key={assignment.id} value={assignment.subject_id.toString()}>
                                                        {assignment.subject.name} ({assignment.subject.code})
                                                        {assignment.subject.course && ` - ${assignment.subject.course.name}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.subject_id && (
                                            <p className="text-sm text-red-500 mt-1">{errors.subject_id}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Leave blank to upload grades for multiple subjects. Include Subject Code column in your CSV.
                                        </p>
                                    </div>

                                    {/* Academic Level - Optional for multi-subject CSV */}
                                    <div>
                                        <Label htmlFor="academic_level_id">Academic Level (Optional for multi-subject CSV)</Label>
                                        <Select value={data.academic_level_id} onValueChange={(value) => setData('academic_level_id', value)}>
                                            <SelectTrigger className={errors.academic_level_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select academic level (optional)" />
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

                                    {/* Grading Period */}
                                    <div>
                                        <Label htmlFor="grading_period_id">Grading Period</Label>
                                        <Select value={data.grading_period_id} onValueChange={(value) => setData('grading_period_id', value)}>
                                            <SelectTrigger className={errors.grading_period_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select grading period (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">No Period</SelectItem>
                                                {(() => {
                                                    // Filter periods for the current academic level AND subject assignment
                                                    const currentLevel = academicLevels.find(l => l.id.toString() === data.academic_level_id);
                                                    const filteredPeriods = allowedGradingPeriods.filter(period =>
                                                        period.academic_level_id.toString() === data.academic_level_id
                                                    );

                                                    // Group periods by semester for college level
                                                    if (currentLevel?.key === 'college') {
                                                        // Get main semesters (not sub-periods)
                                                        const mainSemesters = filteredPeriods.filter(p =>
                                                            (p.code === 'COL_S1' || p.code === 'COL_S2') && !p.code.includes('_')
                                                        );

                                                        return mainSemesters.map((semester) => {
                                                            // Get sub-periods for this specific semester, excluding Final Average
                                                            const subPeriods = filteredPeriods.filter(p =>
                                                                p.code.startsWith(semester.code + '_') &&
                                                                !p.code.includes('_FA') // Exclude Final Average
                                                            ).sort((a, b) => a.sort_order - b.sort_order);

                                                            return (
                                                                <div key={semester.id}>
                                                                    {/* Main semester - selectable */}
                                                                    <SelectItem
                                                                        value={semester.id.toString()}
                                                                        className="font-semibold"
                                                                    >
                                                                        {semester.name}
                                                                    </SelectItem>
                                                                    {/* Sub-periods - quarters only */}
                                                                    {subPeriods.map((period) => (
                                                                        <SelectItem
                                                                            key={period.id}
                                                                            value={period.id.toString()}
                                                                            className="pl-6 text-sm"
                                                                        >
                                                                            • {period.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </div>
                                                            );
                                                        });
                                                    } else {
                                                        // For other academic levels, show regular list (excluding final averages)
                                                        return filteredPeriods
                                                            .filter(period => !period.name.toLowerCase().includes('final average'))
                                                            .sort((a, b) => a.sort_order - b.sort_order)
                                                            .map((period) => (
                                                                <SelectItem key={period.id} value={period.id.toString()}>
                                                                    {period.name}
                                                                </SelectItem>
                                                            ));
                                                    }
                                                })()}
                                            </SelectContent>
                                        </Select>
                                        {errors.grading_period_id && (
                                            <p className="text-sm text-red-500 mt-1">{errors.grading_period_id}</p>
                                        )}
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
                                            <strong>Grade System:</strong> {isCollegeLevel ? 
                                                'College uses 1.0-5.0 scale (1.0 highest, 3.0 passing)' : 
                                                'Elementary to Senior High uses 75-100 scale (75 passing)'
                                            }
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
                                            disabled={processing || isUploading || !selectedFile || !data.school_year}
                                            className="w-full"
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
                                        <h4 className="font-medium mb-2 text-green-600">Subject-Specific Template (Recommended for College):</h4>
                                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                                            <li>• Select a subject and school year above</li>
                                            <li>• Click "Download Subject Template" to get a pre-filled CSV with enrolled students</li>
                                            <li>• Fill in <strong>MIDTERM</strong> and <strong>FINAL TERM</strong> grade columns</li>
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
                                            <li>• <strong>Subject Code:</strong> Subject code (e.g., DBMS01, WEBDEV01)</li>
                                            <li>• <strong>Grade:</strong> Numeric grade value</li>
                                            <li>• <strong>Grading Period:</strong> Period code (e.g., COL_S1_M, COL_S2_M) - Optional</li>
                                            <li>• <strong>Notes:</strong> Optional comments</li>
                                        </ul>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Upload grades for multiple subjects and students in a single CSV file. Each row represents one grade entry.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">Grade Values:</h4>
                                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            <li>• <strong>College:</strong> 1.0 to 5.0 (3.0 = passing)</li>
                                            <li>• <strong>Elementary/Senior High:</strong> 75 to 100 (75 = passing)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">Example Multi-Subject CSV:</h4>
                                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs font-mono overflow-x-auto">
                                            <div>Student ID,Student Name,Subject Code,Grade,Grading Period,Notes</div>
                                            <div>CO-2024-001,John Doe,DBMS01,1.5,COL_S1_M,Good performance</div>
                                            <div>CO-2024-001,John Doe,WEBDEV01,1.75,COL_S1_M,Excellent work</div>
                                            <div>CO-2024-002,Jane Smith,DBMS01,2.0,COL_S1_M,Satisfactory</div>
                                        </div>
                                    </div>
                                </div>

                                <Alert>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription>
                                        <strong>Tip:</strong> Download the template to see the exact format. The system will automatically detect existing grades and update them, or create new ones if they don't exist. You can upload grades for multiple subjects and semesters in one file!
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

