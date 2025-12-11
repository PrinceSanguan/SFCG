import { Head } from '@inertiajs/react';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { DepartmentsSection } from '@/components/landing/DepartmentsSection';
import { WhyChooseUsSection } from '@/components/landing/WhyChooseUsSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { CampusFacilitiesSection } from '@/components/landing/CampusFacilitiesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { FacultySection } from '@/components/landing/FacultySection';
import { StudentLifeSection } from '@/components/landing/StudentLifeSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { AdmissionsSection } from '@/components/landing/AdmissionsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export default function Landing() {
    return (
        <>
            <Head title="Welcome to Saint Francis College" />
            <div className="min-h-screen">
                <Navbar />
                <HeroSection />
                <FeaturesSection />
                <DepartmentsSection />
                <WhyChooseUsSection />
                <AboutSection />
                <CampusFacilitiesSection />
                <StatsSection />
                <FacultySection />
                <StudentLifeSection />
                <TestimonialsSection />
                <AdmissionsSection />
                <CTASection />
                <Footer />
            </div>
        </>
    );
}
