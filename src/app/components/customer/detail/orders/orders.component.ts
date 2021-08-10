import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/_services/auth.service';
import { GenericService } from 'src/app/_services/generic.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  isLoading = false;
  loadingComplete = false;
  orders = [];
  currency = '$';
  subscription: Subscription;
  constructor(
    private store: Store<{ navbar: { settings: any } }>,
    private genericService: GenericService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.subscription = this.store.select('navbar').pipe(map((x: any) => x.navbar)).subscribe((setting: any) => {
      this.currency = setting.currency;
    });
    this.genericService.getOrders().subscribe(x => {
      this.orders = x;
      if (x) {
        this.authService.updateOrdersInUser$(this.orders);
      }
      this.isLoading = false;
      this.loadingComplete = true;
    });
  }

  onShowOrderDetailModal(order: any): void {
    this.genericService.openProductDetailModal.next(order);
  }
}
