# Taita Frontend - SSR con Astro

Este frontend implementa Renderizado del Lado del Servidor (SSR) con Astro para la plataforma de blogs multi-tenant Taita.

## Solución de Problemas en el Despliegue

Si experimentas problemas con el despliegue, especialmente con la carga de posts o el error "Not Found", sigue estos pasos:

### 1. Revisar los Logs

Los actuales cambios incluyen paneles de depuración en las páginas que mostrarán información detallada sobre:
- Tenant detectado (subdomain, host)
- Datos obtenidos de la API
- Errores encontrados

Estos paneles te ayudarán a identificar qué está fallando exactamente.

### 2. Verificar la Detección del Tenant (Multi-blog)

El sistema detecta el blog (tenant) principalmente por:
- **Subdominio**: Por ejemplo, en `demo.taita.blog`, el subdomain es "demo"
- **Host Header**: El sistema envía el host completo a la API para identificación del blog

Si tienes problemas, verifica:
- Que tu DNS esté correctamente configurado apuntando a tu aplicación en Render
- Que el subdominio "demo" exista en tu base de datos y tenga posts publicados

### 3. Comunicación API - Frontend

Los problemas comunes incluyen:
- **CORS**: Asegúrate de que tu API permita solicitudes desde tu dominio del frontend
- **Headers incorrectos**: El código actualizado envía headers específicos para la identificación de tenant
- **Estructura de URL**: Verifica que los endpoints de la API coincidan con los que el frontend está consultando

### 4. Pasos para Depurar

1. **Examina los paneles de debug** en las páginas para ver la información de tenant y API
2. **Verifica los logs de la aplicación** en el panel de Render.com
3. **Prueba localmente** usando `npm run dev` y visitando `http://localhost:4321?subdomain=demo`
4. **Comprueba la API** haciendo solicitudes directamente usando herramientas como Postman o curl

## Arquitectura del Frontend

### Detección de Tenant

El archivo `src/utils/tenant.js` contiene la lógica para detectar el tenant (blog) basado en:
- Subdominio en producción (ej: demo.taita.blog)
- Parámetro de consulta `subdomain` en desarrollo local

### Integración con API

Todas las páginas utilizan la función `fetchTenantData()` que:
1. Extrae información del tenant desde la solicitud
2. Agrega el subdominio como parámetro de consulta
3. Agrega headers específicos para identificación en la API

### Estructura de Carpetas

- `/src/pages/` - Páginas principales del sitio
- `/src/layouts/` - Layouts compartidos
- `/src/components/` - Componentes reutilizables
- `/src/utils/` - Utilidades, incluyendo la detección de tenant

## Configuración en Render.com

Para un correcto despliegue en Render.com:

1. Tipo de servicio: **Web Service** (no Static Site)
2. Runtime: **Node**
3. Build Command: `npm install && npm run build`
4. Start Command: `node ./dist/server/entry.mjs`
5. Variables de entorno:
   - `PUBLIC_API_URL=https://taita-api.onrender.com/api`
   - `PUBLIC_IMAGE_BASE_URL=https://taita-api.onrender.com`
   - `NODE_ENV=production`
   - `DEBUG_MODE=true` (opcional, para ver paneles de debug)

## Próximos Pasos

Una vez que hayas solucionado los problemas:

1. Quita los paneles de depuración de las páginas (busca `debug-panel` en los archivos)
2. Considera implementar un sistema de caché para reducir solicitudes a la API
3. Configura una CDN para mejorar el rendimiento
4. Implementa pruebas automatizadas para verificar la correcta carga de contenido

## Contacto y Soporte

Si continúas experimentando problemas, revisa los siguientes recursos:
- Documentación de Astro sobre SSR: [docs.astro.build/en/guides/server-side-rendering/](https://docs.astro.build/en/guides/server-side-rendering/)
- Documentación de Render.com sobre Web Services: [render.com/docs/web-services](https://render.com/docs/web-services)
