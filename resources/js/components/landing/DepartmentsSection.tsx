import { Card, CardContent } from '@/components/ui/card';
import {
    GraduationCap,
    Briefcase,
    Users,
    BookOpen,
    Cpu,
    Heart,
    FlaskConical,
    Building2,
    Palette,
    Calculator
} from 'lucide-react';

const departments = [
    {
        name: 'College of Engineering',
        icon: Building2,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        name: 'College of Business Administration',
        icon: Briefcase,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    {
        name: 'College of Education',
        icon: GraduationCap,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    {
        name: 'College of Arts & Sciences',
        icon: Palette,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
    },
    {
        name: 'College of Computer Science',
        icon: Cpu,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
    },
    {
        name: 'College of Nursing',
        icon: Heart,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
    },
    {
        name: 'College of Science',
        icon: FlaskConical,
        color: 'text-teal-600',
        bgColor: 'bg-teal-100',
    },
    {
        name: 'College of Mathematics',
        icon: Calculator,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
    },
    {
        name: 'College of Social Sciences',
        icon: Users,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-100',
    },
    {
        name: 'College of Liberal Arts',
        icon: BookOpen,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
    },
];

export function DepartmentsSection() {
    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Here Are All Departments
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        test
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {departments.map((department, index) => {
                        const Icon = department.icon;
                        return (
                            <Card
                                key={index}
                                className="transition-all hover:shadow-lg hover:scale-105 cursor-pointer"
                            >
                                <CardContent className="p-6 flex flex-col items-center text-center">
                                    <div className={`w-16 h-16 rounded-full ${department.bgColor} flex items-center justify-center mb-4`}>
                                        <Icon className={`h-8 w-8 ${department.color}`} />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                                        {department.name}
                                    </h3>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
