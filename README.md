# OnlyUs

OnlyUs es una aplicación privada de aniversario construida con React, TypeScript, Vite, Tailwind CSS v4, React Router, Framer Motion, Lucide y Supabase. El modo demostración usa únicamente contenido local editable; no simula una sesión ni guarda información privada.

## 1. Instalar y ejecutar

```bash
npm install
cp .env.example .env
npm run dev
```

En Windows puedes crear `.env` copiando `.env.example` desde el explorador o PowerShell. No subas `.env` al repositorio: ya está excluido en `.gitignore`.

## 2. Variables de entorno

Completa solo estas variables en `.env` y también en el proveedor de despliegue cuando llegue el momento:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica-o-publishable
```

`VITE_SUPABASE_ANON_KEY` acepta la clave anónima tradicional o la nueva clave pública con prefijo `sb_publishable_`. Nunca uses `service_role`, una clave `secret` ni credenciales administrativas en el frontend.

## 3. Preparar Supabase Dashboard

Estos pasos requieren el panel de Supabase y no están automatizados por la aplicación:

1. Crea un proyecto de Supabase.
2. En **Authentication → Providers**, habilita Email. Para mantener el proyecto privado, desactiva el registro público.
3. En **Authentication → Users**, crea manualmente o invita las dos cuentas de la pareja. Verifica sus correos si tu configuración lo requiere.
4. Copia únicamente los UUID de esas dos cuentas desde el Dashboard; no los expongas en el navegador ni en contenido público.
5. En **SQL Editor**, aplica primero `supabase/migrations/20261022_onlyus.sql` y después `supabase/migrations/20261023_story_photos_songs.sql`. La primera crea las tablas, RLS, el bucket privado `memory-photos` y sus políticas. La segunda agrega la historia editable, columnas de visibilidad en `memories` y la tabla `songs`, sin borrar recuerdos ni archivos.
6. En una sesión administrativa del SQL Editor, inicializa **solo** los dos perfiles autorizados. Sustituye los marcadores por los UUID reales y nombres que quieran mostrar:

```sql
insert into public.profiles (id, display_name, is_couple_member)
values
  ('UUID_DE_LA_PRIMERA_CUENTA', 'Nombre 1', true),
  ('UUID_DE_LA_SEGUNDA_CUENTA', 'Nombre 2', true)
on conflict (id) do update
set display_name = excluded.display_name,
    is_couple_member = true;
```

No existe una función pública para autorizar miembros y la app no puede cambiar `is_couple_member`. La base no puede afirmar por sí sola que haya “exactamente dos” personas: la garantía operativa es que la persona administradora marque únicamente esas dos filas y revise periódicamente que no haya más.

## 4. Privacidad, RLS y Storage

- `profiles` permite a cada persona ver y actualizar solo su propio perfil; los permisos de columna impiden cambiar `id` o `is_couple_member` desde el cliente.
- `memories` permite que ambos miembros autorizados vean, creen, editen y eliminen recuerdos compartidos. La autoría queda registrada en `created_by` y no se puede alterar desde el cliente.
- La función RLS `public.is_couple_member()` usa `SECURITY DEFINER`, tiene `search_path` fijo, no recibe parámetros y solo puede ejecutarla el rol `authenticated`; evita recursión de políticas.
- `memory-photos` es un bucket privado. Las políticas solo aceptan objetos `shared/<uuid>.webp` (o extensiones admitidas), de miembros autorizados, con JPG, PNG o WebP y un límite de 5 MB.
- Las fotos se muestran con URLs firmadas temporales de 10 minutos. La base guarda únicamente `photo_path`, nunca una URL firmada o pública.

Después de aplicar la migración, confirma en **Storage → Buckets** que `memory-photos` existe y que su estado es **Private**. Comprueba también en **Storage → Policies** las cuatro políticas `onlyus_members_*_memory_photos`.

## 5. Probar recuerdos y fotografías

1. Inicia sesión con una de las dos cuentas autorizadas.
2. Ve a **Recuerdos compartidos**, agrega título, fecha, descripción y una imagen JPG, PNG o WebP de hasta 5 MB.
3. La app valida y optimiza la imagen en el navegador, la sube bajo una ruta aleatoria `shared/` y guarda su ruta solo si también se crea el recuerdo. Si falla el guardado, intenta limpiar la carga para evitar archivos huérfanos.
4. Abre **Galería** y verifica que la foto aparezca mediante una URL firmada temporal.
5. Elimina el recuerdo y verifica que también desaparezca el objeto correspondiente de Storage. Si la limpieza de Storage falla tras eliminar la fila, la app avisa para revisarlo manualmente en el Dashboard.
6. Prueba con una tercera cuenta no autorizada: debe poder autenticarse solo si existe en Auth, pero no debe poder leer, crear ni manipular recuerdos o fotos.

No se puede verificar la ejecución real de RLS o Storage sin un proyecto Supabase configurado. Antes de usar fotos personales, realiza las pruebas anteriores con archivos de prueba.

## 6. Personalizar OnlyUs

- La introducción de **Nuestra historia** se edita en la propia página y se guarda en `story_settings`. El texto inicial se inserta una sola vez; recargar no lo sobrescribe.
- El primer recuerdo de la línea de tiempo es el 24 de junio de 2025. La foto se sube desde la interfaz; no hay una imagen inventada.
- En **Recuerdos compartidos** se elige si una foto aparece en el carrusel, en la historia, en ambos o se oculta.
- **Canciones nuestras** acepta solo enlaces `https` de canciones o álbumes de Spotify. OnlyUs no descarga ni aloja música comercial.
- El contador del inicio usa la fecha de la relación guardada en `story_settings` (23 de junio de 2025 por defecto).

## 7. Validar y desplegar después

```bash
npm run lint
npm run build
```

Cuando decidan desplegar en Vercel, agrega las mismas variables públicas en el panel del proyecto. El comando es `npm run build` y la salida es `dist`. No despliegues antes de validar el acceso de ambas cuentas y las políticas de Storage.
