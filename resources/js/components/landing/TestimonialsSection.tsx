import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
    {
        quote: 'Saint Francis College provided me with the foundation I needed to pursue my dreams. The supportive faculty and excellent programs prepared me for university and beyond.',
        name: 'Maria Isabel Torres',
        program: 'College - Business Administration',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    },
    {
        quote: 'The holistic education I received here shaped not just my academic skills but also my character. I learned the values of service and leadership that I carry today.',
        name: 'Carlos Miguel Reyes',
        program: 'Senior High School Graduate',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    },
    {
        quote: 'As a parent, I am impressed with how the school nurtures each student individually. My children have grown in confidence and capability under the care of dedicated teachers.',
        name: 'Sofia Angelica Cruz',
        program: 'Parent of Two Students',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    },
];

export function TestimonialsSection() {
    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        What Our Community Says
                    </h2>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Hear from students, parents, and alumni about their experiences at Saint Francis College.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="bg-white/10 border-white/20 text-white transition-all hover:bg-white/15">
                            <CardContent className="pt-6">
                                <Quote className="h-8 w-8 text-white/40 mb-4" />
                                <p className="text-white/90 mb-6 italic">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
                                    />
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-white/70">{testimonial.program}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
