import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductsListComponent } from './products-list/products-list.component';

const routes: Routes = [
  // {
  //   path: 'detail', children: [
  //     { path: ':id', component: ProductDetailComponent }
  //   ]
  // },
  {
    path: ':id',
    component: ProductsListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
