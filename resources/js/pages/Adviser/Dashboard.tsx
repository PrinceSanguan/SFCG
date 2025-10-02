import { Header } from '@/components/adviser/header';
import { Sidebar } from '@/components/adviser/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, GraduationCap, Clock, Crown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface User { id: number; name: string; email: string; user_role: string }
interface Assignment { id: number; academicLevel?: { name: string }; grade_level?: string; section?: string; school_year: string; subject?: { id: number; name: string; code?: string } }
interface StudentGrade { id: number; student?: { id?: number; name?: string }; subject?: { id?: number; name?: string }; academicLevel?: { id?: number; name?: string }; gradingPeriod?: { id?: number; name?: string }; grade?: number; school_year?: string; created_at?: string }
interface Props { user: User; assignments: Assignment[]; recentGrades: StudentGrade[]; upcomingDeadlines?: any[]; stats: { sections: number; students: number; grades: number }; schoolYear: string }

export default function AdviserDashboard({ user, assignments = [], recentGrades = [], upcomingDeadlines = [], stats, schoolYear }: Props) {
  // Group assignments by unique section
  const groupedSections = assignments.reduce((acc, assignment) => {
    const key = `${assignment.grade_level}-${assignment.section}-${assignment.school_year}`;
    if (!acc[key]) {
      acc[key] = {
        academicLevel: assignment.academicLevel,
        grade_level: assignment.grade_level,
        section: assignment.section,
        school_year: assignment.school_year,
        subjects: []
      };
    }
    if (assignment.subject) {
      acc[key].subjects.push(assignment.subject);
    }
    return acc;
  }, {} as Record<string, { academicLevel?: { name: string }; grade_level?: string; section?: string; school_year: string; subjects: { id: number; name: string; code?: string }[] }>);

  const uniqueSections = Object.values(groupedSections);
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
                <p className="text-gray-600">Manage your advisory sections and monitor student performance.</p>
              </div>
            </div>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Sections</CardTitle><BookOpen className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{stats.sections}</div><p className="text-xs text-muted-foreground">Assigned sections • {schoolYear}</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Students</CardTitle><Users className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{stats.students}</div><p className="text-xs text-muted-foreground">Across all sections</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Grades</CardTitle><GraduationCap className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{stats.grades}</div><p className="text-xs text-muted-foreground">This school year</p></CardContent></Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
            {/* My Sections */}
            <Card>
              <CardHeader><CardTitle>My Sections</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uniqueSections.length === 0 && (<p className="text-sm text-muted-foreground">No sections assigned yet.</p>)}
                  {uniqueSections.map((section, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium">{section.academicLevel?.name ?? 'Level'} • {section.grade_level ?? '-'} {section.section ?? ''}</p>
                          <p className="text-xs text-muted-foreground">{section.school_year}</p>
                        </div>
                        <Badge variant="outline">Advisory</Badge>
                      </div>
                      {section.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {section.subjects.map((subject) => (
                            <Badge key={subject.id} variant="secondary" className="text-xs">
                              {subject.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Recent Grades */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent Grades</CardTitle>
                <Link href={route('adviser.grades.index')}><Button variant="outline" size="sm">View All</Button></Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentGrades.length === 0 && (<p className="text-sm text-muted-foreground">No grades entered yet</p>)}
                  {recentGrades.map((g)=> (
                    <div key={g.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{g.student?.name || 'Unknown Student'}</p>
                        <p className="text-xs text-muted-foreground">{g.subject?.name || 'Unknown Subject'} • {g.school_year}</p>
                      </div>
                      <div className="flex items-center gap-2"><Badge variant="outline">{g.grade ?? '-'}</Badge><span className="text-xs text-muted-foreground">{g.created_at ? new Date(g.created_at).toLocaleDateString() : ''}</span></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Link href={route('adviser.grades.create')}><Button className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Input New Grade</Button></Link>
                  <Link href={route('adviser.grades.upload')}><Button variant="outline" className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Upload Grades CSV</Button></Link>
                  <Link href={route('adviser.honors.index')}><Button variant="outline" className="flex items-center gap-2"><Crown className="h-4 w-4" /> View Honor Results</Button></Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}


