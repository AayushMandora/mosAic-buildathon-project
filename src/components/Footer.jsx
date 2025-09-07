import React from 'react'
import { FaGithub, FaXTwitter, FaLinkedin } from 'react-icons/fa6'

const Footer = () => (
    <footer className="py-6 border-t border-gray-800 bg-gray-950 text-gray-400">
        <div className="container mx-auto px-6 flex items-center justify-between">
            <div className="text-sm">© {new Date().getFullYear()} 24/7 Support</div>
            <div className="flex items-center gap-4 text-xl">
                <a href="https://github.com/AayushMandora" target='_BLANK' aria-label="GitHub" className="hover:text-gray-200"><FaGithub /></a>
                <a href="https://x.com/AayushMandora" target='_BLANK' aria-label="X (Twitter)" className="hover:text-gray-200"><FaXTwitter /></a>
                <a href="https://www.linkedin.com/in/aayush-mandora/" target='_BLANK' aria-label="LinkedIn" className="hover:text-gray-200"><FaLinkedin /></a>
            </div>
        </div>
    </footer>
);

export default Footer