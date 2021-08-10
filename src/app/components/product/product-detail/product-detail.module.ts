import { NgModule } from '@angular/core';

import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';
import { Ng2SearchPipeModule } from 'ng2-search-filter';


import { ProductDetailComponent } from './product-detail.component';
import { ProductDetailRoutingModule } from './product-detail-routing.module';
import { PipeModule } from 'src/app/_pipes/pipe.module';
import { SharedModule } from 'src/app/_shared/sahere.module';


@NgModule({
    declarations: [ProductDetailComponent],
    imports: [
        SharedModule,
        PipeModule,
        ProductDetailRoutingModule,
        GalleryModule,
        LightboxModule,
        Ng2SearchPipeModule,
    ]
})
export class ProductDetailModule { }
