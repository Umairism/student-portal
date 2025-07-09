import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase.js';
import AuthForm from './components/Auth/AuthForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import './styles/global.css';

import Dashboard from './components/Pages/Dashboard';
import Profile from './components/Pages/Profile';
import Results from './components/Pages/Results';
import Courses from './components/Pages/Courses';
import ChangeCourse from './components/Pages/ChangeCourse';
import Forms from './components/Pages/Forms';
import Contact from './components/Pages/Contact';
import Settings from './components/Pages/Settings';
import Layout from './components/Pages/Layout';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setInitialized(true);
      } catch (error) {
        console.error('Error fetching session:', error);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      setLoading(false);
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ProtectedRoute = ({ element }) => {
    if (loading || !initialized) {
      return <div className="loading-spinner">Loading...</div>;
    }
    return session ? element : <Navigate to="/auth" replace />;
  };

  // Show loading while checking authentication
  if (loading || !initialized) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // If user is authenticated but on auth page, redirect to dashboard
  if (session && location.pathname === '/auth') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-container">
      {session && <Sidebar />}
      <div className="main-content">
        {session && <Header />}
        <Routes>
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/results" element={<ProtectedRoute element={<Results />} />} />
          <Route path="/courses" element={<ProtectedRoute element={<Courses />} />} />
          <Route path="/change-course" element={<ProtectedRoute element={<ChangeCourse />} />} />
          <Route path="/forms" element={<ProtectedRoute element={<Forms />} />} />
          <Route path="/contact" element={<ProtectedRoute element={<Contact />} />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
          <Route path="/layout" element={<ProtectedRoute element={<Layout />} />} />
          <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
