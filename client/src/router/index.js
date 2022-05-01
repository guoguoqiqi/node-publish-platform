import Vue from 'vue'
import Router from 'vue-router'
const PageHome = () => import('../views/PageHome.vue')

Vue.use(Router)

const router = new Router({
	routes: [
		{
			path: '/',
			redirect: '/home',
		},
		{
			path: '/home',
			name: 'PageHome',
			component: PageHome,
		},
	],
})

export default router
