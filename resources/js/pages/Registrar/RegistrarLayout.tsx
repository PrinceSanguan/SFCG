import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/pages/Registrar/Header';
import Sidebar from '@/pages/Registrar/Sidebar';

interface RegistrarLayoutProps {
    children: React.ReactNode;
}

const RegistrarLayout: React.FC<RegistrarLayoutProps> = ({ children }) => {
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
            <Sidebar 
                isOpen={!isMobile || isSidebarOpen}
                onClose={handleSidebarClose}
            />
            <div className="flex flex-1 flex-col min-w-0">
                <Header onMenuToggle={handleMenuToggle} isSidebarOpen={isSidebarOpen} />
                <main className="flex-1 p-4 sm:p-6 overflow-auto">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RegistrarLayout; 