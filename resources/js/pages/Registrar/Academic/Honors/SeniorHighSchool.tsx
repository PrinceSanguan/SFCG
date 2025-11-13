import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle, Trophy, ArrowLeft, Plus, Upload, X } from 'lucide-react';
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
    honor_type?: HonorType;  // Laravel sends snake_case
    honorType?: HonorType;   // Keep both for compatibility
}

interface QualifiedStudent {
    student: {
        id: number;
        name: string;
        email: string;
        student_number: string;
        specific_year_level?: string;
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
        min_grade: number;
        max_grade?: number;
        quarter_averages: number[];
        total_subjects: number;
        reason: string;
        failed_grades?: Array<{
            subject: string;
            period: string;
            grade: number;
        }>;
        grades_breakdown?: {
            periods?: Array<{
                period: string;
                period_code: string;
                grade: number;
                count: number;
            }>;
            subjects?: {
                [subjectName: string]: {
                    [periodCode: string]: number | null;
                    average: number;
                };
            };
            semester_summaries?: {
                [semesterKey: string]: {
                    label: string;
                    average: number | null;
                };
            };
        };
    };
}

interface GradeLevel {
    [key: string]: string;
}

interface Section {
    id: number;
    name: string;
    code: string;
    specific_year_level: string;
}

interface Strand {
    id: number;
    name: string;
    code?: string;
}

interface HonorResult {
    id: number;
    student_id: number;
    honor_type_id: number;
    school_year: string;
}

interface Filters {
    grade_level?: string;
    section_id?: string;
    strand_id?: string;
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
    sections?: Section[];
    strands?: Strand[];
    filters?: Filters;
}

export default function SeniorHighSchoolHonors({ user, honorTypes, criteria, schoolYears, qualifiedStudents = [], honorResults = [], currentSchoolYear = '2024-2025', gradeLevels = {}, sections = [], strands = [], filters }: Props) {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
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
    const [selectedStudent, setSelectedStudent] = useState<QualifiedStudent | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const { addToast } = useToast();

    const { data, setData, post, processing, errors, reset } = useForm({
        academic_level_id: '3', // Senior High School level ID
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

    // Derive an honor name when API has no qualifications: pick the highest matching criteria by min_gpa/max_gpa
    const deriveHonorFromAverage = (avg?: number): string | null => {
        if (typeof avg !== 'number' || !criteria || criteria.length === 0) return null;
        // Only consider criteria that have an honorType and threshold
        const sorted = [...criteria]
            .filter(c => c.honorType && (c.min_gpa !== null || c.max_gpa !== null))
            .sort((a, b) => (b.min_gpa ?? 0) - (a.min_gpa ?? 0));
        for (const c of sorted) {
            const minOk = (c.min_gpa === null) || (avg >= (c.min_gpa as number));
            const maxOk = (c.max_gpa === null) || (avg <= (c.max_gpa as number));
            if (minOk && maxOk) {
                return c.honorType?.name || null;
            }
        }
        return null;
    };

    const getHonorTypeName = (criterion: HonorCriterion): string => {
        return (
            criterion?.honor_type?.name ||
            criterion?.honorType?.name ||
            honorTypes?.find((t) => t.id === criterion?.honor_type_id)?.name ||
            'Unknown Honor Type'
        );
    };

    const getHonorTypeScope = (criterion: HonorCriterion): string => {
        return (
            criterion?.honor_type?.scope ||
            criterion?.honorType?.scope ||
            honorTypes?.find((t) => t.id === criterion?.honor_type_id)?.scope ||
            'Unknown'
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/registrar/academic/honors/criteria', {
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

        fetch(`/registrar/academic/honors/criteria/${criterionId}`, {
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
            fetch(`/registrar/academic/honors/criteria/${criterionId}`, {
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
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Senior High School Honor Criteria</h1>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">Manage honor criteria for Senior High School level students.</p>
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
                                                <Label htmlFor="min_gpa">Min GPA</Label>
                                                <Input 
                                                    id="min_gpa" 
                                                    type="number" 
                                                    step="0.01" 
                                                    value={data.min_gpa} 
                                                    onChange={(e) => setData('min_gpa', e.target.value)} 
                                                    placeholder="e.g., 90.0" 
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="max_gpa">Max GPA</Label>
                                                <Input 
                                                    id="max_gpa" 
                                                    type="number" 
                                                    step="0.01" 
                                                    value={data.max_gpa} 
                                                    onChange={(e) => setData('max_gpa', e.target.value)} 
                                                    placeholder="e.g., 97.0" 
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="min_grade">Min Grade (any)</Label>
                                                <Input 
                                                    id="min_grade" 
                                                    type="number" 
                                                    value={data.min_grade} 
                                                    onChange={(e) => setData('min_grade', e.target.value)} 
                                                    placeholder="e.g., 90" 
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="min_grade_all">Min Grade (all)</Label>
                                                <Input 
                                                    id="min_grade_all" 
                                                    type="number" 
                                                    value={data.min_grade_all} 
                                                    onChange={(e) => setData('min_grade_all', e.target.value)} 
                                                    placeholder="e.g., 93" 
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
                                        <p>No honor criteria set for Senior High School</p>
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
                                                            <h4 className="font-medium text-lg">{getHonorTypeName(criterion)}</h4>
                                                            <Badge variant="secondary">{getHonorTypeScope(criterion)}</Badge>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label htmlFor={`edit_min_gpa_${criterion.id}`}>Min GPA</Label>
                                                                <Input 
                                                                    id={`edit_min_gpa_${criterion.id}`}
                                                                    type="number" 
                                                                    step="0.01" 
                                                                    value={editForm.min_gpa} 
                                                                    onChange={(e) => setEditForm({...editForm, min_gpa: e.target.value})} 
                                                                    placeholder="e.g., 90.0" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor={`edit_max_gpa_${criterion.id}`}>Max GPA</Label>
                                                                <Input 
                                                                    id={`edit_max_gpa_${criterion.id}`}
                                                                    type="number" 
                                                                    step="0.01" 
                                                                    value={editForm.max_gpa} 
                                                                    onChange={(e) => setEditForm({...editForm, max_gpa: e.target.value})} 
                                                                    placeholder="e.g., 97.0" 
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label htmlFor={`edit_min_grade_${criterion.id}`}>Min Grade (any)</Label>
                                                                <Input 
                                                                    id={`edit_min_grade_${criterion.id}`}
                                                                    type="number" 
                                                                    value={editForm.min_grade} 
                                                                    onChange={(e) => setEditForm({...editForm, min_grade: e.target.value})} 
                                                                    placeholder="e.g., 90" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor={`edit_min_grade_all_${criterion.id}`}>Min Grade (all)</Label>
                                                                <Input 
                                                                    id={`edit_min_grade_all_${criterion.id}`}
                                                                    type="number" 
                                                                    value={editForm.min_grade_all} 
                                                                    onChange={(e) => setEditForm({...editForm, min_grade_all: e.target.value})} 
                                                                    placeholder="e.g., 93" 
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
                                                            <h4 className="font-medium text-lg">{getHonorTypeName(criterion)}</h4>
                                                            <Badge variant="secondary">{getHonorTypeScope(criterion)}</Badge>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                            {criterion.min_gpa && (
                                                                <div className="bg-blue-50 p-2 rounded">
                                                                    <span className="font-medium text-blue-700">Min GPA:</span> {criterion.min_gpa}
                                                                </div>
                                                            )}
                                                            {criterion.max_gpa && (
                                                                <div className="bg-green-50 p-2 rounded">
                                                                    <span className="font-medium text-green-700">Max GPA:</span> {criterion.max_gpa}
                                                                </div>
                                                            )}
                                                            {criterion.min_grade && (
                                                                <div className="bg-yellow-50 p-2 rounded">
                                                                    <span className="font-medium text-yellow-700">Min Grade:</span> {criterion.min_grade}
                                                                </div>
                                                            )}
                                                            {criterion.min_grade_all && (
                                                                <div className="bg-purple-50 p-2 rounded">
                                                                    <span className="font-medium text-purple-700">Min Grade (All):</span> {criterion.min_grade_all}
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
                                    Qualified Senior High School Students ({qualifiedStudents.length})
                                </CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    School Year: {currentSchoolYear} • Click on a student to view detailed grades and honor calculation
                                </p>
                                
                                {/* Filters */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <Label htmlFor="grade_level_filter">Grade Level</Label>
                                            <Select 
                                                value={filters?.grade_level || "all"} 
                                                onValueChange={(value) => {
                                                    const url = new URL(window.location.href);
                                                    if (value && value !== "all") {
                                                        url.searchParams.set('grade_level', value);
                                                    } else {
                                                        url.searchParams.delete('grade_level');
                                                    }
                                                    window.location.href = url.toString();
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All Grade Levels" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Grade Levels</SelectItem>
                                                    {gradeLevels && Object.entries(gradeLevels).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="strand_filter">Strand</Label>
                                            <Select 
                                                value={filters?.strand_id || "all"} 
                                                onValueChange={(value) => {
                                                    const url = new URL(window.location.href);
                                                    if (value && value !== "all") {
                                                        url.searchParams.set('strand_id', value);
                                                    } else {
                                                        url.searchParams.delete('strand_id');
                                                    }
                                                    // Changing strand typically changes available sections
                                                    window.location.href = url.toString();
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All Strands" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Strands</SelectItem>
                                                    {strands && strands.map((strand) => (
                                                        <SelectItem key={strand.id} value={strand.id.toString()}>
                                                            {strand.name}
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
                                                            {section.specific_year_level && ` - ${section.specific_year_level.replace('grade_', 'Grade ')}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-end">
                                            <Button 
                                                variant="outline" 
                                                onClick={() => {
                                                    const url = new URL(window.location.href);
                                                    url.searchParams.delete('grade_level');
                                                    url.searchParams.delete('strand_id');
                                                    url.searchParams.delete('section_id');
                                                    window.location.href = url.toString();
                                                }}
                                                className="w-full"
                                            >
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </div>
                                    {(filters?.grade_level || filters?.section_id || filters?.strand_id) && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-700">
                                                <strong>Active Filters:</strong>
                                                {filters?.grade_level && (
                                                    <span className="ml-2">
                                                        Grade Level: <Badge variant="secondary">{gradeLevels?.[filters.grade_level] || filters.grade_level}</Badge>
                                                    </span>
                                                )}
                                                {filters?.strand_id && (
                                                    <span className="ml-2">
                                                        Strand: <Badge variant="secondary">{strands?.find(s => s.id.toString() === filters.strand_id)?.name || filters.strand_id}</Badge>
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
                                {qualifiedStudents.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>No qualified students found</p>
                                        <p className="text-sm">Students need to meet honor criteria to appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-4 border-b">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Ready to submit {qualifiedStudents.length} student{qualifiedStudents.length !== 1 ? 's' : ''} for approval
                                            </h3>
                                            <Button
                                                onClick={() => {
                                                    // Check if any qualified student already has an honor result
                                                    const alreadySubmitted = qualifiedStudents.some((student: any) =>
                                                        honorResults.some((result: HonorResult) =>
                                                            result.student_id === student.student.id &&
                                                            result.school_year === currentSchoolYear
                                                        )
                                                    );

                                                    if (alreadySubmitted) {
                                                        addToast('Some students have already been submitted for approval.', 'warning');
                                                        return;
                                                    }

                                                    if (confirm(`Submit ${qualifiedStudents.length} qualified student(s) for principal approval?`)) {
                                                        router.post(route('registrar.academic.honors.senior-high-school.generate-results'), {
                                                            school_year: currentSchoolYear,
                                                        }, {
                                                            onSuccess: () => {
                                                                addToast(`Successfully submitted ${qualifiedStudents.length} student(s) for approval!`, 'success');
                                                            },
                                                            onError: () => {
                                                                addToast('Failed to submit students for approval. Please try again.', 'error');
                                                            }
                                                        });
                                                    }
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <Upload className="h-4 w-4" />
                                                Submit for Approval
                                            </Button>
                                        </div>
                                        <div className="grid gap-4">
                                            {qualifiedStudents.map((qualifiedStudent, index) => (
                                                <div 
                                                    key={qualifiedStudent.student.id}
                                                    className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                                                    <h4 className="font-semibold text-lg">{qualifiedStudent.student.name}</h4>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {qualifiedStudent.student.student_number}
                                                                    </Badge>
                                                                    {qualifiedStudent.student.specific_year_level && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            {gradeLevels?.[qualifiedStudent.student.specific_year_level] || qualifiedStudent.student.specific_year_level.replace('grade_', 'Grade ')}
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
                                                                    <div className="text-lg font-bold">{qualifiedStudent.result.quarter_averages?.length ?? qualifiedStudent.result.grades_breakdown?.periods?.length ?? 0}</div>
                                                                </div>
                                                                <div className="bg-purple-50 p-2 rounded">
                                                                    <span className="font-medium text-purple-700">Honor:</span>
                                                                    <div className="font-bold">
                                                                        {(() => {
                                                                            // First try to get from qualifications
                                                                            if (qualifiedStudent.result?.qualifications?.length > 0) {
                                                                                const honorName = qualifiedStudent.result.qualifications[0]?.honor_type?.name;
                                                                                if (honorName) {
                                                                                    return (
                                                                                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                                                                            {honorName}
                                                                                        </Badge>
                                                                                    );
                                                                                }
                                                                            }

                                                                            // Fallback to deriving from average
                                                                            const derived = deriveHonorFromAverage(qualifiedStudent.result?.average_grade);
                                                                            if (derived) {
                                                                                return (
                                                                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                                                                        {derived}
                                                                                    </Badge>
                                                                                );
                                                                            }

                                                                            // If still no honor, show computing message if student is qualified
                                                                            if (qualifiedStudent.result?.qualified) {
                                                                                return (
                                                                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                                                        Computing...
                                                                                    </Badge>
                                                                                );
                                                                            }

                                                                            return <span className="text-gray-500">N/A</span>;
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedStudent(qualifiedStudent);
                                                                    setShowDetailsModal(true);
                                                                }}
                                                            >
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
                    </div>
                </main>
            </div>

            {/* Student Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-purple-600" />
                            Student Honor Details
                        </DialogTitle>
                        <DialogDescription>
                            Detailed grade breakdown and honor calculation
                        </DialogDescription>
                    </DialogHeader>

                    {selectedStudent && (
                        <div className="space-y-6">
                            {/* Student Information */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                                <h3 className="font-semibold text-lg mb-3 text-gray-900">Student Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Name:</span>
                                        <p className="font-semibold text-gray-900">{selectedStudent.student.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Student Number:</span>
                                        <p className="font-semibold text-gray-900">{selectedStudent.student.student_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Grade Level:</span>
                                        <p className="font-semibold text-gray-900">
                                            {gradeLevels?.[selectedStudent.student.specific_year_level || ''] || selectedStudent.student.specific_year_level?.replace('grade_', 'Grade ') || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Section:</span>
                                        <p className="font-semibold text-gray-900">{selectedStudent.student.section?.name || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Honor Achievement */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                                <h3 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-purple-600" />
                                    Honor Achievement
                                </h3>
                                <div className="space-y-2">
                                    {selectedStudent.result?.qualifications?.length > 0 ? (
                                        // Show only the highest honor (last in the qualifications array)
                                        (() => {
                                            const highestHonor = selectedStudent.result.qualifications[selectedStudent.result.qualifications.length - 1];
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                    <Badge className="bg-purple-600 text-white text-base py-1 px-3">
                                                        {highestHonor.honor_type?.name || 'Unknown Honor'}
                                                    </Badge>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <p className="text-gray-600">
                                            {deriveHonorFromAverage(selectedStudent.result?.average_grade) || 'No honor qualification found'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Grade Summary */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h3 className="font-semibold text-lg mb-3 text-gray-900">Grade Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <span className="text-sm text-blue-700 font-medium">Average Grade</span>
                                        <p className="text-2xl font-bold text-blue-900">
                                            {selectedStudent.result?.average_grade?.toFixed(2) || 'N/A'}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">1.0 is highest</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                        <span className="text-sm text-green-700 font-medium">Best Grade</span>
                                        <p className="text-2xl font-bold text-green-900">
                                            {selectedStudent.result?.min_grade?.toFixed(2) || 'N/A'}
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">Lowest number</p>
                                    </div>
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                        <span className="text-sm text-yellow-700 font-medium">Worst Grade</span>
                                        <p className="text-2xl font-bold text-yellow-900">
                                            {selectedStudent.result?.max_grade?.toFixed(2) || 'N/A'}
                                        </p>
                                        <p className="text-xs text-yellow-600 mt-1">Highest number</p>
                                    </div>
                                </div>
                            </div>

                            {/* Semester Tables */}
                            {selectedStudent.result?.grades_breakdown?.subjects && Object.keys(selectedStudent.result.grades_breakdown.subjects).length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="font-semibold text-xl mb-4 text-gray-900">Grade Breakdown by Semester</h3>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* First Semester Table */}
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                                                <h4 className="font-bold text-lg text-white flex items-center gap-2">
                                                    <Trophy className="h-5 w-5" />
                                                    First Semester
                                                </h4>
                                                {selectedStudent.result.grades_breakdown.semester_summaries?.first_semester && (
                                                    <p className="text-blue-100 text-sm mt-1">
                                                        Average: <span className="font-bold text-white">
                                                            {selectedStudent.result.grades_breakdown.semester_summaries.first_semester.average?.toFixed(2) || 'N/A'}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50 border-b border-gray-200">
                                                        <tr>
                                                            <th className="text-left p-3 font-semibold text-gray-700">Subject</th>
                                                            <th className="text-center p-3 font-semibold text-gray-700">Midterm</th>
                                                            <th className="text-center p-3 font-semibold text-gray-700">Pre-Final</th>
                                                            <th className="text-center p-3 font-semibold text-gray-700 bg-blue-50">Average</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(selectedStudent.result.grades_breakdown.subjects).map(([subjectName, grades]: [string, any], idx) => {
                                                            // Get first semester grades - check multiple possible keys
                                                            const midterm = grades['SHS_S1_MT'] || grades['m1'] || grades['Q1'] || null;
                                                            const prefinal = grades['SHS_S1_PF'] || grades['Pre-final'] || grades['Q2'] || null;

                                                            // Only show if there are first semester grades
                                                            if (midterm === null && prefinal === null) return null;

                                                            return (
                                                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                    <td className="p-3 font-medium text-gray-900">{subjectName}</td>
                                                                    <td className="p-3 text-center text-gray-700">
                                                                        {midterm !== null ? midterm.toFixed(2) : '-'}
                                                                    </td>
                                                                    <td className="p-3 text-center text-gray-700">
                                                                        {prefinal !== null ? prefinal.toFixed(2) : '-'}
                                                                    </td>
                                                                    <td className="p-3 text-center font-bold text-blue-900 bg-blue-50">
                                                                        {midterm !== null && prefinal !== null
                                                                            ? ((midterm + prefinal) / 2).toFixed(2)
                                                                            : midterm !== null ? midterm.toFixed(2)
                                                                            : prefinal !== null ? prefinal.toFixed(2)
                                                                            : '-'
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Second Semester Table */}
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
                                                <h4 className="font-bold text-lg text-white flex items-center gap-2">
                                                    <Trophy className="h-5 w-5" />
                                                    Second Semester
                                                </h4>
                                                {selectedStudent.result.grades_breakdown.semester_summaries?.second_semester && (
                                                    <p className="text-purple-100 text-sm mt-1">
                                                        Average: <span className="font-bold text-white">
                                                            {selectedStudent.result.grades_breakdown.semester_summaries.second_semester.average?.toFixed(2) || 'N/A'}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50 border-b border-gray-200">
                                                        <tr>
                                                            <th className="text-left p-3 font-semibold text-gray-700">Subject</th>
                                                            <th className="text-center p-3 font-semibold text-gray-700">Midterm</th>
                                                            <th className="text-center p-3 font-semibold text-gray-700">Pre-Final</th>
                                                            <th className="text-center p-3 font-semibold text-gray-700 bg-purple-50">Average</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(selectedStudent.result.grades_breakdown.subjects).map(([subjectName, grades]: [string, any], idx) => {
                                                            // Get second semester grades - check multiple possible keys
                                                            const midterm = grades['SHS_S2_MT'] || grades['m2'] || grades['Q3'] || null;
                                                            const prefinal = grades['SHS_S2_PF'] || grades['pre-final2'] || grades['Q4'] || null;

                                                            // Only show if there are second semester grades
                                                            if (midterm === null && prefinal === null) return null;

                                                            return (
                                                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                    <td className="p-3 font-medium text-gray-900">{subjectName}</td>
                                                                    <td className="p-3 text-center text-gray-700">
                                                                        {midterm !== null ? midterm.toFixed(2) : '-'}
                                                                    </td>
                                                                    <td className="p-3 text-center text-gray-700">
                                                                        {prefinal !== null ? prefinal.toFixed(2) : '-'}
                                                                    </td>
                                                                    <td className="p-3 text-center font-bold text-purple-900 bg-purple-50">
                                                                        {midterm !== null && prefinal !== null
                                                                            ? ((midterm + prefinal) / 2).toFixed(2)
                                                                            : midterm !== null ? midterm.toFixed(2)
                                                                            : prefinal !== null ? prefinal.toFixed(2)
                                                                            : '-'
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overall Summary */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-lg text-green-900">Overall Academic Performance</h4>
                                                <p className="text-sm text-green-700 mt-1">Combined average across all semesters</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-4xl font-bold text-green-900">
                                                    {selectedStudent.result?.average_grade?.toFixed(2) || 'N/A'}
                                                </p>
                                                <p className="text-sm text-green-600 mt-1">Final GPA (1.0 is highest)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Qualification Status with Failed Grades */}
                            {!selectedStudent.result?.qualified && selectedStudent.result?.failed_grades && selectedStudent.result.failed_grades.length > 0 ? (
                                <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                                    <h3 className="font-semibold text-lg text-red-900 mb-3 flex items-center gap-2">
                                        <X className="h-5 w-5" />
                                        Disqualification Details
                                    </h3>
                                    <p className="text-sm text-red-800 mb-4">
                                        <strong>Reason:</strong> {selectedStudent.result.reason}
                                    </p>

                                    <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-red-100 border-b border-red-200">
                                                <tr>
                                                    <th className="text-left p-3 font-semibold text-red-900">Subject</th>
                                                    <th className="text-left p-3 font-semibold text-red-900">Period</th>
                                                    <th className="text-center p-3 font-semibold text-red-900">Grade</th>
                                                    <th className="text-center p-3 font-semibold text-red-900">Required</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedStudent.result.failed_grades.map((failedGrade, idx) => (
                                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
                                                        <td className="p-3 font-medium text-gray-900">{failedGrade.subject}</td>
                                                        <td className="p-3 text-gray-700">{failedGrade.period}</td>
                                                        <td className="p-3 text-center">
                                                            <Badge variant="destructive" className="font-bold">
                                                                {failedGrade.grade.toFixed(2)}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3 text-center text-gray-600">≥ 85</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded">
                                        <p className="text-sm text-yellow-800">
                                            💡 <strong>Note:</strong> To qualify for honors, ALL grades must be 85 or above,
                                            even if the period average meets the honor threshold (90+).
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Qualification Status</h3>
                                    <p className="text-sm text-gray-900">{selectedStudent.result?.reason || 'N/A'}</p>
                                </div>
                            )}

                            {/* Close Button */}
                            <div className="flex justify-end">
                                <Button onClick={() => setShowDetailsModal(false)} variant="outline">
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
