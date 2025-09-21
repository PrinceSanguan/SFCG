import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/chairperson/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, router, useForm } from '@inertiajs/react';
import { GraduationCap, Clock, CheckCircle, XCircle, Eye, ArrowLeft, Filter } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    department_id?: number;
}

interface Student {
    id: number;
    name: string;
    student_number?: string;
}

interface Subject {
    id: number;
    name: string;
    code?: string;
    course?: {
        id: number;
        name: string;
    };
}

interface AcademicLevel {
    id: number;
    name: string;
}

interface GradingPeriod {
    id: number;
    name: string;
    period_type: string;
}

interface FinalAverage {
    id: number;
    student: Student;
    subject: Subject;
    academic_level: AcademicLevel;
    grading_period: GradingPeriod;
    grade: number;
    school_year: string;
    is_submitted_for_validation: boolean;
    is_approved: boolean;
    is_returned: boolean;
    submitted_at?: string;
    approved_at?: string;
    returned_at?: string;
}

interface AcademicLevel {
    id: number;
    key: string;
    name: string;
    is_active: boolean;
}

interface PendingFinalAveragesProps {
    user: User;
    finalAverages: {
        data: FinalAverage[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    academicLevels: AcademicLevel[];
    selectedAcademicLevel: string | null;
}

export default function PendingFinalAverages({ user, finalAverages, academicLevels, selectedAcademicLevel }: PendingFinalAveragesProps) {
    if (!user) {
        return <div>Loading...</div>;
    }

    // Add safety checks for undefined props
    const safeFinalAverages = finalAverages || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
    const safeAcademicLevels = academicLevels || [];

    const handleAcademicLevelChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value === 'all') {
            params.delete('academic_level_id');
        } else {
            params.set('academic_level_id', value);
        }
        router.get(window.location.pathname, Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const [selectedFinalAverage, setSelectedFinalAverage] = useState<FinalAverage | null>(null);
    const [showReturnForm, setShowReturnForm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        return_reason: '',
    });

    const handleApprove = (finalAverageId: number) => {
        post(route('chairperson.final-averages.approve', finalAverageId));
    };

    const handleReturn = (finalAverageId: number) => {
        if (data.return_reason.trim()) {
            post(route('chairperson.final-averages.return', finalAverageId));
            setShowReturnForm(false);
            setSelectedFinalAverage(null);
            setData('return_reason', '');
        }
    };

    const openReturnForm = (finalAverage: FinalAverage) => {
        setSelectedFinalAverage(finalAverage);
        setShowReturnForm(true);
    };

    const closeReturnForm = () => {
        setShowReturnForm(false);
        setSelectedFinalAverage(null);
        setData('return_reason', '');
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Button asChild variant="outline" size="sm">
                                <Link href={route('chairperson.final-averages.index')}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Final Averages
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Pending Final Averages
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Review and approve final average grades submitted for validation
                                </p>
                            </div>
                        </div>

                        {/* Academic Level Filter */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filter by Academic Level
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select value={selectedAcademicLevel || 'all'} onValueChange={handleAcademicLevelChange}>
                                    <SelectTrigger className="w-full md:w-64">
                                        <SelectValue placeholder="Select academic level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Academic Levels</SelectItem>
                                        {safeAcademicLevels.map((level) => (
                                            <SelectItem key={level.id} value={level.id.toString()}>
                                                {level.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Pending Final Averages Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Pending Final Averages ({safeFinalAverages.total} total)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {safeFinalAverages.data.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            No pending final averages found
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2 font-medium">Student</th>
                                                    <th className="text-left p-2 font-medium">Subject</th>
                                                    <th className="text-left p-2 font-medium">Academic Level</th>
                                                    <th className="text-left p-2 font-medium">Final Average</th>
                                                    <th className="text-left p-2 font-medium">School Year</th>
                                                    <th className="text-left p-2 font-medium">Submitted</th>
                                                    <th className="text-left p-2 font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {safeFinalAverages.data.map((finalAverage) => (
                                                    <tr key={finalAverage.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="p-2">
                                                            <div>
                                                                <div className="font-medium">{finalAverage.student?.name}</div>
                                                                {finalAverage.student?.student_number && (
                                                                    <div className="text-sm text-gray-500">{finalAverage.student.student_number}</div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <div>
                                                                <div className="font-medium">{finalAverage.subject?.name}</div>
                                                                {finalAverage.subject?.code && (
                                                                    <div className="text-sm text-gray-500">{finalAverage.subject.code}</div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <span className="text-sm">{finalAverage.academic_level?.name}</span>
                                                        </td>
                                                        <td className="p-2">
                                                            <span className="font-medium text-lg">{finalAverage.grade}</span>
                                                        </td>
                                                        <td className="p-2">
                                                            <span className="text-sm">{finalAverage.school_year}</span>
                                                        </td>
                                                        <td className="p-2">
                                                            {finalAverage.submitted_at ? (
                                                                <span className="text-sm text-gray-600">
                                                                    {new Date(finalAverage.submitted_at).toLocaleDateString()}
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-gray-400">Not specified</span>
                                                            )}
                                                        </td>
                                                        <td className="p-2">
                                                            <div className="flex gap-2">
                                                                <Button asChild size="sm" variant="outline">
                                                                    <Link href={route('chairperson.final-averages.review', finalAverage.id)}>
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleApprove(finalAverage.id)}
                                                                    disabled={processing}
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => openReturnForm(finalAverage)}
                                                                    disabled={processing}
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Return Final Average Modal */}
            {showReturnForm && selectedFinalAverage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Return Final Average for Correction</h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Returning final average for <strong>{selectedFinalAverage.student?.name}</strong> in <strong>{selectedFinalAverage.subject?.name}</strong>
                            </p>
                            <Label htmlFor="return_reason">Reason for Return</Label>
                            <Textarea
                                id="return_reason"
                                value={data.return_reason}
                                onChange={(e) => setData('return_reason', e.target.value)}
                                placeholder="Please provide a reason for returning this final average..."
                                className="mt-2"
                                rows={4}
                            />
                            {errors.return_reason && (
                                <p className="text-sm text-red-500 mt-1">{errors.return_reason}</p>
                            )}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={closeReturnForm}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleReturn(selectedFinalAverage.id)}
                                disabled={processing || !data.return_reason.trim()}
                            >
                                {processing ? 'Returning...' : 'Return Final Average'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
