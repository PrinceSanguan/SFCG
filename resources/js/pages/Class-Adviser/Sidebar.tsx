import { router } from '@inertiajs/react';
import React from 'react';

const Sidebar: React.FC = () => {
    const handleLogout = () => {
        router.visit(route('auth.logout'));
    };

    const menuItems = [{ name: 'Dashboard', href: '/class-adviser/dashboard', icon: '📊' }];

    return (
        <div className="flex w-64 flex-col border-r border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900">Class Adviser Panel</h2>
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <a href={item.href} className="flex items-center rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100">
                                <span className="mr-3">{item.icon}</span>
                                {item.name}
                            </a>
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
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
