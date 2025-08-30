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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Trophy, GraduationCap } from 'lucide-react';

interface User {
    name: string;
    email: string;
    user_role: string;
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
    academicLevel: AcademicLevel;
}

interface HonorResult {
    id: number;
    student_id: number;
    honor_type_id: number;
    academic_level_id: number;
    school_year: string;
    gpa: number;
    is_overridden: boolean;
    override_reason: string | null;
    overridden_by: number | null;
    honorType: HonorType;
    student: {
        id: number;
        name: string;
        student_number: string;
    };
}

interface Props {
    user: User;
    academicLevels: AcademicLevel[];
    honorTypes: HonorType[];
    criteria: HonorCriterion[];
    schoolYears: string[];
    honorResults: HonorResult[];
    groupedHonorResults: Record<string, Record<string, HonorResult[]>>;
}

export default function HonorsIndex({ user, academicLevels, honorTypes, criteria, schoolYears, honorResults, groupedHonorResults }: Props) {
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [schoolYear, setSchoolYear] = useState(() => '2024-2025');
    const [isGenerating, setIsGenerating] = useState(false);
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

    // Set default selected level when component mounts
    React.useEffect(() => {
        if (academicLevels && academicLevels.length > 0) {
            const defaultLevel = academicLevels[0].id;
            setSelectedLevel(defaultLevel);
        }
    }, [academicLevels]);

    const { data, setData, post, processing, errors, reset } = useForm({
        academic_level_id: '',
        honor_type_id: '',
        school_year: schoolYear,
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
                window.location.reload();
            },
            onError: () => setMessage({ type: 'error', text: 'Failed to save criteria.' }),
        });
    };

    const generateHonorRoll = () => {
        if (!selectedLevel) {
            setMessage({ type: 'error', text: 'Please select an academic level first.' });
            return;
        }
        setIsGenerating(true);
        fetch('/admin/academic/honors/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify({ academic_level_id: selectedLevel, school_year: schoolYear }),
        })
            .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
            .then(resp => setMessage({ type: resp.success ? 'success' : 'error', text: resp.message || (resp.success ? 'Honor roll generated successfully!' : 'Failed to generate honor roll.') }))
            .catch(() => setMessage({ type: 'error', text: 'Failed to generate honor roll. Please try again.' }))
            .finally(() => setIsGenerating(false));
    };

    const exportHonorList = () => {
        if (!selectedLevel) {
            setMessage({ type: 'error', text: 'Please select an academic level first.' });
            return;
        }
        window.open(`/admin/academic/honors/export?academic_level_id=${selectedLevel}&school_year=${schoolYear}`);
    };

    const getCriteriaForLevel = (levelId: number) => {
        // Filter by academic level ID - don't require honorType to be loaded
        const filtered = criteria.filter(c => c.academic_level_id === levelId);
        
        // Debug: Log what we're getting
        console.log('🔍 getCriteriaForLevel for level', levelId, ':', filtered);
        if (filtered.length > 0) {
            console.log('🔍 First filtered criterion:', filtered[0]);
            console.log('🔍 honorType property:', filtered[0].honorType);
            console.log('🔍 honor_type_id:', filtered[0].honor_type_id);
        }
        
        return filtered;
    };

    // Helper function to get honor type info even if relationship is broken
    const getHonorTypeInfo = (criterion: HonorCriterion) => {
        // Try to use the relationship first
        if (criterion.honorType && criterion.honorType.name) {
            return criterion.honorType;
        }
        
        // Fallback: find in honorTypes array using honor_type_id
        const honorType = honorTypes.find(t => t.id === criterion.honor_type_id);
        if (honorType) {
            return honorType;
        }
        
        // Last resort: return a default object
        return {
            id: criterion.honor_type_id,
            name: `Honor Type ${criterion.honor_type_id}`,
            key: 'unknown',
            scope: 'unknown'
        };
    };

    const getGroupedResultsForLevel = (academicLevelId: number): Record<string, HonorResult[]> => {
        const key = String(academicLevelId);
        let byType = groupedHonorResults?.[key];
        if (!byType) {
            byType = {} as Record<string, HonorResult[]>;
            for (const r of honorResults) {
                if (r.academic_level_id !== academicLevelId || r.school_year !== schoolYear) continue;
                const tkey = String(r.honor_type_id);
                if (!byType[tkey]) byType[tkey] = [];
                byType[tkey].push(r);
            }
        }
        return byType || {};
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
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Honor Tracking & Ranking</h1>
                                <p className="text-gray-500 dark:text-gray-400">Set honor criteria, generate honor rolls, and track student achievements.</p>
                            </div>
                            <Button variant="outline" onClick={() => window.history.back()}>Back to Academic</Button>
                        </div>

                        {(!academicLevels || academicLevels.length === 0) && (
                            <Alert className="border-yellow-500"><AlertDescription>Loading academic levels and honor data...</AlertDescription></Alert>
                        )}

                        {message && (
                            <Alert className={message.type === 'success' ? 'border-green-500' : 'border-red-500'}>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>{message.text}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" />Set Honor Criteria</CardTitle></CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="academic_level_id">Academic Level</Label>
                                                {academicLevels && academicLevels.length > 0 ? (
                                                    <Select value={data.academic_level_id || ""} onValueChange={(value) => setData('academic_level_id', value)}>
                                                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                                                        <SelectContent>{academicLevels.filter(level => level.id && level.name).map((level) => (<SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>))}</SelectContent>
                                                    </Select>
                                                ) : (<div className="p-2 text-sm text-gray-500 bg-gray-100 rounded border">Loading academic levels...</div>)}
                                                {errors.academic_level_id && (<p className="text-sm text-red-500">{errors.academic_level_id}</p>)}
                                            </div>
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
                                        </div>

                                        <div>
                                            <Label htmlFor="school_year">School Year</Label>
                                            <Select value={data.school_year || ""} onValueChange={(value) => setData('school_year', value)}>
                                                <SelectTrigger><SelectValue placeholder="Select school year" /></SelectTrigger>
                                                <SelectContent>{(schoolYears?.length ? schoolYears : ['2024-2025']).filter(year => year && year.trim() !== '').map((year) => (<SelectItem key={year} value={year}>{year}</SelectItem>))}</SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="min_gpa">
                                                    {data.academic_level_id && academicLevels.find(l => l.id === Number(data.academic_level_id))?.key === 'college' ? 'Min GPA (5-1 scale)' : 'Min GPA'}
                                                </Label>
                                                <Input 
                                                    id="min_gpa" 
                                                    type="number" 
                                                    step={data.academic_level_id && academicLevels.find(l => l.id === Number(data.academic_level_id))?.key === 'college' ? '0.1' : '0.01'} 
                                                    value={data.min_gpa} 
                                                    onChange={(e) => setData('min_gpa', e.target.value)} 
                                                    placeholder={
                                                        data.academic_level_id && academicLevels.find(l => l.id === Number(data.academic_level_id))?.key === 'college' 
                                                            ? 'e.g., 3.5 (5=lowest, 1=highest)' 
                                                            : 'e.g., 90.0'
                                                    } 
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="max_gpa">
                                                    {data.academic_level_id && academicLevels.find(l => l.id === Number(data.academic_level_id))?.key === 'college' ? 'Max GPA (5-1 scale)' : 'Max GPA'}
                                                </Label>
                                                <Input 
                                                    id="max_gpa" 
                                                    type="number" 
                                                    step={data.academic_level_id && academicLevels.find(l => l.id === Number(data.academic_level_id))?.key === 'college' ? '0.1' : '0.01'} 
                                                    value={data.max_gpa} 
                                                    onChange={(e) => setData('max_gpa', e.target.value)} 
                                                    placeholder={
                                                        data.academic_level_id && academicLevels.find(l => l.id === Number(data.academic_level_id))?.key === 'college' 
                                                            ? 'e.g., 1.5 (5=lowest, 1=highest)' 
                                                            : 'e.g., 97.0'
                                                    } 
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="min_grade">
                                                    {data.academic_level_id && academicLevels.find(l => l.id === Number(data.academic_level_id))?.key === 'college' ? 'Min Grade (any) (5-1 scale)' : 'Min Grade (any)'}
                                                </Label>
                                                <Input 
                                                    id="min_grade" 
                                                    type="number" 
                                                    value={data.min_grade} 
                                                    onChange={(e) => setData('min_grade', e.target.value)} 
                                                    placeholder={
                                                        data.academic_level_id && academicLevels.find(l => l.id === Number(data.academic_level_id))?.key === 'college' 
                                                            ? 'e.g., 3 (5=lowest, 1=highest)' 
                                                            : 'e.g., 90'
                                                    } 
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="min_grade_all">
                                                    {data.academic_level_id && academicLevels.find(l => l.id === Number(data.academic_level_id))?.key === 'college' ? 'Min Grade (all) (5-1 scale)' : 'Min Grade (all)'}
                                                </Label>
                                                <Input 
                                                    id="min_grade_all" 
                                                    type="number" 
                                                    value={data.min_grade_all} 
                                                    onChange={(e) => setData('min_grade_all', e.target.value)} 
                                                    placeholder={
                                                        data.academic_level_id && academicLevels.find(l => l.id === Number(data.academic_level_id))?.key === 'college' 
                                                            ? 'e.g., 2 (5=lowest, 1=highest)' 
                                                            : 'e.g., 93'
                                                    } 
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
                                            <Button type="button" variant="outline" onClick={generateHonorRoll} disabled={isGenerating}>{isGenerating ? 'Generating...' : 'Generate Honor Roll'}</Button>
                                            <Button type="button" variant="outline" onClick={exportHonorList}>Export Honor List</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" />Generate Honor Roll</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Academic Level</Label>
                                        {academicLevels && academicLevels.length > 0 ? (
                                            <Select value={selectedLevel ? selectedLevel.toString() : ""} onValueChange={(value) => setSelectedLevel(Number(value))}>
                                                <SelectTrigger><SelectValue placeholder="Select level to generate honor roll" /></SelectTrigger>
                                                <SelectContent>{academicLevels.filter(level => level.id && level.name).map((level) => (<SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>))}</SelectContent>
                                            </Select>
                                        ) : (<div className="p-2 text-sm text-gray-500 bg-gray-100 rounded border">Loading academic levels...</div>)}
                                    </div>
                                    <div>
                                        <Label>School Year</Label>
                                        {schoolYears && schoolYears.length > 0 ? (
                                            <Select value={schoolYear || ""} onValueChange={setSchoolYear}>
                                                <SelectTrigger><SelectValue placeholder="Select school year" /></SelectTrigger>
                                                <SelectContent>{schoolYears.filter(year => year && year.trim() !== '').map((year) => (<SelectItem key={year} value={year}>{year}</SelectItem>))}</SelectContent>
                                            </Select>
                                        ) : (<div className="p-2 text-sm text-gray-500 bg-gray-100 rounded border">Loading school years...</div>)}
                                    </div>
                                    <Button onClick={generateHonorRoll} disabled={!selectedLevel || isGenerating} className="w-full">{isGenerating ? 'Generating...' : 'Generate Honor Roll'}</Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Existing Criteria */}
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" />Existing Criteria</CardTitle></CardHeader>
                            <CardContent>

                                <Tabs defaultValue="elementary" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                        {academicLevels
                                            .filter(level => ['elementary', 'junior_highschool', 'senior_highschool', 'college'].includes(level.key))
                                            .map((level) => (
                                            <TabsTrigger key={level.key} value={level.key}>
                                                {level.name}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    {academicLevels && academicLevels.length > 0 ? (
                                        academicLevels.map((level) => {
                                            const levelCriteria = getCriteriaForLevel(level.id);
                                            return (
                                                <TabsContent key={level.key} value={level.key}>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="text-lg font-semibold">{level.name} Honor Criteria</h3>
                                                            <div className="text-sm text-gray-500">
                                                                {levelCriteria.length} criteria found
                                                            </div>
                                                        </div>
                                                        
                                                        {levelCriteria.length === 0 ? (
                                                            <div className="text-center py-8 text-gray-500">
                                                                <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                                <p>No honor criteria set for {level.name}</p>
                                                                <p className="text-sm">Use the form above to create criteria for this level.</p>
                                                            </div>
                                                        ) : (
                                                            <div className="grid gap-4">
                                                                {levelCriteria.map((criterion) => {
                                                                    const honorTypeInfo = getHonorTypeInfo(criterion);
                                                                    return (
                                                                        <div key={criterion.id} className="border rounded-lg p-4 bg-white shadow-sm">
                                                                            {editingCriterion?.id === criterion.id ? (
                                                                                // Edit Form
                                                                                <div className="space-y-4">
                                                                                    <div className="flex items-center justify-between mb-3">
                                                                                        <h4 className="font-medium text-lg">{honorTypeInfo.name}</h4>
                                                                                        <Badge variant="secondary">{honorTypeInfo.scope}</Badge>
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
                                                                                        <h4 className="font-medium text-lg">{honorTypeInfo.name}</h4>
                                                                                        <Badge variant="secondary">{honorTypeInfo.scope}</Badge>
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
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {/* Honor Results for this level */}
                                                        <div className="mt-6">
                                                            <h4 className="text-lg font-semibold mb-4">Honor Roll Results - {schoolYear}</h4>
                                                            <div className="space-y-4">
                                                                {(() => {
                                                                    const grouped = getGroupedResultsForLevel(level.id);
                                                                    const typeIds = Object.keys(grouped);
                                                                    if (typeIds.length === 0) {
                                                                        return <div className="text-sm text-gray-500">No honor results found for this level and school year.</div>;
                                                                    }
                                                                    return typeIds.map((typeId) => {
                                                                        const students = grouped[typeId];
                                                                        const type = honorTypes.find(t => t.id === Number(typeId));
                                                                        if (!students || students.length === 0 || !type) return null;
                                                                        return (
                                                                            <div key={`${level.id}-${typeId}`} className="border rounded-lg p-4">
                                                                                <div className="flex items-center gap-2 mb-3">
                                                                                    <Trophy className="h-4 w-4 text-yellow-600" />
                                                                                    <h5 className="font-medium">{type.name}</h5>
                                                                                    <Badge variant="secondary">{students.length} student{students.length !== 1 ? 's' : ''}</Badge>
                                                                                </div>
                                                                                <Table>
                                                                                    <TableHeader>
                                                                                        <TableRow>
                                                                                            <TableHead>Student</TableHead>
                                                                                            <TableHead>Student ID</TableHead>
                                                                                            <TableHead>GPA</TableHead>
                                                                                            <TableHead>Status</TableHead>
                                                                                        </TableRow>
                                                                                    </TableHeader>
                                                                                    <TableBody>
                                                                                        {students.map((result) => (
                                                                                            <TableRow key={result.id}>
                                                                                                <TableCell>{result.student.name}</TableCell>
                                                                                                <TableCell>{result.student.student_number}</TableCell>
                                                                                                <TableCell>{result.gpa}</TableCell>
                                                                                                <TableCell>
                                                                                                    <Badge variant={result.is_overridden ? 'destructive' : 'default'}>
                                                                                                        {result.is_overridden ? 'Overridden' : 'Qualified'}
                                                                                                    </Badge>
                                                                                                </TableCell>
                                                                                            </TableRow>
                                                                                        ))}
                                                                                    </TableBody>
                                                                                </Table>
                                                                            </div>
                                                                        );
                                                                    });
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                            );
                                        })
                                    ) : (<div className="p-4 text-center text-gray-500">No academic levels found. Please check your database configuration.</div>)}
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}


