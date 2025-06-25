import { Routes } from '@angular/router';
import { AuthGuard } from './authentification/AuthServices/auth.guard';
import { AppBlankComponent } from './layouts/blank/blank.component';

import { FullComponent } from './layouts/full/full.component';
import { AuthenticationService } from './authentification/AuthServices/authentication.service';

export const AppRoutes: Routes = [
    {


        path: '',
        component: FullComponent, canActivate: [AuthGuard],
        children: [
            {
                path: 'forms',
                loadChildren: () => import('./forms/forms.module').then(m => m.FormModule)
            },
            {
                path: 'tables',
                loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule)
            },
             {
                path: 'datatables',
                loadChildren: () => import('./datatables/datatables.module').then(m => m.DataTablesModule)
            },

            {
                path: 'dashboards',
                loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule)
            },
            {
                path: 'material',
                loadChildren: () => import('./material-component/material.module').then(m => m.MaterialComponentsModule)
            } ,
            {
                path: 'multi',
                loadChildren: () => import('./multi-dropdown/multi-dd.module').then(m => m.MultiModule)
            }
        ]
    },
    {
     path: '',
        component: FullComponent, canActivate: [AuthGuard],
        children: [
            {
                path: 'material',
                loadChildren: () => import('./material-component/material.module').then(m => m.MaterialComponentsModule)
            },
            {
                path: 'starter',
                loadChildren: () => import('./starter/starter.module').then(m => m.StarterModule)
            },
            {
                path: '',
                loadChildren: () => import('./core/core.module').then(m => m.CoreModule)
            }
        ]
    },
    {
        path: 'auth',
        component: AppBlankComponent,
        children: [
            {
                path: '',
                loadChildren: () => import('./authentification/authentification.module').then(m => m.AuthentificationModule)
            }
        ]
    }
];
