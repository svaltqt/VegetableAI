import { supabase } from '../config/supabase.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Autorización denegada. Envía un Bearer Token.' });
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Token inválido o cuenta eliminada' });
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error en middleware de autenticación', detail: error.message });
  }
};
