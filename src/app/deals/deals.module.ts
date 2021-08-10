import { NgModule } from '@angular/core';

import { SharedModule } from '../_shared/sahere.module';

import { DealsRoutingModule } from './deals-routing.module';
import { DealsComponent } from './deals.component';

@NgModule({
  declarations: [DealsComponent],
  imports: [
    SharedModule,
    DealsRoutingModule,
  ]
})
export class DealsModule { }
