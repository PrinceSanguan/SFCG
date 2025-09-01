import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import ParentLayout from '@/layouts/parent/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, User } from 'lucide-react';

interface LinkedStudent {
  id: number;
  name: string;
  email: string;
  student_number?: string;
  year_level?: string;
}

interface Certificate {
  id: number;
  school_year: string;
  type: string;
  status?: string;
  template?: { name: string };
  student?: { name: string };
}

interface Props {
  user?: { name: string };
  schoolYear?: string;
  linkedStudents?: LinkedStudent[];
  certificates?: Certificate[];
  selectedStudent?: LinkedStudent | null;
}

export default function ParentCertificatesIndex({ schoolYear, certificates, linkedStudents, selectedStudent }: Props) {
  const safeLinked = linkedStudents ?? [];
  const safeCertificates = certificates ?? [];
  const [selectedStudentId, setSelectedStudentId] = useState(selectedStudent?.id?.toString() || '');

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    // Redirect to the same page with new student ID
    window.location.href = route('parent.certificates.index', { student_id: studentId });
  };

  return (
    <ParentLayout>
      <Head title="Children's Certificates" />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">Children's Certificates</h1>
          <p className="text-sm text-muted-foreground">School Year: {schoolYear}</p>
        </div>

        {/* Student Selector */}
        {safeLinked.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} /> Select Child
              </CardTitle>
              <CardDescription>Choose which child's certificates to view</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedStudentId} onValueChange={handleStudentChange}>
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {safeLinked.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} {student.student_number && `(${student.student_number})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Certificates Display */}
        {selectedStudent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Available Certificates - {selectedStudent.name}
              </CardTitle>
              <CardDescription>Download earned certificates and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {safeCertificates.map((c) => (
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
                {safeCertificates.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <div className="text-lg font-medium text-gray-500">No certificates available</div>
                    <div className="text-sm text-muted-foreground">
                      Earned certificates will appear here when available
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Students Message */}
        {safeLinked.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <div className="text-lg font-medium text-gray-500">No children linked</div>
              <div className="text-sm text-muted-foreground">
                Contact the school administration to link your account to your children
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ParentLayout>
  );
}
