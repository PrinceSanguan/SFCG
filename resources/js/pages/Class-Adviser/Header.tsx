import React from 'react';
import { Link, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    user_role: string;
    unread_notifications_count?: number;
}

interface Props {
    user: User;
}

const Header: React.FC<Props> = ({ user }) => {
    const { url } = usePage();

    const handleLogout = () => {
        router.get('/logout');
    };

    const navigationLinks = [
        { name: 'Dashboard', href: '/class-adviser/dashboard', icon: '🏠' },
        { name: 'My Students', href: '/class-adviser/students', icon: '👥' },
        { name: 'Grades Management', href: '/class-adviser/grades', icon: '📊' },
        { name: 'Honor Roll', href: '/class-adviser/honors', icon: '🏆' },
        { name: 'Reports', href: '/class-adviser/reports', icon: '📈' },
    ];

    const isActive = (href: string) => url.startsWith(href);

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left section - Logo and Navigation */}
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg font-bold text-sm">
                                CA
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900">Class Adviser Portal</h1>
                        </div>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex space-x-6">
                            {navigationLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive(link.href)
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <span>{link.icon}</span>
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right section - Notifications and User menu */}
                    <div className="flex items-center space-x-4">
                        {/* Quick Actions */}
                        <div className="hidden lg:flex items-center space-x-3">
                            <Link
                                href="/class-adviser/grades/input"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <span className="mr-2">📝</span>
                                Input Grades
                            </Link>
                        </div>

                        {/* Notifications */}
                        <Link
                            href="/class-adviser/notifications"
                            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <span className="text-xl">🔔</span>
                            {user.unread_notifications_count && user.unread_notifications_count > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                    {user.unread_notifications_count > 99 ? '99+' : user.unread_notifications_count}
                                </span>
                            )}
                        </Link>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <div className="flex items-center space-x-3">
                                {/* User Avatar */}
                                <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full font-medium text-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                
                                {/* User Info */}
                                <div className="hidden lg:block">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">Class Adviser</div>
                                </div>

                                {/* Dropdown Menu */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={() => {
                                            // Toggle dropdown menu - in a real app, you'd use state management
                                            const dropdown = document.getElementById('user-dropdown');
                                            if (dropdown) {
                                                dropdown.classList.toggle('hidden');
                                            }
                                        }}
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        <span className="text-sm">▼</span>
                                    </button>

                                    {/* Dropdown menu */}
                                    <div
                                        id="user-dropdown"
                                        className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                                    >
                                        <div className="py-1">
                                            <Link
                                                href="/class-adviser/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                👤 Profile Settings
                                            </Link>
                                            <Link
                                                href="/class-adviser/my-class"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                👥 My Class
                                            </Link>
                                            <Link
                                                href="/class-adviser/schedule"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                📅 Schedule
                                            </Link>
                                            <div className="border-t border-gray-100"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                🚪 Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            type="button"
                            className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                            onClick={() => {
                                const mobileMenu = document.getElementById('mobile-menu');
                                if (mobileMenu) {
                                    mobileMenu.classList.toggle('hidden');
                                }
                            }}
                        >
                            <span className="sr-only">Open mobile menu</span>
                            <span className="text-xl">☰</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div id="mobile-menu" className="hidden lg:hidden border-t border-gray-200 pt-4 pb-3">
                    <div className="space-y-1">
                        {navigationLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center space-x-3 px-4 py-2 text-base font-medium transition-colors ${
                                    isActive(link.href)
                                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <span>{link.icon}</span>
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <Link
                            href="/class-adviser/grades/input"
                            className="flex items-center space-x-3 px-4 py-2 text-base font-medium text-blue-600 hover:text-blue-800"
                        >
                            <span>📝</span>
                            <span>Input Grades</span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
