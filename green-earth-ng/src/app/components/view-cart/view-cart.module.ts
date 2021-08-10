import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/_shared/sahere.module';

import { ViewCartComponent } from './view-cart.component';
import { ViewCartComponentRoutingModule } from './view-cart.routing.module';


@NgModule({
    declarations: [ViewCartComponent],
    imports: [
        SharedModule,
        ViewCartComponentRoutingModule
    ]
})
export class ViewCartModule { }
