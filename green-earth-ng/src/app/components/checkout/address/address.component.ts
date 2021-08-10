import { CdkStepper } from '@angular/cdk/stepper';
import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/_services/auth.service';
import { CartService } from 'src/app/_services/cart/cart.service';
import { GenericService } from 'src/app/_services/generic.service';
import { ProductService } from 'src/app/_services/product.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressComponent
  implements OnInit, OnDestroy, AfterViewInit, AfterContentChecked
{
  readonly BILLING = 'billing';
  readonly SHIPPING = 'shipping';
  phoneNumberPattern = environment.PHONE_VALIDATION_PATTREN;
  emailPattern = environment.EMAIL_VALIDATION_PATTREN;
  customers = [];
  searchCustomer = '';
  shipingServiceNotAvailable = '';
  isShippingServiceSelected = false;
  isAdmin = false;
  shippings = null;
  // tslint:disable-next-line: no-input-rename
  @Input('stepper') stepper: CdkStepper;
  @Input() type = '';
  selectDelivery = '';
  countries: any;
  isCustomerSelected = false;
  selectedcustomer = null;
  currency$: any;
  transformedAmount = 0;
  consumesPoints = 0;
  isRewardChecked = false;
  isAbleToUtilize = false;
  subscriptionPaymentGateWay: Subscription;
  userInfo: any;
  user: any;
  addressForm: FormGroup;
  submitted = false;
  shippingSubmitted = false;
  isClicked = false;
  cart: any;
  reward = null;
  isUnderAge = false;
  days: any;
  months = environment.MONTHS;
  years: any;
  isLoggedIn = false;
  isDeliverAddressInputChange = false;
  billingAddress = null;
  shippingAddress = null;
  oldCountryId = 0;
  loggedinServiceSubscription: Subscription;
  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private genericService: GenericService,
    private productService: ProductService,
    private toastr: ToastrService,
    private store: Store<{ navbar: { settings: any } }>,
    private cdref: ChangeDetectorRef
  ) {
    this.authService.isLoggedIn.subscribe((x) => {
      if (x) {
        this.user = this.authService.getUserInfo();
        this.userInfo = { ...this.user };
        this.isAdmin = this.userInfo?.role === 'admin' ? true : false;
        this.initializeForm();
        if (this.countries && this.userInfo.addresses) {
          const countryObj = this.countries.find(
            (x) => x.id === this.userInfo.addresses?.[0].country_id
          );
          this.onCountryChanged(countryObj);
        }
      }
    });
    this.user = this.authService.getUserInfo();
    this.userInfo = { ...this.user };
    this.isAdmin = this.userInfo?.role === 'admin' ? true : false;
    this.initializeForm();
    this.days = Array(32)
      .fill(1)
      .map((x, i) => i)
      .splice(1);
    this.years = this.genericService.getYears();
  }
  ngOnInit(): void {
    this.getCart();
    if (this.userInfo?.role === 'admin') {
      this.genericService.getCustomers().subscribe((x) => {
        if (x) {
          this.customers = x.map((x) => ({
            id: x.id,
            name: x.first_name + ' ' + x.last_name || '',
            email: x.email,
            phone: x.primary_phone,
          }));
        }
      });
    }

    this.paymentSub();
    // this.isLoggedIn = this.authService.isLogin();
    this.loggedinServiceSubscription = this.authService.isLoggedIn.subscribe(
      (x) => {
        if (x) {
          this.isLoggedIn = true;
          if (this.userInfo?.role !== 'admin') {
            this.setValues();
          }
          this.getCart();
          this.setValues();
          this.isLoggedIn = true;
        } else {
          this.isLoggedIn = false;
        }
      }
    );
    // this.setValues();
    this.store.select('navbar').subscribe((x: any) => {
      if (x?.navbar?.shipping) {
        this.shippings = JSON.parse(JSON.stringify(x?.navbar?.shipping));
      }
      this.reward = x?.navbar?.reward;
      this.countries = x?.navbar?.countries;
      if (this.countries) {
        const countryObj = this.countries.find(
          (x) => x.nicename === 'United Kingdom'
        );
        this.setFormValues('billingGroup', countryObj.id);
        this.setFormValues('shippingGroup', countryObj.id);
        this.onCountryChanged(countryObj);
      }

      if (
        this.reward &&
        this.user &&
        this.user.reward_points >=
          parseInt(this.reward?.minimum_points_discount)
      ) {
        this.isAbleToUtilize = true;
        if (
          this.reward &&
          this.user.reward_points < this.reward.maximum_points_discount
        ) {
          const amount =
            (this.reward?.conversion_rate_amount /
              this.reward?.conversion_rate_points) *
            this.user.reward_points;
          this.transformedAmount =
            this.productService.transFormToNumber(amount);
          this.consumesPoints = this.user.reward_points;
        }
        if (
          this.reward &&
          this.user.reward_points >= this.reward.maximum_points_discount
        ) {
          const amount =
            (this.reward?.conversion_rate_amount /
              this.reward?.conversion_rate_points) *
            100;
          this.transformedAmount =
            this.productService.transFormToNumber(amount);
          this.consumesPoints = 100;
        }
      }
      this.earnablPoints();
    });
    this.isRewardChecked = this.cart ? this.cart.is_reward : false;
    this.currency$ = this.store
      .select('navbar')
      .pipe(map((x: any) => x.navbar.currency));
    // when billingGroup values changes
    this.addressForm.get('billingGroup').valueChanges.subscribe((x) => {
      if (!this.isDeliverAddressInputChange) {
        if (x.country_id !== this.oldCountryId) {
          if (this.countries) {
            this.onCountryChanged(x);
          }
          this.oldCountryId = x.country_id;
          this.doStuff();
        }
      }
    });
    this.addressForm.get('shippingGroup').valueChanges.subscribe((x) => {
      if (this.isDeliverAddressInputChange) {
        if (x.country_id !== this.oldCountryId) {
          if (this.countries) {
            this.onCountryChanged(x);
          }
          this.oldCountryId = x.country_id;
          this.doStuff();
        }
      }
    });
  }
  doStuff(): void {
    this.cart.selected_delivery_method = null;
    this.shipingServiceNotAvailable = '';
    this.selectDelivery = '';
    this.cart.delivery_method = '';
    this.cartService.setCart(this.cart);
  }
  onCountryChanged(countryObj: any) {
    let found = false;
    const country = this.countries.find(
      (country) => country.id == (countryObj.country_id || countryObj.id)
    );
    const length = this.shippings.length;
    for (let i = 0; i < length; i++) {
      const zoneLength = this.shippings[i].zone.detail.length;
      loop2: for (let j = 0; j < zoneLength; j++) {
        if (country.name == this.shippings[i].zone.detail[j].country.name) {
          this.shippings[i].isHaveZone = true;
          found = true;
          break loop2;
        } else {
          this.shippings[i].isHaveZone = false;
        }
      }
    }
    return found;
  }
  selectionChanged(customer: any): void {
    this.selectedcustomer = { ...customer };
    this.isCustomerSelected = true;
    this.genericService.getCustomerAddressById(customer.id).subscribe((x) => {
      if (x) {
        this.billingAddress = x.find((a) => a.type === 'billing');
        this.setFormValues();
        this.shippingAddress = x.find((a) => a.type === 'shipping');
        this.setFormValues('shippingGroup');
      }
    });
    this.cart.customer_id = customer.id;
    this.cartService.setCart(this.cart);
  }
  onCancelSelectedCustomer(): void {
    this.isCustomerSelected = false;
  }
  ngAfterViewInit(): void {}
  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }
  ngOnDestroy(): void {
    if (this.subscriptionPaymentGateWay) {
      this.subscriptionPaymentGateWay.unsubscribe();
    }
    if (this.loggedinServiceSubscription) {
      this.loggedinServiceSubscription.unsubscribe();
    }
  }
  // onRewardCheckboxChange(isRewardChecked: boolean): void {
  //   if (this.reward && this.user.reward_points >= parseInt(this.reward?.minimum_points_discount)) {
  //     if (this.isRewardChecked) {
  //       if (this.isAbleToUtilize) {
  //         this.cart.is_reward = this.isRewardChecked;
  //         this.cart.reward_amount = this.transformedAmount;
  //         this.cart.reward_points = this.consumesPoints;
  //         this.cartService.setCart(this.cart);
  //       }
  //       //   if (this.userInfo.reward_points < this.reward.maximum_points_discount) {
  //       //     const amount = (this.reward?.conversion_rate_amount / this.reward?.conversion_rate_points) * this.userInfo.reward_points;
  //       //     this.transformedAmount = this.productSerive.transFormToNumber(amount);
  //       //   }
  //     } else {
  //       this.cart.is_reward = false;
  //       this.cart.reward_amount = 0;
  //       this.cart.reward_points = 0;
  //       this.cartService.setCart(this.cart);
  //     }
  //     this.earnablPoints();
  //     this.getCart();
  //   } else {
  //     this.toasterErrorMessage('Earn atleast 60 points to utilize points', 'Error');
  //   }

  // }

  toasterErrorMessage(message: string, title: string): void {
    this.toastr.error(message, title);
  }
  toasterSuccessMessage(message: string, title: string): void {
    this.toastr.success(message, title);
  }
  paymentSub(): void {
    this.subscriptionPaymentGateWay =
      this.authService.paymentGateway$.subscribe((x) => {
        if (x) {
          this.productService
            .postCartToDb(this.cartService.getCartFromLocalStorage())
            .subscribe(
              (res: any) => {
                this.cart.order_id = res.data.order_number;
                this.cart.is_additional_discount =
                  res.data.is_additional_discount;
                this.cart.additional_discount_price =
                  res.data.additional_discount_price;
                this.cart.additional_discount_type =
                  res.data.additional_discount_type;
                this.cartService.setCart(this.cart);
                this.loadingFalse();
                this.stepper.next();
              },
              (err) => {
                this.loadingFalse();
                this.toasterErrorMessage(
                  'Someting went wrong, Please try again',
                  'Error'
                );
              }
            );
        } else {
          this.loadingFalse();
        }
      });
    this.loadingFalse();
  }
  loadingFalse(): void {
    this.authService.loadingFalse();
  }
  getCart(): void {
    this.cart = JSON.parse(localStorage.getItem('cart'));
  }

  // earnablPoints(): void {
  //   this.cart.earnablPoints = this.cartService.getEarnablePoints(
  //     this.reward?.conversion_rate_points,
  //     this.reward?.conversion_rate_amount,
  //     this.cart.is_reward
  //       ? this.cart.cart_total_price - this.cart.reward_amount
  //       : this.cart.cart_total_price
  //   );
  //   this.cart.earnablPoints = this.productService.transFormToNumber(
  //     this.cart.earnablPoints || 0
  //   );
  //   this.cartService.setCart(this.cart);
  // }
  setValues(): void {
    if (this.userInfo) {
      if (this.type === this.BILLING) {
        if (this.cart?.billing_address) {
          if (this.cart?.billing_address) {
            this.billingAddress = this.cart?.billing_address;
          }
        } else {
          if (this.userInfo.addresses) {
            this.billingAddress = this.userInfo.addresses.find(
              (x) => x.type === this.BILLING
            );
          }
        }
      } else {
        if (this.cart?.shipping_address) {
          this.shippingAddress = this.cart?.shipping_address;
        } else {
          if (this.userInfo.addresses) {
            this.shippingAddress = this.userInfo.addresses.find(
              (x) => x.type === this.SHIPPING
            );
          }
        }
      }
      if (this.userInfo) {
        this.setFormValues();
      }
    }
  }

  onClose(): void {
    // this.isCloseClicked.emit(true);
  }
  onDeliverAddressInputChange(): void {
    this.isDeliverAddressInputChange = !this.isDeliverAddressInputChange;
    if (!this.isDeliverAddressInputChange) {
      this.shippingSubmitted = false;
    }
    if (!this.isDeliverAddressInputChange) {
      this.onCountryChanged(this.addressForm.get('billingGroup').value);
    } else {
      this.onCountryChanged(this.addressForm.get('shippingGroup').value);
    }
  }
  onShiping(item: any): void {
    let countryId = 0;
    if (this.isDeliverAddressInputChange) {
      countryId = this.addressForm.get('shippingGroup').value.country_id;
    } else {
      countryId = this.addressForm.get('billingGroup').value.country_id;
    }
    this.shipingServiceNotAvailable = '';
    this.selectDelivery = '';
    this.isShippingServiceSelected = true;
    if (countryId) {
      const country = this.countries.find((x) => x.id == countryId);
      if (this.onCountryChanged(country)) {
        if (this.cart) {
          this.cart.delivery_method = item.id;
          this.cart.selected_delivery_method = item;
          this.earnablPoints();
          // this.cartService.setCart(this.cart);
        }
      } else {
        this.shipingServiceNotAvailable = `Service is not available in ${country.name}`;
        this.cart.delivery_method = 0;
        this.cart.selected_delivery_method = null;
        this.earnablPoints();
        // this.cartService.setCart(this.cart);
      }
    }
  }
  onRoyal(value: string): void {
    if (this.cart) {
      this.cart.delivery_method = value;
      this.cartService.setCart(this.cart);
    }
  }
  initializeForm(): void {
    this.addressForm = this.formBuilder.group({
      billingGroup: this.formBuilder.group({
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        email: [
          '',
          [Validators.required, Validators.pattern(this.emailPattern)],
        ],
        // company: ['', Validators.required],
        country_id: ['', Validators.required],
        state: [''],
        city: ['', Validators.required],
        address_1: ['', Validators.required],
        postal_code: ['', Validators.required],
        phone: [
          '',
          [Validators.required, Validators.pattern(this.phoneNumberPattern)],
        ],
        day: ['', Validators.required],
        month: ['', Validators.required],
        year: ['', Validators.required],
        order_notes: [''],
      }),
      shippingGroup: this.formBuilder.group({
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        email: [
          '',
          [Validators.required, Validators.pattern(this.emailPattern)],
        ],
        // company: ['', Validators.required],
        country_id: ['', Validators.required],
        state: [''],
        city: ['', Validators.required],
        address_1: ['', Validators.required],
        postal_code: ['', Validators.required],
        phone: [
          '',
          [Validators.required, Validators.pattern(this.phoneNumberPattern)],
        ],
      }),
    });
  }

  get f(): any {
    return (this.addressForm.get('billingGroup') as FormGroup).controls;
  }
  get fs(): any {
    return (this.addressForm.get('shippingGroup') as FormGroup).controls;
  }
  // get f(): any { return this.addressForm.controls; }
  // billingGroup
  get billingGroup(): any {
    return this.addressForm.get('billingGroup');
  }
  // shippingGroup
  get shippingGroup(): any {
    return this.addressForm.get('shippingGroup');
  }
  // Set Default Values
  setFormValues(formGroupName = 'billingGroup', countryId = 0): void {
    let address = null;
    if (formGroupName === 'billingGroup') {
      address = this.billingAddress;
    } else {
      address = this.shippingAddress;
    }
    if (formGroupName === 'billingGroup') {
      this.addressForm.get(formGroupName).setValue({
        first_name: address?.first_name || '',
        last_name: address?.last_name || '',
        email: address?.email || '',
        // company: this.userInfo.company || '',
        country_id: countryId ? countryId : address?.country_id || 0,
        state: address?.state || '',
        city: address?.city || '',
        address_1: address?.address_1 || '',
        postal_code: address?.postal_code || '',
        phone: address?.phone || '',
        order_notes: '',
        day: new Date(this.userInfo?.date_of_birth).getDate() || 1,
        month: new Date(this.userInfo?.date_of_birth).getMonth() || 1,
        year:
          new Date(this.userInfo?.date_of_birth).getFullYear() ||
          new Date().getFullYear(),
      });
    } else {
      this.addressForm.get(formGroupName).setValue({
        first_name: address?.first_name || '',
        last_name: address?.last_name || '',
        email: address?.email || '',
        country_id: countryId ? countryId : address?.country_id || 0,
        state: address?.state || '',
        city: address?.city || '',
        address_1: address?.address_1 || '',
        postal_code: address?.postal_code || '',
        phone: address?.phone || '',
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.selectDelivery = '';
    if (this.isDeliverAddressInputChange) {
      this.shippingSubmitted = true;
    }
    if (this.shipingServiceNotAvailable) {
      return;
    }
    if (this.cart.selected_delivery_method) {
      this.isShippingServiceSelected = true;
    }
    if (
      !this.cart.selected_delivery_method ||
      !this.isShippingServiceSelected
    ) {
      this.selectDelivery = 'Please select delivery method';
      return;
    }
    if (this.isDeliverAddressInputChange) {
      if (this.addressForm.invalid) {
        return;
      }
    }
    if (this.addressForm.get('billingGroup').invalid) {
      return;
    }
    const dob = new Date(
      `${this.addressForm.get('billingGroup').value.day}-${
        this.addressForm.get('billingGroup').value.month
      }-${this.addressForm.get('billingGroup').value.year}`
    );
    if (this.diff_years(new Date(), dob) < 18) {
      this.isUnderAge = true;
      return;
    } else {
      this.isUnderAge = false;
    }
    if (!this.isUnderAge) {
      this.isClicked = true;
      this.addAddress(dob);
      if (!this.isAdmin) {
        this.authService.getGateWay();
      }
    }
  }
  addAddress(dob): void {
    this.addressForm.value.billingGroup.date_of_birth = dob;
    this.cartService.saveAddress(
      this.type,
      this.addressForm.value.billingGroup
    );
    if (this.isDeliverAddressInputChange) {
      this.cartService.saveAddress(
        'shipping',
        this.addressForm.value.shippingGroup
      );
    } else {
      this.cartService.saveAddress('shipping', null);
    }
    if (!this.isAdmin) {
      this.cartService.updateIsPaymentPage(true);
    }
    this.isClicked = false;
    if (this.isAdmin) {
      this.productService
        .postCartToDb(this.cartService.getCartFromLocalStorage(), true)
        .subscribe(
          (res) => {
            this.cartService.initializeCart();
            this.router.navigateByUrl('/customer/detail/carts');
          },
          (error) => {
            this.loadingFalse();
            this.toasterErrorMessage(
              'Something went wrong please try again in refresh the page',
              'Error'
            );
          }
        );
    }
  }
  diff_years(dt2: Date, dt1: Date): number {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60 * 60 * 24;
    return Math.abs(Math.round(diff / 365.25));
  }
  earnablPoints(): void {
    this.cart.earnablPoints = this.cartService.getEarnablePoints(
      this.reward?.conversion_rate_points,
      this.reward?.conversion_rate_amount,
      this.cart
    );
    this.cart.earnablPoints = this.productService.transFormToNumber(
      this.cart.earnablPoints || 0
    );
    this.cartService.setCart(this.cart);
  }
}
