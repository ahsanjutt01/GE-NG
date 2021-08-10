import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { GenericService } from 'src/app/_services/generic.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order-modal',
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss'],
})
export class OrderModalComponent implements OnInit, OnDestroy {
  currency = '$';
  billingAddress: any;
  shipingAddress: any;
  subscription: Subscription;
  readonly API_URL = environment.API_URL;
  order: any;
  constructor(
    private genericService: GenericService,
    private store: Store<{ navbar: { settings: any } }>
  ) {}

  ngOnInit(): void {
    this.subscription = this.store
      .select('navbar')
      .pipe(map((x: any) => x.navbar))
      .subscribe((setting: any) => {
        this.currency = setting.currency;
      });
    this.genericService.openProductDetailModal.subscribe((x: any) => {
      this.order = { ...x };
      const itemsLength = this.order.items.length;
      for (let i = 0; i < itemsLength; i++) {
        if (!this.order.items[i].product?.name) {
          const prod = JSON.parse(this.order.items[i].product);
          this.order.items[i].product = prod;
          if (this.order.items[i].nickshots.length) {
            const nicshotsLength = this.order.items[i].nickshots.length;
            for (let j = 0; j < nicshotsLength; j++) {
              this.order.items[i].nickshots[j].product = JSON.parse(
                this.order.items[i].nickshots[j].product
              );
            }
          }
        }
      }
      this.billingAddress = JSON.parse(this.order.billing_address);
      this.shipingAddress = JSON.parse(this.order.shipping_address);
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  getName(product: any): string {
    return JSON.parse(product).name;
  }
  getPriceExItem(exclusiveProducts: any): number {
    return exclusiveProducts
      .map((x) => x.actual_variant_sell_price * x.quantity)
      .reduce((a, b) => a + b, 0);
  }
  getMixAndMatchLineTotal(mix_match_products: any): number {
    return mix_match_products
      .map((x) => x.line_total)
      .reduce((a, b) => a + b, 0);
  }
  getPriceExclusiveItem(items): number {
    return items
      .map((x) => x.line_total)
      .reduce((a, b) => a + b, 0);
  }
  getPriceExclusiveItemCrossedPrice(items): number {
    return items
      .map((x) => x.actual_variant_sell_price * x.quantity)
      .reduce((a, b) => a + b, 0);
  }
  getDiscountedPrice(exclusiveProducts: any): number {
    return exclusiveProducts
      .map((x) => x.actual_variant_sell_price * x.quantity)
      .reduce((a, b) => a + b, 0);
  }
  getexImage(product: any): string {
    return JSON.parse(product).thumbnail;
  }
}
