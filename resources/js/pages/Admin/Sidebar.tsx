import { router, Link, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

interface MenuItem {
    name: string;
    href: string;
    icon: string;
}

interface MenuSection {
    name: string;
    key: string;
    icon: string;
    href?: string;
    items: MenuItem[];
}

const Sidebar: React.FC = () => {
    const { url } = usePage();
    const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard']);

    const handleLogout = () => {
        router.visit(route('auth.logout'));
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => 
            prev.includes(section) 
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const isActive = (href: string) => {
        return url === href;
    };

    const isSectionActive = (items: MenuItem[]) => {
        return items.some(item => isActive(item.href));
    };

    const menuSections: MenuSection[] = [
        {
            name: 'Dashboard',
            key: 'dashboard',
            icon: '📊',
            href: '/admin/dashboard',
            items: []
        },
        {
            name: 'User Management',
            key: 'users',
            icon: '👥',
            items: [
                { name: 'Instructors', href: '/admin/users/instructors', icon: '👨‍🏫' },
                { name: 'Teachers', href: '/admin/users/teachers', icon: '👩‍🏫' },
                { name: 'Class Advisers', href: '/admin/users/advisers', icon: '👨‍💼' },
                { name: 'Chairpersons', href: '/admin/users/chairpersons', icon: '👔' },
                { name: 'Principals', href: '/admin/users/principals', icon: '🎓' },
                { name: 'Students', href: '/admin/users/students', icon: '👨‍🎓' },
                { name: 'Parents', href: '/admin/users/parents', icon: '👪' },
                { name: 'Upload CSV', href: '/admin/users/upload', icon: '📤' }
            ]
        },
        {
            name: 'Academic Setup',
            key: 'academic',
            icon: '🏫',
            items: [
                { name: 'Levels', href: '/admin/academic/levels', icon: '📈' },
                { name: 'Periods', href: '/admin/academic/periods', icon: '📅' },
                { name: 'Strands', href: '/admin/academic/strands', icon: '🔗' },
                { name: 'Subjects', href: '/admin/academic/subjects', icon: '📚' }
            ]
        },
        {
            name: 'Assignments',
            key: 'assignments',
            icon: '📝',
            items: [
                { name: 'Assign Instructors', href: '/admin/assignments/instructors', icon: '👨‍🏫' },
                { name: 'Assign Advisers', href: '/admin/assignments/advisers', icon: '👨‍💼' }
            ]
        },
        {
            name: 'Grading',
            key: 'grading',
            icon: '📊',
            href: '/admin/grading',
            items: []
        },
        {
            name: 'Honors & Certificates',
            key: 'honors',
            icon: '🏆',
            items: [
                { name: 'Configure Honors', href: '/admin/honors', icon: '🥇' },
                { name: 'Certificates', href: '/admin/certificates', icon: '📜' }
            ]
        },
        {
            name: 'Gmail Notifications',
            key: 'notifications',
            icon: '📧',
            href: '/admin/notifications',
            items: []
        },
        {
            name: 'Reports',
            key: 'reports',
            icon: '📈',
            items: [
                { name: 'Generate Reports', href: '/admin/reports', icon: '📊' },
                { name: 'Export Data', href: '/admin/reports/export', icon: '💾' }
            ]
        },
        {
            name: 'System Logs',
            key: 'system',
            icon: '📝',
            items: [
                { name: 'Audit Logs', href: '/admin/system/logs', icon: '📋' },
                { name: 'Backups', href: '/admin/system/backup', icon: '💾' },
                { name: 'Restore', href: '/admin/system/restore', icon: '🔄' }
            ]
        }
    ];

    return (
        <div className="flex w-72 flex-col border-r border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                    {menuSections.map((section) => (
                        <li key={section.key}>
                            {section.items.length === 0 && section.href ? (
                                <Link 
                                    href={section.href} 
                                    className={`flex items-center rounded-lg px-4 py-2 transition-colors ${
                                        isActive(section.href)
                                            ? 'bg-blue-100 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="mr-3 text-lg">{section.icon}</span>
                                    <span className="font-medium">{section.name}</span>
                                </Link>
                            ) : (
                                <>
                                    <button
                                        onClick={() => toggleSection(section.key)}
                                        className={`flex w-full items-center justify-between rounded-lg px-4 py-2 transition-colors ${
                                            isSectionActive(section.items)
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3 text-lg">{section.icon}</span>
                                            <span className="font-medium">{section.name}</span>
                                        </div>
                                        <span className={`transform transition-transform ${expandedSections.includes(section.key) ? 'rotate-90' : ''}`}>
                                            ▶
                                        </span>
                                    </button>
                                    {expandedSections.includes(section.key) && (
                                        <ul className="ml-6 mt-1 space-y-1">
                                            {section.items.map((item) => (
                                                <li key={item.name}>
                                                    <Link
                                                        href={item.href}
                                                        className={`flex items-center rounded-lg px-4 py-2 text-sm transition-colors ${
                                                            isActive(item.href)
                                                                ? 'bg-blue-100 text-blue-700 font-medium'
                                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        <span className="mr-2">{item.icon}</span>
                                                        {item.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="border-t border-gray-200 p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
                >
                    <span className="mr-3">🚪</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
