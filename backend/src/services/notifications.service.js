import webpush from 'web-push';
import { supabase } from '../config/supabase.js';

// Configurar llaves VAPID
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    'mailto:test@example.com',
    publicVapidKey,
    privateVapidKey
  );
} else {
  console.warn('⚠️ No se han configurado las VAPID_KEYS. Las notificaciones Push no funcionarán.');
}

export const saveSubscription = async (userId, payload) => {
  const { endpoint, keys, user_agent } = payload;
  
  // Buscar si ya existe la suscripción
  const { data: existing } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .single();

  if (existing) {
    return { success: true, message: 'La suscripción ya existe.' };
  }

  const { error } = await supabase.from('push_subscriptions').insert([{
    user_id: userId,
    endpoint,
    auth_key: keys.auth,
    p256dh_key: keys.p256dh,
    user_agent
  }]);

  if (error) throw new Error(error.message);
  return { success: true };
};

export const removeSubscription = async (userId, endpoint) => {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .match({ user_id: userId, endpoint });
    
  if (error) throw new Error(error.message);
  return { success: true };
};

export const sendNotificationToUser = async (userId, payload) => {
  try {
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);
      
    if (error || !subscriptions || subscriptions.length === 0) return;

    const notificationPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth_key,
          p256dh: sub.p256dh_key
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // La suscripción ha expirado o ya no es válida, la eliminamos
          console.log(`Eliminando suscripción inválida para usuario ${userId}`);
          await removeSubscription(userId, sub.endpoint);
        } else {
          console.error('Error enviando push:', err);
        }
      }
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error al notificar al usuario:', error.message);
  }
};
