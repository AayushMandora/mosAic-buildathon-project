import React, { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';

const VoiceTest = () => {
    const [messages, setMessages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleVoiceRecording = async (audioBlob, transcript) => {
        console.log('Voice recording completed:', { audioBlob, transcript });

        setIsProcessing(true);

        // Simulate processing
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: `You said: "${transcript}"`,
                isUser: true,
                timestamp: new Date()
            }]);

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: `I heard: "${transcript}". This is a test response!`,
                isUser: false,
                timestamp: new Date()
            }]);

            setIsProcessing(false);
        }, 1000);
    };

    const handleError = (error) => {
        console.error('Voice recording error:', error);
        setMessages(prev => [...prev, {
            id: Date.now(),
            text: `Error: ${error.message}`,
            isUser: false,
            timestamp: new Date()
        }]);
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Voice Test</h2>

            {/* Messages */}
            <div className="mb-4 h-64 overflow-y-auto border rounded p-2">
                {messages.length === 0 ? (
                    <p className="text-gray-500 text-center">No messages yet. Try speaking!</p>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className={`mb-2 p-2 rounded ${message.isUser
                            ? 'bg-blue-100 ml-8'
                            : 'bg-gray-100 mr-8'
                            }`}>
                            <p className="text-sm">{message.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                    ))
                )}

                {isProcessing && (
                    <div className="text-center text-blue-500">
                        Processing...
                    </div>
                )}
            </div>

            {/* Voice Recorder */}
            <div className="flex justify-center">
                <VoiceRecorder
                    onRecordingComplete={handleVoiceRecording}
                    onError={handleError}
                    disabled={isProcessing}
                />
            </div>

            {/* Instructions */}
            <div className="mt-4 text-xs text-gray-600 text-center">
                <p>Click the microphone and speak clearly</p>
                <p>Works best in Chrome or Edge browsers</p>
            </div>
        </div>
    );
};

export default VoiceTest;
