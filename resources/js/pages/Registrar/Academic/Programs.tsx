import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User { name: string; email: string; user_role: string }
interface AcademicLevel { id: number; name: string; key: string; strands: Strand[] }
interface Department { id: number; name: string; code: string; courses: Course[] }
interface Track { id: number; name: string; code: string; is_active: boolean }
interface Strand { id: number; name: string; code: string; academic_level_id: number; track_id?: number; academic_level: AcademicLevel; track?: Track }
interface Course { id: number; name: string; code: string; department_id: number; description?: string; units?: number; is_active?: boolean }

export default function Programs({ user, academicLevels = [], departments = [], tracks = [], formErrors }: { user: User; academicLevels?: AcademicLevel[]; departments?: Department[]; tracks?: Track[]; formErrors?: Record<string, string> }) {
    const [activeTab, setActiveTab] = useState('strands');
    
    // Strand form state
    const [strandForm, setStrandForm] = useState({ name: '', code: '', academic_level_id: '', track_id: '' });
    const [strandModal, setStrandModal] = useState(false);
    const [editStrand, setEditStrand] = useState<Strand | null>(null);

    // Auto-set Senior High School when modal opens
    const openStrandModal = () => {
        const seniorHighLevel = academicLevels.find(level => level.key === 'senior_highschool');
        if (seniorHighLevel) {
            setStrandForm({ name: '', code: '', academic_level_id: seniorHighLevel.id.toString(), track_id: '' });
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
        router.post(route('registrar.academic.strands.store'), strandForm, {
            preserveScroll: true,
            onSuccess: () => { setStrandForm({ name: '', code: '', academic_level_id: '', track_id: '' }); setStrandModal(false); },
        });
    };

    const updateStrand = (strand: Strand) => {
        const data = { name: strand.name, code: strand.code, academic_level_id: strand.academic_level_id, track_id: strand.track_id };
        router.put(route('registrar.academic.strands.update', strand.id), data, {
            preserveScroll: true,
            onSuccess: () => setEditStrand(null)
        });
    };
    
    const destroyStrand = (strand: Strand) => {
        if (confirm(`Delete strand ${strand.name}?`)) {
            router.delete(route('registrar.academic.strands.destroy', strand.id), { preserveScroll: true });
        }
    };

    // Department handlers
    const submitDepartment = () => {
        router.post(route('registrar.academic.departments.store'), deptForm, {
            preserveScroll: true,
            onSuccess: () => { setDeptForm({ name: '', code: '' }); setDeptModal(false); },
        });
    };
    
    const updateDepartment = (dept: Department) => {
        const data = { name: dept.name, code: dept.code };
        router.put(route('registrar.academic.departments.update', dept.id), data, { 
            preserveScroll: true, 
            onSuccess: () => setEditDept(null) 
        });
    };
    
    const destroyDepartment = (dept: Department) => {
        if (confirm(`Delete department ${dept.name}?`)) {
            router.delete(route('registrar.academic.departments.destroy', dept.id), { preserveScroll: true });
        }
    };

    // Course handlers
    const submitCourse = () => {
        router.post(route('registrar.academic.courses.store'), courseForm, {
            preserveScroll: true,
            onSuccess: () => { setCourseForm({ name: '', code: '', department_id: '' }); setCourseModal(false); },
        });
    };
    
    const updateCourse = (course: Course) => {
        const data = { name: course.name, code: course.code, department_id: course.department_id };
        router.put(route('registrar.academic.courses.update', course.id), data, { 
            preserveScroll: true, 
            onSuccess: () => setEditCourse(null) 
        });
    };
    
    const destroyCourse = (course: Course) => {
        if (confirm(`Delete course ${course.name}?`)) {
            router.delete(route('registrar.academic.courses.destroy', course.id), { preserveScroll: true });
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mb-4">
                        <Link href={route('registrar.academic.index')}>
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
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="strands">Strands</TabsTrigger>
                                    <TabsTrigger value="departments">Departments</TabsTrigger>
                                    <TabsTrigger value="courses">Courses</TabsTrigger>
                                </TabsList>
                                
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
                                                </DialogHeader>
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <p className="text-sm text-blue-800">
                                                            <strong>Note:</strong> Strands are only available for Senior High School students as academic tracks (STEM, ABM, HUMSS, GAS).
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
                                                        <Label htmlFor="strand-track">Track</Label>
                                                        <Select value={strandForm.track_id} onValueChange={(value) => setStrandForm({ ...strandForm, track_id: value })}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select track (optional)" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="">No Track</SelectItem>
                                                                {tracks.map((track) => (
                                                                    <SelectItem key={track.id} value={track.id.toString()}>
                                                                        {track.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Tracks are optional groupings for strands
                                                        </p>
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
                                            <strong>Note:</strong> Strands are only available for Senior High School students as academic tracks (STEM, ABM, HUMSS, GAS).
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
                                        <Label>Track</Label>
                                        <Select value={editStrand.track_id?.toString() || ''} onValueChange={(value) => setEditStrand({ ...editStrand, track_id: value ? Number(value) : undefined })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select track (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">No Track</SelectItem>
                                                {tracks.map((track) => (
                                                    <SelectItem key={track.id} value={track.id.toString()}>
                                                        {track.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Tracks are optional groupings for strands
                                        </p>
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
