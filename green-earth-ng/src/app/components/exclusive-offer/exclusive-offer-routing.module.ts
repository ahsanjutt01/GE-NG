import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExclusiveOfferComponent } from './exclusive-offer.component';

const routes: Routes = [{ path: ':id', component: ExclusiveOfferComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExclusiveOfferRoutingModule { }
