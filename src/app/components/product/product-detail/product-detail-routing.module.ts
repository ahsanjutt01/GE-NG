import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductDetailComponent } from './product-detail.component';


const routes: Routes = [
    // {
    // path: '', children: [
      { path: ':id', component: ProductDetailComponent }
    // ]
  // },
    // { path: ':id', component: ProductDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductDetailRoutingModule { }
