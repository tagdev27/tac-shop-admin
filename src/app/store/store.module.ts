import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { StoreRoutes } from './store.routing';
import { AboutComponent } from './about/about.component';
import { CurrencyComponent } from './currency/currency.component';
import { PaymentComponent } from './payment/payment.component';
import { TaxComponent } from './tax/tax.component';

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
    PaymentComponent,
    TaxComponent,
  ]
})

export class StoreModule {}
