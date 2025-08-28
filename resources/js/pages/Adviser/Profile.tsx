import { Header } from '@/components/adviser/header';
import { Sidebar } from '@/components/adviser/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { User, Lock, Save, Key } from 'lucide-react';

interface UserType { id: number; name: string; email: string; user_role: string }
export default function AdviserProfile({ user }: { user: UserType }) {
  const { data, setData, put, processing, errors } = useForm({ name: user.name || '', email: user.email || '' });
  const { data: pwd, setData: setPwd, put: putPwd, processing: processingPwd, errors: pwdErrors, reset } = useForm({ current_password: '', password: '', password_confirmation: '' });

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2"><h1 className="text-2xl font-bold">My Profile</h1></div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile Information</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={(e)=>{e.preventDefault(); put(route('adviser.profile.update'));}} className="space-y-4">
                    <div><Label htmlFor="name">Full Name</Label><Input id="name" value={data.name} onChange={(e)=>setData('name', e.target.value)} className={errors.name ? 'border-red-500' : ''} />{errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}</div>
                    <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={data.email} onChange={(e)=>setData('email', e.target.value)} className={errors.email ? 'border-red-500' : ''} />{errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}</div>
                    <div><Label htmlFor="role">Role</Label><Input id="role" value={user.user_role} disabled className="bg-gray-100 dark:bg-gray-800" /></div>
                    <Button type="submit" disabled={processing} className="w-full"><Save className="h-4 w-4 mr-2" />{processing ? 'Updating...' : 'Update Profile'}</Button>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Change Password</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={(e)=>{e.preventDefault(); putPwd(route('adviser.profile.password'), { onSuccess: ()=>reset() });}} className="space-y-4">
                    <div><Label htmlFor="current_password">Current Password</Label><Input id="current_password" type="password" value={pwd.current_password} onChange={(e)=>setPwd('current_password', e.target.value)} className={pwdErrors.current_password ? 'border-red-500' : ''} /></div>
                    <div><Label htmlFor="password">New Password</Label><Input id="password" type="password" value={pwd.password} onChange={(e)=>setPwd('password', e.target.value)} className={pwdErrors.password ? 'border-red-500' : ''} /></div>
                    <div><Label htmlFor="password_confirmation">Confirm New Password</Label><Input id="password_confirmation" type="password" value={pwd.password_confirmation} onChange={(e)=>setPwd('password_confirmation', e.target.value)} className={pwdErrors.password_confirmation ? 'border-red-500' : ''} /></div>
                    <Button type="submit" disabled={processingPwd} className="w-full"><Key className="h-4 w-4 mr-2" />{processingPwd ? 'Changing...' : 'Change Password'}</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


