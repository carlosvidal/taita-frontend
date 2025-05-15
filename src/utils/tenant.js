import { api } from './api.js';

/**
 * Extrae información del tenant desde la petición
 * @param {Request} request - Objeto request de Astro
 * @returns {Object} Información del tenant incluyendo subdominio y host
 */
export function getTenantInfo(request) {
  // Obtener host de los headers del request
  const host = request.headers.get('host') || '';
  console.log('[getTenantInfo] Host detectado:', host);
  
  // Inicializar información del tenant
  let subdomain = '';
  let domain = '';
  let isLocalhost = false;
  
  // Manejar desarrollo local
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    isLocalhost = true;
    // Analizar la query string para el parámetro subdomain
    try {
      const url = new URL(request.url);
      subdomain = url.searchParams.get('subdomain') || 'demo';
      console.log('[getTenantInfo] Ambiente local, usando subdomain de query params:', subdomain);
    } catch (e) {
      subdomain = 'demo'; // Valor por defecto
      console.log('[getTenantInfo] Error al extraer query params, usando subdomain por defecto:', subdomain);
    }
  } 
  // Manejar dominios personalizados completos (sin subdominio)
  else if (host === 'taita.blog' || host === 'www.taita.blog') {
    subdomain = 'demo'; // Subdomain por defecto para el dominio principal
    domain = host;
    console.log('[getTenantInfo] Dominio principal detectado, usando subdomain por defecto:', subdomain);
  }
  // Manejar despliegue en producción
  else {
    // Parsear host para extraer subdominio
    const parts = host.split('.');
    console.log('[getTenantInfo] Partes del host:', parts);
    
    // Caso específico: demo.taita.blog
    if (host === 'demo.taita.blog') {
      subdomain = 'demo';
      domain = 'taita.blog';
      console.log('[getTenantInfo] Dominio demo.taita.blog detectado directamente');
    }
    else if (parts.length >= 3 && parts[0] !== 'www') {
      // Formato: subdominio.dominio.tld
      subdomain = parts[0];
      domain = parts.slice(1).join('.');
      console.log('[getTenantInfo] Formato subdomain.domain.tld detectado, subdomain:', subdomain);
    } else if (parts.length === 2) {
      // Formato: dominio.tld (dominio personalizado)
      domain = host;
      subdomain = 'default';
      console.log('[getTenantInfo] Formato domain.tld detectado (sin subdomain)');
    } else if (parts[0] === 'www' && parts.length >= 3) {
      // Formato: www.dominio.tld
      domain = parts.slice(1).join('.');
      subdomain = 'default';
      console.log('[getTenantInfo] Formato www.domain.tld detectado');
    }
  }
  
  const result = {
    subdomain,
    domain,
    host,
    isLocalhost
  };
  
  console.log('[getTenantInfo] Resultado final:', result);
  return result;
}

/**
 * Obtiene datos de la API con información del tenant
 * @param {string} endpoint - Ruta del endpoint de la API
 * @param {Object} tenantInfo - Información del tenant desde getTenantInfo
 * @param {Object} options - Opciones adicionales para fetch
 * @returns {Promise<Object>} Respuesta de la API
 */
export async function fetchTenantData(endpoint, tenantInfo, options = {}) {
  // Configurar cliente API con la información del tenant
  const apiClient = new api.constructor();
  
  // Sobreescribir el método getHostInfo para usar la información del tenant
  apiClient.getHostInfo = () => ({
    host: tenantInfo.host,
    subdomain: tenantInfo.subdomain
  });
  
  // Usar el cliente API para hacer la petición
  try {
    console.log(`[fetchTenantData] Solicitando ${endpoint} con tenant:`, tenantInfo.subdomain);
    return await apiClient.fetch(endpoint, options);
  } catch (error) {
    console.error(`[fetchTenantData] Error al consultar ${endpoint}:`, error);
    // Intentar una vez más con el método original como fallback
    console.log('[fetchTenantData] Intentando nuevamente con método original');
    return await _fetchTenantDataLegacy(endpoint, tenantInfo, options);
  }
}

/**
 * Versión legacy de fetchTenantData como fallback
 * @private
 */
async function _fetchTenantDataLegacy(endpoint, tenantInfo, options = {}) {
  const apiBase = import.meta.env.PUBLIC_API_URL || 'https://taita-api.onrender.com/api';
  console.log('[fetchTenantData:Legacy] API Base:', apiBase);
  console.log('[fetchTenantData:Legacy] Endpoint:', endpoint);
  
  // Añadir parámetros de consulta para identificación del tenant
  const url = new URL(`${apiBase}${endpoint}`);
  if (tenantInfo.subdomain) {
    url.searchParams.set('subdomain', tenantInfo.subdomain);
  }
  
  // Añadir header de host para identificación del tenant en el servidor
  const headers = {
    'Accept': 'application/json',
    'Host': tenantInfo.host,
    'X-Taita-Subdomain': tenantInfo.subdomain || 'default',
    ...(options.headers || {})
  };
  
  try {
    console.log('[fetchTenantData:Legacy] Iniciando fetch a:', url.toString());
    const response = await fetch(url.toString(), {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`[fetchTenantData:Legacy] Error en la respuesta (${response.status}):`, text);
      throw new Error(`Error en la API: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[fetchTenantData:Legacy] Error final:`, error);
    return null;
  }
}

// Métodos adicionales para interactuar con el API a través de nuestro nuevo cliente
export function getPostsForTenant(tenantInfo) {
  return fetchTenantData('/posts/public', tenantInfo);
}

export function getPostBySlugForTenant(slug, tenantInfo) {
  return fetchTenantData(`/posts/public/slug/${slug}`, tenantInfo);
}

export function getCategoriesForTenant(tenantInfo) {
  return fetchTenantData('/categories/public', tenantInfo);
}

export function getMenuForTenant(tenantInfo) {
  return fetchTenantData('/menu/public', tenantInfo);
}

export function getSettingsForTenant(tenantInfo) {
  return fetchTenantData('/settings/public', tenantInfo);
}
