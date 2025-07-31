import React, { useState } from 'react';
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

    const toggleSection = (sectionKey: string) => {
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
            href: '/admin/dashboard',
            icon: '🏠',
            key: 'dashboard'
        },
        {
            title: 'User Management',
            icon: '👥',
            key: 'users',
            submenu: [
                { title: 'Instructors', href: '/admin/users/instructors', icon: '👨‍🏫' },
                { title: 'Teachers', href: '/admin/users/teachers', icon: '👩‍🏫' },
                { title: 'Advisers', href: '/admin/users/advisers', icon: '🧑‍🏫' },
                { title: 'Chairpersons', href: '/admin/users/chairpersons', icon: '👔' },
                { title: 'Principals', href: '/admin/users/principals', icon: '🏫' },
                { title: 'Students', href: '/admin/users/students', icon: '👨‍🎓' },
                { title: 'Parents', href: '/admin/users/parents', icon: '👨‍👩‍👧' },
                { title: 'Upload CSV', href: '/admin/users/upload', icon: '📤' }
            ]
        },
        {
            title: 'Academic Setup',
            icon: '🏫',
            key: 'academic',
            submenu: [
                { title: 'Academic Levels', href: '/admin/academic/levels', icon: '📊' },
                { title: 'Academic Periods', href: '/admin/academic/periods', icon: '📅' },
                { title: 'Academic Strands', href: '/admin/academic/strands', icon: '🎯' },
                { title: 'Course Programs', href: '/admin/academic/college-courses', icon: '🎓' },
                { title: 'Higher Education Subjects', href: '/admin/academic/college-subjects', icon: '📖' },
                { title: 'All Subjects', href: '/admin/academic/subjects', icon: '📚' }
            ]
        },
        {
            title: 'Assignments',
            icon: '📋',
            key: 'assignments',
            submenu: [
                { title: 'Instructor Assignments', href: '/admin/assignments/instructors', icon: '👨‍🏫' },
                { title: 'Adviser Assignments', href: '/admin/assignments/advisers', icon: '🧑‍🏫' }
            ]
        },
        {
            title: 'Grading',
            href: '/admin/grading',
            icon: '📊',
            key: 'grading'
        },
        {
            title: 'Honors & Certificates',
            icon: '🏆',
            key: 'honors',
            submenu: [
                { title: 'Honors Management', href: '/admin/honors', icon: '🏆' },
                { title: 'Certificates', href: '/admin/certificates', icon: '📜' }
            ]
        },
        {
            title: 'Notifications',
            href: '/admin/notifications',
            icon: '📧',
            key: 'notifications'
        },
        {
            title: 'Reports',
            icon: '📈',
            key: 'reports',
            submenu: [
                { title: 'Generate Reports', href: '/admin/reports', icon: '📊' },
                { title: 'Export Data', href: '/admin/reports/export', icon: '📤' }
            ]
        },
        {
            title: 'System',
            icon: '⚙️',
            key: 'system',
            submenu: [
                { title: 'Audit Logs', href: '/admin/system/logs', icon: '📝' },
                { title: 'Backup', href: '/admin/system/backup', icon: '💾' },
                { title: 'Restore', href: '/admin/system/restore', icon: '🔄' }
            ]
        }
    ];

    const sidebarClasses = `
        ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
        w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen flex-shrink-0
        ${isMobile && !isOpen ? '-translate-x-full' : ''}
        transition-transform duration-300 ease-in-out
    `;

    return (
        <>
            {/* Mobile overlay */}
            {isMobile && isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                />
            )}
            
            <aside className={sidebarClasses}>
                <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg font-bold text-sm">
                            A
                        </div>
                        <span className="text-lg sm:text-xl font-semibold text-gray-900">Admin Panel</span>
                    </div>
                </div>
                
                <nav className="mt-5 px-2 pb-4 overflow-y-auto h-[calc(100vh-4rem)]">
                    <div className="space-y-1">
                        {menuItems.map((item, index) => (
                            <div key={index}>
                                {item.href ? (
                                    // Single menu item with direct link
                                    <Link
                                        href={item.href}
                                        onClick={handleLinkClick}
                                        className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                                            isActive(item.href)
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <span className="mr-3 text-base">{item.icon}</span>
                                        <span className="truncate">{item.title}</span>
                                    </Link>
                                ) : (
                                    // Menu item with collapsible submenu
                                    <div>
                                        <button
                                            onClick={() => toggleSection(item.key)}
                                            className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                                                isSectionActive(item.submenu || [])
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center min-w-0">
                                                <span className="mr-3 text-base">{item.icon}</span>
                                                <span className="truncate">{item.title}</span>
                                            </div>
                                            <svg
                                                className={`ml-2 h-4 w-4 flex-shrink-0 transform transition-transform ${
                                                    expandedSections.includes(item.key) ? 'rotate-90' : ''
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                        {expandedSections.includes(item.key) && (
                                            <div className="ml-6 space-y-1 mt-1">
                                                {item.submenu?.map((subItem, subIndex) => (
                                                    <Link
                                                        key={subIndex}
                                                        href={subItem.href}
                                                        onClick={handleLinkClick}
                                                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                            isActive(subItem.href)
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        <span className="mr-3 text-sm">{subItem.icon}</span>
                                                        <span className="truncate">{subItem.title}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
