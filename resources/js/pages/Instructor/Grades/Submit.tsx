import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import InstructorLayout from '../InstructorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Grade {
    id: number;
    student: {
        id: number;
        name: string;
        email: string;
        student_profile: {
            academic_level?: {
                name: string;
            };
            college_course?: {
                name: string;
            };
        };
    };
    subject: {
        id: number;
        name: string;
        code: string;
    };
    academic_period: {
        id: number;
        name: string;
    };
    instructor: {
        id: number;
        name: string;
    };
    section: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    remarks?: string;
    created_at: string;
    updated_at: string;
    // Grade fields based on student type
    first_grading?: number;
    second_grading?: number;
    third_grading?: number;
    fourth_grading?: number;
    first_semester_midterm?: number;
    first_semester_pre_final?: number;
    second_semester_midterm?: number;
    second_semester_pre_final?: number;
    overall_grade?: number;
}

interface Props {
    grades: {
        data: Grade[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        status?: string;
        subject?: string;
        period?: string;
        search?: string;
    };
    subjects: Array<{ id: number; name: string; code: string }>;
    periods: Array<{ id: number; name: string }>;
}

const SubmitGrades: React.FC<Props> = ({ grades, filters, subjects, periods }) => {
    const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [subjectFilter, setSubjectFilter] = useState(filters.subject || '');
    const [periodFilter, setPeriodFilter] = useState(filters.period || '');

    const { post, processing, errors } = useForm({
        grade_ids: [] as number[],
        remarks: '',
    });

    const handleSelectGrade = (gradeId: number) => {
        setSelectedGrades(prev => 
            prev.includes(gradeId) 
                ? prev.filter(id => id !== gradeId)
                : [...prev, gradeId]
        );
    };

    const handleSelectAll = () => {
        const draftGrades = grades.data.filter(grade => grade.status === 'draft');
        const draftGradeIds = draftGrades.map(grade => grade.id);
        
        if (selectedGrades.length === draftGradeIds.length) {
            setSelectedGrades([]);
        } else {
            setSelectedGrades(draftGradeIds);
        }
    };

    const handleSubmitGrades = () => {
        if (selectedGrades.length === 0) {
            alert('Please select at least one grade to submit.');
            return;
        }

        post('/instructor/grades/submit', {
            data: {
                grade_ids: selectedGrades,
                remarks: '',
            },
            onSuccess: () => {
                setSelectedGrades([]);
                router.reload();
            },
        });
    };

    const handleFilter = () => {
        router.get('/instructor/grades/submit', {
            search: searchTerm,
            status: statusFilter,
            subject: subjectFilter,
            period: periodFilter,
        }, {
            preserveState: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { color: 'bg-gray-100 text-gray-800', icon: Clock },
            submitted: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        const Icon = config.icon;

        return (
            <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const draftGrades = grades.data.filter(grade => grade.status === 'draft');
    const allDraftSelected = draftGrades.length > 0 && selectedGrades.length === draftGrades.length;

    return (
        <InstructorLayout>
            <Head title="Submit Grades for Validation" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Submit Grades for Validation</h1>
                        <p className="text-gray-600">Submit draft grades for administrative review and approval</p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label>Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Status</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Subject</Label>
                                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Subjects" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Subjects</SelectItem>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id.toString()}>
                                                {subject.code} - {subject.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Academic Period</Label>
                                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Periods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Periods</SelectItem>
                                        {periods.map((period) => (
                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                {period.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button onClick={handleFilter} className="w-full md:w-auto">
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Actions */}
                {draftGrades.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Submit Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="select-all"
                                            checked={allDraftSelected}
                                            onCheckedChange={handleSelectAll}
                                        />
                                        <Label htmlFor="select-all">Select All Draft Grades</Label>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {selectedGrades.length} of {draftGrades.length} draft grades selected
                                    </span>
                                </div>
                                <Button 
                                    onClick={handleSubmitGrades} 
                                    disabled={selectedGrades.length === 0 || processing}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {processing ? 'Submitting...' : `Submit ${selectedGrades.length} Grades`}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Grades List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Grades ({grades.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {grades.data.length === 0 ? (
                            <Alert>
                                <AlertDescription>
                                    No grades found matching your criteria.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-4">
                                {grades.data.map((grade) => (
                                    <div key={grade.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                {grade.status === 'draft' && (
                                                    <Checkbox
                                                        checked={selectedGrades.includes(grade.id)}
                                                        onCheckedChange={() => handleSelectGrade(grade.id)}
                                                    />
                                                )}
                                                <div>
                                                    <h3 className="font-semibold text-lg">
                                                        {grade.student.name}
                                                    </h3>
                                                    <p className="text-gray-600">{grade.student.email}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {grade.subject.code} - {grade.subject.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {grade.academic_period.name} • Section {grade.section}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {getStatusBadge(grade.status)}
                                            </div>
                                        </div>

                                        {/* Grade Details */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            {grade.first_grading && (
                                                <div>
                                                    <span className="font-medium">1st Grading:</span> {grade.first_grading}
                                                </div>
                                            )}
                                            {grade.second_grading && (
                                                <div>
                                                    <span className="font-medium">2nd Grading:</span> {grade.second_grading}
                                                </div>
                                            )}
                                            {grade.third_grading && (
                                                <div>
                                                    <span className="font-medium">3rd Grading:</span> {grade.third_grading}
                                                </div>
                                            )}
                                            {grade.fourth_grading && (
                                                <div>
                                                    <span className="font-medium">4th Grading:</span> {grade.fourth_grading}
                                                </div>
                                            )}
                                            {grade.first_semester_midterm && (
                                                <div>
                                                    <span className="font-medium">1st Sem Midterm:</span> {grade.first_semester_midterm}
                                                </div>
                                            )}
                                            {grade.first_semester_pre_final && (
                                                <div>
                                                    <span className="font-medium">1st Sem Pre-Final:</span> {grade.first_semester_pre_final}
                                                </div>
                                            )}
                                            {grade.second_semester_midterm && (
                                                <div>
                                                    <span className="font-medium">2nd Sem Midterm:</span> {grade.second_semester_midterm}
                                                </div>
                                            )}
                                            {grade.second_semester_pre_final && (
                                                <div>
                                                    <span className="font-medium">2nd Sem Pre-Final:</span> {grade.second_semester_pre_final}
                                                </div>
                                            )}
                                            {grade.overall_grade && (
                                                <div className="col-span-2 md:col-span-4">
                                                    <span className="font-medium">Overall Grade:</span> {grade.overall_grade}
                                                </div>
                                            )}
                                        </div>

                                        {grade.remarks && (
                                            <div className="mt-2 text-sm">
                                                <span className="font-medium">Remarks:</span> {grade.remarks}
                                            </div>
                                        )}

                                        <div className="mt-2 text-xs text-gray-500">
                                            Last updated: {new Date(grade.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Information Alert */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Note:</strong> Only draft grades can be submitted for validation. 
                        Once submitted, grades will be reviewed by administrators before being approved or rejected.
                    </AlertDescription>
                </Alert>
            </div>
        </InstructorLayout>
    );
};

export default SubmitGrades; 