import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const forceSeedData = async () => {
    console.log("🛠️ Interviniendo como Administrador...");

    // 1. Crear usuario fantasma usando permisos Admin (Saltando Rate Limits de Supabase)
    const mockEmail = `chef_${Math.floor(Math.random() * 10000)}@vegetal.com`;
    const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
        email: mockEmail,
        password: 'password123',
        email_confirm: true // Pasamos por alto la petición a correos y activamos cuenta al momento
    });

    if (adminErr) {
        console.log("❌ Error Admin Creando Usuario:", adminErr.message);
        return;
    }

    const userId = adminUser.user.id;
    console.log(`✅ Cuenta Autorizada: ${mockEmail}`);

    // Pausa técnica para permitir que nuestro Trigger 'handle_new_user' trabaje
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Inyectar Alimentos
    const today = new Date();
    const vencido = new Date(); vencido.setDate(today.getDate() - 3);
    const prox1 = new Date(); prox1.setDate(today.getDate() + 1);
    const prox2 = new Date(); prox2.setDate(today.getDate() + 2);
    const sano1 = new Date(); sano1.setDate(today.getDate() + 20);
    const sano2 = new Date(); sano2.setDate(today.getDate() + 45);

    const mockData = [
        { user_id: userId, name: "Leche Descremada", category: "Lácteos", expiration_date: vencido.toISOString().split('T')[0] },
        { user_id: userId, name: "Tofu Orgánico", category: "Proteína", expiration_date: prox1.toISOString().split('T')[0] },
        { user_id: userId, name: "Espinacas Frescas", category: "Verduras", expiration_date: prox2.toISOString().split('T')[0] },
        { user_id: userId, name: "Pasta Integral", category: "Abarrotes", expiration_date: sano1.toISOString().split('T')[0] },
        { user_id: userId, name: "Lata de Atún", category: "Abarrotes", expiration_date: sano2.toISOString().split('T')[0] }
    ];

    const { error: invErr } = await supabase.from('inventory').insert(mockData);
    if(invErr){
        console.log("❌ ERROR BD (Inventario):", invErr.message);
    } else {
        console.log(`\n============================================\n🎉 ¡MISIÓN CUMPLIDA! 🎉\n============================================\nEntra ahora mismo a tu App Web en localhost:5173\nVe a la solapa "Inicia sesión" (No registrarse) y usa esto:\n\n✉️ Correo: ${mockEmail}\n🔑 Clave: password123\n============================================\nTu Dashboard te espera iluminado con tarjetas de advertencia.`);
    }
};

forceSeedData();
