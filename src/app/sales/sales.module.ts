import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
import { HttpClientModule } from "@angular/common/http";

import { TagInputModule } from 'ngx-chips';
import { ClipboardModule } from 'ngx-clipboard';
 

import { SalesRoutes } from './sales.routing';
import { CartComponent } from './cartorders/cartorders.component';
import { InvoiceComponent } from "./invoice/invoice.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SalesRoutes),
    FormsModule,
    MaterialModule,
    TagInputModule,
    HttpClientModule,
    ClipboardModule, // required animations module
  ],
  declarations: [
    CartComponent,
    InvoiceComponent
    //   CategoryComponent,
    //   SubCatComponent,
    //   ItemsComponent,
  ]
})

export class SalesModule {}
