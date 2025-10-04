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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { CheckCircle, Trophy, ArrowLeft, Plus, Upload } from 'lucide-react';

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
    honorType: HonorType;
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
            quarter_averages: number[];
        }>;
        average_grade: number;
        min_grade: number;
        quarter_averages: number[];
        total_subjects: number;
        reason: string;
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

interface HonorResult {
    id: number;
    student_id: number;
    honor_type_id: number;
    academic_level_id: number;
    gpa: number;
    school_year: string;
    is_approved: boolean;
    is_pending_approval: boolean;
    is_rejected: boolean;
    student: {
        id: number;
        name: string;
        student_number: string;
        email: string;
        specific_year_level?: string;
        section?: {
            id: number;
            name: string;
            code: string;
        };
    };
    honorType: {
        id: number;
        name: string;
        key: string;
        scope: string;
    };
    academicLevel: {
        id: number;
        name: string;
        key: string;
    };
    approvedBy?: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface Filters {
    grade_level?: string;
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
    sections?: Section[];
    filters?: Filters;
}

export default function JuniorHighSchoolHonors({ user, honorTypes, criteria, schoolYears, qualifiedStudents, honorResults, currentSchoolYear = '2024-2025', gradeLevels = {}, sections = [], filters }: Props) {
    // Fallback for undefined props
    const safeQualifiedStudents = qualifiedStudents || [];
    const safeHonorResults = honorResults || [];
    const safeCurrentSchoolYear = currentSchoolYear || '2024-2025';
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Toast hook
    const { addToast } = useToast();

    // Modal state for View Details
    const [selectedStudent, setSelectedStudent] = useState<QualifiedStudent | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

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

    const { data, setData, post, processing, errors, reset } = useForm({
        academic_level_id: '2', // Junior High School level ID
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

    // Helper functions for better data handling
    const getHonorTypeName = (criterion: HonorCriterion): string => {
        // Try snake_case first (Laravel serialization)
        if (criterion?.honor_type?.name) {
            return criterion.honor_type.name;
        }
        // Fallback to camelCase
        if (criterion?.honorType?.name) {
            return criterion.honorType.name;
        }
        // Last resort: lookup from honorTypes array
        const honorType = honorTypes.find(t => t.id === criterion.honor_type_id);
        return honorType?.name || 'Unknown Honor Type';
    };

    const getHonorTypeScope = (criterion: HonorCriterion): string => {
        // Try snake_case first (Laravel serialization)
        if (criterion?.honor_type?.scope) {
            return criterion.honor_type.scope;
        }
        // Fallback to camelCase
        if (criterion?.honorType?.scope) {
            return criterion.honorType.scope;
        }
        // Last resort: lookup from honorTypes array
        const honorType = honorTypes.find(t => t.id === criterion.honor_type_id);
        return honorType?.scope || 'Unknown';
    };

    // Helper functions for honor results (different from criteria)
    const getHonorResultTypeName = (honorResult: any): string => {
        // Try snake_case first (Laravel serialization)
        if (honorResult?.honor_type?.name) {
            return honorResult.honor_type.name;
        }
        // Fallback to camelCase
        if (honorResult?.honorType?.name) {
            return honorResult.honorType.name;
        }
        // Last resort: lookup from honorTypes array
        const honorType = honorTypes.find(t => t.id === honorResult.honor_type_id);
        return honorType?.name || 'Unknown Honor Type';
    };

    const getStudentSectionName = (student: any): string => {
        // Try snake_case first (Laravel serialization)
        if (student?.section?.name) {
            return student.section.name;
        }
        // Fallback to camelCase
        if (student?.sectionName) {
            return student.sectionName;
        }
        return 'No Section';
    };

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
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Junior High School Honor Criteria</h1>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">Manage honor criteria for Junior High School level students.</p>
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
                                        <p>No honor criteria set for Junior High School</p>
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
                                    Junior High School Honor Results ({safeHonorResults.length}) | Qualified Students ({safeQualifiedStudents.length})
                                </CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    School Year: {currentSchoolYear} • Click on a student to view detailed grades and honor calculation
                                </p>
                                
                                {/* Filters */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                    <SelectItem value="no_section">No Section</SelectItem>
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
                                                    url.searchParams.delete('section_id');
                                                    window.location.href = url.toString();
                                                }}
                                                className="w-full"
                                            >
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </div>
                                    {(filters?.grade_level || filters?.section_id) && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-700">
                                                <strong>Active Filters:</strong>
                                                {filters?.grade_level && (
                                                    <span className="ml-2">
                                                        Grade Level: <Badge variant="secondary">{gradeLevels?.[filters.grade_level] || filters.grade_level}</Badge>
                                                    </span>
                                                )}
                                                {filters?.section_id && (
                                                    <span className="ml-2">
                                                        Section: <Badge variant="secondary">
                                                            {filters.section_id === 'no_section'
                                                                ? 'No Section'
                                                                : sections?.find(s => s.id.toString() === filters.section_id)?.name || filters.section_id}
                                                        </Badge>
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {safeHonorResults.length === 0 && safeQualifiedStudents.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>No honor results or qualified students found</p>
                                        <p className="text-sm">Students need to meet honor criteria and have approved honors to appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Honor Results Section */}
                                        {safeHonorResults.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                                    Approved Honor Results ({safeHonorResults.length})
                                                </h3>
                                                <div className="grid gap-4">
                                                    {safeHonorResults.map((honorResult, index) => (
                                                        <div key={honorResult.id} className="border rounded-lg p-4 bg-white shadow-sm">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                                                            <h4 className="font-semibold text-lg">{honorResult.student.name}</h4>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Badge variant="outline" className="text-xs">
                                                                                {honorResult.student.student_number}
                                                                            </Badge>
                                                                            {honorResult.student.specific_year_level && (
                                                                                <Badge variant="secondary" className="text-xs">
                                                                                    {gradeLevels?.[honorResult.student.specific_year_level] || honorResult.student.specific_year_level.replace('grade_', 'Grade ')}
                                                                                </Badge>
                                                                            )}
                                                                            {honorResult.student.section ? (
                                                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                                                                    {getStudentSectionName(honorResult.student)}
                                                                                </Badge>
                                                                            ) : (
                                                                                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                                                                                    No Section
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                                        <div className="bg-blue-50 p-2 rounded">
                                                                            <span className="font-medium text-blue-700">GPA:</span>
                                                                            <div className="text-lg font-bold">{honorResult.gpa}</div>
                                                                        </div>
                                                                        <div className="bg-purple-50 p-2 rounded">
                                                                            <span className="font-medium text-purple-700">Honor Type:</span>
                                                                            <div className="font-bold">
                                                                                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                                                                    {getHonorResultTypeName(honorResult)}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-green-50 p-2 rounded">
                                                                            <span className="font-medium text-green-700">Status:</span>
                                                                            <div className="font-bold">
                                                                                {honorResult.is_approved ? (
                                                                                    <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
                                                                                ) : honorResult.is_pending_approval ? (
                                                                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                                                                ) : honorResult.is_rejected ? (
                                                                                    <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>
                                                                                ) : (
                                                                                    <Badge variant="outline">Unknown</Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-gray-50 p-2 rounded">
                                                                            <span className="font-medium text-gray-700">School Year:</span>
                                                                            <div className="text-sm font-bold">{honorResult.school_year}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Qualified Students Section */}
                                        {safeQualifiedStudents.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                        Calculated Qualified Students ({safeQualifiedStudents.length})
                                                    </h3>
                                                    <Button
                                                        onClick={() => {
                                                            console.log('[JHS Submit] Starting submission process...');
                                                            console.log('[JHS Submit] Qualified students count:', safeQualifiedStudents.length);
                                                            console.log('[JHS Submit] Current school year:', safeCurrentSchoolYear);
                                                            console.log('[JHS Submit] Honor results count:', safeHonorResults.length);

                                                            // Check if any qualified student already has an honor result
                                                            const alreadySubmitted = safeQualifiedStudents.some((student: any) =>
                                                                safeHonorResults.some((result: HonorResult) =>
                                                                    result.student_id === student.student.id &&
                                                                    result.school_year === safeCurrentSchoolYear
                                                                )
                                                            );

                                                            console.log('[JHS Submit] Already submitted check:', alreadySubmitted);

                                                            if (alreadySubmitted) {
                                                                console.log('[JHS Submit] Blocking submission - students already submitted');
                                                                addToast('Some students have already been submitted for approval.', 'warning');
                                                                return;
                                                            }

                                                            if (confirm(`Submit ${safeQualifiedStudents.length} qualified student(s) for principal approval?`)) {
                                                                const submitData = { school_year: safeCurrentSchoolYear };
                                                                console.log('[JHS Submit] User confirmed. Sending data:', submitData);

                                                                router.post(route('admin.academic.honors.junior-high-school.generate-results'), submitData, {
                                                                    onSuccess: (response) => {
                                                                        console.log('[JHS Submit] Success response:', response);
                                                                        addToast(`Successfully submitted ${safeQualifiedStudents.length} student(s) for approval!`, 'success');
                                                                    },
                                                                    onError: (errors) => {
                                                                        console.error('[JHS Submit] Error response:', errors);
                                                                        const errorMessage = errors?.message || 'Failed to submit students for approval. Please try again.';
                                                                        addToast(errorMessage, 'error');
                                                                    }
                                                                });
                                                            } else {
                                                                console.log('[JHS Submit] User cancelled submission');
                                                            }
                                                        }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Upload className="h-4 w-4" />
                                                        Submit for Approval
                                                    </Button>
                                                </div>
                                                <div className="grid gap-4">
                                                    {safeQualifiedStudents.map((qualifiedStudent, index) => (
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
                                                                    {qualifiedStudent.student.section ? (
                                                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                                                            {getStudentSectionName(qualifiedStudent.student)}
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                                                                            No Section
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
                                                                    <div className="text-lg font-bold">{qualifiedStudent.result.quarter_averages.length}</div>
                                                                </div>
                                                                <div className="bg-purple-50 p-2 rounded">
                                                                    <span className="font-medium text-purple-700">Honor:</span>
                                                                    <div className="font-bold">
                                                                        {qualifiedStudent.result.qualifications.length > 0 ? (
                                                                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                                                                {qualifiedStudent.result.qualifications[0].honor_type.name}
                                                                            </Badge>
                                                                        ) : (
                                                                            <span className="text-gray-500">N/A</span>
                                                                        )}
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
                            Student Honor Details - Junior High School
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
                                        <p className="text-gray-600">No honor qualification found</p>
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
                                        <p className="text-xs text-blue-600 mt-1">Overall GPA</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                        <span className="text-sm text-green-700 font-medium">Minimum Grade</span>
                                        <p className="text-2xl font-bold text-green-900">
                                            {selectedStudent.result?.min_grade?.toFixed(2) || 'N/A'}
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">Lowest subject grade</p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                        <span className="text-sm text-purple-700 font-medium">Total Quarters</span>
                                        <p className="text-2xl font-bold text-purple-900">
                                            {selectedStudent.result?.quarter_averages?.length || 0}
                                        </p>
                                        <p className="text-xs text-purple-600 mt-1">Grading periods</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quarter Averages */}
                            {selectedStudent.result?.quarter_averages && selectedStudent.result.quarter_averages.length > 0 && (
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <h3 className="font-semibold text-lg mb-3 text-gray-900">Quarter Averages</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {selectedStudent.result.quarter_averages.map((avg: number, idx: number) => (
                                            <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg text-center border border-blue-200">
                                                <span className="text-sm text-blue-700 font-medium">Quarter {idx + 1}</span>
                                                <p className="text-3xl font-bold text-blue-900 mt-1">{avg.toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Overall Performance */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-lg text-green-900">Overall Academic Performance</h4>
                                        <p className="text-sm text-green-700 mt-1">Final average across all quarters</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-bold text-green-900">
                                            {selectedStudent.result?.average_grade?.toFixed(2) || 'N/A'}
                                        </p>
                                        <p className="text-sm text-green-600 mt-1">Final GPA</p>
                                    </div>
                                </div>
                            </div>

                            {/* Qualification Reason */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="font-semibold text-sm text-gray-700 mb-2">Qualification Status</h3>
                                <p className="text-sm text-gray-900">{selectedStudent.result?.reason || 'N/A'}</p>
                            </div>

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
