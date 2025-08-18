import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, Users } from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';
import InputError from '@/components/input-error';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    students?: Array<{
        id: number;
        name: string;
        email: string;
        user_role: string;
        pivot: {
            relationship_type: string;
            emergency_contact: string;
            notes?: string;
        };
    }>;
}

interface EditParentProps {
    user: User;
    parent: User;
    allStudents: User[];
    relationshipTypes: Record<string, string>;
}

export default function EditParent({ user, parent, allStudents, relationshipTypes }: EditParentProps) {
    const { errors } = usePage().props;
    const [showLinkForm, setShowLinkForm] = useState(false);
    
    const { data, setData, put, processing } = useForm({
        name: parent.name || '',
        email: parent.email || '',
    });

    const { data: linkData, setData: setLinkData, post: postLink, processing: linkProcessing, reset: resetLinkForm } = useForm({
        student_id: '',
        relationship_type: '',
        emergency_contact: 'no',
        notes: '',
    });
    const [studentQuery, setStudentQuery] = useState('');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.parents.update', parent.id));
    };

    const submitLink: FormEventHandler = (e) => {
        e.preventDefault();
        postLink(route('admin.parents.link-student', parent.id), {
            onSuccess: () => {
                resetLinkForm();
                setShowLinkForm(false);
            }
        });
    };

    const handleUnlink = (studentId: number, studentName: string) => {
        if (confirm(`Are you sure you want to unlink ${studentName} from this parent?`)) {
            router.delete(route('admin.parents.unlink-student', [parent.id, studentId]));
        }
    };

    const getRelationshipBadgeVariant = (type: string) => {
        switch (type) {
            case 'father':
                return 'default';
            case 'mother':
                return 'secondary';
            case 'guardian':
                return 'outline';
            case 'other':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatRelationshipType = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    // Filter out already linked students
    const linkedStudentIds = parent.students?.map(s => s.id) || [];
    const availableStudents = allStudents.filter(s => !linkedStudentIds.includes(s.id));
    const studentOptionsMap = useMemo(() => {
        const map: Record<string, number> = {};
        availableStudents.forEach((s) => {
            map[`${s.name} (${s.email})`] = s.id;
        });
        return map;
    }, [availableStudents]);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <Link href={route('admin.parents.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Parents
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Parent Account</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Update parent information and manage student relationships.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Parent Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Parent Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={submit} className="space-y-6">
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                className="mt-1"
                                            />
                                            <InputError message={errors.name} className="mt-2" />
                                        </div>

                                        <div>
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                                className="mt-1"
                                            />
                                            <InputError message={errors.email} className="mt-2" />
                                        </div>

                                        <div className="flex items-center gap-4 pt-4">
                                            <Button type="submit" disabled={processing}>
                                                <Save className="h-4 w-4 mr-2" />
                                                {processing ? 'Saving...' : 'Update Parent'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Student Relationships */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Student Relationships ({parent.students?.length || 0})
                                        </CardTitle>
                                        {availableStudents.length > 0 && (
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => setShowLinkForm(!showLinkForm)}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Link Student
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Link Student Form */}
                                        {showLinkForm && (
                                            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                                <form onSubmit={submitLink} className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="student_search">Select Student</Label>
                                                        <Input
                                                            id="student_search"
                                                            className="mt-1"
                                                            list="available-students"
                                                            placeholder="Type to search students by name or email..."
                                                            value={studentQuery}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                setStudentQuery(value);
                                                                const selectedId = studentOptionsMap[value];
                                                                setLinkData('student_id', selectedId ? String(selectedId) : '');
                                                            }}
                                                        />
                                                        <datalist id="available-students">
                                                            {availableStudents.map((student) => (
                                                                <option key={student.id} value={`${student.name} (${student.email})`} />
                                                            ))}
                                                        </datalist>
                                                        <InputError message={errors.student_id} className="mt-2" />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="relationship_type">Relationship Type</Label>
                                                        <Select 
                                                            value={linkData.relationship_type} 
                                                            onValueChange={(value) => setLinkData('relationship_type', value)}
                                                        >
                                                            <SelectTrigger className="mt-1">
                                                                <SelectValue placeholder="Select relationship..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.entries(relationshipTypes).map(([key, label]) => (
                                                                    <SelectItem key={key} value={key}>
                                                                        {label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <InputError message={errors.relationship_type} className="mt-2" />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="emergency_contact">Emergency Contact</Label>
                                                        <Select 
                                                            value={linkData.emergency_contact} 
                                                            onValueChange={(value) => setLinkData('emergency_contact', value)}
                                                        >
                                                            <SelectTrigger className="mt-1">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="yes">Yes</SelectItem>
                                                                <SelectItem value="no">No</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <InputError message={errors.emergency_contact} className="mt-2" />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="notes">Notes (Optional)</Label>
                                                        <Textarea
                                                            id="notes"
                                                            value={linkData.notes}
                                                            onChange={(e) => setLinkData('notes', e.target.value)}
                                                            placeholder="Any additional information about this relationship..."
                                                            className="mt-1"
                                                        />
                                                        <InputError message={errors.notes} className="mt-2" />
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button type="submit" disabled={linkProcessing} size="sm">
                                                            {linkProcessing ? 'Linking...' : 'Link Student'}
                                                        </Button>
                                                        <Button 
                                                            type="button" 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => setShowLinkForm(false)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {/* Current Relationships */}
                                        {parent.students && parent.students.length > 0 ? (
                                            <div className="space-y-3">
                                                {parent.students.map((student) => (
                                                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                                        {student.name}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {student.email}
                                                                    </p>
                                                                </div>
                                                                <Badge variant={getRelationshipBadgeVariant(student.pivot.relationship_type)}>
                                                                    {formatRelationshipType(student.pivot.relationship_type)}
                                                                </Badge>
                                                                {student.pivot.emergency_contact === 'yes' && (
                                                                    <Badge variant="secondary">
                                                                        Emergency Contact
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {student.pivot.notes && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                    <span className="font-medium">Notes:</span> {student.pivot.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm"
                                                            onClick={() => handleUnlink(student.id, student.name)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No students linked to this parent.</p>
                                                {availableStudents.length > 0 && (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="mt-2"
                                                        onClick={() => setShowLinkForm(true)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Link First Student
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        {availableStudents.length === 0 && !showLinkForm && (
                                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                <p className="text-sm">All available students are already linked.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
