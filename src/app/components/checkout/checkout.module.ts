import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/_shared/sahere.module';
import { CheckoutRoutingModule } from './checkout-routing.module';

import { CheckoutComponent } from './checkout.component';
import { AddressComponent } from './address/address.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
import { NgxPayPalModule } from 'ngx-paypal';

import { CustomerComponent } from './customer/customer.component';
import { PaymentComponent } from './payment/payment.component';
import { SelectFirstInputDirective } from 'src/app/_directives/select-first-input.directive';
import { SuccessErrorComponent } from './success-error/success-error.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';


@NgModule({
  declarations: [
    SelectFirstInputDirective,
    CheckoutComponent,
    AddressComponent,
    CustomerComponent,
    PaymentComponent,
    SuccessErrorComponent
  ],
  imports: [
    SharedModule,
    NgxPayPalModule,
    CdkStepperModule,
    NgStepperModule,
    Ng2SearchPipeModule,
    CheckoutRoutingModule,
  ]
})
export class CheckoutModule { }
