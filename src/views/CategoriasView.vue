<template>
  <div class="categorias">
    <div class="header">
      <h1>Categorías</h1>
      <button @click="openDialog" class="btn-primary">Nueva categoría</button>
    </div>

    <div v-if="loading" class="loading">Cargando...</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Fecha creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categorias" :key="cat.id">
            <td>{{ cat.nombre }}</td>
            <td>{{ cat.descripcion || '-' }}</td>
            <td>{{ formatDate(cat.created_at) }}</td>
            <td>
              <button @click="editCategoria(cat)" class="btn-edit">Editar</button>
              <button @click="confirmDelete(cat)" class="btn-delete">Eliminar</button>
            </td>
          </tr>
          <tr v-if="categorias.length === 0">
            <td colspan="4" class="text-center">No hay categorías registradas</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para crear/editar categoría -->
    <div v-if="dialogVisible" class="modal-overlay">
      <div class="modal">
        <h2>{{ editing ? 'Editar categoría' : 'Nueva categoría' }}</h2>
        <form @submit.prevent="saveCategoria">
          <div class="form-group">
            <label for="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              v-model="form.nombre"
              required
              autofocus
              placeholder="Ej: Pantallas"
            />
          </div>
          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              v-model="form.descripcion"
              rows="3"
              placeholder="Descripción opcional"
            ></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="dialogVisible = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../services/categorias'

const categorias = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editing = ref(false)
const form = ref({
  nombre: '',
  descripcion: ''
})

// Cargar categorías
const loadCategorias = async () => {
  loading.value = true
  try {
    const { data } = await getCategorias()
    categorias.value = data
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    alert('No se pudieron cargar las categorías. Intenta de nuevo.')
  } finally {
    loading.value = false
  }
}

// Abrir modal para nueva categoría
const openDialog = () => {
  editing.value = false
  form.value = { nombre: '', descripcion: '' }
  dialogVisible.value = true
}

// Abrir modal para editar categoría
const editCategoria = (categoria) => {
  editing.value = true
  form.value = { ...categoria } // Copia para no modificar el original
  dialogVisible.value = true
}

// Guardar categoría (crear o actualizar)
const saveCategoria = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await updateCategoria(form.value.id, {
        nombre: form.value.nombre,
        descripcion: form.value.descripcion
      })
      alert('Categoría actualizada correctamente')
    } else {
      await createCategoria({
        nombre: form.value.nombre,
        descripcion: form.value.descripcion
      })
      alert('Categoría creada correctamente')
    }
    dialogVisible.value = false
    await loadCategorias()
  } catch (error) {
    console.error('Error guardando categoría:', error)
    alert('Error al guardar la categoría. Revisa la consola para más detalles.')
  } finally {
    saving.value = false
  }
}

// Confirmar eliminación
const confirmDelete = (categoria) => {
  if (confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
    deleteCategoria(categoria.id)
      .then(() => {
        alert('Categoría eliminada')
        loadCategorias()
      })
      .catch((error) => {
        console.error('Error eliminando categoría:', error)
        alert('Error al eliminar. Es posible que tenga repuestos asociados.')
      })
  }
}

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadCategorias()
})
</script>

<style scoped>
.categorias {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  margin: 0;
  color: #333;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
}

tr:hover {
  background-color: #f9f9f9;
}

.btn-primary {
  background-color: #42A5F5;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1E88E5;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-edit {
  background-color: #66BB6A;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
}

.btn-edit:hover {
  background-color: #4CAF50;
}

.btn-delete {
  background-color: #EF5350;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-delete:hover {
  background-color: #E53935;
}

.btn-secondary {
  background-color: #9e9e9e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #757575;
}

.text-center {
  text-align: center;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42A5F5;
  box-shadow: 0 0 0 2px rgba(66,165,245,0.2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>