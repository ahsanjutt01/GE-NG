import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RewardListComponent } from './reward-list/reward-list.component';
import { AddressComponent } from './address/address.component';
import { CartListComponent } from './cart-list/cart-list.component';

import { DetailComponent } from './detail.component';
import { OrdersComponent } from './orders/orders.component';
import { PasswordComponent } from './password/password.component';
import { ProfileComponent } from './profile/profile.component';
import { TicketsComponent } from './tickets/tickets.component';
import { VouchersComponent } from './vouchers/vouchers.component';
import { WishlistComponent } from './wishlist/wishlist.component';

const routes: Routes = [
  {
    path: '',
    component: DetailComponent,
    children: [
      { path: '', component: ProfileComponent },
      { path: 'carts', component: CartListComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'address', component: AddressComponent },
      { path: 'rewards', component: RewardListComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'wishlist', component: WishlistComponent },
      { path: 'vouchers', component: VouchersComponent },
      { path: 'tickets', component: TicketsComponent },
      { path: 'changePassword', component: PasswordComponent },

      // { path: 'profilee', component: ProfileeComponent },
      // { path: 'dashboards', component: DashboardsComponent },
      // { path: 'coile', component: CoileComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [
    RouterModule
  ]
})
export class DashboardRoutingModule { }
