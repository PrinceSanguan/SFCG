import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { RotateCcw, Eye, EyeOff } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface PasswordResetModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    errors?: Record<string, string>;
    routeName: string;
}

export default function PasswordResetModal({ user, isOpen, onClose, errors, routeName }: PasswordResetModalProps) {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(route(routeName, user.id), {
            password,
            password_confirmation: passwordConfirmation,
        }, {
            onSuccess: () => {
                onClose();
                setPassword('');
                setPasswordConfirmation('');
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleClose = () => {
        setPassword('');
        setPasswordConfirmation('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5" />
                        Reset Password
                    </DialogTitle>
                    <DialogDescription>
                        Set a new password for <strong>{user.name}</strong> ({user.email})
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password *</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="pr-10"
                                required
                                minLength={8}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {errors?.password && (
                            <Alert variant="destructive">
                                <AlertDescription>{errors.password}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirm New Password *</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showPasswordConfirmation ? 'text' : 'password'}
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                placeholder="Confirm new password"
                                className="pr-10"
                                required
                                minLength={8}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            >
                                {showPasswordConfirmation ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Password Requirements:</strong>
                        </p>
                        <ul className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                            <li>• At least 8 characters long</li>
                            <li>• Both passwords must match</li>
                        </ul>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || !password || !passwordConfirmation}
                            className="flex items-center gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
