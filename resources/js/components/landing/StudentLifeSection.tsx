import { Users, Trophy, Music, Heart } from 'lucide-react';

const activities = [
    {
        icon: Users,
        title: 'Student Organizations',
        description: 'Join clubs and organizations aligned with your interests and passions.',
    },
    {
        icon: Trophy,
        title: 'Sports & Athletics',
        description: 'Compete in various sports teams and develop teamwork skills.',
    },
    {
        icon: Music,
        title: 'Cultural Events',
        description: 'Participate in performances, festivals, and cultural celebrations.',
    },
    {
        icon: Heart,
        title: 'Community Service',
        description: 'Make a difference through outreach programs and volunteer work.',
    },
];

export function StudentLifeSection() {
    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Image */}
                    <div className="order-2 lg:order-1">
                        <img
                            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80"
                            alt="Students in activities"
                            className="rounded-lg shadow-xl w-full h-auto object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Vibrant Student Life
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Beyond academics, Saint Francis College offers a rich campus life with diverse opportunities for personal growth, leadership, and fun.
                        </p>

                        <div className="space-y-6">
                            {activities.map((activity, index) => {
                                const Icon = activity.icon;
                                return (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Icon className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {activity.title}
                                            </h3>
                                            <p className="text-gray-600">{activity.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
