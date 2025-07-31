import React from 'react';

interface ResponsiveTableProps {
    children: React.ReactNode;
    className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ children, className = '' }) => {
    return (
        <div className={`overflow-x-auto -mx-4 sm:mx-0 ${className}`}>
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ResponsiveTable; 