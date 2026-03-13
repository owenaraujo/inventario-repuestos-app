<template>
  <div class="repuestos">
    <div class="header">
      <h1>Repuestos</h1>
      <button @click="openDialog" class="btn-primary">Nuevo repuesto</button>
    </div>

    <!-- Buscador y selector de límite -->
    <div class="filters">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Buscar por nombre o descripción..."
        class="search-input"
        @keyup="loadData(1)"
      />
      <select v-model="pageSize" @change="loadData(1)" class="page-size-select">
        <option value="10">10 por página</option>
        <option value="20">20 por página</option>
        <option value="30">30 por página</option>
      </select>
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
        <tr v-for="rep in repuestos" :key="rep.id">
          <td>{{ rep.nombre }}</td>
          <td>{{ rep.categorias?.nombre || '-' }}</td>
          <td>{{ rep.proveedores?.nombre || '-' }}</td>
          <td :class="{ 'stock-bajo': rep.stock <= rep.stock_minimo }">
            {{ rep.stock }}
          </td>
          <td>{{ formatCurrency(rep.precio_venta) }}</td>
          <td>
            <button @click="editRepuesto(rep)" class="btn-edit">Editar</button>
            <button @click="confirmDelete(rep)" class="btn-delete">Desactivar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Paginación numérica -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="loadData(currentPage - 1)" :disabled="currentPage === 1">Anterior</button>

      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="loadData(page)"
          :class="{ active: page === currentPage }"
          class="page-btn"
        >
          {{ page }}
        </button>
      </div>

      <button @click="loadData(currentPage + 1)" :disabled="currentPage === totalPages">Siguiente</button>
    </div>

    <!-- Modal (sin cambios) -->
    <!-- Modal para crear/editar repuesto -->
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
          <option :value="null">Sin categoría</option>
          <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Proveedor</label>
        <select v-model="form.proveedor_id">
          <option :value="null">Sin proveedor</option>
          <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">{{ prov.nombre }}</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-group half">
          <label>Stock</label>
          <input type="number" v-model="form.stock" min="0" />
        </div>
        <div class="form-group half">
          <label>Stock mínimo</label>
          <input type="number" v-model="form.stock_minimo" min="1" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group half">
          <label>Precio compra</label>
          <input type="number" step="0.01" v-model="form.precio_compra" />
        </div>
        <div class="form-group half">
          <label>Precio venta</label>
          <input type="number" step="0.01" v-model="form.precio_venta" />
        </div>
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
import { ref, onMounted, computed } from 'vue'
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
const form = ref({
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
})

// Paginación y búsqueda
const searchQuery = ref('')
const pageSize = ref(10)
const currentPage = ref(1)
const totalItems = ref(0)

const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

const visiblePages = computed(() => {
  const delta = 2
  const start = Math.max(1, currentPage.value - delta)
  const end = Math.min(totalPages.value, currentPage.value + delta)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const loadData = async (page = 1) => {
  loading.value = true
  currentPage.value = page
  try {
    const repuestosRes = await getRepuestos(page, pageSize.value, searchQuery.value)
    repuestos.value = repuestosRes.data
    totalItems.value = repuestosRes.total

    const [categoriasRes, proveedoresRes] = await Promise.all([
      getCategorias(),
      getProveedores()
    ])
    categorias.value = categoriasRes.data
    proveedores.value = proveedoresRes.data
  } catch (error) {
    console.error('Error cargando datos:', error)
    alert('Error al cargar datos')
  } finally {
    loading.value = false
  }
}

// Funciones del modal
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

const editRepuesto = (rep) => {
  editing.value = true
  form.value = {
    id: rep.id,
    nombre: rep.nombre,
    descripcion: rep.descripcion,
    categoria_id: rep.categoria_id,
    proveedor_id: rep.proveedor_id,
    stock: rep.stock,
    stock_minimo: rep.stock_minimo,
    precio_compra: rep.precio_compra,
    precio_venta: rep.precio_venta,
    ubicacion: rep.ubicacion,
    imagen_url: rep.imagen_url
  }
  dialogVisible.value = true
}

const saveRepuesto = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await updateRepuesto(form.value.id, form.value)
      alert('Repuesto actualizado')
    } else {
      await createRepuesto(form.value)
      alert('Repuesto creado')
    }
    dialogVisible.value = false
    loadData(currentPage.value)
  } catch (error) {
    console.error('Error guardando:', error)
    alert('Error al guardar')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (rep) => {
  if (confirm(`¿Desactivar el repuesto "${rep.nombre}"?`)) {
    deleteRepuesto(rep.id)
      .then(() => {
        alert('Repuesto desactivado')
        loadData(currentPage.value)
      })
      .catch(() => alert('Error al desactivar'))
  }
}

const formatCurrency = (value) => {
  if (value == null) return '-'
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(value)
}

onMounted(() => loadData(1))
</script>

<style scoped>
/* Estilos (incluye los de paginación) */
.repuestos { padding: 2rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.filters { display: flex; gap: 1rem; margin-bottom: 1rem; }
.search-input { flex: 1; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
.page-size-select { width: auto; min-width: 80px; padding: 0.4rem; font-size: 0.9rem; border: 1px solid #ccc; border-radius: 4px; }
.btn-primary { background: #42A5F5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-primary:hover { background: #1E88E5; }
.btn-secondary { background: #ccc; color: black; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-edit { background: #66BB6A; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; margin-right: 0.5rem; cursor: pointer; }
.btn-delete { background: #EF5350; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background: #f2f2f2; }
.stock-bajo { background-color: #ffcdd2; font-weight: bold; }
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}
.page-numbers { display: flex; gap: 0.3rem; }
.page-btn {
  padding: 0.3rem 0.7rem;
  border: 1px solid #ccc;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  min-width: 35px;
}
.page-btn.active { background: #42A5F5; color: white; border-color: #42A5F5; }
.page-btn:hover:not(.active) { background: #f0f0f0; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
.modal { background: white; padding: 2rem; border-radius: 8px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; }
.form-group { margin-bottom: 1rem; }
.form-row { display: flex; gap: 1rem; }
.form-row .half { flex: 1; }
label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
input, select, textarea { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
</style>