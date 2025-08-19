import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
    academic_level_id: number;
    start_date: string;
    end_date: string;
    sort_order: number;
    is_active: boolean;
    academic_level: AcademicLevel;
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
        academic_level_id: '',
        start_date: '',
        end_date: '',
        sort_order: 0,
        is_active: true as boolean,
    });

    const handleCreate = () => {
        post(route('admin.academic.grading-periods.store'), {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                reset();
            },
        });
    };

    const handleEdit = (period: GradingPeriod) => {
        setEditingPeriod(period);
        setData({
            name: period.name,
            code: period.code,
            academic_level_id: period.academic_level_id.toString(),
            start_date: period.start_date,
            end_date: period.end_date,
            sort_order: period.sort_order,
            is_active: period.is_active,
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (editingPeriod) {
            put(route('admin.academic.grading-periods.update', editingPeriod.id), {
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
            router.delete(route('admin.academic.grading-periods.destroy', period.id));
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

                        {/* Actions Bar */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold">Grading Periods</div>
                                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                Add Grading Period
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Create New Grading Period</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
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

                                                <div>
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
                                </div>
                            </CardContent>
                        </Card>

                        {/* Grading Periods List */}
                        <div className="space-y-4">
                            {academicLevels.map((level) => {
                                const levelPeriods = gradingPeriods.filter(p => p.academic_level_id === level.id);
                                return (
                                    <Card key={level.id}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <BookOpen className="h-5 w-5" />
                                                {level.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {levelPeriods.length === 0 ? (
                                                <p className="text-gray-500 text-center py-4">
                                                    No grading periods defined for this level.
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {levelPeriods
                                                        .sort((a, b) => a.sort_order - b.sort_order)
                                                        .map((period) => (
                                                            <div
                                                                key={period.id}
                                                                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="h-4 w-4 text-blue-500" />
                                                                        <span className="font-medium">{period.name}</span>
                                                                        <Badge variant="outline">{period.code}</Badge>
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
                                                        ))}
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
                <DialogContent className="max-w-md">
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


