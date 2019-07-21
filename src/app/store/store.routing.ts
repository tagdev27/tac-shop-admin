import { Routes } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { CurrencyComponent } from './currency/currency.component';
import { ReviewsComponent } from './reviews/reviews.component';
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
        path: 'reviews',
        component: ReviewsComponent
        }]
    }, {
        path: '',
        children: [ {
            path: 'tax',
            component: TaxComponent
        }]
    }
];