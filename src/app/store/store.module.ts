import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { StoreRoutes } from './store.routing';
import { AboutComponent } from './about/about.component';
import { CurrencyComponent } from './currency/currency.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { TaxComponent } from './tax/tax.component';
import { DeliveryComponent } from './delivery/delivery.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(StoreRoutes),
    FormsModule,
    MaterialModule
  ],
  declarations: [
    AboutComponent,
    CurrencyComponent,
    ReviewsComponent,
    TaxComponent,
    DeliveryComponent
  ]
})

export class StoreModule {}
