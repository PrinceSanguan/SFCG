import { Header } from '@/components/adviser/header';
import { Sidebar } from '@/components/adviser/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  user: any;
  academicLevel: any;
  honorResults: Record<string, any[]>;
  honorTypes: any[];
  schoolYear: string;
}

export default function AdviserHonorsShowByLevel({ user, academicLevel, honorResults, honorTypes, schoolYear }: Props) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Honor Results - {academicLevel?.name}</h1>
              <p className="text-gray-500 dark:text-gray-400">School Year: {schoolYear}</p>
            </div>

            {honorTypes.map((type) => (
              <Card key={type.id}>
                <CardHeader>
                  <CardTitle>{type.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Student</th>
                          <th className="text-left p-3 font-medium">GPA</th>
                          <th className="text-left p-3 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(honorResults?.[type.id] || []).map((result: any) => (
                          <tr key={result.id} className="border-b">
                            <td className="p-3">{result.student?.name}</td>
                            <td className="p-3">{result.gpa ?? 'N/A'}</td>
                            <td className="p-3">{result.notes ?? ''}</td>
                          </tr>
                        ))}
                        {(honorResults?.[type.id] || []).length === 0 && (
                          <tr>
                            <td className="p-3 text-gray-500" colSpan={3}>No students for this honor type.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}


