import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
    onMenuToggle: () => void;
    isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const isMobile = useIsMobile();
    const { auth } = usePage().props as any;

    const handleLogout = () => {
        setShowLogoutConfirm(false);
        setShowUserMenu(false);
        router.get(route('auth.logout'));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            setShowLogoutConfirm(true);
        }
    };

    // Close user menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showUserMenu) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showUserMenu]);

    // Close logout modal when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showLogoutConfirm) {
                setShowLogoutConfirm(false);
            }
        };

        if (showLogoutConfirm) {
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [showLogoutConfirm]);

    // Close modal on escape key
    React.useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showLogoutConfirm) {
                setShowLogoutConfirm(false);
            }
        };

        if (showLogoutConfirm) {
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [showLogoutConfirm]);

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Left side */}
                    <div className="flex items-center">
                        {isMobile && (
                            <button
                                onClick={onMenuToggle}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            >
                                <span className="sr-only">Open sidebar</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}
                        
                        <div className="ml-4 flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">Class Adviser Dashboard</h1>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-4">
                        {/* User menu */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowUserMenu(!showUserMenu);
                                }}
                                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white text-sm font-medium">
                                    {auth?.user?.name?.charAt(0)?.toUpperCase() || 'C'}
                                </div>
                                <div className="hidden md:block text-left">
                                    <div className="text-sm font-medium text-gray-900">{auth?.user?.name || 'Class Adviser'}</div>
                                    <div className="text-xs text-gray-500">{auth?.user?.email || 'adviser@school.com'}</div>
                                </div>
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                    <a
                                        href="/class-adviser/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        👤 Profile
                                    </a>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowLogoutConfirm(true);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout confirmation modal */}
            {showLogoutConfirm && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    <div 
                        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Logout</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyboard shortcuts */}
            <div onKeyDown={handleKeyDown} tabIndex={-1} className="sr-only">
                Press Ctrl+L to logout
            </div>
        </header>
    );
};

export default Header; 