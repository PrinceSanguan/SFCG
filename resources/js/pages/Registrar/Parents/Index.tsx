import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { Search, Users, Eye, Edit, UserPlus, UserMinus, Key } from 'lucide-react';
import { useState } from 'react';
import PasswordResetModal from '@/components/registrar/PasswordResetModal';

interface Parent {
    id: number;
    name: string;
    email: string;
    parent_relationships: Array<{
        student: {
            id: number;
            name: string;
            email: string;
        };
    }>;
    created_at: string;
}

interface ParentsIndexProps {
    user: any;
    parents: {
        data: Parent[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: any;
}

export default function ParentsIndex({ user, parents, filters }: ParentsIndexProps) {
    const [resetPasswordParent, setResetPasswordParent] = useState<Parent | null>(null);
    
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl space-y-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Parent Management
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Manage parent accounts and their relationships with students.
                            </p>
                        </div>

                        {/* Search and Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Search & Filters
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search parents by name or email..."
                                            defaultValue={filters?.search || ''}
                                        />
                                    </div>
                                    <Button>Search</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parents List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Parents ({parents.total})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {parents.data.map((parent) => (
                                        <div key={parent.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <h3 className="font-medium">{parent.name}</h3>
                                                    <p className="text-sm text-gray-500">{parent.email}</p>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {parent.parent_relationships.length > 0 ? (
                                                        parent.parent_relationships.map((relationship, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {relationship.student.name}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs">
                                                            No students linked
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={route('registrar.parents.show', parent.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                </Link>
                                                <Link href={route('registrar.parents.edit', parent.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => setResetPasswordParent(parent)}
                                                >
                                                    <Key className="h-4 w-4 mr-2" />
                                                    Reset Password
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {parents.data.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">No parents found.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                {parents.last_page > 1 && (
                                    <div className="flex justify-center mt-6">
                                        <div className="flex gap-2">
                                            {Array.from({ length: parents.last_page }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={page === parents.current_page ? 'default' : 'outline'}
                                                    size="sm"
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Password Reset Modal */}
            {resetPasswordParent && (
                <PasswordResetModal
                    user={resetPasswordParent}
                    isOpen={!!resetPasswordParent}
                    onClose={() => setResetPasswordParent(null)}
                    routeName="registrar.parents.reset-password"
                />
            )}
        </div>
    );
}
