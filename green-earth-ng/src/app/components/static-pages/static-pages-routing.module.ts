import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutUsComponent } from './about-us/about-us.component';
import { FaqsComponent } from './faqs/faqs.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ShippingReturnComponent } from './shipping-return/shipping-return.component';
import { CareerComponent } from './career/career.component';

import { StoreLocationComponent } from './store-location.component';
import { CareerFormComponent } from './career-form/career-form.component';
import { EbrochuresComponent } from './ebrochures/ebrochures.component';

const routes: Routes = [
    { path: 'about-us', component: AboutUsComponent },
    { path: 'contact-us', component: StoreLocationComponent },
    { path: 'shiping-return', component: ShippingReturnComponent },
    { path: 'privacy-policy', component: PrivacyPolicyComponent },
    { path: 'faqs', component: FaqsComponent },
    { path: 'career', component: CareerComponent },
    { path: 'career-form', component: CareerFormComponent },
    { path: 'ebrochures', component: EbrochuresComponent},
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StaticPagesRoutingModule { }
