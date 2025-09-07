import React from 'react'
import { useNavigate } from 'react-router-dom';

const FAQManager = React.lazy(() => import('./FAQManager'));

const FAQDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = React.useState(null);
    React.useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        if (!u) navigate('/');
        setUser(u);
    }, [navigate]);
    return (
        <div className="min-h-screen p-6 bg-gray-900 text-gray-100">
            <div className="mb-4">
                <h2 className="text-xl font-semibold">FAQ Manager</h2>
                {user && (
                    <div className="text-sm text-gray-300 mt-2">
                        Your bot link: <a className="text-blue-400 underline" href={`${window.location.origin}/support/${user.id}`}>{`${window.location.origin}/support/${user.id}`}</a>
                    </div>
                )}
            </div>
            <FAQManager />
        </div>
    );
};

export default FAQDashboard