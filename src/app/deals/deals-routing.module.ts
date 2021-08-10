import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DealsComponent } from './deals.component';

const routes: Routes = [{ path: '', component: DealsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DealsRoutingModule { }
