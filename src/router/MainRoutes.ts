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
            path: '/alerts',
            component: () => import('@/views/ui-components/Alerts.vue')
        },
        {
            name: 'Teachers',
            path: '/teachers',
            component: () => import('@/views/ui-components/Teachers.vue')
        },
        {
            name: 'Students',
            path: '/students',
            component: () => import('@/views/ui-components/Students.vue')
        },
                {
            name: 'Classes',
            path: '/classes',
            component: () => import('@/views/ui-components/Classes.vue')
        },
        {
            name: 'Modules',
            path: '/modules',
            component: () => import('@/views/ui-components/Modules.vue')
        },
        {
            name: 'Groups',
            path: '/groups',
            component: () => import('@/views/ui-components/Groups.vue')
        },
        {
            name: 'Absences',
            path: '/absences',
            component: () => import('@/views/ui-components/Absences.vue')
        },
        {
            name: 'Exams',
            path: '/exams',
            component: () => import('@/views/ui-components/Exams.vue')
        },
        // {
        //     name: 'Grades',
        //     path: '/grades',
        //     component: () => import('@/views/ui-components/Grades.vue')
        // },
        {
            name: 'Financials',
            path: '/financials',
            component: () => import('@/views/ui-components/Financials.vue')
        },
        // {
        //     name: 'Results',
        //     path: '/results',
        //     component: () => import('@/views/ui-components/Results.vue')
        // },
        {
            name: 'Annoucements',
            path: '/ann',
            component: () => import('@/views/ui-components/ann.vue')
        }

       
    ]
};

export default MainRoutes;