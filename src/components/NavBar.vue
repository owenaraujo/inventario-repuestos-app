<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <img src="../assets/logo.png" alt="Logo" height="40" />
      <span>Inventario Repuestos</span>
    </div>
    <ul class="navbar-menu">
      <li><router-link to="/">Dashboard</router-link></li>
      <li><router-link to="/repuestos">Repuestos</router-link></li>
      <li><router-link to="/categorias">Categorías</router-link></li>
      <li><router-link to="/proveedores">Proveedores</router-link></li>
      <li><router-link to="/movimientos">Movimientos</router-link></li>
    </ul>
    <div class="navbar-end">
      <button @click="handleLogout" class="btn-logout">Cerrar sesión</button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2c3e50;
  color: white;
  padding: 0.5rem 2rem;
}
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.navbar-menu {
  display: flex;
  list-style: none;
  gap: 1.5rem;
}
.navbar-menu a {
  color: white;
  text-decoration: none;
}
.navbar-menu a:hover {
  text-decoration: underline;
}
.navbar-end .btn-logout {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.navbar-end .btn-logout:hover {
  background-color: #c0392b;
}
</style>