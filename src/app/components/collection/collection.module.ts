import { NgModule } from '@angular/core';


import { CollectionRoutingModule } from './collection-routing.module';
import { CollectionComponent } from './collection.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SharedModule } from 'src/app/_shared/sahere.module';


@NgModule({
  declarations: [CollectionComponent],
  imports: [
    SharedModule,
    Ng2SearchPipeModule,
    CollectionRoutingModule,
  ]
})
export class CollectionModule { }
