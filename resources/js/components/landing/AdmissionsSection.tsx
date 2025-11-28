import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { FileText, ClipboardCheck, MessageCircle, CheckCircle, UserPlus } from 'lucide-react';

const steps = [
    {
        icon: FileText,
        number: '1',
        title: 'Submit Application',
        description: 'Complete the online application form with required documents and information.',
    },
    {
        icon: ClipboardCheck,
        number: '2',
        title: 'Take Entrance Exam',
        description: 'Participate in our assessment to evaluate academic readiness and aptitude.',
    },
    {
        icon: MessageCircle,
        number: '3',
        title: 'Attend Interview',
        description: 'Meet with our admissions team and faculty to discuss your goals and interests.',
    },
    {
        icon: CheckCircle,
        number: '4',
        title: 'Receive Decision',
        description: 'Get notified of your admission status and available scholarship opportunities.',
    },
    {
        icon: UserPlus,
        number: '5',
        title: 'Enroll',
        description: 'Complete enrollment procedures and join the Saint Francis College community.',
    },
];

export function AdmissionsSection() {
    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Image */}
                    <div className="order-2 lg:order-1">
                        <img
                            src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80"
                            alt="Students in orientation"
                            className="rounded-lg shadow-xl w-full h-auto object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Admissions Process
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Begin your journey at Saint Francis College. Follow these simple steps to join our community of learners.
                        </p>

                        <div className="space-y-4">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                                {step.number}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Icon className="h-5 w-5 text-blue-600" />
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-gray-600 text-sm">{step.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8">
                            <Button asChild size="lg" className="w-full sm:w-auto">
                                <Link href={route('auth.register')}>Apply Now</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
