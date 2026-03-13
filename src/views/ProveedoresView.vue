<template>
  <div class="proveedores">
    <div class="header">
      <h1>Proveedores</h1>
      <button @click="openDialog" class="btn-primary">Nuevo proveedor</button>
    </div>

    <table v-if="!loading">
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
            <button @click="confirmDelete(prov)" class="btn-delete">Desactivar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>Cargando...</div>

    <!-- Modal -->
    <div v-if="dialogVisible" class="modal-overlay">
      <div class="modal">
        <h2>{{ editing ? 'Editar proveedor' : 'Nuevo proveedor' }}</h2>
        <form @submit.prevent="saveProveedor">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="form.nombre" required autofocus />
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="form.telefono" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" />
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
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editing = ref(false)
const form = ref({ nombre: '', telefono: '', email: '', direccion: '' })

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await getProveedores()
    proveedores.value = data
  } catch (error) {
    console.error('Error cargando proveedores:', error)
    alert('Error al cargar proveedores')
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  editing.value = false
  form.value = { nombre: '', telefono: '', email: '', direccion: '' }
  dialogVisible.value = true
}

const editProveedor = (prov) => {
  editing.value = true
  form.value = {
    id: prov.id,
    nombre: prov.nombre,
    telefono: prov.telefono,
    email: prov.email,
    direccion: prov.direccion
  }
  dialogVisible.value = true
}

const saveProveedor = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await updateProveedor(form.value.id, form.value)
      alert('Proveedor actualizado')
    } else {
      await createProveedor(form.value)
      alert('Proveedor creado')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('Error guardando:', error)
    alert('Error al guardar')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (prov) => {
  if (confirm(`¿Desactivar al proveedor "${prov.nombre}"?`)) {
    deleteProveedor(prov.id)
      .then(() => {
        alert('Proveedor desactivado')
        loadData()
      })
      .catch(() => alert('Error al desactivar'))
  }
}

onMounted(loadData)
</script>

<style scoped>
.proveedores { padding: 2rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.btn-primary { background: #42A5F5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-primary:hover { background: #1E88E5; }
.btn-secondary { background: #ccc; color: black; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-edit { background: #66BB6A; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; margin-right: 0.5rem; cursor: pointer; }
.btn-delete { background: #EF5350; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background: #f2f2f2; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
.modal { background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 90%; }
.form-group { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
input, textarea { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
</style>