import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Camera, List, User as UserIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) {
    return <div className="pwa-container" style={{ textAlign: 'center', marginTop: '20vh' }}>Cargando ecosistema... 🌿</div>;
  }

  // Si no está logueado, forzamos la ruta al Login
  if (!session) {
    return (
      <div className="pwa-container">
        <Routes>
          <Route path="/*" element={<Login />} />
        </Routes>
      </div>
    );
  }

  // Interfaz de Usuario Autenticado
  return (
    <div className="pwa-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--accent)' }}>VegetableAI</h2>
        <nav style={{ display: 'flex', gap: '15px' }}>
          <Link to="/" style={{ color: 'var(--text-main)' }}><List /></Link>
          <Link to="/scanner" style={{ color: 'var(--text-main)' }}><Camera /></Link>
          <Link to="/profile" style={{ color: 'var(--text-main)' }}><UserIcon /></Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Dashboard session={session} />} />
          <Route path="/scanner" element={<Scanner token={session.access_token} />} />
          <Route path="/profile" element={<Profile session={session} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
