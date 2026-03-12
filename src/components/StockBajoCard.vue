<template>
  <div class="card">
    <div class="card-header">
      <h3>Stock Bajo</h3>
      <Badge :value="repuestos.length" severity="warning" />
    </div>
    <div class="card-body">
      <ul v-if="repuestos.length">
        <li v-for="item in repuestos" :key="item.id">
          {{ item.nombre }} - Stock: {{ item.stock }} / Mínimo: {{ item.stock_minimo }}
        </li>
      </ul>
      <p v-else>No hay repuestos con stock bajo.</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import Badge from 'primevue/badge'

defineProps({
  repuestos: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: white;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.card-header h3 {
  margin: 0;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}
li:last-child {
  border-bottom: none;
}
</style>