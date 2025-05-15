/**
 * Utilidades para acceder directamente a la API sin pasar por el sistema de proxy
 * Este archivo proporciona métodos alternativos para situaciones donde el proxy falla
 */

/**
 * Obtiene los posts públicos para un subdominio específico
 * @param {string} subdomain - El subdominio para el cual obtener los posts
 * @returns {Promise<Array>} - Array de posts o array vacío en caso de error
 */
export async function getPublicPosts(subdomain = 'demo') {
  try {
    console.log(`[DirectAPI] Obteniendo posts para subdominio: ${subdomain}`);
    
    // Construir URL con el subdominio como parámetro de consulta
    const apiUrl = 'https://taita-api.onrender.com/api/posts/public';
    const url = `${apiUrl}?subdomain=${encodeURIComponent(subdomain)}`;
    
    // Realizar petición con encabezados específicos para evitar problemas de CORS y Cloudflare
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Taita-Subdomain': subdomain,
        'Origin': 'https://taita.blog',
        'Referer': 'https://taita.blog/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    });
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error(`[DirectAPI] Error al obtener posts: ${response.status} ${response.statusText}`);
      return [];
    }
    
    // Procesar respuesta
    const data = await response.json();
    console.log(`[DirectAPI] Posts obtenidos: ${Array.isArray(data) ? data.length : 'no es array'}`);
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[DirectAPI] Error al obtener posts:', error);
    return [];
  }
}

/**
 * Obtiene los elementos del menú público para un subdominio específico
 * @param {string} subdomain - El subdominio para el cual obtener el menú
 * @returns {Promise<Array>} - Array de elementos de menú o array vacío en caso de error
 */
export async function getPublicMenu(subdomain = 'demo') {
  try {
    console.log(`[DirectAPI] Obteniendo menú para subdominio: ${subdomain}`);
    
    // Construir URL con el subdominio como parámetro de consulta
    const apiUrl = 'https://taita-api.onrender.com/api/menu/public';
    const url = `${apiUrl}?subdomain=${encodeURIComponent(subdomain)}`;
    
    // Realizar petición con encabezados específicos para evitar problemas de CORS y Cloudflare
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Taita-Subdomain': subdomain,
        'Origin': 'https://taita.blog',
        'Referer': 'https://taita.blog/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    });
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error(`[DirectAPI] Error al obtener menú: ${response.status} ${response.statusText}`);
      return [];
    }
    
    // Procesar respuesta
    const data = await response.json();
    console.log(`[DirectAPI] Elementos de menú obtenidos: ${Array.isArray(data) ? data.length : 'no es array'}`);
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[DirectAPI] Error al obtener menú:', error);
    return [];
  }
}

/**
 * Obtiene las categorías públicas para un subdominio específico
 * @param {string} subdomain - El subdominio para el cual obtener las categorías
 * @returns {Promise<Array>} - Array de categorías o array vacío en caso de error
 */
export async function getPublicCategories(subdomain = 'demo') {
  try {
    console.log(`[DirectAPI] Obteniendo categorías para subdominio: ${subdomain}`);
    
    // Construir URL con el subdominio como parámetro de consulta
    const apiUrl = 'https://taita-api.onrender.com/api/categories/public';
    const url = `${apiUrl}?subdomain=${encodeURIComponent(subdomain)}`;
    
    // Realizar petición con encabezados específicos para evitar problemas de CORS y Cloudflare
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Taita-Subdomain': subdomain,
        'Origin': 'https://taita.blog',
        'Referer': 'https://taita.blog/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    });
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error(`[DirectAPI] Error al obtener categorías: ${response.status} ${response.statusText}`);
      return [];
    }
    
    // Procesar respuesta
    const data = await response.json();
    console.log(`[DirectAPI] Categorías obtenidas: ${Array.isArray(data) ? data.length : 'no es array'}`);
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[DirectAPI] Error al obtener categorías:', error);
    return [];
  }
}
