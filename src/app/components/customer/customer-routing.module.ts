import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/_services/guards/auth.guard';

import { CustomerComponent } from './customer.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    component: CustomerComponent,
    children: [
      { path: '', component: DashboardComponent, canActivate: [AuthGuard], },
      { path: 'detail', loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule) }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
