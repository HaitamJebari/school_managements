const MainRoutes = {
    path: '/main',
    meta: {
        requiresAuth: true
    },
    redirect: '/main',
    component: () => import('@/layouts/full/FullLayout.vue'),
    children: [
        {
            name: 'Dashboard',
            path: '/',
            component: () => import('@/views/dashboard/index.vue')
        },
        {
            name: 'Alert',
            path: '/ui/alerts',
            component: () => import('@/views/ui-components/Alerts.vue')
        },
        {
            name: 'Teachers',
            path: '/ui/teachers',
            component: () => import('@/views/ui-components/Teachers.vue')
        },
        {
            name: 'Students',
            path: '/ui/students',
            component: () => import('@/views/ui-components/Students.vue')
        },

       
    ]
};

export default MainRoutes;