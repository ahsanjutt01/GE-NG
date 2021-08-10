import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';
import { StoreLocationComponent } from './store-location.component';
import { StaticPagesRoutingModule } from './static-pages-routing.module';
import { ShippingReturnComponent } from './shipping-return/shipping-return.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { FaqsComponent } from './faqs/faqs.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CareerComponent } from './career/career.component';
import { CareerFormComponent } from './career-form/career-form.component';

@NgModule({
    declarations: [StoreLocationComponent, ShippingReturnComponent, CareerFormComponent, PrivacyPolicyComponent, FaqsComponent, AboutUsComponent, CareerComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        StaticPagesRoutingModule,
        AgmCoreModule.forRoot({
            // please get your own API key here:
            // https://developers.google.com/maps/documentation/javascript/get-api-key?hl=en
            apiKey: 'AIzaSyAPx6ZyRZ1B8SoBCDMZ89LQ5TyQTr-pgN8'
        }),
    ]
})
export class StaticPageModule { }
