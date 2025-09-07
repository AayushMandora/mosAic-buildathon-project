import React, { useState, useEffect } from 'react';

const SpeechBubble = ({ text, isVisible, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [showBubble, setShowBubble] = useState(false);

    useEffect(() => {
        if (isVisible && text) {
            setShowBubble(true);
            setIsAnimating(true);
            setDisplayedText('');

            // Animate text appearance
            let currentIndex = 0;
            const interval = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayedText(text.slice(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    clearInterval(interval);
                    // Wait a bit before calling onComplete
                    setTimeout(() => {
                        setIsAnimating(false);
                        if (onComplete) onComplete();
                    }, 1500);
                }
            }, 25); // Adjust speed as needed

            return () => clearInterval(interval);
        } else {
            setShowBubble(false);
            setDisplayedText('');
            setIsAnimating(false);
        }
    }, [isVisible, text, onComplete]);

    if (!showBubble) return null;

    return (
        <div className="flex justify-start mb-4 animate-fadeIn">
            <div className="relative">
                {/* Speech bubble with enhanced styling */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 rounded-2xl rounded-bl-sm px-5 py-4 max-w-xs lg:max-w-md shadow-xl border border-blue-200 transform transition-all duration-300 hover:shadow-2xl">
                    {/* Animated dots indicator */}
                    <div className="flex items-center space-x-2 mb-3">
                        <div className="flex space-x-1">
                            <div className={`w-2 h-2 bg-blue-500 rounded-full ${isAnimating ? 'animate-bounce' : 'opacity-50'}`} style={{ animationDelay: '0s' }}></div>
                            <div className={`w-2 h-2 bg-blue-500 rounded-full ${isAnimating ? 'animate-bounce' : 'opacity-50'}`} style={{ animationDelay: '0.1s' }}></div>
                            <div className={`w-2 h-2 bg-blue-500 rounded-full ${isAnimating ? 'animate-bounce' : 'opacity-50'}`} style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-blue-600 font-semibold ml-2 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                            </svg>
                            AI Speaking...
                        </span>
                    </div>

                    {/* Text content with better typography */}
                    <p className="text-sm break-words leading-relaxed font-medium">
                        {displayedText}
                        {isAnimating && <span className="animate-pulse text-blue-500">|</span>}
                    </p>
                </div>

                {/* Enhanced speech bubble tail */}
                <div className="absolute -left-3 top-6 w-0 h-0 border-t-10 border-b-10 border-r-10 border-t-transparent border-b-transparent border-r-blue-100"></div>
            </div>
        </div>
    );
};

export default SpeechBubble;
