const AuthRoutes = {
    path: '/auth',
    component: () => import('@/layouts/blank/BlankLayout.vue'),
    meta: {
        requiresAuth: false
    },
    children: [

        {
            name: 'Login',
            path: 'login',
            component: () => import('@/views/authentication/BoxedLogin.vue')
        },
        {
            name: 'Register',
            path: 'register',
            component: () => import('@/views/authentication/BoxedRegister.vue')
        }
    ]
};

export default AuthRoutes;
