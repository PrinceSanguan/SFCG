import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

const Header: React.FC = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    // Get authenticated user data
    const pageProps = usePage().props as any;
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
        <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                {/* Left side - Title */}
                <div className="flex items-center space-x-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500">Administrative Control Panel • Press Ctrl+L to sign out</p>
                    </div>
                </div>

                {/* Right side - User info */}
                <div className="flex items-center space-x-4">
                    {/* Quick Logout Button */}
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="hidden sm:flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Sign Out (Ctrl+L)"
                    >
                        🚪 Sign Out
                    </button>
                    
                    {/* User Menu */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                                <p className="text-xs text-gray-500">{user?.email || 'Administrator'}</p>
                            </div>
                            <span className="text-gray-400">▼</span>
                        </button>

                        {/* User Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                                            <p className="text-xs text-gray-500">{user?.email || 'admin@school.edu'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <a 
                                        href="/admin/settings"
                                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                    >
                                        ⚙️ Settings
                                    </a>
                                    <button 
                                        onClick={() => setShowLogoutConfirm(true)}
                                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                        🚪 Sign Out
                                        <span className="ml-auto text-xs text-gray-400">Ctrl+L</span>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowLogoutConfirm(false)}></div>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96 z-10">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                    <span className="text-red-600 text-lg">🚪</span>
                                </div>
                            </div>
                            <div className="ml-3">
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
