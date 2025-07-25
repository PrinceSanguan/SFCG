import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-lg font-semibold text-gray-900">Instructor Dashboard</h1>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="p-2 text-gray-400 transition-colors hover:text-gray-600">🔔</button>

                    <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">👤</div>
                        <span className="text-sm font-medium text-gray-700">Instructor User</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
