import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
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
import { CheckCircle, Trophy, ArrowLeft, Plus } from 'lucide-react';

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

interface Props {
    user: User;
    honorTypes: HonorType[];
    criteria: HonorCriterion[];
    schoolYears: string[];
}

export default function ElementaryHonors({ user, honorTypes, criteria, schoolYears }: Props) {
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
    const [showAddHonorTypeForm, setShowAddHonorTypeForm] = useState(false);
    const [newHonorType, setNewHonorType] = useState({
        name: '',
        key: '',
        scope: 'basic'
    });
    const [showTestCalculation, setShowTestCalculation] = useState(false);
    const [testStudentId, setTestStudentId] = useState('');
    const [testSchoolYear, setTestSchoolYear] = useState('2024-2025');
    const [testResult, setTestResult] = useState<any>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        academic_level_id: '1', // Elementary level ID
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

    const handleCreateHonorType = (e: React.FormEvent) => {
        e.preventDefault();
        
        fetch('/admin/academic/honors/types', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify(newHonorType),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMessage({ type: 'success', text: 'Honor type created successfully!' });
                    setNewHonorType({ name: '', key: '', scope: 'basic' });
                    setShowAddHonorTypeForm(false);
                    window.location.reload();
                } else {
                    setMessage({ type: 'error', text: 'Failed to create honor type.' });
                }
            })
            .catch(() => setMessage({ type: 'error', text: 'Failed to create honor type.' }));
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

    const handleTestCalculation = async () => {
        if (!testStudentId || testStudentId.trim() === '') {
            setMessage({ type: 'error', text: 'Please enter a student ID.' });
            return;
        }

        setIsCalculating(true);
        setTestResult(null);

        try {
            const response = await fetch('/admin/academic/honors/elementary/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    student_id: testStudentId.trim(),
                    academic_level_id: 1, // Elementary level ID
                    school_year: testSchoolYear,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                setTestResult(data.data);
                setMessage({ type: 'success', text: 'Calculation completed successfully!' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to calculate honor qualification.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to calculate honor qualification.' });
        } finally {
            setIsCalculating(false);
        }
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
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Elementary Honor Criteria</h1>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">Manage honor criteria and types specifically for Elementary level students.</p>
                            </div>
                        </div>

                        {message && (
                            <Alert className={message.type === 'success' ? 'border-green-500' : 'border-red-500'}>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>{message.text}</AlertDescription>
                            </Alert>
                        )}

                        {/* Add New Criteria Button */}
                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="outline"
                                onClick={() => setShowAddHonorTypeForm(true)}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Honor Type
                            </Button>
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
                                                <div className="flex items-center justify-between mb-2">
                                                    <Label htmlFor="honor_type_id">Honor Type</Label>
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => setShowAddHonorTypeForm(true)}
                                                        className="text-xs"
                                                    >
                                                        + Add New
                                                    </Button>
                                                </div>
                                                {honorTypes && honorTypes.length > 0 ? (
                                                    <Select value={data.honor_type_id || ""} onValueChange={(value) => setData('honor_type_id', value)}>
                                                        <SelectTrigger><SelectValue placeholder="Select honor type" /></SelectTrigger>
                                                        <SelectContent>
                                                            {honorTypes
                                                                .filter(type => type.scope === 'basic' || type.scope === 'advanced')
                                                                .map((type) => (
                                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                                        {type.name} ({type.scope})
                                                                    </SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
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

                        {/* Add Honor Type Form */}
                        {showAddHonorTypeForm && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5" />
                                        Add New Honor Type
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateHonorType} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="honor_type_name">Honor Type Name</Label>
                                                <Input 
                                                    id="honor_type_name" 
                                                    type="text" 
                                                    value={newHonorType.name} 
                                                    onChange={(e) => setNewHonorType({...newHonorType, name: e.target.value})} 
                                                    placeholder="e.g., Academic Excellence" 
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="honor_type_key">Key (URL-friendly)</Label>
                                                <Input 
                                                    id="honor_type_key" 
                                                    type="text" 
                                                    value={newHonorType.key} 
                                                    onChange={(e) => setNewHonorType({...newHonorType, key: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_')})} 
                                                    placeholder="e.g., academic_excellence" 
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="honor_type_scope">Scope</Label>
                                            <Select value={newHonorType.scope} onValueChange={(value) => setNewHonorType({...newHonorType, scope: value})}>
                                                <SelectTrigger><SelectValue placeholder="Select scope" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="basic">Basic (Elementary/JHS/SHS)</SelectItem>
                                                    <SelectItem value="advanced">Advanced (SHS/College)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit">Create Honor Type</Button>
                                            <Button type="button" variant="outline" onClick={() => setShowAddHonorTypeForm(false)}>Cancel</Button>
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
                                        <p>No honor criteria set for Elementary</p>
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
                                                            <h4 className="font-medium text-lg">{criterion.honorType?.name || 'Unknown Honor Type'}</h4>
                                                            <Badge variant="secondary">{criterion.honorType?.scope || 'Unknown'}</Badge>
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
                                                            <h4 className="font-medium text-lg">{criterion.honorType?.name || 'Unknown Honor Type'}</h4>
                                                            <Badge variant="secondary">{criterion.honorType?.scope || 'Unknown'}</Badge>
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

                        {/* Test Calculation Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5" />
                                    Test Elementary Honor Calculation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Test the elementary honor calculation formula: (Sum of all quarter grades) ÷ (Number of quarters) = Average
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="test_student_id">Student ID</Label>
                                            <Input 
                                                id="test_student_id"
                                                type="text"
                                                value={testStudentId}
                                                onChange={(e) => setTestStudentId(e.target.value)}
                                                placeholder="Enter student ID (e.g., 11, EL-TEST-001, or E-003)"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="test_school_year">School Year</Label>
                                            <Select value={testSchoolYear} onValueChange={setTestSchoolYear}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select school year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {schoolYears.map((year) => (
                                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-end">
                                            <Button 
                                                onClick={handleTestCalculation}
                                                disabled={isCalculating || !testStudentId}
                                                className="w-full"
                                            >
                                                {isCalculating ? 'Calculating...' : 'Test Calculation'}
                                            </Button>
                                        </div>
                                    </div>

                                    {testResult && (
                                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <h4 className="font-semibold mb-3 text-lg">Calculation Results</h4>
                                            
                                            {testResult.qualified ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <CheckCircle className="h-5 w-5" />
                                                        <span className="font-medium">Student Qualifies for Honors!</span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div className="bg-blue-50 p-3 rounded">
                                                            <span className="font-medium text-blue-700">Average Grade:</span>
                                                            <div className="text-lg font-bold">{testResult.average_grade}</div>
                                                        </div>
                                                        <div className="bg-yellow-50 p-3 rounded">
                                                            <span className="font-medium text-yellow-700">Min Grade:</span>
                                                            <div className="text-lg font-bold">{testResult.min_grade}</div>
                                                        </div>
                                                        <div className="bg-green-50 p-3 rounded">
                                                            <span className="font-medium text-green-700">Total Quarters:</span>
                                                            <div className="text-lg font-bold">{testResult.total_quarters}</div>
                                                        </div>
                                                        <div className="bg-purple-50 p-3 rounded">
                                                            <span className="font-medium text-purple-700">Qualified Honors:</span>
                                                            <div className="text-lg font-bold">{testResult.qualifications.length}</div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h5 className="font-medium mb-2">Qualified Honor Types:</h5>
                                                        <div className="space-y-2">
                                                            {testResult.qualifications.map((qual: any, index: number) => (
                                                                <div key={index} className="flex items-center gap-2 p-2 bg-green-100 rounded">
                                                                    <Trophy className="h-4 w-4 text-green-600" />
                                                                    <span className="font-medium">{qual.honor_type.name}</span>
                                                                    <Badge variant="secondary">{qual.honor_type.scope}</Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h5 className="font-medium mb-2">Quarter Grades Breakdown:</h5>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                            {testResult.grades_breakdown.map((grade: any, index: number) => (
                                                                <div key={index} className="bg-white p-2 rounded border text-center">
                                                                    <div className="font-medium text-sm">{grade.quarter}</div>
                                                                    <div className="text-lg font-bold">{grade.grade || 'N/A'}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-red-600">
                                                        <span className="font-medium">Student does not qualify for honors</span>
                                                    </div>
                                                    
                                                    <div className="text-sm text-gray-600">
                                                        <strong>Reason:</strong> {testResult.reason}
                                                    </div>

                                                    {testResult.average_grade && (
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                            <div className="bg-blue-50 p-3 rounded">
                                                                <span className="font-medium text-blue-700">Average Grade:</span>
                                                                <div className="text-lg font-bold">{testResult.average_grade}</div>
                                                            </div>
                                                            <div className="bg-yellow-50 p-3 rounded">
                                                                <span className="font-medium text-yellow-700">Min Grade:</span>
                                                                <div className="text-lg font-bold">{testResult.min_grade}</div>
                                                            </div>
                                                            <div className="bg-green-50 p-3 rounded">
                                                                <span className="font-medium text-green-700">Total Quarters:</span>
                                                                <div className="text-lg font-bold">{testResult.total_quarters}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
