import React, { useState, useEffect } from 'react';

const Dashboard = ({ session }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Solicitud al backend mediante NodeJS utilizando JWT JWT
  useEffect(() => {
    fetch('http://localhost:3000/api/inventory', {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
      .then(res => res.json())
      .then(data => {
        setInventory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setLoading(false);
      });
  }, [session]);

  const proximos = inventory.filter(i => i.status === 'Próximo a vencer');
  const vigentes = inventory.filter(i => i.status === 'Vigente');
  const vencidos = inventory.filter(i => i.status === 'Vencido');

  // Pequeño componente interno para listar bonitos los items
  const renderList = (items) => {
    if (items.length === 0) return <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '10px' }}>No hay registros aquí. ¡Todo en orden!</p>;
    
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: '15px 0 0' }}>
        {items.map(item => (
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <span style={{ fontWeight: 500, display: 'block' }}>{item.name}</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>🧊 {item.category}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', display: 'block', opacity: 0.9 }}>{item.expiration_date}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.days_left < 0 ? 'var(--danger)' : item.days_left <= 3 ? 'var(--warning)' : 'var(--accent)' }}>
                {item.days_left < 0 ? `Hace ${Math.abs(item.days_left)} días` : `En ${item.days_left} días`}
              </span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Tu Alacena 🌿</h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Resumen dinámico de vida de tus alimentos.</p>
      
      {loading ? (
        <div style={{ color: 'var(--accent)', textAlign: 'center', marginTop: '30px' }}>Sincronizando con Supabase... 📡</div>
      ) : (
        <>
          {/* SECCIÓN ÁMBAR: ALARMAS DE VENCIMIENTO INMINENTE */}
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--warning)' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>Próximos a Vencer</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
              Tienes <strong>{proximos.length}</strong> producto(s) entrando a zona crítica.
            </p>
            {renderList(proximos)}
          </div>

          {/* SECCIÓN ROJA: CADUCADOS */}
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--danger)', marginTop: '20px' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>Vencidos (Danger)</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
              <strong>{vencidos.length}</strong> producto(s) que superaron su fecha de caducidad histórica.
            </p>
            {renderList(vencidos)}
          </div>

          {/* SECCIÓN VERDE: SALUDABLES */}
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent)', marginTop: '20px' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>En Excelente Estado</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
              <strong>{vigentes.length}</strong> producto(s) vigentes con largo tiempo de vida.
            </p>
            {renderList(vigentes)}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
