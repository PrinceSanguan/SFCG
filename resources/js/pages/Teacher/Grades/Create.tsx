import { Header } from '@/components/teacher/header';
import { Sidebar } from '@/components/teacher/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useEffect } from 'react';


interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface AssignedSubject {
    id: number;
    subject: {
        id: number;
        name: string;
        code: string;
        course?: {
            id: number;
            name: string;
            code: string;
        };
    };
    academicLevel: {
        id: number;
        name: string;
        key: string;
    };
    gradingPeriod?: {
        id: number;
        name: string;
    };
    school_year: string;
    is_active: boolean;
    enrolled_students: Array<{
        id: number;
        student: {
            id: number;
            name: string;
            email: string;
        };
        semester?: string;
        is_active: boolean;
        school_year: string;
    }>;
    student_count: number;
}



interface AcademicLevel {
    id: number;
    name: string;
    key: string;
}

interface GradingPeriod {
    id: number;
    name: string;
    code: string;
    start_date: string;
    end_date: string;
    sort_order: number;
    is_active: boolean;
    academic_level_id: number;
}

interface CreateProps {
    user: User;
    academicLevels: AcademicLevel[];
    gradingPeriods: GradingPeriod[];
    assignedSubjects: AssignedSubject[];
    selectedStudent?: {
        id: number;
        name: string;
        email: string;
        subjectId?: number;
        academicLevelKey?: string;
    };
}

export default function Create({ user, academicLevels, gradingPeriods, assignedSubjects, selectedStudent }: CreateProps) {
    // Get the academic levels that the teacher is actually assigned to teach
    const teacherAcademicLevels = assignedSubjects.map(subject => subject.academicLevel);
    
    // Get grading periods that are relevant to the teacher's assigned subjects
    const teacherGradingPeriods = gradingPeriods.filter(period => 
        teacherAcademicLevels.some(level => level.id === period.academic_level_id)
    );
    
    // Create quarter options based on what the teacher actually has access to
    const getQuarterOptions = () => {
        const availableQuarters = new Set<number>();
        
        // Check which quarters are available for the teacher's academic levels
        teacherGradingPeriods.forEach(period => {
            if (period.code.includes('Q1')) availableQuarters.add(1);
            if (period.code.includes('Q2')) availableQuarters.add(2);
            if (period.code.includes('Q3')) availableQuarters.add(3);
            if (period.code.includes('Q4')) availableQuarters.add(4);
        });
        
        // Convert to array and sort
        return Array.from(availableQuarters)
            .sort()
            .map((quarter: number) => ({
                id: quarter,
                name: `${quarter}${quarter === 1 ? 'st' : quarter === 2 ? 'nd' : quarter === 3 ? 'rd' : 'th'} Quarter`,
                value: quarter.toString()
            }));
    };
    
    const quarterOptions = getQuarterOptions();
    
    // Debug logging to see what's available
    console.log('Teacher Create component data:', {
        teacherAcademicLevels: teacherAcademicLevels.map(level => ({ id: level.id, name: level.name, key: level.key })),
        teacherGradingPeriods: teacherGradingPeriods.map(period => ({ id: period.id, name: period.name, code: period.code, academic_level_id: period.academic_level_id })),
        availableQuarters: quarterOptions.map(q => q.name)
    });
    
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        subject_id: '',
        academic_level_id: '',
        grading_period_id: '0',
        school_year: '2024-2025',
        year_of_study: '',
        grade: '',
    });

    useEffect(() => {
        // Check for URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const studentId = urlParams.get('student_id');
        const subjectId = urlParams.get('subject_id');
        const academicLevelId = urlParams.get('academic_level_id');
        const academicLevelKey = urlParams.get('academic_level_key');
        const schoolYear = urlParams.get('school_year');
        
        if (studentId && subjectId && academicLevelId) {
            // Auto-populate form from URL parameters
            setData('student_id', studentId);
            setData('subject_id', subjectId);
            setData('academic_level_id', academicLevelId);
            setData('school_year', schoolYear || '2024-2025');
            setData('year_of_study', '');
            setData('grade', '');
            
            // Store academic level key for grade validation
            if (academicLevelKey) {
                // Find the academic level object to get the key
                const academicLevel = academicLevels.find(level => level.id.toString() === academicLevelId);
                if (academicLevel) {
                    // Update the form data to trigger grade field updates
                    setData('academic_level_id', academicLevelId);
                }
            }
            
            // Clear URL parameters after populating
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        } else if (selectedStudent) {
            // Fallback to selectedStudent prop
            setData('student_id', selectedStudent.id.toString());
            setData('subject_id', selectedStudent.subjectId?.toString() || '');
            setData('academic_level_id', selectedStudent.academicLevelKey || '');
            setData('school_year', '2024-2025');
            setData('year_of_study', '');
            setData('grade', '');
        }
    }, [selectedStudent, setData]);

    // Function to get subject and academic level when student is selected
    const getStudentSubjectInfo = (studentId: string) => {
        if (!studentId) return null;
        
        for (const subject of assignedSubjects) {
            const enrollment = subject.enrolled_students.find(e => e.student.id.toString() === studentId);
            if (enrollment) {
                return {
                    subjectId: subject.subject.id,
                    academicLevelId: subject.academicLevel.id,
                    academicLevelKey: subject.academicLevel.key,
                    schoolYear: subject.school_year
                };
            }
        }
        return null;
    };

    // Handle student selection
    const handleStudentChange = (studentId: string) => {
        setData('student_id', studentId);
        
        if (studentId) {
            const subjectInfo = getStudentSubjectInfo(studentId);
            if (subjectInfo) {
                setData('subject_id', subjectInfo.subjectId.toString());
                setData('academic_level_id', subjectInfo.academicLevelId.toString());
                setData('school_year', subjectInfo.schoolYear);
            }
        } else {
            // Clear related fields if no student selected
            setData('subject_id', '');
            setData('academic_level_id', '');
            setData('grade', '');
        }
    };

    // Get current academic level key for grade validation
    const getCurrentAcademicLevelKey = () => {
        // For teachers, always use college grading scale since they work with SHS students
        // SHS uses the same 1.0-5.0 scale as college
        return 'college';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Map quarter values back to grading period IDs
        const formData = { ...data };
        if (data.grading_period_id && data.grading_period_id !== '0') {
            // Find the grading period that matches the selected quarter and academic level
            const currentLevel = academicLevels.find(l => l.id.toString() === data.academic_level_id);
            if (currentLevel) {
                // Use the filtered grading periods that are relevant to the teacher
                const matchingPeriod = teacherGradingPeriods.find(period => 
                    period.academic_level_id === currentLevel.id && 
                    period.code.includes(`Q${data.grading_period_id}`)
                );
                if (matchingPeriod) {
                    formData.grading_period_id = matchingPeriod.id.toString();
                }
            }
        }
        
        // Debug logging
        console.log('Form submitted with data:', formData);
        console.log('Has pre-selected student:', hasPreSelectedStudent);
        
        post(route('teacher.grades.store'), {
            onSuccess: () => {
                console.log('Grade created successfully');
            },
            onError: (errors) => {
                console.log('Grade creation failed:', errors);
            },
        });
    };

    // Check if we have a pre-selected student (from URL params or props)
    const hasPreSelectedStudent = data.student_id && data.subject_id && data.academic_level_id;

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <Link href={route('teacher.grades.index')}>
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Grades
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {hasPreSelectedStudent ? 'Input Grade' : 'Input New Grade'}
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {hasPreSelectedStudent 
                                            ? 'Enter a grade for the selected student.'
                                            : 'Enter a new grade for a student in your assigned course.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Grade Form */}
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5" />
                                    {hasPreSelectedStudent ? 'Grade Information' : 'Grade Information'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hasPreSelectedStudent ? (
                                    // Simplified form for pre-selected student
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Student Info Display */}
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                Student Information
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Student:</span>
                                                    <p className="font-medium">
                                                        {assignedSubjects.find(s => 
                                                            s.enrolled_students.some(e => e.student.id.toString() === data.student_id)
                                                        )?.enrolled_students.find(e => e.student.id.toString() === data.student_id)?.student.name || 'Unknown'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Subject:</span>
                                                    <p className="font-medium">
                                                        {assignedSubjects.find(s => s.subject.id.toString() === data.subject_id)?.subject.name || 'Unknown'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Academic Level:</span>
                                                    <p className="font-medium">
                                                        {academicLevels.find(l => l.id.toString() === data.academic_level_id)?.name || 'Unknown'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">School Year:</span>
                                                    <p className="font-medium">{data.school_year}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Grade Input and Grading Period */}
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="grade">Grade</Label>
                                                <Input
                                                    id="grade"
                                                    type="number"
                                                    step="0.1"
                                                    min="1.0"
                                                    max="5.0"
                                                    placeholder="Enter grade (1.0-5.0)"
                                                    value={data.grade}
                                                    onChange={(e) => setData('grade', e.target.value)}
                                                    className={errors.grade ? 'border-red-500' : ''}
                                                    autoFocus
                                                />
                                                {errors.grade && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.grade}</p>
                                                )}
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Senior High School: 1.0 (highest) to 5.0 (lowest). 3.0 is passing (equivalent to 75).
                                                </p>
                                            </div>

                                            <div>
                                                <Label htmlFor="grading_period_id">Grading Period</Label>
                                                <Select value={data.grading_period_id} onValueChange={(value) => setData('grading_period_id', value)}>
                                                    <SelectTrigger className={errors.grading_period_id ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select grading period" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">No Period</SelectItem>
                                                        {gradingPeriods && gradingPeriods.length > 0 ? (
                                                            <>
                                                                {/* First Semester */}
                                                                <SelectGroup>
                                                                    <SelectLabel>First Semester</SelectLabel>
                                                                    {gradingPeriods
                                                                        .filter(period => period.code.startsWith('SHS_S1_') && !period.code.includes('_FA'))
                                                                        .sort((a, b) => a.sort_order - b.sort_order)
                                                                        .map((period) => (
                                                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                                                {period.name}
                                                                            </SelectItem>
                                                                        ))
                                                                    }
                                                                </SelectGroup>

                                                                {/* Second Semester */}
                                                                <SelectGroup>
                                                                    <SelectLabel>Second Semester</SelectLabel>
                                                                    {gradingPeriods
                                                                        .filter(period => period.code.startsWith('SHS_S2_') && !period.code.includes('_FA'))
                                                                        .sort((a, b) => a.sort_order - b.sort_order)
                                                                        .map((period) => (
                                                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                                                {period.name}
                                                                            </SelectItem>
                                                                        ))
                                                                    }
                                                                </SelectGroup>
                                                            </>
                                                        ) : (
                                                            <SelectItem value="none" disabled>
                                                                No grading periods available
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.grading_period_id && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.grading_period_id}</p>
                                                )}
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {quarterOptions.length > 0 
                                                        ? 'Select which grading period this grade belongs to'
                                                        : 'No grading periods are configured for your assigned subjects'
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-4 pt-4">
                                            <Button type="submit" disabled={processing} className="flex-1">
                                                <Save className="h-4 w-4 mr-2" />
                                                {processing ? 'Saving...' : 'Save Grade'}
                                            </Button>
                                            <Link href={route('teacher.grades.index')} className="flex-1">
                                                <Button type="button" variant="outline" className="w-full">
                                                    Cancel
                                                </Button>
                                            </Link>
                                        </div>
                                    </form>
                                ) : (
                                    // Full form for manual entry
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="student_id">Student</Label>
                                        <Select value={data.student_id} onValueChange={handleStudentChange}>
                                            <SelectTrigger className={errors.student_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select a student" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assignedSubjects.flatMap(subject => 
                                                    subject.enrolled_students.map(enrollment => (
                                                        <SelectItem key={enrollment.student.id} value={enrollment.student.id.toString()}>
                                                            {enrollment.student.name} - {subject.subject.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.student_id && (
                                            <p className="text-sm text-red-500 mt-1">{errors.student_id}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Select a student from your assigned subjects
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="subject_id">Subject</Label>
                                        <Select value={data.subject_id} onValueChange={(value) => setData('subject_id', value)}>
                                            <SelectTrigger className={errors.subject_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select a subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assignedSubjects.map((subject) => (
                                                    <SelectItem key={subject.subject.id} value={subject.subject.id.toString()}>
                                                        {subject.subject.name} ({subject.subject.code})
                                                        {subject.subject.course && ` - ${subject.subject.course.name}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.subject_id && (
                                            <p className="text-sm text-red-500 mt-1">{errors.subject_id}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="academic_level_id">Academic Level</Label>
                                            <Select value={data.academic_level_id} onValueChange={(value) => setData('academic_level_id', value)}>
                                                <SelectTrigger className={errors.academic_level_id ? 'border-red-500' : ''}>
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
                                            {errors.academic_level_id && (
                                                <p className="text-sm text-red-500 mt-1">{errors.academic_level_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="grading_period_id">Grading Period</Label>
                                            <Select value={data.grading_period_id} onValueChange={(value) => setData('grading_period_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select grading period (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">No Period</SelectItem>
                                                    {quarterOptions.map((quarter) => (
                                                        <SelectItem key={quarter.id} value={quarter.value}>
                                                            {quarter.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="school_year">School Year</Label>
                                            <Input
                                                id="school_year"
                                                type="text"
                                                placeholder="e.g., 2024-2025"
                                                value={data.school_year}
                                                onChange={(e) => setData('school_year', e.target.value)}
                                                className={errors.school_year ? 'border-red-500' : ''}
                                            />
                                            {errors.school_year && (
                                                <p className="text-sm text-red-500 mt-1">{errors.school_year}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="year_of_study">Year of Study</Label>
                                            <Input
                                                id="year_of_study"
                                                type="number"
                                                min="1"
                                                max="10"
                                                placeholder="e.g., 1, 2, 3, 4"
                                                value={data.year_of_study}
                                                onChange={(e) => setData('year_of_study', e.target.value)}
                                                className={errors.year_of_study ? 'border-red-500' : ''}
                                            />
                                            {errors.year_of_study && (
                                                <p className="text-sm text-red-500 mt-1">{errors.year_of_study}</p>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Required for college level
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="grade">Grade</Label>
                                        <Input
                                            id="grade"
                                            type="number"
                                            step="0.01"
                                            min={getCurrentAcademicLevelKey() === 'college' ? '1.0' : '75'}
                                            max={getCurrentAcademicLevelKey() === 'college' ? '5.0' : '100'}
                                            placeholder={getCurrentAcademicLevelKey() === 'college' ? 'Enter grade (1.0-5.0)' : 'Enter grade (0-100)'}
                                            value={data.grade}
                                            onChange={(e) => setData('grade', e.target.value)}
                                            className={errors.grade ? 'border-red-500' : ''}
                                        />
                                        {errors.grade && (
                                            <p className="text-sm text-red-500 mt-1">{errors.grade}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {getCurrentAcademicLevelKey() === 'college' 
                                                ? 'College: 1.0 (highest) to 5.0 (lowest). 3.0 is passing (equivalent to 75).' 
                                                : 'Elementary to Senior High: 75 (passing) to 100 (highest).'
                                            }
                                        </p>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button type="submit" disabled={processing} className="flex-1">
                                            <Save className="h-4 w-4 mr-2" />
                                            {processing ? 'Saving...' : 'Save Grade'}
                                        </Button>
                                        <Link href={route('teacher.grades.index')} className="flex-1">
                                            <Button type="button" variant="outline" className="w-full">
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                                )}
                            </CardContent>
                        </Card>

                        {/* Help Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Help & Guidelines</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm text-muted-foreground">
                                    <p>
                                        • <strong>Student:</strong> Select a student from your assigned subjects
                                    </p>
                                    <p>
                                        • <strong>Subject:</strong> Automatically populated when student is selected
                                    </p>
                                    <p>
                                        • <strong>Grade Scale:</strong> College uses 1.0-5.0 scale (1.0 highest, 3.0 passing), Elementary/Senior High uses 75-100 scale (75 passing)
                                    </p>
                                    <p>
                                        • <strong>Validation:</strong> Grades are automatically submitted for validation after saving
                                    </p>
                                    <p>
                                        • <strong>Editing:</strong> You can edit grades before they are validated by the registrar
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
