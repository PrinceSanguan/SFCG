import { Header } from '@/components/instructor/header';
import { Sidebar } from '@/components/instructor/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Clock, XCircle, Award, TrendingUp } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface HonorResult {
  id: number;
  student: { id: number; name: string; email: string };
  honorType: { id: number; name: string; key: string };
  gpa: number;
  school_year: string;
  status: 'pending' | 'approved' | 'rejected';
  status_color: 'yellow' | 'green' | 'red';
  is_approved: boolean;
  is_pending_approval: boolean;
  is_rejected: boolean;
  approved_at?: string;
  approved_by?: { id: number; name: string };
  rejected_at?: string;
  rejected_by?: { id: number; name: string };
  rejection_reason?: string;
  is_overridden: boolean;
  override_reason?: string;
  created_at: string;
}

interface Props {
  user: { id: number; name: string; email?: string; user_role: string };
  academicLevel: { id: number; name: string; key: string };
  honorResults: Record<string, HonorResult[]>;
  transformedResults: HonorResult[];
  honorTypes: Array<{ id: number; name: string; key: string }>;
  schoolYear: string;
  levelStats: {
    total_qualified: number;
    total_approved: number;
    total_pending: number;
    total_rejected: number;
    average_gpa: number;
  };
}

export default function InstructorHonorsShowByLevel({ user, academicLevel, honorResults, transformedResults, honorTypes, schoolYear, levelStats }: Props) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={route('instructor.honors.index')}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Honors
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Honor Results - {academicLevel?.name}</h1>
                  <p className="text-gray-500 dark:text-gray-400">School Year: {schoolYear}</p>
                </div>
              </div>
            </div>

            {/* Statistics Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Level Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{levelStats?.total_qualified || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Qualified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{levelStats?.total_approved || 0}</div>
                    <div className="text-sm text-muted-foreground">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{levelStats?.total_pending || 0}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{levelStats?.total_rejected || 0}</div>
                    <div className="text-sm text-muted-foreground">Rejected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{levelStats?.average_gpa?.toFixed(2) || '0.00'}</div>
                    <div className="text-sm text-muted-foreground">Average GPA</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Honor Results by Type */}
            {honorTypes.map((type) => (
              <Card key={type.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    {type.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Student</th>
                          <th className="text-left p-3 font-medium">GPA</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Date Processed</th>
                          <th className="text-left p-3 font-medium">Processed By</th>
                          <th className="text-left p-3 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(honorResults?.[type.id] || []).map((result: HonorResult) => (
                          <tr key={result.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-3">
                              <div>
                                <div className="font-medium">{result.student?.name}</div>
                                <div className="text-sm text-gray-500">{result.student?.email}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="font-mono">
                                {result.gpa?.toFixed(2) || 'N/A'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(result.status)}
                                <Badge className={getStatusBadgeClass(result.status)}>
                                  {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {result.approved_at ? new Date(result.approved_at).toLocaleDateString() :
                               result.rejected_at ? new Date(result.rejected_at).toLocaleDateString() :
                               new Date(result.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {result.approved_by?.name || result.rejected_by?.name || 'System'}
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {result.rejection_reason || result.override_reason || 'Regular qualification'}
                            </td>
                          </tr>
                        ))}
                        {(honorResults?.[type.id] || []).length === 0 && (
                          <tr>
                            <td className="p-3 text-gray-500 text-center" colSpan={6}>
                              No students qualified for this honor type.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* All Results Combined View */}
            {transformedResults && transformedResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    All Honor Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Student</th>
                          <th className="text-left p-3 font-medium">Honor Type</th>
                          <th className="text-left p-3 font-medium">GPA</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transformedResults.map((result: HonorResult) => (
                          <tr key={result.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-3">
                              <div className="font-medium">{result.student?.name}</div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">{result.honorType?.name}</Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="font-mono">
                                {result.gpa?.toFixed(2)}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(result.status)}
                                <Badge className={getStatusBadgeClass(result.status)}>
                                  {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {new Date(result.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}