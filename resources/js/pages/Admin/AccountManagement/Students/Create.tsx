import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';
import React from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface CreateProps {
    user: User;
    errors?: Record<string, string>;
    academicLevel?: string;
    specificYearLevels?: Record<string, Record<string, string>>;
    strands?: Array<{ id: number; name: string; code: string }>;
    courses?: Array<{ id: number; name: string; code: string; department_id: number }>;
}

export default function CreateStudent({ user, errors, academicLevel, specificYearLevels, strands, courses }: CreateProps) {
    const { data, setData, post, processing } = useForm({
        name: '',
        email: '',
        user_role: 'student', // Auto-set to student since this is a student creation form
        password: '',
        password_confirmation: '',
        academic_level: academicLevel || '',
        specific_year_level: '',
        strand_id: '',
        course_id: '',
        student_number: '',
    });

    // Auto-set academic level when component mounts or academicLevel changes
    React.useEffect(() => {
        if (academicLevel && !data.academic_level) {
            setData('academic_level', academicLevel);
        }
    }, [academicLevel]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.students.store'));
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <Link href={academicLevel ? route(`admin.students.${academicLevel.replace('_', '-')}`) : route('admin.students.index')}>
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to {academicLevel ? academicLevel.charAt(0).toUpperCase() + academicLevel.slice(1).replace('_', ' ') : 'Students'}
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Create New {academicLevel ? academicLevel.charAt(0).toUpperCase() + academicLevel.slice(1).replace('_', ' ') : 'Student'}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Add a new {academicLevel ? academicLevel.replace('_', ' ') : 'student'} to the school management system.
                                </p>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Student Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Enter full name"
                                                required
                                            />
                                            {errors?.name && (
                                                <Alert variant="destructive">
                                                    <AlertDescription>{errors.name}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter email address"
                                                required
                                            />
                                            {errors?.email && (
                                                <Alert variant="destructive">
                                                    <AlertDescription>{errors.email}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>

                                        {/* Role field removed since it's always "Student" for all student creation forms */}

                                        {/* Academic Level field removed since it's always auto-selected for all student creation forms */}

                                        {/* Year Level (Students) */}
                                        {data.academic_level && (
                                            <div className="space-y-2">
                                                <Label htmlFor="specific_year_level">Year Level *</Label>
                                                <Select value={data.specific_year_level} onValueChange={(value) => setData('specific_year_level', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select year level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {specificYearLevels && specificYearLevels[data.academic_level] && 
                                                            Object.entries(specificYearLevels[data.academic_level]).map(([key, label]) => (
                                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>
                                                {errors?.specific_year_level && (
                                                    <Alert variant="destructive">
                                                        <AlertDescription>{errors.specific_year_level}</AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        )}

                                        {/* Strand Selection (Senior High School) */}
                                        {data.academic_level === 'senior_highschool' && data.specific_year_level && (
                                            <div className="space-y-2">
                                                <Label htmlFor="strand_id">Strand *</Label>
                                                <Select value={data.strand_id} onValueChange={(value) => setData('strand_id', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a strand" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {strands && strands.map((strand) => (
                                                            <SelectItem key={strand.id} value={strand.id.toString()}>
                                                                {strand.name} ({strand.code})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors?.strand_id && (
                                                    <Alert variant="destructive">
                                                        <AlertDescription>{errors.strand_id}</AlertDescription>
                                                    </Alert>
                                                )}
                                                <p className="text-sm text-gray-500">
                                                    Strands are required for Senior High School students to specialize in their chosen field
                                                </p>
                                            </div>
                                        )}

                                        {/* Course Selection (College) */}
                                        {data.academic_level === 'college' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="course_id">Course *</Label>
                                                <Select value={data.course_id} onValueChange={(value) => setData('course_id', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a course" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {courses && courses.map((course) => (
                                                            <SelectItem key={course.id} value={course.id.toString()}>
                                                                {course.name} ({course.code})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors?.course_id && (
                                                    <Alert variant="destructive">
                                                        <AlertDescription>{errors.course_id}</AlertDescription>
                                                    </Alert>
                                                )}
                                                <p className="text-sm text-gray-500">
                                                    Courses are required for College students to define their academic program
                                                </p>
                                            </div>
                                        )}

                                        {/* Student ID - optional (auto-generated if blank) */}
                                        <div className="space-y-2">
                                            <Label htmlFor="student_number">Student ID</Label>
                                            <Input
                                                id="student_number"
                                                type="text"
                                                value={data.student_number}
                                                onChange={(e) => setData('student_number', e.target.value)}
                                                placeholder="e.g. EL-2025-000123 (leave empty to auto-generate)"
                                            />
                                            {errors?.student_number && (
                                                <Alert variant="destructive">
                                                    <AlertDescription>{errors.student_number}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password *</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Enter password"
                                                required
                                            />
                                            {errors?.password && (
                                                <Alert variant="destructive">
                                                    <AlertDescription>{errors.password}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder="Confirm password"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Role Information */}
                                    {data.user_role && (
                                        <Alert>
                                            <AlertDescription>
                                                <strong>Role Information:</strong>
                                                {data.user_role === 'admin' && (
                                                    <span> Administrators have full access to all system features including user management and system settings.</span>
                                                )}
                                                {data.user_role === 'registrar' && (
                                                    <span> Registrars manage student enrollment, academic records, and registration processes.</span>
                                                )}
                                                {data.user_role === 'teacher' && (
                                                    <span> Teachers can manage their classes, students, and academic content.</span>
                                                )}
                                                {data.user_role === 'instructor' && (
                                                    <span> Instructors can manage specific courses and student assessments.</span>
                                                )}
                                                {data.user_role === 'adviser' && (
                                                    <span> Advisers can monitor and guide students in their academic journey.</span>
                                                )}
                                                {data.user_role === 'chairperson' && (
                                                    <span> Chairpersons oversee departmental activities and faculty management.</span>
                                                )}
                                                {data.user_role === 'principal' && (
                                                    <span> Principals have administrative access to school-wide operations and policies.</span>
                                                )}
                                                {data.user_role === 'student' && (
                                                    <span> Students can access their courses, assignments, and academic progress.</span>
                                                )}
                                                {data.user_role === 'parent' && (
                                                    <span> Parents can monitor their children's academic progress and school activities.</span>
                                                )}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Submit Buttons */}
                                    <div className="flex items-center gap-4 pt-6">
                                        <Button type="submit" disabled={processing} className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            {processing ? 'Creating...' : `Create ${academicLevel ? academicLevel.charAt(0).toUpperCase() + academicLevel.slice(1).replace('_', ' ') : 'Student'}`}
                                        </Button>
                                        <Link href={academicLevel ? route(`admin.students.${academicLevel.replace('_', '-')}`) : route('admin.students.index')}>
                                            <Button type="button" variant="outline">
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Important Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <p>• Students will receive their login credentials and can change their password after first login.</p>
                                    <p>• Email addresses must be unique in the system.</p>
                                    <p>• Choose the appropriate role based on the student's responsibilities in the school.</p>
                                    <p>• After creating a student, they will be redirected to their respective dashboard.</p>
                                    <p>• You can also bulk upload students using the CSV upload feature on the Students list page.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
