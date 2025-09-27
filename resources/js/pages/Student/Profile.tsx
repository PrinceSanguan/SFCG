import React from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/student/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, GraduationCap, School, Users, Calendar, Phone, MapPin, Flag, BookOpen, UserCheck, BookOpen as BookIcon, Award, TrendingUp } from 'lucide-react';

interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  units?: number;
  hours_per_week?: number;
  is_core: boolean;
  course?: {
    id: number;
    name: string;
  };
  academicLevel?: {
    id: number;
    name: string;
  };
  teacherAssignments?: Array<{
    id: number;
    teacher: {
      id: number;
      name: string;
      email: string;
    };
  }>;
}

interface SubjectAssignment {
  id: number;
  semester?: string;
  is_active: boolean;
  enrolled_at: string;
  notes?: string;
  subject: Subject;
}

interface StudentGrade {
  id: number;
  grade: number;
  grading_period_id: number;
  gradingPeriod: {
    id: number;
    name: string;
    code: string;
    sort_order?: number;
  };
  grading_period?: {
    id: number;
    name: string;
    code: string;
    sort_order?: number;
  };
  is_approved: boolean;
  approved_at?: string;
  approvedBy?: {
    id: number;
    name: string;
  };
}

interface HonorResult {
  id: number;
  gpa: number;
  status?: string;
  school_year: string;
  honorType: {
    id: number;
    name: string;
    key: string;
    scope: string;
  };
  academicLevel: {
    id: number;
    name: string;
    key: string;
  };
}

interface Props {
  user: { 
    name: string; 
    email: string; 
    student_number?: string; 
    year_level?: string;
    // Personal Information
    birth_date?: string;
    gender?: string;
    phone_number?: string;
    address?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    nationality?: string;
    religion?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    lrn?: string;
    previous_school?: string;
    parents?: Array<{
      id: number;
      name: string;
      email: string;
      pivot: {
        relationship_type: string;
        emergency_contact: string;
        notes?: string;
      };
    }>;
  };
  assignedSubjects: SubjectAssignment[];
  subjectGrades: Record<number, StudentGrade[]>;
  honorResults: HonorResult[];
  currentSchoolYear: string;
}

export default function StudentProfile({ user, assignedSubjects, subjectGrades, honorResults, currentSchoolYear }: Props) {
  const getPeriodLabel = (grade: StudentGrade): string => {
    const rel = (grade as unknown as { gradingPeriod?: { name?: string; code?: string }; grading_period?: { name?: string; code?: string } }).gradingPeriod
      || (grade as unknown as { grading_period?: { name?: string; code?: string } }).grading_period;
    const name = rel?.name;
    const code = rel?.code;
    if (name && String(name).trim().length > 0) return name;
    if (code && String(code).trim().length > 0) return code;
    if (grade.grading_period_id) return `Period #${grade.grading_period_id}`;
    return 'N/A';
  };
  const DEBUG = false;
  const isQuarterPeriod = (grade: StudentGrade): boolean => {
    const type = grade.gradingPeriod?.sort_order !== undefined
      ? (grade as unknown as { gradingPeriod?: { period_type?: string; name?: string; code?: string } }).gradingPeriod?.period_type
      : (grade as unknown as { grading_period?: { period_type?: string; name?: string; code?: string } }).grading_period?.period_type;
    const code = (grade.gradingPeriod?.code || grade.grading_period?.code || '').toUpperCase();
    const name = (
      (grade as unknown as { gradingPeriod?: { name?: string } }).gradingPeriod?.name ||
      (grade as unknown as { grading_period?: { name?: string } }).grading_period?.name ||
      ''
    ).toLowerCase();
    if (name.includes('semester')) return false;
    if (['F_SIM', 'S2', 'F1', 'S2-FA'].includes(code)) return false;
    const normalizedType = (type || '').toLowerCase();
    if (['quarter', 'midterm', 'prefinal'].includes(normalizedType)) return true;
    return ['Q1', 'Q2', 'Q3', 'Q4', 'P1', 'S2-MT', 'S2-PF'].some(tok => code.includes(tok));
  };
  return (
    <StudentLayout>
      <Head title="My Profile" />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal information and account details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your basic account details and student information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Full Name
                </div>
                <div className="text-lg font-semibold text-gray-900">{user.name}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email Address
                </div>
                <div className="text-lg font-semibold text-gray-900">{user.email}</div>
              </div>

              {user.student_number && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    Student Number
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{user.student_number}</div>
                </div>
              )}

              {user.year_level && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <School className="h-4 w-4" />
                    Academic Level
                  </div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">{user.year_level}</div>
                </div>
              )}

              {user.birth_date && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Birth Date
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {new Date(user.birth_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              )}

              {user.gender && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User className="h-4 w-4" />
                    Gender
                  </div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">{user.gender}</div>
                </div>
              )}

              {user.phone_number && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{user.phone_number}</div>
                </div>
              )}

              {user.nationality && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Flag className="h-4 w-4" />
                    Nationality
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{user.nationality}</div>
                </div>
              )}

              {user.religion && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    Religion
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{user.religion}</div>
                </div>
              )}

              {user.lrn && (user.year_level === 'elementary' || user.year_level === 'junior_highschool') && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    LRN
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{user.lrn}</div>
                </div>
              )}

              {user.previous_school && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <School className="h-4 w-4" />
                    Previous School
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{user.previous_school}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        {(user.address || user.city || user.province || user.postal_code) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
              <CardDescription>Your residential address details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.address && (
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Complete Address
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{user.address}</div>
                  </div>
                )}

                {user.city && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      City
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{user.city}</div>
                  </div>
                )}

                {user.province && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Province
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{user.province}</div>
                  </div>
                )}

                {user.postal_code && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Postal Code
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{user.postal_code}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact Information */}
        {(user.emergency_contact_name || user.emergency_contact_phone || user.emergency_contact_relationship) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
              <CardDescription>Your emergency contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.emergency_contact_name && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <User className="h-4 w-4" />
                      Contact Name
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{user.emergency_contact_name}</div>
                  </div>
                )}

                {user.emergency_contact_phone && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      Contact Phone
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{user.emergency_contact_phone}</div>
                  </div>
                )}

                {user.emergency_contact_relationship && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <UserCheck className="h-4 w-4" />
                      Relationship
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{user.emergency_contact_relationship}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Honor Results */}
        {honorResults && honorResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                My Academic Honors - {currentSchoolYear}
              </CardTitle>
              <CardDescription>Your academic achievements and honor qualifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {honorResults.map((honor) => (
                  <div key={honor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{honor.honorType.name}</h3>
                        <p className="text-sm text-muted-foreground">{honor.academicLevel.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{honor.gpa}</div>
                      <div className="text-sm text-muted-foreground">GPA</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Academic Information - Subjects and Grades */}
        {assignedSubjects && assignedSubjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookIcon className="h-5 w-5" />
                My Academic Information - {currentSchoolYear}
              </CardTitle>
              <CardDescription>Your enrolled subjects, teachers, and grades for the current school year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {assignedSubjects.map((assignment) => {
                  const quarterGrades = (subjectGrades[assignment.subject.id] || []).filter(isQuarterPeriod);
                  const byCode = new Map<string, StudentGrade>();
                  quarterGrades.forEach(g => {
                    const c = (g.gradingPeriod?.code || g.grading_period?.code || '').toUpperCase();
                    const name = (g.gradingPeriod?.name || g.grading_period?.name || '').toLowerCase();

                    // Map database codes to Q1-Q4 format
                    if (c === '1ST_GRADING' || name.includes('1st grading') || name.includes('first quarter')) {
                      byCode.set('Q1', g);
                    } else if (c === '2ND_GRADING' || name.includes('2nd grading') || name.includes('second quarter')) {
                      byCode.set('Q2', g);
                    } else if (c === '3RD_GRADING' || name.includes('3rd grading') || name.includes('third quarter')) {
                      byCode.set('Q3', g);
                    } else if (c === '4TH_GRADING' || name.includes('4th grading') || name.includes('fourth quarter')) {
                      byCode.set('Q4', g);
                    }

                    // Also preserve original codes for backward compatibility
                    if (c) byCode.set(c, g);
                  });
                  const isSeniorHigh = (user.year_level === 'senior_highschool') || false;
                  const isElementary = (user.year_level === 'elementary') || false;
                  const isJuniorHigh = (user.year_level === 'junior_highschool') || false;
                  
                  // Use Q1-Q4 for Elementary, Junior High, and Senior High (all use quarter-based periods)
                  const firstSemCodes = (isSeniorHigh || isJuniorHigh || isElementary) ? ['Q1', 'Q2'] : ['P1', 'Q1'];
                  const secondSemCodes = (isSeniorHigh || isJuniorHigh || isElementary) ? ['Q3', 'Q4'] : ['S2-MT', 'S2-PF'];
                  // Ensure order-only rendering; maps used directly in JSX below
                  if (DEBUG) {
                    console.log('Student Profile → subject grades', {
                      subjectId: assignment.subject.id,
                      subjectCode: assignment.subject.code,
                      grades: quarterGrades.map((g: StudentGrade) => ({
                        id: g.id,
                        grading_period_id: (g as unknown as { grading_period_id?: number }).grading_period_id,
                        gradingPeriod: (g as unknown as { gradingPeriod?: { name?: string; code?: string } }).gradingPeriod,
                        grading_period: (g as unknown as { grading_period?: { name?: string; code?: string } }).grading_period,
                        raw: g,
                      }))
                    });
                  }
                  const teacher = assignment.subject.teacherAssignments?.[0]?.teacher;
                  
                  return (
                    <div key={assignment.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{assignment.subject.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {assignment.subject.code} • {assignment.subject.units || 0} units
                          </p>
                          {assignment.subject.description && (
                            <p className="text-sm text-gray-500 mt-1">{assignment.subject.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {assignment.subject.is_core && (
                            <Badge variant="secondary" className="text-xs">
                              Core Subject
                            </Badge>
                          )}
                          {assignment.semester && (
                            <Badge variant="outline" className="text-xs">
                              {assignment.semester}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Teacher Information */}
                      {teacher && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Teacher: {teacher.name}
                          </span>
                        </div>
                      )}

                      {/* Grades Section */}
                      {quarterGrades.length > 0 ? (
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            My Grades
                          </h5>
                          {(isElementary || isJuniorHigh) ? (
                            // Elementary and Junior High: Show all 4 quarters without semester grouping
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                              {['Q1', 'Q2', 'Q3', 'Q4'].map(code => {
                                const grade = byCode.get(code);
                                const quarterNames: Record<string, string> = {
                                  'Q1': 'First Quarter',
                                  'Q2': 'Second Quarter',
                                  'Q3': 'Third Quarter',
                                  'Q4': 'Fourth Quarter'
                                };
                                return (
                                  <div key={`q-${code}-${grade?.id ?? 'empty'}`} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border">
                                    <div>
                                      <span className="text-sm font-medium">{grade ? getPeriodLabel(grade) : quarterNames[code] || code}</span>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-lg font-bold ${grade && grade.grade >= 90 ? 'text-green-600' : grade && grade.grade >= 80 ? 'text-yellow-600' : grade && grade.grade >= 70 ? 'text-orange-600' : 'text-red-600'}`}>{grade ? grade.grade : '—'}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            // Senior High and College: Show with semester grouping
                            <>
                              <div>
                                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">First Semester</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {firstSemCodes.map(code => {
                                    const grade = byCode.get(code);
                                    return (
                                      <div key={`fs-${code}-${grade?.id ?? 'empty'}`} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border">
                                        <div>
                                          <span className="text-sm font-medium">{grade ? getPeriodLabel(grade) : (
                                            isSeniorHigh ? (code === 'Q1' ? 'First Quarter' : 'Second Quarter') : (code === 'P1' ? 'pre final' : 'First Quarter')
                                          )}</span>
                                          <div className="flex items-center gap-2">
                                            <span className={`text-lg font-bold ${grade && grade.grade >= 90 ? 'text-green-600' : grade && grade.grade >= 80 ? 'text-yellow-600' : grade && grade.grade >= 70 ? 'text-orange-600' : 'text-red-600'}`}>{grade ? grade.grade : '—'}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-3 mb-1">Second Semester</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {secondSemCodes.map(code => {
                                    const grade = byCode.get(code);
                                    return (
                                      <div key={`ss-${code}-${grade?.id ?? 'empty'}`} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border">
                                        <div>
                                          <span className="text-sm font-medium">{grade ? getPeriodLabel(grade) : (
                                            isSeniorHigh ? (code === 'Q3' ? 'Third Quarter' : 'Fourth Quarter') : (code === 'S2-MT' ? 'Midterm' : 'Pre-Final')
                                          )}</span>
                                          <div className="flex items-center gap-2">
                                            <span className={`text-lg font-bold ${grade && grade.grade >= 90 ? 'text-green-600' : grade && grade.grade >= 80 ? 'text-yellow-600' : grade && grade.grade >= 70 ? 'text-orange-600' : 'text-red-600'}`}>{grade ? grade.grade : '—'}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No grades recorded yet</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Linked Parents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Linked Parents
            </CardTitle>
            <CardDescription>Parents linked to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {user.parents && user.parents.length > 0 ? (
              <div className="space-y-3">
                {user.parents.map((parent) => (
                  <div key={parent.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {parent.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {parent.email}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {parent.pivot.relationship_type.charAt(0).toUpperCase() + parent.pivot.relationship_type.slice(1)}
                        </Badge>
                      </div>
                      {parent.pivot.emergency_contact && (
                        <p className="text-xs text-gray-500 mt-1">
                          Emergency Contact: {parent.pivot.emergency_contact}
                        </p>
                      )}
                      {parent.pivot.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          Notes: {parent.pivot.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <div className="text-lg font-medium text-gray-500">No parents linked</div>
                <div className="text-sm text-muted-foreground">
                  Contact the school administration to link parent accounts
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
