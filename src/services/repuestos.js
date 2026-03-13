import api from './api'

export const getRepuestos = async (page = 1, limit = 10, search = '') => {
  const response = await api.get(`/repuestos?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
  return {
    data: response.data,
    total: parseInt(response.headers['x-total-count']) || 0
  };
};

// El resto de funciones (create, update, delete, getById) se mantienen igual
export const getRepuesto = (id) => api.get(`/repuestos/${id}`)
export const createRepuesto = (data) => api.post('/repuestos', data)
export const updateRepuesto = (id, data) => api.put(`/repuestos/${id}`, data)
export const deleteRepuesto = (id) => api.delete(`/repuestos/${id}`)
export const getBajoStock = () => api.get('/repuestos/bajo-stock')