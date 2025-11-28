import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Building, Heart, Briefcase, Church } from 'lucide-react';

const features = [
    {
        icon: Trophy,
        title: 'Academic Excellence',
        description: 'Rigorous curriculum designed to challenge and inspire students to reach their full potential and achieve academic success.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        icon: Users,
        title: 'Experienced Faculty',
        description: 'Highly qualified and dedicated educators committed to providing personalized attention and mentorship to every student.',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    {
        icon: Building,
        title: 'Modern Facilities',
        description: 'State-of-the-art campus with advanced learning resources, technology, and comfortable spaces for student growth.',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    {
        icon: Heart,
        title: 'Holistic Development',
        description: 'Focus on character formation, emotional intelligence, and social responsibility alongside academic achievement.',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
    },
    {
        icon: Briefcase,
        title: 'Career Preparation',
        description: 'Strong industry partnerships and career guidance programs preparing students for successful professional futures.',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
    },
    {
        icon: Church,
        title: 'Values-Based Education',
        description: 'Grounded in faith, service, and scholarship, fostering spiritual growth and ethical leadership in all students.',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
    },
];

export function WhyChooseUsSection() {
    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Why Choose Saint Francis College?
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Discover what makes us a leading educational institution dedicated to excellence, innovation, and student success.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card key={index} className="transition-all hover:shadow-lg">
                                <CardHeader>
                                    <div className={`w-14 h-14 rounded-full ${feature.bgColor} flex items-center justify-center mb-4`}>
                                        <Icon className={`h-7 w-7 ${feature.color}`} />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">{feature.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
