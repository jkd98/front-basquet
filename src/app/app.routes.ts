import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes'),
    },
    {
        path:'users',
        loadChildren: () => import('./users/users.routes'),
    },
    {
        path:'admin',
        loadChildren: ()=>import('./admin/admin.routes')
    },
    {
        path: '**',
        redirectTo: '/users',
        pathMatch: 'full'
    }
];
