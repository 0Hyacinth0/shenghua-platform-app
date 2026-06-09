import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ====== 认证页面（无 TabBar） ======
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
      meta: { showTabBar: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/login/register.vue'),
      meta: { showTabBar: false },
    },

    // ====== 5 个 Tab 主页面（有 TabBar） ======
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
      meta: { showTabBar: true, tabKey: 'home' },
    },
    {
      path: '/category',
      name: 'category',
      component: () => import('@/views/mall/index.vue'),
      meta: { showTabBar: true, tabKey: 'category' },
    },
    {
      path: '/community',
      name: 'community',
      component: () => import('@/views/community/index.vue'),
      meta: { showTabBar: true, tabKey: 'community' },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/cart/index.vue'),
      meta: { showTabBar: true, tabKey: 'cart' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/profile/index.vue'),
      meta: { showTabBar: true, tabKey: 'profile' },
    },

    // ====== 社区子页面 ======
    {
      path: '/community/post/:id',
      name: 'communityPostDetail',
      component: () => import('@/views/community/detail.vue'),
      meta: { showTabBar: true },
    },
    {
      path: '/community/create',
      name: 'communityCreate',
      component: () => import('@/views/community/create.vue'),
      meta: { showTabBar: false },
    },
    {
      path: '/community/my',
      name: 'communityMy',
      component: () => import('@/views/community/my.vue'),
      meta: { showTabBar: true },
    },
    {
      path: '/community/user/:userId',
      name: 'communityUser',
      component: () => import('@/views/community/user.vue'),
      meta: { showTabBar: true },
    },

    // ====== 其他页面（有 TabBar 但非切换 tab） ======
    {
      path: '/',
      component: () => import('@/layouts/default.vue'),
      children: [
        // 商品
        { path: 'product/:id', name: 'productDetail', component: () => import('@/views/product/detail.vue'), meta: { showTabBar: true } },
        // 结算
        { path: 'checkout', name: 'checkout', component: () => import('@/views/checkout/index.vue'), meta: { showTabBar: false } },
        // 订单
        { path: 'orders', name: 'orders', component: () => import('@/views/order/list.vue'), meta: { showTabBar: true } },
        { path: 'order/:id', name: 'orderDetail', component: () => import('@/views/order/detail.vue'), meta: { showTabBar: true } },
        // 收货地址
        { path: 'address', name: 'address', component: () => import('@/views/address/index.vue'), meta: { showTabBar: true } },
        // 商家
        { path: 'merchant/apply', name: 'merchantApply', component: () => import('@/views/merchant/apply.vue'), meta: { showTabBar: true } },
        { path: 'merchant/products', name: 'merchantProducts', component: () => import('@/views/merchant/products.vue'), meta: { showTabBar: true } },
        // 优惠券
        { path: 'coupon', name: 'coupon', component: () => import('@/views/coupon/index.vue'), meta: { showTabBar: true } },
        // 秒杀
        { path: 'seckill', name: 'seckill', component: () => import('@/views/seckill/index.vue'), meta: { showTabBar: true } },
        // 签到
        { path: 'signIn', name: 'signIn', component: () => import('@/views/signIn/index.vue'), meta: { showTabBar: true } },
        // 拼团
        { path: 'groupBuy', name: 'groupBuy', component: () => import('@/views/groupBuy/index.vue'), meta: { showTabBar: true } },
        { path: 'groupBuy/checkout', name: 'groupBuyCheckout', component: () => import('@/views/groupBuy/checkout.vue'), meta: { showTabBar: false } },
        // 消息
        { path: 'messages', name: 'messages', component: () => import('@/views/message/index.vue'), meta: { showTabBar: true } },
        { path: 'chat', name: 'chat', component: () => import('@/views/message/chat.vue'), meta: { showTabBar: false } },
        // 学习
        { path: 'learn', name: 'learn', component: () => import('@/views/learn/index.vue'), meta: { showTabBar: true } },
        // 分销
        { path: 'distributor', name: 'distributor', component: () => import('@/views/distributor/index.vue'), meta: { showTabBar: true } },
        // 课程
        { path: 'course', name: 'course', component: () => import('@/views/course/index.vue'), meta: { showTabBar: true } },
        { path: 'course/:id', name: 'courseDetail', component: () => import('@/views/course/detail.vue'), meta: { showTabBar: false } },
        { path: 'course/watch/:lessonId', name: 'courseWatch', component: () => import('@/views/course/watch.vue'), meta: { showTabBar: false } },
        { path: 'course/checkout', name: 'courseCheckout', component: () => import('@/views/course/checkout.vue'), meta: { showTabBar: false } },
        { path: 'course/my', name: 'courseMy', component: () => import('@/views/course/my.vue'), meta: { showTabBar: true } },
        { path: 'course/lecturer/apply', name: 'lecturerApply', component: () => import('@/views/course/lecturer/apply.vue'), meta: { showTabBar: true } },
        { path: 'course/lecturer/courses', name: 'lecturerCourses', component: () => import('@/views/course/lecturer/courses.vue'), meta: { showTabBar: true } },
        { path: 'course/lecturer/income', name: 'lecturerIncome', component: () => import('@/views/course/lecturer/income.vue'), meta: { showTabBar: true } },
        // 通用页面
        { path: 'page', name: 'page', component: () => import('@/views/page/index.vue'), meta: { showTabBar: true } },
      ],
    },
  ],
})

export default router
