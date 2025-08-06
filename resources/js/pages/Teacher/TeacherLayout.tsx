import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface TeacherLayoutProps {
    children: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isMobile = useIsMobile();
    const { auth } = usePage().props as any;

    const onMenuToggle = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const onClose = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header onMenuToggle={onMenuToggle} isSidebarOpen={isSidebarOpen} />
            <div className="flex">
                <Sidebar isOpen={isSidebarOpen} onClose={onClose} />
                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TeacherLayout; 