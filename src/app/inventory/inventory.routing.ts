import { Routes } from '@angular/router';

import { BasketComponent } from './basket/basket.component';
import { CategoryComponent } from './category/category.component';
import { SubCatComponent } from './subcat/subcat.component';
import { ItemsComponent } from './items/items.component';


export const InventoryRoutes: Routes = [
    {
      path: '',
      children: [ {
        path: 'basket',
        component: BasketComponent
    }]}, {
    path: '',
    children: [ {
      path: 'category',
      component: CategoryComponent
    }]
    }, {
      path: '',
      children: [ {
        path: 'subcat',
        component: SubCatComponent
        }]
    }, {
        path: '',
        children: [ {
            path: 'items',
            component: ItemsComponent
        }]
    }
];
