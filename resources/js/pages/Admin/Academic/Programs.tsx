import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast';

interface User { name: string; email: string; user_role: string }
interface AcademicLevel { id: number; name: string; key: string; strands: Strand[] }
interface Department { id: number; name: string; code: string; courses: Course[] }
interface Track { id: number; name: string; code: string; description?: string; is_active?: boolean }
interface Strand { id: number; name: string; code: string; track_id?: number; track?: Track; academic_level_id: number; academic_level: AcademicLevel }
interface Course { id: number; name: string; code: string; department_id: number; description?: string; units?: number; is_active?: boolean }

export default function Programs({ user, academicLevels = [], departments = [], tracks = [], formErrors }: { user: User; academicLevels?: AcademicLevel[]; departments?: Department[]; tracks?: Track[]; formErrors?: Record<string, string> }) {
    const [activeTab, setActiveTab] = useState('tracks');
    const { addToast } = useToast();
    
    // Track form state
    const [trackForm, setTrackForm] = useState({ name: '', code: '', description: '' });
    const [trackModal, setTrackModal] = useState(false);
    const [editTrack, setEditTrack] = useState<Track | null>(null);
    
    // Strand form state
    const [strandForm, setStrandForm] = useState({ name: '', code: '', track_id: '', academic_level_id: '' });
    const [strandModal, setStrandModal] = useState(false);
    const [editStrand, setEditStrand] = useState<Strand | null>(null);

    // Track handlers
    const submitTrack = () => {
        // Basic validation
        if (!trackForm.name.trim()) {
            addToast('Track name is required', 'error');
            return;
        }
        if (!trackForm.code.trim()) {
            addToast('Track code is required', 'error');
            return;
        }
        
        router.post(route('admin.academic.tracks.store'), trackForm, {
            preserveScroll: true,
            onSuccess: () => { 
                addToast('Track created successfully!', 'success');
                setTrackForm({ name: '', code: '', description: '' }); 
                setTrackModal(false); 
            },
            onError: (errors) => {
                console.error('Track creation errors:', errors);
                // Display first error
                const firstError = Object.values(errors)[0];
                if (firstError && firstError.length > 0) {
                    addToast(firstError[0], 'error');
                } else {
                    addToast('Failed to create track. Please try again.', 'error');
                }
            },
        });
    };
    
    const updateTrack = (track: Track) => {
        const data = { name: track.name, code: track.code, description: track.description };
        router.put(route('admin.academic.tracks.update', track.id), data, { 
            preserveScroll: true, 
            onSuccess: () => {
                addToast('Track updated successfully!', 'success');
                setEditTrack(null);
            },
            onError: (errors) => {
                console.error('Track update errors:', errors);
                const firstError = Object.values(errors)[0];
                if (firstError && firstError.length > 0) {
                    addToast(firstError[0], 'error');
                } else {
                    addToast('Failed to update track. Please try again.', 'error');
                }
            }
        });
    };
    
    const destroyTrack = (track: Track) => {
        if (confirm(`Delete track ${track.name}?`)) {
            router.delete(route('admin.academic.tracks.destroy', track.id), { 
                preserveScroll: true,
                onSuccess: () => {
                    addToast('Track deleted successfully!', 'success');
                },
                onError: (errors) => {
                    console.error('Track deletion errors:', errors);
                    addToast('Failed to delete track. Please try again.', 'error');
                }
            });
        }
    };

    // Auto-set Senior High School when modal opens
    const openStrandModal = () => {
        const seniorHighLevel = academicLevels.find(level => level.key === 'senior_highschool');
        if (seniorHighLevel) {
            setStrandForm({ name: '', code: '', track_id: '', academic_level_id: seniorHighLevel.id.toString() });
        }
        setStrandModal(true);
    };
    
    // Department form state
    const [deptForm, setDeptForm] = useState({ name: '', code: '' });
    const [deptModal, setDeptModal] = useState(false);
    const [editDept, setEditDept] = useState<Department | null>(null);
    
    // Course form state
    const [courseForm, setCourseForm] = useState({ name: '', code: '', department_id: '' });
    const [courseModal, setCourseModal] = useState(false);
    const [editCourse, setEditCourse] = useState<Course | null>(null);

    // Strand handlers
    const submitStrand = () => {
        router.post(route('admin.academic.strands.store'), strandForm, {
            preserveScroll: true,
            onSuccess: () => { 
                addToast('Strand created successfully!', 'success');
                setStrandForm({ name: '', code: '', track_id: '', academic_level_id: '' }); 
                setStrandModal(false); 
            },
            onError: (errors) => {
                console.error('Strand creation errors:', errors);
                const firstError = Object.values(errors)[0];
                if (firstError && firstError.length > 0) {
                    addToast(firstError[0], 'error');
                } else {
                    addToast('Failed to create strand. Please try again.', 'error');
                }
            }
        });
    };
    
    const updateStrand = (strand: Strand) => {
        const data = { name: strand.name, code: strand.code, track_id: strand.track_id, academic_level_id: strand.academic_level_id };
        router.put(route('admin.academic.strands.update', strand.id), data, { 
            preserveScroll: true, 
            onSuccess: () => {
                addToast('Strand updated successfully!', 'success');
                setEditStrand(null);
            },
            onError: (errors) => {
                console.error('Strand update errors:', errors);
                const firstError = Object.values(errors)[0];
                if (firstError && firstError.length > 0) {
                    addToast(firstError[0], 'error');
                } else {
                    addToast('Failed to update strand. Please try again.', 'error');
                }
            }
        });
    };
    
    const destroyStrand = (strand: Strand) => {
        if (confirm(`Delete strand ${strand.name}?`)) {
            router.delete(route('admin.academic.strands.destroy', strand.id), { 
                preserveScroll: true,
                onSuccess: () => {
                    addToast('Strand deleted successfully!', 'success');
                },
                onError: (errors) => {
                    console.error('Strand deletion errors:', errors);
                    addToast('Failed to delete strand. Please try again.', 'error');
                }
            });
        }
    };

    // Department handlers
    const submitDepartment = () => {
        router.post(route('admin.academic.departments.store'), deptForm, {
            preserveScroll: true,
            onSuccess: () => { 
                addToast('Department created successfully!', 'success');
                setDeptForm({ name: '', code: '' }); 
                setDeptModal(false); 
            },
            onError: (errors) => {
                console.error('Department creation errors:', errors);
                const firstError = Object.values(errors)[0];
                if (firstError && firstError.length > 0) {
                    addToast(firstError[0], 'error');
                } else {
                    addToast('Failed to create department. Please try again.', 'error');
                }
            }
        });
    };
    
    const updateDepartment = (dept: Department) => {
        const data = { name: dept.name, code: dept.code };
        router.put(route('admin.academic.departments.update', dept.id), data, { 
            preserveScroll: true, 
            onSuccess: () => {
                addToast('Department updated successfully!', 'success');
                setEditDept(null);
            },
            onError: (errors) => {
                console.error('Department update errors:', errors);
                const firstError = Object.values(errors)[0];
                if (firstError && firstError.length > 0) {
                    addToast(firstError[0], 'error');
                } else {
                    addToast('Failed to update department. Please try again.', 'error');
                }
            }
        });
    };
    
    const destroyDepartment = (dept: Department) => {
        if (confirm(`Delete department ${dept.name}?`)) {
            router.delete(route('admin.academic.departments.destroy', dept.id), { 
                preserveScroll: true,
                onSuccess: () => {
                    addToast('Department deleted successfully!', 'success');
                },
                onError: (errors) => {
                    console.error('Department deletion errors:', errors);
                    addToast('Failed to delete department. Please try again.', 'error');
                }
            });
        }
    };

    // Course handlers
    const submitCourse = () => {
        router.post(route('admin.academic.courses.store'), courseForm, {
            preserveScroll: true,
            onSuccess: () => { 
                addToast('Course created successfully!', 'success');
                setCourseForm({ name: '', code: '', department_id: '' }); 
                setCourseModal(false); 
            },
            onError: (errors) => {
                console.error('Course creation errors:', errors);
                const firstError = Object.values(errors)[0];
                if (firstError && firstError.length > 0) {
                    addToast(firstError[0], 'error');
                } else {
                    addToast('Failed to create course. Please try again.', 'error');
                }
            }
        });
    };
    
    const updateCourse = (course: Course) => {
        const data = { name: course.name, code: course.code, department_id: course.department_id };
        router.put(route('admin.academic.courses.update', course.id), data, { 
            preserveScroll: true, 
            onSuccess: () => {
                addToast('Course updated successfully!', 'success');
                setEditCourse(null);
            },
            onError: (errors) => {
                console.error('Course update errors:', errors);
                const firstError = Object.values(errors)[0];
                if (firstError && firstError.length > 0) {
                    addToast(firstError[0], 'error');
                } else {
                    addToast('Failed to update course. Please try again.', 'error');
                }
            }
        });
    };
    
    const destroyCourse = (course: Course) => {
        if (confirm(`Delete course ${course.name}?`)) {
            router.delete(route('admin.academic.courses.destroy', course.id), { 
                preserveScroll: true,
                onSuccess: () => {
                    addToast('Course deleted successfully!', 'success');
                },
                onError: (errors) => {
                    console.error('Course deletion errors:', errors);
                    addToast('Failed to delete course. Please try again.', 'error');
                }
            });
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mb-4">
                        <Link href={route('admin.academic.index')}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" /> Back to Academic & Curriculum
                            </Button>
                        </Link>
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage strands, courses, and departments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="tracks">Tracks</TabsTrigger>
                                    <TabsTrigger value="strands">Strands</TabsTrigger>
                                    <TabsTrigger value="departments">Departments</TabsTrigger>
                                    <TabsTrigger value="courses">Courses</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="tracks" className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Academic Tracks</h3>
                                        <Dialog open={trackModal} onOpenChange={setTrackModal}>
                                            <DialogTrigger asChild>
                                                <Button className="flex items-center gap-2">
                                                    <Plus className="h-4 w-4" />
                                                    Add Track
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Add new track</DialogTitle>
                                                    <DialogDescription>
                                                        Create a new academic track for Senior High School students.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <p className="text-sm text-blue-800">
                                                            <strong>Note:</strong> Tracks are the main categories of study paths for Senior High School students (Academic, TVL, Sports, Arts and Design).
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="track-name">Name</Label>
                                                        <Input id="track-name" value={trackForm.name} onChange={(e) => setTrackForm({ ...trackForm, name: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="track-code">Code</Label>
                                                        <Input id="track-code" value={trackForm.code} onChange={(e) => setTrackForm({ ...trackForm, code: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="track-description">Description</Label>
                                                        <Input id="track-description" value={trackForm.description} onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })} />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={submitTrack}>Save</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    
                                    <div className="overflow-x-auto rounded border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="text-left p-3">Code</th>
                                                    <th className="text-left p-3">Name</th>
                                                    <th className="text-left p-3">Description</th>
                                                    <th className="text-left p-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tracks && tracks.map((track) => (
                                                    <tr key={track.id} className="border-t">
                                                        <td className="p-3">{track.code}</td>
                                                        <td className="p-3">{track.name}</td>
                                                        <td className="p-3">{track.description || '-'}</td>
                                                        <td className="p-3">
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => setEditTrack(track)}>Edit</Button>
                                                                <Button variant="destructive" size="sm" onClick={() => destroyTrack(track)}>Delete</Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="strands" className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Academic Strands</h3>
                                        <Dialog open={strandModal} onOpenChange={setStrandModal}>
                                            <DialogTrigger asChild>
                                                <Button onClick={openStrandModal} className="flex items-center gap-2">
                                                    <Plus className="h-4 w-4" />
                                                    Add Strand
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Add new strand</DialogTitle>
                                                    <DialogDescription>
                                                        Create a new strand under a specific track for Senior High School students.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <p className="text-sm text-blue-800">
                                                            <strong>Note:</strong> Strands are subdivisions under tracks. Select a track first, then specify the strand details.
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="strand-track">Track *</Label>
                                                        <Select value={strandForm.track_id} onValueChange={(value) => setStrandForm({ ...strandForm, track_id: value })}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a track" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {tracks && tracks.map((track) => (
                                                                    <SelectItem key={track.id} value={track.id.toString()}>
                                                                        {track.name} ({track.code})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Select the track this strand belongs to (e.g., Academic Track, TVL Track)
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="strand-name">Name</Label>
                                                        <Input id="strand-name" value={strandForm.name} onChange={(e) => setStrandForm({ ...strandForm, name: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="strand-code">Code</Label>
                                                        <Input id="strand-code" value={strandForm.code} onChange={(e) => setStrandForm({ ...strandForm, code: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="strand-level">Academic Level</Label>
                                                        <Select value={strandForm.academic_level_id} onValueChange={(value) => setStrandForm({ ...strandForm, academic_level_id: value })} disabled>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select academic level" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {academicLevels
                                                                    .filter(level => level.key === 'senior_highschool')
                                                                    .map((level) => (
                                                                        <SelectItem key={level.id} value={level.id.toString()}>
                                                                            {level.name}
                                                                        </SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Strands are automatically assigned to Senior High School
                                                        </p>
                                                        {formErrors?.academic_level_id && (
                                                            <Alert variant="destructive">
                                                                <AlertDescription>{formErrors.academic_level_id}</AlertDescription>
                                                            </Alert>
                                                        )}
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={submitStrand}>Save</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    
                                    <div className="overflow-x-auto rounded border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="text-left p-3">Code</th>
                                                    <th className="text-left p-3">Name</th>
                                                    <th className="text-left p-3">Track</th>
                                                    <th className="text-left p-3">Academic Level</th>
                                                    <th className="text-left p-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {academicLevels.flatMap(level => level.strands).map((strand) => (
                                                    <tr key={strand.id} className="border-t">
                                                        <td className="p-3">{strand.code}</td>
                                                        <td className="p-3">{strand.name}</td>
                                                        <td className="p-3">{strand.track?.name || '-'}</td>
                                                        <td className="p-3">
                                                            {academicLevels.find(l => l.id === strand.academic_level_id)?.name || '-'}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => setEditStrand(strand)}>Edit</Button>
                                                                <Button variant="destructive" size="sm" onClick={() => destroyStrand(strand)}>Delete</Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="departments" className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Departments</h3>
                                        <Dialog open={deptModal} onOpenChange={setDeptModal}>
                                            <DialogTrigger asChild>
                                                <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add Department</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Add new department</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label htmlFor="dept-name">Name</Label>
                                                        <Input id="dept-name" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="dept-code">Code</Label>
                                                        <Input id="dept-code" value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={submitDepartment}>Save</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    
                                    <div className="overflow-x-auto rounded border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="text-left p-3">Code</th>
                                                    <th className="text-left p-3">Name</th>
                                                    <th className="text-left p-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {departments.map((dept) => (
                                                    <tr key={dept.id} className="border-t">
                                                        <td className="p-3">{dept.code}</td>
                                                        <td className="p-3">{dept.name}</td>
                                                        <td className="p-3">
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => setEditDept(dept)}>Edit</Button>
                                                                <Button variant="destructive" size="sm" onClick={() => destroyDepartment(dept)}>Delete</Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="courses" className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Courses</h3>
                                        <Dialog open={courseModal} onOpenChange={setCourseModal}>
                                            <DialogTrigger asChild>
                                                <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add Course</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Add new course</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label htmlFor="course-name">Name</Label>
                                                        <Input id="course-name" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="course-code">Code</Label>
                                                        <Input id="course-code" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="course-dept">Department</Label>
                                                        <Select value={courseForm.department_id} onValueChange={(value) => setCourseForm({ ...courseForm, department_id: value })}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select department" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {departments.map((dept) => (
                                                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                        {dept.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={submitCourse}>Save</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    
                                    <div className="overflow-x-auto rounded border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="text-left p-3">Code</th>
                                                    <th className="text-left p-3">Name</th>
                                                    <th className="text-left p-3">Department</th>
                                                    <th className="text-left p-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {departments.flatMap(dept => dept.courses).map((course) => (
                                                    <tr key={course.id} className="border-t">
                                                        <td className="p-3">{course.code}</td>
                                                        <td className="p-3">{course.name}</td>
                                                        <td className="p-3">
                                                            {departments.find(d => d.id === course.department_id)?.name || '-'}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => setEditCourse(course)}>Edit</Button>
                                                                <Button variant="destructive" size="sm" onClick={() => destroyCourse(course)}>Delete</Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Edit modals */}
                    {editStrand && (
                        <Dialog open={!!editStrand} onOpenChange={(open) => !open && setEditStrand(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit strand</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3">
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Note:</strong> Strands are subdivisions under tracks. Select a track first, then specify the strand details.
                                        </p>
                                    </div>
                                    <div>
                                        <Label>Track *</Label>
                                        <Select value={editStrand.track_id?.toString() || ''} onValueChange={(value) => setEditStrand({ ...editStrand, track_id: Number(value) })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a track" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tracks && tracks.map((track) => (
                                                    <SelectItem key={track.id} value={track.id.toString()}>
                                                        {track.name} ({track.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Select the track this strand belongs to (e.g., Academic Track, TVL Track)
                                        </p>
                                    </div>
                                    <div>
                                        <Label>Name</Label>
                                        <Input value={editStrand.name} onChange={(e) => setEditStrand({ ...editStrand, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Code</Label>
                                        <Input value={editStrand.code} onChange={(e) => setEditStrand({ ...editStrand, code: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Academic Level</Label>
                                        <Select value={editStrand.academic_level_id.toString()} onValueChange={(value) => setEditStrand({ ...editStrand, academic_level_id: Number(value) })} disabled>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicLevels
                                                    .filter(level => level.key === 'senior_highschool')
                                                    .map((level) => (
                                                        <SelectItem key={level.id} value={level.id.toString()}>
                                                            {level.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Strands are automatically assigned to Senior High School
                                        </p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => updateStrand(editStrand)}>Save</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {editTrack && (
                        <Dialog open={!!editTrack} onOpenChange={(open) => !open && setEditTrack(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit track</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3">
                                    <div>
                                        <Label>Name</Label>
                                        <Input value={editTrack.name} onChange={(e) => setEditTrack({ ...editTrack, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Code</Label>
                                        <Input value={editTrack.code} onChange={(e) => setEditTrack({ ...editTrack, code: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <Input value={editTrack.description || ''} onChange={(e) => setEditTrack({ ...editTrack, description: e.target.value })} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => updateTrack(editTrack)}>Save</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {editDept && (
                        <Dialog open={!!editDept} onOpenChange={(open) => !open && setEditDept(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit department</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3">
                                    <div>
                                        <Label>Name</Label>
                                        <Input value={editDept.name} onChange={(e) => setEditDept({ ...editDept, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Code</Label>
                                        <Input value={editDept.code} onChange={(e) => setEditDept({ ...editDept, code: e.target.value })} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => updateDepartment(editDept)}>Save</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {editCourse && (
                        <Dialog open={!!editCourse} onOpenChange={(open) => !open && setEditCourse(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit course</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3">
                                    <div>
                                        <Label>Name</Label>
                                        <Input value={editCourse.name} onChange={(e) => setEditCourse({ ...editCourse, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Code</Label>
                                        <Input value={editCourse.code} onChange={(e) => setEditCourse({ ...editCourse, code: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Department</Label>
                                        <Select value={editCourse.department_id.toString()} onValueChange={(value) => setEditCourse({ ...editCourse, department_id: Number(value) })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => updateCourse(editCourse)}>Save</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </main>
            </div>
        </div>
    );
}


