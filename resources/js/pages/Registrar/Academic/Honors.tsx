import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, GraduationCap, ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';

interface User {
    name?: string;
    email?: string;
    user_role?: string;
}

interface AcademicLevel {
    id: number;
    name: string;
    key: string;
}

interface HonorType {
    id: number;
    name: string;
    key: string;
    scope: string;
}

interface HonorCriterion {
    id: number;
    academic_level_id: number;
    honor_type_id: number;
    min_gpa: number | null;
    max_gpa: number | null;
    min_grade: number | null;
    min_grade_all: number | null;
    min_year: number | null;
    max_year: number | null;
    require_consistent_honor: boolean;
    honorType: HonorType;
    academicLevel: AcademicLevel;
}

interface HonorResult {
    id: number;
    student_id: number;
    honor_type_id: number;
    academic_level_id: number;
    school_year: string;
    gpa: number;
    is_overridden: boolean;
    override_reason: string | null;
    overridden_by: number | null;
    honorType: HonorType;
    student: {
        id: number;
        name: string;
        student_number: string;
    };
}

interface Props {
    user: User;
    academicLevels: AcademicLevel[];
    honorTypes: HonorType[];
    criteria: HonorCriterion[];
    schoolYears: string[];
    honorResults: HonorResult[];
    groupedHonorResults: Record<string, Record<string, HonorResult[]>>;
}

export default function Honors({ user, academicLevels, honorTypes, criteria, schoolYears, groupedHonorResults }: Props) {
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [schoolYear, setSchoolYear] = useState(() => '2024-2025');
    const [isGenerating, setIsGenerating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Set default selected level when component mounts
    React.useEffect(() => {
        if (academicLevels && academicLevels.length > 0) {
            const defaultLevel = academicLevels[0].id;
            setSelectedLevel(defaultLevel);
        }
    }, [academicLevels]);

    const { data, setData, post, processing, errors, reset } = useForm({
        academic_level_id: '',
        honor_type_id: '',
        school_year: schoolYear,
        min_gpa: '',
        max_gpa: '',
        min_grade: '',
        min_grade_all: '',
        min_year: '',
        max_year: '',
        require_consistent_honor: false as boolean,
        additional_rules: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.academic.honor-criteria.store'), {
            onSuccess: () => {
                setMessage({ type: 'success', text: 'Honor criteria saved successfully!' });
                reset();
                setTimeout(() => setMessage(null), 3000);
            },
            onError: () => {
                setMessage({ type: 'error', text: 'Error saving honor criteria. Please try again.' });
            },
        });
    };

    const generateHonorRoll = () => {
        if (!selectedLevel) return;
        setIsGenerating(true);
        router.post(route('admin.academic.generate-honor-roll'), {
            academic_level_id: selectedLevel,
            school_year: schoolYear,
        }, {
            onSuccess: () => {
                setMessage({ type: 'success', text: 'Honor roll generated successfully!' });
                setTimeout(() => setMessage(null), 3000);
            },
            onError: () => {
                setMessage({ type: 'error', text: 'Error generating honor roll. Please try again.' });
            },
            onFinish: () => setIsGenerating(false),
        });
    };

    const exportHonorList = () => {
        if (!selectedLevel) return;
        router.get(route('admin.academic.export-honor-list'), {
            data: {
                academic_level_id: selectedLevel,
                school_year: schoolYear,
            }
        });
    };

    const getCriteriaForLevel = (levelId: number) => {
        return criteria.filter(criterion => 
            criterion.academic_level_id === levelId && 
            criterion.honorType && 
            criterion.academicLevel
        );
    };

    const getGroupedResultsForLevel = (levelId: number) => {
        const levelIdStr = levelId.toString();
        return groupedHonorResults[levelIdStr] || {};
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {/* Back Button */}
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get('/registrar/academic')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Academic Management
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Honor Tracking & Ranking
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                View honor types and criteria for each academic level.
                            </p>
                        </div>

                        {/* Message Display */}
                        {message && (
                            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                                <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                                    {message.text}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Honor Management Forms */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5" />
                                        Set Honor Criteria
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="academic_level_id">Academic Level</Label>
                                                {academicLevels && academicLevels.length > 0 ? (
                                                    <Select value={data.academic_level_id} onValueChange={(value) => setData('academic_level_id', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {academicLevels.map((level) => (
                                                                <SelectItem key={level.id} value={level.id.toString()}>
                                                                    {level.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <div className="p-2 text-sm text-gray-500 bg-gray-100 rounded border">
                                                        Loading academic levels...
                                                    </div>
                                                )}
                                                {errors.academic_level_id && (
                                                    <p className="text-sm text-red-500">{errors.academic_level_id}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="honor_type_id">Honor Type</Label>
                                                {honorTypes && honorTypes.length > 0 ? (
                                                    <Select value={data.honor_type_id} onValueChange={(value) => setData('honor_type_id', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select honor" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {honorTypes.map((type) => (
                                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <div className="p-2 text-sm text-gray-500 bg-gray-100 rounded border">
                                                        Loading honor types...
                                                    </div>
                                                )}
                                                {errors.honor_type_id && (
                                                    <p className="text-sm text-red-500">{errors.honor_type_id}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="school_year">School Year</Label>
                                            <Select value={data.school_year} onValueChange={(value) => setData('school_year', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select school year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(schoolYears?.length ? schoolYears : ['2024-2025']).map((year) => (
                                                        <SelectItem key={year} value={year}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="min_gpa">Min GPA</Label>
                                                <Input 
                                                    id="min_gpa" 
                                                    type="number" 
                                                    step="0.01" 
                                                    value={data.min_gpa} 
                                                    onChange={(e) => setData('min_gpa', e.target.value)} 
                                                    placeholder="e.g., 90.0" 
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="max_gpa">Max GPA</Label>
                                                <Input 
                                                    id="max_gpa" 
                                                    type="number" 
                                                    step="0.01" 
                                                    value={data.max_gpa} 
                                                    onChange={(e) => setData('max_gpa', e.target.value)} 
                                                    placeholder="e.g., 97.0" 
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="min_grade">Min Grade (any)</Label>
                                                <Input 
                                                    id="min_grade" 
                                                    type="number" 
                                                    value={data.min_grade} 
                                                    onChange={(e) => setData('min_grade', e.target.value)} 
                                                    placeholder="e.g., 90" 
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="min_grade_all">Min Grade (all)</Label>
                                                <Input 
                                                    id="min_grade_all" 
                                                    type="number" 
                                                    value={data.min_grade_all} 
                                                    onChange={(e) => setData('min_grade_all', e.target.value)} 
                                                    placeholder="e.g., 93" 
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="min_year">Min Year</Label>
                                                <Input 
                                                    id="min_year" 
                                                    type="number" 
                                                    value={data.min_year} 
                                                    onChange={(e) => setData('min_year', e.target.value)} 
                                                    placeholder="e.g., 2" 
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="max_year">Max Year</Label>
                                                <Input 
                                                    id="max_year" 
                                                    type="number" 
                                                    value={data.max_year} 
                                                    onChange={(e) => setData('max_year', e.target.value)} 
                                                    placeholder="e.g., 3" 
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="require_consistent_honor" 
                                                checked={!!data.require_consistent_honor} 
                                                onCheckedChange={(checked) => setData('require_consistent_honor', checked as boolean)} 
                                            />
                                            <Label htmlFor="require_consistent_honor">Require consistent honor standing</Label>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={processing}>
                                                Save Criteria
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={generateHonorRoll} 
                                                disabled={isGenerating}
                                            >
                                                {isGenerating ? 'Generating...' : 'Generate Honor Roll'}
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={exportHonorList}
                                            >
                                                Export Honor List
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5" />
                                        Generate Honor Roll
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Academic Level</Label>
                                        {academicLevels && academicLevels.length > 0 ? (
                                            <Select value={selectedLevel ? selectedLevel.toString() : undefined} onValueChange={(value) => setSelectedLevel(Number(value))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select level to generate honor roll" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicLevels.map((level) => (
                                                        <SelectItem key={level.id} value={level.id.toString()}>
                                                            {level.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="p-2 text-sm text-gray-500 bg-gray-100 rounded border">
                                                Loading academic levels...
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label>School Year</Label>
                                        {schoolYears && schoolYears.length > 0 ? (
                                            <Select value={schoolYear} onValueChange={setSchoolYear}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select school year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {schoolYears.map((year) => (
                                                        <SelectItem key={year} value={year}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="p-2 text-sm text-gray-500 bg-gray-100 rounded border">
                                                Loading school years...
                                            </div>
                                        )}
                                    </div>
                                    <Button 
                                        onClick={generateHonorRoll} 
                                        disabled={!selectedLevel || isGenerating} 
                                        className="w-full"
                                    >
                                        {isGenerating ? 'Generating...' : 'Generate Honor Roll'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Existing Criteria */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5" />
                                    Existing Criteria
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="elementary" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="elementary">Elementary</TabsTrigger>
                                        <TabsTrigger value="junior_highschool">Junior High</TabsTrigger>
                                        <TabsTrigger value="senior_highschool">Senior High</TabsTrigger>
                                        <TabsTrigger value="college">College</TabsTrigger>
                                    </TabsList>
                                    {academicLevels && academicLevels.length > 0 ? (
                                        academicLevels.map((level) => (
                                            <TabsContent key={level.key} value={level.key}>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-semibold">{level.name} Honor Criteria</h3>
                                                        <Button variant="outline" size="sm">Refresh Results</Button>
                                                    </div>
                                                    <div className="grid gap-4">
                                                        {getCriteriaForLevel(level.id).map((criterion) => (
                                                            criterion.honorType ? (
                                                                <div key={criterion.id} className="border rounded-lg p-4">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h4 className="font-medium">{criterion.honorType.name}</h4>
                                                                        <Badge variant="secondary">{criterion.honorType.scope}</Badge>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                                        {criterion.min_gpa && (
                                                                            <div>Min GPA: <span className="font-medium">{criterion.min_gpa}</span></div>
                                                                        )}
                                                                        {criterion.max_gpa && (
                                                                            <div>Max GPA: <span className="font-medium">{criterion.max_gpa}</span></div>
                                                                        )}
                                                                        {criterion.min_grade && (
                                                                            <div>Min Grade: <span className="font-medium">{criterion.min_grade}</span></div>
                                                                        )}
                                                                        {criterion.min_year && criterion.max_year && (
                                                                            <div>Years: <span className="font-medium">{criterion.min_year}-{criterion.max_year}</span></div>
                                                                        )}
                                                                        {criterion.require_consistent_honor && (
                                                                            <div className="col-span-2">
                                                                                <Badge variant="outline">Requires Consistent Honor</Badge>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div key={criterion.id} className="border rounded-lg p-4 bg-red-50">
                                                                    <p className="text-red-600 text-sm">Invalid honor type data</p>
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>

                                                    {/* Honor Results for this level */}
                                                    <div className="mt-6">
                                                        <h4 className="text-lg font-semibold mb-4">Honor Roll Results - {schoolYear}</h4>
                                                        <div className="space-y-4">
                                                            {(() => {
                                                                const grouped = getGroupedResultsForLevel(level.id);
                                                                const typeIds = Object.keys(grouped);
                                                                if (typeIds.length === 0) {
                                                                    return (
                                                                        <div className="text-sm text-gray-500">
                                                                            No honor results found for this level and school year.
                                                                        </div>
                                                                    );
                                                                }
                                                                return typeIds.map((typeId) => {
                                                                    const students = grouped[typeId];
                                                                    const type = honorTypes.find(t => t.id === Number(typeId));
                                                                    if (!students || students.length === 0 || !type) return null;
                                                                    return (
                                                                        <div key={`${level.id}-${typeId}`} className="border rounded-lg p-4">
                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                <Trophy className="h-4 w-4 text-yellow-600" />
                                                                                <h5 className="font-medium">{type.name}</h5>
                                                                                <Badge variant="secondary">
                                                                                    {students.length} student{students.length !== 1 ? 's' : ''}
                                                                                </Badge>
                                                                            </div>
                                                                            <Table>
                                                                                <TableHeader>
                                                                                    <TableRow>
                                                                                        <TableHead>Student</TableHead>
                                                                                        <TableHead>Student ID</TableHead>
                                                                                        <TableHead>GPA</TableHead>
                                                                                        <TableHead>Status</TableHead>
                                                                                    </TableRow>
                                                                                </TableHeader>
                                                                                <TableBody>
                                                                                    {students.map((result) => (
                                                                                        <TableRow key={result.id}>
                                                                                            <TableCell>{result.student?.name || 'Unknown Student'}</TableCell>
                                                                                            <TableCell>{result.student?.student_number || 'N/A'}</TableCell>
                                                                                            <TableCell>{result.gpa || '-'}</TableCell>
                                                                                            <TableCell>
                                                                                                <Badge variant={result.is_overridden ? 'destructive' : 'default'}>
                                                                                                    {result.is_overridden ? 'Overridden' : 'Qualified'}
                                                                                                </Badge>
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    ))}
                                                                                </TableBody>
                                                                            </Table>
                                                                        </div>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">
                                            No academic levels found. Please check your database configuration.
                                        </div>
                                    )}
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
