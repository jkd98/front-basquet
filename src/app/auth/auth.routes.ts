import { Routes } from "@angular/router";

export const authRoutes: Routes = [
    {
        path: '',
        loadComponent: ()=>import('./layout/auth-layout/auth-layout.component'),
        children: [
            {
                path: 'login',
                title: 'Iniciar Sesión',
                loadComponent: () => import('./pages/login-page/login-page.component'),
            },
            {
                path: 'register',
                title: 'Crear Cuenta',
                loadComponent: () => import('./pages/register-page/register-page.component')
            },
            {
                path: 'confirm-account',
                title: 'Confirmar Cuenta',
                loadComponent: () => import('./pages/confirm-account-page/confirm-account-page.component')
            },
            {
                path: 'forgot-pass',
                title: 'Solicitar Nueva Contraseña',
                loadComponent: () => import('./pages/request-new-pass-page/request-new-pass-page.component')
            },
            {
                path: 'new-pass',
                title: 'Nueva Contraseña',
                loadComponent: () => import('./pages/new-pass-page/new-pass-page.component')
            },
            {
                path:'**',
                redirectTo:'login',
                pathMatch:'full'
            }
        ]
    }
];

export default authRoutes;