<template>
  <div class="proveedores">
    <div class="header">
      <h1>Proveedores</h1>
      <button @click="openDialog" class="btn-primary">Nuevo proveedor</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>Dirección</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prov in proveedores" :key="prov.id">
          <td>{{ prov.nombre }}</td>
          <td>{{ prov.telefono || '-' }}</td>
          <td>{{ prov.email || '-' }}</td>
          <td>{{ prov.direccion || '-' }}</td>
          <td>
            <button @click="editProveedor(prov)" class="btn-edit">Editar</button>
            <button @click="confirmDelete(prov)" class="btn-delete">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal para crear/editar proveedor -->
    <div v-if="dialogVisible" class="modal-overlay">
      <div class="modal">
        <h2>{{ editing ? 'Editar proveedor' : 'Nuevo proveedor' }}</h2>
        <form @submit.prevent="saveProveedor">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="form.nombre" required />
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="form.telefono" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="form.email" />
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <textarea v-model="form.direccion" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="dialogVisible = false" class="btn-secondary">Cancelar</button>
            <button type="submit" :disabled="saving" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../services/proveedores'

const proveedores = ref([])
const dialogVisible = ref(false)
const editing = ref(false)
const saving = ref(false)
const form = ref({
  nombre: '',
  telefono: '',
  email: '',
  direccion: ''
})

const loadData = async () => {
  try {
    const { data } = await getProveedores()
    
    
    proveedores.value = data
  } catch (error) {
    console.error('Error cargando proveedores:', error)
    alert('Error al cargar los proveedores')
  }
}

const openDialog = () => {
  editing.value = false
  form.value = { nombre: '', telefono: '', email: '', direccion: '' }
  dialogVisible.value = true
}

const editProveedor = (prov) => {
  editing.value = true
  form.value = { ...prov }
  dialogVisible.value = true
}

const saveProveedor = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await updateProveedor(form.value.id, form.value)
      alert('Proveedor actualizado correctamente')
    } else {
      await createProveedor(form.value)
      
      alert('Proveedor creado correctamente')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('Error guardando proveedor:', error)
    alert('Error al guardar el proveedor')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (prov) => {
  if (confirm(`¿Estás seguro de eliminar el proveedor "${prov.nombre}"?`)) {
    deleteProveedor(prov.id)
      .then(() => {
        alert('Proveedor eliminado')
        loadData()
      })
      .catch((error) => {
        console.error('Error eliminando proveedor:', error)
        alert('Error al eliminar el proveedor')
      })
  }
}

onMounted(loadData)
</script>

<style scoped>
.proveedores {
  padding: 2rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.btn-primary {
  background-color: #42A5F5;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary:hover {
  background-color: #1E88E5;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-secondary {
  background-color: #ccc;
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary:hover {
  background-color: #b3b3b3;
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
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
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
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}
input, textarea, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>