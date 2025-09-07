import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FaMicrophone } from "react-icons/fa6";
import { FaStopCircle } from "react-icons/fa";

const VoiceRecorder = ({ onRecordingComplete, onError, disabled = false }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isSupported, setIsSupported] = useState(false);
    const [transcript, setTranscript] = useState('');
    const speechRecognitionRef = useRef(null);
    const timerRef = useRef(null);

    // Check for browser support
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);

        if (SpeechRecognition) {
            speechRecognitionRef.current = new SpeechRecognition();
            speechRecognitionRef.current.continuous = false;
            speechRecognitionRef.current.interimResults = true; // Show interim results
            speechRecognitionRef.current.lang = 'en-US';
            speechRecognitionRef.current.maxAlternatives = 1;
        }
    }, []);

    const startTimer = useCallback(() => {
        timerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setRecordingTime(0);
    }, []);

    const startRecording = async () => {
        if (!isSupported) {
            if (onError) onError(new Error('Speech Recognition not supported in this browser'));
            return;
        }

        try {
            // Reset transcript
            setTranscript('');

            // Set up speech recognition event handlers
            speechRecognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                // Process all results
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Update transcript state for real-time display
                setTranscript(finalTranscript || interimTranscript);

                // If we have a final result, process it
                if (finalTranscript) {
                    console.log('Final Speech Recognition Result:', finalTranscript);

                    // Create a mock audio blob for compatibility with existing API
                    const audioBlob = new Blob(['mock-audio-data'], { type: 'audio/webm' });
                    onRecordingComplete(audioBlob, finalTranscript);

                    setIsRecording(false);
                    stopTimer();
                    setTranscript('');
                }
            };

            speechRecognitionRef.current.onerror = (event) => {
                console.error('Speech Recognition Error:', event.error);
                if (onError) onError(new Error(`Speech recognition error: ${event.error}`));
                setIsRecording(false);
                stopTimer();
                setTranscript('');
            };

            speechRecognitionRef.current.onend = () => {
                setIsRecording(false);
                stopTimer();
                setTranscript('');
            };

            speechRecognitionRef.current.onstart = () => {
                console.log('Speech recognition started');
            };

            // Start speech recognition
            speechRecognitionRef.current.start();
            setIsRecording(true);
            startTimer();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            if (onError) onError(error);
        }
    };

    const stopRecording = () => {
        if (speechRecognitionRef.current && isRecording) {
            speechRecognitionRef.current.stop();
            setIsRecording(false);
            stopTimer();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isSupported) {
        return (
            <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="text-xs text-red-500 text-center">
                    Voice not supported
                </div>
                <div className="text-xs text-gray-500 text-center">
                    Use Chrome or Edge
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center space-y-2">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={isRecording ? 'Stop recording' : 'Start recording'}
            >
                {isRecording ? (
                    <FaStopCircle className='text-red-600' />
                ) : (
                    <FaMicrophone />
                )}
            </button>

            {isRecording && (
                <div className="text-sm text-red-500 font-medium">
                    Listening: {formatTime(recordingTime)}
                </div>
            )}

            {transcript && (
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded max-w-xs text-center">
                    "{transcript}"
                </div>
            )}

            {!isRecording && recordingTime === 0 && !transcript && (
                <div className="text-xs text-gray-500">
                    Click to speak
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;

