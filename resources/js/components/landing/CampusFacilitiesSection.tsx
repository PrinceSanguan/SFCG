const facilities = [
    {
        name: 'Library',
        description: 'Extensive collection of books, digital resources, and quiet study spaces for research and learning.',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',
    },
    {
        name: 'Science Laboratories',
        description: 'Fully-equipped labs for physics, chemistry, and biology with modern instruments and safety features.',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80',
    },
    {
        name: 'Computer Labs',
        description: 'High-performance computers with latest software for programming, design, and digital learning.',
        image: 'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=600&q=80',
    },
    {
        name: 'Sports Complex',
        description: 'Multi-purpose courts, athletic fields, and fitness facilities promoting physical health and teamwork.',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
    },
    {
        name: 'Cafeteria',
        description: 'Clean, spacious dining area serving nutritious meals and snacks in a comfortable environment.',
        image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80',
    },
    {
        name: 'Auditorium',
        description: 'Modern venue for assemblies, performances, and events with professional audio-visual equipment.',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    },
];

export function CampusFacilitiesSection() {
    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Campus Facilities
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Explore our modern facilities designed to enhance learning and support student development.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facilities.map((facility, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-lg shadow-md transition-all hover:shadow-xl"
                        >
                            <div className="aspect-[4/3] overflow-hidden">
                                <img
                                    src={facility.image}
                                    alt={facility.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-xl font-bold text-white mb-2">{facility.name}</h3>
                                <p className="text-sm text-white/90 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    {facility.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
