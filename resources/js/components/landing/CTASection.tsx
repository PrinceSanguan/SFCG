import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

export function CTASection() {
    const scrollToAbout = () => {
        const aboutSection = document.getElementById('about');
        aboutSection?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section
            className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gray-900/80" />

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                    Ready to Join Saint Francis College?
                </h2>
                <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
                    Start your journey to excellence today and become part of our thriving community of learners.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-white/90 text-lg px-8 py-6 h-auto">
                        <Link href={route('auth.register')}>Apply Now</Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={scrollToAbout}
                        className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
                    >
                        Learn More
                    </Button>
                </div>
            </div>
        </section>
    );
}
