import { NgModule } from '@angular/core';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FormsModule } from '@angular/forms';

import { ExclusiveOfferRoutingModule } from './exclusive-offer-routing.module';
import { ExclusiveOfferComponent } from './exclusive-offer.component';
import { PipeModule } from 'src/app/_pipes/pipe.module';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    ExclusiveOfferComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PipeModule,
    Ng2SearchPipeModule,
    ExclusiveOfferRoutingModule
  ]
})
export class ExclusiveOfferModule { }
