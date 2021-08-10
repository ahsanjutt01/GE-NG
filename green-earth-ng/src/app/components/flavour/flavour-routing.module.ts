import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { FlavourComponent } from './flavour.component';

const routes: Routes = [{ path: '', component: FlavourComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [
    CommonModule,
    RouterModule, 
    Ng2SearchPipeModule,
    FormsModule,],
})
export class FlavourRoutingModule {}
