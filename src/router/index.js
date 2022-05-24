import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import welcome from '../components/WelCome.vue'
import user from '../components/uers/user.vue'
import right from '../components/rights/rights.vue'
import roles from '../components/rights/roles.vue'
import cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home', component: Home, redirect: '/welcome', children: [
      { path: '/welcome', component: welcome },
      { path: '/users', component: user },
      { path: '/rights', component: right },
      { path: '/roles', component: roles },
      { path: '/categories', component: cate },
      { path: '/params', component: Params },
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()

})
export default router
