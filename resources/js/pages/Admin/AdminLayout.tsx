import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from './Header';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isMobile = useIsMobile();

    const handleMenuToggle = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleSidebarClose = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar 
                isOpen={!isMobile || isSidebarOpen} 
                onClose={handleSidebarClose}
            />
            
            {/* Main Content */}
            <div className="flex flex-1 flex-col min-w-0">
                <Header 
                    onMenuToggle={handleMenuToggle}
                    isSidebarOpen={isSidebarOpen}
                />
                <main className="flex-1 p-4 sm:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout; 