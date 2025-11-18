import { Header } from '@/components/registrar/header';
import { Sidebar } from '@/components/registrar/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Key } from 'lucide-react';
import { useState } from 'react';
import PasswordResetModal from '@/components/registrar/PasswordResetModal';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    birth_date?: string;
    gender?: string;
    phone_number?: string;
    address?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
}

interface UsersEditProps {
    user: any;
    targetUser: User;
    roles: any;
}

// Helper function to format date for HTML date input (YYYY-MM-DD)
const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function UsersEdit({ user, targetUser, roles }: UsersEditProps) {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        name: targetUser.name,
        birth_date: formatDateForInput(targetUser.birth_date),
        gender: targetUser.gender || '',
        phone_number: targetUser.phone_number || '',
        address: targetUser.address || '',
        emergency_contact_name: targetUser.emergency_contact_name || '',
        emergency_contact_phone: targetUser.emergency_contact_phone || '',
        emergency_contact_relationship: targetUser.emergency_contact_relationship || '',
    });

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'default';
            case 'registrar':
            case 'teacher':
            case 'instructor':
            case 'adviser':
            case 'chairperson':
            case 'principal':
                return 'secondary';
            case 'student':
            case 'parent':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('registrar.users.update', targetUser.id));
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} />
            
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header user={user} />
                
                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
                    <div className="mx-auto max-w-4xl space-y-6">
                        {/* Back Button */}
                        <div className="flex items-center gap-4">
                            <Link href={route('registrar.users.show', targetUser.id)}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to User
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Edit User
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Update information for {targetUser.name}
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>User Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter user name"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <div className="p-3 bg-gray-50 rounded border dark:bg-gray-800">
                                            {targetUser.email}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Email addresses cannot be changed for security reasons.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <div className="p-3 bg-gray-50 rounded border dark:bg-gray-800 flex items-center gap-2">
                                            <Badge variant={getRoleBadgeVariant(targetUser.user_role)}>
                                                {roles[targetUser.user_role] || targetUser.user_role}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            User roles cannot be changed after account creation.
                                        </p>
                                    </div>

                                    {/* Personal Information Section */}
                                    {targetUser.user_role === 'student' && (
                                        <div className="space-y-4 pt-4 border-t">
                                            <h3 className="text-lg font-semibold">Personal Information</h3>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                {/* Birth Date */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="birth_date">Birth Date</Label>
                                                    <Input
                                                        id="birth_date"
                                                        type="date"
                                                        value={data.birth_date}
                                                        onChange={(e) => setData('birth_date', e.target.value)}
                                                    />
                                                    {errors.birth_date && (
                                                        <p className="text-sm text-red-600">{errors.birth_date}</p>
                                                    )}
                                                </div>

                                                {/* Gender */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="gender">Gender</Label>
                                                    <Select
                                                        value={data.gender}
                                                        onValueChange={(value) => setData('gender', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select gender" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="female">Female</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.gender && (
                                                        <p className="text-sm text-red-600">{errors.gender}</p>
                                                    )}
                                                </div>

                                                {/* Phone Number */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone_number">Phone Number</Label>
                                                    <Input
                                                        id="phone_number"
                                                        type="tel"
                                                        value={data.phone_number}
                                                        onChange={(e) => setData('phone_number', e.target.value)}
                                                        placeholder="Enter phone number"
                                                    />
                                                    {errors.phone_number && (
                                                        <p className="text-sm text-red-600">{errors.phone_number}</p>
                                                    )}
                                                </div>

                                                {/* Address */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="address">Address</Label>
                                                    <Input
                                                        id="address"
                                                        value={data.address}
                                                        onChange={(e) => setData('address', e.target.value)}
                                                        placeholder="Enter address"
                                                    />
                                                    {errors.address && (
                                                        <p className="text-sm text-red-600">{errors.address}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4">
                                                <h4 className="font-medium">Emergency Contact</h4>
                                                <div className="grid gap-4 md:grid-cols-3">
                                                    {/* Emergency Contact Name */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="emergency_contact_name">Contact Name</Label>
                                                        <Input
                                                            id="emergency_contact_name"
                                                            value={data.emergency_contact_name}
                                                            onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                                            placeholder="Enter contact name"
                                                        />
                                                        {errors.emergency_contact_name && (
                                                            <p className="text-sm text-red-600">{errors.emergency_contact_name}</p>
                                                        )}
                                                    </div>

                                                    {/* Emergency Contact Phone */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                                                        <Input
                                                            id="emergency_contact_phone"
                                                            type="tel"
                                                            value={data.emergency_contact_phone}
                                                            onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                                            placeholder="Enter contact phone"
                                                        />
                                                        {errors.emergency_contact_phone && (
                                                            <p className="text-sm text-red-600">{errors.emergency_contact_phone}</p>
                                                        )}
                                                    </div>

                                                    {/* Emergency Contact Relationship */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                                                        <Input
                                                            id="emergency_contact_relationship"
                                                            value={data.emergency_contact_relationship}
                                                            onChange={(e) => setData('emergency_contact_relationship', e.target.value)}
                                                            placeholder="e.g., Mother, Father"
                                                        />
                                                        {errors.emergency_contact_relationship && (
                                                            <p className="text-sm text-red-600">{errors.emergency_contact_relationship}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowPasswordModal(true)}
                                        >
                                            <Key className="h-4 w-4 mr-2" />
                                            Change Password
                                        </Button>
                                        <Link href={route('registrar.users.show', targetUser.id)}>
                                            <Button type="button" variant="outline">
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Password Reset Modal */}
            <PasswordResetModal
                user={targetUser}
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                routeName="registrar.users.reset-password"
            />
        </div>
    );
}
