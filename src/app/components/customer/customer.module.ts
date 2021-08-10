import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';
import { RouterModule } from '@angular/router';
import { DetailModule } from './detail/detail.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipeModule } from 'src/app/_pipes/pipe.module';
import { RewardListComponent } from './detail/reward-list/reward-list.component';


@NgModule({
  declarations: [
    CustomerComponent,
    DashboardComponent,
    RewardListComponent,
  ],
  imports: [
    CommonModule,
    PipeModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    CustomerRoutingModule,
    DetailModule,
  ],
  exports: [
    CustomerComponent
  ],
  bootstrap: [CustomerComponent]
})
export class CustomerModule {
}
