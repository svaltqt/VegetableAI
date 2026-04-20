import React, { useState } from 'react';

const Scanner = ({ token }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detectedDate, setDetectedDate] = useState('');
  const [productName, setProductName] = useState('');

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Solo guardamos la imagen, la previsualizamos, y borramos estados previos
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setDetectedDate('');
    setProductName('');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    setLoading(true);

    try {
      const resp = await fetch('http://localhost:3000/api/ocr', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await resp.json();
      if (data.detectedDate) {
        setDetectedDate(data.detectedDate);
      } else {
        alert("La IA no detectó una fecha clara. Por favor intenta enfocar mejor.");
      }
    } catch (err) {
      console.error('OCR Falló:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    try {
        const res = await fetch('http://localhost:3000/api/inventory', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                name: productName, 
                expiration_date: detectedDate,
                category: 'General'
            })
        });
        
        if(res.ok) {
            alert(`¡Producto guardado en tu Alacena! ${productName} (${detectedDate})`);
            setImagePreview(null);
            setSelectedFile(null);
            setDetectedDate('');
            setProductName('');
        } else {
            const data = await res.json();
            alert("Error al guardar: " + data.error);
        }
    } catch(err) {
        alert("Fallo de red al guardar producto");
    }
  };

  return (
    <div style={{ paddingBottom: '30px' }}>
      <h1 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Escanear Vencimiento 🔍</h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Apunta a la fecha impresa de tu producto.</p>

      <div className="glass-panel" style={{ textAlign: 'center' }}>
        
        {/* BOTÓN 1: SOLO CAPTURA/CARGA LA IMAGEN */}
        <label className="cta-button">
          📷 {imagePreview ? 'Cambiar Foto' : 'Abrir Cámara'}
          <input type="file" accept="image/*" capture="environment" hidden onChange={handleCapture} />
        </label>
        
        {imagePreview && (
          <div style={{ marginTop: '20px' }}>
            <img src={imagePreview} style={{ maxWidth: '100%', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)' }} alt="Captura"/>
          </div>
        )}

        {/* BOTÓN 2: SOLO VISIBLE SI YA HAY UNA FOTO Y NO HA SIDO ANALIZADA POR OCR AUN */}
        {imagePreview && !detectedDate && (
            <button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="cta-button" 
                style={{ marginTop: '20px', width: '100%', justifyContent: 'center', background: 'var(--warning)', color: '#000' }}>
               {loading ? 'Procesando Inteligencia Artificial... 🤖' : '✨ Analizar Fecha con IA'}
            </button>
        )}

        {detectedDate && (
          <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.2)', padding:'15px', borderRadius: '10px' }}>
            <h3 style={{ color: 'var(--accent)', margin: 0 }}>Fecha detectada: {detectedDate}</h3>
            <input 
              type="text" 
              placeholder="Ej. Leche descremada" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              style={{ marginTop:'15px' }}
            />
            <button 
              className="cta-button"
              onClick={handleSaveProduct}
              style={{ width: '100%', marginTop:'15px', justifyContent: 'center' }}
            >Guardar en mi Alacena</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
