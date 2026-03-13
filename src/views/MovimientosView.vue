<template>
  <div class="movimientos">
    <div class="header">
      <h1>Movimientos de stock</h1>
      <button @click="openDialog" class="btn-primary">Nuevo movimiento</button>
    </div>

    <div v-if="loading">Cargando...</div>
    <table v-else>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Repuesto</th>
          <th>Tipo</th>
          <th>Cantidad</th>
          <th>Motivo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="mov in movimientos" :key="mov.id">
          <td>{{ new Date(mov.created_at).toLocaleString() }}</td>
          <td>
            <span v-if="mov.repuestos">{{ mov.repuestos.nombre }}</span>
            <span v-else class="deleted">❌ Repuesto eliminado</span>
          </td>
          <td>
            <span :class="mov.tipo === 'entrada' ? 'entrada' : 'salida'">
              {{ mov.tipo === 'entrada' ? 'Entrada' : 'Salida' }}
            </span>
          </td>
          <td>{{ mov.cantidad }}</td>
          <td>{{ mov.motivo || '-' }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal para nuevo movimiento -->
    <div v-if="dialogVisible" class="modal-overlay">
      <div class="modal">
        <h2>Nuevo movimiento</h2>
        <form @submit.prevent="saveMovimiento">
          <div class="form-group">
            <label>Repuesto *</label>
            <select v-model="form.repuesto_id" required>
              <option v-for="rep in repuestos" :key="rep.id" :value="rep.id">
                {{ rep.nombre }} (Stock: {{ rep.stock }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Tipo *</label>
            <select v-model="form.tipo" required>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </select>
          </div>
          <div class="form-group">
            <label>Cantidad *</label>
            <input type="number" v-model="form.cantidad" min="1" required />
          </div>
          <div class="form-group">
            <label>Motivo</label>
            <input v-model="form.motivo" />
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
import { getMovimientos, createMovimiento } from '../services/movimientos'
import { getRepuestos } from '../services/repuestos'

const movimientos = ref([])
const repuestos = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const form = ref({
  repuesto_id: null,
  tipo: 'entrada',
  cantidad: 1,
  motivo: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const [movRes, repRes] = await Promise.all([
      getMovimientos(),
      getRepuestos()
    ])
    movimientos.value = movRes.data
    repuestos.value = repRes.data
  } catch (error) {
    console.error('Error cargando movimientos:', error)
    alert('Error al cargar movimientos')
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  form.value = {
    repuesto_id: null,
    tipo: 'entrada',
    cantidad: 1,
    motivo: ''
  }
  dialogVisible.value = true
}

const saveMovimiento = async () => {
  saving.value = true
  try {
    await createMovimiento(form.value)
    alert('Movimiento registrado')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('Error guardando movimiento:', error)
    alert(error.response?.data?.error || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.movimientos { padding: 2rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.btn-primary { background: #42A5F5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.btn-primary:hover { background: #1E88E5; }
.btn-secondary { background: #ccc; color: black; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background: #f2f2f2; }
.entrada { color: green; font-weight: bold; }
.salida { color: red; font-weight: bold; }
.deleted { color: gray; font-style: italic; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
.modal { background: white; padding: 2rem; border-radius: 8px; max-width: 400px; width: 90%; }
.form-group { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
input, select { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
</style>