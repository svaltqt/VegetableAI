import { supabase } from '../config/supabase.js';

export const getAlerts = async (userId) => {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const updateAlertStatus = async (userId, alertId, status) => {
  const { data, error } = await supabase
    .from('alerts')
    .update({ status })
    .match({ id: alertId, user_id: userId })
    .select();

  if (error) throw new Error(error.message);
  return data;
};

export const markAllSeen = async (userId) => {
  const { data, error } = await supabase
    .from('alerts')
    .update({ status: 'vista' })
    .match({ user_id: userId, status: 'pendiente' })
    .select();

  if (error) throw new Error(error.message);
  return data;
};

export const generateAlerts = async () => {
  try {
    // 1. Obtener todo el inventario
    const { data: inventory, error: invError } = await supabase.from('inventory').select('*');
    if (invError) throw invError;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of inventory) {
      const expDate = new Date(item.expiration_date);
      const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

      let alertType = null;
      let message = '';

      if (diffDays < 0) {
        alertType = 'vencido';
        message = `Tu producto "${item.name}" ya ha vencido.`;
      } else if (diffDays <= 3) {
        alertType = 'vencimiento_proximo';
        message = `Tu producto "${item.name}" vencerá en ${diffDays} día(s).`;
      }

      // Si el producto califica para alerta
      if (alertType) {
        // Verificar si ya existe una alerta activa (pendiente o vista) para este producto y tipo
        const { data: existingAlerts } = await supabase
          .from('alerts')
          .select('id')
          .eq('product_id', item.id)
          .eq('type', alertType)
          .neq('status', 'descartada');

        if (!existingAlerts || existingAlerts.length === 0) {
          // Crear la alerta
          await supabase.from('alerts').insert([{
            user_id: item.user_id,
            product_id: item.id,
            message: message,
            type: alertType,
            status: 'pendiente'
          }]);
        }
      }
    }
    console.log('Cron: Alertas generadas exitosamente.');
  } catch (error) {
    console.error('Error generando alertas:', error.message);
  }
};
