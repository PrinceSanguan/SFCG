import { Header } from '@/components/principal/header';
import { Sidebar } from '@/components/principal/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { BarChart, TrendingUp, Award, FileText, Download } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AcademicLevel {
    id: number;
    name: string;
}

interface Strand {
    id: number;
    name: string;
    code: string;
    academicLevel?: {
        id: number;
        name: string;
    };
}

interface ReportsIndexProps {
    user: User;
    academicLevels: AcademicLevel[];
    strands: Strand[];
}

export default function ReportsIndex({ user, academicLevels, strands }: ReportsIndexProps) {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Reports & Archiving
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    View academic performance trends and generate comprehensive reports.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <BarChart className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Academic Performance</p>
                                <p className="text-2xl font-bold">Available</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Grade Trends</p>
                                <p className="text-2xl font-bold">Available</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Award className="h-8 w-8 text-yellow-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Honor Statistics</p>
                                <p className="text-2xl font-bold">Available</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <FileText className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Export Options</p>
                                <p className="text-2xl font-bold">Multiple</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Report Categories */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Academic Performance Reports */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="h-5 w-5" />
                            Academic Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Comprehensive analysis of student academic performance across all levels and courses.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Filter by Level</span>
                                <Badge variant="outline">{academicLevels.length} levels</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Filter by Strand</span>
                                <Badge variant="outline">{strands.length} strands</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Export Formats</span>
                                <Badge variant="outline">PDF, Excel</Badge>
                            </div>
                        </div>
                        <Link href={route('principal.reports.academic-performance')}>
                            <Button className="w-full">
                                <BarChart className="h-4 w-4 mr-2" />
                                View Performance Report
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Grade Trends Reports */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Grade Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Track grade trends over time and identify patterns in academic performance.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Time Periods</span>
                                <Badge variant="outline">Multiple</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Visualization</span>
                                <Badge variant="outline">Charts & Graphs</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Comparison</span>
                                <Badge variant="outline">Year-over-year</Badge>
                            </div>
                        </div>
                        <Link href={route('principal.reports.grade-trends')}>
                            <Button className="w-full">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                View Trends Report
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Honor Statistics Reports */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Honor Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Detailed statistics on honor roll achievements and academic excellence.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Honor Types</span>
                                <Badge variant="outline">All Types</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Academic Levels</span>
                                <Badge variant="outline">{academicLevels.length} levels</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Export Options</span>
                                <Badge variant="outline">PDF, Excel</Badge>
                            </div>
                        </div>
                        <Link href={route('principal.reports.honor-statistics')}>
                            <Button className="w-full">
                                <Award className="h-4 w-4 mr-2" />
                                View Honor Statistics
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Export & Archive */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Export & Archive
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Export reports in various formats and manage archived data.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Export Formats</span>
                                <Badge variant="outline">PDF, Excel, CSV</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Archive Period</span>
                                <Badge variant="outline">All Years</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Data Retention</span>
                                <Badge variant="outline">Permanent</Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={route('principal.reports.academic-performance')}>
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-1" />
                                    View & Export
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Link href={route('principal.reports.academic-performance')}>
                            <Button variant="outline" className="w-full flex items-center gap-2">
                                <BarChart className="h-4 w-4" />
                                Performance Report
                            </Button>
                        </Link>
                        <Link href={route('principal.reports.grade-trends')}>
                            <Button variant="outline" className="w-full flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Grade Trends
                            </Button>
                        </Link>
                        <Link href={route('principal.reports.honor-statistics')}>
                            <Button variant="outline" className="w-full flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                Honor Statistics
                            </Button>
                        </Link>
                        <Button variant="outline" className="w-full flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Bulk Export
                        </Button>
                    </div>
                </CardContent>
            </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
