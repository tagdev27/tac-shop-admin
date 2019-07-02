import { Routes } from '@angular/router';

import { BannersComponent } from './banners/banners.component';
import { GiftMessagesComponent } from './gift-messages/gift-messages.component';
import { RouteGuard } from '../route.guard';


export const MarketingRoutes: Routes = [
    {
      path: '',
      children: [ {
        path: 'banners',
        component: BannersComponent
    }]}, {
    path: '',
    children: [ {
      path: 'gift-messages',
      component: GiftMessagesComponent
    }]
    }
];
