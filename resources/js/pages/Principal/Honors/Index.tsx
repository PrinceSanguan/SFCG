import { Header } from '@/components/principal/header';
import { Sidebar } from '@/components/principal/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, router } from '@inertiajs/react';
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, Check, X } from 'lucide-react';
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
}

interface HonorResult {
    id: number;
    gpa: number;
    school_year: string;
    is_pending_approval: boolean;
    is_approved: boolean;
    is_rejected: boolean;
    created_at: string;
    approved_at?: string;
    rejected_at?: string;
    rejection_reason?: string;
    student: User;
    honorType: HonorType;
    academicLevel: AcademicLevel;
    approvedBy?: User;
    rejectedBy?: User;
}

interface Stats {
    total_honors: number;
    pending_honors: number;
    approved_honors: number;
    rejected_honors: number;
}

interface HonorsIndexProps {
    user: User;
    honors: {
        data: HonorResult[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    honorTypes: HonorType[];
    academicLevels: AcademicLevel[];
    stats: Stats;
}

export default function HonorsIndex({ user, honors, honorTypes, academicLevels, stats }: HonorsIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const getStatusBadge = (honor: HonorResult) => {
        if (honor.is_approved) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
        }
        if (honor.is_rejected) {
            return <Badge variant="destructive">Rejected</Badge>;
        }
        if (honor.is_pending_approval) {
            return <Badge variant="secondary">Pending</Badge>;
        }
        return <Badge variant="outline">Draft</Badge>;
    };

    const getStatusIcon = (honor: HonorResult) => {
        if (honor.is_approved) {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        }
        if (honor.is_rejected) {
            return <XCircle className="h-4 w-4 text-red-600" />;
        }
        if (honor.is_pending_approval) {
            return <Clock className="h-4 w-4 text-yellow-600" />;
        }
        return <Clock className="h-4 w-4 text-gray-400" />;
    };

    const filteredHonors = honors.data.filter(honor => {
        const matchesSearch = (honor.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (honor.honorType?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !selectedType || selectedType === 'all' || honor.honorType?.id.toString() === selectedType;
        const matchesLevel = !selectedLevel || selectedLevel === 'all' || honor.academicLevel?.id.toString() === selectedLevel;
        const matchesStatus = !statusFilter || statusFilter === 'all' ||
            (statusFilter === 'approved' && honor.is_approved) ||
            (statusFilter === 'pending' && honor.is_pending_approval && !honor.is_approved && !honor.is_rejected) ||
            (statusFilter === 'rejected' && honor.is_rejected);

        return matchesSearch && matchesType && matchesLevel && matchesStatus;
    });

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Honor Tracking
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Review and manage honor submissions across all departments.
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-blue-600" />
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
                            <Clock className="h-8 w-8 text-yellow-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold">{stats.pending_honors}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-2xl font-bold">{stats.approved_honors}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <XCircle className="h-8 w-8 text-red-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold">{stats.rejected_honors}</p>
                            </div>
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
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search students or honor types..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
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
                            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All levels</SelectItem>
                                    {academicLevels.map((level) => (
                                        <SelectItem key={level.id} value={level.id.toString()}>
                                            {level.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Honors List */}
            <Card>
                <CardHeader>
                    <CardTitle>Honor Submissions ({filteredHonors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredHonors.map((honor) => (
                            <div key={honor.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(honor)}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{honor.student?.name || 'Unknown Student'}</h3>
                                            <Badge variant="outline">{honor.gpa}</Badge>
                                            <Badge variant="secondary">{honor.honorType?.name || 'Unknown Type'}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {honor.academicLevel?.name || 'Unknown Level'} - {honor.school_year}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Submitted: {new Date(honor.created_at).toLocaleDateString()}
                                        </p>
                                        {honor.rejection_reason && (
                                            <p className="text-xs text-red-600 mt-1">
                                                Rejection reason: {honor.rejection_reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(honor)}
                                    <Link href={route('principal.honors.review', honor.id)}>
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-1" />
                                            Review
                                        </Button>
                                    </Link>
                                    {honor.is_pending_approval && !honor.is_approved && !honor.is_rejected && (
                                        <div className="flex gap-1">
                                            <Button 
                                                size="sm" 
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to approve this honor?')) {
                                                        router.post(route('principal.honors.approve', honor.id), {}, {
                                                            onSuccess: () => {
                                                                // The page will refresh automatically due to Inertia
                                                            },
                                                            onError: (errors) => {
                                                                console.error('Error approving honor:', errors);
                                                            }
                                                        });
                                                    }
                                                }}
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="destructive"
                                                onClick={() => {
                                                    const reason = prompt('Please provide a reason for rejecting this honor:');
                                                    if (reason && reason.trim()) {
                                                        router.post(route('principal.honors.reject', honor.id), {
                                                            rejection_reason: reason.trim()
                                                        }, {
                                                            onSuccess: () => {
                                                                // The page will refresh automatically due to Inertia
                                                            },
                                                            onError: (errors) => {
                                                                console.error('Error rejecting honor:', errors);
                                                            }
                                                        });
                                                    }
                                                }}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredHonors.length === 0 && (
                            <div className="text-center py-8">
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
