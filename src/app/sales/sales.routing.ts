import { Routes } from '@angular/router';

import { CartComponent } from './cartorders/cartorders.component';
import { InvoiceComponent } from "./invoice/invoice.component";


export const SalesRoutes: Routes = [
    {
      path: '',
      children: [ {
        path: 'cartorders',
        component: CartComponent
    }]}, {
    path: '',
    children: [ {
      path: 'orders',
      //component: CategoryComponent
    }]
    }, {
      path: '',
      children: [ {
        path: 'invoice',
        component: InvoiceComponent
        }]
    }, {
        path: '',
        children: [ {
            path: 'report',
            //component: ItemsComponent
        }]
    }
];
