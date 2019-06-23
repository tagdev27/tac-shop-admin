import { Routes } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { CurrencyComponent } from './currency/currency.component';
import { PaymentComponent } from './payment/payment.component';
import { TaxComponent } from './tax/tax.component';


export const StoreRoutes: Routes = [
    {
      path: '',
      children: [ {
        path: 'about',
        component: AboutComponent
    }]}, {
    path: '',
    children: [ {
      path: 'currency',
      component: CurrencyComponent
    }]
    }, {
      path: '',
      children: [ {
        path: 'currency',
        component: PaymentComponent
        }]
    }, {
        path: '',
        children: [ {
            path: 'tax',
            component: TaxComponent
        }]
    }
];