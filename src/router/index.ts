import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  // Literal yo'llar /:slug dan oldin turadi: "global" maktab slug i sifatida talqin qilinmaydi
  { path: '/global', name: 'global', component: () => import('@/views/GlobalView.vue') },
  {
    path: '/global/tv',
    name: 'global-tv',
    component: () => import('@/views/tv/TvView.vue'),
    meta: { tv: true },
  },
  { path: '/:slug', name: 'school', component: () => import('@/views/SchoolView.vue') },
  {
    path: '/:slug/tv',
    name: 'school-tv',
    component: () => import('@/views/tv/TvView.vue'),
    meta: { tv: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

export function createAppRouter(history = createWebHistory()) {
  return createRouter({
    history,
    routes,
    scrollBehavior: (to, from) =>
      // Filtr/tab o'zgarishi (faqat query) sahifani tepaga sakratmaydi
      to.path === from.path ? false : { top: 0 },
  })
}
