<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <div class="cards">
      <div class="card" v-for="item in resumen" :key="item.label">
        <div class="card-icon" :style="{ backgroundColor: item.color }">
          <!-- Aquí podrías usar un icono con emoji o texto -->
          <span>{{ item.icon }}</span>
        </div>
        <div class="card-content">
          <span class="card-label">{{ item.label }}</span>
          <span class="card-value">{{ item.value }}</span>
        </div>
      </div>
    </div>

    <div class="stock-bajo">
      <h2>Stock Bajo</h2>
      <div v-if="bajoStock.length">
        <table>
          <thead>
            <tr>
              <th>Repuesto</th>
              <th>Stock</th>
              <th>Mínimo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in bajoStock" :key="item.id">
              <td>{{ item.nombre }}</td>
              <td>{{ item.stock }}</td>
              <td>{{ item.stock_minimo }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else>No hay repuestos con stock bajo.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getRepuestos, getBajoStock } from '../services/repuestos'
import { getCategorias } from '../services/categorias'
import { getProveedores } from '../services/proveedores'
import { getMovimientos } from '../services/movimientos'

const resumen = ref([])
const bajoStock = ref([])

onMounted(async () => {
  try {
    const [repuestosRes, categoriasRes, proveedoresRes, movimientosRes, bajoStockRes] = await Promise.all([
      getRepuestos(),
      getCategorias(),
      getProveedores(),
      getMovimientos(),
      getBajoStock()
    ])

    resumen.value = [
      { label: 'Repuestos', value: repuestosRes.data.length, icon: '📦', color: '#42A5F5' },
      { label: 'Categorías', value: categoriasRes.data.length, icon: '🏷️', color: '#66BB6A' },
      { label: 'Proveedores', value: proveedoresRes.data.length, icon: '🚚', color: '#FFA726' },
      { label: 'Movimientos', value: movimientosRes.data.length, icon: '📋', color: '#AB47BC' }
    ]

    bajoStock.value = bajoStockRes.data
  } catch (error) {
    console.error('Error cargando dashboard:', error)
  }
})
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}
.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
}
.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: white;
  font-size: 1.5rem;
}
.card-content {
  display: flex;
  flex-direction: column;
}
.card-label {
  font-size: 0.9rem;
  color: #666;
}
.card-value {
  font-size: 1.5rem;
  font-weight: bold;
}
.stock-bajo table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.stock-bajo th, .stock-bajo td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.stock-bajo th {
  background-color: #f2f2f2;
}
</style>