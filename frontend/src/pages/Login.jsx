import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    let errorContext = null;

    if (isRegistering) {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      errorContext = error;
      if (!error) alert('Registro exitoso. ¡Revisa tu correo si pedimos verificación, o Inicia Sesión!');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      errorContext = error;
    }

    if (errorContext) {
      alert(errorContext.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center', marginTop: '10vh' }}>
      <h1 style={{ fontWeight: 700, color: 'var(--accent)' }}>VegetableAI</h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Salva alimentos inteligente</p>
      
      <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Tu Correo Electrónico" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña Secreta" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button className="cta-button" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Entrar a mi Alacena')}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', color: '#94a3b8' }}>
          {isRegistering ? '¿Ya tienes cuenta?' : '¿Eres nuevo aquí?'}
          <br/>
          <span 
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold' }} 
            onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Inicia sesión' : 'Regístrate aquí'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
