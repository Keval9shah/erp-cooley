import { createRouter, createWebHistory } from 'vue-router'
import AgGrid from './components/AgGrid.vue'
import Textile from './pages/Textile.vue'

const routes = [
  { path: '/', redirect: '/inspection' },
  { path: '/inspection', component: AgGrid },
  { path: '/textile', component: Textile }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router