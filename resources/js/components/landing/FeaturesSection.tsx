import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, School, Award } from 'lucide-react';

const features = [
    {
        icon: BookOpen,
        title: 'Elementary Education',
        level: 'Grades 1-6',
        description: 'Building strong foundations for lifelong learning with a comprehensive curriculum that nurtures young minds.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        icon: GraduationCap,
        title: 'Junior High School',
        level: 'Grades 7-10',
        description: 'Developing critical thinking and academic excellence through innovative teaching methods and engaging programs.',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    {
        icon: School,
        title: 'Senior High School',
        level: 'Grades 11-12',
        description: 'Specialized tracks preparing students for college and career success with industry-relevant skills.',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
    },
    {
        icon: Award,
        title: 'College Programs',
        level: "Bachelor's Degrees",
        description: 'Industry-relevant education for tomorrow\'s leaders with comprehensive programs and expert faculty.',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
];

export function FeaturesSection() {
    return (
        <section id="programs" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Academic Programs
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Comprehensive education from elementary through college, designed to develop well-rounded individuals ready to make a difference.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card key={index} className="transition-transform hover:scale-105 hover:shadow-lg">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-full ${feature.bgColor} flex items-center justify-center mb-4`}>
                                        <Icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    <CardDescription className="text-sm font-semibold text-gray-700">
                                        {feature.level}
                                    </CardDescription>
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
