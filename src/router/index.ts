import { createRouter, createWebHistory } from 'vue-router'
import TestView from '@/views/TestView.vue'
import OwnerView from '@/views/OwnerView.vue'

// Explicit routes, not an `app/` folder. createWebHistory ≈ browser History API in Next.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'test',
      component: TestView,
    },
    {
      path: '/owner',
      name: 'owner',
      component: OwnerView,
    },
  ],
})

export default router
