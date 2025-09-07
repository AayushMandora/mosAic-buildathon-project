import React from 'react'

import { GoogleLogin } from '@react-oauth/google';
import { FaRobot } from 'react-icons/fa6';

const Hero = ({ onLoginSuccess }) => (
    <section className="min-h-[80vh] flex flex-col items-center justify-center text-center bg-gray-900 text-gray-100 px-6">
        <div className="max-w-3xl">
            <div className="text-5xl font-extrabold mb-4 flex items-center justify-center">
                <FaRobot className="mr-3" />
                Create Your 24/7 Bot
            </div>
            <p className="text-gray-300 mb-8">
                Add FAQs, and offer instant support to your users.
            </p>
            <div className="flex justify-center">
                <GoogleLogin onSuccess={onLoginSuccess} onError={() => alert('Login Failed')} />
            </div>
            <div className="mt-10">
                {/* Illustration placeholder - replace src once you add the image from Freepik */}
                <div className="w-full flex justify-center">
                    <img src="/public/bot-illustration.png" alt="Bot Illustration" className="max-h-50 object-contain opacity-90" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                </div>
            </div>
        </div>
    </section>
);


export default Hero