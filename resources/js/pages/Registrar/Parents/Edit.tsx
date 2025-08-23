import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Parent {
    id: number;
    name: string;
    email: string;
}

interface ParentsEditProps {
    user: any;
    parent: Parent;
}

export default function ParentsEdit({ user, parent }: ParentsEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: parent.name,
        email: parent.email,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('registrar.parents.update', parent.id));
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mx-auto max-w-4xl space-y-6">
                        {/* Back Button */}
                        <div className="flex items-center gap-4">
                            <Link href={route('registrar.parents.show', parent.id)}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Parent
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Edit Parent
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Update information for {parent.name}
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Parent Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter parent name"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Enter parent email"
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Link href={route('registrar.parents.show', parent.id)}>
                                            <Button type="button" variant="outline">
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
