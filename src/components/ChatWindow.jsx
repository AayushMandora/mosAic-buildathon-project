import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import AudioPlayer from './AudioPlayer';
import InputBar from './InputBar';
import LoadingSpinner from './LoadingSpinner';
import SpeechBubble from './SpeechBubble';
import { speechToText, sendToBot, textToSpeech } from '../services/api';

const ChatWindow = ({ userId: routeUserId }) => {
    const [messages, setMessages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [speechBubble, setSpeechBubble] = useState({ isVisible: false, text: '' });
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Cleanup audio when component unmounts
    useEffect(() => {
        return () => {
            setCurrentAudio(null);
        };
    }, []);

    const addMessage = (text, isUser, timestamp = new Date()) => {
        const newMessage = {
            id: Date.now() + Math.random(),
            text,
            isUser,
            timestamp,
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const handleSendMessage = async (messageText) => {
        if (!messageText.trim() || isProcessing) return;

        // Add user message
        addMessage(messageText, true);
        setIsProcessing(true);

        try {
            // Send to bot
            const effectiveUserId = routeUserId || JSON.parse(localStorage.getItem('user') || '{}').id;
            const botResponse = await sendToBot(messageText, effectiveUserId);
            const botText = botResponse.answer || botResponse.message || 'Sorry, I could not process your request.';

            // Add bot message
            addMessage(botText, false);

            // Convert to speech
            // try {
            //     const audioBlob = await textToSpeech(botText);
            //     setCurrentAudio(audioBlob);
            // } catch (ttsError) {
            //     console.error('TTS Error:', ttsError);
            //     // Continue without audio if TTS fails
            // }
        } catch (error) {
            console.error('Bot API Error:', error);
            addMessage('Sorry, I encountered an error processing your request. Please try again.', false);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVoiceRecording = async (audioBlob, transcript = null) => {
        if (isProcessing) return;

        setIsProcessing(true);

        try {
            let transcribedText = '';

            if (transcript) {
                // Use transcript from Web Speech API
                transcribedText = transcript;
            } else {
                // Fallback to STT API if no transcript provided
                const sttResponse = await speechToText(audioBlob);
                transcribedText = sttResponse.transcript || sttResponse.text || '';
            }

            if (transcribedText.trim()) {
                // Add user message with transcribed text
                addMessage(transcribedText, true);

                // Send to bot
                const effectiveUserId = routeUserId || JSON.parse(localStorage.getItem('user') || '{}').id;
                const botResponse = await sendToBot(transcribedText, effectiveUserId);
                const botText = botResponse.answer || botResponse.message || 'Sorry, I could not process your request.';

                // Show speech bubble with animated text

                // Convert to speech
                try {
                    const audioBlob = await textToSpeech(botText);
                    setCurrentAudio(audioBlob);
                    setSpeechBubble({ isVisible: true, text: botText });
                } catch (ttsError) {
                    console.error('TTS Error:', ttsError);
                    // Continue without audio if TTS fails
                }
            } else {
                addMessage('Sorry, I could not understand what you said. Please try again.', false);
            }
        } catch (error) {
            console.error('Voice processing error:', error);
            addMessage('Sorry, I encountered an error processing your voice message. Please try again.', false);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAudioEnded = () => {
        setCurrentAudio(null);
        handleSpeechBubbleComplete();
    };

    const handleAudioError = (error) => {
        // Only log non-abort errors to avoid spam
        if (error.name !== 'AbortError') {
            console.error('Audio playback error:', error);
        }
        setCurrentAudio(null);
    };

    const handleSpeechBubbleComplete = () => {
        // Convert speech bubble to regular chat message
        if (speechBubble.text) {
            addMessage(speechBubble.text, false);
        }
        setSpeechBubble({ isVisible: false, text: '' });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
            {/* Header */}
            <div className="bg-gray-950 border-b border-gray-800 p-4">
                <h1 className="text-xl font-semibold text-gray-100 text-center">
                    AI Customer Support Voice Bot
                </h1>
                <p className="text-sm text-gray-400 text-center mt-1">
                    Ask questions using voice or text
                </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <svg className="w-16 h-16 mb-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L3 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-lg font-medium">Welcome to AI Support</p>
                        <p className="text-sm">Start a conversation by typing a message or using voice</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <ChatMessage
                            key={message.id}
                            message={message.text}
                            isUser={message.isUser}
                            timestamp={message.timestamp}
                        />
                    ))
                )}

                {/* Speech Bubble for voice responses */}
                <SpeechBubble
                    text={speechBubble.text}
                    isVisible={speechBubble.isVisible}
                // onComplete={handleSpeechBubbleComplete}
                />

                {/* Processing indicator */}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 text-gray-100 rounded-lg rounded-bl-sm px-4 py-2 max-w-xs">
                            <LoadingSpinner size="sm" text="AI is thinking..." />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Audio Player */}
            {currentAudio && (
                <div className="bg-gray-950 border-t border-gray-800 p-4">
                    {/* <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-600">AI Response Audio:</span>
                    </div> */}
                    <AudioPlayer
                        audioBlob={currentAudio}
                        onEnded={handleAudioEnded}
                        onError={handleAudioError}
                    />
                </div>
            )}

            {/* Input Area */}
            <InputBar
                onSendMessage={handleSendMessage}
                onVoiceRecording={handleVoiceRecording}
                isProcessing={isProcessing}
                isVoiceMode={isVoiceMode}
                setIsVoiceMode={setIsVoiceMode}
            />
        </div>
    );
};

export default ChatWindow;
