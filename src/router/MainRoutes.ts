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
                {
            name: 'Classes',
            path: '/ui/classes',
            component: () => import('@/views/ui-components/Classes.vue')
        },
        {
            name: 'Modules',
            path: '/ui/modules',
            component: () => import('@/views/ui-components/Modules.vue')
        },
        {
            name: 'Groups',
            path: '/ui/groups',
            component: () => import('@/views/ui-components/Groups.vue')
        },
        {
            name: 'Absences',
            path: '/ui/absences',
            component: () => import('@/views/ui-components/Absences.vue')
        },
        {
            name: 'Exams',
            path: '/ui/exams',
            component: () => import('@/views/ui-components/Exams.vue')
        },
        // {
        //     name: 'Grades',
        //     path: '/ui/grades',
        //     component: () => import('@/views/ui-components/Grades.vue')
        // },
        {
            name: 'Financials',
            path: '/ui/financials',
            component: () => import('@/views/ui-components/Financials.vue')
        },
        // {
        //     name: 'Results',
        //     path: '/ui/results',
        //     component: () => import('@/views/ui-components/Results.vue')
        // },
        {
            name: 'Annoucements',
            path: '/ui/ann',
            component: () => import('@/views/ui-components/ann.vue')
        }

       
    ]
};

export default MainRoutes;