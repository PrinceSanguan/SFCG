import { Users, Award, Calendar, BookOpen } from 'lucide-react';

const stats = [
    {
        icon: Users,
        value: '5,000+',
        label: 'Students Enrolled',
        color: 'text-blue-600',
    },
    {
        icon: Award,
        value: '300+',
        label: 'Dedicated Faculty',
        color: 'text-green-600',
    },
    {
        icon: Calendar,
        value: '50+',
        label: 'Years of Excellence',
        color: 'text-orange-600',
    },
    {
        icon: BookOpen,
        value: '20+',
        label: 'Degree Programs',
        color: 'text-purple-600',
    },
];

export function StatsSection() {
    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Our Impact
                    </h2>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Decades of excellence in education, shaping thousands of lives and contributing to society.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                                        <Icon className={`h-8 w-8 ${stat.color}`} />
                                    </div>
                                </div>
                                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                                <div className="text-gray-300 text-sm md:text-base">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
