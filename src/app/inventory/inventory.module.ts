import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

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
    MaterialModule
  ],
  declarations: [
      BasketComponent,
      CategoryComponent,
      SubCatComponent,
      ItemsComponent,
  ]
})

export class InventoryModule {}
