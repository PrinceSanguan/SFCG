import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ParentLayout from '@/layouts/parent/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Crown, FileText, Users, ArrowRight, Activity } from 'lucide-react';

interface LinkedStudent {
  id: number;
  name: string;
  email: string;
  student_number?: string;
  year_level?: string;
}

interface RecentActivity {
  type: string;
  student_name: string;
  subject?: string;
  grade?: number;
  honor_type?: string;
  date: string;
  icon: string;
  color: string;
}

interface Props {
  user: { name: string };
  schoolYear: string;
  linkedStudents: LinkedStudent[];
  stats: { 
    total_students: number; 
    total_grades: number; 
    total_honors: number; 
    total_certificates: number; 
  };
  recentActivities: RecentActivity[];
}

export default function ParentDashboard({ user, schoolYear, linkedStudents, stats, recentActivities }: Props) {
  return (
    <ParentLayout>
      <Head title="Parent Dashboard" />
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Welcome, {user?.name ?? 'Parent'} 👋</h1>
          <p className="text-sm text-muted-foreground">School Year: {schoolYear}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Linked Children</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stats.total_students}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total Grades</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stats.total_grades}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Honor Achievements</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stats.total_honors}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Certificates</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stats.total_certificates}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users size={18} /> My Children
              </CardTitle>
              <CardDescription>View profiles and academic information for all linked children.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={route('parent.profile.index')}>
                <Button variant="secondary" className="inline-flex items-center gap-2">
                  View Children <ArrowRight size={16} />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen size={18} /> Children's Grades
              </CardTitle>
              <CardDescription>Monitor academic performance across all subjects and periods.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={route('parent.grades.index')}>
                <Button variant="secondary" className="inline-flex items-center gap-2">
                  View Grades <ArrowRight size={16} />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown size={18} /> Honor Status
              </CardTitle>
              <CardDescription>Check honor qualifications and academic achievements.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={route('parent.honors.index')}>
                <Button variant="secondary" className="inline-flex items-center gap-2">
                  View Honors <ArrowRight size={16} />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText size={18} /> Certificates
              </CardTitle>
              <CardDescription>Download earned certificates and achievements.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={route('parent.certificates.index')}>
                <Button variant="secondary" className="inline-flex items-center gap-2">
                  View Certificates <ArrowRight size={16} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} /> Recent Activities
            </CardTitle>
            <CardDescription>Latest academic updates for your children</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${activity.color}-100 rounded-full`}>
                      {activity.type === 'grade_update' ? (
                        <BookOpen className={`h-4 w-4 text-${activity.color}-600`} />
                      ) : (
                        <Crown className={`h-4 w-4 text-${activity.color}-600`} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {activity.student_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activity.type === 'grade_update' 
                          ? `${activity.subject}: ${activity.grade}`
                          : `Achieved ${activity.honor_type}`
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <div className="text-lg font-medium text-gray-500">No recent activities</div>
                  <div className="text-sm text-muted-foreground">
                    Academic updates will appear here when available
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ParentLayout>
  );
}
