import axios from 'axios'
import { supabase } from '../supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// Interceptor para añadir el token JWT a cada petición
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      } else {
        console.warn('No hay sesión activa al realizar la petición')
        // Opcional: redirigir al login si es una petición a ruta protegida
        // window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error obteniendo la sesión:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de respuesta (ej. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido, intentar refrescar o redirigir al login
      console.warn('Sesión expirada o no autorizada')
      // Aquí podrías llamar a supabase.auth.refreshSession() o simplemente redirigir
      // Por simplicidad, redirigimos al login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api