import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Profile = ({ session }) => {
  const [loading, setLoading] = useState(false);
  
  // States Profiling
  const [name, setName] = useState('');
  const [preferences, setPreferences] = useState({});
  const [email, setEmail] = useState('');
  
  // Security
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (session?.user) {
      setEmail(session.user.email);
      // Extraer nombre de perfil desde Node
      fetch('http://localhost:3000/api/users/me', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
        .then(res => res.json())
        .then(data => {
            if(data.name) setName(data.name);
            if(data.preferences) setPreferences(data.preferences);
        })
        .catch(console.error);
    }
  }, [session]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Update Core Supabase Auth Email (requiere SMTP activo)
      if (email !== session.user.email) {
        const { error: errEmail } = await supabase.auth.updateUser({ email });
        if (errEmail) alert("Error Email (Requiere SMTP activo): " + errEmail.message);
      }

      // 2. Modifica el Perfil (Nombre) relacional
      const res = await fetch('http://localhost:3000/api/users/me', {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      alert('Perfil y datos general actualizados');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert("Error: " + error.message);
    else alert("Contraseña protegida con éxito!");
    setNewPassword('');
    setLoading(false);
  };

  const handleDisableAccount = async () => {
    if(!window.confirm("¿Estás seguro de poner en oculto tu cuenta? No recibirás notificaciones push.")) return;
    setLoading(true);
    await fetch('http://localhost:3000/api/users/me', {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ preferences: { ...preferences, status: 'disabled' } })
    });
    alert("Cuenta deshabilitada. Tus datos están a salvo pero pausados.");
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if(!window.confirm("ZONA PELIGROSA: Perderás TODO tu inventario de inmediato y tu correo será liberado. ¿Borrar?")) return;
    
    setLoading(true);
    const res = await fetch('http://localhost:3000/api/users/me', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
    });

    if (res.ok) {
        alert("Tu cuenta fue purgada del Matrix PWA.");
        supabase.auth.signOut(); // Lo empujará al Login.jsx
    } else {
        const { error } = await res.json();
        alert("Fallo fatal: " + error);
        setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '30px' }}>
      <h1 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Configuración ⚙️</h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Ajusta tu experiencia VegetableAI</p>
      
      {/* SECCIÓN DATOS PERSONALES */}
      <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent)' }}>
        <h3>Datos base del Perfil</h3>
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tu Apodo / Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Chef Maestro" />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Correo Frecuente</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu correo de login actual" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
          </div>
          <button className="cta-button" type="submit" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Sincronizando...' : 'Guardar Información'}
          </button>
        </form>
      </div>

      {/* SECCIÓN CLAVES */}
      <div className="glass-panel" style={{ borderLeft: '4px solid var(--warning)', marginTop: '20px' }}>
        <h3>Seguridad Intangible</h3>
        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="password" placeholder="Escribe para pisar clave actual..." value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
          <button className="cta-button" type="submit" disabled={loading} style={{ justifyContent: 'center', background: 'transparent', border: '1px solid var(--warning)', color: 'var(--warning)' }}>
            Cambiar Contraseña
          </button>
        </form>
      </div>

      {/* SECCIÓN ZONA PELIGROSA */}
      <div className="glass-panel" style={{ borderLeft: '4px solid var(--danger)', marginTop: '20px' }}>
        <h3 style={{ color: 'var(--danger)' }}>Zona de Peligro Nuclear</h3>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Cualquier acción aquí afectará radicalmente tu cuenta y métricas del inventario general.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            <button className="cta-button" onClick={handleDisableAccount} disabled={loading} style={{ justifyContent: 'center', background: 'var(--danger)', filter: 'opacity(0.8)' }}>
              Pausar / Deshabilitar Cuenta
            </button>
            
            <button className="cta-button" onClick={handleDeleteAccount} disabled={loading} style={{ justifyContent: 'center', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
              Eliminar Permanentemente ☠️
            </button>
        </div>
      </div>

      {/* SALIDA DE SESIÓN REGULAR */}
      <button 
        onClick={() => supabase.auth.signOut()} 
        style={{ width: '100%', background: 'none', border: 'none', color: '#94a3b8', padding: '20px', textDecoration: 'underline', cursor: 'pointer', marginTop: '10px' }}>
        Solo deseo 'Cerrar Sesión' por ahora
      </button>

    </div>
  );
};

export default Profile;
