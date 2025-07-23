# Guía para Crear Usuarios en Supabase

## Proceso Correcto para Crear Usuarios

### Paso 1: Crear el Usuario en Supabase Dashboard

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Authentication** → **Users**
3. Haz clic en **"Add user"**
4. Completa los campos:
   - **Email**: El email del usuario (ej: `usuario@empresa.com`)
   - **Password**: La contraseña (ej: `Benja2206`)
   - **Email Confirm**: Marcar como confirmado si no quieres que el usuario tenga que confirmar por email
5. Haz clic en **"Create user"**

### Paso 2: Obtener el ID del Usuario Creado

Ejecuta esta consulta en el **SQL Editor** para obtener el ID del usuario recién creado:

```sql
SELECT id, email FROM auth.users WHERE email = 'usuario@empresa.com';
```

Copia el `id` que te devuelva esta consulta.

### Paso 3: Asociar el Usuario a una Empresa

Ejecuta esta consulta para crear el perfil del usuario y asociarlo a su empresa:

```sql
INSERT INTO public.profiles (id, company_id)
VALUES ('ID_DEL_USUARIO_AQUI', 'ID_DE_LA_EMPRESA_AQUI');
```

**Ejemplo práctico:**
```sql
-- Para el usuario info@webcoders.es asociado a WebCoders
INSERT INTO public.profiles (id, company_id)
VALUES ('46ff54ed-c9bd-4e77-a16a-11fdd6fd74fe', 'a015481e-3d3b-49f9-af75-610a44991d60');
```

### Paso 4: Verificar la Creación Correcta

Ejecuta esta consulta para confirmar que todo está correctamente configurado:

```sql
SELECT 
  u.email,
  p.id as profile_id,
  p.company_id,
  c.name as company_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.companies c ON p.company_id = c.id
WHERE u.email = 'usuario@empresa.com';
```

## IDs de Empresas Existentes

Para referencia, estos son los IDs de las empresas existentes:

```sql
-- Consultar todas las empresas disponibles
SELECT id, name FROM public.companies ORDER BY name;
```

### Empresas Conocidas:
- **WebCoders**: `a015481e-3d3b-49f9-af75-610a44991d60`

## Eliminar Usuario (si es necesario)

Si necesitas eliminar un usuario completamente:

### Paso 1: Obtener el ID del usuario
```sql
SELECT id FROM auth.users WHERE email = 'usuario@empresa.com';
```

### Paso 2: Eliminar el usuario (esto eliminará automáticamente el perfil)
```sql
SELECT auth.admin_delete_user('ID_DEL_USUARIO_AQUI');
```

## Notas Importantes

1. **NUNCA** crear usuarios manualmente insertando directamente en `auth.users` - esto causa problemas de encriptación de contraseñas y campos faltantes.

2. **SIEMPRE** usar el Dashboard de Supabase para crear usuarios, luego asociarlos manualmente a la empresa.

3. **VERIFICAR** siempre que el usuario puede ver solo los datos de su empresa después de la creación.

4. **SEGURIDAD**: Cada usuario debe ver únicamente los datos (productos, clientes, ventas) de su propia empresa.

## Solución de Problemas Comunes

### Usuario no puede iniciar sesión
- Verificar que el email esté confirmado en el Dashboard
- Verificar que la contraseña sea correcta
- Verificar que existe un perfil en `public.profiles`

### Usuario ve datos de otras empresas
- Verificar que el `company_id` en `profiles` sea correcto
- Revisar la lógica de filtrado en el frontend
- Verificar que todas las consultas incluyan filtro por `company_id`

### Error 403 o 406 al autenticar
- Verificar que existe el perfil en `public.profiles`
- Verificar que el `company_id` existe en `public.companies`
- Revisar los logs de la consola del navegador para más detalles
