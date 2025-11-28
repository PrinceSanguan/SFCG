import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

const newsEvents = [
    {
        title: 'Annual Science Fair 2025',
        date: 'March 15, 2025',
        excerpt: 'Students showcase innovative projects in science, technology, and engineering. Join us for a day of discovery and learning.',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
        category: 'Event',
    },
    {
        title: 'Academic Excellence Awards',
        date: 'February 28, 2025',
        excerpt: 'Celebrating outstanding student achievements in academics, leadership, and community service this school year.',
        image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80',
        category: 'News',
    },
    {
        title: 'Cultural Festival Week',
        date: 'April 5-12, 2025',
        excerpt: 'A week-long celebration of diversity featuring performances, exhibitions, and cultural exchanges from different communities.',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80',
        category: 'Event',
    },
];

export function NewsEventsSection() {
    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        News & Events
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Stay updated with the latest happenings and upcoming events at Saint Francis College.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {newsEvents.map((item, index) => (
                        <Card key={index} className="overflow-hidden transition-all hover:shadow-lg">
                            <div className="aspect-[16/9] overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                            </div>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary">{item.category}</Badge>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {item.date}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">{item.excerpt}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
