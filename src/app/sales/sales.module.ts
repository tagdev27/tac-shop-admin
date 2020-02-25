import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
import { HttpClientModule } from "@angular/common/http";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { TagInputModule } from 'ngx-chips';
import { ClipboardModule } from 'ngx-clipboard';
import { ExportAsModule } from 'ngx-export-as';
 

import { SalesRoutes } from './sales.routing';
import { CartComponent } from './cartorders/cartorders.component';
import { InvoiceComponent } from "./invoice/invoice.component";
import { OrdersComponent } from "./orders/orders.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SalesRoutes),
    FormsModule,
    MaterialModule,
    TagInputModule,
    HttpClientModule,
    ClipboardModule,
    ExportAsModule,
    NgbModule.forRoot(), // required animations module
  ],
  declarations: [
    CartComponent,
    InvoiceComponent,
    OrdersComponent
    //   CategoryComponent,
    //   SubCatComponent,
    //   ItemsComponent,
  ]
})

export class SalesModule {}
