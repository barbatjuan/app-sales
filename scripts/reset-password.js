// Script para establecer una contraseña específica para un usuario
const fetch = require('node-fetch');

// Configuración - REEMPLAZAR con tus credenciales reales de Supabase
const SUPABASE_URL = 'TU_SUPABASE_URL'; // Ejemplo: https://abcdefgh.supabase.co
const SUPABASE_SERVICE_KEY = 'TU_SUPABASE_SERVICE_KEY'; // La clave service_role
const USER_EMAIL = 'martinrudazi@gmail.com';
const NEW_PASSWORD = 'mrudazi84';

async function resetPassword() {
  try {
    // 1. Buscar el usuario por email para obtener su ID
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${USER_EMAIL}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      }
    });
    
    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('Error al buscar usuario:', errorData);
      return;
    }
    
    const users = await userResponse.json();
    if (!users || users.length === 0) {
      console.error(`No se encontró ningún usuario con el email: ${USER_EMAIL}`);
      return;
    }
    
    const userId = users[0].id;
    console.log(`Usuario encontrado con ID: ${userId}`);
    
    // 2. Actualizar la contraseña del usuario
    const updateResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: NEW_PASSWORD
      })
    });
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('Error al actualizar contraseña:', errorData);
      return;
    }
    
    console.log('Contraseña actualizada correctamente');
    console.log(`Usuario: ${USER_EMAIL}`);
    console.log(`Nueva contraseña: ${NEW_PASSWORD}`);
  } catch (error) {
    console.error('Error inesperado:', error);
  }
}

resetPassword();
