import { CdkStepper } from '@angular/cdk/stepper';
import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Cart } from 'src/app/_models/cartModel';
import { AuthService } from 'src/app/_services/auth.service';
import { CartService } from 'src/app/_services/cart/cart.service';
import { ProductService } from 'src/app/_services/product.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CheckoutComponent
  implements OnInit, OnDestroy, AfterViewInit, AfterContentChecked {
  @ViewChild('stepper') stepper: CdkStepper;

  storesubscription: Subscription;
  cartSubscription: Subscription;
  currency = '$';
  API_URL = '';
  cart: Cart;
  reward = null;
  transformedAmount = 0;
  consumesPoints = 0;
  isRewardChecked = false;
  isAbleToUtilize = false;
  cartProductCount = 0;
  cartTotalPrice = 0;
  loginForm: FormGroup;
  submitted = false;
  isLoginClicked = false;
  isLoggedIn = false;
  loginError = false;
  shipingPrice = 0.0;
  couponCode = '';
  userInfo = null;
  cartToken = null;
  couponMinOrderError = false;
  couponNotFound = false;
  isPaymentPage = false;
  couponMinOrderPrice: number;
  paymentPagesubscription: Subscription;
  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private productSerive: ProductService,
    private route: ActivatedRoute,
    private metaTagService: Meta,
    private titleService: Title,
    private toastr: ToastrService,
    private router: Router,
    private store: Store<{ navbar: { settings: any } }>,
    private cdref: ChangeDetectorRef
  ) {
    this.API_URL = environment.API_URL;
    this.authService.isCheckoutPage.next(true);
  }
  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }
  ngOnDestroy(): void {
    if (this.storesubscription) {
      this.storesubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.paymentPagesubscription) {
      this.paymentPagesubscription.unsubscribe();
    }
    this.authService.isCheckoutPage.next(false);
  }
  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();
    this.route.params.subscribe((params) => {
      this.cartToken = params.token;
      if (this.userInfo && this.cartToken) {
        this.authService.getCartByToken(this.cartToken).subscribe((x) => {
          if (x) {
            const payload = JSON.parse(x.data);
            if (payload.customer_id === this.userInfo.id) {
              this.cartService.setCart(payload);
              this.authService.isLoggedIn.next(true);
            }
          }
        });
      }
    });
    this.getCart();
    this.paymentPagesubscription = this.cartService.isPaymentPage$.subscribe(
      (x) => {
        this.isPaymentPage = x;
      }
    );
    this.authService.isLoggedIn.subscribe((x) => {
      if (x) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });
    // this.isLoggedIn = this.authService.isLogin();
    if (this.cart !== null && !this.cartToken) {
      if (this.cart.cartItems?.length === 0) {
        this.router.navigateByUrl('/');
      }
      this.cartProductCount = this.cart.cartItems?.length || 0;
      this.cartTotalPrice = this.cart.cart_total_price || 0;
      this.storesubscription = this.store.subscribe((data: any) => {
        this.currency = data.navbar.navbar.currency;
        this.reward = data.navbar.navbar.reward;
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
            this.transformedAmount = this.productSerive.transFormToNumber(
              amount
            );
            this.consumesPoints = this.productSerive.transFormToNumber(this.userInfo.reward_points);
          }
          if (
            this.reward &&
            this.userInfo.reward_points >= this.reward.maximum_points_discount
          ) {
            const amount =
              (parseInt(this.reward?.redemption_conversion_rate_amount) /
                parseInt(this.reward?.redemption_conversion_rate_points)) *
              parseInt(this.reward.maximum_points_discount);
            this.transformedAmount = this.productSerive.transFormToNumber(
              amount
            );
            this.consumesPoints = this.productSerive.transFormToNumber(this.reward.maximum_points_discount);
          }
        }
        if (
          this.reward &&
          this.cart.cart_total_price < this.transformedAmount
        ) {
          this.consumesPoints =
            (parseInt(this.reward?.redemption_conversion_rate_points) /
            this.productSerive.transFormToNumber(this.reward?.redemption_conversion_rate_amount)) *
            this.cart.cart_total_price;
          this.transformedAmount = this.cart.cart_total_price;
        }
        this.earnablPoints();
      });
    }
    this.cartSubscription = this.cartService.cartSubject.subscribe(
      (x: Cart) => {
        if (x !== null) {
          this.cart = x;
          this.cartProductCount = x.cartItems?.length || 0;
          this.cartTotalPrice = this.cart.cart_total_price || 0;
          this.getShippingPrice();
          this.setpageTitle();
        }
      }
    );
    this.setpageTitle();
    this.metaTagService.updateTag({
      name: 'keywords',
      content:
        'mycart, cart, vapesuite cart, brands, vapesuitebrands, suite, brand, vape brands, vape',
    });
  }

  onParseInt(value: number): number {
    return parseInt(value.toString());
  }
  selectionChange(event): void {
    window.scrollTo({ top: 0 });
  }
  ngAfterViewInit(): void {
    if (this.isLoggedIn) {
      this.stepper.selectedIndex = 1;
    }
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
      .getCoupon(this.couponCode, this.authService.getUserInfo().id)
      .subscribe((data) => {
        if (data) {
          if (this.cart.cart_total_price > data.min_order) {
            this.cartService.applyCoupon(data);
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
  getCart(): void {
    this.cart = JSON.parse(localStorage.getItem('cart'));
    if (this.cart) {
      this.isRewardChecked = this.cart.is_reward;
    }
  }
  // on remove coupon to cart
  onRemoveCoupon(): void {
    this.cartService.removeCoupon();
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
          this.cart.reward_points = this.productSerive.transFormToNumber(this.consumesPoints);
          this.cartService.setCart(this.cart);
        }
        //   if (this.userInfo.reward_points < this.reward.maximum_points_discount) {
        //     const amount = (this.reward?.conversion_rate_amount / this.reward?.conversion_rate_points) * this.userInfo.reward_points;
        //     this.transformedAmount = this.productSerive.transFormToNumber(amount);
        //   }
      } else {
        this.cart.is_reward = false;
        this.cart.reward_amount = 0;
        this.cart.reward_points = 0;
        this.cartService.setCart(this.cart);
      }
      this.earnablPoints();
      this.getCart();
    } else {
      this.cart.is_reward = false;
      this.cart.reward_amount = 0;
      this.cart.reward_points = 0;
      this.cartService.setCart(this.cart);
      this.toasterErrorMessage(
        'Earn atleast 60 points to utilize points',
        'Error'
      );
    }
  }
  earnablPoints(): void {
    this.cart.earnablPoints = this.cartService.getEarnablePoints(
      this.reward?.conversion_rate_points,
      this.reward?.conversion_rate_amount,
      this.cart
    );
    this.cart.earnablPoints = this.productSerive.transFormToNumber(
      this.cart.earnablPoints || 0
    );
    this.cartService.setCart(this.cart);
  }
  toasterErrorMessage(message: string, title: string): void {
    this.toastr.error(message, title);
  }
  toasterSuccessMessage(message: string, title: string): void {
    this.toastr.success(message, title);
  }
  // convenience getter for easy access to form fields
  // get f(): any { return this.loginForm.controls; }

  // // initialize rgister form builder
  // initializeForm(): void {
  //   this.loginForm = this.formBuilder.group({
  //     email: ['', [Validators.required, Validators.email]],
  //     password: ['', [Validators.required]],
  //   });
  // }
  setpageTitle(): void {
    const title = `${environment.APP_NAME}My Cart(${this.cartProductCount})`;
    this.titleService.setTitle(title);
    this.metaTagService.updateTag({ name: 'description', content: title });
  }
  onPlusQuantity(
    productId: number,
    variantId: number,
    quantity: number,
    cartItem: any
  ): void {
    if (quantity < cartItem.maxQty) {
      this.cartService.updateProductQuantity(
        productId,
        variantId,
        quantity + 1
      );
    }
  }
  onMinusQuantity(
    productId: number,
    variantId: number,
    quantity: number
  ): void {
    if (quantity > 1) {
      this.cartService.updateProductQuantity(
        productId,
        variantId,
        quantity - 1
      );
    }
  }
  // delete cart Item
  onDeleteCartItem(productId: number): void {
    this.cartService.removeProductFromCart(productId);
  }

  // login form submit
  // onSubmit(): void {
  //   this.submitted = true;

  //   // stop here if form is invalid
  //   if (this.loginForm.invalid) {
  //     return;
  //   }
  //   this.isLoginClicked = true;
  //   // call Login servie
  //   this.authService.login(this.loginForm.value).subscribe(data => {
  //     if (data) {
  //       this.authService.setUserInfo(data);
  //       this.authService.isLoggedIn.next(true);
  //       // this.router.navigateByUrl('/customer');
  //     } else {
  //       this.loginError = true;
  //     }
  //     this.isLoginClicked = false;
  //   }, error => {
  //     this.loginError = true;
  //     this.isLoginClicked = false;
  //   });
  // }
  // onDeliverAddressInputChange(): void {
  //   this.isDeliverAddressInputChange = !this.isDeliverAddressInputChange;
  // }
  // onDpd(value: string): void {
  //   if (this.cart) {
  //     this.cart.delivery_method = value;
  //     this.cartService.setCart(this.cart);
  //   }
  // }
  // onRoyal(value: string): void {
  //   if (this.cart) {
  //     this.cart.delivery_method = value;
  //     this.cartService.setCart(this.cart);
  //   }
  // }
  onPostOrder(): void {
    this.productSerive.postCartToDb(this.cart).subscribe((data) => {
    });
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
