import { supabase } from '../config/supabase.js';

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  // El error se dispara si no existe el row (recién registrado). Lo manejaremos retornando vacío
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data || { name: '', preferences: {} };
};

export const updateUserProfile = async (userId, body) => {
  // Hacemos upsert en caso de que sea el primer guardado post-auth
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...body })
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const deleteUserProfile = async (userId) => {
  // Elimina la identidad central de la base de Supabase Auth (Se requiere Service Role)
  const { error: adminError } = await supabase.auth.admin.deleteUser(userId);
  if (adminError) throw new Error(adminError.message);

  // La tabla 'profiles' se limpiará por la cascada (ON DELETE CASCADE), pero hacemos limpieza explícita de seguridad
  const { data, error } = await supabase.from('profiles').delete().eq('id', userId).select();
  // Ignoramos errores de eliminación del public en caso de que la cascada fue veloz
  return data;
};
