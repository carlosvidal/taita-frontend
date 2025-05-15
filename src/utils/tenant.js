/**
 * Extrae información del tenant desde la petición
 * @param {Request} request - Objeto request de Astro
 * @returns {Object} Información del tenant incluyendo subdominio y host
 */
export function getTenantInfo(request) {
  // Obtener host de los headers del request
  const host = request.headers.get('host') || '';
  
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
    } catch (e) {
      subdomain = 'demo'; // Valor por defecto
    }
  } 
  // Manejar despliegue en producción
  else {
    // Parsear host para extraer subdominio
    const parts = host.split('.');
    
    if (parts.length >= 3 && parts[0] !== 'www') {
      // Formato: subdominio.dominio.tld
      subdomain = parts[0];
      domain = parts.slice(1).join('.');
    } else if (parts.length === 2) {
      // Formato: dominio.tld (dominio personalizado)
      domain = host;
    } else if (parts[0] === 'www' && parts.length >= 3) {
      // Formato: www.dominio.tld
      domain = parts.slice(1).join('.');
    }
  }
  
  return {
    subdomain,
    domain,
    host,
    isLocalhost
  };
}

/**
 * Obtiene datos de la API con información del tenant
 * @param {string} endpoint - Ruta del endpoint de la API
 * @param {Object} tenantInfo - Información del tenant desde getTenantInfo
 * @param {Object} options - Opciones adicionales para fetch
 * @returns {Promise<Object>} Respuesta de la API
 */
export async function fetchTenantData(endpoint, tenantInfo, options = {}) {
  const apiBase = import.meta.env.PUBLIC_API_URL || 'https://taita-api.onrender.com/api';
  
  // Añadir parámetros de consulta para identificación del tenant
  const url = new URL(`${apiBase}${endpoint}`);
  if (tenantInfo.subdomain) {
    url.searchParams.set('subdomain', tenantInfo.subdomain);
  }
  
  // Añadir header de host para identificación del tenant en el servidor
  const headers = {
    'Accept': 'application/json',
    'Host': tenantInfo.host,
    ...(options.headers || {})
  };
  
  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`Error en la respuesta de la API (${response.status}):`, text);
      throw new Error(`Error en la API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error al consultar ${endpoint}:`, error);
    return null;
  }
}
