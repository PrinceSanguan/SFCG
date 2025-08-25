import React from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/student/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Certificate {
  id: number;
  school_year: string;
  type: string;
  status?: string;
  template?: { name: string };
}

interface Props {
  user: { name: string };
  schoolYear: string;
  certificates: Certificate[];
}

export default function StudentCertificatesIndex({ schoolYear, certificates }: Props) {
  return (
    <StudentLayout>
      <Head title="Certificates" />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">Certificates</h1>
          <p className="text-sm text-muted-foreground">School Year: {schoolYear}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Available Certificates
            </CardTitle>
            <CardDescription>Download your earned certificates and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {certificates.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{c.template?.name ?? c.type}</div>
                      <div className="text-sm text-muted-foreground">{c.school_year}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className={`${
                        c.status === 'Ready' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {c.status ?? 'Ready'}
                    </Badge>
                    {c.status === 'Ready' && (
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {certificates.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <div className="text-lg font-medium text-gray-500">No certificates available</div>
                  <div className="text-sm text-muted-foreground">Your earned certificates will appear here when available</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
