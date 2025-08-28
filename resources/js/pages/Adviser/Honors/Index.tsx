import { Header } from '@/components/adviser/header';
import { Sidebar } from '@/components/adviser/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@inertiajs/react';
import { Crown, Trophy, Award, Star, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { useState } from 'react';

interface Props {
  user: any;
  academicLevels: Array<{ id: number; name: string; key: string }>
  honorTypes: Array<{ id: number; name: string; description?: string; minimum_gpa?: number }>
  schoolYear: string;
  assignedCourses: Array<{ school_year: string }>
}

export default function AdviserHonorsIndex({ user, academicLevels, honorTypes, schoolYear, assignedCourses }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(schoolYear || '2024-2025');
  const availableYears = Array.from(new Set((assignedCourses || []).map(a => a.school_year)));

  const getHonorIcon = (honorType: string) => {
    switch (honorType.toLowerCase()) {
      case 'valedictorian':
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case 'salutatorian':
        return <Trophy className="h-5 w-5 text-blue-600" />;
      case 'with highest honors':
        return <Award className="h-5 w-5 text-purple-600" />;
      case 'with high honors':
        return <Star className="h-5 w-5 text-green-600" />;
      case 'with honors':
        return <Star className="h-5 w-5 text-orange-600" />;
      default:
        return <Star className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Honor Tracking</h1>
              <p className="text-gray-500 dark:text-gray-400">View honor results and achievements for your advisory students.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Academic Level</label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Academic Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {academicLevels.map((level) => (
                          <SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">School Year</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select School Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.length > 0 ? (
                          availableYears.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value={selectedYear}>{selectedYear}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Honor Types & Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {honorTypes.map((honorType) => (
                    <div key={honorType.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getHonorIcon(honorType.name)}
                        <h3 className="font-medium">{honorType.name}</h3>
                      </div>
                      {honorType.description && (
                        <p className="text-sm text-muted-foreground mb-2">{honorType.description}</p>
                      )}
                      {honorType.minimum_gpa !== undefined && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Min GPA: {honorType.minimum_gpa}</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {academicLevels.map((level) => (
                <Card key={level.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {level.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Students</span>
                        <Badge variant="outline">0</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Honor Students</span>
                        <Badge variant="default">0</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Average GPA</span>
                        <span className="text-sm font-medium">0.00</span>
                      </div>
                      <Link href={route('adviser.honors.level', level.id)}>
                        <Button className="w-full" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center"><div className="text-2xl font-bold text-blue-600">0</div><div className="text-sm text-muted-foreground">Total Honor Students</div></div>
                  <div className="text-center"><div className="text-2xl font-bold text-green-600">0</div><div className="text-sm text-muted-foreground">With Highest Honors</div></div>
                  <div className="text-center"><div className="text-2xl font-bold text-purple-600">0</div><div className="text-sm text-muted-foreground">With High Honors</div></div>
                  <div className="text-center"><div className="text-2xl font-bold text-orange-600">0</div><div className="text-sm text-muted-foreground">With Honors</div></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}


