import { Header } from '@/components/principal/header';
import { Sidebar } from '@/components/principal/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, router } from '@inertiajs/react';
import { Search, Filter, CheckCircle, Clock, Eye, Check, X } from 'lucide-react';
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
    created_at: string;
    student: User;
    honor_type: HonorType;
    academic_level: AcademicLevel;
}

interface PendingHonorsProps {
    user: User;
    honors: {
        data: HonorResult[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function PendingHonors({ user, honors }: PendingHonorsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');

    const filteredHonors = honors.data.filter(honor => {
        const matchesSearch = (honor.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (honor.honor_type?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !selectedType || selectedType === 'all' || honor.honor_type?.id.toString() === selectedType;
        const matchesLevel = !selectedLevel || selectedLevel === 'all' || honor.academic_level?.id.toString() === selectedLevel;

        return matchesSearch && matchesType && matchesLevel;
    });

    const handleApprove = (honorId: number) => {
        if (confirm('Are you sure you want to approve this honor?')) {
            router.post(route('principal.honors.approve', honorId), {}, {
                onSuccess: () => {
                    // The page will refresh automatically due to Inertia
                },
                onError: (errors) => {
                    console.error('Error approving honor:', errors);
                }
            });
        }
    };

    const handleReject = (honorId: number) => {
        const reason = prompt('Please provide a reason for rejecting this honor:');
        if (reason && reason.trim()) {
            router.post(route('principal.honors.reject', honorId), {
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
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Pending Honor Approvals
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Review and approve honor submissions that are awaiting your approval.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-yellow-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                                <p className="text-2xl font-bold">{honors.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Ready for Review</p>
                                <p className="text-2xl font-bold">{filteredHonors.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Eye className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">This Page</p>
                                <p className="text-2xl font-bold">{honors.data.length}</p>
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
                    <div className="grid gap-4 md:grid-cols-3">
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
                                    {/* This would be populated from props in a real implementation */}
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
                                    {/* This would be populated from props in a real implementation */}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pending Honors List */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Honor Submissions ({filteredHonors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredHonors.map((honor) => (
                            <div key={honor.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                                <div className="flex items-center gap-4">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{honor.student?.name || 'Unknown Student'}</h3>
                                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                                {honor.gpa}
                                            </Badge>
                                            <Badge variant="secondary">{honor.honor_type?.name || 'Unknown Type'}</Badge>
                                            <Badge variant="secondary">Pending</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {honor.academic_level?.name || 'Unknown Level'} - {honor.school_year}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Submitted: {new Date(honor.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={route('principal.honors.review', honor.id)}>
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-1" />
                                            Review
                                        </Button>
                                    </Link>
                                    <Button 
                                        size="sm" 
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleApprove(honor.id)}
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        Approve
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => handleReject(honor.id)}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {filteredHonors.length === 0 && (
                            <div className="text-center py-8">
                                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No pending honors found.</p>
                                <p className="text-sm text-gray-400">All honor submissions have been reviewed.</p>
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
