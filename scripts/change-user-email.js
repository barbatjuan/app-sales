// Script para cambiar email de un usuario específico usando fetch
// No requiere importar módulos, solo Node.js estándar

// IMPORTANTE: Reemplaza estas variables con tus valores reales
const SUPABASE_URL = 'TU_SUPABASE_URL' // Ejemplo: https://abcdefgh.supabase.co
const SUPABASE_SERVICE_KEY = 'TU_SUPABASE_SERVICE_KEY' // La clave service_role
const USER_ID = '600f484f-16d0-4212-a76d-74a67fb0f25c'
const NEW_EMAIL = 'porrojp@gmail.com'

async function updateUserEmail() {
  try {
    // Crear la URL para la API de Supabase
    const apiUrl = `${SUPABASE_URL}/auth/v1/admin/users/${USER_ID}`
    
    // Llamada a la API usando fetch
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: NEW_EMAIL,
        email_confirm: true // Confirmar automáticamente sin enviar email de verificación
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error al actualizar el email:', errorData)
      return
    }
    
    const data = await response.json()
    console.log('Email actualizado correctamente:')
    console.log(`Usuario ID: ${USER_ID}`)
    console.log(`Nuevo email: ${NEW_EMAIL}`)
  } catch (error) {
    console.error('Error inesperado:', error)
  }
}

// Ejecutar la función
updateUserEmail()
