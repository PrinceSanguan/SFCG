import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import InstructorLayout from '../InstructorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Trophy, Award, Star, Users, Calendar } from 'lucide-react';

interface StudentHonor {
    id: number;
    student: {
        id: number;
        name: string;
        email: string;
        student_profile: {
            academic_level?: {
                name: string;
            };
            college_course?: {
                name: string;
            };
        };
    };
    honor_criterion: {
        id: number;
        honor_type: string;
        minimum_grade: number | string | null;
        maximum_grade: number | string | null;
    };
    academic_period: {
        id: number;
        name: string;
    };
    gpa: number;
    rank: number;
    is_approved: boolean;
    awarded_date: string;
    created_at: string;
}

interface Props {
    honors: StudentHonor[];
    stats: {
        total_honors: number;
        approved_honors: number;
        pending_honors: number;
        average_gpa: number;
    };
    filters: {
        search?: string;
        period?: string;
        honor_type?: string;
        status?: string;
    };
    periods: Array<{ id: number; name: string }>;
}

const HonorResults: React.FC<Props> = ({ honors, stats, filters, periods }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [periodFilter, setPeriodFilter] = useState(filters.period || '');
    const [honorTypeFilter, setHonorTypeFilter] = useState(filters.honor_type || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleFilter = () => {
        router.get('/instructor/honors', {
            search: searchTerm,
            period: periodFilter,
            honor_type: honorTypeFilter,
            status: statusFilter,
        }, {
            preserveState: true,
        });
    };

    const getHonorTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            'with_honors': 'bg-yellow-100 text-yellow-800',
            'with_high_honors': 'bg-blue-100 text-blue-800',
            'with_highest_honors': 'bg-green-100 text-green-800',
            'president': 'bg-purple-100 text-purple-800',
            'dean': 'bg-indigo-100 text-indigo-800',
            'academic': 'bg-teal-100 text-teal-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getHonorDisplayName = (type: string) => {
        const names: { [key: string]: string } = {
            'with_honors': 'With Honors',
            'with_high_honors': 'With High Honors',
            'with_highest_honors': 'With Highest Honors',
            'president': 'President\'s List',
            'dean': 'Dean\'s List',
            'academic': 'Academic Excellence',
        };
        return names[type] || type.toUpperCase();
    };

    const getStatusBadge = (isApproved: boolean) => {
        return (
            <Badge className={isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {isApproved ? 'Approved' : 'Pending'}
            </Badge>
        );
    };

    return (
        <InstructorLayout>
            <Head title="View Honor Results of Students" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">View Honor Results of Students</h1>
                        <p className="text-gray-600">Monitor and track student honor achievements</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Trophy className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Honors</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total_honors}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Award className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Approved</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.approved_honors}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Star className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pending_honors}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Average GPA</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.average_gpa.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label>Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Academic Period</Label>
                                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Periods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Periods</SelectItem>
                                        {periods.map((period) => (
                                            <SelectItem key={period.id} value={period.id.toString()}>
                                                {period.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Honor Type</Label>
                                <Select value={honorTypeFilter} onValueChange={setHonorTypeFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        <SelectItem value="with_honors">With Honors</SelectItem>
                                        <SelectItem value="with_high_honors">With High Honors</SelectItem>
                                        <SelectItem value="with_highest_honors">With Highest Honors</SelectItem>
                                        <SelectItem value="president">President's List</SelectItem>
                                        <SelectItem value="dean">Dean's List</SelectItem>
                                        <SelectItem value="academic">Academic Excellence</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Status</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button onClick={handleFilter} className="w-full md:w-auto">
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Honors List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Honor Results ({honors.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {honors.length === 0 ? (
                            <Alert>
                                <AlertDescription>
                                    No honor results found matching your criteria.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-4">
                                {honors.map((honor) => (
                                    <div key={honor.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {honor.student.name}
                                                </h3>
                                                <p className="text-gray-600">{honor.student.email}</p>
                                                <p className="text-sm text-gray-500">
                                                    {honor.student.student_profile?.academic_level?.name || 
                                                     honor.student.student_profile?.college_course?.name || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHonorTypeColor(honor.honor_criterion.honor_type)}`}>
                                                    {getHonorDisplayName(honor.honor_criterion.honor_type)}
                                                </span>
                                                {getStatusBadge(honor.is_approved)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">GPA:</span> {honor.gpa.toFixed(2)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Rank:</span> #{honor.rank}
                                            </div>
                                            <div>
                                                <span className="font-medium">Period:</span> {honor.academic_period.name}
                                            </div>
                                            <div>
                                                <span className="font-medium">Awarded:</span> {new Date(honor.awarded_date).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="mt-2 text-xs text-gray-500">
                                            Grade Range: {(honor.honor_criterion.minimum_grade ? parseFloat(honor.honor_criterion.minimum_grade as string).toFixed(2) : 'N/A')} - {(honor.honor_criterion.maximum_grade ? parseFloat(honor.honor_criterion.maximum_grade as string).toFixed(2) : 'N/A')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Information Alert */}
                <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Note:</strong> Honor results are calculated based on student grades and honor criteria. 
                        Only approved honors are considered official. Pending honors are awaiting administrative review.
                    </AlertDescription>
                </Alert>
            </div>
        </InstructorLayout>
    );
};

export default HonorResults; 