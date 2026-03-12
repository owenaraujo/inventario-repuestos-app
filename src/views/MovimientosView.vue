<template>
  <div class="movimientos">
    <div class="header">
      <h1>Movimientos de stock</h1>
      <button @click="openDialog" class="btn-primary">Nuevo movimiento</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Repuesto</th>
          <th>Tipo</th>
          <th>Cantidad</th>
          <th>Motivo</th>
          <th>Usuario</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="mov in movimientos" :key="mov.id">
          <td>{{ formatDate(mov.created_at) }}</td>
          <td>{{ mov.repuestos?.nombre || '-' }}</td>
          <td>
            <span :class="['badge', mov.tipo === 'entrada' ? 'badge-entrada' : 'badge-salida']">
              {{ mov.tipo === 'entrada' ? 'Entrada' : 'Salida' }}
            </span>
          </td>
          <td>{{ mov.cantidad }}</td>
          <td>{{ mov.motivo || '-' }}</td>
          <td>{{ mov.usuario_id?.substring(0,8) || '-' }}</td>
          <td>
            <button @click="confirmDelete(mov)" class="btn-delete">Eliminar</button>
          </td>
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
              <option value="" disabled selected>Selecciona un repuesto</option>
              <option v-for="rep in repuestos" :key="rep.id" :value="rep.id">
                {{ rep.nombre }} (Stock actual: {{ rep.stock }})
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
import { getMovimientos, createMovimiento, deleteMovimiento } from '../services/movimientos'
import { getRepuestos } from '../services/repuestos'

const movimientos = ref([])
const repuestos = ref([])
const dialogVisible = ref(false)
const saving = ref(false)
const form = ref({
  repuesto_id: '',
  tipo: 'entrada',
  cantidad: 1,
  motivo: ''
})

const loadData = async () => {
  try {
    const [movRes, repRes] = await Promise.all([
      getMovimientos(),
      getRepuestos()
    ])
    movimientos.value = movRes.data
    repuestos.value = repRes.data
  } catch (error) {
    console.error('Error cargando datos:', error)
    alert('Error al cargar los movimientos')
  }
}

const openDialog = () => {
  form.value = {
    repuesto_id: '',
    tipo: 'entrada',
    cantidad: 1,
    motivo: ''
  }
  dialogVisible.value = true
}

const saveMovimiento = async () => {
  // Validar que la cantidad no exceda el stock si es salida
  if (form.value.tipo === 'salida') {
    const repuesto = repuestos.value.find(r => r.id === form.value.repuesto_id)
    if (repuesto && repuesto.stock < form.value.cantidad) {
      alert('Stock insuficiente para esta salida')
      return
    }
  }

  saving.value = true
  try {
    await createMovimiento(form.value)
    alert('Movimiento registrado correctamente')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('Error guardando movimiento:', error)
    alert(error.response?.data?.error || 'Error al guardar el movimiento')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (mov) => {
  if (confirm('¿Estás seguro de eliminar este movimiento? Esta acción no se puede deshacer.')) {
    deleteMovimiento(mov.id)
      .then(() => {
        alert('Movimiento eliminado')
        loadData()
      })
      .catch((error) => {
        console.error('Error eliminando movimiento:', error)
        alert('Error al eliminar el movimiento')
      })
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(loadData)
</script>

<style scoped>
.movimientos {
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
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  color: white;
}
.badge-entrada {
  background-color: #4CAF50;
}
.badge-salida {
  background-color: #f44336;
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
input, select, textarea {
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