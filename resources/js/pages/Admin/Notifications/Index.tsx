import { Header } from '@/components/admin/header';
import { Sidebar } from '@/components/admin/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Mail, Users, BarChart, Send, RefreshCw, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

interface User {
    name?: string;
    email?: string;
}

interface AcademicLevel {
    id: number;
    name: string;
    key: string;
}

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    recipients: string[];
    status: string;
    sent_at: string | null;
    created_at: string;
    metadata: any;
}

interface NotificationStats {
    total: number;
    pending: number;
    sent: number;
    failed: number;
    by_type: {
        grade_updates: number;
        honor_qualifications: number;
        general_announcements: number;
    };
}

interface StudentPreview {
    id: number;
    name: string;
    email: string;
    student_number: string;
    grade_count?: number;
    honor_type?: string;
    gpa?: number;
    academic_level: string;
}

interface NotificationsIndexProps {
    user: User;
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats: NotificationStats;
    academicLevels: AcademicLevel[];
}

export default function NotificationsIndex({ user, notifications, stats, academicLevels }: NotificationsIndexProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewData, setPreviewData] = useState<{
        students: StudentPreview[];
        count: number;
        message: string;
        success: boolean;
    } | null>(null);
    
    const [announcementData, setAnnouncementData] = useState({
        title: '',
        message: '',
        recipients: [] as string[],
        email_subject: '',
        email_body: '',
    });

    const [gradeNotificationData, setGradeNotificationData] = useState({
        school_year: '2024-2025',
        academic_level_id: 'all',
    });

    const [honorNotificationData, setHonorNotificationData] = useState({
        school_year: '2024-2025',
        academic_level_id: 'all',
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>;
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'grade_update':
                return <BarChart size={16} />;
            case 'honor_qualification':
                return <Users size={16} />;
            case 'general_announcement':
                return <Bell size={16} />;
            default:
                return <Bell size={16} />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'grade_update':
                return 'Grade Update';
            case 'honor_qualification':
                return 'Honor Qualification';
            case 'general_announcement':
                return 'General Announcement';
            default:
                return type;
        }
    };

    const handlePreviewGradeNotifications = async () => {
        if (!gradeNotificationData.school_year) return;
        
        setIsPreviewing(true);
        try {
            const response = await fetch(route('admin.notifications.preview-grade'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(gradeNotificationData),
            });
            
            const data = await response.json();
            setPreviewData(data);
        } catch (error) {
            console.error('Error previewing grade notifications:', error);
            setPreviewData({
                success: false,
                message: 'Failed to preview notifications',
                students: [],
                count: 0
            });
        } finally {
            setIsPreviewing(false);
        }
    };

    const handlePreviewHonorNotifications = async () => {
        if (!honorNotificationData.school_year) return;
        
        setIsPreviewing(true);
        try {
            const response = await fetch(route('admin.notifications.preview-honor'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(honorNotificationData),
            });
            
            const data = await response.json();
            setPreviewData(data);
        } catch (error) {
            console.error('Error previewing honor notifications:', error);
            setPreviewData({
                success: false,
                message: 'Failed to preview notifications',
                students: [],
                count: 0
            });
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleSendGradeNotifications = () => {
        if (!previewData || !previewData.success || previewData.count === 0) {
            return;
        }

        setIsLoading(true);
        router.post(route('admin.notifications.send-grade'), gradeNotificationData, {
            onSuccess: () => {
                setGradeNotificationData({
                    school_year: '2024-2025',
                    academic_level_id: 'all',
                });
                setPreviewData(null);
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            },
        });
    };

    const handleSendHonorNotifications = () => {
        if (!previewData || !previewData.success || previewData.count === 0) {
            return;
        }

        setIsLoading(true);
        router.post(route('admin.notifications.send-honor'), honorNotificationData, {
            onSuccess: () => {
                setHonorNotificationData({
                    school_year: '2024-2025',
                    academic_level_id: 'all',
                });
                setPreviewData(null);
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            },
        });
    };

    const handleSendGeneralAnnouncement = () => {
        console.log('Form data:', announcementData);
        
        if (!announcementData.title || !announcementData.message || announcementData.recipients.length === 0) {
            console.log('Validation failed:', {
                hasTitle: !!announcementData.title,
                hasMessage: !!announcementData.message,
                recipientsCount: announcementData.recipients.length
            });
            return;
        }

        setIsLoading(true);
        console.log('Sending announcement to:', announcementData.recipients);
        
        router.post(route('admin.notifications.send-announcement'), announcementData, {
            onSuccess: (response) => {
                console.log('Success response:', response);
                setAnnouncementData({
                    title: '',
                    message: '',
                    recipients: [],
                    email_subject: '',
                    email_body: '',
                });
                setIsLoading(false);
            },
            onError: (errors) => {
                console.log('Error response:', errors);
                setIsLoading(false);
            },
        });
    };

    const handleResendNotification = (notificationId: number) => {
        router.post(route('admin.notifications.resend', notificationId));
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Notifications & Transparency
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Manually send notifications for grades, honors, and general announcements
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                                    <Bell className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total}</div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Sent</CardTitle>
                                    <Mail className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                    <RefreshCw className="h-4 w-4 text-yellow-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Failed</CardTitle>
                                    <Bell className="h-4 w-4 text-red-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="grade-notifications">Grade Notifications</TabsTrigger>
                                <TabsTrigger value="honor-notifications">Honor Notifications</TabsTrigger>
                                <TabsTrigger value="general-announcements">General Announcements</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Notifications</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {notifications.data.length > 0 ? (
                                                notifications.data.slice(0, 10).map((notification) => (
                                                    <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            {getTypeIcon(notification.type)}
                                                            <div>
                                                                <p className="font-medium">{notification.title}</p>
                                                                <p className="text-sm text-gray-500">{notification.message}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-gray-400">
                                                                        {getTypeLabel(notification.type)}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400">
                                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                                    </span>
                                                                    {notification.recipients && notification.recipients.length > 0 && (
                                                                        <span className="text-xs text-gray-400">
                                                                            • {notification.recipients.length} recipient{notification.recipients.length !== 1 ? 's' : ''}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusBadge(notification.status)}
                                                            {notification.status === 'failed' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleResendNotification(notification.id)}
                                                                >
                                                                    <RefreshCw size={14} className="mr-1" />
                                                                    Resend
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                                                    <p className="text-lg font-medium">No notifications yet</p>
                                                    <p className="text-sm">Notifications will appear here after you send them</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="grade-notifications" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Send Grade Update Notifications</CardTitle>
                                        <p className="text-sm text-gray-500">
                                            Preview and manually send grade notifications to students
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="grade-school-year">School Year</Label>
                                                <Input
                                                    id="grade-school-year"
                                                    value={gradeNotificationData.school_year}
                                                    onChange={(e) => setGradeNotificationData({
                                                        ...gradeNotificationData,
                                                        school_year: e.target.value
                                                    })}
                                                    placeholder="2024-2025"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="grade-academic-level">Academic Level (Optional)</Label>
                                                <Select
                                                    value={gradeNotificationData.academic_level_id}
                                                    onValueChange={(value) => setGradeNotificationData({
                                                        ...gradeNotificationData,
                                                        academic_level_id: value
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="All Levels" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Levels</SelectItem>
                                                        {academicLevels.map((level) => (
                                                            <SelectItem key={level.id} value={level.id.toString()}>
                                                                {level.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handlePreviewGradeNotifications}
                                                disabled={isPreviewing || !gradeNotificationData.school_year}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                {isPreviewing ? (
                                                    <RefreshCw size={16} className="mr-2 animate-spin" />
                                                ) : (
                                                    <Eye size={16} className="mr-2" />
                                                )}
                                                Preview Recipients
                                            </Button>
                                        </div>

                                        {/* Preview Results */}
                                        {previewData && (
                                            <Alert className={previewData.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                                                <div className="flex items-center gap-2">
                                                    {previewData.success ? (
                                                        <CheckCircle size={16} className="text-green-600" />
                                                    ) : (
                                                        <AlertCircle size={16} className="text-red-600" />
                                                    )}
                                                    <AlertDescription className={previewData.success ? 'text-green-800' : 'text-red-800'}>
                                                        {previewData.message}
                                                    </AlertDescription>
                                                </div>
                                            </Alert>
                                        )}

                                        {previewData && previewData.success && previewData.students.length > 0 && (
                                            <div className="border rounded-lg p-4 bg-gray-50">
                                                <h4 className="font-medium mb-3">Recipients ({previewData.count} students)</h4>
                                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                                    {previewData.students.map((student) => (
                                                        <div key={student.id} className="flex items-center justify-between text-sm p-2 bg-white rounded border">
                                                            <div>
                                                                <span className="font-medium">{student.name}</span>
                                                                <span className="text-gray-500 ml-2">({student.student_number})</span>
                                                            </div>
                                                            <div className="text-gray-500">
                                                                {student.academic_level} • {student.grade_count} grades
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleSendGradeNotifications}
                                            disabled={isLoading || !previewData || !previewData.success || previewData.count === 0}
                                            className="w-full"
                                        >
                                            {isLoading ? (
                                                <RefreshCw size={16} className="mr-2 animate-spin" />
                                            ) : (
                                                <Send size={16} className="mr-2" />
                                            )}
                                            Send Grade Notifications
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="honor-notifications" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Send Honor Qualification Notifications</CardTitle>
                                        <p className="text-sm text-gray-500">
                                            Preview and manually send honor notifications to students
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="honor-school-year">School Year</Label>
                                                <Input
                                                    id="honor-school-year"
                                                    value={honorNotificationData.school_year}
                                                    onChange={(e) => setHonorNotificationData({
                                                        ...honorNotificationData,
                                                        school_year: e.target.value
                                                    })}
                                                    placeholder="2024-2025"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="honor-academic-level">Academic Level (Optional)</Label>
                                                <Select
                                                    value={honorNotificationData.academic_level_id}
                                                    onValueChange={(value) => setHonorNotificationData({
                                                        ...honorNotificationData,
                                                        academic_level_id: value
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="All Levels" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Levels</SelectItem>
                                                        {academicLevels.map((level) => (
                                                            <SelectItem key={level.id} value={level.id.toString()}>
                                                                {level.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handlePreviewHonorNotifications}
                                                disabled={isPreviewing || !honorNotificationData.school_year}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                {isPreviewing ? (
                                                    <RefreshCw size={16} className="mr-2 animate-spin" />
                                                ) : (
                                                    <Eye size={16} className="mr-2" />
                                                )}
                                                Preview Recipients
                                            </Button>
                                        </div>

                                        {/* Preview Results */}
                                        {previewData && (
                                            <Alert className={previewData.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                                                <div className="flex items-center gap-2">
                                                    {previewData.success ? (
                                                        <CheckCircle size={16} className="text-green-600" />
                                                    ) : (
                                                        <AlertCircle size={16} className="text-red-600" />
                                                    )}
                                                    <AlertDescription className={previewData.success ? 'text-green-800' : 'text-red-800'}>
                                                        {previewData.message}
                                                    </AlertDescription>
                                                </div>
                                            </Alert>
                                        )}

                                        {previewData && previewData.success && previewData.students.length > 0 && (
                                            <div className="border rounded-lg p-4 bg-gray-50">
                                                <h4 className="font-medium mb-3">Recipients ({previewData.count} students)</h4>
                                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                                    {previewData.students.map((student) => (
                                                        <div key={student.id} className="flex items-center justify-between text-sm p-2 bg-white rounded border">
                                                            <div>
                                                                <span className="font-medium">{student.name}</span>
                                                                <span className="text-gray-500 ml-2">({student.student_number})</span>
                                                            </div>
                                                            <div className="text-gray-500">
                                                                {student.academic_level} • {student.honor_type} • GPA: {student.gpa}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleSendHonorNotifications}
                                            disabled={isLoading || !previewData || !previewData.success || previewData.count === 0}
                                            className="w-full"
                                        >
                                            {isLoading ? (
                                                <RefreshCw size={16} className="mr-2 animate-spin" />
                                            ) : (
                                                <Send size={16} className="mr-2" />
                                            )}
                                            Send Honor Notifications
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="general-announcements" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Send General Announcement</CardTitle>
                                        <p className="text-sm text-gray-500">
                                            Send announcements to specific users or groups
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="announcement-title">Title</Label>
                                            <Input
                                                id="announcement-title"
                                                value={announcementData.title}
                                                onChange={(e) => setAnnouncementData({
                                                    ...announcementData,
                                                    title: e.target.value
                                                })}
                                                placeholder="Announcement title"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="announcement-message">Message</Label>
                                            <Input
                                                id="announcement-message"
                                                value={announcementData.message}
                                                onChange={(e) => setAnnouncementData({
                                                    ...announcementData,
                                                    message: e.target.value
                                                })}
                                                placeholder="Announcement message"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="announcement-recipients">Recipients (Email addresses, one per line)</Label>
                                            <textarea
                                                id="announcement-recipients"
                                                value={announcementData.recipients.join('\n')}
                                                onChange={(e) => setAnnouncementData({
                                                    ...announcementData,
                                                    recipients: e.target.value.split('\n').filter(email => email.trim())
                                                })}
                                                placeholder="student1@example.com&#10;student2@example.com"
                                                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                rows={4}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleSendGeneralAnnouncement}
                                            disabled={isLoading || !announcementData.title || !announcementData.message || announcementData.recipients.length === 0}
                                            className="w-full"
                                        >
                                            {isLoading ? (
                                                <RefreshCw size={16} className="mr-2 animate-spin" />
                                            ) : (
                                                <Send size={16} className="mr-2" />
                                            )}
                                            Send Announcement
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}
