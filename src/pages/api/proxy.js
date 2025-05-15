// Este archivo implementa un endpoint de proxy para evitar problemas de CORS
// Actúa como intermediario entre el frontend y la API

export async function post({ request }) {
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
    
    console.log(`[Proxy] Petición a ${url}`);
    console.log(`[Proxy] Host: ${host}, Subdominio: ${subdomain}`);
    
    // Construir opciones de fetch
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Host': host,
        'X-Taita-Subdomain': subdomain || 'demo',
        'Origin': 'https://taita.blog',
        'Referer': 'https://taita.blog/'
      }
    };
    
    // Añadir cuerpo si es necesario
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }
    
    // Realizar petición a la API
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    // Determinar el tipo de contenido de la respuesta
    let responseData;
    let responseContentType;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
        responseContentType = 'application/json';
      } catch (error) {
        // Si falla al parsear JSON, obtener como texto
        console.error(`[Proxy] Error al parsear JSON:`, error);
        responseData = await response.text();
        responseContentType = 'text/plain';
      }
    } else {
      // Si no es JSON, obtener como texto
      responseData = await response.text();
      responseContentType = contentType || 'text/plain';
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