import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Calendar, BookOpen, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface User {
    name: string;
    email: string;
    user_role: string;
}

interface AcademicLevel {
    id: number;
    key: string;
    name: string;
    sort_order: number;
    is_active: boolean;
}

interface GradingPeriod {
    id: number;
    name: string;
    code: string;
    type: 'quarter' | 'semester';
    academic_level_id: number;
    parent_id?: number | null;
    period_type: 'quarter' | 'midterm' | 'prefinal' | 'final';
    semester_number?: number | null;
    weight: number;
    is_calculated: boolean;
    start_date: string;
    end_date: string;
    sort_order: number;
    is_active: boolean;
    academic_level: AcademicLevel;
    parent?: GradingPeriod | null;
    children?: GradingPeriod[];
}

interface GradingProps {
    user: User;
    gradingPeriods: GradingPeriod[];
    academicLevels: AcademicLevel[];
}

export default function Grading({ user, gradingPeriods, academicLevels }: GradingProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<GradingPeriod | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const { data, setData, post, put, processing, reset, errors: formErrors } = useForm({
        name: '',
        code: '',
        type: 'quarter' as 'quarter' | 'semester',
        academic_level_id: '',
        parent_id: null as number | null,
        period_type: 'quarter' as 'quarter' | 'midterm' | 'prefinal' | 'final',
        semester_number: null as number | null,
        weight: 1.00,
        is_calculated: false,
        include_midterm: false,
        include_prefinal: false,
        start_date: '',
        end_date: '',
        sort_order: 0,
        is_active: true as boolean,
    });

    const handleCreate = () => {
        post(route('registrar.academic.grading-periods.store'), {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (period: GradingPeriod) => {
        setEditingPeriod(period);
        setData('name', period.name);
        setData('code', period.code);
        setData('type', period.type);
        setData('academic_level_id', period.academic_level_id.toString());
        setData('parent_id', period.parent_id || null);
        setData('period_type', period.period_type);
        setData('semester_number', period.semester_number || null);
        setData('weight', period.weight);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setData('is_calculated', period.is_calculated as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setData('include_midterm', (period as GradingPeriod & { include_midterm?: boolean }).include_midterm as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setData('include_prefinal', (period as GradingPeriod & { include_prefinal?: boolean }).include_prefinal as any);
        setData('start_date', period.start_date);
        setData('end_date', period.end_date);
        setData('sort_order', period.sort_order);
        setData('is_active', period.is_active);
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (editingPeriod) {
            put(route('registrar.academic.grading-periods.update', editingPeriod.id), {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    setEditingPeriod(null);
                    reset();
                },
            });
        }
    };

    const handleDelete = (period: GradingPeriod) => {
        if (confirm(`Are you sure you want to delete "${period.name}"? This action cannot be undone.`)) {
            router.delete(route('registrar.academic.grading-periods.destroy', period.id));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                Active
            </Badge>
        ) : (
            <Badge variant="secondary">Inactive</Badge>
        );
    };

    const getGradingPeriodType = (academicLevelKey: string) => {
        switch (academicLevelKey) {
            case 'elementary':
            case 'junior_highschool':
                return 'quarter';
            case 'senior_highschool':
            case 'college':
                return 'semester';
            default:
                return 'quarter';
        }
    };


    const getParentPeriodOptions = (academicLevelId: number) => {
        return gradingPeriods
            .filter(p => p.academic_level_id === academicLevelId && p.type === 'semester' && !p.parent_id)
            .map(p => ({ value: p.id.toString(), label: p.name }));
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex flex-col gap-2">
                            <div className="mb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.history.back()}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Grading Periods Management
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Manage grading periods, quarters, and semesters for each academic level.
                            </p>
                        </div>


                        {/* Create Dialog */}
                                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Create New Grading Period</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="type">Type</Label>
                                        <Select value={data.type} onValueChange={(value) => setData('type', value as 'quarter' | 'semester')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="quarter">Quarter</SelectItem>
                                                <SelectItem value="semester">Semester</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {formErrors?.type && (
                                            <Alert variant="destructive">
                                                <AlertDescription>{formErrors.type}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    {/* Academic Level - Hidden but automatically set */}
                                    <div className="hidden">
                                        <Label htmlFor="academic_level_id">Academic Level</Label>
                                        <Select value={data.academic_level_id} onValueChange={(value) => setData('academic_level_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select academic level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicLevels.map((level) => (
                                                    <SelectItem key={level.id} value={level.id.toString()}>
                                                        {level.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors?.academic_level_id && (
                                            <Alert variant="destructive">
                                                <AlertDescription>{formErrors.academic_level_id}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                    
                                    {/* Show selected academic level as info */}
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-800">
                                                Academic Level: {academicLevels.find(level => level.id.toString() === data.academic_level_id)?.name || 'Not selected'}
                                            </span>
                                        </div>
                                    </div>

                                                <div>
                                                    <Label htmlFor="name">Name</Label>
                                                    <Input
                                                        id="name"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        placeholder="e.g., First Quarter, First Semester"
                                                    />
                                                    {formErrors?.name && (
                                                        <Alert variant="destructive">
                                                            <AlertDescription>{formErrors.name}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="code">Code</Label>
                                                    <Input
                                                        id="code"
                                                        value={data.code}
                                                        onChange={(e) => setData('code', e.target.value)}
                                                        placeholder="e.g., Q1, S1"
                                                    />
                                                    {formErrors?.code && (
                                                        <Alert variant="destructive">
                                                            <AlertDescription>{formErrors.code}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>


                                    {/* Show parent semester selection for quarters */}
                                    {data.type === 'quarter' && (
                                        <div>
                                            <Label htmlFor="parent_id">Which Semester? (Optional)</Label>
                                            {(() => {
                                                const semesterOptions = getParentPeriodOptions(parseInt(data.academic_level_id));
                                                return semesterOptions.length > 0 ? (
                                                    <>
                                                        <Select value={data.parent_id?.toString() || ''} onValueChange={(value) => setData('parent_id', value ? parseInt(value) : null)}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select parent semester" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {semesterOptions.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Select a semester if this quarter belongs to one
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200">
                                                            <p className="font-medium">No semesters available</p>
                                                            <p className="mt-1">To create quarters under a semester, you need to create a semester first. Change the "Type" to "Semester" to create one.</p>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                            {formErrors?.parent_id && (
                                                <Alert variant="destructive" className="mt-2">
                                                    <AlertDescription>{formErrors.parent_id}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    )}

                                    {/* Show period type selection for quarters */}
                                    {data.type === 'quarter' && (
                                        <div>
                                            <Label>Period Type</Label>
                                            <div className="space-y-2 mt-2">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id="period_final"
                                                        checked={data.period_type === 'final'}
                                                        onChange={(e) => setData('period_type', e.target.checked ? 'final' : 'quarter')}
                                                        className="rounded border-gray-300 text-blue-600"
                                                    />
                                                    <Label htmlFor="period_final" className="text-sm font-normal">Final Average</Label>
                                                </div>
                                            </div>
                                            {formErrors?.period_type && (
                                                <Alert variant="destructive">
                                                    <AlertDescription>{formErrors.period_type}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    )}

                                    {/* Final Average Calculation Options */}
                                    {data.period_type === 'final' && data.parent_id && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                <h5 className="font-medium text-yellow-900">Final Average Calculation</h5>
                                            </div>
                                            <p className="text-sm text-yellow-700 mb-3">
                                                Select which quarters from the selected semester should be included in the final average calculation:
                                            </p>
                                            
                                            <div className="space-y-2">
                                                {(() => {
                                                    // Debug: Log the data to understand the structure
                                                    console.log('Debug - data.parent_id:', data.parent_id);
                                                    console.log('Debug - gradingPeriods:', gradingPeriods);
                                                    
                                                    // Find quarters that belong to the selected semester
                                                    // Look for any period that has the selected semester as parent_id
                                                    // and is not a final average period
                                                    const semesterQuarters = gradingPeriods.filter((period: GradingPeriod) => 
                                                        period.parent_id === data.parent_id && 
                                                        period.period_type !== 'final'
                                                    );
                                                    
                                                    console.log('Debug - semesterQuarters found:', semesterQuarters);
                                                    
                                                    if (semesterQuarters.length === 0) {
                                                        return (
                                                            <div className="text-sm text-yellow-600 italic">
                                                                No quarters found in the selected semester. Please create Midterm and Pre-Final periods first.
                                                                <br />
                                                                <small>Debug: parent_id = {data.parent_id}, total periods = {gradingPeriods.length}</small>
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    return semesterQuarters.map((quarter: GradingPeriod) => (
                                                        <div key={quarter.id} className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`include_${quarter.id}`}
                                                                checked={Boolean(data[`include_${quarter.period_type}` as keyof typeof data])}
                                                                onChange={(e) => setData(`include_${quarter.period_type}` as keyof typeof data, e.target.checked)}
                                                                className="rounded border-gray-300"
                                                            />
                                                            <Label htmlFor={`include_${quarter.id}`} className="text-sm">
                                                                Include {quarter.name} Grade
                                                            </Label>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                            
                                            <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                                                <strong>Calculation:</strong> Final Average = (Selected Quarters) ÷ Number of Selected Quarters
                                            </div>
                                        </div>
                                    )}

                                    {/* Only show weight and calculated fields for quarters, not for semesters or final average */}
                                    {data.type === 'quarter' && data.period_type !== 'final' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="weight">Grade Contribution (%)</Label>
                                                <Input
                                                    id="weight"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.weight}
                                                    onChange={(e) => setData('weight', parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                    max="1"
                                                    placeholder="0.50 = 50%"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    How much this period contributes to final grade (0.50 = 50%, 1.00 = 100%)
                                                </p>
                                                {formErrors?.weight && (
                                                        <Alert variant="destructive">
                                                        <AlertDescription>{formErrors.weight}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>

                                            <div className="flex items-start space-x-2 pt-6">
                                                <input
                                                    id="is_calculated"
                                                    type="checkbox"
                                                    checked={data.is_calculated}
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    onChange={(e) => setData('is_calculated', e.target.checked as any)}
                                                    className="rounded border-gray-300 mt-1"
                                                />
                                                <div>
                                                    <Label htmlFor="is_calculated" className="text-sm font-medium">Auto-Calculated Grade</Label>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        System will automatically calculate this grade from other periods
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="start_date">Start Date</Label>
                                                        <Input
                                                            id="start_date"
                                                            type="date"
                                                            value={data.start_date}
                                                            onChange={(e) => setData('start_date', e.target.value)}
                                                        />
                                                        {formErrors?.start_date && (
                                                            <Alert variant="destructive">
                                                                <AlertDescription>{formErrors.start_date}</AlertDescription>
                                                            </Alert>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="end_date">End Date</Label>
                                                        <Input
                                                            id="end_date"
                                                            type="date"
                                                            value={data.end_date}
                                                            onChange={(e) => setData('end_date', e.target.value)}
                                                        />
                                                        {formErrors?.end_date && (
                                                            <Alert variant="destructive">
                                                                <AlertDescription>{formErrors.end_date}</AlertDescription>
                                                            </Alert>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="sort_order">Sort Order</Label>
                                                        <Input
                                                            id="sort_order"
                                                            type="number"
                                                            value={data.sort_order}
                                                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                                            min="0"
                                                        />
                                                    </div>

                                                    <div className="flex items-center space-x-2 pt-6">
                                                        <input
                                                            id="is_active"
                                                            type="checkbox"
                                                            checked={data.is_active}
                                                            onChange={(e) => setData('is_active', e.target.checked as boolean)}
                                                            className="rounded border-gray-300"
                                                        />
                                                        <Label htmlFor="is_active">Active</Label>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end space-x-2 pt-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsCreateDialogOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleCreate} disabled={processing}>
                                                        {processing ? 'Creating...' : 'Create'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                        {/* Grading Periods List */}
                        <div className="space-y-4">
                            {academicLevels.map((level) => {
                                const levelPeriods = gradingPeriods.filter(p => p.academic_level_id === level.id);
                                const rootPeriods = levelPeriods.filter(p => !p.parent_id);
                                const subPeriods = levelPeriods.filter(p => p.parent_id);
                                
                                return (
                                    <Card key={level.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <BookOpen className="h-5 w-5" />
                                                {level.name}
                                                    <Badge variant="outline" className="ml-2">
                                                        {getGradingPeriodType(level.key) === 'quarter' ? 'Quarter-based' : 'Semester-based'}
                                                    </Badge>
                                            </CardTitle>
                                                <Button 
                                                    className="flex items-center gap-2"
                                                    onClick={() => {
                                                        // For Elementary and Junior High, always add quarters
                                                        if (level.key === 'elementary' || level.key === 'junior_highschool') {
                                                            setData({
                                                                ...data,
                                                                academic_level_id: level.id.toString(),
                                                                type: 'quarter',
                                                                period_type: 'quarter',
                                                                parent_id: null,
                                                                semester_number: null,
                                                            });
                                                        } else {
                                                            // For Senior High and College, add semester by default
                                                            setData({
                                                                ...data,
                                                                academic_level_id: level.id.toString(),
                                                                type: 'semester',
                                                                period_type: 'quarter',
                                                                parent_id: null,
                                                                semester_number: 1,
                                                            });
                                                        }
                                                        setIsCreateDialogOpen(true);
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    {level.key === 'elementary' || level.key === 'junior_highschool' ? 'Add Quarter' : 'Add Semester/Quarter'}
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {levelPeriods.length === 0 ? (
                                                <p className="text-gray-500 text-center py-4">
                                                    No grading periods defined for this level.
                                                </p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {rootPeriods
                                                        .sort((a, b) => a.sort_order - b.sort_order)
                                                        .map((period) => {
                                                            const children = subPeriods.filter(p => p.parent_id === period.id);
                                                            return (
                                                                <div key={period.id} className="space-y-2">
                                                                    {/* Root Period */}
                                                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="h-4 w-4 text-blue-500" />
                                                                        <span className="font-medium">{period.name}</span>
                                                                        <Badge variant="outline">{period.code}</Badge>
                                                                                {period.is_calculated && (
                                                                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                                                                        Calculated
                                                                                    </Badge>
                                                                                )}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {formatDate(period.start_date)} - {formatDate(period.end_date)}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {getStatusBadge(period.is_active)}
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleEdit(period)}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleDelete(period)}
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Sub Periods */}
                                                                    {children.length > 0 && (
                                                                        <div className="ml-6 space-y-2">
                                                                            {children
                                                                                .sort((a, b) => a.sort_order - b.sort_order)
                                                                                .map((subPeriod) => (
                                                                                    <div
                                                                                        key={subPeriod.id}
                                                                                        className="flex items-center justify-between p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 border-l-4 border-l-blue-300"
                                                                                    >
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Calendar className="h-3 w-3 text-blue-400" />
                                                                                                <span className="text-sm font-medium">{subPeriod.name}</span>
                                                                                                <Badge variant="outline" className="text-xs">{subPeriod.code}</Badge>
                                                                                                {subPeriod.is_calculated && (
                                                                                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                                                                                        Calculated
                                                                                                    </Badge>
                                                                                                )}
                                                                                                <Badge variant="outline" className="text-xs">
                                                                                                    {subPeriod.period_type}
                                                                                                </Badge>
                                                                                            </div>
                                                                                            <div className="text-xs text-gray-500">
                                                                                                {formatDate(subPeriod.start_date)} - {formatDate(subPeriod.end_date)}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            {getStatusBadge(subPeriod.is_active)}
                                                                                            <Button
                                                                                                variant="outline"
                                                                                                size="sm"
                                                                                                onClick={() => handleEdit(subPeriod)}
                                                                                                className="h-7 px-2"
                                                                                            >
                                                                                                <Edit className="h-3 w-3" />
                                                                                            </Button>
                                                                                            <Button
                                                                                                variant="outline"
                                                                                                size="sm"
                                                                                                onClick={() => handleDelete(subPeriod)}
                                                                                                className="text-red-600 hover:text-red-700 h-7 px-2"
                                                                                            >
                                                                                                <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Grading Period</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit_name">Name</Label>
                            <Input
                                id="edit_name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit_code">Code</Label>
                            <Input
                                id="edit_code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit_academic_level_id">Academic Level</Label>
                            <Select value={data.academic_level_id} onValueChange={(value) => setData('academic_level_id', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicLevels.map((level) => (
                                        <SelectItem key={level.id} value={level.id.toString()}>
                                            {level.name}
                                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="edit_type">Type</Label>
                            <Select value={data.type} onValueChange={(value) => setData('type', value as 'quarter' | 'semester')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="quarter">Quarter</SelectItem>
                                    <SelectItem value="semester">Semester</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {data.type === 'semester' && (
                            <>
                                <div>
                                    <Label htmlFor="edit_period_type">Period Type</Label>
                                    <Select value={data.period_type} onValueChange={(value) => setData('period_type', value as 'quarter' | 'midterm' | 'prefinal' | 'final')}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select period type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="quarter">Semester</SelectItem>
                                            <SelectItem value="midterm">Midterm</SelectItem>
                                            <SelectItem value="prefinal">Pre-Final</SelectItem>
                                            <SelectItem value="final">Final Average</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {data.period_type !== 'quarter' && (
                                    <div>
                                        <Label htmlFor="edit_parent_id">Parent Semester</Label>
                                        <Select value={data.parent_id?.toString() || ''} onValueChange={(value) => setData('parent_id', value ? parseInt(value) : null)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select parent semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getParentPeriodOptions(parseInt(data.academic_level_id)).map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="edit_semester_number">Semester Number</Label>
                                    <Input
                                        id="edit_semester_number"
                                        type="number"
                                        value={data.semester_number || ''}
                                        onChange={(e) => setData('semester_number', e.target.value ? parseInt(e.target.value) : null)}
                                        min="1"
                                        max="2"
                                    />
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit_weight">Weight</Label>
                                <Input
                                    id="edit_weight"
                                    type="number"
                                    step="0.01"
                                    value={data.weight}
                                    onChange={(e) => setData('weight', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    max="1"
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-6">
                                <input
                                    id="edit_is_calculated"
                                    type="checkbox"
                                    checked={data.is_calculated}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    onChange={(e) => setData('is_calculated', e.target.checked as any)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="edit_is_calculated">Calculated Period</Label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit_start_date">Start Date</Label>
                                <Input
                                    id="edit_start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit_end_date">End Date</Label>
                                <Input
                                    id="edit_end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit_sort_order">Sort Order</Label>
                                <Input
                                    id="edit_sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    min="0"
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-6">
                                <input
                                    id="edit_is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked as boolean)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="edit_is_active">Active</Label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} disabled={processing}>
                                {processing ? 'Updating...' : 'Update'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}