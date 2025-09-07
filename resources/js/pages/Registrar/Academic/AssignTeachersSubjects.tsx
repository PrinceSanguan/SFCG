import React, { useState, useEffect } from 'react';
import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, User, BookOpen, Calendar, Users } from 'lucide-react';
import { Link, router } from '@inertiajs/react';

interface User { id: number; name: string; email: string; user_role: string; }
interface Subject { id: number; name: string; code: string; academic_level_id: number; }
interface AcademicLevel { id: number; name: string; key: string; }
interface GradingPeriod { id: number; name: string; academic_level_id?: number; parent_id?: number; }
interface Strand { id: number; name: string; code: string; academic_level_id: number; }

interface TeacherSubjectAssignment {
    id: number;
    teacher_id: number;
    subject_id: number;
    academic_level_id: number;
    grade_level: string | null;
    strand_id: number | null;
    grading_period_id: number | null;
    school_year: string;
    notes: string | null;
    is_active: boolean;
    teacher: User;
    subject: Subject;
    academicLevel: AcademicLevel;
    gradingPeriod: GradingPeriod | null;
}

interface Props {
    user: User;
    assignments: TeacherSubjectAssignment[];
    teachers: User[];
    subjects: Subject[];
    academicLevels: AcademicLevel[];
    gradingPeriods: GradingPeriod[];
    strands: Strand[];
}

export default function AssignTeachersSubjects({ user, assignments, teachers, subjects, academicLevels, gradingPeriods, strands }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAcademicLevel, setSelectedAcademicLevel] = useState<string>('');
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<TeacherSubjectAssignment | null>(null);
    const [formData, setFormData] = useState({
        teacher_id: '',
        subject_id: '',
        academic_level_id: '',
        grade_level: '',
        strand_id: '',
        grading_period_id: '',
        school_year: '2024-2025',
        notes: '',
        auto_enroll_students: true,
    });

    useEffect(() => {
        if (selectedAcademicLevel) {
            setFilteredSubjects(subjects.filter(s => s.academic_level_id.toString() === selectedAcademicLevel));
        } else {
            setFilteredSubjects([]);
        }
    }, [selectedAcademicLevel, subjects]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingAssignment
            ? `/registrar/academic/assign-teachers-subjects/${editingAssignment.id}`
            : '/registrar/academic/assign-teachers-subjects';
        const method = editingAssignment ? 'put' : 'post';
        router.visit(url, {
            method,
            data: formData,
            onSuccess: () => { setShowAssignmentModal(false); setEditingAssignment(null); resetForm(); },
        });
    };

    const handleEdit = (assignment: TeacherSubjectAssignment) => {
        setEditingAssignment(assignment);
        setFormData({
            teacher_id: assignment.teacher_id.toString(),
            subject_id: assignment.subject_id.toString(),
            academic_level_id: assignment.academic_level_id.toString(),
            grade_level: assignment.grade_level || '',
            strand_id: assignment.strand_id ? assignment.strand_id.toString() : '',
            grading_period_id: assignment.grading_period_id?.toString() || '',
            school_year: assignment.school_year,
            notes: assignment.notes || '',
            auto_enroll_students: true,
        });
        setSelectedAcademicLevel(assignment.academic_level_id.toString());
        setShowAssignmentModal(true);
    };

    const handleDelete = (assignment: TeacherSubjectAssignment) => {
        if (confirm('Are you sure you want to delete this assignment?')) {
            router.delete(`/registrar/academic/assign-teachers-subjects/${assignment.id}`);
        }
    };

    const resetForm = () => {
        setFormData({
            teacher_id: '', subject_id: '', academic_level_id: '', grade_level: '', strand_id: '', grading_period_id: '', school_year: '2024-2025', notes: '', auto_enroll_students: true,
        });
        setSelectedAcademicLevel('');
        setEditingAssignment(null);
    };

    const filteredAssignments = assignments.filter(a => {
        const q = searchTerm.toLowerCase();
        return a.teacher.name.toLowerCase().includes(q) || a.subject.name.toLowerCase().includes(q) || a.academicLevel.name.toLowerCase().includes(q);
    });

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <Link href="/registrar/academic" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Academic Management
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assign Teachers (Subjects)</h1>
                        </div>

                        <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <BookOpen className="h-5 w-5 text-emerald-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-emerald-900 dark:text-emerald-100">Teacher Subject Assignments</h3>
                                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">Assign teachers to subjects by academic level. Strand and grade level are optional.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <Input placeholder="Search assignments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-64" />
                            <Button onClick={() => { resetForm(); setShowAssignmentModal(true); }} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Assign Teacher
                            </Button>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Teacher Subject Assignments</span>
                                    <span className="text-sm text-muted-foreground">{filteredAssignments.length} assignments</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {filteredAssignments.length ? (
                                    <div className="space-y-4">
                                        {filteredAssignments.map((a) => (
                                            <div key={a.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <User className="h-5 w-5 text-gray-400" />
                                                        <div>
                                                            <p className="font-medium">{a.teacher.name}</p>
                                                            <p className="text-sm text-muted-foreground">{a.subject.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="outline" className="text-xs">{a.academicLevel.name}</Badge>
                                                                {a.grade_level && <Badge variant="secondary" className="text-xs">{a.grade_level === 'grade_11' ? 'Grade 11' : 'Grade 12'}</Badge>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-muted-foreground">{a.school_year}</span>
                                                    </div>
                                                    <Badge variant={a.is_active ? 'default' : 'secondary'} className={a.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                        {a.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={route('registrar.assign-teachers-subjects.students', a.id)}>
                                                                <Users className="h-4 w-4 mr-2" /> Manage Students
                                                            </Link>
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(a)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(a)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">{searchTerm ? 'No assignments match your search.' : 'No teacher subject assignments yet.'}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            <Dialog open={showAssignmentModal} onOpenChange={setShowAssignmentModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingAssignment ? 'Edit Teacher Assignment' : 'Assign Teacher to Subject'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="teacher_id">Teacher</Label>
                                <Select value={formData.teacher_id} onValueChange={(v) => setFormData(p => ({ ...p, teacher_id: v }))} required>
                                    <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                                    <SelectContent>
                                        {teachers.map(t => (<SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="academic_level_id">Academic Level</Label>
                                <Select value={formData.academic_level_id} onValueChange={(v) => { setFormData(p => ({ ...p, academic_level_id: v, subject_id: '', grading_period_id: '' })); setSelectedAcademicLevel(v); }} required>
                                    <SelectTrigger><SelectValue placeholder="Select academic level" /></SelectTrigger>
                                    <SelectContent>
                                        {academicLevels.map(level => (<SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="subject_id">Subject</Label>
                            <Select value={formData.subject_id} onValueChange={(v) => setFormData(p => ({ ...p, subject_id: v }))} disabled={!selectedAcademicLevel} required>
                                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                                <SelectContent>
                                    {filteredSubjects.map(s => (<SelectItem key={s.id} value={s.id.toString()}>{s.name} ({s.code})</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="strand_id">Strand</Label>
                                <Select value={formData.strand_id} onValueChange={(v) => setFormData(p => ({ ...p, strand_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select strand (optional)" /></SelectTrigger>
                                    <SelectContent>
                                        {strands.filter(s => s.academic_level_id.toString() === selectedAcademicLevel).map(st => (
                                            <SelectItem key={st.id} value={st.id.toString()}>{st.name} ({st.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="grade_level">Grade Level</Label>
                                <Select value={formData.grade_level} onValueChange={(v) => setFormData(p => ({ ...p, grade_level: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select grade level (optional)" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="grade_11">Grade 11</SelectItem>
                                        <SelectItem value="grade_12">Grade 12</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="grading_period_id">Grading Period</Label>
                                <Select value={formData.grading_period_id} onValueChange={(v) => setFormData(p => ({ ...p, grading_period_id: v }))} disabled={!selectedAcademicLevel}>
                                    <SelectTrigger><SelectValue placeholder="Select grading period (optional)" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">No grading period</SelectItem>
                                        {selectedAcademicLevel && gradingPeriods
                                            .filter(p => {
                                                // Filter by academic level
                                                if (p.academic_level_id?.toString() !== selectedAcademicLevel) {
                                                    return false;
                                                }
                                                
                                                // For semester-based levels (Senior High, College), only show root semesters
                                                // For quarter-based levels (Elementary, Junior High), only show quarters
                                                const academicLevel = academicLevels.find(l => l.id.toString() === selectedAcademicLevel);
                                                if (academicLevel?.key === 'senior_highschool' || academicLevel?.key === 'college') {
                                                    // Only show root semesters (no parent_id)
                                                    return !p.parent_id;
                                                } else {
                                                    // For elementary and junior high, show all periods (quarters)
                                                    return true;
                                                }
                                            })
                                            .map(p => (<SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="school_year">School Year</Label>
                                <Input id="school_year" type="text" value={formData.school_year} onChange={(e) => setFormData(p => ({ ...p, school_year: e.target.value }))} placeholder="e.g., 2024-2025" required />
                            </div>
                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} rows={3} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => { setShowAssignmentModal(false); resetForm(); }}>Cancel</Button>
                            <Button type="submit">{editingAssignment ? 'Update Assignment' : 'Assign Teacher'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}


