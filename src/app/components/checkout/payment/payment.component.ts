import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
// import { IPayPalConfig, PayPalEnvironment, PayPalIntegrationType } from 'ngx-paypal';
import { ICreateOrderRequest, IPayPalConfig } from 'ngx-paypal';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs/operators';
import { OrderSuccess } from 'src/app/_models/orderSuccess';

import { AuthService } from 'src/app/_services/auth.service';
import { CartService } from 'src/app/_services/cart/cart.service';
import { ProductService } from 'src/app/_services/product.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  public payPalConfig?: IPayPalConfig;
  cart: any;
  transformedAmount = 0;
  userInfo = null;
  isRewardChecked = false;
  isAbleToUtilize = false;
  consumesPoints = 0;
  reward = null;
  isClickedVivaBtn = false;
  orderSuccess: OrderSuccess = {
    paymentID: '',
    payerID: '',
    orderID: '',
    type: '',
    accessToken: '',
  };
  paymentSettings = null;
  showSuccess = false;
  paypalCredentials = null;
  vivaWalletCredentials = null;
  showCancel = false;
  isLoggedIn = false;
  showError = false;
  cartItems = [];
  currency$: any;
  currency = '$';
  currencyCode = 'GBP';
  couponNotFound = false;
  cartTotalPrice = 0;
  couponMinOrderError = false;
  API_URL = '';
  cartToken = null;
  vivaBtn: any;
  ammount = 9.99;
  couponMinOrderPrice: number;
  couponCode = '';
  cartProductCount = 0;
  totalPrice = '0.00';
  shipingPrice = 0.0;
  orderProcess = false;
  isSettingsSettelled = false;
  constructor(
    private productSerive: ProductService,
    private authSerive: AuthService,
    private cartSerive: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private store: Store<{ navbar: { settings: any } }>
  ) {
    this.API_URL = environment.API_URL;
    this.cartSerive.cartSubject.subscribe((cart) => {
      // this.cart = JSON.parse(localStorage.getItem('cart'));
      this.cart = { ...cart };
      if (this.cart) {
        this.isRewardChecked = this.cart.is_reward;
      }
      this.onOnInit();
    });
  }
  ngOnInit(): void {}
  onOnInit(): void {
    this.userInfo = this.authSerive.getUserInfo();
    this.route.params.subscribe((params) => {
      this.cartToken = params.token;
      if (this.userInfo && this.cartToken) {
        this.authSerive.getCartByToken(this.cartToken).subscribe((x) => {});
      }
    });
    this.isLoggedIn = this.authSerive.isLogin();
    // this.getCart();
    if (!this.cart.cartItems.length && !this.cartToken) {
      this.router.navigateByUrl('/');
      return;
    }
    // this.cartItems = this.cart.cartItems.map(x => (
    //   {
    //     name: x.name,
    //     quantity: x.quantity,
    //     category: 'DIGITAL_GOODS',
    //     unit_amount:
    //     {
    //       currency_code: 'EUR',
    //       value: this.getTwoDecimalPlaces(x.afterDiscountPrice)
    //     }
    //   }
    // ));
    // this.currencyCode;
    this.cartItems = [
      {
        name: 'Vape Goods',
        quantity: 1,
        category: 'DIGITAL_GOODS',
        unit_amount: {
          currency_code: this.currencyCode,
          value: this.getTwoDecimalPlaces(
            this.cart.is_reward
              ? this.cart.cart_total_price -
                  this.cart.reward_amount +
                  this.cart.delivery_rate -
                  this.cart.additional_discount_price
              : this.cart.cart_total_price +
                  this.cart.delivery_rate -
                  this.cart.additional_discount_price
          ).toString(),
        },
      },
    ];

    this.cartTotalPrice = this.cart.is_reward
      ? this.cart.cart_total_price -
        this.cart.reward_amount +
        this.cart.delivery_rate -
        this.cart.additional_discount_price
      : this.cart.cart_total_price +
          this.cart.delivery_rate -
          this.cart.additional_discount_price || 0;
    this.cartProductCount = this.cart.cartItems?.length || 0;

    this.currency$ = this.store
      .select('navbar')
      .pipe(map((x: any) => x.navbar.currency));
    this.store
      .select('navbar')
      .pipe(map((x: any) => x.navbar))
      .subscribe((x) => {
        this.reward = x?.reward;
        this.currency = x?.currency;

        this.currencyCode = x?.currency_code ? x.currency_code : '';
        if (
          this.reward &&
          this.userInfo &&
          this.userInfo.reward_points >=
            parseInt(this.reward?.minimum_points_discount)
        ) {
          this.isAbleToUtilize = true;
          if (
            this.reward &&
            this.userInfo.reward_points < this.reward.maximum_points_discount
          ) {
            const amount =
              (parseInt(this.reward?.redemption_conversion_rate_amount) /
                parseInt(this.reward?.redemption_conversion_rate_points)) *
              this.userInfo.reward_points;
            this.transformedAmount =
              this.productSerive.transFormToNumber(amount);
            this.consumesPoints = this.userInfo.reward_points;
          }
          if (
            this.reward &&
            this.userInfo.reward_points >= this.reward.maximum_points_discount
          ) {
            const amount =
              (parseInt(this.reward?.redemption_conversion_rate_amount) /
                parseInt(this.reward?.redemption_conversion_rate_points)) *
              parseInt(this.reward.maximum_points_discount);
            this.transformedAmount =
              this.productSerive.transFormToNumber(amount);
            this.consumesPoints = parseInt(this.reward.maximum_points_discount);
          }
        }
      });

    this.totalPrice = this.getTwoDecimalPlaces(
      this.cart.is_reward
        ? this.cart.cart_total_price -
            this.cart.reward_amount +
            this.cart.delivery_rate -
            this.cart.additional_discount_price
        : this.cart.cart_total_price +
            this.cart.delivery_rate -
            this.cart.additional_discount_price
    ).toString();

    this.authSerive.paymentGateway$.subscribe((x) => {
      this.paymentSettings = x;
      this.currencyCode = this.paymentSettings
        ? this.paymentSettings.currency.code
        : 'EUR';
      if (x.paypal.status === 'active') {
        let value = this.authSerive.decryption(x.paypal.credentials);
        value = value.substring(0, value.length - 2).substring(7);
        this.paypalCredentials = JSON.parse(value);
        this.initConfig();
      }
      if (x.vivawallet.status === 'active') {
        let value = this.authSerive.decryption(x.vivawallet.credentials);
        value = value.substring(0, value.length - 2).substring(6);
        this.vivaWalletCredentials = JSON.parse(value);
        // this.loadScript('https://code.jquery.com/jquery-1.11.2.min.js');
        // this.loadScript('https://demo.vivapayments.com/web/checkout/js');

        // const html = `<button type="button"
        // data - vp - publickey="${this.vivaWalletCredentials.credentials}"
        // data - vp - baseurl="https://demo.vivapayments.com"
        // data - vp - lang="en"
        // data - vp - amount="${this.cart?.cart_total_price}"
        // data - vp - sourcecode="${this.vivaWalletCredentials.source_code}"
        // data - vp - description="My product"
        // data - vp - disablewallet="false"
        // data - vp - expandcard="true" >
        //   </button>`;
        // const htmll = "<h1>Ahsan</h1>"
        // this.vivaBtn = this.sanitizer.bypassSecurityTrustHtml("<h1>Header</h1><button>Button</button>");
      }
    });

    this.getShippingPrice();
  }

  onParseInt(value: number): number {
    return parseInt(value.toString());
  }
  onRewardCheckboxChange(isRewardChecked: boolean): void {
    if (
      this.reward &&
      this.userInfo.reward_points >=
        parseInt(this.reward?.minimum_points_discount)
    ) {
      if (this.isRewardChecked) {
        if (this.isAbleToUtilize) {
          this.cart.is_reward = this.isRewardChecked;
          this.cart.reward_amount = this.transformedAmount;
          this.cart.reward_points = this.consumesPoints;
          this.cartSerive.setCart(this.cart);
        }
        //   if (this.userInfo.reward_points < this.reward.maximum_points_discount) {
        //     const amount = (this.reward?.conversion_rate_amount / this.reward?.conversion_rate_points) * this.userInfo.reward_points;
        //     this.transformedAmount = this.productSerive.transFormToNumber(amount);
        //   }
      } else {
        this.cart.is_reward = false;
        this.cart.reward_amount = 0;
        this.cart.reward_points = 0;
        this.cartSerive.setCart(this.cart);
      }
      this.earnablPoints();
      this.getCart();
    } else {
      this.cart.is_reward = false;
      this.cart.reward_amount = 0;
      this.cart.reward_points = 0;
      this.cartSerive.setCart(this.cart);
      this.toasterErrorMessage(
        'Earn atleast 60 points to utilize points',
        'Error'
      );
    }
  }
  getCart(): void {
    this.cartSerive.cartSubject.subscribe((cart) => {
      // this.cart = JSON.parse(localStorage.getItem('cart'));
      this.cart = { ...cart };
      if (this.cart) {
        this.isRewardChecked = this.cart.is_reward;
      }
    });
  }
  earnablPoints(): void {
    this.cart.earnablPoints = this.cartSerive.getEarnablePoints(
      this.reward?.conversion_rate_points,
      this.reward?.conversion_rate_amount,
      this.cart.is_reward
        ? this.cart.cart_total_price - this.cart.reward_amount
        : this.cart.cart_total_price
    );
    this.cart.earnablPoints = this.productSerive.transFormToNumber(
      this.cart.earnablPoints || 0
    );
    this.cartSerive.setCart(this.cart);
  }
  onPostOrder(): void {
    this.orderProcess = true;
    this.productSerive.postCartToDbOrderSuccess(this.orderSuccess).subscribe(
      (data) => {
        this.cartSerive.initializeCart();
        this.router.navigateByUrl('/checkout/vivawallet-success');
        this.toasterSuccessMessage('Order Placed Successfuly', 'Success');
      },
      (err) => {
        this.orderProcess = false;
        this.toasterErrorMessage(
          'Someting went wrong, Please try again',
          'Error'
        );
      }
    );
  }
  onVivaPaymnet(): void {
    this.isClickedVivaBtn = true;

    const name =
      this.userInfo?.first_name +
      ' ' +
      this.authSerive.getUserInfo()?.last_name;
    const model = {
      amount:
        (this.cart?.cart_total_price -
          this.cart.reward_amount +
          this.cart.delivery_rate -
          this.cart.additional_discount_price) *
        100,
      email: this.userInfo?.email || 'guest',
      fullName: name || 'Test',
      customerTrns: 'testing trasec',
      requestLang: 'en-US',
      sourceCode: '2631',
      merchantTrns: this.cart.order_id,
    };
    this.authSerive.postVivawallet(model).subscribe(
      (x) => {
        if (x.Success) {
          this.isClickedVivaBtn = false;
          const url = x.paymentUrl;
          window.open(url, '_self');
        }
      },
      (error) => {
        this.isClickedVivaBtn = false;
      }
    );
  }
  // ================SORTING EXCLUSIVE ATTR============
  distinctAttr(exItems: any): any[] {
    const items = JSON.parse(JSON.stringify(exItems));
    return items
      .map((j) => j.attribute_value)
      .filter((x, i, a) => {
        return a.indexOf(x) === i;
      });
  }
  getQtyExItemByAttrValue(exItems: any, attrValue: string): any {
    return exItems
      .filter((x) => x.attribute_value === attrValue)
      .map((j) => j.quantity)
      .reduce((a, b) => a + b);
  }
  // ================SORTING EXCLUSIVE ATTR============

  // on Apply Coupon on cart
  onApplyCoupon(): void {
    this.couponNotFound = false;
    this.productSerive
      .getCoupon(this.couponCode, this.authSerive.getUserInfo().id)
      .subscribe((data) => {
        if (data) {
          if (this.cart.cart_total_price > data.min_order) {
            this.cartSerive.applyCoupon(data);
            this.couponMinOrderError = false;
          } else {
            this.couponMinOrderError = true;
            this.couponMinOrderPrice = data.min_order;
          }
        } else {
          this.couponNotFound = true;
        }
      });
  }
  private initConfig(): void {
    // this.payPalConfig = new PayPalConfig(PayPalIntegrationType.ClientSideREST, PayPalEnvironment.Sandbox, {}

    this.payPalConfig = {
      currency: this.currencyCode,
      // clientId: 'Aaz5Azpk_fiat4X6rp0eN4aS_FpFmEN-hDzr1_cXQ9C8A9ZUjUn8YAdv_157o-dnzA5VdLS-gjtOlKGK',
      clientId: this.paypalCredentials.client_id,
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      createOrderOnClient: (data) =>
        <ICreateOrderRequest>{
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: this.currencyCode,
                value: this.totalPrice,
                // value: this.getTwoDecimalPlaces(this.cart.cart_total_price),
                breakdown: {
                  item_total: {
                    currency_code: this.currencyCode,
                    value: this.totalPrice,
                  },
                },
              },
              items: this.cartItems,
              // items: [{
              //   name: 'Enterprise Subscription',
              //   quantity: '1',
              //   category: 'DIGITAL_GOODS',
              //   unit_amount: {
              //     currency_code: 'EUR',
              //     value: '9.99',
              //   },
              // }]
            },
          ],
        },
      advanced: {
        commit: 'true',
      },
      style: {
        label: 'paypal',
        layout: 'vertical',
      },
      onApprove: (data: any, actions) => {
        this.orderSuccess.accessToken = data.facilitatorAccessToken;
        actions.order.get().then((details) => {});
      },
      onClientAuthorization: (data) => {
        this.showSuccess = true;
        this.orderSuccess.paymentID = data.id;
        this.orderSuccess.payerID = data.payer.payer_id;
        this.orderSuccess.type = 'paypal';
        this.orderSuccess.orderID = this.cart.order_id;
        this.onPostOrder();
      },
      onCancel: (data, actions) => {
        this.showCancel = true;
      },
      onError: (err) => {
        this.showError = true;
      },
      onClick: (data, actions) => {
        // this.resetStatus();
      },
    };
  }
  getTwoDecimalPlaces(val: number): string {
    if (val) {
      return parseFloat(
        val.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
      ).toFixed(2);
    } else {
      return '0.00'.toString();
    }
  }
  toasterSuccessMessage(message: string, title: string): void {
    this.toastr.success(message, title);
  }
  toasterErrorMessage(message: string, title: string): void {
    this.toastr.error(message, title);
  }
  loadScript(url): void {
    const body = document.body as HTMLDivElement;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = url;
    script.async = true;
    script.defer = true;
    body.appendChild(script);
  }

  onBackToAddress(): void {
    this.cartSerive.updateIsPaymentPage(false);
  }

  getShippingPrice(): void {
    if (this.cart.selected_delivery_method) {
      let totalCartPrice = this.cartTotalPrice;
      // if(this.cart.is_reward) {
      //   totalCartPrice = this.cartTotalPrice - this.cart.reward_amount;
      // }

      if (this.cart.selected_delivery_method.is_free_shipping) {
        if (
          totalCartPrice >=
          this.cart.selected_delivery_method.free_minimum_order
        ) {
          this.shipingPrice = 0;
        } else {
          totalCartPrice += this.cart.selected_delivery_method.rate;
          // this.cartTotalPrice = totalCartPrice;
          this.shipingPrice = this.cart.selected_delivery_method.rate;
        }
      } else {
        totalCartPrice += this.cart.selected_delivery_method.rate;
        // this.cartTotalPrice = totalCartPrice;
        this.shipingPrice = this.cart.selected_delivery_method.rate;
      }
      this.cart.delivery_rate = this.shipingPrice;
    } else {
      this.shipingPrice = 0.0;
    }
  }
}
