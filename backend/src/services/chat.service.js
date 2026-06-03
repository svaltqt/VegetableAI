import { fetchAndProcessInventory } from './inventory.service.js';
import { getUserProfile } from './users.service.js';

/** Describe en lenguaje natural cuántos días faltan o hace cuánto venció. */
function describeDays(daysLeft) {
  if (daysLeft < 0) {
    const abs = Math.abs(daysLeft);
    return abs === 1 ? 'venció ayer' : `venció hace ${abs} días`;
  }
  if (daysLeft === 0) return 'vence hoy';
  if (daysLeft === 1) return 'vence mañana';
  return `vence en ${daysLeft} días`;
}

/**
 * Construye el bloque de contexto REAL del usuario que se inyecta al modelo:
 * su nombre, la fecha de hoy y su inventario agrupado por estado.
 *
 * @param {string} userId
 * @returns {Promise<{ firstName: string, contextBlock: string }>}
 */
export async function buildUserChatContext(userId) {
  const [inventory, profile] = await Promise.all([
    fetchAndProcessInventory(userId),
    getUserProfile(userId).catch(() => ({ name: '' })),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const firstName = (profile?.name || '').trim().split(/\s+/)[0] || '';

  const expired = inventory.filter((i) => i.days_left < 0);
  const soon = inventory.filter((i) => i.days_left >= 0 && i.days_left <= 3);
  const fresh = inventory.filter((i) => i.days_left > 3);

  const line = (i) =>
    `- ${i.name} (${i.category || 'general'}) — ${describeDays(i.days_left)} (vence: ${i.expiration_date})`;
  const section = (title, arr) =>
    arr.length ? `${title}:\n${arr.map(line).join('\n')}` : `${title}: ninguno`;

  const contextBlock = [
    `Nombre del usuario: ${firstName || '(desconocido)'}`,
    `Fecha de hoy: ${today}`,
    `Total de productos registrados: ${inventory.length}`,
    '',
    section('PRODUCTOS YA VENCIDOS', expired),
    '',
    section('PRODUCTOS POR VENCER (hoy o en los próximos 3 días)', soon),
    '',
    section('PRODUCTOS VIGENTES', fresh),
  ].join('\n');

  return { firstName, contextBlock };
}
