import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout'

const routes = [
  { path: '/', component: Layout, redirect: 'marketplace', children: [
    {
      path: '/marketplace',
      name: 'Marketplace',
      component: () => import('@/views/Marketplace'),
      meta: {
      }
    },
    {
      path: '/my-collection',
      name: 'MyCollection',
      component: () => import('@/views/MyCollection'),
      meta: {
      }
    },
  ] },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_BASE_URL),
  routes
})

export default router
