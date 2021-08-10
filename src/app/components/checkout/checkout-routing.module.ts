import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckoutComponent } from './checkout.component';
import { SuccessErrorComponent } from './success-error/success-error.component';

const routes: Routes = [
  { path: '', component: CheckoutComponent },
  { path: 'vivawallet-success', component: SuccessErrorComponent },
  { path: ':token', component: CheckoutComponent },
  { path: '**', component: SuccessErrorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutRoutingModule { }
