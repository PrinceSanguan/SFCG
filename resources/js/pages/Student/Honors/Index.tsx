import React from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/student/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Award } from 'lucide-react';

interface Honor {
  id: number;
  school_year: string;
  honor_type_id: number;
  honor_type?: { name: string };
}

interface Props {
  user: { name: string };
  schoolYear: string;
  honors: Honor[];
}

export default function StudentHonorsIndex({ schoolYear, honors }: Props) {
  return (
    <StudentLayout>
      <Head title="Honor Status" />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">Honor Status</h1>
          <p className="text-sm text-muted-foreground">School Year: {schoolYear}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Academic Honors
            </CardTitle>
            <CardDescription>Your current honor qualifications and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {honors.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Award className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{h.honor_type?.name ?? 'Honor'}</div>
                      <div className="text-sm text-muted-foreground">{h.school_year}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    Qualified
                  </Badge>
                </div>
              ))}
              {honors.length === 0 && (
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <div className="text-lg font-medium text-gray-500">No honor entries yet</div>
                  <div className="text-sm text-muted-foreground">Your honor qualifications will appear here when available</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
