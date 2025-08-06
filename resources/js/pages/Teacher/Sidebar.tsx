import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard']);
    const isMobile = useIsMobile();
    const { url } = usePage();

    // Keep sections expanded when navigating
    useEffect(() => {
        // Auto-expand sections based on current URL
        const currentSections: string[] = [];
        
        if (url.startsWith('/teacher/profile')) {
            currentSections.push('account');
        }
        if (url.startsWith('/teacher/grades')) {
            currentSections.push('grades');
        }
        if (url.startsWith('/teacher/grading')) {
            currentSections.push('grading');
        }
        if (url.startsWith('/teacher/honors')) {
            currentSections.push('honors');
        }

        // Merge with existing expanded sections to keep user's manual expansions
        setExpandedSections(prev => {
            const merged = [...new Set([...prev, ...currentSections])];
            return merged;
        });
    }, [url]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => 
            prev.includes(section) 
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const isSectionActive = (section: string) => {
        return expandedSections.includes(section);
    };

    const isLinkActive = (href: string) => {
        return url === href;
    };

    const handleLinkClick = () => {
        // Only close sidebar on mobile, keep it open on desktop
        if (isMobile) {
            onClose();
        }
        // Don't collapse sections when clicking links
    };

    const menuItems = [
        {
            name: 'Dashboard',
            href: '/teacher/dashboard',
            icon: '📊',
            section: 'dashboard'
        },
        {
            name: 'Account',
            icon: '👤',
            section: 'account',
            items: [
                { name: 'View/Edit own information', href: '/teacher/profile', icon: '👤' }
            ]
        },
        {
            name: 'Grade Management',
            icon: '📝',
            section: 'grades',
            items: [
                { name: 'Input grades', href: '/teacher/grades', icon: '✏️' },
                { name: 'Edit submitted grades', href: '/teacher/grades/edit', icon: '🔄' },
                { name: 'Submit grades for validation', href: '/teacher/grades/submit', icon: '📤' },
                { name: 'Upload student grades via CSV', href: '/teacher/grades/upload', icon: '📁' }
            ]
        },
        {
            name: 'Grading Management',
            icon: '📊',
            section: 'grading',
            items: [
                { name: 'Grading Overview', href: '/teacher/grading', icon: '📈' },
                { name: 'Elementary Grading', href: '/teacher/grading/elementary', icon: '🧒' },
                { name: 'Junior High Grading', href: '/teacher/grading/junior-high', icon: '📚' },
                { name: 'Senior High Grading', href: '/teacher/grading/senior-high', icon: '🎓' }
            ]
        },
        {
            name: 'Honor Tracking',
            icon: '🏆',
            section: 'honors',
            items: [
                { name: 'View honor results of students', href: '/teacher/honors', icon: '👀' }
            ]
        }
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isMobile && isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Teacher Panel</h2>
                    {isMobile && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <div key={item.section}>
                            {item.items ? (
                                // Section with sub-items
                                <div>
                                    <button
                                        onClick={() => toggleSection(item.section)}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                                            isSectionActive(item.section)
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">{item.icon}</span>
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <svg
                                            className={`h-5 w-5 transition-transform ${
                                                isSectionActive(item.section) ? 'rotate-180' : ''
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {isSectionActive(item.section) && (
                                        <div className="mt-2 ml-4 space-y-1">
                                            {item.items.map((subItem) => (
                                                <Link
                                                    key={subItem.href}
                                                    href={subItem.href}
                                                    onClick={handleLinkClick}
                                                    className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                                                        isLinkActive(subItem.href)
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span className="mr-3">{subItem.icon}</span>
                                                    {subItem.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Single item
                                <Link
                                    href={item.href!}
                                    onClick={handleLinkClick}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                                        isLinkActive(item.href!)
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4">
                    <div className="text-xs text-gray-500 text-center">
                        Teacher Portal v1.0.0
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar; 