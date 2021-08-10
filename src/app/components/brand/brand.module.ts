import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrandRoutingModule } from './brand-routing.module';
import { BrandComponent } from './brand.component';
import { FormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';


@NgModule({
  declarations: [BrandComponent],
  imports: [
    CommonModule,
    FormsModule,
    Ng2SearchPipeModule,
    BrandRoutingModule
  ]
})
export class BrandModule { }
