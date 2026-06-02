import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/login/register.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/default.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/home/index.vue') },
        { path: 'product/:id', name: 'productDetail', component: () => import('@/views/product/detail.vue') },
        { path: 'cart', name: 'cart', component: () => import('@/views/cart/index.vue') },
        { path: 'checkout', name: 'checkout', component: () => import('@/views/checkout/index.vue') },
        { path: 'orders', name: 'orders', component: () => import('@/views/order/list.vue') },
        { path: 'order/:id', name: 'orderDetail', component: () => import('@/views/order/detail.vue') },
        { path: 'address', name: 'address', component: () => import('@/views/address/index.vue') },
        { path: 'merchant/apply', name: 'merchantApply', component: () => import('@/views/merchant/apply.vue') },
        { path: 'merchant/products', name: 'merchantProducts', component: () => import('@/views/merchant/products.vue') },
        { path: 'coupon', name: 'coupon', component: () => import('@/views/coupon/index.vue') },
        { path: 'seckill', name: 'seckill', component: () => import('@/views/seckill/index.vue') },
        { path: 'signIn', name: 'signIn', component: () => import('@/views/signIn/index.vue') },
        { path: 'groupBuy', name: 'groupBuy', component: () => import('@/views/groupBuy/index.vue') },
        { path: 'groupBuy/checkout', name: 'groupBuyCheckout', component: () => import('@/views/groupBuy/checkout.vue') },
        { path: 'profile', name: 'profile', component: () => import('@/views/profile/index.vue') },
        { path: 'page', name: 'page', component: () => import('@/views/page/index.vue') },
      ],
    },
  ],
})

export default router
