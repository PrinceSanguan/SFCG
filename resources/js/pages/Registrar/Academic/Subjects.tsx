import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
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
        console.log('Registrar form submission started:', subjectForm);
        
        // Validation
        if (!subjectForm.name || !subjectForm.code || !subjectForm.academic_level_id) {
            console.log('Registrar validation failed: Missing required fields');
            addToast("Please fill in all required fields (Name, Code, and Academic Level).", "error");
            return;
        }

        // For elementary subjects, ensure at least one grade level is selected
        if (isElementaryLevel() && subjectForm.grade_levels.length === 0) {
            console.log('Registrar validation failed: No grade levels selected for elementary');
            addToast("Please select at least one grade level for elementary subjects.", "error");
            return;
        }

        console.log('Registrar form validation passed, submitting...');
        
        // Clean up empty strings for optional fields
        const cleanedForm = {
            ...subjectForm,
            description: subjectForm.description || null,
            grading_period_id: subjectForm.grading_period_id || null,
            course_id: subjectForm.course_id || null,
        };

        router.post(route('registrar.academic.subjects.store'), cleanedForm, {
            preserveScroll: true,
            onSuccess: (page) => { 
                console.log('Registrar subject created successfully:', page);
                addToast("Subject created successfully!", "success");
                setSubjectForm({ name: '', code: '', description: '', academic_level_id: '', grade_levels: [], grading_period_id: '', course_id: '', units: 0, hours_per_week: 0, is_core: false, is_active: true }); 
                setSubjectModal(false); 
            },
            onError: (errors) => {
                console.log('Registrar subject creation failed:', errors);
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
            units: subject.units,
            hours_per_week: subject.hours_per_week,
            is_core: subject.is_core,
            is_active: subject.is_active
        };
        router.put(route('registrar.academic.subjects.update', subject.id), data, { 
            preserveScroll: true, 
            onSuccess: () => setEditModal(false) 
        });
    };
    
    const destroySubject = (subject: Subject) => {
        if (confirm(`Delete subject ${subject.name}?`)) {
            router.delete(route('registrar.academic.subjects.destroy', subject.id), { preserveScroll: true });
        }
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge className="bg-green-100 text-green-800">Active</Badge>
        ) : (
            <Badge className="bg-red-100 text-red-800">Inactive</Badge>
        );
    };

    const getCoreBadge = (isCore: boolean) => {
        return isCore ? (
            <Badge className="bg-blue-100 text-blue-800">Core</Badge>
        ) : (
            <Badge className="bg-gray-100 text-gray-800">Elective</Badge>
        );
    };

    const resetForm = () => {
        setSubjectForm({ 
            name: '', 
            code: '', 
            description: '', 
            academic_level_id: '', 
            grade_levels: [],
            grading_period_id: '', 
            course_id: '', 
            units: 0, 
            hours_per_week: 0, 
            is_core: false, 
            is_active: true 
        });
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/registrar/academic')}
                                    className="flex items-center space-x-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Back to Academic Management</span>
                                </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Subjects per Level</h1>
                            </div>
                        </div>

                        {/* Info Card */}
                        <Card className="bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800">
                            <CardContent className="pt-6">
                                <div className="flex items-start space-x-3">
                                    <BookOpen className="h-5 w-5 text-indigo-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-indigo-900 dark:text-indigo-100">Subject Management</h3>
                                        <p className="text-indigo-700 dark:text-indigo-300 text-sm mt-1">
                                            Configure subjects for each academic level and strand. Define core and elective subjects with units and hours per week.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Subjects</h2>
                                <Badge variant="secondary">{subjects.length} subjects</Badge>
                            </div>
                            <Dialog open={subjectModal} onOpenChange={setSubjectModal}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => { setSubjectModal(true); resetForm(); }}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Subject
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Add new subject</DialogTitle>
                                        <DialogDescription>
                                            Create a new subject and assign it to specific grade levels for elementary students.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="subject-name">Name</Label>
                                            <Input 
                                                id="subject-name" 
                                                value={subjectForm.name} 
                                                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} 
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="subject-code">Code</Label>
                                            <Input 
                                                id="subject-code" 
                                                value={subjectForm.code} 
                                                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} 
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="subject-description">Description</Label>
                                            <Input 
                                                id="subject-description" 
                                                value={subjectForm.description} 
                                                onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} 
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="subject-level">Academic Level</Label>
                                            <Select 
                                                value={subjectForm.academic_level_id} 
                                                onValueChange={(value) => setSubjectForm({ ...subjectForm, academic_level_id: value })} 
                                            >
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
                                        </div>
                                        <div>
                                            <Label htmlFor="subject-grading">Grading Period</Label>
                                            <Select 
                                                value={subjectForm.grading_period_id} 
                                                onValueChange={(value) => setSubjectForm({ ...subjectForm, grading_period_id: value })} 
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select grading period (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subjectForm.academic_level_id && 
                                                        getGradingPeriodsByLevel(Number(subjectForm.academic_level_id)).map((period) => (
                                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                                {period.name}
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
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
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label htmlFor="subject-units">Units</Label>
                                                <Input 
                                                    id="subject-units" 
                                                    type="number" 
                                                    min="0" 
                                                    step="0.5"
                                                    value={subjectForm.units} 
                                                    onChange={(e) => setSubjectForm({ ...subjectForm, units: Number(e.target.value) })} 
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="subject-hours">Hours/Week</Label>
                                                <Input 
                                                    id="subject-hours" 
                                                    type="number" 
                                                    min="0" 
                                                    step="0.5"
                                                    value={subjectForm.hours_per_week} 
                                                    onChange={(e) => setSubjectForm({ ...subjectForm, hours_per_week: Number(e.target.value) })} 
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="subject-core"
                                                checked={subjectForm.is_core}
                                                onChange={(e) => setSubjectForm({ ...subjectForm, is_core: e.target.checked })}
                                                className="rounded border-gray-300"
                                            />
                                            <Label htmlFor="subject-core">Core Subject</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="subject-active"
                                                checked={subjectForm.is_active}
                                                onChange={(e) => setSubjectForm({ ...subjectForm, is_active: e.target.checked })}
                                                className="rounded border-gray-300"
                                            />
                                            <Label htmlFor="subject-active">Active</Label>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={submitSubject}>Save</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Subjects Tabs */}
                        <Card>
                            <CardContent className="pt-6">
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-5">
                                        <TabsTrigger value="all">All Subjects</TabsTrigger>
                                        <TabsTrigger value="elementary">Elementary</TabsTrigger>
                                        <TabsTrigger value="junior_highschool">Junior High</TabsTrigger>
                                        <TabsTrigger value="senior_highschool">Senior High</TabsTrigger>
                                        <TabsTrigger value="college">College</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="all" className="space-y-4">
                                        <div className="overflow-x-auto rounded border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                    <tr>
                                                        <th className="text-left p-3">Code</th>
                                                        <th className="text-left p-3">Name</th>
                                                        <th className="text-left p-3">Level</th>
                                                        <th className="text-left p-3">Grade Levels</th>
                                                        <th className="text-left p-3">Course</th>
                                                        <th className="text-left p-3">Units</th>
                                                        <th className="text-left p-3">Hours/Week</th>
                                                        <th className="text-left p-3">Type</th>
                                                        <th className="text-left p-3">Status</th>
                                                        <th className="text-left p-3">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {subjects.map((subject) => (
                                                        <tr key={subject.id} className="border-t">
                                                            <td className="p-3 font-mono">{subject.code}</td>
                                                            <td className="p-3">{subject.name}</td>
                                                            <td className="p-3">{subject.academic_level.name}</td>
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
                                                                    <Button variant="outline" size="sm" onClick={() => { setEditSubject(subject); setEditModal(true); }}>Edit</Button>
                                                                    <Button variant="destructive" size="sm" onClick={() => destroySubject(subject)}>Delete</Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="elementary" className="space-y-4">
                                        {/* Grade Level Filter */}
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
                                                                    <Button variant="outline" size="sm" onClick={() => { setEditSubject(subject); setEditModal(true); }}>Edit</Button>
                                                                    <Button variant="destructive" size="sm" onClick={() => destroySubject(subject)}>Delete</Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="junior_highschool" className="space-y-4">
                                        <div className="overflow-x-auto rounded border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                    <tr>
                                                        <th className="text-left p-3">Code</th>
                                                        <th className="text-left p-3">Name</th>
                                                        <th className="text-left p-3">Units</th>
                                                        <th className="text-left p-3">Hours/Week</th>
                                                        <th className="text-left p-3">Type</th>
                                                        <th className="text-left p-3">Status</th>
                                                        <th className="text-left p-3">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getSubjectsByLevel('junior_highschool').map((subject) => (
                                                        <tr key={subject.id} className="border-t">
                                                            <td className="p-3 font-mono">{subject.code}</td>
                                                            <td className="p-3">{subject.name}</td>
                                                            <td className="p-3">{subject.units}</td>
                                                            <td className="p-3">{subject.hours_per_week}</td>
                                                            <td className="p-3">{getCoreBadge(subject.is_core)}</td>
                                                            <td className="p-3">{getStatusBadge(subject.is_active)}</td>
                                                            <td className="p-3">
                                                                <div className="flex gap-2">
                                                                    <Button variant="outline" size="sm" onClick={() => { setEditSubject(subject); setEditModal(true); }}>Edit</Button>
                                                                    <Button variant="destructive" size="sm" onClick={() => destroySubject(subject)}>Delete</Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="senior_highschool" className="space-y-4">
                                        <div className="overflow-x-auto rounded border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                    <tr>
                                                        <th className="text-left p-3">Code</th>
                                                        <th className="text-left p-3">Name</th>
                                                        <th className="text-left p-3">Units</th>
                                                        <th className="text-left p-3">Hours/Week</th>
                                                        <th className="text-left p-3">Type</th>
                                                        <th className="text-left p-3">Status</th>
                                                        <th className="text-left p-3">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getSubjectsByLevel('senior_highschool').map((subject) => (
                                                        <tr key={subject.id} className="border-t">
                                                            <td className="p-3 font-mono">{subject.code}</td>
                                                            <td className="p-3">{subject.name}</td>
                                                            <td className="p-3">{subject.units}</td>
                                                            <td className="p-3">{subject.hours_per_week}</td>
                                                            <td className="p-3">{getCoreBadge(subject.is_core)}</td>
                                                            <td className="p-3">{getStatusBadge(subject.is_active)}</td>
                                                            <td className="p-3">
                                                                <div className="flex gap-2">
                                                                    <Button variant="outline" size="sm" onClick={() => { setEditSubject(subject); setEditModal(true); }}>Edit</Button>
                                                                    <Button variant="destructive" size="sm" onClick={() => destroySubject(subject)}>Delete</Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="college" className="space-y-4">
                                        <div className="overflow-x-auto rounded border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                    <tr>
                                                        <th className="text-left p-3">Code</th>
                                                        <th className="text-left p-3">Name</th>
                                                        <th className="text-left p-3">Units</th>
                                                        <th className="text-left p-3">Hours/Week</th>
                                                        <th className="text-left p-3">Type</th>
                                                        <th className="text-left p-3">Status</th>
                                                        <th className="text-left p-3">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getSubjectsByLevel('college').map((subject) => (
                                                        <tr key={subject.id} className="border-t">
                                                            <td className="p-3 font-mono">{subject.code}</td>
                                                            <td className="p-3">{subject.name}</td>
                                                            <td className="p-3">{subject.units}</td>
                                                            <td className="p-3">{subject.hours_per_week}</td>
                                                            <td className="p-3">{getCoreBadge(subject.is_core)}</td>
                                                            <td className="p-3">{getStatusBadge(subject.is_active)}</td>
                                                            <td className="p-3">
                                                                <div className="flex gap-2">
                                                                    <Button variant="outline" size="sm" onClick={() => { setEditSubject(subject); setEditModal(true); }}>Edit</Button>
                                                                    <Button variant="destructive" size="sm" onClick={() => destroySubject(subject)}>Delete</Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Edit Subject Modal */}
                        {editSubject && (
                            <Dialog open={editModal} onOpenChange={setEditModal}>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Edit subject</DialogTitle>
                                        <DialogDescription>
                                            Update subject details and grade level assignments.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3">
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
                                        <div>
                                            <Label>Description</Label>
                                            <Input 
                                                value={editSubject.description || ''} 
                                                onChange={(e) => setEditSubject({ ...editSubject, description: e.target.value })} 
                                            />
                                        </div>
                                        <div>
                                            <Label>Academic Level</Label>
                                            <Select 
                                                value={editSubject.academic_level_id.toString()} 
                                                onValueChange={(value) => setEditSubject({ ...editSubject, academic_level_id: Number(value) })} 
                                            >
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
                                            <Label>Grading Period</Label>
                                            <Select 
                                                value={editSubject.grading_period_id?.toString() || ''} 
                                                onValueChange={(value) => setEditSubject({ ...editSubject, grading_period_id: value ? Number(value) : undefined })} 
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select grading period (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getGradingPeriodsByLevel(editSubject.academic_level_id).map((period) => (
                                                        <SelectItem key={period.id} value={period.id.toString()}>
                                                            {period.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label>Units</Label>
                                                <Input 
                                                    type="number" 
                                                    min="0" 
                                                    step="0.5"
                                                    value={editSubject.units} 
                                                    onChange={(e) => setEditSubject({ ...editSubject, units: Number(e.target.value) })} 
                                                />
                                            </div>
                                            <div>
                                                <Label>Hours/Week</Label>
                                                <Input 
                                                    type="number" 
                                                    min="0" 
                                                    step="0.5"
                                                    value={editSubject.hours_per_week} 
                                                    onChange={(e) => setEditSubject({ ...editSubject, hours_per_week: Number(e.target.value) })} 
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={editSubject.is_core}
                                                onChange={(e) => setEditSubject({ ...editSubject, is_core: e.target.checked })}
                                                className="rounded border-gray-300"
                                            />
                                            <Label>Core Subject</Label>
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
                                    <DialogFooter>
                                        <Button onClick={() => updateSubject(editSubject)}>Save</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
