import axios from 'axios';

// const API_BASE_URL = 'http://localhost:3000'; // Backend server port
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
});

// Attach auth token if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Speech-to-Text API call
export const speechToText = async (audioBlob) => {
    try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        const response = await api.post('/stt', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('STT API Error:', error);
        throw new Error('Failed to transcribe audio');
    }
};

// Bot API call
export const sendToBot = async (message, userId) => {
    try {
        const response = await api.post('/bot', {
            message: message,
            userId,
        });

        return response.data;
    } catch (error) {
        console.error('Bot API Error:', error);
        throw new Error('Failed to get bot response');
    }
};

// Text-to-Speech API call
export const textToSpeech = async (text) => {
    try {
        const response = await api.post('/tts', {
            text: text,
        }, {
            responseType: 'blob', // Important for audio data
        });

        return response.data;
    } catch (error) {
        console.error('TTS API Error:', error);
        throw new Error('Failed to convert text to speech');
    }
};

// Auth
export const googleLogin = async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
};

// FAQ CRUD
export const getMyFaqs = async () => {
    const response = await api.get('/faqs/me');
    return response.data;
};

export const addFaq = async (q, a) => {
    const response = await api.post('/faqs', { q, a });
    return response.data;
};

export const updateFaq = async (index, data) => {
    const response = await api.put(`/faqs/${index}`, data);
    return response.data;
};

export const deleteFaq = async (index) => {
    const response = await api.delete(`/faqs/${index}`);
    return response.data;
};

