import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import ParentLayout from '@/layouts/parent/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, Award, User } from 'lucide-react';

interface LinkedStudent {
  id: number;
  name: string;
  email: string;
  student_number?: string;
  year_level?: string;
}

interface Honor {
  id: number;
  school_year: string;
  honor_type_id: number;
  honor_type?: { name: string };
  academic_level?: { name: string };
}

interface Props {
  user: { name: string };
  schoolYear: string;
  linkedStudents: LinkedStudent[];
  honors: Honor[];
  selectedStudent: LinkedStudent | null;
}

export default function ParentHonorsIndex({ schoolYear, honors, linkedStudents, selectedStudent }: Props) {
  const [selectedStudentId, setSelectedStudentId] = useState(selectedStudent?.id?.toString() || '');

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    // Redirect to the same page with new student ID
    window.location.href = route('parent.honors.index', { student_id: studentId });
  };

  return (
    <ParentLayout>
      <Head title="Children's Honor Status" />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">Children's Honor Status</h1>
          <p className="text-sm text-muted-foreground">School Year: {schoolYear}</p>
        </div>

        {/* Student Selector */}
        {linkedStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} /> Select Child
              </CardTitle>
              <CardDescription>Choose which child's honor status to view</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedStudentId} onValueChange={handleStudentChange}>
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {linkedStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} {student.student_number && `(${student.student_number})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Honors Display */}
        {selectedStudent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Academic Honors - {selectedStudent.name}
              </CardTitle>
              <CardDescription>Current honor qualifications and achievements</CardDescription>
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
                        <div className="text-sm text-muted-foreground">
                          {h.academic_level?.name && `${h.academic_level.name} • `}{h.school_year}
                        </div>
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
                    <div className="text-sm text-muted-foreground">
                      Honor qualifications will appear here when available
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Students Message */}
        {linkedStudents.length === 0 && (
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
