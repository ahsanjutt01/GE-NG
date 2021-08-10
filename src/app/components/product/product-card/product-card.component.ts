import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cart, CartItem } from 'src/app/_models/cartModel';
import { AuthService } from 'src/app/_services/auth.service';
import { CartService } from 'src/app/_services/cart/cart.service';
import { ProductService } from 'src/app/_services/product.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input() product: any;
  @Input() currency = '$';
  @Input() detailPage = false;
  @Input() listingPage = false;
  @Input() collectionPage = false;
  @Input() homePage = false;
  @Input() isSearch = false;
  @Input() isWishlistShowPage = false;
  @Input() isCrossSale = false;
  loading = true;

  appCurrency: Observable<{ footer: any }>;
  readonly PERCENTAGE = 'percentage';
  readonly PRICE = 'price';
  API_URL: string;
  price = 0;
  isLoggedIn = false;
  isWhishListItem = false;
  arrangedVariants = [];
  userInfo: any;
  cart: Cart;
  qty = 0;
  crossProductQty = 0;
  isProductAdded = false;
  subscription: Subscription;
  constructor(
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private toastr: ToastrService,
    private store: Store<{ navbar: { settings: any } }>
  ) {
    this.API_URL = environment.API_URL;
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    if (this.product && this.product?.variants) {
      this.product.minPrice = this.getPrice(this.product.variants);
    }
    this.appCurrency = this.store.select('navbar').pipe(map((x: any) => x.navbar.currency));
    this.getVariants();
    this.isLoggedIn = this.authService.isLogin();
    if (this.isLoggedIn) {
      this.userInfo = this.authService.getUserInfo();
      const wishList = this.userInfo?.wishlist;
      if (wishList && wishList.length) {
        const wishedItem = wishList.find(x => x.product_id === this.product.id);
        if (wishedItem) {
          this.isWhishListItem = true;
        }
      }
    }
    this.cartProdQuantity();
    this.productQtyUpdate(this.cartService.getCartFromLocalStorage());
  }

  cartProdQuantity(): void {
    this.subscription = this.cartService.getCart().subscribe(x => {
      if (x != null) {
        this.productQtyUpdate(x);
      }
    });
    // this.cartService.invokeSubscribers();
  }

  productQtyUpdate(x: Cart): void {
    if (x != null) {
      this.cart = { ...x };
      this.qty = x.cartItems.filter((i: CartItem) => i.product_id === this.product.id)
        .map(i => i.quantity).reduce((a, b) => a + b, 0);
    }

    if (this.isCrossSale) {
      const cartProd = x.cartItems.find(
        (i: CartItem) => i.product_id === this.product.id &&
          i.selected_variant.id === this.product.variants[0].id
      );
      this.crossProductQty = cartProd ? cartProd.quantity : 0;
    }
  }
  onLoad(): void {
    this.loading = false;
  }
  onAddToWishList(productId: number): void {
    this.productService.postWhislistItem(productId).subscribe(x => {
      this.isWhishListItem = true;
      this.userInfo = this.authService.getUserInfo();
      if (this.userInfo?.wishlist) {
        const wishedItemIndex = this.userInfo?.wishlist.findIndex(w => w.product_id === this.product.id);
        if (wishedItemIndex > -1) {
          this.isWhishListItem = false;
          this.userInfo?.wishlist.splice(wishedItemIndex, 1);
          this.toastr.success('Removed from whishlist Sucessfuly', 'Sucess');
          if (this.isWishlistShowPage) {
            this.productService.isWishlistShowPage.next({ isWishlistShowPage: true, prodId: this.product.id });
          }
        } else {
          this.userInfo?.wishlist.push({ product_id: this.product.id });
          this.toastr.success('Added to whishlist Sucessfuly', 'Sucess');
          this.authService.setUserInfo(this.userInfo);
        }
        this.authService.setUserInfo(this.userInfo);
      }
      const count = this.userInfo?.wishlist.length || 0;
      this.authService.updateCustomerMenuCounts$({ ... this.authService.getCustomerMenuCounts(), wishListCount: count });
    });
  }
  getPrice(variants: any): number {
    if (variants && variants.length) {
      const minPrice = Math.min(...variants.map(x => x.sell_price));
      return this.productService.getDiscountedPrice({ ...this.product }, minPrice);
    }
    else {
      return 0;
    }
  }
  // getOldPrice
  getOldPrice(variants: any): number {
    if (variants && variants.length) {
      return Math.min(...variants.map(x => x.sell_price));
    }
    else {
      return 0;
    }
  }
  onProductDetail(): void {
    // this.router.navigate([`/product`, this.product?.sku]);
  }
  getVariants(): any {
    this.arrangedVariants = [];
    const variants = this.product?.variants;
    if (variants) {
      const variantNames = [... new Set(variants.map(x => x.attribute_detail).flat().map(a => a.attribute_name))];
      let variantsInProduct: any = [... new Set(variants.map(x => x.attribute_detail).flat())];
      variantsInProduct = variantsInProduct.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.attribute_value === thing.attribute_value
        ))
      );
      variantNames.forEach((key, value) => {
        this.arrangedVariants.push(
          {
            attr: key,
            values: [...new Set(variantsInProduct.filter(x => x.attribute_name === key).map(z => z.attribute_value))]
          });
      });
    }
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.arrangedVariants.length; i++) {
      for (let j = 0; j < this.arrangedVariants[i].values.length; j++) {
        if (j === 2 && this.arrangedVariants[i].values.length !== 3) {
          this.arrangedVariants[i].values[j] = `+${this.arrangedVariants[i].values.length - 2} more`;
          this.arrangedVariants[i].values = this.arrangedVariants[i].values.splice(0, 3);
        }
      }
    }
  }
  getFalvors(product: any): string {
    return product?.properties_data?.find(x => x.property_type === 'below_name')?.property_value;
  }
  getBelowName(product: any): string {
    const belowName = product?.properties_data?.find(x => x.property_type === 'below_name')?.property_name;
    if (belowName) {
      return belowName + ':';
    } else {
      return '';
    }
  }
  getGreenLabel(): void {
    return this.product.properties_data
      .filter(x => x.property_type === 'green_label')
      .map(x => x.property_value).toString();
  }
  onShowModelClick(prod: any): void {
    if (prod) {
      this.productService.openCard.next({ isOpen: true, product: prod });
    }
  }
  isProdOutOfStock(): boolean {
    if (this.product.variants === undefined) {
    }
    if (this.product) {
      return this.product.variants.map(x => x.initial_quantity).reduce((a, b) => a + b, 0) > 0 ? false : true;
    } else {
      return false;
    }
  }
  onAddToCart(crossQty = 0): void {
    if (crossQty === 0) {

      const selectedVariant = { ...this.product.variants[0] };
      selectedVariant.image = selectedVariant.variant_image.image;
      const cartItem = { ...this.product };
      cartItem.quantity = 1;
      cartItem.product = { ...this.product.product };
      cartItem.product.variant = selectedVariant;
      cartItem.product.variant.maxQty = this.product.quantity;
      cartItem.freeProduct = null;
      cartItem.isFreeNicShot = false;
      this.cartService.addProductToCart(cartItem, selectedVariant);
    } else {
      const index = this.cart.cartItems.findIndex(
        (i: CartItem) => i.product_id === this.product.id &&
          i.selected_variant.id === this.product.variants[0].id
      );
      this.cartService.updateProductQuantity(this.product.variants[0].id, index, 1, true);
    }
  }
}
