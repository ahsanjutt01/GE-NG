import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/_shared/sahere.module';

import { DashboardRoutingModule } from './detail-routing.module';
import { DetailComponent } from './detail.component';
import { OrdersComponent } from './orders/orders.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { VouchersComponent } from './vouchers/vouchers.component';
import { TicketsComponent } from './tickets/tickets.component';
import { ProfileComponent } from './profile/profile.component';
import { AddressComponent } from './address/address.component';
import { EditComponent } from './address/edit/edit.component';
import { OrderModalComponent } from './orders/order-modal/order-modal.component';
import { PipeModule } from 'src/app/_pipes/pipe.module';
import { CartListComponent } from './cart-list/cart-list.component';


@NgModule({
  declarations: [DetailComponent, ProfileComponent, OrdersComponent, AddressComponent,
    WishlistComponent, VouchersComponent, TicketsComponent, EditComponent, OrderModalComponent, CartListComponent],
  imports: [
    SharedModule,
    DashboardRoutingModule,
    PipeModule
  ],
  exports: [
    DetailComponent,
    ProfileComponent,
    OrdersComponent,
    WishlistComponent,
    AddressComponent,
    VouchersComponent,
    TicketsComponent,
    EditComponent,
  ],
  bootstrap: [DetailComponent]
})
export class DetailModule { }
