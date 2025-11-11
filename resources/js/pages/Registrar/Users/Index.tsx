import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link, useForm, router } from '@inertiajs/react';
import { Search, Users, Eye, Edit, Trash2, Key, Upload, Download } from 'lucide-react';
import { useState, useRef, useMemo, useEffect } from 'react';
import PasswordResetModal from '@/components/registrar/PasswordResetModal';
import { useToast } from '@/components/ui/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    year_level?: string;
    created_at: string;
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
}

interface Strand {
    id: number;
    name: string;
    code?: string;
    track_id: number;
}

interface Department {
    id: number;
    name: string;
    code?: string;
}

interface Course {
    id: number;
    name: string;
    code?: string;
    department_id: number;
}

interface UsersIndexProps {
    user: any;
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: any;
    roles: any;
    currentRole?: string;
    yearLevel?: string;
    sections?: Section[];
    specificYearLevels?: Record<string, string>;
    tracks?: Track[];
    strands?: Strand[];
    departments?: Department[];
    courses?: Course[];
}

export default function UsersIndex({ user, users, filters, roles, currentRole, yearLevel, sections = [], specificYearLevels = {}, tracks = [], strands = [], departments = [], courses = [] }: UsersIndexProps) {
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
    const [csvModalOpen, setCsvModalOpen] = useState(false);
    const [selectedUploadSchoolYear, setSelectedUploadSchoolYear] = useState<string>('');
    const [selectedUploadYearLevel, setSelectedUploadYearLevel] = useState<string>('');
    const [selectedUploadSection, setSelectedUploadSection] = useState<string>('');
    const [selectedUploadTrack, setSelectedUploadTrack] = useState<string>('');
    const [selectedUploadStrand, setSelectedUploadStrand] = useState<string>('');
    const [selectedUploadDepartment, setSelectedUploadDepartment] = useState<string>('');
    const [selectedUploadCourse, setSelectedUploadCourse] = useState<string>('');
    const { delete: deleteUser } = useForm();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    // Compute filtered strands based on selected track (for SHS)
    const availableStrands = useMemo(() => {
        if (selectedUploadTrack && strands.length > 0) {
            return strands.filter(strand => strand.track_id === parseInt(selectedUploadTrack));
        }
        return strands;
    }, [selectedUploadTrack, strands]);

    // Compute filtered courses based on selected department (for College)
    const availableCourses = useMemo(() => {
        if (selectedUploadDepartment && courses.length > 0) {
            return courses.filter(course => course.department_id === parseInt(selectedUploadDepartment));
        }
        return courses;
    }, [selectedUploadDepartment, courses]);

    // Compute filtered sections based on selected criteria
    const availableSections = useMemo(() => {
        let filtered = sections;

        // Filter by year level for Elementary/JHS
        if (selectedUploadYearLevel && (yearLevel === 'elementary' || yearLevel === 'junior_highschool')) {
            filtered = filtered.filter(section => section.specific_year_level === selectedUploadYearLevel);
        }

        // Filter by track/strand for SHS
        if (yearLevel === 'senior_highschool') {
            if (selectedUploadTrack) {
                filtered = filtered.filter(section => section.track_id === parseInt(selectedUploadTrack));
            }
            if (selectedUploadStrand) {
                filtered = filtered.filter(section => section.strand_id === parseInt(selectedUploadStrand));
            }
            if (selectedUploadYearLevel) {
                filtered = filtered.filter(section => section.specific_year_level === selectedUploadYearLevel);
            }
        }

        // Filter by department/course for College
        if (yearLevel === 'college') {
            if (selectedUploadDepartment) {
                filtered = filtered.filter(section => section.department_id === parseInt(selectedUploadDepartment));
            }
            if (selectedUploadCourse) {
                filtered = filtered.filter(section => section.course_id === parseInt(selectedUploadCourse));
            }
            if (selectedUploadYearLevel) {
                filtered = filtered.filter(section => section.specific_year_level === selectedUploadYearLevel);
            }
        }

        return filtered;
    }, [selectedUploadYearLevel, selectedUploadTrack, selectedUploadStrand, selectedUploadDepartment, selectedUploadCourse, sections, yearLevel]);

    // Reset dependent selections when parent changes
    useEffect(() => {
        setSelectedUploadSection('');
    }, [selectedUploadYearLevel, selectedUploadTrack, selectedUploadStrand, selectedUploadDepartment, selectedUploadCourse]);

    useEffect(() => {
        setSelectedUploadStrand('');
    }, [selectedUploadTrack]);

    useEffect(() => {
        setSelectedUploadCourse('');
    }, [selectedUploadDepartment]);

    const handleDelete = (userItem: User) => {
        setUserToDelete(userItem);
    };

    const handleResetPassword = (userItem: User) => {
        setResetPasswordUser(userItem);
    };

    const handleDownloadTemplate = () => {
        // Validation for school year (required)
        if (!selectedUploadSchoolYear) {
            addToast('Please enter a school year first.', 'error');
            return;
        }

        // Validation for Elementary/JHS
        if (!selectedUploadSection && (yearLevel === 'elementary' || yearLevel === 'junior_highschool')) {
            addToast('Please select a grade level and section first.', 'error');
            return;
        }
        // Validation for SHS
        if (!selectedUploadSection && yearLevel === 'senior_highschool') {
            addToast('Please select track, strand, and section first.', 'error');
            return;
        }
        // Validation for College
        if (!selectedUploadSection && yearLevel === 'college') {
            addToast('Please select department, course, year level, and section first.', 'error');
            return;
        }

        const params: Record<string, string> = {};
        if (yearLevel) {
            params.academic_level = yearLevel;
        }
        // School year (required)
        if (selectedUploadSchoolYear) {
            params.school_year = selectedUploadSchoolYear;
        }
        // For Elementary/JHS/College (year level)
        if (selectedUploadYearLevel) {
            params.specific_year_level = selectedUploadYearLevel;
        }
        // For SHS
        if (selectedUploadTrack) {
            params.track_id = selectedUploadTrack;
        }
        if (selectedUploadStrand) {
            params.strand_id = selectedUploadStrand;
        }
        // For College
        if (selectedUploadDepartment) {
            params.department_id = selectedUploadDepartment;
        }
        if (selectedUploadCourse) {
            params.course_id = selectedUploadCourse;
        }
        // For all
        if (selectedUploadSection) {
            params.section_id = selectedUploadSection;
        }

        window.location.href = route('registrar.students.template', params);
        addToast('Downloading CSV template...', 'success');
    };

    const handleUploadClick = () => {
        // Validation for school year (required)
        if (!selectedUploadSchoolYear) {
            addToast('Please enter a school year first.', 'error');
            return;
        }

        // Validation for Elementary/JHS
        if (!selectedUploadSection && (yearLevel === 'elementary' || yearLevel === 'junior_highschool')) {
            addToast('Please select a grade level and section first.', 'error');
            return;
        }
        // Validation for SHS
        if (!selectedUploadSection && yearLevel === 'senior_highschool') {
            addToast('Please select track, strand, and section first.', 'error');
            return;
        }
        // Validation for College
        if (!selectedUploadSection && yearLevel === 'college') {
            addToast('Please select department, course, year level, and section first.', 'error');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleCsvModalOpen = () => {
        // For elementary/JHS, require section selection via modal
        if (yearLevel) {
            setCsvModalOpen(true);
        } else {
            // For non-student pages, use old workflow
            fileInputRef.current?.click();
        }
    };

    const handleFileSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        // Pass academic level if viewing a specific level
        if (yearLevel) {
            formData.append('academic_level', yearLevel);
        }
        // Pass school year (required)
        if (selectedUploadSchoolYear) {
            formData.append('school_year', selectedUploadSchoolYear);
        }
        // Pass year level for elementary/JHS/College
        if (selectedUploadYearLevel) {
            formData.append('specific_year_level', selectedUploadYearLevel);
        }
        // Pass track/strand parameters for SHS
        if (selectedUploadTrack) {
            formData.append('track_id', selectedUploadTrack);
        }
        if (selectedUploadStrand) {
            formData.append('strand_id', selectedUploadStrand);
        }
        // Pass department/course parameters for College
        if (selectedUploadDepartment) {
            formData.append('department_id', selectedUploadDepartment);
        }
        if (selectedUploadCourse) {
            formData.append('course_id', selectedUploadCourse);
        }
        // For all
        if (selectedUploadSection) {
            formData.append('section_id', selectedUploadSection);
        }
        router.post(route('registrar.students.upload'), formData, {
            forceFormData: true,
            onSuccess: () => {
                addToast('Students CSV uploaded successfully.', 'success');
                setCsvModalOpen(false);
                setSelectedUploadSchoolYear('');
                setSelectedUploadYearLevel('');
                setSelectedUploadSection('');
                setSelectedUploadTrack('');
                setSelectedUploadStrand('');
                setSelectedUploadDepartment('');
                setSelectedUploadCourse('');
                router.reload();
            },
            onError: (err) => {
                console.error('CSV upload failed:', err);
                addToast('CSV upload failed. Please check the file format.', 'error');
            },
            preserveScroll: true,
        });
        // Reset the input
        e.target.value = '';
    };

    const confirmDelete = () => {
        if (userToDelete) {
            let deleteRoute;
            
            // Determine the correct delete route based on current role
            if (currentRole && currentRole !== 'student') {
                // For role-specific routes (administrators, teachers, etc.)
                deleteRoute = route(`registrar.${currentRole}s.destroy`, userToDelete.id);
            } else if (yearLevel) {
                // For year-level specific student routes
                deleteRoute = route('registrar.students.destroy', userToDelete.id);
            } else {
                // For general users route
                deleteRoute = route('registrar.users.destroy', userToDelete.id);
            }
            
            deleteUser(deleteRoute, {
                onSuccess: () => {
                    setUserToDelete(null);
                },
            });
        }
    };



    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl space-y-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {yearLevel ? `${yearLevel.charAt(0).toUpperCase() + yearLevel.slice(1).replace('_', ' ')} Students` : 
                                 currentRole ? `${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Management` : 'User Management'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                {yearLevel ? `Manage ${yearLevel.replace('_', ' ')} student accounts.` : 
                                 'Manage user accounts and permissions.'}
                            </p>
                        </div>

                        {/* Search and Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Search & Filters
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="flex gap-4 flex-1">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Search users by name or email..."
                                                defaultValue={filters?.search || ''}
                                            />
                                        </div>
                                        <Button>Search</Button>
                                    </div>
                                    {/* Only show CSV buttons for student pages with yearLevel */}
                                    {yearLevel && (
                                        <div className="flex flex-wrap gap-2 justify-end w-full lg:w-auto">
                                            <input
                                                type="file"
                                                accept=".csv,text/csv"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={handleFileSelected}
                                            />
                                            <Button variant="outline" className="flex items-center gap-2" onClick={handleCsvModalOpen}>
                                                <Upload className="h-4 w-4" />
                                                CSV Upload Manager
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Users List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Users ({users.total})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {users.data.map((userItem) => (
                                        <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <h3 className="font-medium">{userItem.name}</h3>
                                                    <p className="text-sm text-gray-500">{userItem.email}</p>
                                                    {userItem.year_level && (
                                                        <p className="text-xs text-gray-400 capitalize">
                                                            {userItem.year_level.replace('_', ' ')}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge variant="secondary">{userItem.user_role}</Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={route('registrar.users.show', userItem.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                </Link>
                                                <Link href={route('registrar.users.edit', userItem.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleResetPassword(userItem)}
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Key className="h-4 w-4 mr-2" />
                                                    Reset Password
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleDelete(userItem)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {users.data.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">No users found.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                {users.last_page > 1 && (
                                    <div className="flex justify-center mt-6">
                                        <div className="flex gap-2">
                                            {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={page === users.current_page ? 'default' : 'outline'}
                                                    size="sm"
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Delete Confirmation Dialog */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete <strong>{userToDelete.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setUserToDelete(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
                            >
                                Delete User
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {resetPasswordUser && (
                <PasswordResetModal
                    user={resetPasswordUser}
                    isOpen={!!resetPasswordUser}
                    onClose={() => setResetPasswordUser(null)}
                    routeName={currentRole ? `registrar.${currentRole}s.reset-password` : 'registrar.users.reset-password'}
                />
            )}

            {/* CSV Upload Manager Modal */}
            <Dialog open={csvModalOpen} onOpenChange={setCsvModalOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>CSV Upload Manager</DialogTitle>
                        <DialogDescription>
                            {yearLevel === 'senior_highschool'
                                ? 'Enter the school year, then select the track, strand, year level, and section, then download the template and upload your CSV file.'
                                : yearLevel === 'college'
                                ? 'Enter the school year, then select the department, course, year level, and section, then download the template and upload your CSV file.'
                                : 'Enter the school year, then select the grade level and section, then download the template and upload your CSV file.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 overflow-y-auto flex-1">
                        {/* School Year Input (Required for all) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                School Year <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., 2024-2025"
                                value={selectedUploadSchoolYear}
                                onChange={(e) => setSelectedUploadSchoolYear(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500">Format: YYYY-YYYY (e.g., 2024-2025)</p>
                        </div>

                        {/* For Elementary/JHS: Grade Level Selector */}
                        {(yearLevel === 'elementary' || yearLevel === 'junior_highschool') && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Grade Level</label>
                                <Select value={selectedUploadYearLevel} onValueChange={setSelectedUploadYearLevel}>
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
                        {yearLevel === 'senior_highschool' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Track</label>
                                <Select value={selectedUploadTrack} onValueChange={setSelectedUploadTrack}>
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
                        {yearLevel === 'senior_highschool' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Strand</label>
                                <Select
                                    value={selectedUploadStrand}
                                    onValueChange={setSelectedUploadStrand}
                                    disabled={!selectedUploadTrack}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={selectedUploadTrack ? "Select strand" : "Select track first"} />
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
                        {yearLevel === 'senior_highschool' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Year Level</label>
                                <Select
                                    value={selectedUploadYearLevel}
                                    onValueChange={setSelectedUploadYearLevel}
                                    disabled={!selectedUploadStrand}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={selectedUploadStrand ? "Select year level" : "Select strand first"} />
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
                        {yearLevel === 'college' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Department</label>
                                <Select
                                    value={selectedUploadDepartment}
                                    onValueChange={setSelectedUploadDepartment}
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
                        {yearLevel === 'college' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Course</label>
                                <Select
                                    value={selectedUploadCourse}
                                    onValueChange={setSelectedUploadCourse}
                                    disabled={!selectedUploadDepartment}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={selectedUploadDepartment ? "Select course" : "Select department first"} />
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
                        {yearLevel === 'college' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Year Level</label>
                                <Select
                                    value={selectedUploadYearLevel}
                                    onValueChange={setSelectedUploadYearLevel}
                                    disabled={!selectedUploadCourse}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={selectedUploadCourse ? "Select year level" : "Select course first"} />
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
                                value={selectedUploadSection}
                                onValueChange={setSelectedUploadSection}
                                disabled={
                                    (yearLevel === 'elementary' || yearLevel === 'junior_highschool')
                                        ? !selectedUploadYearLevel
                                        : (yearLevel === 'senior_highschool'
                                            ? !selectedUploadYearLevel
                                            : (yearLevel === 'college'
                                                ? !selectedUploadYearLevel
                                                : !selectedUploadStrand))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={
                                        (yearLevel === 'elementary' || yearLevel === 'junior_highschool')
                                            ? (selectedUploadYearLevel ? "Select section" : "Select grade level first")
                                            : (yearLevel === 'senior_highschool'
                                                ? (selectedUploadYearLevel ? "Select section" : "Select year level first")
                                                : (yearLevel === 'college'
                                                    ? (selectedUploadYearLevel ? "Select section" : "Select year level first")
                                                    : (selectedUploadStrand ? "Select section" : "Select track and strand first")))
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

                        {/* Instructions */}
                        {selectedUploadSection && (
                            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
                                <p className="font-medium mb-1">Next Steps:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Click "Download Template" to get the CSV file</li>
                                    <li>Click "Upload CSV" to import the students</li>
                                </ol>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex gap-2 flex-shrink-0">
                        <Button
                            variant="outline"
                            onClick={handleDownloadTemplate}
                            disabled={!selectedUploadSection}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download Template
                        </Button>
                        <Button
                            onClick={handleUploadClick}
                            disabled={!selectedUploadSection}
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
