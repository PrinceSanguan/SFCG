import { Card, CardContent } from '@/components/ui/card';

const faculty = [
    {
        name: 'Dr. Maria Santos',
        title: 'Dean of Academic Affairs',
        department: 'College Department',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
        bio: 'Ph.D. in Education with over 20 years of experience in curriculum development and academic leadership.',
    },
    {
        name: 'Prof. Juan Cruz',
        title: 'Head of Science Department',
        department: 'Science & Mathematics',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
        bio: 'Master of Science educator specializing in STEM education with numerous research publications.',
    },
    {
        name: 'Dr. Elena Rodriguez',
        title: 'Director of Student Development',
        department: 'Student Affairs',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
        bio: 'Doctorate in Psychology, passionate about holistic student development and mental health support.',
    },
];

export function FacultySection() {
    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Meet Our Faculty
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Our dedicated educators bring expertise, passion, and commitment to student success.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {faculty.map((member, index) => (
                        <Card key={index} className="text-center transition-all hover:shadow-lg">
                            <CardContent className="pt-6">
                                <div className="mb-4">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-32 h-32 rounded-full object-cover mx-auto ring-4 ring-gray-200"
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                                <p className="text-sm font-semibold text-gray-700 mb-1">{member.title}</p>
                                <p className="text-sm text-gray-500 mb-4">{member.department}</p>
                                <p className="text-sm text-gray-600">{member.bio}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
