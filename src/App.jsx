import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import AuthForm from './components/Auth/AuthForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import './styles/global.css';

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

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === null) {
    return <AuthForm />;
  }

  const ProtectedRoute = ({ element }) => {
    return session ? element : <Navigate to="/auth" replace />;
  };

  return (
    <Router>
      <div className="app-container">
        {session && <Sidebar />}
        <div className="main-content">
          <Header />
          <Routes>
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
            <Route path="/results" element={<ProtectedRoute element={<Results />} />} />
            <Route path="/courses" element={<ProtectedRoute element={<Courses />} />} />
            <Route path="/change-course" element={<ProtectedRoute element={<ChangeCourse />} />} />
            <Route path="/forms" element={<ProtectedRoute element={<Forms />} />} />
            <Route path="/contact" element={<ProtectedRoute element={<Contact />} />} />
            <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
            <Route path="/layout" element={<ProtectedRoute element={<Layout />} />} />
            <Route path="/" element={<Navigate to="/profile" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
