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
    const [showAddForm, setShowAddForm] = useState(false);

    const navigateToLevel = (levelKey: string) => {
        const routes = {
            'elementary': '/registrar/academic/honors/elementary',
            'junior_highschool': '/registrar/academic/honors/junior-high-school',
            'senior_highschool': '/registrar/academic/honors/senior-high-school',
            'college': '/registrar/academic/honors/college'
        };

        if (routes[levelKey as keyof typeof routes]) {
            router.visit(routes[levelKey as keyof typeof routes]);
        }
    };

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

    const generateHonorRoll = () => {
        if (!selectedLevel) {
            setMessage({ type: 'error', text: 'Please select an academic level first.' });
            return;
        }
        setIsGenerating(true);
        fetch('/registrar/academic/honors/generate', {
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
        window.open(`/registrar/academic/honors/export?academic_level_id=${selectedLevel}&school_year=${schoolYear}`);
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

                        {/* Academic Level Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {academicLevels
                                .filter(level => ['elementary', 'junior_highschool', 'senior_highschool', 'college'].includes(level.key))
                                .map((level) => {
                                    const levelCriteria = getCriteriaForLevel(level.id);

                                    return (
                                        <Card key={level.id} className="transition-all duration-200 hover:shadow-lg cursor-pointer" onClick={() => navigateToLevel(level.key)}>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg font-semibold text-center">
                                                    {level.name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="text-center">
                                                    <div className="text-sm text-gray-500 mb-4">
                                                        {levelCriteria.length} criteria set
                                        </div>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigateToLevel(level.key);
                                                        }}
                                                    >
                                                        Open
                                                    </Button>
                                        </div>
                                </CardContent>
                            </Card>
                                    );
                                })}
                        </div>


                        {/* Honor Roll Generation & Export */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Honor Roll Generation & Export
                                </CardTitle>
                            </CardHeader>
                                <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>
                                <div className="flex gap-2">
                                    <Button onClick={generateHonorRoll} disabled={!selectedLevel || isGenerating}>
                                        {isGenerating ? 'Generating...' : 'Generate Honor Roll'}
                                    </Button>
                                    <Button variant="outline" onClick={exportHonorList} disabled={!selectedLevel}>
                                        Export Honor List
                                    </Button>
                                                    </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );  
}