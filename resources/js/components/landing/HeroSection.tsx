import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';
import { ChevronDown } from 'lucide-react';

export function HeroSection() {
    return (
        <div
            className="relative min-h-screen flex items-center justify-center"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Content */}
            <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                    Saint Francis College
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-8 max-w-3xl mx-auto">
                    Empowering Minds, Shaping Futures
                </p>
                <Button asChild size="lg" className="text-lg px-8 py-6 h-auto bg-white text-gray-900 hover:bg-white/90">
                    <Link href={route('auth.login')}>Access Portal</Link>
                </Button>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <ChevronDown className="h-8 w-8 text-white/70" />
                </div>
            </div>
        </div>
    );
}
