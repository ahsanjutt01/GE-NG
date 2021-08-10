import { NgModule } from '@angular/core';

import { FlavourRoutingModule } from './flavour-routing.module';
import { FlavourComponent } from './flavour.component';
import { SharedModule } from 'src/app/_shared/sahere.module';
@NgModule({
  declarations: [
    FlavourComponent
  ],
  imports: [
    SharedModule,
    FlavourRoutingModule
  ]
})
export class FlavourModule { }
