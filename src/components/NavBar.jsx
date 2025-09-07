import React from 'react'
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FaHeadset, FaList, FaRightFromBracket } from 'react-icons/fa6';

const Navbar = ({ onLogout, isAuthed, onLoginSuccess }) => (
    <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950 text-gray-100">
        <Link to="/" className="text-lg font-semibold flex items-center">
            <FaHeadset className="mr-2" />
            24/7 Support
        </Link>
        <div className="flex items-center gap-4">
            {isAuthed ? (
                <>
                    <Link to="/dashboard/faqs" className="text-sm hover:text-white flex items-center"><FaList className="mr-2" />Dashboard</Link>
                    <button onClick={onLogout} className="text-sm px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded flex items-center">
                        <FaRightFromBracket className="mr-2" />Logout
                    </button>
                </>
            ) : <div className="flex justify-center">
                <GoogleLogin onSuccess={onLoginSuccess} onError={() => alert('Login Failed')} />
            </div>}
        </div>
    </nav>
);

export default Navbar