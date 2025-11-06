import { Routes } from "@angular/router";

export const adminRoutes: Routes = [
    {
        path: '',
        loadComponent: ()=>import('./layout/admin-layout/admin-layout.component'),
        children: [
            {
                path:'home',
                loadComponent: () => import('./pages/home-page/home-page.component')
            },
            {
                path:'**',
                redirectTo:'home',
                pathMatch:'full'
            }
        ]
    }
];

export default adminRoutes;