import React from 'react';

interface ResponsiveCardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'sm' | 'md' | 'lg';
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({ 
    children, 
    className = '', 
    padding = 'md' 
}) => {
    const paddingClasses = {
        sm: 'p-3 sm:p-4',
        md: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8'
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${paddingClasses[padding]} ${className}`}>
            {children}
        </div>
    );
};

export default ResponsiveCard; 