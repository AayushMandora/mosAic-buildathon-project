import React from 'react';

const ChatMessage = ({ message, isUser, timestamp }) => {
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isUser
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-gray-200 text-gray-800 rounded-bl-sm'
                    }`}
            >
                <p className="text-sm break-words">{message}</p>
                {timestamp && (
                    <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(timestamp).toLocaleTimeString()}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;

