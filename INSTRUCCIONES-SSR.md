# Instrucciones para la implementación de SSR en Taita Frontend

Hemos realizado los siguientes cambios para habilitar la renderización del lado del servidor (SSR) en el frontend de Taita:

## 1. Utilidades de Multi-tenant

Se ha creado un nuevo archivo de utilidades para gestionar la detección de tenant (blog) basado en:
- Subdominio
- Dominio personalizado
- Parámetros de consulta (para desarrollo local)

**Archivo:** `/src/utils/tenant.js`

## 2. Actualización de Configuración

Hemos actualizado los siguientes archivos de configuración:

- **`.env`:** Actualizado para usar el prefijo `PUBLIC_` requerido por Astro
- **`package.json`:** Actualizado con el script `start` para el entorno de producción
- **`render.yaml`:** Configurado para despliegue como servicio web Node.js en lugar de sitio estático

## 3. Páginas Actualizadas

Se han actualizado todas las páginas principales para usar las utilidades de tenant y manejar correctamente la renderización del lado del servidor:

- **`index.astro`:** Página principal
- **`blog/[slug].astro`:** Detalle de artículo por slug
- **`blog/[id].astro`:** Detalle de artículo por ID
- **`category/[slug].astro`:** Página de categoría
- **`404.astro`:** Página de error personalizada

## 4. Actualizaciones Pendientes

Aún podrías querer actualizar o crear estas páginas adicionales:
- Página de búsqueda
- Páginas de archivo (por fecha)
- Páginas de autor

## 5. Instrucciones para el Despliegue

Para desplegar en Render.com:

1. **Crear un Nuevo Servicio Web:**
   - Ve a tu panel de Render.com
   - Elige "New +" y selecciona "Web Service"
   - Conecta con tu repositorio de GitHub
   - Selecciona la rama que deseas desplegar

2. **Configuración:**
   - **Name:** taita-frontend
   - **Runtime:** Node
   - **Build Command:** npm install && npm run build
   - **Start Command:** node ./dist/server/entry.mjs

3. **Variables de Entorno:**
   - PUBLIC_API_URL = https://taita-api.onrender.com/api
   - PUBLIC_IMAGE_BASE_URL = https://taita-api.onrender.com
   - NODE_VERSION = 18

4. **Prueba en Entorno Local:**
   - Ejecuta `npm run dev` para desarrollo local
   - Prueba diferentes subdominios usando `?subdomain=nombre-blog`
   - Asegúrate de que la API esté disponible en el entorno de desarrollo

## 6. Próximos Pasos Recomendados

- Implementar caché de respuestas del servidor
- Añadir control de errores más robusto
- Implementar algún sistema de logs para mejor depuración
- Considerar la integración con CDN para mejor desempeño
- Configurar redirecciones personalizadas para dominios de clientes

## 7. Notas Importantes

- El modo SSR permite que el contenido se renderice dinámicamente sin necesidad de recompilación
- Cada solicitud será procesada por el servidor, lo que puede aumentar ligeramente el tiempo de respuesta inicial
- Para compensar esto, asegúrate de configurar correctamente las cabeceras Cache-Control
