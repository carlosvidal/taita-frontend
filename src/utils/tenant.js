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
  const apiBase = import.meta.env.PUBLIC_API_URL || 'https://taita-api.onrender.com/api';
  console.log('[fetchTenantData] API Base:', apiBase);
  console.log('[fetchTenantData] Endpoint:', endpoint);
  console.log('[fetchTenantData] Tenant Info:', tenantInfo);
  
  // Añadir parámetros de consulta para identificación del tenant
  const url = new URL(`${apiBase}${endpoint}`);
  if (tenantInfo.subdomain) {
    url.searchParams.set('subdomain', tenantInfo.subdomain);
  }
  
  console.log('[fetchTenantData] URL completa:', url.toString());
  
  // Añadir header de host para identificación del tenant en el servidor
  const headers = {
    'Accept': 'application/json',
    'Host': tenantInfo.host,
    'X-Taita-Subdomain': tenantInfo.subdomain || 'default',
    ...(options.headers || {})
  };
  
  console.log('[fetchTenantData] Headers:', headers);
  
  try {
    console.log('[fetchTenantData] Iniciando fetch a:', url.toString());
    const response = await fetch(url.toString(), {
      ...options,
      headers
    });
    
    console.log('[fetchTenantData] Estado de respuesta:', response.status);
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`[fetchTenantData] Error en la respuesta de la API (${response.status}):`, text);
      throw new Error(`Error en la API: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[fetchTenantData] Respuesta exitosa, primeros elementos:', 
      Array.isArray(data) ? data.slice(0, 2) : (typeof data === 'object' ? Object.keys(data) : data));
    return data;
  } catch (error) {
    console.error(`[fetchTenantData] Error al consultar ${endpoint}:`, error);
    return null;
  }
}
