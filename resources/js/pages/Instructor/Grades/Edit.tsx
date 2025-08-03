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
import { Search, Edit, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

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

const EditGrades: React.FC<Props> = ({ grades, filters, subjects, periods }) => {
    const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [subjectFilter, setSubjectFilter] = useState(filters.subject || 'all');
    const [periodFilter, setPeriodFilter] = useState(filters.period || 'all');

    const { data, setData, put, processing, errors, reset } = useForm({
        first_grading: '',
        second_grading: '',
        third_grading: '',
        fourth_grading: '',
        first_semester_midterm: '',
        first_semester_pre_final: '',
        second_semester_midterm: '',
        second_semester_pre_final: '',
        overall_grade: '',
        remarks: '',
    });

    const determineStudentType = (grade: Grade) => {
        if (grade.student.student_profile?.college_course) {
            return 'college';
        } else if (grade.student.student_profile?.academic_level?.name?.includes('Senior High')) {
            return 'shs';
        } else {
            return 'elem_jhs';
        }
    };

    const handleEdit = (grade: Grade) => {
        setSelectedGrade(grade);
        setIsEditing(true);
        
        // Populate form with current grade data
        setData({
            first_grading: grade.first_grading?.toString() || '',
            second_grading: grade.second_grading?.toString() || '',
            third_grading: grade.third_grading?.toString() || '',
            fourth_grading: grade.fourth_grading?.toString() || '',
            first_semester_midterm: grade.first_semester_midterm?.toString() || '',
            first_semester_pre_final: grade.first_semester_pre_final?.toString() || '',
            second_semester_midterm: grade.second_semester_midterm?.toString() || '',
            second_semester_pre_final: grade.second_semester_pre_final?.toString() || '',
            overall_grade: grade.overall_grade?.toString() || '',
            remarks: grade.remarks || '',
        });
    };

    const handleSave = () => {
        if (!selectedGrade) return;

        put(`/instructor/grades/${selectedGrade.id}`, {
            onSuccess: () => {
                setIsEditing(false);
                setSelectedGrade(null);
                reset();
                // Refresh the page to show updated data
                router.reload();
            },
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedGrade(null);
        reset();
    };

    const handleFilter = () => {
        router.get('/instructor/grades/edit', {
            search: searchTerm,
            status: statusFilter === 'all' ? '' : statusFilter,
            subject: subjectFilter === 'all' ? '' : subjectFilter,
            period: periodFilter === 'all' ? '' : periodFilter,
        }, {
            preserveState: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
            submitted: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-800', icon: X },
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

    const renderGradeForm = (grade: Grade) => {
        const studentType = determineStudentType(grade);

        if (studentType === 'college') {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>1st Semester Midterm</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.first_semester_midterm}
                                onChange={(e) => setData('first_semester_midterm', e.target.value)}
                                className={errors.first_semester_midterm ? 'border-red-500' : ''}
                            />
                            {errors.first_semester_midterm && (
                                <p className="text-red-500 text-xs mt-1">{errors.first_semester_midterm}</p>
                            )}
                        </div>
                        <div>
                            <Label>1st Semester Pre-Final</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.first_semester_pre_final}
                                onChange={(e) => setData('first_semester_pre_final', e.target.value)}
                                className={errors.first_semester_pre_final ? 'border-red-500' : ''}
                            />
                            {errors.first_semester_pre_final && (
                                <p className="text-red-500 text-xs mt-1">{errors.first_semester_pre_final}</p>
                            )}
                        </div>
                        <div>
                            <Label>2nd Semester Midterm</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.second_semester_midterm}
                                onChange={(e) => setData('second_semester_midterm', e.target.value)}
                                className={errors.second_semester_midterm ? 'border-red-500' : ''}
                            />
                            {errors.second_semester_midterm && (
                                <p className="text-red-500 text-xs mt-1">{errors.second_semester_midterm}</p>
                            )}
                        </div>
                        <div>
                            <Label>2nd Semester Pre-Final</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.second_semester_pre_final}
                                onChange={(e) => setData('second_semester_pre_final', e.target.value)}
                                className={errors.second_semester_pre_final ? 'border-red-500' : ''}
                            />
                            {errors.second_semester_pre_final && (
                                <p className="text-red-500 text-xs mt-1">{errors.second_semester_pre_final}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <Label>Overall Grade</Label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={data.overall_grade}
                            onChange={(e) => setData('overall_grade', e.target.value)}
                            className={errors.overall_grade ? 'border-red-500' : ''}
                        />
                        {errors.overall_grade && (
                            <p className="text-red-500 text-xs mt-1">{errors.overall_grade}</p>
                        )}
                    </div>
                </div>
            );
        } else if (studentType === 'shs') {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>1st Grading</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.first_grading}
                                onChange={(e) => setData('first_grading', e.target.value)}
                                className={errors.first_grading ? 'border-red-500' : ''}
                            />
                            {errors.first_grading && (
                                <p className="text-red-500 text-xs mt-1">{errors.first_grading}</p>
                            )}
                        </div>
                        <div>
                            <Label>2nd Grading</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.second_grading}
                                onChange={(e) => setData('second_grading', e.target.value)}
                                className={errors.second_grading ? 'border-red-500' : ''}
                            />
                            {errors.second_grading && (
                                <p className="text-red-500 text-xs mt-1">{errors.second_grading}</p>
                            )}
                        </div>
                        <div>
                            <Label>3rd Grading</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.third_grading}
                                onChange={(e) => setData('third_grading', e.target.value)}
                                className={errors.third_grading ? 'border-red-500' : ''}
                            />
                            {errors.third_grading && (
                                <p className="text-red-500 text-xs mt-1">{errors.third_grading}</p>
                            )}
                        </div>
                        <div>
                            <Label>4th Grading</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.fourth_grading}
                                onChange={(e) => setData('fourth_grading', e.target.value)}
                                className={errors.fourth_grading ? 'border-red-500' : ''}
                            />
                            {errors.fourth_grading && (
                                <p className="text-red-500 text-xs mt-1">{errors.fourth_grading}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <Label>Overall Grade</Label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={data.overall_grade}
                            onChange={(e) => setData('overall_grade', e.target.value)}
                            className={errors.overall_grade ? 'border-red-500' : ''}
                        />
                        {errors.overall_grade && (
                            <p className="text-red-500 text-xs mt-1">{errors.overall_grade}</p>
                        )}
                    </div>
                </div>
            );
        } else {
            // Elementary/JHS - Quarterly
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>1st Grading</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.first_grading}
                                onChange={(e) => setData('first_grading', e.target.value)}
                                className={errors.first_grading ? 'border-red-500' : ''}
                            />
                            {errors.first_grading && (
                                <p className="text-red-500 text-xs mt-1">{errors.first_grading}</p>
                            )}
                        </div>
                        <div>
                            <Label>2nd Grading</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.second_grading}
                                onChange={(e) => setData('second_grading', e.target.value)}
                                className={errors.second_grading ? 'border-red-500' : ''}
                            />
                            {errors.second_grading && (
                                <p className="text-red-500 text-xs mt-1">{errors.second_grading}</p>
                            )}
                        </div>
                        <div>
                            <Label>3rd Grading</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.third_grading}
                                onChange={(e) => setData('third_grading', e.target.value)}
                                className={errors.third_grading ? 'border-red-500' : ''}
                            />
                            {errors.third_grading && (
                                <p className="text-red-500 text-xs mt-1">{errors.third_grading}</p>
                            )}
                        </div>
                        <div>
                            <Label>4th Grading</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.fourth_grading}
                                onChange={(e) => setData('fourth_grading', e.target.value)}
                                className={errors.fourth_grading ? 'border-red-500' : ''}
                            />
                            {errors.fourth_grading && (
                                <p className="text-red-500 text-xs mt-1">{errors.fourth_grading}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <Label>Overall Grade</Label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={data.overall_grade}
                            onChange={(e) => setData('overall_grade', e.target.value)}
                            className={errors.overall_grade ? 'border-red-500' : ''}
                        />
                        {errors.overall_grade && (
                            <p className="text-red-500 text-xs mt-1">{errors.overall_grade}</p>
                        )}
                    </div>
                </div>
            );
        }
    };

    return (
        <InstructorLayout>
            <Head title="Edit Submitted Grades" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Submitted Grades</h1>
                        <p className="text-gray-600">Edit and update submitted grade records</p>
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
                                <SelectItem value="all">All Status</SelectItem>
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
                                        <SelectItem value="all">All Subjects</SelectItem>
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
                                        <SelectItem value="all">All Periods</SelectItem>
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

                {/* Grades List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Submitted Grades ({grades.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {grades.data.length === 0 ? (
                            <Alert>
                                <AlertDescription>
                                    No submitted grades found matching your criteria.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-4">
                                {grades.data.map((grade) => (
                                    <div key={grade.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
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
                                            <div className="flex items-center space-x-2">
                                                {getStatusBadge(grade.status)}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(grade)}
                                                    disabled={isEditing}
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
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
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Modal */}
                {isEditing && selectedGrade && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Edit Grade - {selectedGrade.student.name}</h2>
                                <Button variant="ghost" size="sm" onClick={handleCancel}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label>Student</Label>
                                    <p className="text-sm text-gray-600">{selectedGrade.student.name} ({selectedGrade.student.email})</p>
                                </div>

                                <div>
                                    <Label>Subject</Label>
                                    <p className="text-sm text-gray-600">{selectedGrade.subject.code} - {selectedGrade.subject.name}</p>
                                </div>

                                <div>
                                    <Label>Academic Period</Label>
                                    <p className="text-sm text-gray-600">{selectedGrade.academic_period.name}</p>
                                </div>

                                <div>
                                    <Label>Section</Label>
                                    <p className="text-sm text-gray-600">{selectedGrade.section}</p>
                                </div>

                                {renderGradeForm(selectedGrade)}

                                <div>
                                    <Label>Remarks</Label>
                                    <Input
                                        value={data.remarks}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                        placeholder="Optional remarks..."
                                        className={errors.remarks ? 'border-red-500' : ''}
                                    />
                                    {errors.remarks && (
                                        <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={processing}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </InstructorLayout>
    );
};

export default EditGrades; 