import { Routes } from "@angular/router";

export const usersRoutes: Routes = [
    {
        path: '',
        loadComponent: ()=>import('./layout/user-layout/user-layout.component'),
        children: [
            {
                path:'home',
                loadComponent: () => import('./pages/home-user-page/home-user-page.component'),
                title:'Inicio'
            },
            {
                path:'**',
                redirectTo:'home',
                pathMatch:'full'
            }
        ]
    }
];

export default usersRoutes;