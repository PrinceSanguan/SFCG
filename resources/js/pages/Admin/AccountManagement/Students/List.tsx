import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, router, usePage } from '@inertiajs/react';
import { Search, Plus, Edit, Eye, Trash2, RotateCcw, Upload, Download } from 'lucide-react';
import { useRef, useState, useEffect, useMemo } from 'react';
import PasswordResetModal from '@/components/admin/PasswordResetModal';
import { useToast } from '@/components/ui/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    student_number?: string;
    created_at: string;
    last_login_at?: string;
    parents?: Array<{ id: number; name: string; email: string; pivot?: { relationship_type?: string } }>;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Filters {
    search?: string;
    sort_by?: string;
    sort_direction?: string;
    year_level?: string;
}

interface Section {
    id: number;
    name: string;
    code?: string;
    academic_level_id: number;
    specific_year_level?: string;
    track_id?: number;
    strand_id?: number;
    department_id?: number;
    course_id?: number;
}

interface Track {
    id: number;
    name: string;
    code?: string;
    description?: string;
}

interface Strand {
    id: number;
    name: string;
    code?: string;
    description?: string;
    track_id: number;
}

interface Department {
    id: number;
    name: string;
    code?: string;
    description?: string;
}

interface Course {
    id: number;
    name: string;
    code?: string;
    description?: string;
    department_id: number;
}

interface ListProps {
    user: User;
    users: PaginatedUsers;
    filters: Filters;
    roles: Record<string, string>;
    currentAcademicLevel?: string;
    sections?: Section[];
    specificYearLevels?: Record<string, string>;
    tracks?: Track[];
    strands?: Strand[];
    departments?: Department[];
    courses?: Course[];
}

export default function StudentsList({ user, users, filters, roles, currentAcademicLevel, sections = [], specificYearLevels = {}, tracks = [], strands = [], departments = [], courses = [] }: ListProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
    const [csvModalOpen, setCsvModalOpen] = useState(false);
    const [selectedYearLevel, setSelectedYearLevel] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('');
    const [selectedTrack, setSelectedTrack] = useState<string>('');
    const [selectedStrand, setSelectedStrand] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const { errors, flash } = usePage<{ errors: any; flash: { success?: string; warning?: string; error?: string } }>().props;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { addToast } = useToast();

    // Safety check for user data
    if (!user) {
        return <div>Loading...</div>;
    }

    // Handle flash messages from backend
    useEffect(() => {
        if (flash?.success) {
            addToast(flash.success, 'success');
        }
        if (flash?.warning) {
            addToast(flash.warning, 'warning');
        }
        if (flash?.error) {
            addToast(flash.error, 'error');
        }
    }, [flash]);

    // Compute filtered strands based on selected track (for SHS)
    const availableStrands = useMemo(() => {
        if (currentAcademicLevel === 'senior_highschool' && selectedTrack) {
            return strands.filter(strand => strand.track_id.toString() === selectedTrack);
        }
        return strands;
    }, [currentAcademicLevel, selectedTrack, strands]);

    // Compute filtered courses based on selected department (for College)
    const availableCourses = useMemo(() => {
        if (currentAcademicLevel === 'college' && selectedDepartment) {
            return courses.filter(course => course.department_id.toString() === selectedDepartment);
        }
        return courses;
    }, [currentAcademicLevel, selectedDepartment, courses]);

    // Compute filtered sections based on academic level and selections
    const availableSections = useMemo(() => {
        // Elementary/JHS: Filter by year level
        if (currentAcademicLevel === 'elementary' || currentAcademicLevel === 'junior_highschool') {
            if (selectedYearLevel && sections.length > 0) {
                return sections.filter(section => section.specific_year_level === selectedYearLevel);
            }
            return sections;
        }

        // SHS: Filter by track, strand, and year level
        if (currentAcademicLevel === 'senior_highschool') {
            if (selectedTrack && selectedStrand && selectedYearLevel) {
                return sections.filter(
                    section =>
                        section.track_id?.toString() === selectedTrack &&
                        section.strand_id?.toString() === selectedStrand &&
                        section.specific_year_level === selectedYearLevel
                );
            }
            return [];
        }

        // College: Filter by department, course, and year level
        if (currentAcademicLevel === 'college') {
            if (selectedDepartment && selectedCourse && selectedYearLevel) {
                return sections.filter(
                    section =>
                        section.department_id?.toString() === selectedDepartment &&
                        section.course_id?.toString() === selectedCourse &&
                        section.specific_year_level === selectedYearLevel
                );
            }
            return [];
        }

        return sections;
    }, [currentAcademicLevel, selectedYearLevel, selectedTrack, selectedStrand, selectedDepartment, selectedCourse, sections]);

    // Reset dependent selections when parent selection changes
    useEffect(() => {
        // For SHS: Reset strand and section when track changes
        if (currentAcademicLevel === 'senior_highschool') {
            setSelectedStrand('');
            setSelectedSection('');
        }
    }, [selectedTrack, currentAcademicLevel]);

    useEffect(() => {
        // For SHS: Reset section when strand changes
        if (currentAcademicLevel === 'senior_highschool') {
            setSelectedSection('');
        }
    }, [selectedStrand, currentAcademicLevel]);

    useEffect(() => {
        // For College: Reset course and section when department changes
        if (currentAcademicLevel === 'college') {
            setSelectedCourse('');
            setSelectedSection('');
        }
    }, [selectedDepartment, currentAcademicLevel]);

    useEffect(() => {
        // For College: Reset section when course changes
        if (currentAcademicLevel === 'college') {
            setSelectedSection('');
        }
    }, [selectedCourse, currentAcademicLevel]);

    useEffect(() => {
        // Reset section when year level changes for all academic levels
        setSelectedSection('');
    }, [selectedYearLevel]);

    const handleSearch = () => {
        router.get(route('admin.students.index'), {
            search: searchTerm,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (sortBy: string) => {
        const currentDirection = filters.sort_direction || 'desc';
        const newDirection = filters.sort_by === sortBy && currentDirection === 'desc' ? 'asc' : 'desc';
        
        router.get(route('admin.students.index'), {
            ...filters,
            sort_by: sortBy,
            sort_direction: newDirection,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (userId: number) => {
        if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            router.delete(route('admin.students.destroy', userId), {
                onSuccess: () => {
                    // Reload the page to show updated list
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                }
            });
        }
    };

    const handleResetPassword = (targetUser: User) => {
        setResetPasswordUser(targetUser);
    };

    const handleCsvModalOpen = () => {
        // For elementary, JHS, SHS, and College require section selection
        if (currentAcademicLevel === 'elementary' || currentAcademicLevel === 'junior_highschool' || currentAcademicLevel === 'senior_highschool' || currentAcademicLevel === 'college') {
            setCsvModalOpen(true);
        } else {
            // For other levels (if any), use old workflow
            handleDownloadTemplateDirect();
        }
    };

    const handleDownloadTemplate = () => {
        // Validation for Elementary/JHS
        if (!selectedSection && (currentAcademicLevel === 'elementary' || currentAcademicLevel === 'junior_highschool')) {
            addToast('Please select a grade level and section first.', 'error');
            return;
        }
        // Validation for SHS
        if (!selectedSection && currentAcademicLevel === 'senior_highschool') {
            addToast('Please select track, strand, and section first.', 'error');
            return;
        }
        // Validation for College
        if (!selectedSection && currentAcademicLevel === 'college') {
            addToast('Please select department, course, year level, and section first.', 'error');
            return;
        }
        const params: Record<string, string> = {};
        if (currentAcademicLevel) {
            params.academic_level = currentAcademicLevel;
        }
        // For Elementary/JHS/College (year level)
        if (selectedYearLevel) {
            params.specific_year_level = selectedYearLevel;
        }
        // For SHS
        if (selectedTrack) {
            params.track_id = selectedTrack;
        }
        if (selectedStrand) {
            params.strand_id = selectedStrand;
        }
        // For College
        if (selectedDepartment) {
            params.department_id = selectedDepartment;
        }
        if (selectedCourse) {
            params.course_id = selectedCourse;
        }
        // For all
        if (selectedSection) {
            params.section_id = selectedSection;
        }
        window.location.href = route('admin.students.template', params);
        addToast('Downloading CSV template...', 'success');
    };

    const handleDownloadTemplateDirect = () => {
        // Direct download without modal (for non-elementary levels)
        const params = currentAcademicLevel ? { academic_level: currentAcademicLevel } : {};
        window.location.href = route('admin.students.template', params);
    };

    const handleUploadClick = () => {
        // Validation for Elementary/JHS
        if (!selectedSection && (currentAcademicLevel === 'elementary' || currentAcademicLevel === 'junior_highschool')) {
            addToast('Please select a grade level and section first.', 'error');
            return;
        }
        // Validation for SHS
        if (!selectedSection && currentAcademicLevel === 'senior_highschool') {
            addToast('Please select track, strand, and section first.', 'error');
            return;
        }
        // Validation for College
        if (!selectedSection && currentAcademicLevel === 'college') {
            addToast('Please select department, course, year level, and section first.', 'error');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        // Pass academic level if viewing a specific level
        if (currentAcademicLevel) {
            formData.append('academic_level', currentAcademicLevel);
        }
        // Pass year level for elementary/JHS/College
        if (selectedYearLevel) {
            formData.append('specific_year_level', selectedYearLevel);
        }
        // Pass track/strand parameters for SHS
        if (selectedTrack) {
            formData.append('track_id', selectedTrack);
        }
        if (selectedStrand) {
            formData.append('strand_id', selectedStrand);
        }
        // Pass department/course parameters for College
        if (selectedDepartment) {
            formData.append('department_id', selectedDepartment);
        }
        if (selectedCourse) {
            formData.append('course_id', selectedCourse);
        }
        // For all
        if (selectedSection) {
            formData.append('section_id', selectedSection);
        }
        // School year
        if (selectedSchoolYear) {
            formData.append('school_year', selectedSchoolYear);
        }
        router.post(route('admin.students.upload'), formData, {
            forceFormData: true,
            onSuccess: () => {
                addToast('Students CSV uploaded successfully.', 'success');
                setCsvModalOpen(false);
                setSelectedYearLevel('');
                setSelectedSection('');
                setSelectedSchoolYear('');
                setSelectedTrack('');
                setSelectedStrand('');
                setSelectedDepartment('');
                setSelectedCourse('');
                router.reload();
            },
            onError: (err) => {
                console.error('CSV upload failed:', err);
                addToast('CSV upload failed. Please check the file format.', 'error');
            },
            preserveScroll: true,
        });
        // reset value so same file can be selected again if needed
        e.target.value = '';
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
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {currentAcademicLevel ? currentAcademicLevel.charAt(0).toUpperCase() + currentAcademicLevel.slice(1).replace('_', ' ') : 'Students'} Management
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Create, manage, and monitor {currentAcademicLevel ? currentAcademicLevel.replace('_', ' ') : 'student'} accounts in the school system.
                            </p>
                        </div>

                        {/* Actions Bar */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
                                    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center flex-1 min-w-0">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Search students..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                className="w-64"
                                            />
                                            <Button onClick={handleSearch} variant="outline">
                                                <Search className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {/* Year level filter removed on all Students pages */}
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-end w-full lg:w-auto">
                                        {/* Only show Add New Student button when viewing a specific academic level */}
                                        {currentAcademicLevel && (
                                            <Link href={route(`admin.students.${currentAcademicLevel.replace('_', '-')}.create`)}>
                                                <Button className="flex items-center gap-2">
                                                    <Plus className="h-4 w-4" />
                                                    Add New {currentAcademicLevel.charAt(0).toUpperCase() + currentAcademicLevel.slice(1).replace('_', ' ')}
                                                </Button>
                                            </Link>
                                        )}
                                        <input
                                            type="file"
                                            accept=".csv,text/csv"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileSelected}
                                        />
                                        <Button variant="outline" className="flex items-center gap-2" onClick={handleCsvModalOpen}>
                                            <Upload className="h-4 w-4" />
                                            {currentAcademicLevel === 'elementary' || currentAcademicLevel === 'junior_highschool' || currentAcademicLevel === 'senior_highschool' || currentAcademicLevel === 'college' ? 'CSV Upload Manager' : 'Upload CSV'}
                                        </Button>
                                        {!(currentAcademicLevel === 'elementary' || currentAcademicLevel === 'junior_highschool' || currentAcademicLevel === 'senior_highschool' || currentAcademicLevel === 'college') && (
                                            <Button variant="outline" className="flex items-center gap-2" onClick={handleDownloadTemplateDirect}>
                                                <Download className="h-4 w-4" />
                                                Download Template
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Students Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {currentAcademicLevel ? currentAcademicLevel.charAt(0).toUpperCase() + currentAcademicLevel.slice(1).replace('_', ' ') : 'Students'} ({users.total} total)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th 
                                                    className="cursor-pointer p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    onClick={() => handleSort('name')}
                                                >
                                                    Name
                                                    {filters.sort_by === 'name' && (
                                                        <span className="ml-1">
                                                            {filters.sort_direction === 'desc' ? '↓' : '↑'}
                                                        </span>
                                                    )}
                                                </th>
                                                <th 
                                                    className="cursor-pointer p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    onClick={() => handleSort('student_number')}
                                                >
                                                    Student ID
                                                    {filters.sort_by === 'student_number' && (
                                                        <span className="ml-1">
                                                            {filters.sort_direction === 'desc' ? '↓' : '↑'}
                                                        </span>
                                                    )}
                                                </th>
                                                <th 
                                                    className="cursor-pointer p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    onClick={() => handleSort('email')}
                                                >
                                                    Email
                                                    {filters.sort_by === 'email' && (
                                                        <span className="ml-1">
                                                            {filters.sort_direction === 'desc' ? '↓' : '↑'}
                                                        </span>
                                                    )}
                                                </th>
                                                <th className="p-3 text-left">Role</th>
                                                <th className="p-3 text-left">Parents</th>
                                                <th 
                                                    className="cursor-pointer p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    onClick={() => handleSort('created_at')}
                                                >
                                                    Created
                                                    {filters.sort_by === 'created_at' && (
                                                        <span className="ml-1">
                                                            {filters.sort_direction === 'desc' ? '↓' : '↑'}
                                                        </span>
                                                    )}
                                                </th>
                                                <th className="p-3 text-left">Last Login</th>
                                                <th className="p-3 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.data.map((tableUser) => (
                                                <tr key={tableUser.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="p-3 font-medium">{tableUser.name}</td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">{tableUser.student_number || '—'}</td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">{tableUser.email}</td>
                                                    <td className="p-3">
                                                        <Badge variant={getRoleBadgeVariant(tableUser.user_role)}>
                                                            {roles[tableUser.user_role] || tableUser.user_role}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                                        {tableUser.parents && tableUser.parents.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {tableUser.parents.slice(0, 2).map((p) => (
                                                                    <Link key={p.id} href={route('admin.parents.show', p.id)} className="underline">
                                                                        {p.name}
                                                                    </Link>
                                                                ))}
                                                                {tableUser.parents.length > 2 && (
                                                                    <span className="text-xs text-gray-500">+{tableUser.parents.length - 2} more</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No parents linked</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                                        {new Date(tableUser.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                                        {tableUser.last_login_at 
                                                            ? new Date(tableUser.last_login_at).toLocaleDateString()
                                                            : 'Never'
                                                        }
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Link href={route('admin.students.show', tableUser.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="h-3 w-3" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={route('admin.students.edit', tableUser.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                            </Link>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => handleResetPassword(tableUser)}
                                                            >
                                                                <RotateCcw className="h-3 w-3" />
                                                            </Button>
                                                            {tableUser.id !== user.id && (
                                                                <Button 
                                                                    variant="destructive" 
                                                                    size="sm"
                                                                    onClick={() => handleDelete(tableUser.id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {users.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Showing {users.from} to {users.to} of {users.total} results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {users.current_page > 1 && (
                                                <Link 
                                                    href={route('admin.students.index', { ...filters, page: users.current_page - 1 })}
                                                >
                                                    <Button variant="outline" size="sm">Previous</Button>
                                                </Link>
                                            )}
                                            
                                            <span className="text-sm">
                                                Page {users.current_page} of {users.last_page}
                                            </span>
                                            
                                            {users.current_page < users.last_page && (
                                                <Link 
                                                    href={route('admin.students.index', { ...filters, page: users.current_page + 1 })}
                                                >
                                                    <Button variant="outline" size="sm">Next</Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Password Reset Modal */}
            {resetPasswordUser && (
                <PasswordResetModal
                    user={resetPasswordUser}
                    isOpen={!!resetPasswordUser}
                    onClose={() => setResetPasswordUser(null)}
                    errors={errors as Record<string, string>}
                />
            )}

            {/* CSV Upload Manager Modal */}
            <Dialog open={csvModalOpen} onOpenChange={setCsvModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>CSV Upload Manager</DialogTitle>
                        <DialogDescription>
                            {currentAcademicLevel === 'senior_highschool'
                                ? 'Select the track, strand, year level, and section first, then download the template and upload your CSV file.'
                                : currentAcademicLevel === 'college'
                                ? 'Select the department, course, year level, and section first, then download the template and upload your CSV file.'
                                : 'Select the grade level and section first, then download the template and upload your CSV file.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* For Elementary/JHS: Grade Level Selector */}
                        {(currentAcademicLevel === 'elementary' || currentAcademicLevel === 'junior_highschool') && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Grade Level</label>
                                <Select value={selectedYearLevel} onValueChange={setSelectedYearLevel}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grade level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(specificYearLevels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* For SHS: Track Selector */}
                        {currentAcademicLevel === 'senior_highschool' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Track</label>
                                <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select track" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tracks.map((track) => (
                                            <SelectItem key={track.id} value={track.id.toString()}>
                                                {track.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* For SHS: Strand Selector */}
                        {currentAcademicLevel === 'senior_highschool' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Strand</label>
                                <Select
                                    value={selectedStrand}
                                    onValueChange={setSelectedStrand}
                                    disabled={!selectedTrack}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={selectedTrack ? "Select strand" : "Select track first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableStrands.map((strand) => (
                                            <SelectItem key={strand.id} value={strand.id.toString()}>
                                                {strand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* For SHS: Year Level Selector */}
                        {currentAcademicLevel === 'senior_highschool' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Year Level</label>
                                <Select
                                    value={selectedYearLevel}
                                    onValueChange={setSelectedYearLevel}
                                    disabled={!selectedStrand}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={selectedStrand ? "Select year level" : "Select strand first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(specificYearLevels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* For College: Department Selector */}
                        {currentAcademicLevel === 'college' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Department</label>
                                <Select
                                    value={selectedDepartment}
                                    onValueChange={setSelectedDepartment}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((department) => (
                                            <SelectItem key={department.id} value={department.id.toString()}>
                                                {department.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* For College: Course Selector */}
                        {currentAcademicLevel === 'college' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Course</label>
                                <Select
                                    value={selectedCourse}
                                    onValueChange={setSelectedCourse}
                                    disabled={!selectedDepartment}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={selectedDepartment ? "Select course" : "Select department first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCourses.map((course) => (
                                            <SelectItem key={course.id} value={course.id.toString()}>
                                                {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* For College: Year Level Selector */}
                        {currentAcademicLevel === 'college' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Year Level</label>
                                <Select
                                    value={selectedYearLevel}
                                    onValueChange={setSelectedYearLevel}
                                    disabled={!selectedCourse}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={selectedCourse ? "Select year level" : "Select course first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(specificYearLevels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Section Selector (for all) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Section</label>
                            <Select
                                value={selectedSection}
                                onValueChange={setSelectedSection}
                                disabled={
                                    (currentAcademicLevel === 'elementary' || currentAcademicLevel === 'junior_highschool')
                                        ? !selectedYearLevel
                                        : (currentAcademicLevel === 'senior_highschool'
                                            ? !selectedYearLevel
                                            : (currentAcademicLevel === 'college'
                                                ? !selectedYearLevel
                                                : !selectedStrand))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={
                                        (currentAcademicLevel === 'elementary' || currentAcademicLevel === 'junior_highschool')
                                            ? (selectedYearLevel ? "Select section" : "Select grade level first")
                                            : (currentAcademicLevel === 'senior_highschool'
                                                ? (selectedYearLevel ? "Select section" : "Select year level first")
                                                : (currentAcademicLevel === 'college'
                                                    ? (selectedYearLevel ? "Select section" : "Select year level first")
                                                    : (selectedStrand ? "Select section" : "Select track and strand first")))
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSections.map((section) => (
                                        <SelectItem key={section.id} value={section.id.toString()}>
                                            {section.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* School Year */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">School Year</label>
                            <Input
                                type="text"
                                placeholder="e.g., 2024-2025"
                                value={selectedSchoolYear}
                                onChange={(e) => setSelectedSchoolYear(e.target.value)}
                            />
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                <p className="text-sm text-blue-800 font-medium mb-1">School Year Format Guide:</p>
                                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                                    <li>Format: YYYY-YYYY (e.g., 2024-2025, 2025-2026)</li>
                                    <li>First year must be one less than second year</li>
                                    <li>Used to track student enrollment for specific academic year</li>
                                    <li>Will be included in the CSV template</li>
                                </ul>
                            </div>
                        </div>

                        {/* Instructions */}
                        {selectedSection && (
                            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
                                <p className="font-medium mb-1">Next Steps:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Click "Download Template" to get the CSV file</li>
                                    <li>Click "Upload CSV" to import the students</li>
                                </ol>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleDownloadTemplate}
                            disabled={!selectedSection}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download Template
                        </Button>
                        <Button
                            onClick={handleUploadClick}
                            disabled={!selectedSection}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload CSV
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
