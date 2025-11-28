import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* School Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/image/logo.jpg" alt="Saint Francis College Logo" className="h-10 w-10 object-contain rounded-full" />
                            <span className="text-xl font-bold">Saint Francis College</span>
                        </div>
                        <p className="text-gray-400 mb-4">
                            Empowering Minds, Shaping Futures
                        </p>
                        <p className="text-sm text-gray-400">
                            Committed to academic excellence and holistic student development since 1975.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#about" className="text-gray-400 hover:text-white transition-colors">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="#programs" className="text-gray-400 hover:text-white transition-colors">
                                    Academic Programs
                                </a>
                            </li>
                            <li>
                                <Link href={route('auth.login')} className="text-gray-400 hover:text-white transition-colors">
                                    Student Portal
                                </Link>
                            </li>
                            <li>
                                <Link href={route('auth.login')} className="text-gray-400 hover:text-white transition-colors">
                                    Faculty Portal
                                </Link>
                            </li>
                            <li>
                                <a href="#contact" className="text-gray-400 hover:text-white transition-colors">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div id="contact">
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-2">
                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-400">
                                    Guiuan, Eastern Samar, Philippines
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-400">+63 123 456 7890</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-400">info@saintfranciscollege.edu.ph</span>
                            </li>
                        </ul>

                        <div>
                            <h4 className="text-sm font-semibold mb-3">Follow Us</h4>
                            <div className="flex gap-3">
                                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <Facebook className="h-4 w-4" />
                                </a>
                                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <Twitter className="h-4 w-4" />
                                </a>
                                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <Instagram className="h-4 w-4" />
                                </a>
                                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <Linkedin className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; 2025 Saint Francis College. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
