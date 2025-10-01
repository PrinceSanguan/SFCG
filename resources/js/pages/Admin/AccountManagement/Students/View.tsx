import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, RotateCcw, Activity, Calendar, Mail, UserCheck, Clock, Phone, MapPin, Flag, BookOpen, GraduationCap, School, BookOpen as BookIcon, Users, Award, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import PasswordResetModal from '@/components/admin/PasswordResetModal';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    description?: string;
    units?: number;
    hours_per_week?: number;
    is_core: boolean;
    course?: {
        id: number;
        name: string;
    };
    academicLevel?: {
        id: number;
        name: string;
    };
    teacherAssignments?: Array<{
        id: number;
        teacher: {
            id: number;
            name: string;
            email: string;
        };
    }>;
}

interface SubjectAssignment {
    id: number;
    semester?: string;
    is_active: boolean;
    enrolled_at: string;
    notes?: string;
    subject: Subject;
}

interface StudentGrade {
    id: number;
    grade: number;
    grading_period_id: number;
    gradingPeriod: {
        id: number;
        name: string;
        code: string;
        sort_order?: number;
        period_type?: string;
    };
    // Some API responses may serialize relations in snake_case
    grading_period?: {
        id: number;
        name: string;
        code: string;
        sort_order?: number;
        period_type?: string;
    };
    is_approved: boolean;
    approved_at?: string;
    approvedBy?: {
        id: number;
        name: string;
    };
}

interface ViewUser {
    id: number;
    name: string;
    email: string;
    user_role: string;
    created_at: string;
    last_login_at?: string;
    student_number?: string;
    year_level?: string;
    specific_year_level?: string;
    section?: {
        id: number;
        name: string;
    };
    // Personal Information
    birth_date?: string;
    gender?: string;
    phone_number?: string;
    address?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    nationality?: string;
    religion?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    lrn?: string;
    previous_school?: string;
    parents?: Array<{ id: number; name: string; email: string; pivot?: { relationship_type?: string } }>;
}

interface ActivityLog {
    id: number;
    action: string;
    user: User;
    target_user?: User;
    created_at: string;
    details?: Record<string, unknown>;
    ip_address?: string;
}

interface PaginatedActivityLogs {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ViewProps {
    user: User; // Current admin user
    targetUser: ViewUser; // User being viewed
    activityLogs: PaginatedActivityLogs;
    assignedSubjects: SubjectAssignment[];
    subjectGrades: Record<number, StudentGrade[]>;
    currentSchoolYear: string;
}

export default function ViewStudent({ user, targetUser, activityLogs, assignedSubjects, subjectGrades, currentSchoolYear }: ViewProps) {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { errors } = usePage().props;
    const DEBUG = false;

    // Safety check for user data
    if (!user || !targetUser) {
        return <div>Loading...</div>;
    }

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

    const getRoleDisplayName = (role: string) => {
        const roleMap: Record<string, string> = {
            'admin': 'Administrator',
            'registrar': 'Registrar',
            'instructor': 'Instructor',
            'teacher': 'Teacher',
            'adviser': 'Adviser',
            'chairperson': 'Chairperson',
            'principal': 'Principal',
            'student': 'Student',
            'parent': 'Parent',
        };
        return roleMap[role] || role;
    };

    const getPeriodLabel = (grade: StudentGrade): string => {
        const anyGrade = grade as unknown as Record<string, unknown>;
        const rel = (anyGrade.gradingPeriod as { name?: string; code?: string } | undefined)
            || (anyGrade.grading_period as { name?: string; code?: string } | undefined);
        const snakeRaw = anyGrade.grading_period;
        const name = rel?.name;
        const code = rel?.code;
        if (name && String(name).trim().length > 0) return String(name);
        if (code && String(code).trim().length > 0) return String(code);
        if (typeof snakeRaw === 'string' || typeof snakeRaw === 'number') {
            return String(snakeRaw);
        }
        const idVal = anyGrade['grading_period_id'] as number | string | undefined;
        if (idVal !== undefined && idVal !== null) return `Period #${idVal}`;
        
        // If all else fails, show a generic period name based on row index
        return 'Unknown Period';
    };

    const isQuarterPeriod = (grade: StudentGrade): boolean => {
        const type = grade.gradingPeriod?.period_type || grade.grading_period?.period_type;
        const code = (grade.gradingPeriod?.code || grade.grading_period?.code || '').toUpperCase();
        const name = (grade.gradingPeriod?.name || grade.grading_period?.name || '').toLowerCase();

        // Exclude semester parents and finals/calculated explicitly
        if (name.includes('semester')) return false;
        if (['F_SIM', 'S2', 'F1', 'S2-FA'].includes(code)) return false;

        const normalizedType = (type || '').toLowerCase();
        if (['quarter', 'midterm', 'prefinal'].includes(normalizedType)) return true;

        // Fallback by recognizable quarter codes
        return ['Q1', 'Q2', 'Q3', 'Q4', 'P1', 'S2-MT', 'S2-PF'].some(tok => code.includes(tok));
    };

    const formatActionText = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getActionIcon = (action: string) => {
        if (action.includes('login')) return <UserCheck className="h-4 w-4" />;
        if (action.includes('password')) return <RotateCcw className="h-4 w-4" />;
        if (action.includes('created')) return <UserCheck className="h-4 w-4" />;
        if (action.includes('updated')) return <Edit className="h-4 w-4" />;
        return <Activity className="h-4 w-4" />;
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
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Profile</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Complete profile and activity history for {targetUser.name}.
                                </p>
                            </div>
                        </div>

                        {/* User Profile Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                                    {/* Avatar and Basic Info */}
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarFallback className="text-2xl">
                                                {targetUser.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="text-xl font-semibold">{targetUser.name}</h2>
                                            <Badge variant={getRoleBadgeVariant(targetUser.user_role)} className="mt-1">
                                                {getRoleDisplayName(targetUser.user_role)}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="flex-1 grid gap-4 md:grid-cols-2">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                                                <p className="text-sm">{targetUser.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</p>
                                                <p className="text-sm">{new Date(targetUser.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</p>
                                                <p className="text-sm">
                                                    {targetUser.last_login_at 
                                                        ? new Date(targetUser.last_login_at).toLocaleString()
                                                        : 'Never logged in'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <UserCheck className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</p>
                                                <p className="text-sm text-green-600 dark:text-green-400">Active</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Student Information */}
                        {(targetUser.student_number || targetUser.year_level || targetUser.specific_year_level || targetUser.section) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Student Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {targetUser.student_number && (
                                            <div className="flex items-center gap-3">
                                                <GraduationCap className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Student Number</p>
                                                    <p className="text-sm">{targetUser.student_number}</p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.year_level && (
                                            <div className="flex items-center gap-3">
                                                <School className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Academic Level</p>
                                                    <p className="text-sm capitalize">{targetUser.year_level.replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.specific_year_level && (
                                            <div className="flex items-center gap-3">
                                                <School className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Year Level</p>
                                                    <p className="text-sm capitalize">{targetUser.specific_year_level.replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.section && (
                                            <div className="flex items-center gap-3">
                                                <Users className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Section</p>
                                                    <p className="text-sm">{targetUser.section.name}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Personal Information */}
                        {(targetUser.birth_date || targetUser.gender || targetUser.phone_number || targetUser.nationality || targetUser.religion || targetUser.lrn || targetUser.previous_school) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {targetUser.birth_date && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Birth Date</p>
                                                    <p className="text-sm">
                                                        {new Date(targetUser.birth_date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.gender && (
                                            <div className="flex items-center gap-3">
                                                <UserCheck className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
                                                    <p className="text-sm capitalize">{targetUser.gender}</p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.phone_number && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</p>
                                                    <p className="text-sm">{targetUser.phone_number}</p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.nationality && (
                                            <div className="flex items-center gap-3">
                                                <Flag className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nationality</p>
                                                    <p className="text-sm">{targetUser.nationality}</p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.religion && (
                                            <div className="flex items-center gap-3">
                                                <BookOpen className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Religion</p>
                                                    <p className="text-sm">{targetUser.religion}</p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.lrn && (targetUser.year_level === 'elementary' || targetUser.year_level === 'junior_highschool') && (
                                            <div className="flex items-center gap-3">
                                                <GraduationCap className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">LRN</p>
                                                    <p className="text-sm">{targetUser.lrn}</p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.previous_school && (
                                            <div className="flex items-center gap-3">
                                                <School className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Previous School</p>
                                                    <p className="text-sm">{targetUser.previous_school}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Address Information */}
                        {(targetUser.address || targetUser.city || targetUser.province || targetUser.postal_code) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Address Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {targetUser.address && (
                                            <div className="flex items-start gap-3 md:col-span-2">
                                                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Complete Address</p>
                                                    <p className="text-sm">{targetUser.address}</p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.city && (
                                            <div className="flex items-center gap-3">
                                                <MapPin className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">City</p>
                                                    <p className="text-sm">{targetUser.city}</p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.province && (
                                            <div className="flex items-center gap-3">
                                                <MapPin className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Province</p>
                                                    <p className="text-sm">{targetUser.province}</p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.postal_code && (
                                            <div className="flex items-center gap-3">
                                                <MapPin className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Postal Code</p>
                                                    <p className="text-sm">{targetUser.postal_code}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Emergency Contact Information */}
                        {(targetUser.emergency_contact_name || targetUser.emergency_contact_phone || targetUser.emergency_contact_relationship) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Emergency Contact</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {targetUser.emergency_contact_name && (
                                            <div className="flex items-center gap-3">
                                                <UserCheck className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Name</p>
                                                    <p className="text-sm">{targetUser.emergency_contact_name}</p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.emergency_contact_phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Phone</p>
                                                    <p className="text-sm">{targetUser.emergency_contact_phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {targetUser.emergency_contact_relationship && (
                                            <div className="flex items-center gap-3">
                                                <UserCheck className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Relationship</p>
                                                    <p className="text-sm">{targetUser.emergency_contact_relationship}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Academic Information - Subjects and Grades */}
                        {assignedSubjects && assignedSubjects.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookIcon className="h-5 w-5" />
                                        Academic Information - {currentSchoolYear}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {assignedSubjects.map((assignment) => {
                                            const grades = subjectGrades[assignment.subject.id] || [];
                                            if (DEBUG) {
                                                // Debug each subject's grades to verify grading period payload
                                                console.log('Admin View → subject grades', {
                                                    subjectId: assignment.subject.id,
                                                    subjectCode: assignment.subject.code,
                                                    grades: grades.map(g => ({
                                                        id: g.id,
                                                        grading_period_id: (g as unknown as { grading_period_id?: number | string }).grading_period_id,
                                                        gradingPeriod: (g as unknown as { gradingPeriod?: { name?: string; code?: string } }).gradingPeriod,
                                                        grading_period: (g as unknown as { grading_period?: unknown }).grading_period,
                                                        raw: g,
                                                    }))
                                                });
                                            }
                                            const teacher = assignment.subject.teacherAssignments?.[0]?.teacher;
                                            const quarterGrades = (subjectGrades[assignment.subject.id] || []).filter(isQuarterPeriod);
                                            const byCode = new Map<string, StudentGrade>();
                                            quarterGrades.forEach(g => {
                                                const c = (g.gradingPeriod?.code || g.grading_period?.code || '').toUpperCase();
                                                const name = (g.gradingPeriod?.name || g.grading_period?.name || '').toLowerCase();

                                                // Map database codes to Q1-Q4 format
                                                if (c === '1ST_GRADING' || name.includes('1st grading') || name.includes('first quarter')) {
                                                    byCode.set('Q1', g);
                                                } else if (c === '2ND_GRADING' || name.includes('2nd grading') || name.includes('second quarter')) {
                                                    byCode.set('Q2', g);
                                                } else if (c === '3RD_GRADING' || name.includes('3rd grading') || name.includes('third quarter')) {
                                                    byCode.set('Q3', g);
                                                } else if (c === '4TH_GRADING' || name.includes('4th grading') || name.includes('fourth quarter')) {
                                                    byCode.set('Q4', g);
                                                }

                                                // Also preserve original codes for backward compatibility
                                                if (c) byCode.set(c, g);
                                            });
                                            const isSeniorHigh = (targetUser.year_level === 'senior_highschool') || (assignment.subject.academicLevel?.name?.toLowerCase()?.includes('senior') ?? false);
                                            const isElementary = (targetUser.year_level === 'elementary') || false;
                                            const isJuniorHigh = (targetUser.year_level === 'junior_highschool') || false;
                                            
                                            // Use Q1-Q4 for Elementary, Junior High, and Senior High (all use quarter-based periods)
                                            const firstSemCodes = (isSeniorHigh || isJuniorHigh || isElementary) ? ['Q1', 'Q2'] : ['P1', 'Q1'];
                                            const secondSemCodes = (isSeniorHigh || isJuniorHigh || isElementary) ? ['Q3', 'Q4'] : ['S2-MT', 'S2-PF'];
                                            const firstSemGrades = firstSemCodes.map(code => byCode.get(code)).filter(Boolean) as StudentGrade[];
                                            const secondSemGrades = secondSemCodes.map(code => byCode.get(code)).filter(Boolean) as StudentGrade[];
                                            
                                            return (
                                                <div key={assignment.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-lg">{assignment.subject?.name || 'N/A'}</h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {assignment.subject?.code || 'N/A'} • {assignment.subject?.units || 0} units
                                                            </p>
                                                            {assignment.subject?.description && (
                                                                <p className="text-sm text-gray-500 mt-1">{assignment.subject.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {assignment.subject.is_core && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Core Subject
                                                                </Badge>
                                                            )}
                                                            {assignment.semester && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {assignment.semester}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Teacher Information */}
                                                    {teacher && (
                                                        <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                            <Users className="h-4 w-4 text-blue-600" />
                                                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                                Teacher: {teacher?.name || 'N/A'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Grades Section */}
                                                    {quarterGrades.length > 0 ? (
                                                        <div className="space-y-3">
                                                            <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><Award className="h-4 w-4" />Grades by Quarter</h5>

                                                            {(isElementary || isJuniorHigh) ? (
                                                                // Elementary and Junior High: Show all 4 quarters without semester grouping
                                                                <div className="overflow-x-auto">
                                                                    <table className="w-full text-sm border-collapse border border-gray-300">
                                                                        <thead>
                                                                            <tr className="bg-gray-100 dark:bg-gray-700">
                                                                                <th className="border border-gray-300 p-2 text-left">Period</th>
                                                                                <th className="border border-gray-300 p-2 text-center">Grade</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {['Q1', 'Q2', 'Q3', 'Q4'].map((code) => {
                                                                                const grade = byCode.get(code);
                                                                                const quarterNames = {
                                                                                    'Q1': 'First Quarter',
                                                                                    'Q2': 'Second Quarter',
                                                                                    'Q3': 'Third Quarter',
                                                                                    'Q4': 'Fourth Quarter'
                                                                                };
                                                                                return (
                                                                                    <tr key={`q-${code}-${grade?.id ?? 'empty'}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                                        <td className="border border-gray-300 p-2 font-medium">{grade ? getPeriodLabel(grade) : quarterNames[code]}</td>
                                                                                        <td className="border border-gray-300 p-2 text-center">{grade ? (<span className={`text-lg font-bold ${grade.grade >= 90 ? 'text-green-600' : grade.grade >= 80 ? 'text-yellow-600' : grade.grade >= 70 ? 'text-orange-600' : 'text-red-600'}`}>{grade.grade}</span>) : '—'}</td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            ) : (
                                                                // Senior High and College: Show with semester grouping
                                                                <>
                                                                    {firstSemGrades.length > 0 && (
                                                                        <div className="overflow-x-auto">
                                                                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">{isSeniorHigh ? 'First Half' : 'First Semester'}</div>
                                                                            <table className="w-full text-sm border-collapse border border-gray-300">
                                                                                <thead>
                                                                                    <tr className="bg-gray-100 dark:bg-gray-700">
                                                                                        <th className="border border-gray-300 p-2 text-left">Period</th>
                                                                                        <th className="border border-gray-300 p-2 text-center">Grade</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {firstSemCodes.map((code) => {
                                                                                        const grade = byCode.get(code);
                                                                                        return (
                                                                                            <tr key={`fs-${code}-${grade?.id ?? 'empty'}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                                                <td className="border border-gray-300 p-2 font-medium">{grade ? getPeriodLabel(grade) : (
                                                                                                    isSeniorHigh ? (code === 'Q1' ? 'First Quarter' : 'Second Quarter') : (code === 'P1' ? 'pre final' : 'First Quarter')
                                                                                                )}</td>
                                                                                                <td className="border border-gray-300 p-2 text-center">{grade ? (<span className={`text-lg font-bold ${grade.grade >= 90 ? 'text-green-600' : grade.grade >= 80 ? 'text-yellow-600' : grade.grade >= 70 ? 'text-orange-600' : 'text-red-600'}`}>{grade.grade}</span>) : '—'}</td>
                                                                                            </tr>
                                                                                        );
                                                                                    })}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    )}

                                                                    {secondSemGrades.length > 0 && (
                                                                        <div className="overflow-x-auto">
                                                                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-4 mb-1">{isSeniorHigh ? 'Second Half' : 'Second Semester'}</div>
                                                                            <table className="w-full text-sm border-collapse border border-gray-300">
                                                                                <thead>
                                                                                    <tr className="bg-gray-100 dark:bg-gray-700">
                                                                                        <th className="border border-gray-300 p-2 text-left">Period</th>
                                                                                        <th className="border border-gray-300 p-2 text-center">Grade</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {secondSemCodes.map((code) => {
                                                                                        const grade = byCode.get(code);
                                                                                        return (
                                                                                            <tr key={`ss-${code}-${grade?.id ?? 'empty'}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                                                <td className="border border-gray-300 p-2 font-medium">{grade ? getPeriodLabel(grade) : (
                                                                                                    isSeniorHigh ? (code === 'Q3' ? 'Third Quarter' : 'Fourth Quarter') : (code === 'S2-MT' ? 'Midterm' : 'Pre-Final')
                                                                                                )}</td>
                                                                                                <td className="border border-gray-300 p-2 text-center">{grade ? (<span className={`text-lg font-bold ${grade.grade >= 90 ? 'text-green-600' : grade.grade >= 80 ? 'text-yellow-600' : grade.grade >= 70 ? 'text-orange-600' : 'text-red-600'}`}>{grade.grade}</span>) : '—'}</td>
                                                                                            </tr>
                                                                                        );
                                                                                    })}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                            
                                                            {/* Summary row */}
                                                            {quarterGrades.length > 0 && (
                                                                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded border">
                                                                    <span className="font-medium text-sm">Subject Average:</span>
                                                                    <span className="text-lg font-bold text-blue-600">{(quarterGrades.reduce((sum, grade) => sum + grade.grade, 0) / quarterGrades.length).toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                            <p className="text-sm">No grades recorded yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Linked Parents */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Linked Parents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {targetUser.parents && targetUser.parents.length > 0 ? (
                                    <div className="space-y-2">
                                        {targetUser.parents.map((p) => (
                                            <div key={p.id} className="flex items-center justify-between border rounded p-2">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{p?.name || 'N/A'}</span>
                                                    <span className="text-xs text-gray-500">{p?.email || 'N/A'}</span>
                                                </div>
                                                <Link href={route('admin.parents.show', p.id)}>
                                                    <Button variant="outline" size="sm">View Parent</Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No parents linked to this student.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <Link href={route('admin.students.edit', targetUser.id)}>
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <Edit className="h-4 w-4" />
                                            Edit Profile
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={() => setShowPasswordModal(true)}
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Reset Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Logs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Activity History ({activityLogs.total} total)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {activityLogs.data.length > 0 ? (
                                    <div className="space-y-4">
                                        {activityLogs.data.map((log) => (
                                            <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getActionIcon(log.action)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {formatActionText(log.action)}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                Performed by: <span className="font-medium">{log.user?.name || 'N/A'}</span>
                                                                {log.target_user && log.target_user.id !== log.user.id && (
                                                                    <span> • Target: <span className="font-medium">{log.target_user?.name || 'N/A'}</span></span>
                                                                )}
                                                            </p>
                                                            {log.ip_address && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    IP: {log.ip_address}
                                                                </p>
                                                            )}
                                                            {log.details && (
                                                                <div className="mt-2">
                                                                    <details className="text-xs">
                                                                        <summary className="cursor-pointer text-blue-600 dark:text-blue-400">
                                                                            View Details
                                                                        </summary>
                                                                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto dark:bg-gray-700">
                                                                            {JSON.stringify(log.details, null, 2)}
                                                                        </pre>
                                                                    </details>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {new Date(log.created_at).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {new Date(log.created_at).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pagination */}
                                        {activityLogs.last_page > 1 && (
                                            <div className="mt-6 flex items-center justify-between">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Page {activityLogs.current_page} of {activityLogs.last_page}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {activityLogs.current_page > 1 && (
                                                        <Link 
                                                            href={route('admin.students.show', { 
                                                                user: targetUser.id, 
                                                                page: activityLogs.current_page - 1 
                                                            })}
                                                        >
                                                            <Button variant="outline" size="sm">Previous</Button>
                                                        </Link>
                                                    )}
                                                    
                                                    {activityLogs.current_page < activityLogs.last_page && (
                                                        <Link 
                                                            href={route('admin.students.show', { 
                                                                user: targetUser.id, 
                                                                page: activityLogs.current_page + 1 
                                                            })}
                                                        >
                                                            <Button variant="outline" size="sm">Next</Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">No activity logs found for this student.</p>
                                    </div>
                                )}
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
                errors={errors as Record<string, string>}
            />
        </div>
    );
}
