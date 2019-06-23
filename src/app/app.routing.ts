import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';

import { RouteGuard, LoginRouteGuard } from "./route.guard";

export const AppRoutes: Routes = [
    {
      path: '',
      redirectTo: 'dashboard',
      //redirectTo: 'login',
      pathMatch: 'full',
    }, 
    {
      path: '',
      component: AdminLayoutComponent,
      canActivate: [RouteGuard],
      children: [
          {
        path: '',
        loadChildren: './dashboard/dashboard.module#DashboardModule'
    }, {
        path: 'components',
        loadChildren: './components/components.module#ComponentsModule'
    }, {
        path: 'forms',
        loadChildren: './forms/forms.module#Forms'
    }, {
        path: 'tables',
        loadChildren: './tables/tables.module#TablesModule'
    }, {
        path: 'maps',
        loadChildren: './maps/maps.module#MapsModule'
    }, {
        path: 'widgets',
        loadChildren: './widgets/widgets.module#WidgetsModule'
    }, {
        path: 'charts',
        loadChildren: './charts/charts.module#ChartsModule'
    }, {
        path: 'calendar',
        loadChildren: './calendar/calendar.module#CalendarModule'
    }, {
        path: 'settings',
        canActivate: [RouteGuard],
        loadChildren: './settings/setttings.module#SettingsModule'
    },{
        path: 'inventory',
        canActivate: [RouteGuard],
        loadChildren: './inventory/inventory.module#InventoryModule'
    },
    {
        path: 'store',
        canActivate: [RouteGuard],
        loadChildren: './store/store.module#StoreModule'
    },
    {
        path: 'logs',
        canActivate: [RouteGuard],
        loadChildren: './logs/logs.module#LogsModule'
    },
    {
        path: '',
        loadChildren: './userpage/user.module#UserModule'
    }, {
        path: '',
        loadChildren: './timeline/timeline.module#TimelineModule'
    }
  ]}, {
      path: '',
      canActivate: [LoginRouteGuard],
      component: AuthLayoutComponent,
      children: [{
        path: 'pages',
        loadChildren: './pages/pages.module#PagesModule'
      }]
    }
];
