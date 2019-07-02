import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
import { HttpClientModule } from "@angular/common/http";

import { TagInputModule } from 'ngx-chips';
import { ClipboardModule } from 'ngx-clipboard';
 
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { MarketingRoutes } from './marketing.routing';
import { BannersComponent } from './banners/banners.component';
import { GiftMessagesComponent } from './gift-messages/gift-messages.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(MarketingRoutes),
    FormsModule,
    MaterialModule,
    TagInputModule,
    HttpClientModule,
    NgbModule.forRoot(),
    ClipboardModule, // required animations module
  ],
  declarations: [
    BannersComponent,
    GiftMessagesComponent
  ]
})

export class MarketingModule {}
