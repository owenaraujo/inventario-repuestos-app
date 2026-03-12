<template>
  <div class="repuestos">
    <div class="header">
      <h1>Repuestos</h1>
      <button @click="openDialog" class="btn-primary">Nuevo repuesto</button>
    </div>

    <div v-if="loading">Cargando...</div>
    <table v-else>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Proveedor</th>
          <th>Stock</th>
          <th>Precio venta</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="repuesto in repuestos" :key="repuesto.id">
          <td>{{ repuesto.nombre }}</td>
          <td>{{ repuesto.categoria?.nombre || '-' }}</td>
          <td>{{ repuesto.proveedor?.nombre || '-' }}</td>
          <td :class="{ 'stock-bajo': repuesto.stock <= repuesto.stock_minimo }">
            {{ repuesto.stock }}
          </td>
          <td>{{ formatCurrency(repuesto.precio_venta) }}</td>
          <td>
            <button @click="editRepuesto(repuesto)" class="btn-edit">Editar</button>
            <button @click="confirmDelete(repuesto)" class="btn-delete">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="dialogVisible" class="modal-overlay">
      <div class="modal">
        <h2>{{ editing ? 'Editar repuesto' : 'Nuevo repuesto' }}</h2>
        <form @submit.prevent="saveRepuesto">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="form.nombre" required />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.descripcion" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Categoría</label>
            <select v-model="form.categoria_id">
              <option :value="null">Selecciona</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Proveedor</label>
            <select v-model="form.proveedor_id">
              <option :value="null">Selecciona</option>
              <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">{{ prov.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Stock</label>
            <input type="number" v-model="form.stock" min="0" />
          </div>
          <div class="form-group">
            <label>Stock mínimo</label>
            <input type="number" v-model="form.stock_minimo" min="1" />
          </div>
          <div class="form-group">
            <label>Precio compra</label>
            <input type="number" step="0.01" v-model="form.precio_compra" />
          </div>
          <div class="form-group">
            <label>Precio venta</label>
            <input type="number" step="0.01" v-model="form.precio_venta" />
          </div>
          <div class="form-group">
            <label>Ubicación</label>
            <input v-model="form.ubicacion" />
          </div>
          <div class="form-group">
            <label>URL imagen</label>
            <input v-model="form.imagen_url" />
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
import { getRepuestos, createRepuesto, updateRepuesto, deleteRepuesto } from '../services/repuestos'
import { getCategorias } from '../services/categorias'
import { getProveedores } from '../services/proveedores'

const repuestos = ref([])
const categorias = ref([])
const proveedores = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editing = ref(false)
const form = ref({})

const loadData = async () => {
  loading.value = true
  try {
    const [repuestosRes, categoriasRes, proveedoresRes] = await Promise.all([
      getRepuestos(),
      getCategorias(),
      getProveedores()
    ])
    repuestos.value = repuestosRes.data
    categorias.value = categoriasRes.data
    proveedores.value = proveedoresRes.data
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  editing.value = false
  form.value = {
    nombre: '',
    descripcion: '',
    categoria_id: null,
    proveedor_id: null,
    stock: 0,
    stock_minimo: 5,
    precio_compra: null,
    precio_venta: null,
    ubicacion: '',
    imagen_url: ''
  }
  dialogVisible.value = true
}

const editRepuesto = (repuesto) => {
  editing.value = true
  form.value = { ...repuesto }
  dialogVisible.value = true
}

const saveRepuesto = async () => {
  saving.value = true
  try {
    if (editing.value) {
      console.log(form.value);
      
      const newForm ={
         id: form.value.id,
  nombre: form.value.nombre,
  descripcion: form.value.descripcion,
  stock: form.value.stock,
  stock_minimo: form.value.stock_minimo,
  precio_compra: form.value.precio_compra,
  precio_venta: form.value.precio_venta,
  ubicacion: form.value.ubicacion,
  imagen_url: form.value.imagen_url,
      }
      await updateRepuesto(form.value.id, newForm)
      alert('Repuesto actualizado')
    } else {
      await createRepuesto(form.value)
      alert('Repuesto creado')
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

const confirmDelete = (repuesto) => {
  if (confirm(`¿Estás seguro de eliminar ${repuesto.nombre}?`)) {
    deleteRepuesto(repuesto.id)
      .then(() => {
        alert('Repuesto eliminado')
        loadData()
      })
      .catch((error) => {
        console.error('Error eliminando:', error)
        alert('Error al eliminar')
      })
  }
}

const formatCurrency = (value) => {
  if (value == null) return '-'
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(value)
}

onMounted(loadData)
</script>

<style scoped>
.repuestos {
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
.stock-bajo {
  background-color: #ffcdd2;
  font-weight: bold;
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
input, select, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>