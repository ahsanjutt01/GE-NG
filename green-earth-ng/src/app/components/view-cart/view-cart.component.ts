import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Cart } from 'src/app/_models/cartModel';
import { AuthService } from 'src/app/_services/auth.service';
import { CartService } from 'src/app/_services/cart/cart.service';
import { ProductService } from 'src/app/_services/product.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-cart',
  templateUrl: './view-cart.component.html',
  styleUrls: ['./view-cart.component.scss']
})
export class ViewCartComponent implements OnInit, OnDestroy {
  storesubscription: Subscription;
  cartSubscription: Subscription;
  currency = '$';
  API_URL = '';
  cart: Cart;
  couponCode = '';
  cartProductCount = 0;
  cartTotalPrice = 0;
  couponMinOrderError = false;
  couponNotFound = false;
  couponMinOrderPrice: number;
  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private cartService: CartService,
    private metaTagService: Meta,
    private titleService: Title,
    private toastr: ToastrService,
    private store: Store<{ navbar: { settings: any } }>,
  ) {
    this.API_URL = environment.API_URL;
  }
  ngOnDestroy(): void {
    if (this.storesubscription) {
      this.storesubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.cart = JSON.parse(localStorage.getItem('cart'));
    if (this.cart !== null) {
      this.cartProductCount = this.cart.cartItems?.length || 0;
      this.cartTotalPrice = this.cart.cart_total_price || 0;
      this.storesubscription = this.store.subscribe((data: any) => {
        this.currency = data.navbar.navbar.currency;
      });
    }
    this.cartSubscription = this.cartService.cartSubject.subscribe((x: Cart) => {
      if (x !== null) {
        this.cart = x;
        this.cartProductCount = x.cartItems?.length || 0;
        this.cartTotalPrice = x.cart_total_price || 0;
        this.setpageTitle();
      }
    });
    this.setpageTitle();
    this.metaTagService.updateTag(
      { name: 'keywords', content: 'mycart, cart, vapesuite cart, brands, vapesuitebrands, suite, brand, vape brands, vape' }
    );
  }

  onParseInt(value: number): number {
    return parseInt(value.toString());
  }
  // ================SORTING EXCLUSIVE ATTR============
  distinctAttr(exItems: any): any[] {
    const items = JSON.parse(JSON.stringify(exItems))
    return items.map(j => j.attribute_value).filter((x, i, a) => {
      return a.indexOf(x) === i;
    });
  }
  getQtyExItemByAttrValue(exItems: any, attrValue: string): any {
    return exItems.filter(x => x.attribute_value === attrValue).map(j => j.quantity).reduce((a, b) => a + b);
  }
  // ================SORTING EXCLUSIVE ATTR============

  // on Apply Coupon on cart
  onApplyCoupon(): void {
    this.couponNotFound = false;
    this.productService.getCoupon(this.couponCode, this.authService.getUserInfo().id).subscribe(data => {
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
  // on remove coupon to cart
  onRemoveCoupon(): void {
    this.cartService.removeCoupon();
  }
  setpageTitle(): void {
    const title = `${environment.APP_NAME}My Cart(${this.cartProductCount})`;
    this.titleService.setTitle(title);
    this.metaTagService.updateTag(
      { name: 'description', content: title }
    );
  }
  onPlusQuantity(productId: number, cartItemIndex: number, variantId: number, quantity: number, cartItem: any): void {
    if (quantity < cartItem.maxQty) {
      if (this.productService.isBulkPermotion(this.cart.cartItems[cartItemIndex].product)) {
        if (this.cartService.isExceededMaxyQty(
          this.cart.cartItems,
          productId,
          cartItem.maxQty,
          this.cart.cartItems[cartItemIndex].variant_id)) {
          if (this.cart.cartItems[cartItemIndex].product.promotion.quantity <= this.cart.cartItems[cartItemIndex].quantity + 1) {
            const qty = this.cartService.getOldAndNextProductQty(
              this.cart.cartItems,
              productId,
              1,
              this.cart.cartItems[cartItemIndex].cart_item_promotion.quantity,
              cartItemIndex,
              this.cart.cartItems[cartItemIndex].variant_id
            );

            if (qty.updateablePairedQty) {
              this.cartService.updateProductQuantity(
                variantId,
                qty.isPairedItemIndex ? cartItemIndex : cartItemIndex - 1,
                qty.updateablePairedQty);
            }
            if (!qty.isNewReminderQty && qty.isUnPairedProductExist) {
              this.cartService.removeProductFromCart(qty.isPairedItemIndex ? cartItemIndex + 1 : cartItemIndex, false);
            } else {
              if (qty.isUnPairedProductExist) {
                this.cartService.updateProductQuantity(
                  variantId,
                  qty.isPairedItemIndex ? cartItemIndex + 1 : cartItemIndex,
                  qty.updateableUnPairedQty);
              } else {
                if (qty.newReminderQty > 0) {
                  this.addNewProductToCart(cartItemIndex + 1, variantId, this.cart.cartItems[cartItemIndex], qty.newReminderQty);
                }
              }
            }
          } else {
            this.cartService.updateProductQuantity(variantId, cartItemIndex, 1, true);
          }
        }

      } else {
        this.cartService.updateProductQuantity(variantId, cartItemIndex, 1, true);
      }
      this.toasterSuccessMessage('Updated successfuly', 'Success');
    }

    if (productId === 0 || cartItem?.promotion_type === 'mixMatchOffer') {
      this.cartService.updateProductQuantity(0, cartItemIndex, 1, true);
    }
  }
  onMinusQuantity(productId: number, cartItemIndex: number, variantId: number, quantity: number): void {
    if (quantity > 1) {
      if (this.productService.isBulkPermotion(this.cart.cartItems[cartItemIndex].product)) {
        const qty = this.cartService.getOldAndNextProductQty(
          this.cart.cartItems,
          productId,
          -1,
          this.cart.cartItems[cartItemIndex].cart_item_promotion.quantity,
          cartItemIndex,
          this.cart.cartItems[cartItemIndex].variant_id
        );
        if (
          !qty.isUnPairedProductExist
          &&
          qty.updateablePairedQty > 0
          &&
          qty.updateableUnPairedQty === 0
        ) {
          this.cartService.updateProductQuantity(variantId, cartItemIndex, 1, false, true);
        } else {
          if (qty.updateablePairedQty) {
            this.cartService.updateProductQuantity(
              variantId,
              // qty.isPairedItemIndex ? cartItemIndex : cartItemIndex - 1,
              cartItemIndex,
              qty.updateablePairedQty);
            // this.cartService.updateProductQuantity(variantId, cartItemIndex, 1, false, true);

          }
          if (qty.updateablePairedQty > 0) {
            this.cartService.updateProductQuantity(variantId, cartItemIndex, 1, false, true);
          } else {
            if (!qty.isNewReminderQty && qty.isUnPairedProductExist) {
              this.cartService.removeProductFromCart(qty.isPairedItemIndex ? cartItemIndex + 1 : cartItemIndex, true);
            } else {
              if (qty.isUnPairedProductExist) {
                this.cartService.updateProductQuantity(
                  variantId,
                  qty.isPairedItemIndex ? cartItemIndex + 1 : cartItemIndex,
                  qty.updateableUnPairedQty);
              } else {
                if (qty.newReminderQty) {
                  this.addNewProductToCart(
                    cartItemIndex + 1,
                    variantId,
                    this.cart.cartItems[cartItemIndex],
                    qty.newReminderQty);
                }
              }
            }
          }
        }

      } else {
        this.cartService.updateProductQuantity(variantId, cartItemIndex, 1, false, true);
      }
      this.toasterSuccessMessage('Updated successfuly', 'Success');
    }
  }
  // delete cart Item
  onDeleteCartItem(index: number): void {
    this.cartService.removeProductFromCart(index);
  }
  deleteCartItemClicked(index: number): void {
    this.onDeleteCartItem(index);
    this.toasterSuccessMessage('Product Removed Successfully.', 'Success');
  }
  toasterSuccessMessage(message: string, title: string): void {
    this.toastr.success(message, title);
  }
  // add new product to cart and invoke subscribers
  addNewProductToCart(cartItemIndex = -1, variantId: number, cartItem, newQty = 1): void {
    const item: any = { ...cartItem.product };
    item.quantity = newQty;
    item.product = { ...cartItem.product };
    item.product.variant = { ...cartItem.product.selectedVariant };
    item.product.variant.maxQty = cartItem.maxQty;
    item.freeProduct = null;
    if (this.productService.isBulkPermotion({ ...cartItem.product })) {
      if (cartItem.quantity % cartItem.cart_item_promotion.quantity === 0) {
        this.cartService.addProductToCart(item, { ...cartItem.product.selectedVariant }, cartItemIndex);
      } else {
        if (cartItem.quantity < cartItem.cart_item_promotion.quantity) {
          this.cartService.addProductToCart(item, { ...cartItem.product.selectedVariant }, cartItemIndex);
        } else {
          const realNumber = parseInt((cartItem.quantity / cartItem.cart_item_promotion.quantity).toString(), 0);
          const reminderNumber = cartItem.quantity % cartItem.cart_item_promotion.quantity;
          cartItem.quantity = realNumber * cartItem.cart_item_promotion.quantity;
          this.cartService.addProductToCart(item, { ...cartItem.product.selectedVariant }, cartItemIndex);
          cartItem.quantity = reminderNumber;
          this.cartService.addProductToCart(item, { ...cartItem.product.selectedVariantt }, cartItemIndex);
        }
      }
    } else {
      this.cartService.addProductToCart(item, { ...cartItem.product.selectedVariant });
      // this.cartProduct.quantity = 1;
      // this.cartProduct.totalPrice = this.productService.getDiscountedPrice(
      //   { ...this.productDetail.product },
      //   this.selectedVariant.price,
      //   this.cartProduct.quantity
      // );
    }
    // this.cartService.invokeSubscribers();
  }
}

