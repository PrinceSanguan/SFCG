import React, { useState } from 'react';

const Header: React.FC = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                {/* Left side - Title */}
                <div className="flex items-center space-x-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500">Administrative Control Panel</p>
                    </div>
                </div>

                {/* Right side - User info */}
                <div className="flex items-center space-x-4">
                    {/* User Menu */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                                A
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-gray-900">Admin User</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                            <span className="text-gray-400">▼</span>
                        </button>

                        {/* User Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                                            A
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Admin User</p>
                                            <p className="text-xs text-gray-500">admin@school.edu</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <button className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                                        🚪 Sign Out
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
        </header>
    );
};

export default Header;
