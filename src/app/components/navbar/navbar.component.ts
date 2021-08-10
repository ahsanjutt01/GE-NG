import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { Store } from '@ngrx/store';

import { ToastrService } from 'ngx-toastr';
import {
  menu_hover_init,
  sidebarClose,
  accountSidebarClose,
  sidebarCheckoutClose,
  navbarDropdownMenu,
} from '../../../assets/js/customJquery';
import { GenericService } from 'src/app/_services/generic.service';
import { Settings } from 'src/app/_models/setting';
import * as navbarActions from 'src/app/components/navbar/store/navbar.actions';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/_services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/_services/cart/cart.service';
import { Subscription } from 'rxjs';
import { Cart } from 'src/app/_models/cartModel';
import { ProductService } from 'src/app/_services/product.service';
import { WishListCount } from 'src/app/_models/customerMenuCount';

//Moment
import * as moment from 'moment';
import 'moment-timezone';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NavbarComponent implements OnInit, OnDestroy, AfterViewInit {
  settings: Settings;
  cartProductCount = 0;
  cartTotalPrice = 0;
  cart: Cart;
  isSearchloading = true;
  API_URL = '';
  totalSearchResults = 0;
  isLogin = false;
  userInfo = null;
  isQueryFromSearhbar = false;
  isSearching = false;
  searchResults: any;
  isShowNoResultValue = false;
  queryValue = '';
  isloading = false;
  fromEventSubscription: Subscription;
  customerMenuCounts: WishListCount;
  menuSubscription: Subscription;
  currentDate: any;
  tommorow: any;
  dateTime: any;
  cutOffTime: any;

  constructor(
    private store: Store<{ navbar: { settings: any } }>,
    private genericService: GenericService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private productService: ProductService,
    private toastr: ToastrService
  ) {
    this.API_URL = environment.API_URL;
  }
  ngOnDestroy(): void {
    this.fromEventSubscription.unsubscribe();
    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
  }
  navigationOnclick(slug: string): void {
    // this.router.navigate(['/']).then(() => { this.router.navigate(['/category', slug]); });
  }
  ngOnInit(): void {
    menu_hover_init();
    this.getSetings();

    var c = moment().tz('Europe/london');
    var unix = c.unix();
    var date = new Date(unix * 1000);
    var hours = date.getHours();
    var day = date.getDay();
    var day = 7;

    if (day != 7) {
      if (hours <= 15) {
        var dateC = 0;
      } else {
        var dateC = 1;
      }
    } else {
      var dateC = 2;
    }

    this.currentDate = new Date();
    this.tommorow = this.currentDate.setDate(
      this.currentDate.getDate() + dateC
    );
    this.dateTime = new Date(this.tommorow);

    setInterval(() => {
      this.formatDate();
    }, 1000);

    // local sotrage updated event
    window.addEventListener('storage', (e: any) => {
      if (e.key === 'cart') {
        this.cartService.cartSubject.next(JSON.parse(e.newValue));
      }
    });
    this.cartService.getCart().subscribe((x: Cart) => {
      if (x !== null) {
        this.cart = Object.assign({}, x);
        this.cartProductCount = x.cartItems?.length || 0;
        this.cartTotalPrice = this.cart.cart_total_price || 0;
      }
    });
    this.cartService.invokeSubscribers();
    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams.q) {
        this.queryValueChange(queryParams.q);
      }
    });
    this.isQueryFromSearhbar = false;
    // get Lcal Cart
    const localCart = this.cartService.getCartFromLocalStorage();
    if (localCart) {
      // set cart
      this.cartService.setProducts({ ...localCart });
    }
    this.userInfo = this.authService.getUserInfo();
    this.authService.isLoggedIn.subscribe((isLoggedIn) => {
      this.isLogin = isLoggedIn;
      if (isLoggedIn) {
        this.userInfo = this.authService.getUserInfo();
      } else {
        this.userInfo = null;
      }
    });
    this.isLogin = this.authService.isLogin();
    if (this.isLogin) {
      this.authService.isLoggedIn.next(true);
    }
    this.authService.userInfoUpdated.subscribe((x) => {
      this.userInfo = this.authService.getUserInfo();
    });
    // this.cartService.getIpAddress().subscribe(x =>   {
    // })
    this.menuSubscription = this.authService.customerMenuCounts$.subscribe(
      (x) => {
        this.customerMenuCounts = x;
      }
    );
  }

  formatDate(): void {
    var c = this.productService.cutOffTime();
    this.cutOffTime = c.h + ' Hrs, ' + c.m + ' Mins, ' + c.s + ' Sec';
  }
  // delete cart Item
  onDeleteCartItem(index: number): void {
    this.cartService.removeProductFromCart(index);
  }
  onParseInt(value: number): number {
    return parseInt(value.toString());
  }
  deleteCartItemClicked(index: number): void {
    this.onDeleteCartItem(index);
    this.toasterSuccessMessage('Product Removed Successfully.', 'Success');
  }
  toasterSuccessMessage(message: string, title: string): void {
    this.toastr.success(message, title);
  }
  onSearching(value: string): void {
    if (this.isQueryFromSearhbar) {
      return;
    }
    this.isQueryFromSearhbar = false;
    if (value.length > 0) {
      this.isSearching = true;
      this.genericService
        .getMainSearch(value.toLowerCase())
        .subscribe((result: any) => {
          this.searchResults = { ...result };
          this.totalSearchResults =
            this.searchResults.collections.length +
            this.searchResults.suggestions.length +
            this.searchResults.brands.length +
            this.searchResults.products.length;
          this.searchResults.totalSearchResults = this.totalSearchResults;
          // this.genericService.updateMainSerchResult$(
          //   {
          //     ...result,
          //     query: value.toLowerCase(),
          //     totalSearchResults: this.totalSearchResults
          //   });
          this.isSearchloading = false;
          if (
            this.searchResults?.suggestions.length ||
            this.searchResults?.products.length ||
            this.searchResults?.collections.length ||
            this.searchResults?.brands.length
          ) {
            this.isShowNoResultValue = false;
            // this.queryValue = '';
          } else {
            this.isShowNoResultValue = true;
            // this.queryValue = value;
          }
        });
    } else {
      this.isSearching = false;
    }
  }
  getSetings(): void {
    try {
      this.isloading = true;
      this.genericService.getSeting().subscribe((settings: any) => {
        this.settings = settings.data;
        this.settings.shipping = this.settings.shipping.map((x) => ({
          ...x,
          isHaveZone: false,
        }));
        const reward = this.authService.decryption(this.settings?.reward);
        const parsedReward = JSON.parse(
          reward.substring(0, reward.length - 2).substring(8)
        );
        this.settings.reward = parsedReward.detail;
        this.store.dispatch(new navbarActions.FetchNavbar(this.settings));
        this.isloading = false;
      });
    } catch (error) {
    }
  }
  ngAfterViewInit(): void {
    // menu_hover_init();
  }
  onMobileSideBarClose(): void {
    sidebarClose();
  }

  onAccountSidebarClose(): void {
    accountSidebarClose();
  }
  onLogOut(): void {
    this.authService.logout().subscribe((x) => {
      this.toastr.success(`Logout Sucessfully`, ``);
      this.isLogin = false;
      this.authService.isLoggedIn.next(false);
      this.authService.removeUser();
      this.router.navigateByUrl('/login');
    });
  }
  removeSearching(): void {
    setTimeout(() => {
      this.isSearching = false;
    }, 300);
  }
  getProductMinPrice(product: any): number {
    return Math.min(...product.variants.flat().map((x) => x.sell_price));
  }
  onSearchNavigate(): void {
    this.router.navigate(['search'], {
      queryParams: { q: this.queryValue },
    });
  }
  queryValueChange(value: string): void {
    this.isQueryFromSearhbar = true;
    this.queryValue = value;
    this.isQueryFromSearhbar = false;
  }
  onPlusQuantity(
    productId: number,
    cartItemIndex: number,
    variantId: number,
    quantity: number,
    cartItem: any
  ): void {
    if (quantity < cartItem.maxQty) {
      if (
        this.productService.isBulkPermotion(
          this.cart.cartItems[cartItemIndex].product
        )
      ) {
        if (
          this.cartService.isExceededMaxyQty(
            this.cart.cartItems,
            productId,
            cartItem.maxQty,
            this.cart.cartItems[cartItemIndex].variant_id
          )
        ) {
          if (
            this.cart.cartItems[cartItemIndex].product.promotion.quantity <=
            this.cart.cartItems[cartItemIndex].quantity + 1
          ) {
            const qty = this.cartService.getOldAndNextProductQty(
              this.cart.cartItems,
              productId,
              1,
              this.cart.cartItems[cartItemIndex].product.promotion.quantity,
              cartItemIndex,
              this.cart.cartItems[cartItemIndex].variant_id
            );

            if (qty.updateablePairedQty) {
              this.cartService.updateProductQuantity(
                variantId,
                qty.isPairedItemIndex ? cartItemIndex : cartItemIndex - 1,
                qty.updateablePairedQty
              );
            }
            if (!qty.isNewReminderQty && qty.isUnPairedProductExist) {
              this.cartService.removeProductFromCart(
                qty.isPairedItemIndex ? cartItemIndex + 1 : cartItemIndex,
                false
              );
            } else {
              if (qty.isUnPairedProductExist) {
                this.cartService.updateProductQuantity(
                  variantId,
                  qty.isPairedItemIndex ? cartItemIndex + 1 : cartItemIndex,
                  qty.updateableUnPairedQty
                );
              } else {
                if (qty.newReminderQty > 0) {
                  this.addNewProductToCart(
                    cartItemIndex + 1,
                    variantId,
                    this.cart.cartItems[cartItemIndex],
                    qty.newReminderQty
                  );
                }
              }
            }
          } else {
            this.cartService.updateProductQuantity(
              variantId,
              cartItemIndex,
              1,
              true
            );
          }
        }
      } else {
        this.cartService.updateProductQuantity(
          variantId,
          cartItemIndex,
          1,
          true
        );
      }
      this.cartService.cartItemsHaveExclusiveOfferItems(this.cart);
      this.cartService.cartItemsHaveMixAddMatchOfferItems(this.cart);
      this.toasterSuccessMessage('Updated successfuly', 'Success');
    }
    if (productId === 0 || cartItem?.promotion_type === 'mixMatchOffer') {
      this.cartService.updateProductQuantity(0, cartItemIndex, 1, true);
    }
    // if (cartItem?.promotion_type === 'mixMatchOffer') {
    //   this.cartService.updateProductQuantity(0, cartItemIndex, 1, true);
    // }
  }
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
  onMinusQuantity(
    productId: number,
    cartItemIndex: number,
    variantId: number,
    quantity: number
  ): void {
    if (
      this.cart.cartItems[cartItemIndex]?.cart_item_promotion
        ?.promotion_type === 'free-product' &&
      this.cart.cartItems[cartItemIndex]?.cart_item_promotion?.quantity ===
        quantity
    ) {
      this.toastr.error('Offer min quantity', 'Error');
      return;
    }
    if (quantity > 1) {
      if (
        this.productService.isBulkPermotion(
          this.cart.cartItems[cartItemIndex].product
        )
      ) {
        const qty = this.cartService.getOldAndNextProductQty(
          this.cart.cartItems,
          productId,
          -1,
          this.cart.cartItems[cartItemIndex]?.cart_item_promotion?.quantity,
          cartItemIndex,
          this.cart.cartItems[cartItemIndex].variant_id
        );
        if (
          !qty.isUnPairedProductExist &&
          qty.updateablePairedQty > 0 &&
          qty.updateableUnPairedQty === 0
        ) {
          this.cartService.updateProductQuantity(
            variantId,
            cartItemIndex,
            1,
            false,
            true
          );
        } else {
          if (qty.updateablePairedQty) {
            this.cartService.updateProductQuantity(
              variantId,
              // qty.isPairedItemIndex ? cartItemIndex : cartItemIndex - 1,
              cartItemIndex,
              qty.updateablePairedQty
            );
            // this.cartService.updateProductQuantity(variantId, cartItemIndex, 1, false, true);
          }
          if (qty.updateablePairedQty > 0) {
            this.cartService.updateProductQuantity(
              variantId,
              cartItemIndex,
              1,
              false,
              true
            );
          } else {
            if (!qty.isNewReminderQty && qty.isUnPairedProductExist) {
              this.cartService.removeProductFromCart(
                qty.isPairedItemIndex ? cartItemIndex + 1 : cartItemIndex,
                true
              );
            } else {
              if (qty.isUnPairedProductExist) {
                this.cartService.updateProductQuantity(
                  variantId,
                  qty.isPairedItemIndex ? cartItemIndex + 1 : cartItemIndex,
                  qty.updateableUnPairedQty
                );
              } else {
                if (qty.newReminderQty) {
                  this.addNewProductToCart(
                    cartItemIndex + 1,
                    variantId,
                    this.cart.cartItems[cartItemIndex],
                    qty.newReminderQty
                  );
                }
              }
            }
          }
        }
      } else {
        this.cartService.updateProductQuantity(
          variantId,
          cartItemIndex,
          1,
          false,
          true
        );
      }
      this.cartService.cartItemsHaveExclusiveOfferItems(this.cart);
      this.toasterSuccessMessage('Updated successfuly', 'Success');
    }
  }
  onSidebarCheckoutClose(): void {
    sidebarCheckoutClose();
  }
  onClearAllCart(): void {
    this.cartService.emptyCart();
  }

  // add new product to cart and invoke subscribers
  addNewProductToCart(
    cartItemIndex = -1,
    variantId: number,
    cartItem,
    newQty = 1
  ): void {
    const item: any = { ...cartItem.product };
    item.quantity = newQty;
    item.product = { ...cartItem.product };
    item.product.variant = { ...cartItem.product.selectedVariant };
    item.product.variant.maxQty = cartItem.maxQty;
    item.freeProduct = null;
    if (this.productService.isBulkPermotion({ ...cartItem.product })) {
      if (cartItem.quantity % cartItem.cart_item_promotion?.quantity === 0) {
        this.cartService.addProductToCart(
          item,
          { ...cartItem.product.selectedVariant },
          cartItemIndex
        );
      } else {
        if (cartItem.quantity < cartItem.cart_item_promotion?.quantity) {
          this.cartService.addProductToCart(
            item,
            { ...cartItem.product.selectedVariant },
            cartItemIndex
          );
        } else {
          const realNumber = parseInt(
            (
              cartItem.quantity / cartItem.cart_item_promotion?.quantity
            ).toString(),
            0
          );
          const reminderNumber =
            cartItem.quantity % cartItem.cart_item_promotion?.quantity;
          cartItem.quantity =
            realNumber * cartItem.cart_item_promotion?.quantity;
          this.cartService.addProductToCart(
            item,
            { ...cartItem.product.selectedVariant },
            cartItemIndex
          );
          cartItem.quantity = reminderNumber;
          this.cartService.addProductToCart(
            item,
            { ...cartItem.product.selectedVariantt },
            cartItemIndex
          );
        }
      }
    } else {
      this.cartService.addProductToCart(item, {
        ...cartItem.product.selectedVariant,
      });
      // this.cartProduct.quantity = 1;
      // this.cartProduct.totalPrice = this.productService.getDiscountedPrice(
      //   { ...this.productDetail.product },
      //   this.selectedVariant.price,
      //   this.cartProduct.quantity
      // );
    }
    // this.cartService.invokeSubscribers();
  }
  getObjectkeysCount(obj): number {
    return Object.keys(obj).length;
  }
  onNavbarDropdownMenu(): void {
    navbarDropdownMenu();
  }
}
