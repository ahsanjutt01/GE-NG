import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchResultsRoutingModule } from './search-results-routing.module';
import { SearchResultsComponent } from './search-results.component';
import { SharedModule } from 'src/app/_shared/sahere.module';


@NgModule({
  declarations: [SearchResultsComponent],
  imports: [
    SharedModule,
    SearchResultsRoutingModule
  ]
})
export class SearchResultsModule { }
