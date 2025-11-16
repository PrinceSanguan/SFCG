import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { FormEvent, useState } from 'react';
import React from 'react';
import PasswordResetModal from '@/components/admin/PasswordResetModal';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface Department {
    id: number;
    name: string;
    code: string;
    description: string;
    academic_level_id: number;
}

interface TargetUser extends User {
    created_at: string;
    last_login_at?: string;
    year_level?: string;
    specific_year_level?: string;
    strand_id?: number;
    course_id?: number;
    department_id?: number;
    section_id?: number;
    student_number?: string;
    birth_date?: string;
    gender?: string;
    phone_number?: string;
    address?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
}

interface EditProps {
    user: User; // Current admin user
    targetUser: TargetUser; // User being edited
    roles: Record<string, string>;
    errors?: Record<string, string>;
    yearLevels?: Record<string, string>;
    specificYearLevels?: Record<string, Record<string, string>>;
    strands?: Array<{ id: number; name: string; code: string; track?: { id: number; name: string; code: string } }>;
    courses?: Array<{ id: number; name: string; code: string; department_id: number }>;
    departments?: Department[];
}

// Helper function to format date for HTML date input (YYYY-MM-DD)
const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function EditStudent({ user, targetUser, roles, errors, yearLevels, specificYearLevels, strands, courses, departments }: EditProps) {
    const { data, setData, put, processing } = useForm({
        name: targetUser?.name || '',
        email: targetUser?.email || '',
        user_role: targetUser?.user_role || '',
        academic_level: targetUser?.year_level || '',
        specific_year_level: targetUser?.specific_year_level || '',
        strand_id: targetUser?.strand_id?.toString() || '',
        course_id: targetUser?.course_id?.toString() || '',
        department_id: targetUser?.department_id?.toString() || '',
        section_id: targetUser?.section_id?.toString() || '',
        student_number: targetUser?.student_number || '',
        // Personal Information
        birth_date: formatDateForInput(targetUser?.birth_date),
        gender: targetUser?.gender || '',
        phone_number: targetUser?.phone_number || '',
        address: targetUser?.address || '',
        emergency_contact_name: targetUser?.emergency_contact_name || '',
        emergency_contact_phone: targetUser?.emergency_contact_phone || '',
        emergency_contact_relationship: targetUser?.emergency_contact_relationship || '',
    });

    // Sections state
    const [sections, setSections] = React.useState<Array<{ id: number; name: string; code?: string; current_students?: number; max_students?: number; has_capacity?: boolean }>>([]);
    const [loadingSections, setLoadingSections] = React.useState<boolean>(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { errors: pageErrors } = usePage().props;

    // Safety check for user data
    if (!user || !targetUser) {
        return <div>Loading...</div>;
    }

    // Fetch sections whenever the academic context changes
    React.useEffect(() => {
        const params: Record<string, string> = {};
        if (!data.academic_level) {
            setSections([]);
            return;
        }

        if (data.academic_level) params.academic_level_key = data.academic_level;
        if (data.specific_year_level) params.specific_year_level = data.specific_year_level;
        if (data.strand_id) params.strand_id = data.strand_id.toString();
        if (data.department_id) params.department_id = data.department_id.toString();
        if (data.course_id) params.course_id = data.course_id.toString();

        const query = new URLSearchParams(params).toString();
        setLoadingSections(true);
        fetch(route('admin.academic.api.sections') + (query ? `?${query}` : ''))
            .then(async (res) => {
                if (!res.ok) throw new Error('Failed to load sections');
                const json = await res.json();
                setSections(json || []);
            })
            .catch(() => setSections([]))
            .finally(() => setLoadingSections(false));
    }, [data.academic_level, data.specific_year_level, data.strand_id, data.department_id, data.course_id]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route('admin.students.update', targetUser.id));
    };

    const handleResetPassword = () => {
        setShowPasswordModal(true);
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'default';
            case 'registrar':
            case 'teacher':
            case 'instructor':
            case 'adviser':
            case 'chairperson':
            case 'principal':
                return 'secondary';
            case 'student':
            case 'parent':
                return 'outline';
            default:
                return 'outline';
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <Link href={route('admin.students.index')}>
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Students
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Student</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Update student information and role assignments.
                                </p>
                            </div>
                        </div>

                        {/* Current User Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Student Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                                        <p className="text-lg">{targetUser.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                                        <p className="text-lg">{targetUser.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Role</p>
                                        <Badge variant={getRoleBadgeVariant(targetUser.user_role)} className="mt-1">
                                            {roles[targetUser.user_role] || targetUser.user_role}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</p>
                                        <p className="text-lg">{new Date(targetUser.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Edit Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Update Student Information</CardTitle>
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

                                        {/* Academic Level */}
                                        <div className="space-y-2">
                                            <Label htmlFor="academic_level">Academic Level *</Label>
                                            <Select value={data.academic_level} onValueChange={(value) => {
                                                setData('academic_level', value);
                                                setData('specific_year_level', '');
                                                setData('strand_id', '');
                                                setData('course_id', '');
                                                setData('department_id', '');
                                                setData('section_id', '');
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select academic level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(yearLevels || {
                                                        elementary: 'Elementary',
                                                        junior_highschool: 'Junior High School',
                                                        senior_highschool: 'Senior High School',
                                                        college: 'College',
                                                    }) && Object.entries(yearLevels || {
                                                        elementary: 'Elementary',
                                                        junior_highschool: 'Junior High School',
                                                        senior_highschool: 'Senior High School',
                                                        college: 'College',
                                                    }).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors?.academic_level && (
                                                <Alert variant="destructive">
                                                    <AlertDescription>{errors.academic_level}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>

                                        {/* Specific Year Level */}
                                        {data.academic_level && (
                                            <div className="space-y-2">
                                                <Label htmlFor="specific_year_level">Year Level *</Label>
                                                <Select value={data.specific_year_level} onValueChange={(value) => {
                                                    setData('specific_year_level', value);
                                                    setData('section_id', '');
                                                }}>
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
                                                <Select value={data.strand_id} onValueChange={(value) => {
                                                    setData('strand_id', value);
                                                    setData('section_id', '');
                                                }}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a strand" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {strands && strands.map((strand) => (
                                                            <SelectItem key={strand.id} value={strand.id.toString()}>
                                                                {strand.name} ({strand.code}){strand.track ? ` - ${strand.track.name}` : ''}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors?.strand_id && (
                                                    <Alert variant="destructive">
                                                        <AlertDescription>{errors.strand_id}</AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        )}

                                        {/* Department Selection (College) */}
                                        {data.academic_level === 'college' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="department_id">Department *</Label>
                                                <Select value={data.department_id} onValueChange={(value) => {
                                                    setData('department_id', value);
                                                    setData('course_id', '');
                                                    setData('section_id', '');
                                                }}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a department" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departments && departments
                                                            .filter(dept => dept.academic_level_id === 4)
                                                            .map((department) => (
                                                                <SelectItem key={department.id} value={department.id.toString()}>
                                                                    {department.name} ({department.code})
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors?.department_id && (
                                                    <Alert variant="destructive">
                                                        <AlertDescription>{errors.department_id}</AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        )}

                                        {/* Course Selection (College) */}
                                        {data.academic_level === 'college' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="course_id">Course *</Label>
                                                <Select
                                                    value={data.course_id}
                                                    onValueChange={(value) => {
                                                        setData('course_id', value);
                                                        setData('section_id', '');
                                                    }}
                                                    disabled={!data.department_id}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={data.department_id ? "Select a course" : "Select department first"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {courses && courses
                                                            .filter(course => !data.department_id || course.department_id.toString() === data.department_id)
                                                            .map((course) => (
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
                                            </div>
                                        )}

                                        {/* Section Selection (All levels) */}
                                        {data.academic_level && (
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="section_id">Section *</Label>
                                                <Select
                                                    value={data.section_id}
                                                    onValueChange={(value) => setData('section_id', value)}
                                                    disabled={loadingSections || (!data.specific_year_level && data.academic_level !== 'college')}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={loadingSections ? 'Loading sections...' : (sections.length ? 'Select a section' : 'No sections available')}/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sections.map((sec) => (
                                                            <SelectItem key={sec.id} value={sec.id.toString()}>
                                                                {sec.name}{sec.code ? ` (${sec.code})` : ''}
                                                                {typeof sec.max_students === 'number' && typeof sec.current_students === 'number' ? ` • ${sec.current_students}/${sec.max_students}` : ''}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors?.section_id && (
                                                    <Alert variant="destructive">
                                                        <AlertDescription>{errors.section_id}</AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        )}

                                        {/* Student Number */}
                                        <div className="space-y-2">
                                            <Label htmlFor="student_number">Student Number</Label>
                                            <Input
                                                id="student_number"
                                                type="text"
                                                value={data.student_number}
                                                onChange={(e) => setData('student_number', e.target.value)}
                                                placeholder="e.g. EL-2025-000123"
                                            />
                                            {errors?.student_number && (
                                                <Alert variant="destructive">
                                                    <AlertDescription>{errors.student_number}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>

                                        {/* Last Login Info */}
                                        <div className="space-y-2">
                                            <Label>Last Login</Label>
                                            <div className="p-3 bg-gray-50 rounded border dark:bg-gray-800">
                                                {targetUser.last_login_at
                                                    ? new Date(targetUser.last_login_at).toLocaleString()
                                                    : 'Never logged in'
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Information Section */}
                                    <div className="space-y-6">
                                        <div className="border-t pt-6">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Personal Information</h3>
                                            <div className="grid gap-6 md:grid-cols-2">
                                                {/* Birth Date */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="birth_date">Birth Date</Label>
                                                    <Input
                                                        id="birth_date"
                                                        type="date"
                                                        value={data.birth_date}
                                                        onChange={(e) => setData('birth_date', e.target.value)}
                                                    />
                                                    {errors?.birth_date && (
                                                        <Alert variant="destructive">
                                                            <AlertDescription>{errors.birth_date}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>

                                                {/* Gender */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="gender">Gender</Label>
                                                    <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select gender" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="female">Female</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors?.gender && (
                                                        <Alert variant="destructive">
                                                            <AlertDescription>{errors.gender}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>

                                                {/* Phone Number */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone_number">Phone Number</Label>
                                                    <Input
                                                        id="phone_number"
                                                        type="tel"
                                                        value={data.phone_number}
                                                        onChange={(e) => setData('phone_number', e.target.value)}
                                                        placeholder="Enter phone number"
                                                    />
                                                    {errors?.phone_number && (
                                                        <Alert variant="destructive">
                                                            <AlertDescription>{errors.phone_number}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>

                                                {/* Address */}
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label htmlFor="address">Address</Label>
                                                    <Input
                                                        id="address"
                                                        type="text"
                                                        value={data.address}
                                                        onChange={(e) => setData('address', e.target.value)}
                                                        placeholder="Enter complete address"
                                                    />
                                                    {errors?.address && (
                                                        <Alert variant="destructive">
                                                            <AlertDescription>{errors.address}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Emergency Contact Section */}
                                        <div className="border-t pt-6">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Emergency Contact</h3>
                                            <div className="grid gap-6 md:grid-cols-2">
                                                {/* Emergency Contact Name */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                                                    <Input
                                                        id="emergency_contact_name"
                                                        type="text"
                                                        value={data.emergency_contact_name}
                                                        onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                                        placeholder="Enter emergency contact name"
                                                    />
                                                    {errors?.emergency_contact_name && (
                                                        <Alert variant="destructive">
                                                            <AlertDescription>{errors.emergency_contact_name}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>

                                                {/* Emergency Contact Phone */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                                                    <Input
                                                        id="emergency_contact_phone"
                                                        type="tel"
                                                        value={data.emergency_contact_phone}
                                                        onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                                        placeholder="Enter emergency contact phone"
                                                    />
                                                    {errors?.emergency_contact_phone && (
                                                        <Alert variant="destructive">
                                                            <AlertDescription>{errors.emergency_contact_phone}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>

                                                {/* Emergency Contact Relationship */}
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                                                    <Input
                                                        id="emergency_contact_relationship"
                                                        type="text"
                                                        value={data.emergency_contact_relationship}
                                                        onChange={(e) => setData('emergency_contact_relationship', e.target.value)}
                                                        placeholder="e.g., Father, Mother, Guardian, etc."
                                                    />
                                                    {errors?.emergency_contact_relationship && (
                                                        <Alert variant="destructive">
                                                            <AlertDescription>{errors.emergency_contact_relationship}</AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="flex items-center gap-4 pt-6">
                                        <Button type="submit" disabled={processing} className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            {processing ? 'Updating...' : 'Update Student'}
                                        </Button>
                                        <Link href={route('admin.students.index')}>
                                            <Button type="button" variant="outline">
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Password Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Password Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Reset the student's password to allow them to regain access to their account.
                                        A new temporary password will be generated.
                                    </p>
                                    <Button
                                        onClick={handleResetPassword}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Reset Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <Link href={route('admin.students.show', targetUser.id)}>
                                        <Button variant="outline">
                                            View Full Profile
                                        </Button>
                                    </Link>

                                    {/* Prevent self-deletion */}
                                    {targetUser.id !== user.id && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
                                                    router.delete(route('admin.students.destroy', targetUser.id), {
                                                        onSuccess: () => {
                                                            router.visit(route('admin.students.index'));
                                                        },
                                                        onError: (errors) => {
                                                            console.error('Delete failed:', errors);
                                                        }
                                                    });
                                                }
                                            }}
                                        >
                                            Delete Student
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Password Reset Modal */}
            <PasswordResetModal
                user={targetUser}
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                errors={pageErrors as Record<string, string>}
            />
        </div>
    );
}
