import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Award, GraduationCap, CheckCircle, XCircle, Star } from 'lucide-react';

interface User {
    name?: string;
    email?: string;
    user_role?: string;
}

interface AcademicLevel {
    id: number;
    key: string;
    name: string;
    sort_order: number;
}

interface HonorType {
    id: number;
    name: string;
    description?: string;
    academic_level_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    academic_level: AcademicLevel;
}

interface HonorsProps {
    user: User;
    honorTypes: HonorType[];
    academicLevels: AcademicLevel[];
}

export default function Honors({ user, honorTypes, academicLevels }: HonorsProps) {
    // Group honor types by academic level
    const groupedHonors = honorTypes.reduce((acc, honor) => {
        const levelKey = honor.academic_level.key;
        if (!acc[levelKey]) {
            acc[levelKey] = [];
        }
        acc[levelKey].push(honor);
        return acc;
    }, {} as Record<string, HonorType[]>);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {/* Back Button */}
                        <div className="flex items-center gap-4">
                            <Link href={route('registrar.academic.index')}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Academic Management
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Honor Tracking & Ranking
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                View honor types and criteria for each academic level.
                            </p>
                        </div>

                        {/* Info Card */}
                        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Award className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                                            Honor System Overview
                                        </h3>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                            The honor system recognizes academic excellence and achievement. 
                                            Honor types and criteria are configured for each academic level.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Honor Types by Level */}
                        {Object.entries(groupedHonors).map(([levelKey, levelHonors]) => (
                            <Card key={levelKey}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5 text-blue-600" />
                                        {levelHonors[0]?.academic_level.name} - Honor Types
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {levelHonors
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map((honor) => (
                                                <div key={honor.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <Star className="h-4 w-4 text-yellow-500" />
                                                            <div className="flex flex-col">
                                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {honor.name}
                                                                </h4>
                                                                {honor.description && (
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {honor.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {honor.is_active ? (
                                                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Created: {new Date(honor.created_at).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Updated: {new Date(honor.updated_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {honorTypes.length === 0 && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8">
                                        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">No honor types configured yet.</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                            Honor types must be configured by an administrator.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Additional Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">About the Honor System</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        The honor system recognizes student achievement:
                                    </p>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                                        <li>• Academic excellence recognition</li>
                                        <li>• Grade-based honor calculations</li>
                                        <li>• Level-specific honor criteria</li>
                                        <li>• Automatic honor qualification</li>
                                        <li>• Certificate generation</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">System Integration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Honor system integrates with other components:
                                    </p>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                                        <li>• Student grade computation</li>
                                        <li>• Academic level requirements</li>
                                        <li>• Certificate generation</li>
                                        <li>• Academic reporting</li>
                                        <li>• Student recognition</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Honor System Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-yellow-600" />
                                    Honor System Features
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 border rounded-lg">
                                        <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Automatic Calculation</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Honors are automatically calculated based on student grades and criteria.
                                        </p>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <GraduationCap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Level-Specific</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Each academic level can have different honor types and criteria.
                                        </p>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Real-time Updates</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Honor qualifications update automatically when grades change.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
