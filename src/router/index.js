import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/prueba',
    name: 'prueba',
    component: () => import('../views/prueba.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/repuestos',
    name: 'Repuestos',
    component: () => import('../views/RepuestosView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categorias',
    name: 'Categorias',
    component: () => import('../views/CategoriasView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/proveedores',
    name: 'Proveedores',
    component: () => import('../views/ProveedoresView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/movimientos',
    name: 'Movimientos',
    component: () => import('../views/MovimientosView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  await authStore.checkUser()

  if (to.meta.requiresAuth && !authStore.user) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.user) {
    next('/')
  } else {
    next()
  }
})

export default router