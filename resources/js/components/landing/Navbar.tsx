import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils';

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                scrolled ? 'bg-white shadow-md' : 'bg-transparent'
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/image/logo.jpg" alt="Saint Francis College Logo" className="h-10 w-10 object-contain rounded-full" />
                        <span
                            className={cn(
                                'text-xl font-bold transition-colors hidden sm:block',
                                scrolled ? 'text-gray-900' : 'text-white'
                            )}
                        >
                            Saint Francis College Guihulngan Negros Oriental Incorporated
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <Button variant="outline" asChild className={scrolled ? '' : 'bg-white/10 border-white/30 text-white hover:bg-white/20'}>
                            <Link href={route('auth.login')}>Login</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={cn(
                            'md:hidden p-2 rounded-md transition-colors',
                            scrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                        )}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t">
                    <div className="px-4 py-4">
                        <Button variant="outline" asChild className="w-full">
                            <Link href={route('auth.login')}>Login</Link>
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
}
