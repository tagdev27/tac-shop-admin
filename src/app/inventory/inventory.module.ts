import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
import { HttpClientModule } from "@angular/common/http";

import { TagInputModule } from 'ngx-chips';
import { ClipboardModule } from 'ngx-clipboard';
 

import { InventoryRoutes } from './inventory.routing';
import { BasketComponent } from './basket/basket.component';
import { CategoryComponent } from './category/category.component';
import { SubCatComponent } from './subcat/subcat.component';
import { ItemsComponent } from './items/items.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(InventoryRoutes),
    FormsModule,
    MaterialModule,
    TagInputModule,
    HttpClientModule,
    ClipboardModule, // required animations module
  ],
  declarations: [
      BasketComponent,
      CategoryComponent,
      SubCatComponent,
      ItemsComponent,
  ]
})

export class InventoryModule {}
