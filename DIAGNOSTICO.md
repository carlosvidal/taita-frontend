# Taita Frontend - Diagnóstico y Solución de Problemas

Este documento proporciona instrucciones para diagnosticar y solucionar problemas en el despliegue del frontend de Taita.

## Páginas de Diagnóstico

Hemos añadido dos páginas especiales para ayudar a diagnosticar problemas:

### 1. Página de Diagnóstico Completo

**URL**: [https://demo.taita.blog/debug](https://demo.taita.blog/debug)

Esta página ofrece un diagnóstico completo que incluye:
- Información detallada sobre el tenant detectado
- Pruebas de conexión a todos los endpoints de la API
- Pruebas con diferentes subdominios
- Muestra de datos recibidos de la API

### 2. Prueba Directa de API

**URL**: [https://demo.taita.blog/api-test](https://demo.taita.blog/api-test)

Esta página realiza una solicitud directa a la API sin utilizar ninguna utilidad intermedia:
- Muestra los headers exactos que se están enviando
- Presenta los datos crudos recibidos de la API
- Incluye una prueba del cliente (navegador)
- Prueba forzando el subdomain "demo"

## Pasos para Diagnosticar el Problema

1. **Visita las páginas de diagnóstico**:
   - Primero visita `/api-test` para ver si la API responde
   - Luego visita `/debug` para un diagnóstico más completo

2. **Verifica el subdominio detectado**:
   - Confirma que se esté detectando correctamente el subdominio "demo"
   - Si no se detecta correctamente, puede ser un problema de configuración DNS

3. **Examina las respuestas de la API**:
   - Verifica si alguno de los endpoints está respondiendo correctamente
   - Comprueba si hay errores específicos (CORS, autenticación, etc.)

4. **Prueba con subdominios específicos**:
   - Prueba con diferentes subdominios (demo, default, etc.)
   - Verifica si alguno funciona correctamente

5. **Verifica los logs en Render.com**:
   - Comprueba si hay errores en los logs del servidor
   - Busca problemas relacionados con las variables de entorno

## Problemas Comunes y Soluciones

### No se detecta correctamente el subdominio

**Problema**: El sistema no reconoce "demo" como subdominio.

**Solución**:
1. Revisa la configuración DNS para asegurarte de que demo.taita.blog apunta a tu aplicación
2. Verifica la función `getTenantInfo()` en el archivo `src/utils/tenant.js`

### No hay comunicación con la API

**Problema**: La API no responde o devuelve errores.

**Solución**:
1. Verifica que la API esté funcionando (prueba directamente con curl)
2. Comprueba que las variables de entorno PUBLIC_API_URL y PUBLIC_IMAGE_BASE_URL estén configuradas correctamente
3. Revisa la configuración CORS en el backend

### Errores en las respuestas de la API

**Problema**: La API responde pero con errores o datos incorrectos.

**Solución**:
1. Verifica que el subdominio "demo" exista en la base de datos
2. Comprueba que tenga posts publicados
3. Revisa la estructura de los endpoints en el backend

## Contacto y Soporte

Si después de utilizar estas herramientas de diagnóstico sigues teniendo problemas, aquí tienes opciones adicionales:

1. Revisa la documentación completa de Render.com sobre despliegue de aplicaciones Node.js
2. Consulta la documentación de Astro sobre SSR
3. Verifica la configuración del backend para asegurarte de que acepta peticiones del frontend
