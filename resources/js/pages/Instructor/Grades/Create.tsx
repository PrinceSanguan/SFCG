import { Header } from '@/components/instructor/header';
import { Sidebar } from '@/components/instructor/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface AssignedCourse {
    id: number;
    course: {
        id: number;
        name: string;
        code: string;
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
}

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface AcademicLevel {
    id: number;
    name: string;
    key: string;
}

interface GradingPeriod {
    id: number;
    name: string;
}

interface CreateProps {
    user: User;
    subjects: Subject[];
    academicLevels: AcademicLevel[];
    gradingPeriods: GradingPeriod[];
    assignedCourses: AssignedCourse[];
}

export default function Create({ user, subjects, academicLevels, gradingPeriods, assignedCourses }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        subject_id: '',
        academic_level_id: '',
        grading_period_id: '',
        school_year: '2024-2025',
        year_of_study: '',
        grade: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('instructor.grades.store'), {
            onSuccess: () => {
                // Grade created successfully
            },
        });
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
                            <div className="flex items-center gap-4">
                                <Link href={route('instructor.grades.index')}>
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Grades
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        Input New Grade
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Enter a new grade for a student in your assigned course.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Grade Form */}
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5" />
                                    Grade Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="student_id">Student ID or Name</Label>
                                        <Input
                                            id="student_id"
                                            type="text"
                                            placeholder="Enter student ID or search by name"
                                            value={data.student_id}
                                            onChange={(e) => setData('student_id', e.target.value)}
                                            className={errors.student_id ? 'border-red-500' : ''}
                                        />
                                        {errors.student_id && (
                                            <p className="text-sm text-red-500 mt-1">{errors.student_id}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Enter the student's ID number or full name
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="subject_id">Subject</Label>
                                        <Select value={data.subject_id} onValueChange={(value) => setData('subject_id', value)}>
                                            <SelectTrigger className={errors.subject_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select a subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map((subject) => (
                                                    <SelectItem key={subject.id} value={subject.id.toString()}>
                                                        {subject.name} ({subject.code})
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
                                                    <SelectItem value="">No Period</SelectItem>
                                                    {gradingPeriods.map((period) => (
                                                        <SelectItem key={period.id} value={period.id.toString()}>
                                                            {period.name}
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
                                            min="0"
                                            max="100"
                                            placeholder="Enter grade (0-100)"
                                            value={data.grade}
                                            onChange={(e) => setData('grade', e.target.value)}
                                            className={errors.grade ? 'border-red-500' : ''}
                                        />
                                        {errors.grade && (
                                            <p className="text-sm text-red-500 mt-1">{errors.grade}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Enter the numerical grade (0-100 scale)
                                        </p>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button type="submit" disabled={processing} className="flex-1">
                                            <Save className="h-4 w-4 mr-2" />
                                            {processing ? 'Saving...' : 'Save Grade'}
                                        </Button>
                                        <Link href={route('instructor.grades.index')} className="flex-1">
                                            <Button type="button" variant="outline" className="w-full">
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
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
                                        • <strong>Student ID:</strong> Enter the student's ID number or full name for identification
                                    </p>
                                    <p>
                                        • <strong>Subject:</strong> Select from your assigned courses only
                                    </p>
                                    <p>
                                        • <strong>Grade Scale:</strong> Use 0-100 scale where 90+ is excellent, 80-89 is good, 70-79 is satisfactory
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
