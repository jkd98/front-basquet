import { Routes } from "@angular/router";
import { authGuard } from "../shared/guards/auth.guard";

export const usersRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layout/user-layout/user-layout.component'),
        children: [
            {
                path: 'home',
                loadComponent: () => import('./pages/home-user-page/home-user-page.component'),
                title: 'Sistema de Gestión Deportiva - Inicio'
            },
            {
                path: 'register-team',
                loadComponent: () => import('./pages/register-team-page/register-team-page.component'),
                title: 'Registro de Equipo',
                //canActivate: [authGuard]
            },
            {
                path: 'my-team',
                loadComponent: () => import('./pages/my-team/my-team.component').then(m => m.MyTeamComponent),
                title: 'Mi Equipo',
                canActivate: [authGuard]
            },
            {
                path: '**',
                redirectTo: 'home',
                pathMatch: 'full'
            }
        ]
    }
];

export default usersRoutes;