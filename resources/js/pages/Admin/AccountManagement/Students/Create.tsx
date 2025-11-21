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

interface Department {
    id: number;
    name: string;
    code: string;
    description: string;
    academic_level_id: number;
}

interface CreateProps {
    user: User;
    errors?: Record<string, string>;
    academicLevel?: string;
    specificYearLevels?: Record<string, Record<string, string>>;
    strands?: Array<{ id: number; name: string; code: string; track?: { id: number; name: string; code: string } }>;
    courses?: Array<{ id: number; name: string; code: string; department_id: number }>;
    departments?: Department[];
}

export default function CreateStudent({ user, errors, academicLevel, specificYearLevels, strands, courses, departments }: CreateProps) {
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
        department_id: '',
        section_id: '',
        school_year: '',
        student_number: '',
        // Personal Information
        birth_date: '',
        gender: '',
        phone_number: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
    });

    // Sections state
    const [sections, setSections] = React.useState<Array<{ id: number; name: string; code?: string; current_students?: number; max_students?: number; has_capacity?: boolean }>>([]);
    const [loadingSections, setLoadingSections] = React.useState<boolean>(false);

    // Auto-set academic level when component mounts or academicLevel changes
    React.useEffect(() => {
        if (academicLevel && !data.academic_level) {
            setData('academic_level', academicLevel);
        }
    }, [academicLevel]);

    // Fetch sections whenever the academic context changes
    React.useEffect(() => {
        const params: Record<string, string> = {};
        if (!data.academic_level) {
            setSections([]);
            return;
        }
        // Reset section on context change
        setData('section_id', '');

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

                                        {/* School Year */}
                                        <div className="space-y-2">
                                            <Label htmlFor="school_year">School Year</Label>
                                            <Input
                                                id="school_year"
                                                type="text"
                                                placeholder="e.g., 2024-2025"
                                                value={data.school_year}
                                                onChange={(e) => setData('school_year', e.target.value)}
                                            />
                                            {errors?.school_year && (
                                                <Alert variant="destructive">
                                                    <AlertDescription>{errors.school_year}</AlertDescription>
                                                </Alert>
                                            )}
                                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                                <p className="text-sm text-blue-800 font-medium mb-1">School Year Format Guide:</p>
                                                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                                                    <li>Format: YYYY-YYYY (e.g., 2024-2025, 2025-2026)</li>
                                                    <li>First year must be one less than second year</li>
                                                    <li>Used to track student enrollment for specific academic year</li>
                                                    <li>Required when assigning students to sections</li>
                                                </ul>
                                            </div>
                                        </div>

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
                                                <p className="text-sm text-gray-500">
                                                    Strands are required for Senior High School students to specialize in their chosen field
                                                </p>
                                            </div>
                                        )}

                                        {/* Department Selection (College) */}
                                        {data.academic_level === 'college' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="department_id">Department *</Label>
                                                <Select value={data.department_id} onValueChange={(value) => {
                                                    setData('department_id', value);
                                                    setData('course_id', ''); // Reset course when department changes
                                                }}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a department" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departments && departments
                                                            .filter(dept => dept.academic_level_id === 4) // Filter for college departments
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
                                                <p className="text-sm text-gray-500">
                                                    Departments are required for College students to organize their academic program
                                                </p>
                                            </div>
                                        )}

                                        {/* Course Selection (College) */}
                                        {data.academic_level === 'college' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="course_id">Course *</Label>
                                                <Select 
                                                    value={data.course_id} 
                                                    onValueChange={(value) => setData('course_id', value)}
                                                    disabled={!data.department_id}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={data.department_id ? "Select a course" : "Select department first"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {courses && courses
                                                            .filter(course => !data.department_id || course.department_id?.toString() === data.department_id)
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
                                                <p className="text-sm text-gray-500">
                                                    Courses are required for College students to define their academic program
                                                </p>
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
                                                            <SelectItem key={sec.id} value={sec.id.toString()} disabled={sec.has_capacity === false}>
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
                                                <p className="text-sm text-gray-500">
                                                    Selecting a section is required. Full sections are disabled.
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
