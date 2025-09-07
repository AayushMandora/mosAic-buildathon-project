import React, { useState } from 'react';
import { FaMicrophone } from "react-icons/fa6";
import VoiceRecorder from './VoiceRecorder';
import LoadingSpinner from './LoadingSpinner';

const InputBar = ({ onSendMessage, onVoiceRecording, isProcessing = false, isVoiceMode, setIsVoiceMode }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !isProcessing) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleVoiceRecording = (audioBlob, finalTranscript) => {
        if (onVoiceRecording) {
            onVoiceRecording(audioBlob, finalTranscript);
            setMessage(finalTranscript);
        }
        setIsVoiceMode(false);
    };

    const handleVoiceError = (error) => {
        console.error('Voice recording error:', error);
        setIsVoiceMode(false);
    };

    return (
        <div className="bg-gray-950 border-t border-gray-800 p-4">
            <div className="flex items-center space-x-3">
                {/* Voice/Text Mode Toggle */}
                <button
                    onClick={() => setIsVoiceMode(!isVoiceMode)}
                    disabled={isProcessing}
                    className={`p-2 rounded-lg transition-colors ${isVoiceMode
                        ? 'bg-blue-900/40 text-blue-300'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={isVoiceMode ? 'Switch to text input' : 'Switch to voice input'}
                >
                    {isVoiceMode ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <FaMicrophone />
                    )}
                </button>

                {isVoiceMode ? (
                    <div className="flex-1 flex justify-center">
                        <VoiceRecorder
                            onRecordingComplete={handleVoiceRecording}
                            onError={handleVoiceError}
                            disabled={isProcessing}
                        />
                    </div>
                ) : (
                    <>
                        {/* Text Input */}
                        <form onSubmit={handleSubmit} className="flex-1 flex space-x-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                disabled={isProcessing}
                                className="flex-1 px-4 py-2 border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || isProcessing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isProcessing ? (
                                    <LoadingSpinner size="sm" text="" />
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default InputBar;
