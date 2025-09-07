import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <div className="flex items-center justify-center space-x-2">
            <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-500`}></div>
            {text && <span className="text-sm text-gray-600">{text}</span>}
        </div>
    );
};

export default LoadingSpinner;
