import React from 'react';

interface ResponsiveGridProps {
    children: React.ReactNode;
    cols?: {
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
    children, 
    cols = { sm: 1, md: 2, lg: 3, xl: 4 },
    gap = 'md',
    className = ''
}) => {
    const gapClasses = {
        sm: 'gap-3',
        md: 'gap-4 sm:gap-6',
        lg: 'gap-6 sm:gap-8'
    };

    const gridCols = [
        `grid-cols-${cols.sm || 1}`,
        cols.md ? `md:grid-cols-${cols.md}` : '',
        cols.lg ? `lg:grid-cols-${cols.lg}` : '',
        cols.xl ? `xl:grid-cols-${cols.xl}` : ''
    ].filter(Boolean).join(' ');

    return (
        <div className={`grid ${gridCols} ${gapClasses[gap]} ${className}`}>
            {children}
        </div>
    );
};

export default ResponsiveGrid; 