export function AboutSection() {
    return (
        <section id="about" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Image */}
                    <div className="order-2 lg:order-1">
                        <img
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                            alt="Students learning"
                            className="rounded-lg shadow-xl w-full h-auto object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            About Saint Francis College
                        </h2>
                        <div className="space-y-4 text-gray-600">
                            <p className="text-lg leading-relaxed">
                                Saint Francis College is a premier educational institution committed to academic excellence and holistic student development. Founded on the values of <strong className="text-gray-900">faith, service, and scholarship</strong>, we provide quality education from elementary through college levels.
                            </p>
                            <p className="text-lg leading-relaxed">
                                Our comprehensive curriculum, dedicated faculty, and state-of-the-art facilities create an environment where students thrive academically, socially, and spiritually. We prepare our students not just for careers, but for lives of purpose and significance.
                            </p>
                            <div className="mt-6 p-6 bg-gray-50 rounded-lg border-l-4 border-gray-900">
                                <h3 className="font-semibold text-gray-900 mb-2">Our Mission</h3>
                                <p className="text-gray-700 italic">
                                    Rooted in the Gospel values, it provides a supportive and dynamic learning enviroment to improve the quality of life through excellence instructions, relevant research and responsive social, cultural, and spiritual engagement for tranformative and sustainable community.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
