import { Header } from '@/components/principal/header';
import { Sidebar } from '@/components/principal/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Filter, Download, Award, TrendingUp, Users, BarChart } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface HonorType {
    id: number;
    name: string;
}

interface AcademicLevel {
    id: number;
    name: string;
    key?: string;
}

interface HonorResult {
    id: number;
    gpa: number;
    school_year: string;
    student: {
        id: number;
        name: string;
    };
    honorType: HonorType;
    academicLevel: AcademicLevel;
}

interface Stats {
    total_honors: number;
    by_type: Record<string, number>;
    by_level: Record<string, number>;
    average_gpa: number;
}

interface HonorStatisticsProps {
    user: User;
    honors: {
        data: HonorResult[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    filters: {
        academic_level_id?: string;
        honor_type_id?: string;
        year?: string;
    };
    academicLevels: AcademicLevel[];
    principalAcademicLevel?: AcademicLevel | null;
    honorTypes: HonorType[];
}

export default function HonorStatistics({ user, honors, stats, filters, principalAcademicLevel, honorTypes }: HonorStatisticsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState(filters.honor_type_id || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');

    const filteredHonors = honors.data.filter(honor => {
        const matchesSearch = honor.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            honor.honorType.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !selectedType || selectedType === 'all' || honor.honorType.id.toString() === selectedType;
        const matchesYear = !selectedYear || honor.school_year === selectedYear;

        return matchesSearch && matchesType && matchesYear;
    });

    const getHonorColor = (honorType: string) => {
        switch (honorType.toLowerCase()) {
            case 'summa cum laude':
                return 'text-yellow-600';
            case 'magna cum laude':
                return 'text-gray-600';
            case 'cum laude':
                return 'text-amber-600';
            default:
                return 'text-blue-600';
        }
    };

    const getHonorBadge = (honorType: string) => {
        switch (honorType.toLowerCase()) {
            case 'summa cum laude':
                return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Summa Cum Laude</Badge>;
            case 'magna cum laude':
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Magna Cum Laude</Badge>;
            case 'cum laude':
                return <Badge variant="outline" className="bg-amber-100 text-amber-800">Cum Laude</Badge>;
            default:
                return <Badge variant="outline">{honorType}</Badge>;
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
                <div className="flex items-center gap-4">
                    <Link href={route('principal.reports.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Reports
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Honor Statistics Report
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Detailed statistics on honor roll achievements and academic excellence.
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Award className="h-8 w-8 text-yellow-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Honors</p>
                                <p className="text-2xl font-bold">{stats.total_honors}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Average GPA</p>
                                <p className="text-2xl font-bold">{stats.average_gpa.toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Honor Students</p>
                                <p className="text-2xl font-bold">{filteredHonors.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <BarChart className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Honor Types</p>
                                <p className="text-2xl font-bold">{Object.keys(stats.by_type).length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Honor Distribution */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribution by Honor Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(stats.by_type).map(([type, count]) => (
                                <div key={type} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{type}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{count}</Badge>
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full" 
                                                style={{ width: `${(count / stats.total_honors) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Distribution by Academic Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(stats.by_level).map(([level, count]) => (
                                <div key={level} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{level}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{count}</Badge>
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-green-600 h-2 rounded-full" 
                                                style={{ width: `${(count / stats.total_honors) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <Input
                                placeholder="Search students or honor types..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Honor Type</label>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All types</SelectItem>
                                    {honorTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Academic Level</label>
                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-gray-50 px-3 py-2 text-sm">
                                {principalAcademicLevel?.name || 'Not Assigned'}
                            </div>
                            <p className="text-xs text-gray-500">Reports are filtered by your assigned academic level</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">School Year</label>
                            <Input
                                placeholder="e.g., 2024-2025"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Export Options
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Button className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export to PDF
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export to Excel
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export to CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Honors List */}
            <Card>
                <CardHeader>
                    <CardTitle>Honor Students ({filteredHonors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredHonors.map((honor) => (
                            <div key={honor.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{honor.student.name}</h3>
                                            <span className={`text-lg font-bold ${getHonorColor(honor.honorType.name)}`}>
                                                {honor.gpa}
                                            </span>
                                            {getHonorBadge(honor.honorType.name)}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {honor.academicLevel.name} - {honor.school_year}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{honor.school_year}</Badge>
                                </div>
                            </div>
                        ))}
                        {filteredHonors.length === 0 && (
                            <div className="text-center py-8">
                                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No honors found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {honors.last_page > 1 && (
                <div className="flex justify-center">
                    <div className="flex gap-2">
                        {Array.from({ length: honors.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === honors.current_page ? 'default' : 'outline'}
                                size="sm"
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
                    </div>
                </main>
            </div>
        </div>
    );
}
