export const prerender = false;

export async function GET({ request }) {
  try {
    // Extraer el path desde la consulta
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint') || '/posts/public';
    const subdomain = url.searchParams.get('subdomain') || 'demo';
    
    // Construir la URL de la API
    const apiUrl = `${import.meta.env.PUBLIC_API_URL}${endpoint}?subdomain=${subdomain}`;
    
    console.log(`🔄 Proxy - Redirigiendo solicitud a: ${apiUrl}`);
    
    // Reenviar la solicitud a la API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Taita-Subdomain': subdomain,
        'Origin': 'https://taita-api.onrender.com'
      }
    });
    
    // Si la respuesta no es OK, lanzar un error
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({
        error: `Error en la API: ${response.status}`,
        details: errorText
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Obtener los datos de la respuesta
    const data = await response.json();
    
    // Devolver la respuesta con los datos
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Error en proxy:', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
