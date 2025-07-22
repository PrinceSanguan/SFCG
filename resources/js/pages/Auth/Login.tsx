import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState, useRef } from 'react';
import { route } from 'ziggy-js';
import gsap from 'gsap';

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
        gsap.fromTo(
            cardRef.current,
            { y: 80, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
        );
        gsap.fromTo(
            logoRef.current,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1, delay: 0.5, ease: 'back.out(1.7)' }
        );
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
                className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-2 py-8 sm:px-6 lg:px-8"
                style={{
                    backgroundImage: `url('/images/school_picture.jpg')`,
                }}
            >
                <div className="absolute inset-0 bg-black/40 z-0" aria-hidden="true"></div>
                <div
                    ref={cardRef}
                    className="relative z-10 w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col items-center animate-fadeIn"
                    style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
                >
                    <img
                        ref={logoRef}
                        src="/images/logo.jpg"
                        alt="School Logo"
                        className="w-24 h-24 object-contain rounded-full shadow-lg mb-6 border-4 border-white bg-white mx-auto"
                        style={{ background: 'white' }}
                    />
                    <h1 className="mb-2 text-3xl font-extrabold text-gray-800 text-center tracking-tight">Welcome to School Portal</h1>
                    <p className="mb-6 text-gray-500 text-center text-base">Sign in to access your school dashboard and resources.</p>
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
                    <form onSubmit={handleSubmit} className="space-y-4 w-full">
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
                        <Button type="submit" className="mt-4 w-full font-semibold text-lg py-2" disabled={processing}>
                            {processing ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                    <div className="relative my-6 w-full">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t"></div>
                        </div>
                        <div className="relative flex justify-center text-sm uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full flex items-center justify-center"
                        onClick={() => {
                            window.location.href = route('auth.google');
                        }}
                    >
                        <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                            <path fill="#4285F4" d="M24 9.5c3.54 0 6.52 1.28 8.96 3.36l6.64-6.64C34.82 2.02 29.7 0 24 0 14.32 0 6.06 5.74 2.21 13.97l7.81 6.07C12.12 13.34 17.56 9.5 24 9.5z" />
                            <path fill="#34A853" d="M46.04 24.5c0-1.47-.13-2.88-.37-4.25H24v8.5h12.54c-.56 2.87-2.07 5.32-4.26 7.05l6.7 6.7c4.31-3.98 6.77-9.79 6.77-16z" />
                            <path fill="#FBBC05" d="M10.26 28.65c-.64-1.91-1-3.95-1-6.05s.36-4.14 1-6.05l-7.81-6.07C.79 13.17 0 18.44 0 24c0 5.56.79 10.83 2.21 15.52l8.05-6.18z" />
                            <path fill="#EA4335" d="M24 48c5.7 0 10.82-2.02 14.7-5.45l-6.7-6.7c-1.96 1.31-4.42 2.07-7 2.07-6.44 0-11.88-3.84-14.04-9.35l-8.05 6.18C6.06 42.26 14.32 48 24 48z" />
                        </svg>
                        Continue with Google
                    </Button>
                    <p className="mt-4 text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <a href={route('auth.register')} className="text-blue-500 hover:underline">
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}
