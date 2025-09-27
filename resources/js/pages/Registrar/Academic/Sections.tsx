import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm, usePage } from '@inertiajs/react';
import React from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';

type AcademicLevel = { id: number; name: string; key: string };
type Track = { id: number; name: string };
type Strand = { id: number; name: string; track_id?: number };
type Department = { id: number; name: string };
type Course = { id: number; name: string; department_id: number };

type Section = {
    id: number;
    name: string;
    code?: string | null;
    academic_level_id: number;
    specific_year_level?: string | null;
    track_id?: number | null;
    strand_id?: number | null;
    department_id?: number | null;
    course_id?: number | null;
    max_students?: number | null;
    school_year?: string | null;
};

type PageProps = {
    user: { id: number; name: string; email: string };
    sections: Section[];
    academicLevels: AcademicLevel[];
    tracks: Track[];
    strands: Strand[];
    departments: Department[];
    courses: Course[];
    specificYearLevels: Record<string, Record<string, string>>;
    errors?: Record<string, string>;
    activeLevelKey?: string;
};

export default function SectionsPage() {
    const { props } = usePage<PageProps>();
    const { user, sections, academicLevels, tracks, strands, departments, courses, specificYearLevels, errors, activeLevelKey: initialLevelKey } = props;

    const { data, setData, post, processing, reset, put, delete: destroy } = useForm({
        id: undefined as number | undefined,
        name: '',
        academic_level_id: '' as string | number,
        specific_year_level: '',
        track_id: '',
        strand_id: '',
        department_id: '',
        course_id: '',
        max_students: '' as string | number,
        is_active: true as boolean,
    });

    const [editing, setEditing] = React.useState<Section | null>(null);
    const [activeLevelKey] = React.useState<string>(() => initialLevelKey || academicLevels[0]?.key || '');
    const [selectedGradeLevel, setSelectedGradeLevel] = React.useState<string>('');
    const [selectedTrack, setSelectedTrack] = React.useState<string>('');
    const [selectedStrand, setSelectedStrand] = React.useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = React.useState<string>('');
    const [selectedCourse, setSelectedCourse] = React.useState<string>('');
    const [existingSections, setExistingSections] = React.useState<Section[]>([]);

    // Derive active level id from key
    const activeLevelId = React.useMemo(() => {
        const level = academicLevels.find(l => l.key === activeLevelKey);
        return level?.id;
    }, [academicLevels, activeLevelKey]);

    // Check if current level is elementary, junior high school, senior high school, or college
    const isElementaryLevel = activeLevelKey === 'elementary';
    const isJuniorHighLevel = activeLevelKey === 'junior_highschool';
    const isSeniorHighLevel = activeLevelKey === 'senior_highschool';
    const isCollegeLevel = activeLevelKey === 'college';
    const isGradeLevelBasedLevel = isElementaryLevel || isJuniorHighLevel;
    const isTrackBasedLevel = isSeniorHighLevel;
    const isDepartmentBasedLevel = isCollegeLevel;

    // Whenever active level changes, preset form level and clear program-specific fields
    React.useEffect(() => {
        if (activeLevelId) {
            setData('academic_level_id', activeLevelId.toString());
            setData('specific_year_level', '');
            setData('track_id', '');
            setData('strand_id', '');
            setData('department_id', '');
            setData('course_id', '');
            setSelectedGradeLevel('');
            setSelectedTrack('');
            setSelectedStrand('');
            setSelectedDepartment('');
            setSelectedCourse('');
            setExistingSections([]);
        }
    }, [activeLevelId, setData]);

    // When grade level changes, fetch existing sections for that grade
    React.useEffect(() => {
        if (isGradeLevelBasedLevel && selectedGradeLevel && activeLevelId) {
            const sectionsForGrade = sections.filter(s =>
                s.academic_level_id === activeLevelId &&
                s.specific_year_level === selectedGradeLevel
            );
            setExistingSections(sectionsForGrade);
        } else {
            setExistingSections([]);
        }
    }, [selectedGradeLevel, sections, activeLevelId, isGradeLevelBasedLevel]);

    // When track or strand changes for Senior High, fetch existing sections
    React.useEffect(() => {
        if (isTrackBasedLevel && selectedTrack && selectedStrand && activeLevelId) {
            const sectionsForStrand = sections.filter(s =>
                s.academic_level_id === activeLevelId &&
                s.track_id?.toString() === selectedTrack &&
                s.strand_id?.toString() === selectedStrand
            );
            setExistingSections(sectionsForStrand);
        } else if (isTrackBasedLevel) {
            setExistingSections([]);
        }
    }, [selectedTrack, selectedStrand, sections, activeLevelId, isTrackBasedLevel]);

    // When department or course changes for College, fetch existing sections
    React.useEffect(() => {
        if (isDepartmentBasedLevel && selectedDepartment && selectedCourse && activeLevelId) {
            const sectionsForCourse = sections.filter(s =>
                s.academic_level_id === activeLevelId &&
                s.department_id?.toString() === selectedDepartment &&
                s.course_id?.toString() === selectedCourse
            );
            setExistingSections(sectionsForCourse);
        } else if (isDepartmentBasedLevel) {
            setExistingSections([]);
        }
    }, [selectedDepartment, selectedCourse, sections, activeLevelId, isDepartmentBasedLevel]);

    const onEdit = (section: Section) => {
        setEditing(section);
        setData({
            id: section.id,
            name: section.name,
            academic_level_id: section.academic_level_id,
            specific_year_level: section.specific_year_level || '',
            track_id: section.track_id?.toString() || '',
            strand_id: section.strand_id?.toString() || '',
            department_id: section.department_id?.toString() || '',
            course_id: section.course_id?.toString() || '',
            max_students: section.max_students ?? '',
            is_active: true,
        });

        // Set selected grade level for elementary or junior high
        if (isGradeLevelBasedLevel && section.specific_year_level) {
            setSelectedGradeLevel(section.specific_year_level);
        }

        // Set selected track and strand for senior high
        if (isTrackBasedLevel) {
            if (section.track_id) setSelectedTrack(section.track_id.toString());
            if (section.strand_id) setSelectedStrand(section.strand_id.toString());
        }

        // Set selected department and course for college
        if (isDepartmentBasedLevel) {
            if (section.department_id) setSelectedDepartment(section.department_id.toString());
            if (section.course_id) setSelectedCourse(section.course_id.toString());
        }
    };

    const onCancel = () => {
        setEditing(null);
        reset();
        setSelectedGradeLevel('');
        setSelectedTrack('');
        setSelectedStrand('');
        setSelectedDepartment('');
        setSelectedCourse('');
        setExistingSections([]);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            put(route('registrar.academic.sections.update', editing.id));
        } else {
            post(route('registrar.academic.sections.store'));
        }
    };

    const onDelete = (section: Section) => {
        if (!confirm(`Delete section "${section.name}"?`)) return;
        destroy(route('registrar.academic.sections.destroy', section.id));
    };

    const filteredStrands = React.useMemo(() => {
        if (isTrackBasedLevel && selectedTrack) {
            return strands.filter(strand => strand.track_id?.toString() === selectedTrack);
        }
        return strands;
    }, [strands, selectedTrack, isTrackBasedLevel]);
    const filteredCourses = React.useMemo(() => {
        if (isDepartmentBasedLevel && selectedDepartment) {
            return courses.filter(course => course.department_id?.toString() === selectedDepartment);
        }
        return courses;
    }, [courses, selectedDepartment, isDepartmentBasedLevel]);
    const visibleSections = React.useMemo(() => {
        if (!activeLevelId) return sections;
        return sections.filter(s => s.academic_level_id === activeLevelId);
    }, [sections, activeLevelId]);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sections</h1>
                            <p className="text-gray-500 dark:text-gray-400">Manage sections across academic levels and programs</p>
                        </div>
                        <Button onClick={() => {
                            setEditing(null);
                            reset();
                            if (isGradeLevelBasedLevel) {
                                setSelectedGradeLevel('');
                                setExistingSections([]);
                            }
                            if (isTrackBasedLevel) {
                                setSelectedTrack('');
                                setSelectedStrand('');
                                setExistingSections([]);
                            }
                            if (isDepartmentBasedLevel) {
                                setSelectedDepartment('');
                                setSelectedCourse('');
                                setExistingSections([]);
                            }
                        }} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> New Section
                        </Button>
                    </div>

                    {/* Level selection removed: level is chosen on SectionsHome */}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Form */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>{editing ? 'Edit Section' : 'Create Section'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={onSubmit} className="space-y-4">
                                    {isGradeLevelBasedLevel ? (
                                        // Elementary/Junior High-specific form layout
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="specific_year_level">Grade Level *</Label>
                                                <Select
                                                    value={selectedGradeLevel}
                                                    onValueChange={(v) => {
                                                        setSelectedGradeLevel(v);
                                                        setData('specific_year_level', v);
                                                    }}
                                                >
                                                    <SelectTrigger><SelectValue placeholder="Select Grade Level" /></SelectTrigger>
                                                    <SelectContent>
                                                        {isElementaryLevel && specificYearLevels.elementary && Object.entries(specificYearLevels.elementary).map(([key, label]) => (
                                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                                        ))}
                                                        {isJuniorHighLevel && specificYearLevels.junior_highschool && Object.entries(specificYearLevels.junior_highschool).map(([key, label]) => (
                                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors?.specific_year_level && (<Alert variant="destructive"><AlertDescription>{errors.specific_year_level}</AlertDescription></Alert>)}
                                            </div>

                                            {selectedGradeLevel && (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">Section Name *</Label>
                                                        <Input
                                                            id="name"
                                                            value={data.name}
                                                            onChange={(e) => setData('name', e.target.value)}
                                                            placeholder={`e.g., ${isElementaryLevel ? specificYearLevels.elementary?.[selectedGradeLevel] : specificYearLevels.junior_highschool?.[selectedGradeLevel]} - Section A`}
                                                            required
                                                        />
                                                        {errors?.name && (<Alert variant="destructive"><AlertDescription>{errors.name}</AlertDescription></Alert>)}
                                                    </div>


                                                    <div className="space-y-2">
                                                        <Label htmlFor="max_students">Maximum Students *</Label>
                                                        <Input
                                                            id="max_students"
                                                            type="number"
                                                            min={1}
                                                            max={50}
                                                            value={String(data.max_students)}
                                                            onChange={(e) => setData('max_students', e.target.value)}
                                                            placeholder="e.g., 30"
                                                            required
                                                        />
                                                        {errors?.max_students && (<Alert variant="destructive"><AlertDescription>{errors.max_students}</AlertDescription></Alert>)}
                                                    </div>

                                                </>
                                            )}
                                        </>
                                    ) : isTrackBasedLevel ? (
                                        // Senior High-specific form layout
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="track_id">Track *</Label>
                                                <Select
                                                    value={selectedTrack}
                                                    onValueChange={(v) => {
                                                        setSelectedTrack(v);
                                                        setData('track_id', v);
                                                        setSelectedStrand('');
                                                        setData('strand_id', '');
                                                    }}
                                                >
                                                    <SelectTrigger><SelectValue placeholder="Select Track" /></SelectTrigger>
                                                    <SelectContent>
                                                        {tracks.map((track) => (
                                                            <SelectItem key={track.id} value={track.id.toString()}>{track.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors?.track_id && (<Alert variant="destructive"><AlertDescription>{errors.track_id}</AlertDescription></Alert>)}
                                            </div>

                                            {selectedTrack && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="strand_id">Strand *</Label>
                                                    <Select
                                                        value={selectedStrand}
                                                        onValueChange={(v) => {
                                                            setSelectedStrand(v);
                                                            setData('strand_id', v);
                                                        }}
                                                    >
                                                        <SelectTrigger><SelectValue placeholder="Select Strand" /></SelectTrigger>
                                                        <SelectContent>
                                                            {filteredStrands.map((strand) => (
                                                                <SelectItem key={strand.id} value={strand.id.toString()}>{strand.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors?.strand_id && (<Alert variant="destructive"><AlertDescription>{errors.strand_id}</AlertDescription></Alert>)}
                                                </div>
                                            )}

                                            {selectedTrack && selectedStrand && (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="specific_year_level">Grade Level *</Label>
                                                        <Select
                                                            value={data.specific_year_level}
                                                            onValueChange={(v) => setData('specific_year_level', v)}
                                                        >
                                                            <SelectTrigger><SelectValue placeholder="Select Grade Level" /></SelectTrigger>
                                                            <SelectContent>
                                                                {specificYearLevels.senior_highschool && Object.entries(specificYearLevels.senior_highschool).map(([key, label]) => (
                                                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors?.specific_year_level && (<Alert variant="destructive"><AlertDescription>{errors.specific_year_level}</AlertDescription></Alert>)}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">Section Name *</Label>
                                                        <Input
                                                            id="name"
                                                            value={data.name}
                                                            onChange={(e) => setData('name', e.target.value)}
                                                            placeholder={`e.g., ${specificYearLevels.senior_highschool?.[data.specific_year_level] || 'Grade'} - Section A`}
                                                            required
                                                        />
                                                        {errors?.name && (<Alert variant="destructive"><AlertDescription>{errors.name}</AlertDescription></Alert>)}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="max_students">Maximum Students *</Label>
                                                        <Input
                                                            id="max_students"
                                                            type="number"
                                                            min={1}
                                                            max={50}
                                                            value={String(data.max_students)}
                                                            onChange={(e) => setData('max_students', e.target.value)}
                                                            placeholder="e.g., 30"
                                                            required
                                                        />
                                                        {errors?.max_students && (<Alert variant="destructive"><AlertDescription>{errors.max_students}</AlertDescription></Alert>)}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : !isDepartmentBasedLevel ? (
                                        // General form layout for other levels (not College)
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Name *</Label>
                                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                                {errors?.name && (<Alert variant="destructive"><AlertDescription>{errors.name}</AlertDescription></Alert>)}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="academic_level_id">Academic Level *</Label>
                                                <Select value={String(data.academic_level_id)} onValueChange={(v) => setData('academic_level_id', v)}>
                                                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                                                    <SelectContent>
                                                        {academicLevels.map((lvl) => (
                                                            <SelectItem key={lvl.id} value={lvl.id.toString()}>{lvl.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors?.academic_level_id && (<Alert variant="destructive"><AlertDescription>{errors.academic_level_id}</AlertDescription></Alert>)}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="specific_year_level">Year/Grade</Label>
                                                <Select value={data.specific_year_level} onValueChange={(v) => setData('specific_year_level', v)}>
                                                    <SelectTrigger><SelectValue placeholder="Select year/grade (if applicable)" /></SelectTrigger>
                                                    <SelectContent>
                                                        {academicLevels.map((lvl) => (
                                                            <React.Fragment key={lvl.id}>
                                                                {specificYearLevels[lvl.key] && Object.entries(specificYearLevels[lvl.key]).map(([k, label]) => (
                                                                    <SelectItem key={`${lvl.id}-${k}`} value={k}>{label}</SelectItem>
                                                                ))}
                                                            </React.Fragment>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors?.specific_year_level && (<Alert variant="destructive"><AlertDescription>{errors.specific_year_level}</AlertDescription></Alert>)}
                                            </div>
                                        </>
                                    ) : null}

                                    {isDepartmentBasedLevel ? (
                                        // College-specific form layout: Department → Course → Section
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="department_id">Department *</Label>
                                                <Select
                                                    value={selectedDepartment}
                                                    onValueChange={(v) => {
                                                        setSelectedDepartment(v);
                                                        setData('department_id', v);
                                                        setSelectedCourse('');
                                                        setData('course_id', '');
                                                    }}
                                                >
                                                    <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                                                    <SelectContent>
                                                        {departments.map((department) => (
                                                            <SelectItem key={department.id} value={department.id.toString()}>{department.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors?.department_id && (<Alert variant="destructive"><AlertDescription>{errors.department_id}</AlertDescription></Alert>)}
                                            </div>

                                            {selectedDepartment && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="course_id">Course *</Label>
                                                    <Select
                                                        value={selectedCourse}
                                                        onValueChange={(v) => {
                                                            setSelectedCourse(v);
                                                            setData('course_id', v);
                                                        }}
                                                    >
                                                        <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                                                        <SelectContent>
                                                            {filteredCourses.map((course) => (
                                                                <SelectItem key={course.id} value={course.id.toString()}>{course.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors?.course_id && (<Alert variant="destructive"><AlertDescription>{errors.course_id}</AlertDescription></Alert>)}
                                                </div>
                                            )}

                                            {selectedDepartment && selectedCourse && (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="specific_year_level">Year Level *</Label>
                                                        <Select
                                                            value={data.specific_year_level}
                                                            onValueChange={(v) => setData('specific_year_level', v)}
                                                        >
                                                            <SelectTrigger><SelectValue placeholder="Select Year Level" /></SelectTrigger>
                                                            <SelectContent>
                                                                {specificYearLevels.college && Object.entries(specificYearLevels.college).map(([key, label]) => (
                                                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors?.specific_year_level && (<Alert variant="destructive"><AlertDescription>{errors.specific_year_level}</AlertDescription></Alert>)}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">Section *</Label>
                                                        <Input
                                                            id="name"
                                                            value={data.name}
                                                            onChange={(e) => setData('name', e.target.value)}
                                                            placeholder={`e.g., ${data.specific_year_level ? (specificYearLevels.college?.[data.specific_year_level] || data.specific_year_level) : 'Year'} - ${filteredCourses.find(c => c.id.toString() === selectedCourse)?.name || 'Course'} - Section A`}
                                                            required
                                                        />
                                                        {errors?.name && (<Alert variant="destructive"><AlertDescription>{errors.name}</AlertDescription></Alert>)}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="max_students">Number of Students *</Label>
                                                        <Input
                                                            id="max_students"
                                                            type="number"
                                                            min={1}
                                                            max={50}
                                                            value={String(data.max_students)}
                                                            onChange={(e) => setData('max_students', e.target.value)}
                                                            placeholder="e.g., 30"
                                                            required
                                                        />
                                                        {errors?.max_students && (<Alert variant="destructive"><AlertDescription>{errors.max_students}</AlertDescription></Alert>)}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : null}

                                    <div className="flex items-center gap-3 pt-2">
                                        <Button type="submit" disabled={processing} className="flex items-center gap-2">
                                            <Save className="h-4 w-4" /> {editing ? 'Update' : 'Create'}
                                        </Button>
                                        {editing && (
                                            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* List */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>
                                    {isGradeLevelBasedLevel && selectedGradeLevel
                                        ? `Sections for ${isElementaryLevel ? specificYearLevels.elementary?.[selectedGradeLevel] : specificYearLevels.junior_highschool?.[selectedGradeLevel] || selectedGradeLevel}`
                                        : isTrackBasedLevel && selectedTrack && selectedStrand
                                        ? `Sections for ${filteredStrands.find(s => s.id.toString() === selectedStrand)?.name || selectedStrand}`
                                        : 'Existing Sections'
                                    }
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isGradeLevelBasedLevel && !selectedGradeLevel ? (
                                    <div className="text-sm text-gray-500 py-6">
                                        Please select a Grade Level to view and manage sections.
                                    </div>
                                ) : isTrackBasedLevel && (!selectedTrack || !selectedStrand) ? (
                                    <div className="text-sm text-gray-500 py-6">
                                        Please select a Track and Strand to view and manage sections.
                                    </div>
                                ) : isDepartmentBasedLevel && (!selectedDepartment || !selectedCourse) ? (
                                    <div className="text-sm text-gray-500 py-6">
                                        Please select a Department and Course to view and manage sections.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {((isGradeLevelBasedLevel || isTrackBasedLevel || isDepartmentBasedLevel) ? existingSections : visibleSections).length === 0 && (
                                            <div className="text-sm text-gray-500 py-6">
                                                {isGradeLevelBasedLevel
                                                    ? `No sections yet for ${isElementaryLevel ? specificYearLevels.elementary?.[selectedGradeLevel] : specificYearLevels.junior_highschool?.[selectedGradeLevel] || selectedGradeLevel}. Create your first section.`
                                                    : isTrackBasedLevel
                                                    ? `No sections yet for ${filteredStrands.find(s => s.id.toString() === selectedStrand)?.name || selectedStrand}. Create your first section.`
                                                    : isDepartmentBasedLevel
                                                    ? `No sections yet for ${filteredCourses.find(c => c.id.toString() === selectedCourse)?.name || selectedCourse}. Create your first section.`
                                                    : 'No sections yet. Create your first section.'
                                                }
                                            </div>
                                        )}
                                        {((isGradeLevelBasedLevel || isTrackBasedLevel || isDepartmentBasedLevel) ? existingSections : visibleSections).map((s) => (
                                            <div key={s.id} className="flex items-center justify-between py-3">
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{s.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {isGradeLevelBasedLevel ? (
                                                            <>
                                                                Grade: {isElementaryLevel ? specificYearLevels.elementary?.[s.specific_year_level || ''] : specificYearLevels.junior_highschool?.[s.specific_year_level || ''] || s.specific_year_level}
                                                                {typeof s.max_students === 'number' ? ` • Max: ${s.max_students}` : ''}
                                                            </>
                                                        ) : isTrackBasedLevel ? (
                                                            <>
                                                                Strand: {strands.find(strand => strand.id === s.strand_id)?.name || s.strand_id}
                                                                {s.specific_year_level ? ` • Grade: ${specificYearLevels.senior_highschool?.[s.specific_year_level] || s.specific_year_level}` : ''}
                                                                {typeof s.max_students === 'number' ? ` • Max: ${s.max_students}` : ''}
                                                            </>
                                                        ) : isDepartmentBasedLevel ? (
                                                            <>
                                                                Course: {courses.find(course => course.id === s.course_id)?.name || s.course_id}
                                                                {s.specific_year_level ? ` • Year: ${specificYearLevels.college?.[s.specific_year_level] || s.specific_year_level}` : ''}
                                                                {typeof s.max_students === 'number' ? ` • Max: ${s.max_students}` : ''}
                                                            </>
                                                        ) : (
                                                            <>
                                                                Level ID: {s.academic_level_id}
                                                                {s.specific_year_level ? ` • Year: ${s.specific_year_level}` : ''}
                                                                {typeof s.max_students === 'number' ? ` • Max: ${s.max_students}` : ''}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => onEdit(s)}>Edit</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => onDelete(s)} className="flex items-center gap-1">
                                                        <Trash2 className="h-3 w-3" /> Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}