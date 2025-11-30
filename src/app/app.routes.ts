import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes'),
    },
    {
        path: 'users',
        loadChildren: () => import('./users/users.routes'),
    },
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes'),
        canActivate: [authGuard]

    },
    {
        path: '**',
        redirectTo: '/users',
        pathMatch: 'full'
    }
];
