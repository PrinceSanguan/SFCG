import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import gsap from 'gsap';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';

interface LoginProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Login({ flash }: LoginProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const [authError, setAuthError] = useState<string | null>(null);
    const [flashMessage, setFlashMessage] = useState<{
        type: 'success' | 'error' | null;
        message: string | null;
    }>({ type: null, message: null });

    const cardRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        gsap.fromTo(cardRef.current, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
        gsap.fromTo(logoRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, delay: 0.5, ease: 'back.out(1.7)' });
    }, []);

    // Check for flash messages
    useEffect(() => {
        if (flash?.success) {
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
            <Head title="School Login" />
            <div
                className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-2 py-8 sm:px-6 lg:px-8"
                style={{
                    backgroundImage: `url('/images/school_picture.jpg')`,
                }}
            >
                <div className="absolute inset-0 z-0 bg-black/40" aria-hidden="true"></div>
                <div
                    ref={cardRef}
                    className="animate-fadeIn relative z-10 mx-auto flex w-full max-w-md flex-col items-center rounded-3xl bg-white p-8 shadow-2xl sm:p-10"
                    style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
                >
                    <img
                        ref={logoRef}
                        src="/images/logo.jpg"
                        alt="School Logo"
                        className="mx-auto mb-6 h-24 w-24 rounded-full border-4 border-white bg-white object-contain shadow-lg"
                        style={{ background: 'white' }}
                    />
                    <h1 className="mb-2 text-center text-3xl font-extrabold tracking-tight text-gray-800">Welcome to School Portal</h1>
                    <p className="mb-6 text-center text-base text-gray-500">Sign in to access your school dashboard and resources.</p>
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
                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="yourname@email.com"
                                className="w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                        </div>
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
                        <Button type="submit" className="mt-4 w-full py-2 text-lg font-semibold" disabled={processing}>
                            {processing ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}
