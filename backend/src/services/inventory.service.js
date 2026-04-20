import { supabase } from '../config/supabase.js';

const getInventoryStatus = (expirationDateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expDate = new Date(expirationDateString);
  const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
  
  let state = 'Vigente';
  if (diffDays < 0) state = 'Vencido';
  else if (diffDays <= 3) state = 'Próximo a vencer';

  return { state, diffDays };
};

export const fetchAndProcessInventory = async (userId) => {
  const { data, error } = await supabase.from('inventory').select('*').eq('user_id', userId);
  if (error) throw new Error(error.message);

  return data.map((item) => {
    const statusData = getInventoryStatus(item.expiration_date);
    return { ...item, status: statusData.state, days_left: statusData.diffDays };
  });
};

export const createProduct = async (userId, body) => {
  const { data, error } = await supabase.from('inventory').insert([{ ...body, user_id: userId }]).select();
  if (error) throw new Error(error.message);
  return data;
};

export const editProduct = async (userId, productId, body) => {
  const { data, error } = await supabase.from('inventory').update(body).match({ id: productId, user_id: userId }).select();
  if (error) throw new Error(error.message);
  return data;
};

export const removeProduct = async (userId, productId) => {
  const { data, error } = await supabase.from('inventory').delete().match({ id: productId, user_id: userId }).select();
  if (error) throw new Error(error.message);
  return data;
};
