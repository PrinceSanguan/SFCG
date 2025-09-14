import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface LoginProps {
    flash?: {
        success?: string;
        error?: string;
        maintenance?: string;
    };
    maintenanceMode?: boolean;
}

export default function Login({ flash, maintenanceMode }: LoginProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const [authError, setAuthError] = useState<string | null>(null);
    const [flashMessage, setFlashMessage] = useState<{
        type: 'success' | 'error' | null;
        message: string | null;
    }>({ type: null, message: null });

    // Check for flash messages
    useEffect(() => {
        if (flash?.maintenance) {
            setFlashMessage({
                type: 'error',
                message: flash.maintenance,
            });
        } else if (flash?.success) {
            setFlashMessage({
                type: 'success',
                message: flash.success,
            });
        } else if (flash?.error) {
            setFlashMessage({
                type: 'error',
                message: flash.error,
            });
        } else {
            setFlashMessage({ type: null, message: null });
        }
    }, [flash]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        setFlashMessage({ type: null, message: null });

        post(route('auth.login.store'), {
            onError: (errors) => {
                // If we received an authentication error from the backend
                if (errors.auth) {
                    setAuthError(errors.auth);
                }
            },
        });
    };

    return (
        <>
            <Head title="Login" />
            <div 
                className="flex min-h-screen items-center justify-center p-6"
                style={{
                    backgroundImage: "url('/image/background.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <Card className="w-full max-w-sm rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="mb-6 text-center">
                            <img 
                                src="/image/logo.jpg" 
                                alt="Logo" 
                                className="mx-auto mb-4 h-20 w-20 object-contain"
                            />
                            <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
                        </div>

                        {/* Maintenance Mode Banner */}
                        {maintenanceMode && (
                            <div className="mb-6 p-4 border-2 border-red-500 bg-red-100 rounded-lg shadow-lg">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-red-800 mb-2">
                                        ⚠️ SYSTEM UNDER MAINTENANCE ⚠️
                                    </div>
                                    <div className="text-sm text-red-700">
                                        The system is currently under maintenance.<br />
                                        Only admin accounts can access the system.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Show flash messages */}
                        {flashMessage.message && (
                            <Alert variant={flashMessage.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                                <AlertDescription>{flashMessage.message}</AlertDescription>
                            </Alert>
                        )}

                        {/* Show authentication error if any */}
                        {authError && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{authError}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    className="w-full"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" className="mt-4 w-full" disabled={processing}>
                                {processing ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
