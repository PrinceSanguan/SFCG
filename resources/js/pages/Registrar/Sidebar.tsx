import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
    const { url } = usePage();
    const [expandedSections, setExpandedSections] = useState<string[]>(['academic']);
    const isMobile = useIsMobile();

    const isActive = (href: string) => url.startsWith(href);

    // Auto-close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.sidebar-dropdown')) {
                setExpandedSections(prev => prev.filter(key => key === 'academic'));
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleSection = (sectionKey: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setExpandedSections(prev => 
            prev.includes(sectionKey) 
                ? prev.filter(key => key !== sectionKey)
                : [...prev, sectionKey]
        );
    };

    const isSectionActive = (submenu: Array<{href: string}>) => {
        return submenu.some(item => isActive(item.href));
    };

    const handleLinkClick = () => {
        if (isMobile && onClose) {
            onClose();
        }
    };

    const menuItems = [
        {
            title: 'Dashboard',
            href: '/registrar/dashboard',
            icon: '🏠',
            key: 'dashboard'
        },
        {
            title: 'User Management',
            icon: '👥',
            key: 'users',
            submenu: [
                { title: 'Instructors', href: '/registrar/users/instructors', icon: '👨‍🏫' },
                { title: 'Teachers', href: '/registrar/users/teachers', icon: '👩‍🏫' },
                { title: 'Advisers', href: '/registrar/users/advisers', icon: '🧑‍🏫' },
                { title: 'Chairpersons', href: '/registrar/users/chairpersons', icon: '👔' },
                { title: 'Principals', href: '/registrar/users/principals', icon: '🏫' },
                { title: 'Students', href: '/registrar/students', icon: '👨‍🎓' },
                { title: 'Parents', href: '/registrar/parents', icon: '👨‍👩‍👧' },
                { title: 'Upload CSV', href: '/registrar/users/upload', icon: '📤' }
            ]
        },
        {
            title: 'Academic Setup',
            icon: '🏫',
            key: 'academic',
            submenu: [
                { title: 'Academic Levels', href: '/registrar/academic/levels', icon: '📊' },
                { title: 'Academic Periods', href: '/registrar/academic/periods', icon: '📅' },
                { title: 'Academic Strands', href: '/registrar/academic/strands', icon: '🎯' },
                { title: 'Course Programs', href: '/registrar/academic/college-courses', icon: '🎓' },
                { title: 'Higher Education Subjects', href: '/registrar/academic/college-subjects', icon: '📖' },
                { title: 'All Subjects', href: '/registrar/academic/subjects', icon: '📚' }
            ]
        },
        {
            title: 'Assignments',
            icon: '📋',
            key: 'assignments',
            submenu: [
                { title: 'Assign Teachers (SHS)', href: '/registrar/assignments/teachers', icon: '👩‍🏫' },
                { title: 'Assign Instructors (College)', href: '/registrar/assignments/instructors', icon: '👨‍🏫' },
                { title: 'Adviser Assignments', href: '/registrar/assignments/advisers', icon: '🧑‍🏫' }
            ]
        },
        {
            title: 'Honors & Certificates',
            icon: '🏆',
            key: 'honors',
            submenu: [
                { title: 'Honors Management', href: '/registrar/honors', icon: '🏆' },
                { title: 'Honor Roll', href: '/registrar/honors/roll', icon: '📋' },
                { title: 'Honor Criteria', href: '/registrar/honors/criteria', icon: '📊' },
                { title: 'Certificates', href: '/registrar/certificates', icon: '📜' },
                { title: 'Certificate Templates', href: '/registrar/certificates/templates', icon: '📤' }
            ]
        },
        {
            title: 'Reports',
            href: '/registrar/reports',
            icon: '📊',
            key: 'reports'
        },
        {
            title: 'Profile',
            href: '/registrar/profile',
            icon: '👤',
            key: 'profile'
        }
    ];

    return (
        <>
            {/* Mobile backdrop */}
            {isMobile && isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}
            
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">R</span>
                            </div>
                            <span className="ml-2 text-lg font-semibold text-gray-900">Registrar</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => (
                            <div key={item.key}>
                                {item.submenu ? (
                                    <div className="sidebar-dropdown">
                                        <button
                                            onClick={(e) => toggleSection(item.key, e)}
                                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                                isSectionActive(item.submenu)
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <span className="mr-3 text-lg">{item.icon}</span>
                                                {item.title}
                                            </div>
                                            <span className={`transform transition-transform ${expandedSections.includes(item.key) ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        </button>
                                        
                                        {expandedSections.includes(item.key) && (
                                            <div className="ml-6 mt-1 space-y-1">
                                                {item.submenu.map((subItem) => (
                                                    <Link
                                                        key={subItem.href}
                                                        href={subItem.href}
                                                        onClick={handleLinkClick}
                                                        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                                                            isActive(subItem.href)
                                                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        <span className="mr-3 text-base">{subItem.icon}</span>
                                                        {subItem.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href!}
                                        onClick={handleLinkClick}
                                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                            isActive(item.href!)
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <span className="mr-3 text-lg">{item.icon}</span>
                                        {item.title}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="text-xs text-gray-500 text-center">
                            Registrar Portal v1.0
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
