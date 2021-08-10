import { NgModule } from '@angular/core';
// import { ScrollingModule } from '@angular/cdk/scrolling';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { CarouselModule } from 'ngx-owl-carousel-o';

import { ProductRoutingModule } from './product-routing.module';
import { ProductsListComponent } from './products-list/products-list.component';
import { NouisliderModule } from 'ng2-nouislider';
import { PipeModule } from 'src/app/_pipes/pipe.module';
import { SharedModule } from 'src/app/_shared/sahere.module';

@NgModule({
  declarations: [
    ProductsListComponent
  ],
  imports: [
    SharedModule,
    NouisliderModule,
    PipeModule,
    // ScrollingModule,
    Ng2SearchPipeModule,
    ProductRoutingModule,
    CarouselModule
    // SearchBarModule
  ]
})
export class ProductModule { }
