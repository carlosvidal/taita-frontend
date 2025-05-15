// Este archivo implementa un endpoint de proxy para evitar problemas de CORS
// Actúa como intermediario entre el frontend y la API

export const prerender = false;

// Manejar solicitudes GET
export async function GET({ request, url }) {
  try {
    // Obtener parámetros de la URL
    const endpoint = url.searchParams.get('endpoint');
    const subdomain = url.searchParams.get('subdomain') || 'demo';
    
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Se requiere un endpoint' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Construir URL de la API
    const apiUrl = import.meta.env.PUBLIC_API_URL || 'https://taita-api.onrender.com/api';
    let fullUrl = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // Copiar todos los parámetros excepto 'endpoint' y 'subdomain'
    const queryParams = new URLSearchParams();
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== 'endpoint' && key !== 'subdomain') {
        queryParams.append(key, value);
      }
    }
    
    // Añadir parámetros a la URL si existen
    if (queryParams.toString()) {
      fullUrl = `${fullUrl}?${queryParams.toString()}`;
    }
    
    // Extraer información del host
    const host = request.headers.get('host') || '';
    
    console.log(`[Proxy GET] Petición a ${fullUrl}`);
    console.log(`[Proxy GET] Host: ${host}, Subdominio: ${subdomain}`);
    
    // Construir opciones de fetch
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Host': host,
        'X-Taita-Subdomain': subdomain,
        'Origin': 'https://taita.blog',
        'Referer': 'https://taita.blog/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    };
    
    console.log(`[Proxy GET] Opciones:`, JSON.stringify(options, null, 2));
    
    // Realizar petición a la API
    const response = await fetch(fullUrl, options);
    
    // Procesar la respuesta
    return await processApiResponse(response);
  } catch (error) {
    console.error(`[Proxy GET] Error:`, error);
    
    // Devolver error al cliente
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Manejar solicitudes POST
export async function POST({ request }) {
  try {
    // Extraer datos de la petición
    const data = await request.json();
    const { endpoint, method = 'GET', body, queryParams } = data;
    
    // Validar el endpoint
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Se requiere un endpoint' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Construir URL de la API
    const apiUrl = import.meta.env.PUBLIC_API_URL || 'https://taita-api.onrender.com/api';
    let url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // Añadir parámetros de consulta si existen
    if (queryParams && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, value);
        }
      });
      url = `${url}?${searchParams.toString()}`;
    }
    
    // Extraer información del host y subdominio
    const host = request.headers.get('host') || '';
    let subdomain = data.subdomain || '';
    
    if (!subdomain) {
      if (host.includes('.') && !host.startsWith('www.')) {
        subdomain = host.split('.')[0];
      } else if (host.includes('localhost')) {
        subdomain = 'demo'; // Valor por defecto para desarrollo local
      }
    }
    
// Debugging específico para posts/public
    if (endpoint === '/posts/public' || endpoint.includes('/posts/public')) {
      console.log(`[Proxy DEBUG] Petición especial a /posts/public`);
      
      // Forzar subdomain a "demo" para pruebas
      const debugOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Host': 'demo.taita.blog',
          'X-Taita-Subdomain': 'demo',
          'Origin': 'https://taita.blog',
          'Referer': 'https://taita.blog/',
          'User-Agent': 'TaitaDebugger/1.0'
        }
      };
      
      console.log(`[Proxy DEBUG] Usando headers especiales para debug:`, JSON.stringify(debugOptions.headers, null, 2));
      
      // Hacer la petición con los headers específicos
      try {
        const debugResponse = await fetch(url, debugOptions);
        console.log(`[Proxy DEBUG] Respuesta especial: Status ${debugResponse.status}`);
        
        const debugData = await debugResponse.clone().text();
        console.log(`[Proxy DEBUG] Respuesta cruda: ${debugData.substring(0, 200)}...`);
        
        return processApiResponse(debugResponse);
      } catch (debugError) {
        console.error(`[Proxy DEBUG] Error con petición especial:`, debugError);
      }
    }
    
    // Continuar con la petición normal si la de debug falló o no aplica
    console.log(`[Proxy] Petición regular a ${url}`);
    console.log(`[Proxy] Opciones regulares:`, JSON.stringify(options, null, 2));
    
    // Construir opciones de fetch
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Host': host,
        'X-Taita-Subdomain': subdomain || 'demo',
        'Origin': 'https://taita.blog',
        'Referer': 'https://taita.blog/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    };
    
    console.log(`[Proxy POST] Opciones:`, JSON.stringify(options, null, 2));
    
    // Añadir cuerpo si es necesario
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }
    
    // Realizar petición a la API
    const response = await fetch(url, options);
    
    // Procesar la respuesta
    return await processApiResponse(response);
  } catch (error) {
    console.error(`[Proxy] Error:`, error);
    
    // Devolver error al cliente
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Procesa la respuesta de la API y la convierte en una respuesta adecuada para el cliente
 * @param {Response} response - Respuesta de la API
 * @returns {Response} - Respuesta formateada para el cliente
 */
async function processApiResponse(response) {
  // Registrar información de la respuesta
  console.log(`[Proxy] Respuesta de API - Status: ${response.status} ${response.statusText}`);
  
  // Registrar todos los encabezados de la respuesta
  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  console.log(`[Proxy] Encabezados de respuesta:`, JSON.stringify(headers, null, 2));
  
  const contentType = response.headers.get('content-type');
  console.log(`[Proxy] Tipo de contenido: ${contentType}`);
  
  // Determinar el tipo de contenido de la respuesta
  let responseData;
  let responseContentType;
  
  // Clonar la respuesta para poder leerla múltiples veces si es necesario
  const clonedResponse = response.clone();
  
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
      responseContentType = 'application/json';
      console.log(`[Proxy] Datos JSON recibidos:`, JSON.stringify(responseData, null, 2));
    } catch (error) {
      // Si falla al parsear JSON, obtener como texto
      console.error(`[Proxy] Error al parsear JSON:`, error);
      responseData = await clonedResponse.text();
      responseContentType = 'text/plain';
      console.log(`[Proxy] Contenido de texto recibido:`, responseData);
    }
  } else {
    // Si no es JSON, obtener como texto
    responseData = await response.text();
    responseContentType = contentType || 'text/plain';
    console.log(`[Proxy] Contenido de texto recibido:`, responseData);
  }
  
  // Devolver respuesta al cliente
  if (responseContentType === 'application/json') {
    return new Response(
      JSON.stringify(responseData),
      {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } else {
    return new Response(
      responseData,
      {
        status: response.status,
        headers: { 'Content-Type': responseContentType }
      }
    );
  }
}