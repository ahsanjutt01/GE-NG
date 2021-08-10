import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { GenericService } from 'src/app/_services/generic.service';

@Component({
  selector: 'app-cart-list',
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.scss']
})
export class CartListComponent implements OnInit {
  isLoading = false;
  isgenUrlLoading = false;
  loadingComplete = false;
  orders = [];
  currency = '$';
  subscription: Subscription;
  constructor(
    private store: Store<{ navbar: { settings: any } }>,
    private toastr: ToastrService,
    private genericService: GenericService,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.subscription = this.store.select('navbar').pipe(map((x: any) => x.navbar)).subscribe((setting: any) => {
      this.currency = setting.currency;
    });
    this.genericService.getOrders().subscribe(x => {
      this.orders = x;
      this.isLoading = false;
      this.loadingComplete = true;
    });
  }
  onGenerateUrl(orderId: string): void {
    this.isgenUrlLoading = true;
    this.genericService.generateUrl(orderId).subscribe(x => {
      if (x) {
        this.isgenUrlLoading = false;
        // this.clipboard.writeText(x.url);
      }
    });
  }
  onShowOrderDetailModal(order: any): void {
    this.genericService.openProductDetailModal.next(order);
  }
  onSendCartEmailToCustomer(orderId: string): void {
    this.genericService.generateUrl(orderId).subscribe(x => {
      if (x) {
        this.genericService.sendCartEmailToCustomer(x.cart_unique).subscribe(data => {
          this.toasterSuccessMessage('Email successfuly sent to customer', 'Success');
        });
      }
    });
  }
  toasterErrorMessage(message: string, title: string): void {
    this.toastr.error(message, title);
  }
  toasterSuccessMessage(message: string, title: string): void {
    this.toastr.success(message, title);
  }
}
