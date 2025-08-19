import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User { name: string; email: string; user_role: string }

export default function Grading({ user }: { user: User }) {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <Card>
                        <CardHeader><CardTitle>Add/Edit grading periods or semesters</CardTitle></CardHeader>
                        <CardContent>
                            Placeholder: manage terms/semesters per level.
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}


