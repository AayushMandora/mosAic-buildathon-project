import React from 'react';
import { Routes, Route, Link, useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import { googleLogin } from './services/api';
import Footer from './components/Footer';
import Navbar from './components/NavBar';
import Hero from './components/Hero';
import FAQDashboard from './components/FAQDashboard';

const Layout = ({ isAuthed }) => (
  <div className="min-h-screen flex flex-col bg-gray-900">
    <Navbar isAuthed={isAuthed} onLogout={() => { localStorage.removeItem('jwt'); localStorage.removeItem('user'); window.location.reload(); }} />
    <main className="flex-1 bg-gray-900">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const LandingPage = ({ onLoginSuccess }) => (
  <Hero onLoginSuccess={onLoginSuccess} />
);

const SupportRoute = () => {
  const { userId } = useParams();
  return (
    <div className="min-h-screen">
      <ChatWindow userId={userId} />
    </div>
  );
};

function App() {
  const [isAuthed, setIsAuthed] = React.useState(!!localStorage.getItem('jwt'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse?.credential;
      const data = await googleLogin(idToken);
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsAuthed(true);
      navigate(`/dashboard/faqs`);
    } catch (e) {
      console.error(e);
      alert('Login failed');
    }
  };

  React.useEffect(() => {
    if (localStorage.getItem('jwt')) {
      if (location.pathname === '/') {
        navigate('/dashboard/faqs');
      }
    }
  }, [location.pathname, navigate]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout isAuthed={isAuthed} />}>
          <Route path="/" element={<LandingPage onLoginSuccess={handleGoogleSuccess} />} />
          <Route path="/dashboard/faqs" element={<FAQDashboard />} />
        </Route>
        <Route path="/support/:userId" element={<SupportRoute />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
