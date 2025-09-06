import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, Clock, Hash } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface User { name: string; email: string; user_role: string }
interface AcademicLevel { id: number; name: string; key: string; sort_order: number }
interface GradingPeriod { id: number; name: string; code: string; academic_level_id: number }
interface Course { id: number; name: string; code: string; department_id: number }
interface Subject { 
    id: number; 
    name: string; 
    code: string; 
    description?: string;
    academic_level_id: number; 
    grade_levels?: string[];
    grading_period_id?: number;
    course_id?: number;
    units: number;
    hours_per_week: number;
    is_core: boolean;
    is_active: boolean;
    academic_level: AcademicLevel;
    grading_period?: GradingPeriod;
    course?: { id: number; name: string; code: string };
}

export default function Subjects({ user, subjects = [], academicLevels = [], gradingPeriods = [], courses = [] }: { 
    user: User; 
    subjects?: Subject[]; 
    academicLevels?: AcademicLevel[]; 
    gradingPeriods?: GradingPeriod[]; 
    courses?: Course[] 
}) {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedGradeFilter, setSelectedGradeFilter] = useState<string | null>(null);
    const { addToast } = useToast();
    
    // Subject form state
    const [subjectForm, setSubjectForm] = useState({ 
        name: '', 
        code: '', 
        description: '', 
        academic_level_id: '', 
        grade_levels: [] as string[],
        grading_period_id: '', 
        course_id: '', 
        units: 0, 
        hours_per_week: 0, 
        is_core: false, 
        is_active: true 
    });
    const [subjectModal, setSubjectModal] = useState(false);
    const [editSubject, setEditSubject] = useState<Subject | null>(null);
    const [editModal, setEditModal] = useState(false);

    // Get subjects by academic level
    const getSubjectsByLevel = (levelKey: string) => {
        return subjects.filter(subject => subject.academic_level.key === levelKey);
    };

    // Get elementary subjects filtered by grade level
    const getElementarySubjectsByGrade = (gradeLevel?: string) => {
        const elementarySubjects = getSubjectsByLevel('elementary');
        if (!gradeLevel) return elementarySubjects;
        
        return elementarySubjects.filter(subject => 
            !subject.grade_levels || subject.grade_levels.length === 0 || 
            subject.grade_levels.includes(gradeLevel)
        );
    };

    // Get grading periods by academic level
    const getGradingPeriodsByLevel = (levelId: number) => {
        return gradingPeriods.filter(gp => gp.academic_level_id === levelId);
    };

    // Grade level options for elementary
    const elementaryGradeLevels = [
        { value: 'grade_1', label: 'Grade 1' },
        { value: 'grade_2', label: 'Grade 2' },
        { value: 'grade_3', label: 'Grade 3' },
        { value: 'grade_4', label: 'Grade 4' },
        { value: 'grade_5', label: 'Grade 5' },
        { value: 'grade_6', label: 'Grade 6' },
    ];

    // Check if selected academic level is elementary
    const isElementaryLevel = () => {
        if (!subjectForm.academic_level_id) return false;
        const level = academicLevels.find(l => l.id.toString() === subjectForm.academic_level_id);
        return level?.key === 'elementary';
    };

    // Subject handlers
    const submitSubject = () => {
        console.log('Form submission started:', subjectForm);
        
        // Validation
        if (!subjectForm.name || !subjectForm.code || !subjectForm.academic_level_id) {
            console.log('Validation failed: Missing required fields');
            addToast("Please fill in all required fields (Name, Code, and Academic Level).", "error");
            return;
        }

        // For elementary subjects, ensure at least one grade level is selected
        if (isElementaryLevel() && subjectForm.grade_levels.length === 0) {
            console.log('Validation failed: No grade levels selected for elementary');
            addToast("Please select at least one grade level for elementary subjects.", "error");
            return;
        }

        console.log('Form validation passed, submitting...');
        console.log('Form data being sent:', JSON.stringify(subjectForm, null, 2));
        
        // Clean up empty strings for optional fields
        const cleanedForm = {
            ...subjectForm,
            description: subjectForm.description || null,
            grading_period_id: subjectForm.grading_period_id || null,
            course_id: subjectForm.course_id || null,
        };
        
        router.post(route('admin.academic.subjects.store'), cleanedForm, {
            preserveScroll: true,
            onSuccess: (page) => { 
                console.log('Subject created successfully:', page);
                addToast("Subject created successfully!", "success");
                setSubjectForm({ name: '', code: '', description: '', academic_level_id: '', grade_levels: [], grading_period_id: '', course_id: '', units: 0, hours_per_week: 0, is_core: false, is_active: true }); 
                setSubjectModal(false); 
            },
            onError: (errors) => {
                console.log('Subject creation failed:', errors);
                console.log('Error details:', JSON.stringify(errors, null, 2));
                
                // Show specific error messages
                if (errors.code) {
                    const suggestedCode = `${subjectForm.code}_${Date.now().toString().slice(-4)}`;
                    addToast(`Subject code "${subjectForm.code}" already exists. Try "${suggestedCode}" instead.`, "error");
                    // Auto-suggest a new code
                    setSubjectForm(prev => ({ ...prev, code: suggestedCode }));
                } else if (errors.name) {
                    addToast(`Subject name error: ${errors.name}`, "error");
                } else {
                    addToast("Failed to create subject. Please check the form and try again.", "error");
                }
            },
        });
    };
    
    const updateSubject = (subject: Subject) => {
        const data = { 
            name: subject.name, 
            code: subject.code, 
            description: subject.description || '',
            academic_level_id: subject.academic_level_id, 
            grade_levels: subject.grade_levels || [],
            grading_period_id: subject.grading_period_id || '',
            course_id: subject.course_id || '',
            units: subject.units,
            hours_per_week: subject.hours_per_week,
            is_core: subject.is_core,
            is_active: subject.is_active
        };
        router.put(route('admin.academic.subjects.update', subject.id), data, { 
            preserveScroll: true, 
            onSuccess: () => {
                addToast("Subject updated successfully!", "success");
                setEditModal(false);
            },
            onError: () => {
                addToast("Failed to update subject. Please check the form and try again.", "error");
            },
        });
    };
    
    const destroySubject = (subject: Subject) => {
        if (confirm(`Delete subject ${subject.name}?`)) {
            router.delete(route('admin.academic.subjects.destroy', subject.id), { 
                preserveScroll: true,
                onSuccess: () => {
                    addToast("Subject deleted successfully!", "success");
                },
                onError: () => {
                    addToast("Failed to delete subject. Please try again.", "error");
                },
            });
        }
    };

    const openEditModal = (subject: Subject) => {
        setEditSubject(subject);
        setEditModal(true);
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

    const getCoreBadge = (isCore: boolean) => {
        return isCore ? (
            <Badge variant="default" className="bg-blue-100 text-blue-800">
                Core
            </Badge>
        ) : (
            <Badge variant="outline">Elective</Badge>
        );
    };

    const getLevelIcon = (levelKey: string) => {
        switch (levelKey) {
            case 'elementary':
                return '🎓';
            case 'junior_highschool':
                return '📚';
            case 'senior_highschool':
                return '🎯';
            case 'college':
                return '🏛️';
            default:
                return '📖';
        }
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
                                <Link href={route('admin.academic.index')}>
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Academic & Curriculum
                                    </Button>
                                </Link>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Manage Subjects per Level
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Create and manage subjects for each academic level with appropriate grading periods.
                            </p>
                        </div>

                        {/* Actions Bar */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold">Subjects</div>
                                    <Dialog open={subjectModal} onOpenChange={setSubjectModal}>
                                        <DialogTrigger asChild>
                                            <Button onClick={() => setSubjectForm({ name: '', code: '', description: '', academic_level_id: '', grade_levels: [], grading_period_id: '', course_id: '', units: 0, hours_per_week: 0, is_core: false, is_active: true })} className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                Add Subject
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Add New Subject</DialogTitle>
                                                <DialogDescription>
                                                    Create a new subject and assign it to specific grade levels for elementary students.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="subject-name">Name</Label>
                                                        <Input 
                                                            id="subject-name" 
                                                            placeholder="e.g., Mathematics, English, Science" 
                                                            value={subjectForm.name} 
                                                            onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="subject-code">Code</Label>
                                                        <Input 
                                                            id="subject-code" 
                                                            placeholder="e.g., MATH101, ENG101" 
                                                            value={subjectForm.code} 
                                                            onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} 
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor="subject-description">Description</Label>
                                                    <Input 
                                                        id="subject-description" 
                                                        placeholder="Brief description of the subject" 
                                                        value={subjectForm.description} 
                                                        onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} 
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="subject-level">Academic Level</Label>
                                                        <Select value={subjectForm.academic_level_id} onValueChange={(value) => setSubjectForm({ ...subjectForm, academic_level_id: value, grading_period_id: '', course_id: '' })}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select academic level" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {academicLevels.map((level) => (
                                                                    <SelectItem key={level.id} value={level.id.toString()}>
                                                                        <span className="flex items-center gap-2">
                                                                            <span>{getLevelIcon(level.key)}</span>
                                                                            {level.name}
                                                                        </span>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="subject-grading">Grading Period</Label>
                                                        <Select value={subjectForm.grading_period_id} onValueChange={(value) => setSubjectForm({ ...subjectForm, grading_period_id: value })} disabled={!subjectForm.academic_level_id}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select grading period" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {subjectForm.academic_level_id && getGradingPeriodsByLevel(parseInt(subjectForm.academic_level_id)).map((gp) => (
                                                                    <SelectItem key={gp.id} value={gp.id.toString()}>
                                                                        {gp.name} ({gp.code})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                
                                                {/* Grade Levels field - only show for Elementary level */}
                                                {isElementaryLevel() && (
                                                    <div>
                                                        <Label htmlFor="subject-grade-levels">Grade Levels</Label>
                                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                                            {elementaryGradeLevels.map((grade) => (
                                                                <label key={grade.value} className="flex items-center space-x-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={subjectForm.grade_levels.includes(grade.value)}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSubjectForm({
                                                                                    ...subjectForm,
                                                                                    grade_levels: [...subjectForm.grade_levels, grade.value]
                                                                                });
                                                                            } else {
                                                                                setSubjectForm({
                                                                                    ...subjectForm,
                                                                                    grade_levels: subjectForm.grade_levels.filter(g => g !== grade.value)
                                                                                });
                                                                            }
                                                                        }}
                                                                        className="rounded border-gray-300"
                                                                    />
                                                                    <span className="text-sm">{grade.label}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Select which grade levels this subject applies to
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {/* Course field - only show for College level */}
                                                {subjectForm.academic_level_id && academicLevels.find(level => level.id.toString() === subjectForm.academic_level_id)?.key === 'college' && (
                                                    <div>
                                                        <Label htmlFor="subject-course">Course</Label>
                                                        <Select value={subjectForm.course_id} onValueChange={(value) => setSubjectForm({ ...subjectForm, course_id: value })}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select course (required for college subjects)" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {courses.map((course) => (
                                                                    <SelectItem key={course.id} value={course.id.toString()}>
                                                                        {course.code} - {course.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <Label htmlFor="subject-units">Units</Label>
                                                        <Input 
                                                            id="subject-units" 
                                                            type="number" 
                                                            min="0" 
                                                            step="0.5"
                                                            value={subjectForm.units} 
                                                            onChange={(e) => setSubjectForm({ ...subjectForm, units: parseFloat(e.target.value) || 0 })} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="subject-hours">Hours per Week</Label>
                                                        <Input 
                                                            id="subject-hours" 
                                                            type="number" 
                                                            min="0" 
                                                            value={subjectForm.hours_per_week} 
                                                            onChange={(e) => setSubjectForm({ ...subjectForm, hours_per_week: parseInt(e.target.value) || 0 })} 
                                                        />
                                                    </div>
                                                    <div className="flex items-center space-x-2 pt-6">
                                                        <input
                                                            id="subject-core"
                                                            type="checkbox"
                                                            checked={subjectForm.is_core}
                                                            onChange={(e) => setSubjectForm({ ...subjectForm, is_core: e.target.checked })}
                                                            className="rounded border-gray-300"
                                                        />
                                                        <Label htmlFor="subject-core">Core Subject</Label>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        id="subject-active"
                                                        type="checkbox"
                                                        checked={subjectForm.is_active}
                                                        onChange={(e) => setSubjectForm({ ...subjectForm, is_active: e.target.checked })}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <Label htmlFor="subject-active">Active</Label>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setSubjectModal(false)}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={submitSubject}>
                                                    Create Subject
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subjects by Academic Level */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="all">All Subjects</TabsTrigger>
                                <TabsTrigger value="elementary">Elementary</TabsTrigger>
                                <TabsTrigger value="junior_highschool">Junior High</TabsTrigger>
                                <TabsTrigger value="senior_highschool">Senior High</TabsTrigger>
                                <TabsTrigger value="college">College</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            All Subjects ({subjects.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                    <tr>
                                                        <th className="text-left p-3">Code</th>
                                                        <th className="text-left p-3">Name</th>
                                                        <th className="text-left p-3">Level</th>
                                                        <th className="text-left p-3">Grade Levels</th>
                                                        <th className="text-left p-3">Period</th>
                                                        <th className="text-left p-3">Course</th>
                                                        <th className="text-left p-3">Units</th>
                                                        <th className="text-left p-3">Hours</th>
                                                        <th className="text-left p-3">Type</th>
                                                        <th className="text-left p-3">Status</th>
                                                        <th className="text-left p-3">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {subjects.map((subject) => (
                                                        <tr key={subject.id} className="border-t">
                                                            <td className="p-3">
                                                                <Badge variant="outline" className="font-mono">
                                                                    {subject.code}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-3 font-medium">{subject.name}</td>
                                                            <td className="p-3">
                                                                <span className="flex items-center gap-2">
                                                                    <span>{getLevelIcon(subject.academic_level.key)}</span>
                                                                    {subject.academic_level.name}
                                                                </span>
                                                            </td>
                                                            <td className="p-3">
                                                                {subject.academic_level.key === 'elementary' && subject.grade_levels && subject.grade_levels.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {subject.grade_levels.map((grade) => (
                                                                            <Badge key={grade} variant="secondary" className="text-xs">
                                                                                {elementaryGradeLevels.find(g => g.value === grade)?.label || grade}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="p-3">
                                                                {subject.grading_period ? (
                                                                    <Badge variant="outline">
                                                                        {subject.grading_period.name}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="p-3">
                                                                {subject.course ? (
                                                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                                        {subject.course.code}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="p-3">{subject.units}</td>
                                                            <td className="p-3">{subject.hours_per_week}</td>
                                                            <td className="p-3">{getCoreBadge(subject.is_core)}</td>
                                                            <td className="p-3">{getStatusBadge(subject.is_active)}</td>
                                                            <td className="p-3">
                                                                <div className="flex gap-2">
                                                                    <Button variant="outline" size="sm" onClick={() => openEditModal(subject)}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button variant="outline" size="sm" onClick={() => destroySubject(subject)} className="text-red-600 hover:text-red-700">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {academicLevels.map((level) => (
                                <TabsContent key={level.key} value={level.key} className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <span>{getLevelIcon(level.key)}</span>
                                                {level.name} Subjects ({level.key === 'elementary' ? getElementarySubjectsByGrade(selectedGradeFilter || undefined).length : getSubjectsByLevel(level.key).length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {level.key === 'elementary' ? (
                                                <>
                                                    {/* Grade Level Filter for Elementary */}
                                                    <div className="flex items-center space-x-4 mb-4">
                                                        <Label className="text-sm font-medium">Filter by Grade Level:</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                variant={selectedGradeFilter === null ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => setSelectedGradeFilter(null)}
                                                            >
                                                                All Grades
                                                            </Button>
                                                            {elementaryGradeLevels.map((grade) => (
                                                                <Button
                                                                    key={grade.value}
                                                                    variant={selectedGradeFilter === grade.value ? "default" : "outline"}
                                                                    size="sm"
                                                                    onClick={() => setSelectedGradeFilter(grade.value)}
                                                                >
                                                                    {grade.label}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    
                                                    {getElementarySubjectsByGrade(selectedGradeFilter || undefined).length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No subjects defined</h3>
                                                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                                                Get started by creating the first subject for {level.name}.
                                                            </p>
                                                            <Button 
                                                                variant="outline" 
                                                                onClick={() => {
                                                                    setSubjectForm({ ...subjectForm, academic_level_id: level.id.toString() });
                                                                    setSubjectModal(true);
                                                                }}
                                                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Add First Subject
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="overflow-x-auto rounded border">
                                                            <table className="w-full text-sm">
                                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                                    <tr>
                                                                        <th className="text-left p-3">Code</th>
                                                                        <th className="text-left p-3">Name</th>
                                                                        <th className="text-left p-3">Grade Levels</th>
                                                                        <th className="text-left p-3">Units</th>
                                                                        <th className="text-left p-3">Hours/Week</th>
                                                                        <th className="text-left p-3">Type</th>
                                                                        <th className="text-left p-3">Status</th>
                                                                        <th className="text-left p-3">Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {getElementarySubjectsByGrade(selectedGradeFilter || undefined).map((subject) => (
                                                                        <tr key={subject.id} className="border-t">
                                                                            <td className="p-3 font-mono">{subject.code}</td>
                                                                            <td className="p-3">{subject.name}</td>
                                                                            <td className="p-3">
                                                                                {subject.grade_levels && subject.grade_levels.length > 0 ? (
                                                                                    <div className="flex flex-wrap gap-1">
                                                                                        {subject.grade_levels.map((grade) => (
                                                                                            <Badge key={grade} variant="secondary" className="text-xs">
                                                                                                {elementaryGradeLevels.find(g => g.value === grade)?.label || grade}
                                                                                            </Badge>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <Badge variant="outline" className="text-xs text-gray-500">
                                                                                        All Grades
                                                                                    </Badge>
                                                                                )}
                                                                            </td>
                                                                            <td className="p-3">{subject.units}</td>
                                                                            <td className="p-3">{subject.hours_per_week}</td>
                                                                            <td className="p-3">{getCoreBadge(subject.is_core)}</td>
                                                                            <td className="p-3">{getStatusBadge(subject.is_active)}</td>
                                                                            <td className="p-3">
                                                                                <div className="flex gap-2">
                                                                                    <Button variant="outline" size="sm" onClick={() => openEditModal(subject)}>
                                                                                        <Edit className="h-4 w-4" />
                                                                                    </Button>
                                                                                    <Button variant="outline" size="sm" onClick={() => destroySubject(subject)} className="text-red-600 hover:text-red-700">
                                                                                        <Trash2 className="h-4 w-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {getSubjectsByLevel(level.key).length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No subjects defined</h3>
                                                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                                                Get started by creating the first subject for {level.name}.
                                                            </p>
                                                            <Button 
                                                                variant="outline" 
                                                                onClick={() => {
                                                                    setSubjectForm({ ...subjectForm, academic_level_id: level.id.toString() });
                                                                    setSubjectModal(true);
                                                                }}
                                                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Add First Subject
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="grid gap-4">
                                                            {getSubjectsByLevel(level.key).map((subject) => (
                                                                <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                                                                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                                            </div>
                                                                            <div>
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{subject.name}</span>
                                                                                    <Badge variant="outline" className="text-xs font-mono bg-gray-100 dark:bg-gray-600">
                                                                                        <Hash className="h-3 w-3 mr-1" />
                                                                                        {subject.code}
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                                                    {subject.grading_period && (
                                                                                        <span className="flex items-center gap-1">
                                                                                            <Clock className="h-3 w-3" />
                                                                                            {subject.grading_period.name}
                                                                                        </span>
                                                                                    )}
                                                                                    <span>{subject.units} units</span>
                                                                                    <span>{subject.hours_per_week} hrs/week</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        {getCoreBadge(subject.is_core)}
                                                                        {getStatusBadge(subject.is_active)}
                                                                        <div className="flex items-center gap-1">
                                                                            <Button variant="outline" size="sm" onClick={() => openEditModal(subject)}>
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button variant="outline" size="sm" onClick={() => destroySubject(subject)} className="text-red-600 hover:text-red-700">
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </main>
            </div>

            {/* Edit Subject Modal */}
            <Dialog open={editModal} onOpenChange={setEditModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Subject</DialogTitle>
                    </DialogHeader>
                    {editSubject && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input 
                                        value={editSubject.name} 
                                        onChange={(e) => setEditSubject({ ...editSubject, name: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <Label>Code</Label>
                                    <Input 
                                        value={editSubject.code} 
                                        onChange={(e) => setEditSubject({ ...editSubject, code: e.target.value })} 
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input 
                                    value={editSubject.description || ''} 
                                    onChange={(e) => setEditSubject({ ...editSubject, description: e.target.value })} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Academic Level</Label>
                                    <Select value={editSubject.academic_level_id.toString()} onValueChange={(value) => setEditSubject({ ...editSubject, academic_level_id: Number(value), grading_period_id: undefined, course_id: undefined })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicLevels.map((level) => (
                                                <SelectItem key={level.id} value={level.id.toString()}>
                                                    <span className="flex items-center gap-2">
                                                        <span>{getLevelIcon(level.key)}</span>
                                                        {level.name}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Grading Period</Label>
                                    <Select value={editSubject.grading_period_id?.toString() || ''} onValueChange={(value) => setEditSubject({ ...editSubject, grading_period_id: Number(value) })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select grading period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getGradingPeriodsByLevel(editSubject.academic_level_id).map((gp) => (
                                                <SelectItem key={gp.id} value={gp.id.toString()}>
                                                    {gp.name} ({gp.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            {/* Course field - only show for College level */}
                            {editSubject.academic_level_id && academicLevels.find(level => level.id === editSubject.academic_level_id)?.key === 'college' && (
                                <div>
                                    <Label>Course</Label>
                                    <Select value={editSubject.course_id?.toString() || ''} onValueChange={(value) => setEditSubject({ ...editSubject, course_id: Number(value) })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select course (required for college subjects)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                    {course.code} - {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Units</Label>
                                                                                <Input 
                                                type="number" 
                                                min="0" 
                                                step="0.5"
                                                value={editSubject.units} 
                                                onChange={(e) => setEditSubject({ ...editSubject, units: parseFloat(e.target.value) || 0 })} 
                                            />
                                </div>
                                <div>
                                    <Label>Hours per Week</Label>
                                    <Input 
                                        type="number" 
                                        min="0" 
                                        value={editSubject.hours_per_week} 
                                        onChange={(e) => setEditSubject({ ...editSubject, hours_per_week: parseInt(e.target.value) || 0 })} 
                                    />
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <input
                                        type="checkbox"
                                        checked={editSubject.is_core}
                                        onChange={(e) => setEditSubject({ ...editSubject, is_core: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <Label>Core Subject</Label>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={editSubject.is_active}
                                    onChange={(e) => setEditSubject({ ...editSubject, is_active: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <Label>Active</Label>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => editSubject && updateSubject(editSubject)}>
                            Update Subject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


