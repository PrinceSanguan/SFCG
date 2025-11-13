import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Trophy, ArrowLeft, Plus, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface User {
    name: string;
    email: string;
    user_role: string;
}

interface HonorType {
    id: number;
    name: string;
    key: string;
    scope: string;
}

interface HonorCriterion {
    id: number;
    academic_level_id: number;
    honor_type_id: number;
    min_gpa: number | null;
    max_gpa: number | null;
    min_grade: number | null;
    min_grade_all: number | null;
    min_year: number | null;
    max_year: number | null;
    require_consistent_honor: boolean;
    honor_type: HonorType;  // Changed from honorType to honor_type (snake_case)
    honorType?: HonorType;  // Keep as optional for backwards compatibility
}

interface QualifiedStudent {
    student: {
        id: number;
        name: string;
        email: string;
        student_number: string;
        specific_year_level?: string;
        department?: {
            id: number;
            name: string;
            code: string;
        };
        course?: {
            id: number;
            name: string;
            code: string;
        };
        section?: {
            id: number;
            name: string;
            code: string;
        };
    };
    result: {
        qualified: boolean;
        qualifications: Array<{
            honor_type: HonorType;
            criterion: HonorCriterion;
            gpa: number;
            min_grade: number;
            max_grade?: number;
            quarter_averages: number[];
        }>;
        average_grade: number;
        min_grade: number;  // Best grade (lowest number, best performance in 1.0-5.0 scale)
        max_grade?: number;  // Worst grade (highest number, worst performance in 1.0-5.0 scale)
        quarter_averages: number[];
        total_subjects: number;
        total_quarters?: number;  // Number of grading periods with grades
        reason: string;
        // Added optional fields returned by the service for UI breakdowns
        semester_periods?: Record<string, string>;
        semester_groups?: Record<string, { label: string; codes: Record<string, string> }>;
        grades_breakdown?: {
            periods: Array<{ period: string; period_code: string; grade: number | null; count: number }>;
            subjects: Record<string, Record<string, number | null> & { average?: number | null }>;
            semester_summaries?: Record<string, { label: string; average: number | null }>;
        };
    };
}

interface GradeLevel {
    [key: string]: string;
}

interface Department {
    id: number;
    name: string;
    code: string;
}

interface Course {
    id: number;
    name: string;
    code: string;
    department?: Department;
}

interface Section {
    id: number;
    name: string;
    code: string;
    specific_year_level: string;
}

interface HonorResult {
    id: number;
    student_id: number;
    honor_type_id: number;
    school_year: string;
}

interface Filters {
    grade_level?: string;
    department_id?: string;
    course_id?: string;
    section_id?: string;
}

interface Props {
    user: User;
    honorTypes: HonorType[];
    criteria: HonorCriterion[];
    schoolYears: string[];
    qualifiedStudents?: QualifiedStudent[];
    honorResults?: HonorResult[];
    currentSchoolYear?: string;
    gradeLevels?: GradeLevel;
    departments?: Department[];
    courses?: Course[];
    sections?: Section[];
    filters?: Filters;
}

export default function CollegeHonors({ user, honorTypes, criteria, schoolYears, qualifiedStudents = [], honorResults = [], currentSchoolYear = '2024-2025', gradeLevels = {}, departments = [], courses = [], sections = [], filters }: Props) {
    // Debug logging
    console.log('=== COLLEGE HONORS FRONTEND DEBUG ===');
    console.log('Criteria received:', criteria);
    console.log('First criterion:', criteria[0]);
    if (criteria[0]) {
        console.log('First criterion keys:', Object.keys(criteria[0]));
        console.log('honorType property:', criteria[0].honorType);
        console.log('honor_type property (snake_case):', (criteria[0] as any).honor_type);
    }

    // Debug logging for honor results and qualified students
    console.log('[COLLEGE HONORS FRONTEND] Data received:', {
        qualifiedStudentsCount: qualifiedStudents.length,
        honorResultsCount: honorResults.length,
        currentSchoolYear,
        filters,
        qualifiedStudentsPreview: qualifiedStudents.slice(0, 2).map(qs => ({
            student_id: qs.student?.id,
            student_name: qs.student?.name,
            qualifications: qs.result?.qualifications?.map(q => q.honor_type?.name),
        })),
        honorResultsPreview: honorResults.slice(0, 2).map(hr => ({
            id: hr.id,
            student_id: hr.student_id,
            student_name: hr.student?.name,
            honor_type: hr.honor_type?.name || hr.honorType?.name,
            is_approved: hr.is_approved,
        })),
    });

    // CRITICAL LOGGING: Check qualification status for all students
    console.log('[COLLEGE HONORS] === QUALIFICATION STATUS CHECK ===');
    console.log('[COLLEGE HONORS] Total students in qualifiedStudents array:', qualifiedStudents.length);

    const actuallyQualified = qualifiedStudents.filter(qs => qs.result?.qualified === true);
    const notQualified = qualifiedStudents.filter(qs => qs.result?.qualified === false);

    console.log('[COLLEGE HONORS] Actually QUALIFIED students:', actuallyQualified.length);
    console.log('[COLLEGE HONORS] NOT qualified students:', notQualified.length);

    if (notQualified.length > 0) {
        console.warn('[COLLEGE HONORS] ⚠️ WARNING: Found unqualified students in the list!');
        console.log('[COLLEGE HONORS] Unqualified students details:', notQualified.map(qs => ({
            student_id: qs.student?.id,
            student_name: qs.student?.name,
            qualified: qs.result?.qualified,
            reason: qs.result?.reason,
            average_grade: qs.result?.average_grade,
            min_grade: qs.result?.min_grade,
        })));
    }

    console.log('[COLLEGE HONORS] Qualified students details:', actuallyQualified.map(qs => ({
        student_id: qs.student?.id,
        student_name: qs.student?.name,
        qualified: qs.result?.qualified,
        average_grade: qs.result?.average_grade,
        min_grade: qs.result?.min_grade,
        qualifications: qs.result?.qualifications?.map(q => q.honor_type?.name),
    })));

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<QualifiedStudent | null>(null);
    const [showStudentDetails, setShowStudentDetails] = useState(false);
    const [editingCriterion, setEditingCriterion] = useState<HonorCriterion | null>(null);
    const [editForm, setEditForm] = useState({
        min_gpa: '',
        max_gpa: '',
        min_grade: '',
        min_grade_all: '',
        min_year: '',
        max_year: '',
        require_consistent_honor: false,
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const { addToast } = useToast();

    const { data, setData, post, processing, errors, reset } = useForm({
        academic_level_id: '4', // College level ID
        honor_type_id: '',
        school_year: '2024-2025',
        min_gpa: '',
        max_gpa: '',
        min_grade: '',
        min_grade_all: '',
        min_year: '',
        max_year: '',
        require_consistent_honor: false as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/academic/honors/criteria', {
            onSuccess: () => {
                setMessage({ type: 'success', text: 'Criteria saved successfully!' });
                reset();
                setShowAddForm(false);
                window.location.reload();
            },
            onError: () => setMessage({ type: 'error', text: 'Failed to save criteria.' }),
        });
    };

    const startEditing = (criterion: HonorCriterion) => {
        setEditingCriterion(criterion);
        setEditForm({
            min_gpa: criterion.min_gpa?.toString() || '',
            max_gpa: criterion.max_gpa?.toString() || '',
            min_grade: criterion.min_grade?.toString() || '',
            min_grade_all: criterion.min_grade_all?.toString() || '',
            min_year: criterion.min_year?.toString() || '',
            max_year: criterion.max_year?.toString() || '',
            require_consistent_honor: criterion.require_consistent_honor,
        });
    };

    const cancelEditing = () => {
        setEditingCriterion(null);
        setEditForm({
            min_gpa: '',
            max_gpa: '',
            min_grade: '',
            min_grade_all: '',
            min_year: '',
            max_year: '',
            require_consistent_honor: false,
        });
    };

    const handleStudentClick = (student: QualifiedStudent) => {
        setSelectedStudent(student);
        setShowStudentDetails(true);
    };

    const updateCriterion = (criterionId: number) => {
        const updatedCriterion = {
            ...editingCriterion!,
            min_gpa: parseFloat(editForm.min_gpa) || null,
            max_gpa: parseFloat(editForm.max_gpa) || null,
            min_grade: parseFloat(editForm.min_grade) || null,
            min_grade_all: parseFloat(editForm.min_grade_all) || null,
            min_year: parseInt(editForm.min_year) || null,
            max_year: parseInt(editForm.max_year) || null,
            require_consistent_honor: editForm.require_consistent_honor,
        };

        fetch(`/admin/academic/honors/criteria/${criterionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify(updatedCriterion),
        })
            .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
            .then(() => {
                setMessage({ type: 'success', text: 'Criteria updated successfully!' });
                setEditingCriterion(null);
                window.location.reload();
            })
            .catch(() => setMessage({ type: 'error', text: 'Failed to update criteria.' }));
    };

    const deleteCriterion = (criterionId: number) => {
        if (window.confirm('Are you sure you want to delete this criterion?')) {
            fetch(`/admin/academic/honors/criteria/${criterionId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
            })
                .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
                .then(() => {
                    setMessage({ type: 'success', text: 'Criteria deleted successfully!' });
                    window.location.reload();
                })
                .catch(() => setMessage({ type: 'error', text: 'Failed to delete criteria.' }));
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => window.history.back()}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back
                                    </Button>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">College Honor Criteria</h1>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">Manage honor criteria for College level students.</p>
                            </div>
                        </div>

                        {message && (
                            <Alert className={message.type === 'success' ? 'border-green-500' : 'border-red-500'}>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>{message.text}</AlertDescription>
                            </Alert>
                        )}

                        {/* Add New Criteria Button */}
                        <div className="flex justify-end">
                            <Button 
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add New Criteria
                            </Button>
                        </div>

                        {/* Add Criteria Form */}
                        {showAddForm && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5" />
                                        Add Honor Criteria
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="honor_type_id">Honor Type</Label>
                                                {honorTypes && honorTypes.length > 0 ? (
                                                    <Select value={data.honor_type_id || ""} onValueChange={(value) => setData('honor_type_id', value)}>
                                                        <SelectTrigger><SelectValue placeholder="Select honor" /></SelectTrigger>
                                                        <SelectContent>{honorTypes.filter(type => type.id && type.name).map((type) => (<SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>))}</SelectContent>
                                                    </Select>
                                                ) : (<div className="p-2 text-sm text-gray-500 bg-gray-100 rounded border">Loading honor types...</div>)}
                                                {errors.honor_type_id && (<p className="text-sm text-red-500">{errors.honor_type_id}</p>)}
                                            </div>
                                            <div>
                                                <Label htmlFor="school_year">School Year</Label>
                                                <Select value={data.school_year || ""} onValueChange={(value) => setData('school_year', value)}>
                                                    <SelectTrigger><SelectValue placeholder="Select school year" /></SelectTrigger>
                                                    <SelectContent>{(schoolYears?.length ? schoolYears : ['2024-2025']).filter(year => year && year.trim() !== '').map((year) => (<SelectItem key={year} value={year}>{year}</SelectItem>))}</SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="min_gpa">Min GPA (5-1 scale)</Label>
                                                <Input 
                                                    id="min_gpa" 
                                                    type="number" 
                                                    step="0.1" 
                                                    value={data.min_gpa} 
                                                    onChange={(e) => setData('min_gpa', e.target.value)} 
                                                    placeholder="e.g., 3.5 (5=lowest, 1=highest)" 
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="max_gpa">Max GPA (5-1 scale)</Label>
                                                <Input 
                                                    id="max_gpa" 
                                                    type="number" 
                                                    step="0.1" 
                                                    value={data.max_gpa} 
                                                    onChange={(e) => setData('max_gpa', e.target.value)} 
                                                    placeholder="e.g., 1.5 (5=lowest, 1=highest)" 
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="min_grade">Min Grade (any) (5-1 scale)</Label>
                                                <Input 
                                                    id="min_grade" 
                                                    type="number" 
                                                    value={data.min_grade} 
                                                    onChange={(e) => setData('min_grade', e.target.value)} 
                                                    placeholder="e.g., 3 (5=lowest, 1=highest)" 
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="min_grade_all">Min Grade (all) (5-1 scale)</Label>
                                                <Input 
                                                    id="min_grade_all" 
                                                    type="number" 
                                                    value={data.min_grade_all} 
                                                    onChange={(e) => setData('min_grade_all', e.target.value)} 
                                                    placeholder="e.g., 2 (5=lowest, 1=highest)" 
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div><Label htmlFor="min_year">Min Year</Label><Input id="min_year" type="number" value={data.min_year} onChange={(e) => setData('min_year', e.target.value)} placeholder="e.g., 2" /></div>
                                            <div><Label htmlFor="max_year">Max Year</Label><Input id="max_year" type="number" value={data.max_year} onChange={(e) => setData('max_year', e.target.value)} placeholder="e.g., 3" /></div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="require_consistent_honor" checked={!!data.require_consistent_honor} onCheckedChange={(checked) => setData('require_consistent_honor', checked as boolean)} />
                                            <Label htmlFor="require_consistent_honor">Require consistent honor standing</Label>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={processing}>Save Criteria</Button>
                                            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Existing Criteria */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5" />
                                    Existing Criteria ({criteria.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {criteria.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>No honor criteria set for College</p>
                                        <p className="text-sm">Use the "Add New Criteria" button to create criteria for this level.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {criteria.map((criterion) => (
                                            <div key={criterion.id} className="border rounded-lg p-4 bg-white shadow-sm">
                                                {editingCriterion?.id === criterion.id ? (
                                                    // Edit Form
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="font-medium text-lg">{(criterion.honor_type || criterion.honorType)?.name || 'Unknown Honor Type'}</h4>
                                                            <Badge variant="secondary">{(criterion.honor_type || criterion.honorType)?.scope || 'Unknown'}</Badge>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label htmlFor={`edit_min_gpa_${criterion.id}`}>Min GPA (5-1 scale)</Label>
                                                                <Input 
                                                                    id={`edit_min_gpa_${criterion.id}`}
                                                                    type="number" 
                                                                    step="0.1" 
                                                                    value={editForm.min_gpa} 
                                                                    onChange={(e) => setEditForm({...editForm, min_gpa: e.target.value})} 
                                                                    placeholder="e.g., 3.5" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor={`edit_max_gpa_${criterion.id}`}>Max GPA (5-1 scale)</Label>
                                                                <Input 
                                                                    id={`edit_max_gpa_${criterion.id}`}
                                                                    type="number" 
                                                                    step="0.1" 
                                                                    value={editForm.max_gpa} 
                                                                    onChange={(e) => setEditForm({...editForm, max_gpa: e.target.value})} 
                                                                    placeholder="e.g., 1.5" 
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label htmlFor={`edit_min_grade_${criterion.id}`}>Min Grade (any) (5-1 scale)</Label>
                                                                <Input 
                                                                    id={`edit_min_grade_${criterion.id}`}
                                                                    type="number" 
                                                                    value={editForm.min_grade} 
                                                                    onChange={(e) => setEditForm({...editForm, min_grade: e.target.value})} 
                                                                    placeholder="e.g., 3" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor={`edit_min_grade_all_${criterion.id}`}>Min Grade (all) (5-1 scale)</Label>
                                                                <Input 
                                                                    id={`edit_min_grade_all_${criterion.id}`}
                                                                    type="number" 
                                                                    value={editForm.min_grade_all} 
                                                                    onChange={(e) => setEditForm({...editForm, min_grade_all: e.target.value})} 
                                                                    placeholder="e.g., 2" 
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label htmlFor={`edit_min_year_${criterion.id}`}>Min Year</Label>
                                                                <Input 
                                                                    id={`edit_min_year_${criterion.id}`}
                                                                    type="number" 
                                                                    value={editForm.min_year} 
                                                                    onChange={(e) => setEditForm({...editForm, min_year: e.target.value})} 
                                                                    placeholder="e.g., 2" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor={`edit_max_year_${criterion.id}`}>Max Year</Label>
                                                                <Input 
                                                                    id={`edit_max_year_${criterion.id}`}
                                                                    type="number" 
                                                                    value={editForm.max_year} 
                                                                    onChange={(e) => setEditForm({...editForm, max_year: e.target.value})} 
                                                                    placeholder="e.g., 3" 
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox 
                                                                id={`edit_require_consistent_${criterion.id}`}
                                                                checked={editForm.require_consistent_honor} 
                                                                onCheckedChange={(checked) => setEditForm({...editForm, require_consistent_honor: checked as boolean})} 
                                                            />
                                                            <Label htmlFor={`edit_require_consistent_${criterion.id}`}>Require consistent honor standing</Label>
                                                        </div>
                                                        
                                                        <div className="flex gap-2 justify-end">
                                                            <Button variant="outline" size="sm" onClick={cancelEditing}>Cancel</Button>
                                                            <Button size="sm" onClick={() => updateCriterion(criterion.id)}>Update Criteria</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Display Mode
                                                    <>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="font-medium text-lg">{(criterion.honor_type || criterion.honorType)?.name || 'Unknown Honor Type'}</h4>
                                                            <Badge variant="secondary">{(criterion.honor_type || criterion.honorType)?.scope || 'Unknown'}</Badge>
                                                        </div>

                                                        {/* Warning for invalid scale values */}
                                                        {((criterion.min_gpa && (criterion.min_gpa < 1 || criterion.min_gpa > 5)) ||
                                                          (criterion.max_gpa && (criterion.max_gpa < 1 || criterion.max_gpa > 5)) ||
                                                          (criterion.min_grade && (criterion.min_grade < 1 || criterion.min_grade > 5)) ||
                                                          (criterion.min_grade_all && (criterion.min_grade_all < 1 || criterion.min_grade_all > 5))) && (
                                                            <Alert className="mb-3 border-orange-500 bg-orange-50">
                                                                <AlertDescription className="text-orange-700">
                                                                    ⚠️ Warning: College uses 1.0-5.0 grading scale (1=Highest, 5=Lowest). Values outside this range may be incorrect.
                                                                </AlertDescription>
                                                            </Alert>
                                                        )}

                                                        <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                                            <p className="text-xs text-blue-700 font-medium">
                                                                📘 College Grading Scale: 1.0 = Highest | 5.0 = Lowest | Lower values = Better performance
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                            {criterion.min_gpa && (
                                                                <div className={`${criterion.min_gpa < 1 || criterion.min_gpa > 5 ? 'bg-orange-50 border-orange-200' : 'bg-blue-50'} p-2 rounded border`}>
                                                                    <span className="font-medium text-blue-700">Min GPA:</span> {criterion.min_gpa}
                                                                    {criterion.min_gpa < 1 || criterion.min_gpa > 5 ? ' ⚠️' : ''}
                                                                </div>
                                                            )}
                                                            {criterion.max_gpa && (
                                                                <div className={`${criterion.max_gpa < 1 || criterion.max_gpa > 5 ? 'bg-orange-50 border-orange-200' : 'bg-green-50'} p-2 rounded border`}>
                                                                    <span className="font-medium text-green-700">Max GPA:</span> {criterion.max_gpa}
                                                                    {criterion.max_gpa < 1 || criterion.max_gpa > 5 ? ' ⚠️' : ''}
                                                                </div>
                                                            )}
                                                            {criterion.min_grade && (
                                                                <div className={`${criterion.min_grade < 1 || criterion.min_grade > 5 ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50'} p-2 rounded border`}>
                                                                    <span className="font-medium text-yellow-700">Min Grade (any):</span> {criterion.min_grade}
                                                                    {criterion.min_grade < 1 || criterion.min_grade > 5 ? ' ⚠️' : ''}
                                                                </div>
                                                            )}
                                                            {criterion.min_grade_all && (
                                                                <div className={`${criterion.min_grade_all < 1 || criterion.min_grade_all > 5 ? 'bg-orange-50 border-orange-200' : 'bg-purple-50'} p-2 rounded border`}>
                                                                    <span className="font-medium text-purple-700">Min Grade (all):</span> {criterion.min_grade_all}
                                                                    {criterion.min_grade_all < 1 || criterion.min_grade_all > 5 ? ' ⚠️' : ''}
                                                                </div>
                                                            )}
                                                            {criterion.min_year && criterion.max_year && (
                                                                <div className="bg-indigo-50 p-2 rounded">
                                                                    <span className="font-medium text-indigo-700">Years:</span> {criterion.min_year}-{criterion.max_year}
                                                                </div>
                                                            )}
                                                            {criterion.require_consistent_honor && (
                                                                <div className="col-span-2">
                                                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                                        Requires Consistent Honor Standing
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-end mt-4 gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => startEditing(criterion)}>Edit</Button>
                                                            <Button variant="destructive" size="sm" onClick={() => deleteCriterion(criterion.id)}>Delete</Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Qualified Students List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5" />
                                    Qualified College Students ({qualifiedStudents.length})
                                </CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    School Year: {currentSchoolYear} • Click on a student to view detailed grades and honor calculation
                                </p>
                                
                                {/* Filters */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <Label htmlFor="grade_level_filter">Year Level</Label>
                                            <Select 
                                                value={filters?.grade_level || "all"} 
                                                onValueChange={(value) => {
                                                    const url = new URL(window.location.href);
                                                    if (value && value !== "all") {
                                                        url.searchParams.set('grade_level', value);
                                                    } else {
                                                        url.searchParams.delete('grade_level');
                                                    }
                                                    // Clear dependent filters
                                                    url.searchParams.delete('department_id');
                                                    url.searchParams.delete('course_id');
                                                    url.searchParams.delete('section_id');
                                                    window.location.href = url.toString();
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All Year Levels" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Year Levels</SelectItem>
                                                    {gradeLevels && Object.entries(gradeLevels).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="department_filter">Department</Label>
                                            <Select 
                                                value={filters?.department_id || "all"} 
                                                onValueChange={(value) => {
                                                    const url = new URL(window.location.href);
                                                    if (value && value !== "all") {
                                                        url.searchParams.set('department_id', value);
                                                    } else {
                                                        url.searchParams.delete('department_id');
                                                    }
                                                    // Clear dependent filters
                                                    url.searchParams.delete('course_id');
                                                    url.searchParams.delete('section_id');
                                                    window.location.href = url.toString();
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All Departments" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Departments</SelectItem>
                                                    {departments && departments.map((department) => (
                                                        <SelectItem key={department.id} value={department.id.toString()}>
                                                            {department.name} ({department.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="course_filter">Course</Label>
                                            <Select 
                                                value={filters?.course_id || "all"} 
                                                onValueChange={(value) => {
                                                    const url = new URL(window.location.href);
                                                    if (value && value !== "all") {
                                                        url.searchParams.set('course_id', value);
                                                    } else {
                                                        url.searchParams.delete('course_id');
                                                    }
                                                    // Clear dependent filters
                                                    url.searchParams.delete('section_id');
                                                    window.location.href = url.toString();
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All Courses" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Courses</SelectItem>
                                                    {courses && courses.map((course) => (
                                                        <SelectItem key={course.id} value={course.id.toString()}>
                                                            {course.name} ({course.code})
                                                            {course.department && ` - ${course.department.name}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="section_filter">Section</Label>
                                            <Select 
                                                value={filters?.section_id || "all"} 
                                                onValueChange={(value) => {
                                                    const url = new URL(window.location.href);
                                                    if (value && value !== "all") {
                                                        url.searchParams.set('section_id', value);
                                                    } else {
                                                        url.searchParams.delete('section_id');
                                                    }
                                                    window.location.href = url.toString();
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All Sections" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Sections</SelectItem>
                                                    {sections && sections.map((section) => (
                                                        <SelectItem key={section.id} value={section.id.toString()}>
                                                            {section.name} ({section.code})
                                                            {section.specific_year_level && ` - ${section.specific_year_level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => {
                                                const url = new URL(window.location.href);
                                                url.searchParams.delete('grade_level');
                                                url.searchParams.delete('department_id');
                                                url.searchParams.delete('course_id');
                                                url.searchParams.delete('section_id');
                                                window.location.href = url.toString();
                                            }}
                                            className="w-full md:w-auto"
                                        >
                                            Clear All Filters
                                        </Button>
                                    </div>
                                    {(filters?.grade_level || filters?.department_id || filters?.course_id || filters?.section_id) && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-700">
                                                <strong>Active Filters:</strong>
                                                {filters?.grade_level && (
                                                    <span className="ml-2">
                                                        Year Level: <Badge variant="secondary">{gradeLevels?.[filters.grade_level] || filters.grade_level}</Badge>
                                                    </span>
                                                )}
                                                {filters?.department_id && (
                                                    <span className="ml-2">
                                                        Department: <Badge variant="secondary">
                                                            {departments?.find(d => d.id.toString() === filters.department_id)?.name || filters.department_id}
                                                        </Badge>
                                                    </span>
                                                )}
                                                {filters?.course_id && (
                                                    <span className="ml-2">
                                                        Course: <Badge variant="secondary">
                                                            {courses?.find(c => c.id.toString() === filters.course_id)?.name || filters.course_id}
                                                        </Badge>
                                                    </span>
                                                )}
                                                {filters?.section_id && (
                                                    <span className="ml-2">
                                                        Section: <Badge variant="secondary">
                                                            {sections?.find(s => s.id.toString() === filters.section_id)?.name || filters.section_id}
                                                        </Badge>
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {actuallyQualified.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>No qualified students found</p>
                                        <p className="text-sm">Students need to meet honor criteria to appear here.</p>
                                        {notQualified.length > 0 && (
                                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                                                <p className="text-sm font-semibold text-yellow-800 mb-2">
                                                    ⚠️ Note: {notQualified.length} student{notQualified.length !== 1 ? 's' : ''} did not qualify for honors
                                                </p>
                                                <p className="text-xs text-yellow-700">
                                                    Check browser console for details about why students were disqualified.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-4 border-b">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Ready to submit {actuallyQualified.length} student{actuallyQualified.length !== 1 ? 's' : ''} for approval
                                            </h3>
                                            <Button
                                                onClick={() => {
                                                    console.log('[College Submit] Starting submission process...');
                                                    console.log('[College Submit] Actually qualified students count:', actuallyQualified.length);
                                                    console.log('[College Submit] Current school year:', currentSchoolYear);
                                                    console.log('[College Submit] Honor results count:', honorResults.length);

                                                    // Filter out students who already have honor results for this school year
                                                    const studentsToSubmit = actuallyQualified.filter((student: any) => {
                                                        const hasExistingResult = honorResults.some((result: HonorResult) =>
                                                            result.student_id === student.student.id &&
                                                            result.school_year === currentSchoolYear
                                                        );
                                                        return !hasExistingResult;
                                                    });

                                                    const alreadySubmittedCount = actuallyQualified.length - studentsToSubmit.length;

                                                    console.log('[College Submit] Total qualified students:', actuallyQualified.length);
                                                    console.log('[College Submit] Already submitted count:', alreadySubmittedCount);
                                                    console.log('[College Submit] Students to submit count:', studentsToSubmit.length);
                                                    console.log('[College Submit] Student names to submit:', studentsToSubmit.map((s: any) => s.student.name));

                                                    if (alreadySubmittedCount > 0) {
                                                        console.log('[College Submit] Already submitted students:',
                                                            actuallyQualified.filter((student: any) =>
                                                                honorResults.some((result: HonorResult) =>
                                                                    result.student_id === student.student.id &&
                                                                    result.school_year === currentSchoolYear
                                                                )
                                                            ).map((s: any) => s.student.name)
                                                        );
                                                    }

                                                    if (studentsToSubmit.length === 0) {
                                                        console.log('[College Submit] All students already submitted - blocking submission');
                                                        addToast('All qualified students have already been submitted for approval.', 'warning');
                                                        return;
                                                    }

                                                    if (confirm(`Submit ${studentsToSubmit.length} qualified student(s) for chairperson approval?`)) {
                                                        console.log('[College Submit] User confirmed. Sending data...');
                                                        console.log('[College Submit] Submitting students:', studentsToSubmit.map((s: any) => ({ id: s.student.id, name: s.student.name })));

                                                        router.post(route('admin.academic.honors.college.generate-results'), {
                                                            school_year: currentSchoolYear,
                                                        }, {
                                                            onSuccess: (response) => {
                                                                console.log('[College Submit] Success response:', response);
                                                                addToast(`Successfully submitted ${studentsToSubmit.length} student(s) for approval!`, 'success');
                                                            },
                                                            onError: (errors) => {
                                                                console.error('[College Submit] Error response:', errors);
                                                                addToast('Failed to submit students for approval. Please try again.', 'error');
                                                            }
                                                        });
                                                    } else {
                                                        console.log('[College Submit] User cancelled submission');
                                                    }
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <Upload className="h-4 w-4" />
                                                Submit for Approval
                                            </Button>
                                        </div>
                                        <div className="grid gap-4">
                                            {actuallyQualified.map((qualifiedStudent, index) => (
                                                <div 
                                                    key={qualifiedStudent.student.id}
                                                    onClick={() => handleStudentClick(qualifiedStudent)}
                                                    className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                                                    <h4 className="font-semibold text-lg">{qualifiedStudent.student.name}</h4>
                                                                </div>
                                                                <div className="flex gap-2 flex-wrap">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {qualifiedStudent.student.student_number}
                                                                    </Badge>
                                                                    {qualifiedStudent.student.specific_year_level && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            {gradeLevels?.[qualifiedStudent.student.specific_year_level] || qualifiedStudent.student.specific_year_level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                        </Badge>
                                                                    )}
                                                                    {qualifiedStudent.student.department && (
                                                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                                                            {qualifiedStudent.student.department.name}
                                                                        </Badge>
                                                                    )}
                                                                    {qualifiedStudent.student.course && (
                                                                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                                                            {qualifiedStudent.student.course.name}
                                                                        </Badge>
                                                                    )}
                                                                    {qualifiedStudent.student.section && (
                                                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                                                            {qualifiedStudent.student.section.name}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                                <div className="bg-blue-50 p-2 rounded">
                                                                    <span className="font-medium text-blue-700">Average Grade:</span>
                                                                    <div className="text-lg font-bold">{qualifiedStudent.result.average_grade}</div>
                                                                </div>
                                                                <div className="bg-yellow-50 p-2 rounded">
                                                                    <span className="font-medium text-yellow-700">Min Grade:</span>
                                                                    <div className="text-lg font-bold">{qualifiedStudent.result.min_grade}</div>
                                                                </div>
                                                                <div className="bg-green-50 p-2 rounded">
                                                                    <span className="font-medium text-green-700">Total Quarters:</span>
                                                                    <div className="text-lg font-bold">{qualifiedStudent.result.total_quarters ?? 0}</div>
                                                                </div>
                                                                <div className="bg-purple-50 p-2 rounded">
                                                                    <span className="font-medium text-purple-700">Honor:</span>
                                                                    <div className="font-bold">
                                                                        {qualifiedStudent.result.qualifications?.length > 0 ? (
                                                                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                                                                {qualifiedStudent.result.qualifications?.[0]?.honor_type?.name || 'N/A'}
                                                                            </Badge>
                                                                        ) : (
                                                                            <span className="text-gray-500">N/A</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleStudentClick(qualifiedStudent); }}>
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Honor Results Pending Approval */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Results of {honorResults.length} student{honorResults.length !== 1 ? 's' : ''} for approval
                                </CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    School Year: {currentSchoolYear} • Students who have been submitted for chairperson/principal approval
                                </p>
                            </CardHeader>
                            <CardContent>
                                {honorResults.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>No students have been submitted for approval yet</p>
                                        <p className="text-sm">Use the "Submit for Approval" button above to submit qualified students.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid gap-4">
                                            {honorResults.map((result, index) => {
                                                const student = result.student;
                                                const honorType = result.honor_type || result.honorType;
                                                const isApproved = result.is_approved;
                                                const isPending = !result.is_approved && !result.approved_at;

                                                return (
                                                    <div
                                                        key={result.id}
                                                        className={`border rounded-lg p-4 shadow-sm ${
                                                            isApproved ? 'bg-green-50 border-green-200' :
                                                            isPending ? 'bg-yellow-50 border-yellow-200' :
                                                            'bg-gray-50 border-gray-200'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                                                        <h4 className="font-semibold text-lg">{student?.name || 'Unknown Student'}</h4>
                                                                    </div>
                                                                    <div className="flex gap-2 flex-wrap">
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {student?.student_number || 'N/A'}
                                                                        </Badge>
                                                                        {student?.specific_year_level && (
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {gradeLevels?.[student.specific_year_level] || student.specific_year_level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                            </Badge>
                                                                        )}
                                                                        {student?.department && (
                                                                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                                                                {student.department.name}
                                                                            </Badge>
                                                                        )}
                                                                        {student?.course && (
                                                                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                                                                {student.course.name}
                                                                            </Badge>
                                                                        )}
                                                                        {student?.section && (
                                                                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                                                                {student.section.name}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                                    <div className="bg-purple-50 p-2 rounded">
                                                                        <span className="font-medium text-purple-700">Honor Type:</span>
                                                                        <div className="font-bold">
                                                                            {honorType?.name || 'N/A'}
                                                                        </div>
                                                                    </div>
                                                                    <div className={`p-2 rounded ${
                                                                        isApproved ? 'bg-green-100' :
                                                                        isPending ? 'bg-yellow-100' :
                                                                        'bg-gray-100'
                                                                    }`}>
                                                                        <span className={`font-medium ${
                                                                            isApproved ? 'text-green-700' :
                                                                            isPending ? 'text-yellow-700' :
                                                                            'text-gray-700'
                                                                        }`}>Status:</span>
                                                                        <div className="font-bold">
                                                                            {isApproved ? (
                                                                                <Badge className="bg-green-600 text-white">Approved</Badge>
                                                                            ) : isPending ? (
                                                                                <Badge className="bg-yellow-600 text-white">Pending</Badge>
                                                                            ) : (
                                                                                <Badge className="bg-gray-600 text-white">Submitted</Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {result.approved_at && (
                                                                        <div className="bg-blue-50 p-2 rounded">
                                                                            <span className="font-medium text-blue-700">Approved Date:</span>
                                                                            <div className="text-sm">
                                                                                {new Date(result.approved_at).toLocaleDateString()}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {result.created_at && (
                                                                        <div className="bg-gray-100 p-2 rounded">
                                                                            <span className="font-medium text-gray-700">Submitted:</span>
                                                                            <div className="text-sm">
                                                                                {new Date(result.created_at).toLocaleDateString()}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {selectedStudent && showStudentDetails && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                                    <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {selectedStudent.student.name} - Honor Details
                                            </h2>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Student Number: {selectedStudent.student.student_number} |
                                                School Year: {currentSchoolYear}
                                                {selectedStudent.student.specific_year_level && (
                                                    <> | Year Level: {gradeLevels?.[selectedStudent.student.specific_year_level] || selectedStudent.student.specific_year_level.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</>
                                                )}
                                                {selectedStudent.student.course && (
                                                    <> | Course: {selectedStudent.student.course.name} ({selectedStudent.student.course.code})</>
                                                )}
                                                {selectedStudent.student.section && (
                                                    <> | Section: {selectedStudent.student.section.name} ({selectedStudent.student.section.code})</>
                                                )}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => { setShowStudentDetails(false); setSelectedStudent(null); }}
                                        >
                                            Close
                                        </Button>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Trophy className="h-5 w-5" />
                                                    Honor Qualification Summary
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="bg-blue-50 p-4 rounded-lg">
                                                        <div className="text-sm font-medium text-blue-700">Average Grade</div>
                                                        <div className="text-2xl font-bold text-blue-900">{selectedStudent.result.average_grade}</div>
                                                    </div>
                                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                                        <div className="text-sm font-medium text-yellow-700">Min Grade</div>
                                                        <div className="text-2xl font-bold text-yellow-900">{selectedStudent.result.min_grade}</div>
                                                    </div>
                                                    <div className="bg-green-50 p-4 rounded-lg">
                                                        <div className="text-sm font-medium text-green-700">Total Quarters</div>
                                                        <div className="text-2xl font-bold text-green-900">{selectedStudent.result.total_quarters ?? 0}</div>
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <div className="text-sm font-medium text-purple-700">Honor</div>
                                                    <div className="mt-1">
                                                        {selectedStudent.result.qualifications?.length > 0 ? (
                                                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                                                {selectedStudent.result.qualifications?.[0]?.honor_type?.name || 'N/A'}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-gray-500">N/A</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* First Semester Grades Table */}
                                        {selectedStudent.result.grades_breakdown?.subjects && Object.keys(selectedStudent.result.grades_breakdown.subjects).length > 0 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>First Semester Grades</CardTitle>
                                                    {selectedStudent.result.grades_breakdown?.semester_summaries?.first_semester && (
                                                        <div className="text-2xl font-bold text-green-700 mt-2">
                                                            Semester Average: {selectedStudent.result.grades_breakdown.semester_summaries.first_semester.average ?? '—'}
                                                        </div>
                                                    )}
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border-collapse border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="border border-gray-300 p-3 text-left">Subject</th>
                                                                    <th className="border border-gray-300 p-3 text-center">Midterm</th>
                                                                    <th className="border border-gray-300 p-3 text-center">Pre-Final</th>
                                                                    <th className="border border-gray-300 p-3 text-center">Average</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {Object.entries(selectedStudent.result.grades_breakdown.subjects).map(([subjectName, subjectData]) => {
                                                                    const fMt = subjectData?.['COL_S1_MT'] ?? '—';
                                                                    const fPf = subjectData?.['COL_S1_PF'] ?? '—';
                                                                    const firstSemValues = [subjectData?.['COL_S1_MT'], subjectData?.['COL_S1_PF']].filter((v) => typeof v === 'number') as number[];
                                                                    const firstAvg = firstSemValues.length ? (firstSemValues.reduce((a: number,b: number)=>a+b,0)/firstSemValues.length).toFixed(2) : '—';

                                                                    return (
                                                                        <tr key={subjectName}>
                                                                            <td className="border border-gray-300 p-3 font-medium">{subjectName}</td>
                                                                            <td className="border border-gray-300 p-3 text-center">{fMt}</td>
                                                                            <td className="border border-gray-300 p-3 text-center">{fPf}</td>
                                                                            <td className="border border-gray-300 p-3 text-center font-bold text-blue-600">{firstAvg}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Second Semester Grades Table */}
                                        {selectedStudent.result.grades_breakdown?.subjects && Object.keys(selectedStudent.result.grades_breakdown.subjects).length > 0 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Second Semester Grades</CardTitle>
                                                    {selectedStudent.result.grades_breakdown?.semester_summaries?.second_semester && (
                                                        <div className="text-2xl font-bold text-green-700 mt-2">
                                                            Semester Average: {selectedStudent.result.grades_breakdown.semester_summaries.second_semester.average ?? '—'}
                                                        </div>
                                                    )}
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border-collapse border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="border border-gray-300 p-3 text-left">Subject</th>
                                                                    <th className="border border-gray-300 p-3 text-center">Midterm</th>
                                                                    <th className="border border-gray-300 p-3 text-center">Pre-Final</th>
                                                                    <th className="border border-gray-300 p-3 text-center">Average</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {Object.entries(selectedStudent.result.grades_breakdown.subjects).map(([subjectName, subjectData]) => {
                                                                    const sMt = subjectData?.['COL_S2_MT'] ?? '—';
                                                                    const sPf = subjectData?.['COL_S2_PF'] ?? '—';
                                                                    const secondSemValues = [subjectData?.['COL_S2_MT'], subjectData?.['COL_S2_PF']].filter((v) => typeof v === 'number') as number[];
                                                                    const secondAvg = secondSemValues.length ? (secondSemValues.reduce((a: number,b: number)=>a+b,0)/secondSemValues.length).toFixed(2) : '—';

                                                                    return (
                                                                        <tr key={subjectName}>
                                                                            <td className="border border-gray-300 p-3 font-medium">{subjectName}</td>
                                                                            <td className="border border-gray-300 p-3 text-center">{sMt}</td>
                                                                            <td className="border border-gray-300 p-3 text-center">{sPf}</td>
                                                                            <td className="border border-gray-300 p-3 text-center font-bold text-blue-600">{secondAvg}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Reasons/Notes if not qualified */}
                                        {!selectedStudent.result.qualified && selectedStudent.result.reason && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Reason</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-sm text-gray-700">{selectedStudent.result.reason}</div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
