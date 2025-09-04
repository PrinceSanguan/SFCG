import { Header } from '@/components/principal/header';
import { Sidebar } from '@/components/principal/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Check, RotateCcw, User, BookOpen, Calendar, Award } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AcademicLevel {
    id: number;
    name: string;
}

interface GradingPeriod {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    name: string;
    course: {
        id: number;
        name: string;
    };
}

interface StudentGrade {
    id: number;
    grade: number;
    school_year: string;
    year_of_study: number;
    is_submitted_for_validation: boolean;
    is_approved: boolean;
    is_returned: boolean;
    submitted_at: string;
    approved_at?: string;
    returned_at?: string;
    return_reason?: string;
    student: User;
    subject: Subject;
    academicLevel: AcademicLevel;
    gradingPeriod: GradingPeriod;
}

interface ReviewGradeProps {
    user: User;
    grade: StudentGrade;
}

export default function ReviewGrade({ user, grade }: ReviewGradeProps) {
    const { data, setData, post, processing, errors } = useForm({
        return_reason: '',
    });

    const handleApprove = () => {
        post(route('principal.grades.approve', grade.id));
    };

    const handleReturn = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('principal.grades.return', grade.id));
    };

    const getStatusBadge = () => {
        if (grade.is_approved) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
        }
        if (grade.is_returned) {
            return <Badge variant="destructive">Returned</Badge>;
        }
        if (grade.is_submitted_for_validation) {
            return <Badge variant="secondary">Pending</Badge>;
        }
        return <Badge variant="outline">Draft</Badge>;
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <Link href={route('principal.grades.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Grades
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Review Grade Submission
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Review grade details and approve or return for correction.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Grade Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Grade Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Student Name</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{grade.student.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Subject</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{grade.subject.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Course</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{grade.subject.course.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Academic Level</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{grade.academicLevel.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Grading Period</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{grade.gradingPeriod.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">School Year</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{grade.school_year}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Year of Study</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{grade.year_of_study}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Grade</span>
                            <Badge variant="outline" className="text-lg font-bold">{grade.grade}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Status</span>
                            {getStatusBadge()}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Submitted At</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(grade.submitted_at).toLocaleString()}
                            </span>
                        </div>
                        {grade.approved_at && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Approved At</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(grade.approved_at).toLocaleString()}
                                </span>
                            </div>
                        )}
                        {grade.returned_at && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Returned At</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(grade.returned_at).toLocaleString()}
                                </span>
                            </div>
                        )}
                        {grade.return_reason && (
                            <div className="space-y-2">
                                <span className="text-sm font-medium">Return Reason</span>
                                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                    {grade.return_reason}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!grade.is_approved && !grade.is_returned && (
                            <>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        This grade is pending your approval. You can either approve it or return it for correction.
                                    </p>
                                </div>
                                
                                <div className="space-y-4">
                                    <Button 
                                        onClick={handleApprove}
                                        disabled={processing}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve Grade
                                    </Button>
                                    
                                    <form onSubmit={handleReturn} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="return_reason">Return Reason (Required)</Label>
                                            <Textarea
                                                id="return_reason"
                                                placeholder="Please provide a reason for returning this grade..."
                                                value={data.return_reason}
                                                onChange={(e) => setData('return_reason', e.target.value)}
                                                className={errors.return_reason ? 'border-red-500' : ''}
                                                rows={3}
                                            />
                                            {errors.return_reason && (
                                                <p className="text-sm text-red-500">{errors.return_reason}</p>
                                            )}
                                        </div>
                                        <Button 
                                            type="submit"
                                            disabled={processing || !data.return_reason.trim()}
                                            variant="destructive"
                                            className="w-full"
                                        >
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            Return for Correction
                                        </Button>
                                    </form>
                                </div>
                            </>
                        )}

                        {grade.is_approved && (
                            <div className="text-center py-4">
                                <Check className="h-12 w-12 text-green-600 mx-auto mb-2" />
                                <p className="text-green-600 font-medium">This grade has been approved</p>
                                <p className="text-sm text-gray-500">
                                    Approved on {new Date(grade.approved_at!).toLocaleString()}
                                </p>
                            </div>
                        )}

                        {grade.is_returned && (
                            <div className="text-center py-4">
                                <RotateCcw className="h-12 w-12 text-red-600 mx-auto mb-2" />
                                <p className="text-red-600 font-medium">This grade has been returned</p>
                                <p className="text-sm text-gray-500">
                                    Returned on {new Date(grade.returned_at!).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
