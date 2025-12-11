import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
    {
        quote: 'Saint Francis College Guihulngan Negros Oriental Incorported has given me the knowledge, skills, and confidence to excel in my field. The supportive environment and dedicated faculty have prepared me to face challenges and succeed in the Computer Studies Department and beyond.',
        name: 'Winmar Faburada',
        program: 'Computer Studies Department',
        image: 'https://scontent.fcgy2-1.fna.fbcdn.net/v/t39.30808-1/584910974_2100743110760288_5763316252169786558_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=102&ccb=1-7&_nc_sid=e99d92&_nc_ohc=W7vHoeedVbcQ7kNvwHzS9o3&_nc_oc=AdkvX2pBCIfnlCLhME8BmBDURy9UWpWVr7mJqK5tjCYlWnXR5F15d-HC5_8G9QzRR_A&_nc_zt=24&_nc_ht=scontent.fcgy2-1.fna&_nc_gid=DdwtHtyspj3tS1Ld8eO4uw&oh=00_AflRuQPejD_WgR4e1jEtbQ-lPwQJfjM8QU5iZEiQTg4Hrg&oe=69403118',
    },
    {
        quote: 'Saint Francis College Guihulngan Negros Oriental Incorporated has equipped me with the knowledge, skills, and values to lead and make a positive impact. The guidance of our faculty and the opportunities I experienced have prepared me to take on challenges both in college and beyond.',
        name: 'Hansel Ylaya Cañete - CSSG President',
        program: 'College of Computer Studies',
        image: 'https://scontent.fcgy2-3.fna.fbcdn.net/v/t39.30808-6/489942411_2469002040108046_4781716731586529701_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=WpQjNhUTP80Q7kNvwGn3EJf&_nc_oc=AdkUHlwZfMoH_9uvP1GFValHjN-r5ZDwPsXF0LoBSlnugLd5oP8mtZv3B9w3CUsIKiI&_nc_zt=23&_nc_ht=scontent.fcgy2-3.fna&_nc_gid=HBG16nUKUjLYwrf1DxmP4Q&oh=00_AfkO3L55yJ2HeeZwBKHkFrX8IZYB83szQyAKs2mKL9WZlg&oe=69404AF4',
    },
    {
        quote: 'Saint Francis College Guihulngan Negros Oriental Incorporated has provided me with the knowledge, skills, and confidence to grow academically and professionally. The support of the faculty and the opportunities I received have prepared me to take on challenges and achieve success in the College of Computer Studies and beyond.',
        name: 'Jemcel Aniñon',
        program: 'College of Computer Studies',
        image: 'https://scontent.fcgy2-2.fna.fbcdn.net/v/t39.30808-6/488908979_978257617798620_8938796533389388616_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=PvsAmz-EFQgQ7kNvwFLeIJ0&_nc_oc=AdmsPcuviDrAS0TX7QvYMl8FaohUDxqtrAAMmymXGSlWn1R4H5a_vdEQNIdbqEVuuos&_nc_zt=23&_nc_ht=scontent.fcgy2-2.fna&_nc_gid=67vFMpun4l-5ZWkHjhMCEw&oh=00_Afnin6kLcfqh0jRUe5ledGf5R6xkyu5jX-VQ_EqG9xn96A&oe=694052EF',
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
