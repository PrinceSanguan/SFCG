import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
    onMenuToggle?: () => void;
    isSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarOpen = false }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const isMobile = useIsMobile();
    
    // Get authenticated user data
    const pageProps = usePage().props as { auth?: { user?: { name?: string; email?: string } } };
    const user = pageProps?.auth?.user;

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'l') {
                event.preventDefault();
                setShowLogoutConfirm(true);
            }
            if (event.key === 'Escape' && showLogoutConfirm) {
                setShowLogoutConfirm(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showLogoutConfirm]);

    return (
        <header className="border-b border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
            <div className="flex items-center justify-between">
                {/* Left side - Mobile menu button and title */}
                <div className="flex items-center space-x-3 sm:space-x-4">
                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <button
                            onClick={onMenuToggle}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isSidebarOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    )}
                    
                    {/* Title */}
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                            Registrar Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                            Registrar Control Panel • Press Ctrl+L to sign out
                        </p>
                        <p className="text-xs text-gray-500 sm:hidden">
                            Registrar Panel
                        </p>
                    </div>
                </div>

                {/* Right side - User info */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Quick Logout Button - Hidden on mobile */}
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="hidden sm:flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Sign Out (Ctrl+L)"
                    >
                        🚪 Sign Out
                    </button>
                    
                    {/* Mobile Logout Button */}
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="sm:hidden p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Sign Out"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                    
                    {/* User Menu */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-sm">
                                {user?.name?.charAt(0)?.toUpperCase() || 'R'}
                            </div>
                            <div className="hidden sm:block text-left min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.name || 'Registrar User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email || 'Registrar'}
                                </p>
                            </div>
                            <span className="text-gray-400 hidden sm:block">▼</span>
                        </button>

                        {/* User Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'R'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {user?.name || 'Registrar User'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {user?.email || 'registrar@school.edu'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <a 
                                        href="/registrar/profile"
                                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                    >
                                        ⚙️ Settings
                                    </a>
                                    <button 
                                        onClick={() => setShowLogoutConfirm(true)}
                                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                        🚪 Sign Out
                                        <span className="ml-auto text-xs text-gray-400 hidden sm:inline">Ctrl+L</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Close dropdown when clicking outside */}
            {showUserMenu && (
                <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowUserMenu(false)}
                ></div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowLogoutConfirm(false)}></div>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm z-10">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                    <span className="text-red-600 text-lg">🚪</span>
                                </div>
                            </div>
                            <div className="ml-3 min-w-0 flex-1">
                                <h3 className="text-lg font-medium text-gray-900">Sign Out</h3>
                                <p className="text-sm text-gray-500">Are you sure you want to sign out?</p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowLogoutConfirm(false);
                                    router.get('/logout');
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
