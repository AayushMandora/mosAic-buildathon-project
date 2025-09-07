import React, { useRef, useEffect } from 'react';

const AudioPlayer = ({ audioBlob, onEnded, onError }) => {
    const audioRef = useRef(null);
    const currentUrlRef = useRef(null);

    useEffect(() => {
        if (audioBlob && audioRef.current) {
            // Clean up previous audio URL
            if (currentUrlRef.current) {
                URL.revokeObjectURL(currentUrlRef.current);
            }

            // Pause and reset the audio element
            audioRef.current.pause();
            audioRef.current.currentTime = 0;

            const audioUrl = URL.createObjectURL(audioBlob);
            currentUrlRef.current = audioUrl;
            audioRef.current.src = audioUrl;

            // Load the new audio source
            audioRef.current.load();

            // Play the audio after it's loaded
            const playAudio = () => {
                audioRef.current.play().catch(error => {
                    // Only log non-abort errors to avoid spam
                    if (error.name !== 'AbortError') {
                        console.error('Error playing audio:', error);
                        if (onError) onError(error);
                    }
                });
            };

            // Wait for the audio to be ready to play
            audioRef.current.addEventListener('canplay', playAudio, { once: true });

            // Fallback: try to play after a short delay if canplay doesn't fire
            const fallbackTimeout = setTimeout(playAudio, 100);

            // Cleanup function
            return () => {
                clearTimeout(fallbackTimeout);
                if (currentUrlRef.current) {
                    URL.revokeObjectURL(currentUrlRef.current);
                    currentUrlRef.current = null;
                }
            };
        }
    }, [audioBlob, onError]);

    const handleEnded = () => {
        if (onEnded) onEnded();
    };

    const handleError = (error) => {
        console.error('Audio playback error:', error);
        if (onError) onError(error);
    };

    return (
        <audio
            ref={audioRef}
            onEnded={handleEnded}
            onError={handleError}
            controls
            className="w-full max-w-xs hidden"
            preload="none"
        />
    );
};

export default AudioPlayer;

