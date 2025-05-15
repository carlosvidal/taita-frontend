// Utilidad para hacer peticiones a la API y manejar los problemas de CORS
// Este archivo puede ser usado en todo el frontend para comunicarse con la API

/**
 * Clase para gestionar las peticiones a la API
 */
export class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl || import.meta.env.PUBLIC_API_URL || 'https://taita-api.onrender.com/api';
  }
  
  /**
   * Obtiene subdominios y hosts basados en la ubicación actual
   */
  getHostInfo() {
    // Si estamos en el navegador
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      let subdomain = '';
      
      // Extraer subdominios
      if (host.includes('.') && !host.startsWith('www.') && !host.startsWith('localhost')) {
        subdomain = host.split('.')[0];
      } else if (host.includes('localhost')) {
        subdomain = 'demo'; // Usar demo como subdominio por defecto en desarrollo
      }
      
      return { host, subdomain };
    }
    
    // Si estamos en el servidor, valor por defecto
    return { host: 'localhost', subdomain: 'demo' };
  }
  
  /**
   * Realiza una petición a la API
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} options - Opciones de fetch
   * @returns {Promise<any>} - Respuesta de la API
   */
  async fetch(endpoint, options = {}) {
    // Asegurarse de que el endpoint empieza con /
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${path}`;
    
    // Obtener información del host
    const { host, subdomain } = this.getHostInfo();
    
    // Configurar opciones
    const fetchOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Host': host,
        'X-Taita-Subdomain': subdomain,
        ...options.headers
      }
    };
    
    // Añadir cuerpo si es necesario
    if (options.body && (fetchOptions.method === 'POST' || fetchOptions.method === 'PUT' || fetchOptions.method === 'PATCH')) {
      fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }
    
    try {
      // Primera estrategia: Petición directa a la API
      console.log(`[ApiClient] Intentando petición directa a ${url}`);
      const response = await fetch(url, fetchOptions);
      
      // Si la respuesta es exitosa, devolver los datos
      if (response.ok) {
        console.log(`[ApiClient] Petición directa exitosa a ${url}`);
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
        
        return await response.text();
      }
      
      // Si la respuesta no es exitosa, intentar con el proxy
      console.log(`[ApiClient] Petición directa fallida con estado ${response.status}, intentando con proxy`);
      
      // Segunda estrategia: Usar el proxy local
      return await this.fetchViaProxy(endpoint, options);
    } catch (error) {
      console.error(`[ApiClient] Error en petición a ${url}:`, error);
      
      // Si hay un error en la petición directa, intentar con el proxy
      console.log(`[ApiClient] Intentando recuperación mediante proxy`);
      return await this.fetchViaProxy(endpoint, options);
    }
  }
  
  /**
   * Realiza una petición a través del proxy local
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} options - Opciones de fetch
   * @returns {Promise<any>} - Respuesta de la API
   */
  async fetchViaProxy(endpoint, options = {}) {
    // Asegurarse de que el endpoint empieza con /
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Obtener información del host
    const { host, subdomain } = this.getHostInfo();
    
    try {
      console.log(`[ApiClient] Realizando petición mediante proxy a ${path}`);
      
      // Extraer parámetros de consulta si existen en la URL
      let queryParams = {};
      if (path.includes('?')) {
        const [basePath, queryString] = path.split('?');
        const searchParams = new URLSearchParams(queryString);
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });
      }
      
      // Petición al proxy local
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Host': host,
          'X-Taita-Subdomain': subdomain
        },
        body: JSON.stringify({
          endpoint: path.split('?')[0], // Enviar el endpoint sin los parámetros de consulta
          method: options.method || 'GET',
          body: options.body || null,
          queryParams, // Enviar los parámetros de consulta por separado
          subdomain // Enviar explícitamente el subdominio
        })
      });
      
      if (!response.ok) {
        console.error(`[ApiClient] Error en proxy: ${response.status}`);
        const errorText = await response.text();
        throw new Error(`Error del proxy: ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error(`[ApiClient] Error en proxy para ${path}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene posts públicos
   * @returns {Promise<Array>} - Array de posts
   */
  async getPosts() {
    return this.fetch('/posts/public');
  }
  
  /**
   * Obtiene un post por su slug
   * @param {string} slug - Slug del post
   * @returns {Promise<Object>} - Post
   */
  async getPostBySlug(slug) {
    return this.fetch(`/posts/public/slug/${slug}`);
  }
  
  /**
   * Obtiene categorías
   * @returns {Promise<Array>} - Array de categorías
   */
  async getCategories() {
    return this.fetch('/categories/public');
  }
  
  /**
   * Obtiene el menú
   * @returns {Promise<Array>} - Array de items de menú
   */
  async getMenu() {
    return this.fetch('/menu/public');
  }
  
  /**
   * Obtiene la configuración del blog
   * @returns {Promise<Object>} - Configuración
   */
  async getSettings() {
    return this.fetch('/settings/public');
  }
}

// Exportar instancia por defecto
export const api = new ApiClient();

// Exportar funciones individuales como helpers
export const getPosts = () => api.getPosts();
export const getPostBySlug = (slug) => api.getPostBySlug(slug);
export const getCategories = () => api.getCategories();
export const getMenu = () => api.getMenu();
export const getSettings = () => api.getSettings();