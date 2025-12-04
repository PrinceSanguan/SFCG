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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, Clock, Hash } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface User { name: string; email: string; user_role: string }
interface AcademicLevel { id: number; name: string; key: string; sort_order: number }
interface GradingPeriod { id: number; name: string; code: string; academic_level_id: number; type?: string; parent_id?: number | null; period_type?: string }
interface Course { id: number; name: string; code: string; department_id: number }
interface Section { 
    id: number; 
    name: string; 
    academic_level_id: number; 
    specific_year_level?: string; 
    track_id?: number; 
    strand_id?: number; 
    department_id?: number; 
    course_id?: number; 
    max_students?: number;
    academic_level: AcademicLevel;
}
interface Subject {
    id: number;
    name: string;
    code: string;
    description?: string;
    academic_level_id: number;
    grade_levels?: string[];
    grading_period_id?: number;
    grading_period_ids?: number[];
    semester_id?: number;
    semester_ids?: number[];
    course_id?: number;
    units: number;
    hours_per_week: number;
    is_core: boolean;
    is_active: boolean;
    academic_level: AcademicLevel;
    grading_period?: GradingPeriod;
    grading_periods?: GradingPeriod[];
    course?: { id: number; name: string; code: string };
    // Additional properties for different academic levels
    shs_year_level?: string;
    jhs_year_level?: string;
    college_year_level?: string;
    track_id?: string;
    strand_id?: string;
    department_id?: number;
    semester_id?: number;
    section_id?: number;
}

export default function Subjects({ user, subjects = [], academicLevels = [], gradingPeriods = [], courses = [], departments = [], yearLevels = {} as Record<string,string>, shsYearLevels = {} as Record<string,string>, tracks = [], strands = [], sections = [] }: { 
    user: User; 
    subjects?: Subject[]; 
    academicLevels?: AcademicLevel[]; 
    gradingPeriods?: GradingPeriod[]; 
    courses?: Course[] 
    departments?: { id: number; name: string }[] 
    yearLevels?: Record<string,string>,
    shsYearLevels?: Record<string,string>,
    tracks?: { id: number; name: string; code: string }[],
    strands?: { id: number; name: string; code: string; track_id: number }[],
    sections?: Section[]
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
        selected_grade_level: '',
        grading_period_ids: [] as string[],
        semester_ids: [] as string[],
        department_id: '',
        course_id: '',
        semester_id: '',
        units: 0,
        hours_per_week: 0,
        is_core: false,
        is_active: true,
        track_id: '',
        strand_id: '',
        shs_year_level: '',
        jhs_year_level: '',
        college_year_level: '',
        section_id: ''
    });
    const [subjectModal, setSubjectModal] = useState(false);
    const [editSubject, setEditSubject] = useState<Subject | null>(null);
    const [editModal, setEditModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1: Select Level, 2: Fill Form
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedAcademicLevel, setSelectedAcademicLevel] = useState<AcademicLevel | null>(null);

    // Step navigation functions
    const openSubjectModal = () => {
        setCurrentStep(1);
        setSelectedAcademicLevel(null);
        setErrors({});
        setSubjectForm({
            name: '',
            code: '',
            description: '',
            academic_level_id: '',
            grade_levels: [],
            selected_grade_level: '',
            grading_period_ids: [],
            semester_ids: [],
            department_id: '',
            course_id: '',
            semester_id: '',
            units: 0,
            hours_per_week: 0,
            is_core: false,
            is_active: true,
            track_id: '',
            strand_id: '',
            shs_year_level: '',
            jhs_year_level: '',
            college_year_level: '',
            section_id: ''
        });
        setSubjectModal(true);
    };

    const selectAcademicLevel = (level: AcademicLevel) => {
        setSelectedAcademicLevel(level);
        setSubjectForm(prev => ({ ...prev, academic_level_id: level.id.toString() }));
        setCurrentStep(2);
    };

    const goBackToLevelSelection = () => {
        setCurrentStep(1);
        setSelectedAcademicLevel(null);
        setSubjectForm(prev => ({ ...prev, academic_level_id: '' }));
    };

    const closeModal = () => {
        setSubjectModal(false);
        setCurrentStep(1);
        setSelectedAcademicLevel(null);
        setSubjectForm({
            name: '',
            code: '',
            description: '',
            academic_level_id: '',
            grade_levels: [],
            selected_grade_level: '',
            grading_period_ids: [],
            semester_ids: [],
            department_id: '',
            course_id: '',
            semester_id: '',
            units: 0,
            hours_per_week: 0,
            is_core: false,
            is_active: true,
            track_id: '',
            strand_id: '',
            shs_year_level: '',
            jhs_year_level: '',
            college_year_level: '',
            section_id: ''
        });
    };

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

    // Get grading periods by academic level (exclude final average periods)
    const getGradingPeriodsByLevel = (levelId: number) => {
        const filtered = gradingPeriods.filter(gp => {
            const matchesLevel = gp.academic_level_id === levelId;
            const isFinalPeriod = gp.period_type === 'final';
            return matchesLevel && !isFinalPeriod;
        });

        console.log('[SUBJECTS] getGradingPeriodsByLevel - Filtering:', {
            levelId,
            totalPeriods: gradingPeriods.filter(gp => gp.academic_level_id === levelId).length,
            filteredPeriods: filtered.length,
            excludedFinalPeriods: gradingPeriods.filter(gp => gp.academic_level_id === levelId && gp.period_type === 'final').length,
            periodNames: filtered.map(gp => ({ id: gp.id, name: gp.name, period_type: gp.period_type }))
        });

        return filtered;
    };
    const getSemestersByLevel = (levelId: number) => gradingPeriods.filter(gp => gp.academic_level_id === levelId && (gp.parent_id == null) && ((gp.type === 'semester') || /semester/i.test(gp.name)));
    const getPeriodsBySemester = (semesterId?: string) => {
        if (!semesterId) return [];

        // Get the semester to find its academic level
        const semester = gradingPeriods.find(gp => gp.id.toString() === semesterId);
        if (!semester) return [];

        console.log('[SUBJECTS] Filtering grading periods for semester:', {
            semesterId,
            semesterName: semester.name,
            academicLevelId: semester.academic_level_id
        });

        // Filter periods by parent_id and same academic level as the semester
        // ONLY exclude periods where period_type === 'final' (Final Average calculated periods)
        // DO NOT filter by name to allow "Pre-Final" periods to show
        const filtered = gradingPeriods.filter(gp => {
            // Must match parent and academic level
            const matchesParent = gp.parent_id?.toString() === semesterId;
            const matchesLevel = gp.academic_level_id === semester.academic_level_id;

            // ONLY exclude final average periods (period_type === 'final')
            // This allows "Pre-Final" (period_type: "prefinal") to pass through
            const isFinalPeriodType = gp.period_type === 'final';

            // Only include if it matches parent/level AND is not a final average period
            const shouldInclude = matchesParent && matchesLevel && !isFinalPeriodType;

            if (matchesParent) {
                console.log('[SUBJECTS] Period filter result:', {
                    periodId: gp.id,
                    periodName: gp.name,
                    periodType: gp.type,
                    period_type: gp.period_type,
                    shouldInclude,
                    reasons: {
                        matchesParent,
                        matchesLevel,
                        isFinalPeriodType,
                        explanation: isFinalPeriodType ? 'EXCLUDED: period_type is final' : 'INCLUDED: period_type is not final'
                    }
                });
            }

            return shouldInclude;
        });

        console.log('[SUBJECTS] getPeriodsBySemester result:', {
            semesterId,
            semesterName: semester.name,
            totalMatchingParent: gradingPeriods.filter(gp => gp.parent_id?.toString() === semesterId).length,
            filteredCount: filtered.length,
            excludedFinalAverage: gradingPeriods.filter(gp => gp.parent_id?.toString() === semesterId && gp.period_type === 'final').length,
            includedPeriods: filtered.map(gp => ({ id: gp.id, name: gp.name, period_type: gp.period_type }))
        });

        return filtered;
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
            grading_period_ids: subjectForm.grading_period_ids.length > 0 ? subjectForm.grading_period_ids : null,
            semester_ids: subjectForm.semester_ids.length > 0 ? subjectForm.semester_ids : null,
            course_id: subjectForm.course_id || null,
            department_id: subjectForm.department_id || null,
            section_id: subjectForm.section_id || null,
            strand_id: subjectForm.strand_id || null,
            track_id: subjectForm.track_id || null,
            shs_year_level: subjectForm.shs_year_level || null,
            jhs_year_level: subjectForm.jhs_year_level || null,
            college_year_level: subjectForm.college_year_level || null,
        };

        router.post(route('admin.academic.subjects.store'), cleanedForm, {
            preserveScroll: true,
            onSuccess: (page) => {
                console.log('Subject created successfully:', page);
                addToast("Subject created successfully!", "success");
                setSubjectForm({ name: '', code: '', description: '', academic_level_id: '', grade_levels: [], selected_grade_level: '', grading_period_ids: [], department_id: '', course_id: '', semester_id: '', units: 0, hours_per_week: 0, is_core: false, is_active: true, track_id: '', strand_id: '', shs_year_level: '', jhs_year_level: '', college_year_level: '', section_id: '' });
                setErrors({});
                setSubjectModal(false);
            },
            onError: (errors) => {
                console.log('Subject creation failed:', errors);
                console.log('Error details:', JSON.stringify(errors, null, 2));
                setErrors(errors);

                // Show specific error messages
                if (errors.code) {
                    const suggestedCode = `${subjectForm.code}_${Date.now().toString().slice(-4)}`;
                    addToast(`Subject code "${subjectForm.code}" already exists. Try "${suggestedCode}" instead.`, "error");
                    // Auto-suggest a new code
                    setSubjectForm(prev => ({ ...prev, code: suggestedCode }));
                } else if (errors.name) {
                    addToast(`Subject name error: ${errors.name}`, "error");
                } else if (errors.strand_id) {
                    addToast(`Strand is required for Senior High School subjects.`, "error");
                } else if (errors.section_id) {
                    addToast(`Section is required. Please select a section.`, "error");
                } else if (errors.shs_year_level) {
                    addToast(`Year level is required for Senior High School subjects.`, "error");
                } else {
                    // Show all error messages
                    const errorMessages = Object.entries(errors).map(([key, value]) => `${key}: ${value}`).join(', ');
                    addToast(`Failed to create subject. ${errorMessages}`, "error");
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
            grading_period_ids: subject.grading_period_ids || [],
            semester_ids: subject.semester_ids || [],
            shs_year_level: subject.shs_year_level || null,
            jhs_year_level: subject.jhs_year_level || null,
            college_year_level: subject.college_year_level || null,
            strand_id: subject.strand_id || null,
            course_id: subject.course_id || '',
            section_id: subject.section_id || null,
            units: subject.units,
            hours_per_week: subject.hours_per_week,
            is_core: subject.is_core,
            is_active: subject.is_active
        };

        console.log('Updating subject with data:', data);
        console.log('Section ID being sent:', subject.section_id);

        router.put(route('admin.academic.subjects.update', subject.id), data, {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Subject updated successfully');
                addToast("Subject updated successfully!", "success");
                setEditModal(false);
            },
            onError: (errors) => {
                console.error('Subject update failed:', errors);
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
        console.log('=== OPENING EDIT MODAL ===');
        console.log('Subject data:', subject);

        // Get department from course if not directly available
        const selectedCourse = subject.course_id ? courses.find(c => c.id === subject.course_id) : null;
        const departmentId = subject.department_id || (selectedCourse?.department_id);

        // Normalize semester_ids and grading_period_ids to ensure they're number arrays
        const normalizedSemesterIds = (subject.semester_ids || []).map(id => typeof id === 'number' ? id : parseInt(id));
        const normalizedGradingPeriodIds = (subject.grading_period_ids || []).map(id => typeof id === 'number' ? id : parseInt(id));

        // Properly initialize all fields with correct types for Select components
        const editData = {
            ...subject,
            track_id: subject.track_id?.toString() || '',
            strand_id: subject.strand_id?.toString() || '',
            semester_ids: normalizedSemesterIds,
            grading_period_ids: normalizedGradingPeriodIds,
            section_id: subject.section_id || undefined,
            jhs_year_level: subject.jhs_year_level || '',
            shs_year_level: subject.shs_year_level || '',
            college_year_level: subject.college_year_level || '',  // College year level
            department_id: departmentId,   // Get from course if not available
            course_id: subject.course_id,           // Keep as number
            grade_levels: subject.grade_levels || [], // Elementary grade levels
        };

        console.log('Edit data prepared:', {
            track_id: editData.track_id,
            strand_id: editData.strand_id,
            semester_ids: editData.semester_ids,
            grading_period_ids: editData.grading_period_ids,
            section_id: editData.section_id,
            shs_year_level: editData.shs_year_level,
            jhs_year_level: editData.jhs_year_level,
            grade_levels: editData.grade_levels,
        });

        setEditSubject(editData);
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
                                            <Button onClick={openSubjectModal} className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                Add Subject
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="w-[95vw] max-w-[900px] max-h-[85vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    {currentStep === 1 ? 'Select Academic Level' : `Add New Subject - ${selectedAcademicLevel?.name}`}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    {currentStep === 1 
                                                        ? 'Choose the academic level for your new subject'
                                                        : `Create a new subject for ${selectedAcademicLevel?.name}`
                                                    }
                                                </DialogDescription>
                                            </DialogHeader>
                                            
                                            {currentStep === 1 ? (
                                                // Step 1: Academic Level Selection
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {academicLevels.map((level) => (
                                                            <div
                                                                key={level.id}
                                                                onClick={() => selectAcademicLevel(level)}
                                                                className="p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="text-2xl">
                                                                        {getLevelIcon(level.key)}
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                                            {level.name}
                                                                        </h3>
                                                                        <p className="text-sm text-gray-600">
                                                                            {level.key === 'elementary' && 'Grades 1-6 with grade level selection'}
                                                                            {level.key === 'junior_highschool' && 'Grades 7-10 with year level selection'}
                                                                            {level.key === 'senior_highschool' && 'Grades 11-12 with track and strand selection'}
                                                                            {level.key === 'college' && 'College courses with department and course selection'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                // Step 2: Subject Form based on selected level
                                            <div className="space-y-4">
                                                    {/* Basic Subject Information */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Basic Information</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                </div>
                                                {/* Academic Classification - First Priority */}
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Academic Classification</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="subject-level">Academic Level</Label>
                                                            <div className="relative">
                                                                <Select
                                                                    value={subjectForm.academic_level_id}
                                                                    onValueChange={(value) => setSubjectForm({ ...subjectForm, academic_level_id: value, grading_period_ids: [], course_id: '' })}
                                                                    disabled={true}
                                                                >
                                                                    <SelectTrigger className="bg-gray-50 cursor-not-allowed">
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
                                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                                    <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                                                                        Selected
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Academic level was selected in the previous step
                                                            </p>
                                                    </div>
                                                    {/* Generic grading period for simple-period levels only (Elementary/JHS) */}
                                                    {(() => {
                                                        const sel = academicLevels.find(level => level.id.toString() === subjectForm.academic_level_id);
                                                            const shouldShow = sel?.key === 'elementary' || sel?.key === 'junior_highschool';
                                                        console.log('Debug - Generic Period - Selected Level:', sel);
                                                        console.log('Debug - Generic Period - Should Show:', shouldShow);
                                                        if (!shouldShow) return null;

                                                        const availablePeriods = subjectForm.academic_level_id
                                                            ? getGradingPeriodsByLevel(parseInt(subjectForm.academic_level_id)).filter(gp => gp.parent_id == null)
                                                            : [];

                                                        return (
                                                            <div>
                                                                <Label htmlFor="subject-grading">Grading Periods</Label>
                                                                <div className="space-y-2 p-3 border rounded-md">
                                                                    {availablePeriods.length === 0 ? (
                                                                        <p className="text-sm text-gray-500">No grading periods available</p>
                                                                    ) : (
                                                                        availablePeriods.map((gp) => (
                                                                            <div key={gp.id} className="flex items-center space-x-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    id={`gp-${gp.id}`}
                                                                                    checked={subjectForm.grading_period_ids.includes(gp.id.toString())}
                                                                                    onChange={(e) => {
                                                                                        const periodId = gp.id.toString();
                                                                                        if (e.target.checked) {
                                                                                            setSubjectForm({
                                                                                                ...subjectForm,
                                                                                                grading_period_ids: [...subjectForm.grading_period_ids, periodId]
                                                                                            });
                                                                                        } else {
                                                                                            setSubjectForm({
                                                                                                ...subjectForm,
                                                                                                grading_period_ids: subjectForm.grading_period_ids.filter(id => id !== periodId)
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                    className="rounded border-gray-300"
                                                                                />
                                                                                <Label htmlFor={`gp-${gp.id}`} className="text-sm font-normal cursor-pointer">
                                                                                    {gp.name} ({gp.code})
                                                                                </Label>
                                                                            </div>
                                                                        ))
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Select one or more grading periods for this subject
                                                                </p>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                                
                                                    {/* Year Level for Senior High School and College */}
                                                    {(() => {
                                                        const selectedLevel = academicLevels.find(level => level.id.toString() === subjectForm.academic_level_id);
                                                        const isShs = selectedLevel?.key === 'senior_highschool';
                                                        const isCollege = selectedLevel?.key === 'college';
                                                        return (isShs || isCollege) && (
                                                    <div>
                                                                <Label htmlFor="subject-year-level">Year Level</Label>
                                                                <Select
                                                                    value={isShs ? subjectForm.shs_year_level as unknown as string : subjectForm.college_year_level || ''}
                                                                    onValueChange={(v) => {
                                                                        if (isShs) {
                                                                            setSubjectForm(prev => ({ ...prev, shs_year_level: v }));
                                                                            } else {
                                                                            setSubjectForm(prev => ({ ...prev, college_year_level: v }));
                                                                        }
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select year level" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {isShs ? 
                                                                            Object.entries(shsYearLevels).map(([key, label]) => (
                                                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                                                            )) :
                                                                            Object.entries(yearLevels).map(([key, label]) => (
                                                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                                                            ))
                                                                        }
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        );
                                                    })()}
                                                    
                                                    {/* Track and Strand for Senior High School */}
                                                    {subjectForm.academic_level_id && academicLevels.find(level => level.id.toString() === subjectForm.academic_level_id)?.key === 'senior_highschool' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <Label htmlFor="subject-track">Track</Label>
                                                                <Select value={subjectForm.track_id as unknown as string} onValueChange={(v) => setSubjectForm(prev => ({ ...prev, track_id: v, strand_id: '' }))}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select track" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {(tracks || []).map((t) => (
                                                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                                                {t.name} ({t.code})
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                        </div>
                                                            <div>
                                                                <Label htmlFor="subject-strand">Strand</Label>
                                                                <Select value={subjectForm.strand_id as unknown as string} onValueChange={(v) => setSubjectForm(prev => ({ ...prev, strand_id: v }))} disabled={!subjectForm.track_id}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select strand" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {strands.filter(s => subjectForm.track_id && s.track_id.toString() === String(subjectForm.track_id)).map((s) => (
                                                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                                                {s.name} ({s.code})
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                    </div>
                                                )}
                                                
                                                    {/* Department and Course for College */}
                                                    {subjectForm.academic_level_id && academicLevels.find(level => level.id.toString() === subjectForm.academic_level_id)?.key === 'college' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="subject-dept">Department</Label>
                                                        <Select value={subjectForm.department_id} onValueChange={(value) => setSubjectForm({ ...subjectForm, department_id: value, course_id: '', semester_id: '', grading_period_id: '' })}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select department" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {departments.map((dept) => (
                                                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                        {dept.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="subject-course">Course</Label>
                                                        <Select value={subjectForm.course_id} onValueChange={(value) => setSubjectForm({ ...subjectForm, course_id: value })} disabled={!subjectForm.department_id}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select course (required for college subjects)" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {courses.filter(c => !subjectForm.department_id || c.department_id?.toString() === subjectForm.department_id).map((course) => (
                                                                    <SelectItem key={course.id} value={course.id.toString()}>
                                                                        {course.code} - {course.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Grade Level field - only show for Elementary level */}
                                                {isElementaryLevel() && (
                                                    <div>
                                                        <Label htmlFor="subject-grade-level">Grade Level</Label>
                                                        <Select 
                                                            value={subjectForm.selected_grade_level} 
                                                            onValueChange={(value) => {
                                                                setSubjectForm({
                                                                    ...subjectForm,
                                                                    selected_grade_level: value,
                                                                    grade_levels: [value] // Convert single selection to array for backend compatibility
                                                                });
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Grade Level" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {elementaryGradeLevels.map((grade) => (
                                                                    <SelectItem key={grade.value} value={grade.value}>
                                                                        {grade.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Select the grade level this subject applies to
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {/* Section field - only show for Elementary level when grade level is selected */}
                                                {isElementaryLevel() && subjectForm.selected_grade_level && (
                                                    <div>
                                                        <Label htmlFor="section_id">Section *</Label>
                                                        <Select 
                                                            value={subjectForm.section_id} 
                                                            onValueChange={(value) => setSubjectForm({...subjectForm, section_id: value})}
                                                            required
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select section (required)" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {(() => {
                                                                    // Filter sections by elementary level and selected grade level
                                                                    const elementarySections = sections.filter(section => {
                                                                        const level = academicLevels.find(l => l.id === section.academic_level_id);
                                                                        return level?.key === 'elementary' && 
                                                                               section.specific_year_level === subjectForm.selected_grade_level;
                                                                    });
                                                                    
                                                                    return elementarySections.map((section) => (
                                                                        <SelectItem key={section.id} value={section.id.toString()}>
                                                                            {section.name}
                                                                    </SelectItem>
                                                                    ));
                                                                })()}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors?.section_id && (
                                                            <Alert variant="destructive">
                                                                <AlertDescription>{errors.section_id}</AlertDescription>
                                                            </Alert>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Select a specific section for this subject (required)
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {/* Junior High: Year Level (Grade 7 to Grade 10) */}
                                                {(() => {
                                                    const selectedLevel = academicLevels.find(level => level.id.toString() === subjectForm.academic_level_id);
                                                    if (selectedLevel?.key !== 'junior_highschool') return null;
                                                    const jhsYearOptions = [
                                                        { value: 'grade_7', label: 'Grade 7' },
                                                        { value: 'grade_8', label: 'Grade 8' },
                                                        { value: 'grade_9', label: 'Grade 9' },
                                                        { value: 'grade_10', label: 'Grade 10' },
                                                    ];
                                                    return (
                                                    <div>
                                                            <Label htmlFor="jhs-year">Year Level</Label>
                                                            <Select value={subjectForm.jhs_year_level as unknown as string} onValueChange={(v) => setSubjectForm(prev => ({ ...prev, jhs_year_level: v }))}>
                                                            <SelectTrigger>
                                                                    <SelectValue placeholder="Select year level" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                    {jhsYearOptions.map(opt => (
                                                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    );
                                                })()}

                                                {/* Section field - only show for Junior High School level when year level is selected */}
                                                {(() => {
                                                    const selectedLevel = academicLevels.find(level => level.id.toString() === subjectForm.academic_level_id);
                                                    if (selectedLevel?.key !== 'junior_highschool' || !subjectForm.jhs_year_level) return null;
                                                    
                                                    return (
                                                        <div>
                                                            <Label htmlFor="section_id">Section *</Label>
                                                            <Select 
                                                                value={subjectForm.section_id} 
                                                                onValueChange={(value) => setSubjectForm({...subjectForm, section_id: value})}
                                                                required
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select section (required)" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {(() => {
                                                                        // Filter sections by junior high school level and selected year level
                                                                        const jhsSections = sections.filter(section => {
                                                                            const level = academicLevels.find(l => l.id === section.academic_level_id);
                                                                            return level?.key === 'junior_highschool' && 
                                                                                   section.specific_year_level === subjectForm.jhs_year_level;
                                                                        });
                                                                        
                                                                        return jhsSections.map((section) => (
                                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                                {section.name}
                                                                            </SelectItem>
                                                                        ));
                                                                    })()}
                                                                </SelectContent>
                                                            </Select>
                                                            {errors?.section_id && (
                                                                <Alert variant="destructive">
                                                                    <AlertDescription>{errors.section_id}</AlertDescription>
                                                                </Alert>
                                                            )}
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Select a specific section for this subject (required)
                                                            </p>
                                                        </div>
                                                    );
                                                })()}

                                                {/* Additional Period Selection for Senior High School and College */}
                                                {(() => {
                                                    const selectedLevel = academicLevels.find(level => level.id.toString() === subjectForm.academic_level_id);
                                                    const isShs = selectedLevel?.key === 'senior_highschool';
                                                    const isCollege = selectedLevel?.key === 'college';

                                                    if (isShs) {
                                                        const availableSemesters = subjectForm.academic_level_id ? getSemestersByLevel(parseInt(subjectForm.academic_level_id)) : [];

                                                        return (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label>Semesters</Label>
                                                                    <div className="space-y-2 p-3 border rounded-md">
                                                                        {availableSemesters.length === 0 ? (
                                                                            <p className="text-sm text-gray-500">No semesters available</p>
                                                                        ) : (
                                                                            availableSemesters.map((sem) => (
                                                                                <div key={sem.id} className="flex items-center space-x-2">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        id={`sem-${sem.id}`}
                                                                                        checked={subjectForm.semester_ids.includes(sem.id.toString())}
                                                                                        onChange={(e) => {
                                                                                            const semId = sem.id.toString();
                                                                                            if (e.target.checked) {
                                                                                                setSubjectForm({
                                                                                                    ...subjectForm,
                                                                                                    semester_ids: [...subjectForm.semester_ids, semId]
                                                                                                });
                                                                                            } else {
                                                                                                setSubjectForm({
                                                                                                    ...subjectForm,
                                                                                                    semester_ids: subjectForm.semester_ids.filter(id => id !== semId),
                                                                                                    grading_period_ids: subjectForm.grading_period_ids.filter(gpId => {
                                                                                                        const gp = gradingPeriods.find(p => p.id.toString() === gpId);
                                                                                                        return gp?.parent_id?.toString() !== semId;
                                                                                                    })
                                                                                                });
                                                                                            }
                                                                                        }}
                                                                                        className="rounded border-gray-300"
                                                                                    />
                                                                                    <Label htmlFor={`sem-${sem.id}`} className="text-sm font-normal cursor-pointer">
                                                                                        {sem.name}
                                                                                    </Label>
                                                                                </div>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Label>Grading Periods</Label>
                                                                    <div className="space-y-2 p-3 border rounded-md max-h-48 overflow-y-auto">
                                                                        {subjectForm.semester_ids.length === 0 ? (
                                                                            <p className="text-sm text-gray-500">Select a semester first</p>
                                                                        ) : (
                                                                            subjectForm.semester_ids.map((semId) => {
                                                                                const semester = gradingPeriods.find(gp => gp.id.toString() === semId);
                                                                                const periods = getPeriodsBySemester(semId);

                                                                                if (!semester || periods.length === 0) return null;

                                                                                return (
                                                                                    <div key={semId} className="space-y-2">
                                                                                        <div className="text-sm font-semibold text-blue-600 border-l-4 border-blue-600 pl-2">
                                                                                            {semester.name} Periods:
                                                                                        </div>
                                                                                        {periods.map((gp) => (
                                                                                            <div key={gp.id} className="flex items-center space-x-2 ml-6">
                                                                                                <input
                                                                                                    type="checkbox"
                                                                                                    id={`shs-gp-${gp.id}`}
                                                                                                    checked={subjectForm.grading_period_ids.includes(gp.id.toString())}
                                                                                                    onChange={(e) => {
                                                                                                        const periodId = gp.id.toString();
                                                                                                        if (e.target.checked) {
                                                                                                            setSubjectForm({
                                                                                                                ...subjectForm,
                                                                                                                grading_period_ids: [...subjectForm.grading_period_ids, periodId]
                                                                                                            });
                                                                                                        } else {
                                                                                                            setSubjectForm({
                                                                                                                ...subjectForm,
                                                                                                                grading_period_ids: subjectForm.grading_period_ids.filter(id => id !== periodId)
                                                                                                            });
                                                                                                        }
                                                                                                    }}
                                                                                                    className="rounded border-gray-300"
                                                                                                />
                                                                                                <Label htmlFor={`shs-gp-${gp.id}`} className="text-sm font-normal cursor-pointer">
                                                                                                    {gp.name}
                                                                                                </Label>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    if (isCollege) {
                                                        const availableSemesters = subjectForm.academic_level_id ? getSemestersByLevel(parseInt(subjectForm.academic_level_id)) : [];

                                                        return (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label>Semesters</Label>
                                                                    <div className="space-y-2 p-3 border rounded-md">
                                                                        {availableSemesters.length === 0 ? (
                                                                            <p className="text-sm text-gray-500">No semesters available</p>
                                                                        ) : (
                                                                            availableSemesters.map((sem) => (
                                                                                <div key={sem.id} className="flex items-center space-x-2">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        id={`college-sem-${sem.id}`}
                                                                                        checked={subjectForm.semester_ids.includes(sem.id.toString())}
                                                                                        onChange={(e) => {
                                                                                            const semId = sem.id.toString();
                                                                                            if (e.target.checked) {
                                                                                                setSubjectForm({
                                                                                                    ...subjectForm,
                                                                                                    semester_ids: [...subjectForm.semester_ids, semId]
                                                                                                });
                                                                                            } else {
                                                                                                setSubjectForm({
                                                                                                    ...subjectForm,
                                                                                                    semester_ids: subjectForm.semester_ids.filter(id => id !== semId),
                                                                                                    grading_period_ids: subjectForm.grading_period_ids.filter(gpId => {
                                                                                                        const gp = gradingPeriods.find(p => p.id.toString() === gpId);
                                                                                                        return gp?.parent_id?.toString() !== semId;
                                                                                                    })
                                                                                                });
                                                                                            }
                                                                                        }}
                                                                                        className="rounded border-gray-300"
                                                                                    />
                                                                                    <Label htmlFor={`college-sem-${sem.id}`} className="text-sm font-normal cursor-pointer">
                                                                                        {sem.name}
                                                                                    </Label>
                                                                                </div>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Label>Grading Periods</Label>
                                                                    <div className="space-y-2 p-3 border rounded-md max-h-48 overflow-y-auto">
                                                                        {subjectForm.semester_ids.length === 0 ? (
                                                                            <p className="text-sm text-gray-500">Select a semester first</p>
                                                                        ) : (
                                                                            subjectForm.semester_ids.map((semId) => {
                                                                                const semester = gradingPeriods.find(gp => gp.id.toString() === semId);
                                                                                const periods = getPeriodsBySemester(semId);

                                                                                if (!semester || periods.length === 0) return null;

                                                                                return (
                                                                                    <div key={semId} className="space-y-2">
                                                                                        <div className="text-sm font-semibold text-blue-600 border-l-4 border-blue-600 pl-2">
                                                                                            {semester.name} Periods:
                                                                                        </div>
                                                                                        {periods.map((gp) => (
                                                                                            <div key={gp.id} className="flex items-center space-x-2 ml-6">
                                                                                                <input
                                                                                                    type="checkbox"
                                                                                                    id={`college-gp-${gp.id}`}
                                                                                                    checked={subjectForm.grading_period_ids.includes(gp.id.toString())}
                                                                                                    onChange={(e) => {
                                                                                                        const periodId = gp.id.toString();
                                                                                                        if (e.target.checked) {
                                                                                                            setSubjectForm({
                                                                                                                ...subjectForm,
                                                                                                                grading_period_ids: [...subjectForm.grading_period_ids, periodId]
                                                                                                            });
                                                                                                        } else {
                                                                                                            setSubjectForm({
                                                                                                                ...subjectForm,
                                                                                                                grading_period_ids: subjectForm.grading_period_ids.filter(id => id !== periodId)
                                                                                                            });
                                                                                                        }
                                                                                                    }}
                                                                                                    className="rounded border-gray-300"
                                                                                                />
                                                                                                <Label htmlFor={`college-gp-${gp.id}`} className="text-sm font-normal cursor-pointer">
                                                                                                    {gp.name}
                                                                                                </Label>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    return null;
                                                })()}

                                                {/* Section field for Senior High School - show after Track, Strand, and Year Level are selected */}
                                                {(() => {
                                                    const selectedLevel = academicLevels.find(level => level.id.toString() === subjectForm.academic_level_id);

                                                    // Don't show if not SHS or if track, strand, or year level not selected
                                                    if (selectedLevel?.key !== 'senior_highschool' || !subjectForm.track_id || !subjectForm.strand_id || !subjectForm.shs_year_level) {
                                                        console.log('SHS Section field hidden:', {
                                                            is_shs: selectedLevel?.key === 'senior_highschool',
                                                            track_id: subjectForm.track_id,
                                                            strand_id: subjectForm.strand_id,
                                                            shs_year_level: subjectForm.shs_year_level,
                                                            reason: !subjectForm.track_id ? 'No track' : !subjectForm.strand_id ? 'No strand' : !subjectForm.shs_year_level ? 'No year level' : 'Not SHS'
                                                        });
                                                        return null;
                                                    }

                                                    return (
                                                        <div>
                                                            <Label htmlFor="section_id">Section *</Label>
                                                            <Select
                                                                value={subjectForm.section_id}
                                                                onValueChange={(value) => setSubjectForm({...subjectForm, section_id: value})}
                                                                required
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select section (required)" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {(() => {
                                                                        console.log('=== SHS Section Filtering ===');
                                                                        console.log('Form values:', {
                                                                            track_id: subjectForm.track_id,
                                                                            strand_id: subjectForm.strand_id,
                                                                            shs_year_level: subjectForm.shs_year_level
                                                                        });
                                                                        console.log('Total sections available:', sections.length);

                                                                        // Filter sections by senior high school level, track, strand, and grade level
                                                                        const shsSections = sections.filter(section => {
                                                                            const level = academicLevels.find(l => l.id === section.academic_level_id);
                                                                            const isShs = level?.key === 'senior_highschool';
                                                                            const matchesTrack = section.track_id?.toString() === subjectForm.track_id;
                                                                            const matchesStrand = section.strand_id?.toString() === subjectForm.strand_id;
                                                                            const matchesYearLevel = section.specific_year_level === subjectForm.shs_year_level;

                                                                            console.log(`Section ${section.id} (${section.name}):`, {
                                                                                track_id: section.track_id,
                                                                                strand_id: section.strand_id,
                                                                                specific_year_level: section.specific_year_level,
                                                                                isShs,
                                                                                matchesTrack,
                                                                                matchesStrand,
                                                                                matchesYearLevel,
                                                                                included: isShs && matchesTrack && matchesStrand && matchesYearLevel
                                                                            });

                                                                            return isShs && matchesTrack && matchesStrand && matchesYearLevel;
                                                                        });

                                                                        console.log('Filtered SHS sections count:', shsSections.length);
                                                                        console.log('Filtered SHS sections:', shsSections.map(s => ({ id: s.id, name: s.name, year_level: s.specific_year_level })));

                                                                        if (shsSections.length === 0) {
                                                                            return <SelectItem value="no-sections" disabled>No sections available for this combination</SelectItem>;
                                                                        }

                                                                        return shsSections.map((section) => (
                                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                                {section.name}
                                                                            </SelectItem>
                                                                        ));
                                                                    })()}
                                                                </SelectContent>
                                                            </Select>
                                                            {errors?.section_id && (
                                                                <Alert variant="destructive">
                                                                    <AlertDescription>{errors.section_id}</AlertDescription>
                                                                </Alert>
                                                            )}
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Select a specific section for this subject (required). Make sure Track, Strand, and Year Level are selected above.
                                                            </p>
                                                        </div>
                                                    );
                                                })()}

                                                {/* Section field for College - show after Department, Course, and Year Level are selected */}
                                                {(() => {
                                                    const selectedLevel = academicLevels.find(level => level.id.toString() === subjectForm.academic_level_id);
                                                    if (selectedLevel?.key !== 'college' || !subjectForm.department_id || !subjectForm.course_id || !subjectForm.college_year_level) return null;

                                                    return (
                                                        <div>
                                                            <Label htmlFor="section_id">Section *</Label>
                                                            <Select
                                                                value={subjectForm.section_id}
                                                                onValueChange={(value) => setSubjectForm({...subjectForm, section_id: value})}
                                                                required
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select section (required)" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {(() => {
                                                                        // Filter sections by college level, department, course, and year level
                                                                        const collegeSections = sections.filter(section => {
                                                                            const level = academicLevels.find(l => l.id === section.academic_level_id);
                                                                            return level?.key === 'college' &&
                                                                                   section.department_id?.toString() === subjectForm.department_id &&
                                                                                   section.course_id?.toString() === subjectForm.course_id &&
                                                                                   section.specific_year_level === subjectForm.college_year_level;
                                                                        });

                                                                        if (collegeSections.length === 0) {
                                                                            return <SelectItem value="no-sections" disabled>No sections available for this year level</SelectItem>;
                                                                        }

                                                                        return collegeSections.map((section) => (
                                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                                {section.name}
                                                                            </SelectItem>
                                                                        ));
                                                                    })()}
                                                                </SelectContent>
                                                            </Select>
                                                            {errors?.section_id && (
                                                                <Alert variant="destructive">
                                                                    <AlertDescription>{errors.section_id}</AlertDescription>
                                                                </Alert>
                                                            )}
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Select a specific section for this subject (required)
                                                            </p>
                                                        </div>
                                                    );
                                                })()}

                                                {/* Subject Details */}
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Subject Details</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                    </div>
                                                    <div className="flex items-center space-x-6">
                                                        <div className="flex items-center space-x-2">
                                                        <input
                                                            id="subject-core"
                                                            type="checkbox"
                                                            checked={subjectForm.is_core}
                                                            onChange={(e) => setSubjectForm({ ...subjectForm, is_core: e.target.checked })}
                                                            className="rounded border-gray-300"
                                                        />
                                                        <Label htmlFor="subject-core">Core Subject</Label>
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
                                                    </div>
                                                </div>
                                            )}
                                            <DialogFooter>
                                                {currentStep === 1 ? (
                                                    <>
                                                        <Button variant="outline" onClick={closeModal}>
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button variant="outline" onClick={goBackToLevelSelection}>
                                                            Back
                                                        </Button>
                                                        <Button variant="outline" onClick={closeModal}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={submitSubject}>
                                                    Create Subject
                                                </Button>
                                                    </>
                                                )}
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
                                                                {(() => {
                                                                    // Elementary subjects
                                                                    if (subject.academic_level.key === 'elementary' && subject.grade_levels && subject.grade_levels.length > 0) {
                                                                        return (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {subject.grade_levels.map((grade) => (
                                                                                    <Badge key={grade} variant="secondary" className="text-xs">
                                                                                        {elementaryGradeLevels.find(g => g.value === grade)?.label || grade}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        );
                                                                    }
                                                                    // Junior High School subjects
                                                                    if (subject.academic_level.key === 'junior_highschool' && subject.jhs_year_level) {
                                                                        const jhsLabels: Record<string, string> = {
                                                                            'grade_7': 'Grade 7',
                                                                            'grade_8': 'Grade 8',
                                                                            'grade_9': 'Grade 9',
                                                                            'grade_10': 'Grade 10'
                                                                        };
                                                                        return (
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {jhsLabels[subject.jhs_year_level] || subject.jhs_year_level}
                                                                            </Badge>
                                                                        );
                                                                    }
                                                                    // Senior High School subjects
                                                                    if (subject.academic_level.key === 'senior_highschool' && subject.shs_year_level) {
                                                                        const shsLabels = shsYearLevels;
                                                                        return (
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {shsLabels[subject.shs_year_level] || subject.shs_year_level}
                                                                            </Badge>
                                                                        );
                                                                    }
                                                                    // College subjects
                                                                    if (subject.academic_level.key === 'college' && subject.college_year_level) {
                                                                        const collegeLabels = yearLevels;
                                                                        return (
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {collegeLabels[subject.college_year_level] || subject.college_year_level}
                                                                            </Badge>
                                                                        );
                                                                    }
                                                                    return <span className="text-gray-400">-</span>;
                                                                })()}
                                                            </td>
                                                            <td className="p-3">
                                                                {subject.grading_periods && subject.grading_periods.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {subject.grading_periods.map((period) => (
                                                                            <Badge key={period.id} variant="outline" className="text-xs">
                                                                                {period.name}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                ) : subject.grading_period ? (
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
                                                                        <th className="text-left p-3">Period</th>
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
                                                                            <td className="p-3">
                                                                                {subject.grading_periods && subject.grading_periods.length > 0 ? (
                                                                                    <div className="flex flex-wrap gap-1">
                                                                                        {subject.grading_periods.map((period) => (
                                                                                            <Badge key={period.id} variant="outline" className="text-xs">
                                                                                                {period.code}
                                                                                            </Badge>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : subject.grading_period ? (
                                                                                    <Badge variant="outline" className="text-xs">
                                                                                        {subject.grading_period.code}
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
                                                                                    {subject.grading_periods && subject.grading_periods.length > 0 ? (
                                                                                        <div className="flex items-center gap-1 flex-wrap">
                                                                                            <Clock className="h-3 w-3" />
                                                                                            {subject.grading_periods.map((period, idx) => (
                                                                                                <span key={period.id}>
                                                                                                    {period.name}{idx < subject.grading_periods!.length - 1 ? ', ' : ''}
                                                                                                </span>
                                                                                            ))}
                                                                                        </div>
                                                                                    ) : subject.grading_period && (
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
                <DialogContent className="w-[95vw] max-w-[900px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Subject - {editSubject?.academic_level?.name}</DialogTitle>
                        <DialogDescription>
                            Update the subject details for {editSubject?.academic_level?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {editSubject && (
                        <div className="space-y-4">
                            {/* Basic Subject Information */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Basic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                        <Label htmlFor="edit-subject-name">Name</Label>
                                    <Input 
                                            id="edit-subject-name" 
                                            placeholder="e.g., Mathematics, English, Science" 
                                        value={editSubject.name} 
                                        onChange={(e) => setEditSubject({ ...editSubject, name: e.target.value })} 
                                    />
                                </div>
                                <div>
                                        <Label htmlFor="edit-subject-code">Code</Label>
                                    <Input 
                                            id="edit-subject-code" 
                                            placeholder="e.g., MATH101, ENG101" 
                                        value={editSubject.code} 
                                        onChange={(e) => setEditSubject({ ...editSubject, code: e.target.value })} 
                                    />
                                </div>
                            </div>
                            <div>
                                    <Label htmlFor="edit-subject-description">Description</Label>
                                <Input 
                                        id="edit-subject-description" 
                                        placeholder="Brief description of the subject" 
                                    value={editSubject.description || ''} 
                                    onChange={(e) => setEditSubject({ ...editSubject, description: e.target.value })} 
                                />
                            </div>
                            </div>
                            
                            {/* Academic Classification - Read-only for edit */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Academic Classification</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                        <Label htmlFor="edit-subject-level">Academic Level</Label>
                                        <div className="relative">
                                            <Select 
                                                value={editSubject.academic_level_id.toString()} 
                                                onValueChange={(value) => setEditSubject({ ...editSubject, academic_level_id: Number(value), grading_period_id: undefined, course_id: undefined })}
                                                disabled={true}
                                            >
                                                <SelectTrigger className="bg-gray-50 cursor-not-allowed">
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
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                                                    Selected
                                                </span>
                                </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Academic level cannot be changed when editing
                                        </p>
                                    </div>
                                    {/* Generic grading period for simple-period levels only (Elementary/JHS) */}
                                {(() => {
                                        const sel = academicLevels.find(level => level.id === editSubject.academic_level_id);
                                        const shouldShow = sel?.key === 'elementary' || sel?.key === 'junior_highschool';
                                        if (!shouldShow) return null;

                                        const availablePeriods = editSubject.academic_level_id
                                            ? getGradingPeriodsByLevel(editSubject.academic_level_id).filter(gp => gp.parent_id == null)
                                            : [];

                                        // Get current grading period IDs
                                        const currentGradingPeriodIds = editSubject.grading_period_ids ||
                                            (editSubject.grading_period_id ? [editSubject.grading_period_id] : []);

                                    return (
                                        <div>
                                                <Label htmlFor="edit-subject-grading">Grading Periods</Label>
                                                <div className="space-y-2 p-3 border rounded-md">
                                                    {availablePeriods.length === 0 ? (
                                                        <p className="text-sm text-gray-500">No grading periods available</p>
                                                    ) : (
                                                        availablePeriods.map((gp) => (
                                                            <div key={gp.id} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`edit-gp-${gp.id}`}
                                                                    checked={currentGradingPeriodIds.includes(gp.id)}
                                                                    onChange={(e) => {
                                                                        const periodId = gp.id;
                                                                        let updatedIds = [...currentGradingPeriodIds];
                                                                        if (e.target.checked) {
                                                                            if (!updatedIds.includes(periodId)) {
                                                                                updatedIds.push(periodId);
                                                                            }
                                                                        } else {
                                                                            updatedIds = updatedIds.filter(id => id !== periodId);
                                                                        }
                                                                        setEditSubject({
                                                                            ...editSubject,
                                                                            grading_period_ids: updatedIds
                                                                        });
                                                                    }}
                                                                    className="rounded border-gray-300"
                                                                />
                                                                <Label htmlFor={`edit-gp-${gp.id}`} className="text-sm font-normal cursor-pointer">
                                                                    {gp.name} ({gp.code})
                                                                </Label>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Select one or more grading periods for this subject
                                                </p>
                                        </div>
                                    );
                                })()}

                                {/* Elementary: Grade Level - Edit */}
                                {(() => {
                                    const selectedLevel = academicLevels.find(level => level.id === editSubject.academic_level_id);
                                    if (selectedLevel?.key !== 'elementary') return null;

                                    // Get the first grade level from the array
                                    const currentGradeLevel = editSubject.grade_levels?.[0] || '';

                                    return (
                                        <div>
                                            <Label htmlFor="edit-elem-grade">Grade Level</Label>
                                            <Select
                                                value={currentGradeLevel}
                                                onValueChange={(v) => setEditSubject({ ...editSubject, grade_levels: [v] })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select grade level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {elementaryGradeLevels.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    );
                                })()}

                                {/* Section for Elementary - Edit */}
                                {(() => {
                                    const selectedLevel = academicLevels.find(level => level.id === editSubject.academic_level_id);
                                    if (selectedLevel?.key !== 'elementary') return null;

                                    const currentGradeLevel = editSubject.grade_levels?.[0] || '';
                                    console.log('Elementary Edit Modal - Grade Level:', currentGradeLevel);
                                    console.log('Elementary Edit Modal - Section ID:', editSubject.section_id);

                                    if (!currentGradeLevel) return null;

                                    return (
                                        <div>
                                            <Label htmlFor="edit-elem-section">Section *</Label>
                                            <Select
                                                value={editSubject.section_id?.toString() || ''}
                                                onValueChange={(value) => {
                                                    console.log('Elementary Section Changed:', value);
                                                    setEditSubject({ ...editSubject, section_id: parseInt(value) });
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select section" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(() => {
                                                        // Filter sections by elementary level and grade level
                                                        const elemSections = sections.filter(section => {
                                                            const level = academicLevels.find(l => l.id === section.academic_level_id);
                                                            return level?.key === 'elementary' &&
                                                                   section.specific_year_level === currentGradeLevel;
                                                        });

                                                        console.log('Available Elementary Sections:', elemSections);
                                                        console.log('Looking for section with ID:', editSubject.section_id);

                                                        if (elemSections.length === 0) {
                                                            return <SelectItem value="no-sections" disabled>No sections available</SelectItem>;
                                                        }

                                                        return elemSections.map((section) => (
                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                {section.name}
                                                            </SelectItem>
                                                        ));
                                                    })()}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Select a specific section for this subject
                                            </p>
                                        </div>
                                    );
                                })()}

                                {/* Junior High: Year Level - Edit */}
                            {(() => {
                                    const selectedLevel = academicLevels.find(level => level.id === editSubject.academic_level_id);
                                    if (selectedLevel?.key !== 'junior_highschool') return null;
                                    const jhsYearOptions = [
                                        { value: 'grade_7', label: 'Grade 7' },
                                        { value: 'grade_8', label: 'Grade 8' },
                                        { value: 'grade_9', label: 'Grade 9' },
                                        { value: 'grade_10', label: 'Grade 10' },
                                    ];
                                return (
                                        <div>
                                            <Label htmlFor="edit-jhs-year">Year Level</Label>
                                            <Select value={editSubject.jhs_year_level || ''} onValueChange={(v) => setEditSubject({ ...editSubject, jhs_year_level: v })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select year level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {jhsYearOptions.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    );
                                })()}

                                {/* Section for Junior High School - Edit */}
                                {(() => {
                                    const selectedLevel = academicLevels.find(level => level.id === editSubject.academic_level_id);
                                    if (selectedLevel?.key !== 'junior_highschool' || !editSubject.jhs_year_level) return null;

                                    console.log('JHS Edit Modal - Year Level:', editSubject.jhs_year_level);
                                    console.log('JHS Edit Modal - Section ID:', editSubject.section_id);

                                    return (
                                        <div>
                                            <Label htmlFor="edit-jhs-section">Section *</Label>
                                            <Select
                                                value={editSubject.section_id?.toString() || ''}
                                                onValueChange={(value) => {
                                                    console.log('JHS Section Changed:', value);
                                                    setEditSubject({ ...editSubject, section_id: parseInt(value) });
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select section" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(() => {
                                                        // Filter sections by junior high school level and year level
                                                        const jhsSections = sections.filter(section => {
                                                            const level = academicLevels.find(l => l.id === section.academic_level_id);
                                                            return level?.key === 'junior_highschool' &&
                                                                   section.specific_year_level === editSubject.jhs_year_level;
                                                        });

                                                        console.log('Available JHS Sections:', jhsSections);
                                                        console.log('Looking for section with ID:', editSubject.section_id);

                                                        if (jhsSections.length === 0) {
                                                            return <SelectItem value="no-sections" disabled>No sections available</SelectItem>;
                                                        }

                                                        return jhsSections.map((section) => (
                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                {section.name}
                                                            </SelectItem>
                                                        ));
                                                    })()}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Select a specific section for this subject
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>

                                {/* Year Level for Senior High School and College */}
                            {(() => {
                                    const selectedLevel = academicLevels.find(level => level.id === editSubject.academic_level_id);
                                    const isShs = selectedLevel?.key === 'senior_highschool';
                                    const isCollege = selectedLevel?.key === 'college';
                                    return (isShs || isCollege) && (
                                        <div>
                                            <Label htmlFor="edit-subject-year-level">Year Level</Label>
                                            <Select
                                                value={isShs ? editSubject.shs_year_level || '' : editSubject.college_year_level || ''}
                                                onValueChange={(v) => {
                                                    if (isShs) {
                                                        setEditSubject({ ...editSubject, shs_year_level: v });
                                                    } else {
                                                        setEditSubject({ ...editSubject, college_year_level: v });
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select year level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {isShs ? 
                                                        Object.entries(shsYearLevels).map(([key, label]) => (
                                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                                        )) :
                                                        Object.entries(yearLevels).map(([key, label]) => (
                                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    );
                                })()}
                                
                                {/* Track and Strand for Senior High School */}
                                {editSubject.academic_level_id && academicLevels.find(level => level.id === editSubject.academic_level_id)?.key === 'senior_highschool' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="edit-subject-track">Track</Label>
                                            <Select value={editSubject.track_id || ''} onValueChange={(v) => setEditSubject({ ...editSubject, track_id: v, strand_id: '' })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select track" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(tracks || []).map((t) => (
                                                        <SelectItem key={t.id} value={t.id.toString()}>
                                                            {t.name} ({t.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="edit-subject-strand">Strand</Label>
                                            <Select value={editSubject.strand_id || ''} onValueChange={(v) => setEditSubject({ ...editSubject, strand_id: v })} disabled={!editSubject.track_id}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select strand" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {strands.filter(s => editSubject.track_id && s.track_id.toString() === String(editSubject.track_id)).map((s) => (
                                                        <SelectItem key={s.id} value={s.id.toString()}>
                                                            {s.name} ({s.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}

                                {/* Section for Senior High School - Edit */}
                                {(() => {
                                    const selectedLevel = academicLevels.find(level => level.id === editSubject.academic_level_id);
                                    if (selectedLevel?.key !== 'senior_highschool' || !editSubject.track_id || !editSubject.strand_id || !editSubject.shs_year_level) return null;

                                    console.log('SHS Edit Modal - Track ID:', editSubject.track_id);
                                    console.log('SHS Edit Modal - Strand ID:', editSubject.strand_id);
                                    console.log('SHS Edit Modal - Year Level:', editSubject.shs_year_level);
                                    console.log('SHS Edit Modal - Section ID:', editSubject.section_id);

                                    return (
                                        <div>
                                            <Label htmlFor="edit-shs-section">Section *</Label>
                                            <Select
                                                value={editSubject.section_id?.toString() || ''}
                                                onValueChange={(value) => {
                                                    console.log('SHS Section Changed:', value);
                                                    setEditSubject({ ...editSubject, section_id: parseInt(value) });
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select section" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(() => {
                                                        // Filter sections by senior high school level, track, strand, and year level
                                                        const shsSections = sections.filter(section => {
                                                            const level = academicLevels.find(l => l.id === section.academic_level_id);
                                                            return level?.key === 'senior_highschool' &&
                                                                   section.track_id?.toString() === editSubject.track_id &&
                                                                   section.strand_id?.toString() === editSubject.strand_id &&
                                                                   section.specific_year_level === editSubject.shs_year_level;
                                                        });

                                                        console.log('Available SHS Sections:', shsSections);
                                                        console.log('Looking for section with ID:', editSubject.section_id);

                                                        if (shsSections.length === 0) {
                                                            return <SelectItem value="no-sections" disabled>No sections available</SelectItem>;
                                                        }

                                                        return shsSections.map((section) => (
                                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                                {section.name}
                                                            </SelectItem>
                                                        ));
                                                    })()}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Select a specific section for this subject
                                            </p>
                                        </div>
                                    );
                                })()}

                                {/* Department and Course for College */}
                            {editSubject.academic_level_id && academicLevels.find(level => level.id === editSubject.academic_level_id)?.key === 'college' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                            <Label htmlFor="edit-subject-dept">Department</Label>
                                            <Select value={editSubject.department_id?.toString() || ''} onValueChange={(value) => setEditSubject({ ...editSubject, department_id: Number(value), course_id: undefined, semester_id: undefined, grading_period_id: undefined })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map((dept) => (
                                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                                            {dept.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="edit-subject-course">Course</Label>
                                            <Select value={editSubject.course_id?.toString() || ''} onValueChange={(value) => setEditSubject({ ...editSubject, course_id: Number(value) })} disabled={!editSubject.department_id}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select course (required for college subjects)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                                    {courses.filter(c => !editSubject.department_id || c.department_id === editSubject.department_id).map((course) => (
                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                    {course.code} - {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                        </div>
                                </div>
                            )}

                            {/* Section for College - Edit */}
                            {(() => {
                                const selectedLevel = academicLevels.find(level => level.id === editSubject.academic_level_id);
                                if (selectedLevel?.key !== 'college' || !editSubject.department_id || !editSubject.course_id || !editSubject.college_year_level) return null;

                                return (
                                    <div>
                                        <Label htmlFor="edit-college-section">Section *</Label>
                                        <Select
                                            value={editSubject.section_id?.toString() || ''}
                                            onValueChange={(value) => setEditSubject({ ...editSubject, section_id: parseInt(value) })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select section" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(() => {
                                                    // Filter sections by college level, department, course, and year level
                                                    const collegeSections = sections.filter(section => {
                                                        const level = academicLevels.find(l => l.id === section.academic_level_id);
                                                        return level?.key === 'college' &&
                                                               section.department_id === editSubject.department_id &&
                                                               section.course_id === editSubject.course_id &&
                                                               section.specific_year_level === editSubject.college_year_level;
                                                    });

                                                    if (collegeSections.length === 0) {
                                                        return <SelectItem value="no-sections" disabled>No sections available</SelectItem>;
                                                    }

                                                    return collegeSections.map((section) => (
                                                        <SelectItem key={section.id} value={section.id.toString()}>
                                                            {section.name}
                                                        </SelectItem>
                                                    ));
                                                })()}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Select a specific section for this subject
                                        </p>
                                    </div>
                                );
                            })()}
                            </div>

                            {/* Additional Period Selection for Senior High School and College */}
                            {(() => {
                                const selectedLevel = academicLevels.find(level => level.id === editSubject.academic_level_id);
                                const isShs = selectedLevel?.key === 'senior_highschool';
                                const isCollege = selectedLevel?.key === 'college';

                                if (isShs) {
                                    const availableSemesters = editSubject.academic_level_id ? getSemestersByLevel(editSubject.academic_level_id) : [];
                                    const currentSemesterIds = editSubject.semester_ids || [];
                                    const currentGradingPeriodIds = editSubject.grading_period_ids || [];

                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Semesters</Label>
                                                <div className="space-y-2 p-3 border rounded-md">
                                                    {availableSemesters.length === 0 ? (
                                                        <p className="text-sm text-gray-500">No semesters available</p>
                                                    ) : (
                                                        availableSemesters.map((sem) => (
                                                            <div key={sem.id} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`edit-sem-${sem.id}`}
                                                                    checked={currentSemesterIds.includes(sem.id)}
                                                                    onChange={(e) => {
                                                                        const semId = sem.id;
                                                                        if (e.target.checked) {
                                                                            setEditSubject({
                                                                                ...editSubject,
                                                                                semester_ids: [...currentSemesterIds, semId]
                                                                            });
                                                                        } else {
                                                                            setEditSubject({
                                                                                ...editSubject,
                                                                                semester_ids: currentSemesterIds.filter(id => id !== semId),
                                                                                grading_period_ids: currentGradingPeriodIds.filter(gpId => {
                                                                                    const gp = gradingPeriods.find(p => p.id === gpId);
                                                                                    return gp?.parent_id !== semId;
                                                                                })
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="rounded border-gray-300"
                                                                />
                                                                <Label htmlFor={`edit-sem-${sem.id}`} className="text-sm font-normal cursor-pointer">
                                                                    {sem.name}
                                                                </Label>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Grading Periods</Label>
                                                <div className="space-y-2 p-3 border rounded-md max-h-48 overflow-y-auto">
                                                    {currentSemesterIds.length === 0 ? (
                                                        <p className="text-sm text-gray-500">Select a semester first</p>
                                                    ) : (
                                                        currentSemesterIds.map((semId) => {
                                                            const semester = gradingPeriods.find(gp => gp.id === semId);
                                                            const periods = getPeriodsBySemester(semId.toString());

                                                            if (!semester || periods.length === 0) return null;

                                                            return (
                                                                <div key={semId} className="space-y-2">
                                                                    <div className="text-sm font-semibold text-blue-600 border-l-4 border-blue-600 pl-2">
                                                                        {semester.name} Periods:
                                                                    </div>
                                                                    {periods.map((gp) => (
                                                                        <div key={gp.id} className="flex items-center space-x-2 ml-6">
                                                                            <input
                                                                                type="checkbox"
                                                                                id={`edit-shs-gp-${gp.id}`}
                                                                                checked={currentGradingPeriodIds.includes(gp.id)}
                                                                                onChange={(e) => {
                                                                                    const periodId = gp.id;
                                                                                    if (e.target.checked) {
                                                                                        setEditSubject({
                                                                                            ...editSubject,
                                                                                            grading_period_ids: [...currentGradingPeriodIds, periodId]
                                                                                        });
                                                                                    } else {
                                                                                        setEditSubject({
                                                                                            ...editSubject,
                                                                                            grading_period_ids: currentGradingPeriodIds.filter(id => id !== periodId)
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                className="rounded border-gray-300"
                                                                            />
                                                                            <Label htmlFor={`edit-shs-gp-${gp.id}`} className="text-sm font-normal cursor-pointer">
                                                                                {gp.name}
                                                                            </Label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                
                                if (isCollege) {
                                    const availableSemesters = editSubject.academic_level_id ? getSemestersByLevel(editSubject.academic_level_id) : [];
                                    const currentSemesterIds = editSubject.semester_ids || [];
                                    const currentGradingPeriodIds = editSubject.grading_period_ids || [];

                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Semesters</Label>
                                                <div className="space-y-2 p-3 border rounded-md">
                                                    {availableSemesters.length === 0 ? (
                                                        <p className="text-sm text-gray-500">No semesters available</p>
                                                    ) : (
                                                        availableSemesters.map((sem) => (
                                                            <div key={sem.id} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`edit-college-sem-${sem.id}`}
                                                                    checked={currentSemesterIds.includes(sem.id)}
                                                                    onChange={(e) => {
                                                                        const semId = sem.id;
                                                                        if (e.target.checked) {
                                                                            setEditSubject({
                                                                                ...editSubject,
                                                                                semester_ids: [...currentSemesterIds, semId]
                                                                            });
                                                                        } else {
                                                                            setEditSubject({
                                                                                ...editSubject,
                                                                                semester_ids: currentSemesterIds.filter(id => id !== semId),
                                                                                grading_period_ids: currentGradingPeriodIds.filter(gpId => {
                                                                                    const gp = gradingPeriods.find(p => p.id === gpId);
                                                                                    return gp?.parent_id !== semId;
                                                                                })
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="rounded border-gray-300"
                                                                />
                                                                <Label htmlFor={`edit-college-sem-${sem.id}`} className="text-sm font-normal cursor-pointer">
                                                                    {sem.name}
                                                                </Label>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Grading Periods</Label>
                                                <div className="space-y-2 p-3 border rounded-md max-h-48 overflow-y-auto">
                                                    {currentSemesterIds.length === 0 ? (
                                                        <p className="text-sm text-gray-500">Select a semester first</p>
                                                    ) : (
                                                        currentSemesterIds.map((semId) => {
                                                            const semester = gradingPeriods.find(gp => gp.id === semId);
                                                            const periods = getPeriodsBySemester(semId.toString());

                                                            if (!semester || periods.length === 0) return null;

                                                            return (
                                                                <div key={semId} className="space-y-2">
                                                                    <div className="text-sm font-semibold text-blue-600 border-l-4 border-blue-600 pl-2">
                                                                        {semester.name} Periods:
                                                                    </div>
                                                                    {periods.map((gp) => (
                                                                        <div key={gp.id} className="flex items-center space-x-2 ml-6">
                                                                            <input
                                                                                type="checkbox"
                                                                                id={`edit-college-gp-${gp.id}`}
                                                                                checked={currentGradingPeriodIds.includes(gp.id)}
                                                                                onChange={(e) => {
                                                                                    const periodId = gp.id;
                                                                                    if (e.target.checked) {
                                                                                        setEditSubject({
                                                                                            ...editSubject,
                                                                                            grading_period_ids: [...currentGradingPeriodIds, periodId]
                                                                                        });
                                                                                    } else {
                                                                                        setEditSubject({
                                                                                            ...editSubject,
                                                                                            grading_period_ids: currentGradingPeriodIds.filter(id => id !== periodId)
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                className="rounded border-gray-300"
                                                                            />
                                                                            <Label htmlFor={`edit-college-gp-${gp.id}`} className="text-sm font-normal cursor-pointer">
                                                                                {gp.name}
                                                                            </Label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                
                                return null;
                            })()}
                            
                            {/* Subject Details */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Subject Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="edit-subject-units">Units</Label>
                                                                                <Input 
                                            id="edit-subject-units" 
                                                type="number" 
                                                min="0" 
                                                step="0.5"
                                                value={editSubject.units} 
                                                onChange={(e) => setEditSubject({ ...editSubject, units: parseFloat(e.target.value) || 0 })} 
                                            />
                                </div>
                                <div>
                                        <Label htmlFor="edit-subject-hours">Hours per Week</Label>
                                    <Input 
                                            id="edit-subject-hours" 
                                        type="number" 
                                        min="0" 
                                        value={editSubject.hours_per_week} 
                                        onChange={(e) => setEditSubject({ ...editSubject, hours_per_week: parseInt(e.target.value) || 0 })} 
                                    />
                                </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                    <input
                                            id="edit-subject-core"
                                        type="checkbox"
                                        checked={editSubject.is_core}
                                        onChange={(e) => setEditSubject({ ...editSubject, is_core: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                        <Label htmlFor="edit-subject-core">Core Subject</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                            id="edit-subject-active"
                                    type="checkbox"
                                    checked={editSubject.is_active}
                                    onChange={(e) => setEditSubject({ ...editSubject, is_active: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                        <Label htmlFor="edit-subject-active">Active</Label>
                                    </div>
                                </div>
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


