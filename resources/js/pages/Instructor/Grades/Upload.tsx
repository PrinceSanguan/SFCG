import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import InstructorLayout from '../InstructorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
    subjects: Array<{ id: number; name: string; code: string }>;
    periods: Array<{ id: number; name: string }>;
    uploadResult?: {
        success: boolean;
        message: string;
        errors?: string[];
        processed?: number;
        failed?: number;
    };
}

const UploadGrades: React.FC<Props> = ({ subjects, periods, uploadResult }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        subject_id: '',
        academic_period_id: '',
        section: '',
        csv_file: null as File | null,
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setData('csv_file', file);
        }
    };

    const handleUpload = () => {
        if (!selectedFile || !data.subject_id || !data.academic_period_id || !data.section) {
            alert('Please fill in all required fields and select a CSV file.');
            return;
        }

        post('/instructor/grades/upload', {
            onSuccess: () => {
                setSelectedFile(null);
                reset();
            },
        });
    };

    const downloadTemplate = () => {
        const template = `Student ID,Student Name,Email,1st Grading,2nd Grading,3rd Grading,4th Grading,1st Semester Midterm,1st Semester Pre-Final,2nd Semester Midterm,2nd Semester Pre-Final,Overall Grade,Remarks
12345,John Doe,john.doe@example.com,85.5,88.0,87.5,89.0,,,,,87.5,Good performance
67890,Jane Smith,jane.smith@example.com,,,,,92.0,94.5,91.0,93.5,92.75,Excellent work`;
        
        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grade_upload_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <InstructorLayout>
            <Head title="Upload Student Grades via CSV" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Upload Student Grades via CSV</h1>
                        <p className="text-gray-600">Upload multiple student grades using a CSV file</p>
                    </div>
                    <Button onClick={downloadTemplate} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                    </Button>
                </div>

                {/* Upload Result Alert */}
                {uploadResult && (
                    <Alert className={uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                        {uploadResult.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription className={uploadResult.success ? 'text-green-800' : 'text-red-800'}>
                            <div className="font-medium">{uploadResult.message}</div>
                            {uploadResult.processed && (
                                <div className="text-sm mt-1">
                                    Processed: {uploadResult.processed} | Failed: {uploadResult.failed || 0}
                                </div>
                            )}
                            {uploadResult.errors && uploadResult.errors.length > 0 && (
                                <div className="mt-2">
                                    <div className="font-medium">Errors:</div>
                                    <ul className="text-sm list-disc list-inside mt-1">
                                        {uploadResult.errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Upload Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Subject *</Label>
                                <Select value={data.subject_id} onValueChange={(value) => setData('subject_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id.toString()}>
                                                {subject.code} - {subject.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.subject_id && (
                                    <p className="text-red-500 text-xs mt-1">{errors.subject_id}</p>
                                )}
                            </div>

                            <div>
                                <Label>Academic Period *</Label>
                                <Select value={data.academic_period_id} onValueChange={(value) => setData('academic_period_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periods.map((period) => (
                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                {period.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.academic_period_id && (
                                    <p className="text-red-500 text-xs mt-1">{errors.academic_period_id}</p>
                                )}
                            </div>

                            <div>
                                <Label>Section *</Label>
                                <Input
                                    value={data.section}
                                    onChange={(e) => setData('section', e.target.value)}
                                    placeholder="e.g., Section A"
                                    className={errors.section ? 'border-red-500' : ''}
                                />
                                {errors.section && (
                                    <p className="text-red-500 text-xs mt-1">{errors.section}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <Label>CSV File *</Label>
                            <Input
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                className={errors.csv_file ? 'border-red-500' : ''}
                            />
                            {errors.csv_file && (
                                <p className="text-red-500 text-xs mt-1">{errors.csv_file}</p>
                            )}
                            {selectedFile && (
                                <div className="mt-2 flex items-center space-x-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-gray-600">{selectedFile.name}</span>
                                    <Badge variant="secondary">{selectedFile.size} bytes</Badge>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <Button 
                                onClick={handleUpload} 
                                disabled={!selectedFile || !data.subject_id || !data.academic_period_id || !data.section || processing}
                                className="w-full md:w-auto"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {processing ? 'Uploading...' : 'Upload Grades'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">CSV Format Requirements:</h3>
                                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                    <li>First row must contain column headers</li>
                                    <li>Required columns: Student ID, Student Name, Email</li>
                                    <li>Grade columns: 1st Grading, 2nd Grading, 3rd Grading, 4th Grading (for Elementary/JHS)</li>
                                    <li>Grade columns: 1st Semester Midterm, 1st Semester Pre-Final, 2nd Semester Midterm, 2nd Semester Pre-Final (for College)</li>
                                    <li>Optional columns: Overall Grade, Remarks</li>
                                    <li>Grades should be numeric values between 0 and 100</li>
                                    <li>Use empty cells for missing grades</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Important Notes:</h3>
                                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                    <li>Students must already exist in the system</li>
                                    <li>Grades will be created as draft status</li>
                                    <li>Duplicate entries for the same student-subject-period will be updated</li>
                                    <li>Maximum file size: 5MB</li>
                                    <li>Supported format: CSV only</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Example CSV Structure:</h3>
                                <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                                    Student ID,Student Name,Email,1st Grading,2nd Grading,3rd Grading,4th Grading,Overall Grade,Remarks<br/>
                                    12345,John Doe,john.doe@example.com,85.5,88.0,87.5,89.0,87.5,Good performance<br/>
                                    67890,Jane Smith,jane.smith@example.com,92.0,94.5,91.0,93.5,92.75,Excellent work
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </InstructorLayout>
    );
};

export default UploadGrades; 