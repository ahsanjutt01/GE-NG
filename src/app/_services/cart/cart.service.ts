import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Cart, CartItem, CartItemPromotion } from 'src/app/_models/cartModel';
import { environment } from 'src/environments/environment';
import { ProductService } from '../product.service';
import { RestService } from '../rest.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  readonly GET_IP_URL = environment.GET_IP_URL;
  private _isPaymentPage$ = new BehaviorSubject<boolean>(false);
  private _newlyAddedProduct$ = new BehaviorSubject<any>(null);
  readonly DISCOUNT_OFFER = 'discount-offer';
  readonly BULK_OFFER = 'bulk-offer';
  randomNumber: number;
  public cart: Cart = {
    id: 0,
    order_id: this.makeOrderId(10),
    customer_id: JSON.parse(localStorage.getItem('userInfo'))?.id,
    user_agent_detail: '',
    cart_price: 0,
    cart_discount: 0,
    cart_price_after_discount: 0,
    is_taxes: 0,
    tax_name: '',
    tax_price: 0,
    cart_price_after_tax: 0,
    is_coupon: false,
    coupon_id: 0,
    coupon_code: '',
    coupon_discount_type: '',
    coupon_discount_price: 0,
    coupon_total_discount_price: 0,
    cart_price_after_coupon: 0,
    cart_total_price: 0,
    is_reward: false,
    reward_points: 0,
    reward_amount: 0,
    cartItems: [],
  };
  public cartSubject = new Subject<Cart>();

  constructor(
    private http: HttpClient,
    private restHttp: RestService,
    private productService: ProductService
  ) {
    // if (!this.cart) {
    //   this.initializeCart();
    // }
    this.getIpAddress().subscribe((x) => {
      this.cart.user_agent_detail = JSON.stringify(x);
      // this.cart.user_agent_detail =
      //   '{"ip":"94.58.135.188","city":"Dubai","region":"Dubai","country":"AE","loc":"25.0772,55.3093","org":"AS5384 Emirates Telecommunications Corporation","timezone":"Asia/Dubai","readme":"https://ipinfo.io/missingauth"}';
      if (this.cart.order_id.length < 9) {
        this.cart.order_id = this.makeOrderId(10);
      }
    });
    const localCart = JSON.parse(localStorage.getItem('cart'));
    if (localCart) {
      this.cart = localCart;
    }
  }

  get isPaymentPage$(): Observable<boolean> {
    return this._isPaymentPage$.asObservable();
  }

  get newlyAddedProduct$(): Observable<boolean> {
    return this._newlyAddedProduct$.asObservable();
  }

  setNullNewlyAddedProduct$(): void {
    this._newlyAddedProduct$.next(null);
  }

  updateIsPaymentPage(isPaymentPage: boolean): void {
    this._isPaymentPage$.next(isPaymentPage);
  }

  initializeCart(): void {
    this.cart = {
      id: 0,
      order_id: this.makeOrderId(10),
      customer_id: JSON.parse(localStorage.getItem('userInfo'))?.id,
      user_agent_detail: '',
      cart_price: 0,
      cart_discount: 0,
      cart_price_after_discount: 0,
      is_taxes: 0,
      tax_name: '',
      tax_price: 0,
      cart_price_after_tax: 0,
      is_coupon: false,
      coupon_id: 0,
      coupon_code: '',
      coupon_discount_type: '',
      coupon_discount_price: 0,
      coupon_total_discount_price: 0,
      cart_price_after_coupon: 0,
      cart_total_price: 0,
      is_reward: false,
      reward_points: 0,
      reward_amount: 0,
      cartItems: [],
    };
    this.cartSubject.next(this.cart);
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  // API ip info Request
  getIpAddress(): Observable<any> {
    return this.http.get(this.GET_IP_URL);
  }
  postCart(): void {
    this.getIpAddress().subscribe((x) => {
      // console.log('=========IPINFO=====\n\n', x, '\n\n');
      // this.cart.user_agent_detail = JSON.stringify(x);
      this.cart.user_agent_detail =
        '{"ip":"94.58.135.188","city":"Dubai","region":"Dubai","country":"AE","loc":"25.0772,55.3093","org":"AS5384 Emirates Telecommunications Corporation","timezone":"Asia/Dubai","readme":"https://ipinfo.io/missingauth"}';
      // if (this.cart.order_id.length < 9) {
      //   this.cart.order_id = this.makeOrderId(10);
      // }
    });
  }

  makeOrderId(length: number): string {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  getCart(): Observable<Cart> {
    return this.cartSubject.asObservable();
  }
  setCart(cart: Cart): void {
    localStorage.setItem('cart', JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  setProducts(cart: Cart): void {
    this.cart.cartItems = cart.cartItems;
    this.cartSubject.next(this.cart);
  }
  // add nicshoot to existing product
  addFreeNicShoot({ ...freeProduct }, prodId: number, variantId: number): void {
    this.cart = this.getCartFromLocalStorage();
    const index = this.cart.cartItems.findIndex(
      (x) => x.product_id === prodId && x.selected_variant.id === variantId
    );
    if (index > -1) {
      freeProduct.quantity =
        this.cart.cartItems[index].quantity * freeProduct.realQuantity;
      this.cart.cartItems[index].freeProduct = freeProduct;
      this.cart.cartItems[index].isFreeNicShot = false;
      this.setCart(this.cart);
      this.cartSubject.next(this.cart);
    }
  }
  // add nicshoot to existing product
  removeFreeNicShoot(prodId: number, variantId: number): void {
    this.cart = this.getCartFromLocalStorage();
    const index = this.cart.cartItems.findIndex(
      (x) => x.product_id === prodId && x.selected_variant.id === variantId
    );
    if (index > -1) {
      this.cart.cartItems[index].isFreeNicShot = true;
      this.cart.cartItems[index].freeProduct = null;
      this.setCart(this.cart);
      this.cartSubject.next(this.cart);
    }
  }
  updateProductQuantity(
    variantId: number,
    cartItemIndex: number,
    quantity: number,
    onPlusQuantity = false,
    onMinusQuantity = false
  ): void {
    // const cartItemIndex = this.cart.cartItems.findIndex(x => x.product_id === productId && x.variant_id === variantId);
    this.cart = JSON.parse(localStorage.getItem('cart'));
    if (variantId !== 0) {
      let newQuantity = 0;
      newQuantity =
        !onPlusQuantity && !onMinusQuantity
          ? this.cart.cartItems[cartItemIndex].quantity + quantity
          : 0;
      if (onPlusQuantity) {
        newQuantity = this.cart.cartItems[cartItemIndex].quantity + 1;
      } else if (onMinusQuantity) {
        newQuantity = this.cart.cartItems[cartItemIndex].quantity - 1;
      }
      const productPrice = this.getProductPrice(
        this.cart.cartItems[cartItemIndex].product,
        variantId,
        newQuantity
      );

      if (cartItemIndex > -1) {
        this.cart.cartItems[cartItemIndex].quantity = newQuantity;

        if (this.cart.cartItems[cartItemIndex].freeProduct) {
          this.cart.cartItems[cartItemIndex].freeProduct.quantity =
            this.cart.cartItems[cartItemIndex].freeProduct.realQuantity *
            newQuantity;
        }
        this.cart.cartItems[cartItemIndex].unit_price = productPrice.realPrice;
        this.cart.cartItems[cartItemIndex].price = productPrice.realTotalPrice;
        this.cart.cartItems[cartItemIndex].discount = productPrice.discount;
        this.cart.cartItems[cartItemIndex].price_after_discount =
          productPrice.discountedTotalPrice;
        this.cart.cartItems[cartItemIndex].total_price =
          productPrice.discountedTotalPrice <= 0
            ? productPrice.realPrice * newQuantity
            : productPrice.discountedTotalPrice;
        this.cart.cartItems[cartItemIndex].afterDiscountPrice =
          productPrice.afterDiscountPrice;
        this.updateCartPrices();
        // If  order total price  less then coupon min order pice then remove the coupon
        if (
          this.cart.is_coupon &&
          this.cart.cart_total_price < this.cart.coupon_discount_price
        ) {
          this.removeCoupon();
        }
      }
    } else {
      this.exclusiveUpdateQty(cartItemIndex, onMinusQuantity);
    }
    this.removeProductThatHaveZeroQty();
    this.cartSubject.next(this.cart);
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.postCart();
  }
  exclusiveUpdateQty(cartItemIndex: number, onMinusQuantity = false): void {
    if (onMinusQuantity === false) {
      this.cart.cartItems[cartItemIndex].quantity += 1;
      this.cart.cartItems[cartItemIndex].price =
        this.cart.cartItems[cartItemIndex].quantity *
        this.cart.cartItems[cartItemIndex].unit_price;
      this.cart.cartItems[
        cartItemIndex
      ].price_after_discount = this.cart.cartItems[cartItemIndex].price;
      this.cart.cartItems[cartItemIndex].total_price =
        this.cart.cartItems[cartItemIndex].quantity *
        this.cart.cartItems[cartItemIndex].unit_price;
      this.cart.cartItems[
        cartItemIndex
      ].afterDiscountPrice = this.cart.cartItems[cartItemIndex].price;
    } else {
      this.cart.cartItems[cartItemIndex].quantity -= 1;
      this.cart.cartItems[cartItemIndex].price =
        this.cart.cartItems[cartItemIndex].quantity *
        this.cart.cartItems[cartItemIndex].unit_price;
      this.cart.cartItems[
        cartItemIndex
      ].price_after_discount = this.cart.cartItems[cartItemIndex].price;
      this.cart.cartItems[cartItemIndex].total_price =
        this.cart.cartItems[cartItemIndex].quantity *
        this.cart.cartItems[cartItemIndex].unit_price;
      this.cart.cartItems[
        cartItemIndex
      ].afterDiscountPrice = this.cart.cartItems[cartItemIndex].price;
    }
    this.updateCartPrices();
  }

  freeProductTranslateToProduct(item): any {
    item.variant.image = item.variant.variant_image.image;
    const product = {
      sku: item.sku ? item.sku : 'product sku here',
      id: item.linked_product_id,
      quantity: 1,
      variants: [item.variant],
      name: item.product_name,
      properties_data: [
        {
          property_name: 'Flavours',
          property_type: 'below_name',
          property_value: item.assignment,
        },
      ],
      promotion: item.promotions.length > 0 ? item.promotions[0] : null,
      assignment: item.assignment,
      deal_of_the_day: item.deal_of_the_day,
    };
    return product;
  }
  // Add single product to the cart
  addProductToCart(
    product: any,
    selectedVariant: any,
    cartItemIndex = -1
  ): void {
    // get product Prices
    let newlyaddedProd = null;
    const localCart = JSON.parse(localStorage.getItem('cart'));
    if (localCart) {
      this.cart = localCart;
    }
    if (selectedVariant !== null) {
      const productPrice = this.getProductPrice(
        product,
        selectedVariant.id,
        product.quantity
      );
      const cartItem: CartItem = {
        order_id: this.cart.order_id,
        product_id: product.id,
        sku: product.sku,
        variant_id: selectedVariant.id,
        selected_variant: product.variants.find(
          (x) => x.id === selectedVariant.id
        ),
        quantity: product.quantity,
        maxQty: product.variants.find((x) => x.id === selectedVariant.id)
          .initial_quantity,
        name: product.name,
        property_name: product.properties_data.find(
          (x) => x.property_type === 'below_name'
        )?.property_name,
        property_value: product.properties_data.find(
          (x) => x.property_type === 'below_name'
        )?.property_value,
        attributes_detail: this.getAttributeDetail(product, selectedVariant.id),
        thumbnail: selectedVariant.image,
        unit_price: productPrice.realPrice,
        price: productPrice.realPrice * product.quantity,
        discount: productPrice.discount,
        price_after_discount: productPrice.discountedTotalPrice,
        total_price:
          productPrice.discountedTotalPrice <= 0
            ? productPrice.realPrice * product.quantity
            : productPrice.discountedTotalPrice,
        is_deal_of_the_day: product.deal_of_the_day == null ? false : true,
        deal_of_the_day: product.deal_of_the_day,
        is_promotion:
          product.promotion && product.deal_of_the_day === null ? true : false,
        promotion_type:
          product.promotion && product.deal_of_the_day === null
            ? 'promotion'
            : '',
        // promotion_type: product.promotion ? product.promotion.promotion_type : '',
        afterDiscountPrice: productPrice.afterDiscountPrice,
        promotion_title: product.promotion ? product.promotion.title : '',
        exclusive_offer: product.exclusive_offer,
        mix_match_offer: product.mix_match_offer,
        product,
        isFreeNicShot: product?.isFreeNicShot ? true : false,
        freeProduct: product.freeProduct,
        cart_item_promotion: null, // promotion
        isFreeProductsPermotion: product.isFreeProductsPermotion,
        freeProducts: product.freeProducts,
      };
      if (cartItem.is_deal_of_the_day) {
        cartItem.promotion_type = 'deal_of_the_day';
      }
      if (product.freeProduct) {
        cartItem.freeProduct.realQuantity = product.freeProduct.quantity;
        cartItem.freeProduct.quantity =
          product.freeProduct.realQuantity * cartItem.quantity;
      }
      if (cartItem.is_promotion) {
        const cartItemPromotion: CartItemPromotion = {
          order_id: cartItem.order_id,
          promotion_id: product.promotion.id,
          promotion_type: product.promotion.promotion_type,
          variant_id: cartItem.variant_id,
          quantity: product.promotion.quantity,
          promotion_detail_id: product.promotion.promotion_detail_id,
          discount_type: product.promotion.discount_type,
          discount_price: product.promotion.discount_price,
          promotion_start_date: product.promotion.start_date,
          promotion_end_date: product.promotion.end_date,
          isMixMatch: product.mix_match_offer ? true : false,
        };
        cartItem.cart_item_promotion = cartItemPromotion;
      }
      // const cartItemIndex = this.cart.cartItems.findIndex(x => x.product_id === product.id && x.variant_id === selectedVariant.id);
      // if (cartItemIndex > -1 && this.cart.cartItems[cartItemIndex].variant_id === selectedVariant.id) {
      //   cartItem.freeProduct = this.cart.cartItems[cartItemIndex].freeProduct;
      //   this.cart.cartItems[cartItemIndex] = { ...cartItem };
      // } else {
      product.selectedVariant = selectedVariant;
      if (cartItemIndex < 0) {
        this.cart.cartItems.push({ ...cartItem });
        newlyaddedProd = { ...cartItem };
      } else {
        this.cart.cartItems.splice(cartItemIndex, 0, { ...cartItem });
      }
    } else {
      if (product.isExclusive) {
        const exclusiveCartItem = this.getExclusiveCartItem(product);
        this.cart.cartItems.push({ ...exclusiveCartItem });
        newlyaddedProd = { ...exclusiveCartItem };
      } else if (product.isMixMatchOffer) {
        // const items = this.cart.cartItems.filter(x => x.mix_match_offer);
        // const count = product.mixMatchItems.map(x => x.quantity).reduce((a, b) => a + b, 0);
        // const mixMatchOffer = product.promotion.quantity;

        // if (count === mixMatchOffer) {
        const emixMatchCartItem = this.getMixMatchCartItem(product);
        this.cart.cartItems.push({ ...emixMatchCartItem });
        newlyaddedProd = { ...emixMatchCartItem };
        // } else {
        // if (count >= mixMatchOffer) {
        //   this.cartItemsHaveMixAddMatchOfferItems(this.cart);

        //   const reminder = count % mixMatchOffer.quantity;
        //   const itemQty = parseInt(`${count / mixMatchOffer.quantity}`, 0);

        //   if (reminder === 0) {
        //     const length = items.length;
        //     for (let i = 0; i < length; i++) {
        //       if (items[i].quantity > mixMatchOffer.quantity) {
        //         items[i].quantity = mixMatchOffer.quantity;
        //       }
        //     }

        //   }
        // }
      }
    }
    this.removeProductThatHaveZeroQty();
    this.updateCartPrices();
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.cart = this.getCartFromLocalStorage();
    this.cartSubject.next(this.cart);
    newlyaddedProd.totalCartPrice = this.cart.cart_total_price;
    newlyaddedProd.cart = this.cart;
    // debugger;
    this._newlyAddedProduct$.next(newlyaddedProd);
    // }
    // this.productService.postCartToDb
  }
  getExclusiveCartItem(product: any): any {
    const cartItem: CartItem = {
      order_id: this.cart.order_id,
      product_id: 0,
      sku: '',
      variant_id: 0,
      quantity: product.quantity,
      maxQty: 0,
      name: product?.promotion?.title,
      property_name: product.property_name,
      property_value: product.property_value,
      attributes_detail: '',
      thumbnail: '',
      unit_price: product.price,
      price: product.price * product.quantity,
      discount: 0,
      price_after_discount: product.price * product.quantity,
      total_price: product.price * product.quantity,
      is_deal_of_the_day: false,
      deal_of_the_day: null,
      is_promotion: true,
      promotion_type: 'exlcusive',
      afterDiscountPrice: product.price * product.quantity,
      promotion_title: product.promotion ? product.promotion.title : '',
      product: null,
      freeProduct: product.freeProduct,
      cart_item_promotion: null, // promotion
      exclusiveItems: product.exclusiveItems,
    };

    if (cartItem.is_promotion) {
      const cartItemPromotion: CartItemPromotion = {
        order_id: cartItem.order_id,
        title: product?.promotion?.title,
        isExclusive: cartItem.promotion_type === 'exlcusive' ? true : false,
        isMixMatch: false,
        promotion_id: product.promotion.id,
        promotion_type: product.promotion.promotion_type,
        variant_id: cartItem.variant_id,
        quantity: product.promotion.quantity,
        promotion_detail_id: product.promotion.promotion_detail_id,
        discount_type: product.promotion.discount_type,
        discount_price: product.promotion.discount_price,
        promotion_start_date: product.promotion.start_date,
        promotion_end_date: product.promotion.end_date,
      };
      cartItem.cart_item_promotion = cartItemPromotion;
    }
    return cartItem;
  }
  getMixMatchCartItem(product: any): any {
    const cartItem: CartItem = {
      order_id: this.cart.order_id,
      product_id: product.id,
      sku: '',
      variant_id: 0,
      quantity: product.quantity,
      maxQty: 0,
      name: product?.promotion?.title,
      property_name: product.property_name,
      property_value: product.property_value,
      attributes_detail: '',
      thumbnail: '',
      unit_price: product.price,
      price: product.price * product.quantity,
      discount: 0,
      price_after_discount: product.price * product.quantity,
      total_price: product.price * product.quantity,
      is_deal_of_the_day: false,
      deal_of_the_day: null,
      is_promotion: true,
      promotion_type: 'mixMatchOffer',
      afterDiscountPrice: product.price * product.quantity,
      promotion_title: product.promotion ? product.promotion.title : '',
      product: null,
      freeProduct: product.freeProduct,
      // prodId: product.id,
      cart_item_promotion: null, // promotion
      mixMatchItems: product.mixMatchItems,
    };

    if (cartItem.is_promotion) {
      const cartItemPromotion: CartItemPromotion = {
        order_id: cartItem.order_id,
        title: product?.promotion?.title,
        isExclusive: false,
        isMixMatch: cartItem.promotion_type === 'mixMatchOffer' ? true : false,
        promotion_id: product.promotion.id,
        promotion_type: product.promotion.promotion_type,
        variant_id: cartItem.variant_id,
        quantity: product.promotion.quantity,
        promotion_detail_id: product.promotion.promotion_detail_id,
        discount_type: product.promotion.discount_type,
        discount_price: product.promotion.discount_price,
        promotion_start_date: product.promotion.start_date,
        promotion_end_date: product.promotion.end_date,
      };
      cartItem.cart_item_promotion = cartItemPromotion;
    }
    return cartItem;
  }
  updateCartPrices(): void {
    this.cart.cart_price = this.cart.cartItems
      .map((x) => x.price)
      .reduce((a, b) => a + b, 0);
    const cartDiscount = this.cart.cartItems
      .map((x) => x.price_after_discount)
      .reduce((a, b) => a + b, 0);
    if (cartDiscount > 0) {
      this.cart.cart_discount = this.cart.cart_price - cartDiscount;
    }
    // this.cart.cart_price_after_discount = this.cart.cart_discount;
    this.cart.cart_price_after_discount = this.cart.cartItems
      .map((x) => x.total_price)
      .reduce((a, b) => a + b, 0);
    this.cart.cart_price_after_tax =
      this.cart.cart_price_after_discount - this.cart.tax_price;
    this.cart.cart_price_after_coupon = this.getPriceAfterCounpon();
    this.cart.cart_total_price = this.cart.cart_price_after_coupon;
  }
  applyCoupon(couponData: any): void {
    this.cart = JSON.parse(localStorage.getItem('cart'));
    if (this.cart.cart_price_after_coupon > couponData.min_order) {
      this.cart.coupon_id = couponData.id;
      this.cart.coupon_code = couponData.coupon_code;
      this.cart.is_coupon = true;
      this.cart.coupon_discount_type = couponData.type.toString();
      this.cart.coupon_discount_price = couponData.coupon_code;
      this.cart.coupon_discount_price = couponData.amount;
      this.cart.cart_price_after_coupon = this.getPriceAfterCounpon();
      this.cart.cart_total_price = this.cart.cart_price_after_coupon;
      this.cartSubject.next(this.cart);
      localStorage.setItem('cart', JSON.stringify(this.cart));
    }
  }
  removeCoupon(): void {
    this.cart.coupon_id = 0;
    this.cart.coupon_code = '';
    this.cart.is_coupon = false;
    this.cart.coupon_discount_type = '';
    this.cart.coupon_discount_price = 0;
    this.cart.coupon_discount_price = 0;
    this.cart.cart_price_after_coupon =
      this.cart.cart_total_price + this.cart.coupon_total_discount_price;
    this.cart.cart_total_price = this.cart.cart_price_after_coupon;
    this.cart.coupon_total_discount_price = 0;
    this.cartSubject.next(this.cart);
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }
  // add free product to cartItem
  addFreeProduct(cartItemIndex: number, freeItem: any): void {
    if (cartItemIndex > -1) {
      this.cart.cartItems[cartItemIndex].freeProduct = freeItem;
      this.cartSubject.next(this.cart);
      localStorage.setItem('cart', JSON.stringify(this.cart));
      this.postCart();
    }
  }
  getAttributeDetail(product: any, variantId: number): string {
    return product?.assignment
      ? product?.assignment
      : product.variants
          .find((x) => x.id === variantId)
          .attribute_detail.map((x) => x.attribute_value)
          .join(' - ');
  }

  // Remove single product from the cart
  removeProductFromCart(cartItemIndex: number, isStateInvoke = true): void {
    // this.cart.cartItems.map((item, index) => {
    // if (item.product_id === productId) {
    this.cart.cartItems.splice(cartItemIndex, 1);
    this.updateCartPrices();
    localStorage.setItem('cart', JSON.stringify(this.cart));
    // }
    // });
    if (this.cart.cartItems.length === 0) {
      this.initializeCart();
      localStorage.setItem('cart', null);
    }

    // Update Observable value
    if (isStateInvoke) {
      this.cartSubject.next(this.cart);
    }
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.postCart();
  }

  // Remove all the items added to the cart
  emptyCart(): void {
    this.initializeCart();
    // this.cart.cartItems.length = 0;
    // localStorage.setItem('cart', JSON.stringify(this.cart));
    // this.cartSubject.next(this.cart);
  }
  invokeSubscribers(): void {
    this.cartSubject.next(JSON.parse(localStorage.getItem('cart')));
  }

  // Calculate total price on item added to the cart
  getTotalPrice(): number {
    // let total = 0;

    // this.cart.cartItems.map(item => {
    //   if (item.is_promotion) {
    //     total += item.price_after_discount;
    //   } else {
    //     total += item.total_price;
    //   }
    // });
    return this.cart.cart_total_price;
  }
  getPriceAfterCounpon(): number {
    if (
      this.cart.coupon_discount_type === '1' ||
      this.cart.is_coupon === false
    ) {
      this.cart.coupon_total_discount_price = this.cart.coupon_discount_price;
      return this.cart.cart_price_after_tax - this.cart.coupon_discount_price;
    } else if (
      this.cart.coupon_discount_type === '2' &&
      this.cart.is_coupon === true
    ) {
      this.cart.coupon_total_discount_price = this.productService.transFormToNumber(
        (this.cart.coupon_discount_price / 100) * this.cart.cart_price_after_tax
      );
      return (
        this.cart.cart_price_after_tax - this.cart.coupon_total_discount_price
      );
    }
  }
  getCartFromLocalStorage(): Cart {
    if (localStorage.getItem('cart')) {
      return JSON.parse(localStorage.getItem('cart'));
    } else {
      this.initializeCart();
      return JSON.parse(localStorage.getItem('cart'));
    }
  }

  getProductPrice(product: any, variantId: number, qty: number): any {
    const productPrice = {
      realPrice: 0,
      afterDiscountPrice: 0,
      realTotalPrice: 0,
      discountedTotalPrice: 0,
      discount: 0,
    };
    if (product === null) {
      return;
    }
    productPrice.realPrice = product.variants.find(
      (x) => x.id === variantId
    ).sell_price;
    productPrice.realTotalPrice = productPrice.realPrice * qty;
    if (product.promotion && product.deal_of_the_day === null) {
      if (product.promotion.promotion_type === this.DISCOUNT_OFFER) {
        productPrice.afterDiscountPrice = this.productService.getDiscountedPrice(
          { ...product },
          productPrice.realPrice
        );
        productPrice.discountedTotalPrice =
          productPrice.afterDiscountPrice * qty;
        productPrice.discount = product.promotion.discount_price;
      } else {
        if (
          product.promotion.promotion_type === this.BULK_OFFER &&
          product.promotion.quantity <= qty
        ) {
          // miss cal if we are not rounding off legal
          // productPrice.afterDiscountPrice = this.productService.transFormToNumber(
          productPrice.afterDiscountPrice =
            this.productService.getDiscountedPrice(
              { ...product },
              productPrice.realPrice,
              qty
            ) / qty;
          // );
          productPrice.discountedTotalPrice =
            productPrice.afterDiscountPrice * qty;
          productPrice.discount = product.promotion.discount_price;
        }
      }
    }

    if (product.deal_of_the_day) {
      productPrice.afterDiscountPrice = this.productService.getDiscountedPrice(
        { ...product },
        productPrice.realPrice
      );
      productPrice.discountedTotalPrice = productPrice.afterDiscountPrice * qty;
      productPrice.discount = product.deal_of_the_day.discount_price;
    }

    if (!product.promotion && !product.deal_of_the_day) {
      productPrice.afterDiscountPrice = productPrice.realPrice;
      productPrice.discountedTotalPrice = productPrice.realTotalPrice;
    }
    return productPrice;
  }

  saveAddress(addressType = 'billing', address: any): void {
    this.cart = this.getCartFromLocalStorage();
    if (addressType === 'billing') {
      this.cart.billing_address = address;
    } else {
      this.cart.shipping_address = address;
    }
    this.cartSubject.next(this.cart);
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }
  // get Cart same Product but diff in promotions Quantity
  getCartProductQuantity(items: CartItem[]): number {
    return items.map((i) => i.quantity).reduce((a, b) => a + b, 0);
  }
  getCartSameProducts(cartItems: CartItem[], id, variantId = 0): CartItem[] {
    return cartItems.filter(
      (x) => x.product_id === id && x.variant_id === variantId
    );
  }

  isExceededMaxyQty(
    cartItems: CartItem[],
    id: number,
    maxQty: number,
    variantId = 0
  ): boolean {
    // return this.getCartSameProducts(cartItems, id);
    const isExceededMaxyQty =
      this.getCartSameProducts(cartItems, id, variantId)
        .map((x) => x.quantity)
        .reduce((a, b) => a + b, 0) < maxQty
        ? true
        : false;
    return isExceededMaxyQty;
  }

  getOldAndNextProductQty(
    cartItems: CartItem[],
    id,
    newQty = 0,
    promoQty = 0,
    cartItemIndex = -1,
    variantId = -1
  ): any {
    const items = this.getCartSameProducts(cartItems, id, variantId);
    const qty = {
      pairedProductQty: items[0].quantity,
      unPairedProductQty: 0,
      isUnPairedProductExist: false,
      totalNewQty: 0,
      realNumber: 0,
      reminderNumber: 0,
      newPairedQty: 0,
      newReminderQty: 0,
      isNewReminderQty: false,
      updateablePairedQty: 0,
      updateableUnPairedQty: 0,
      isPairedItemIndex: false,
    };
    if (items.length === 2) {
      qty.unPairedProductQty = items[1].quantity;
      qty.isUnPairedProductExist = true;
    }
    if (cartItemIndex > -1) {
      qty.isPairedItemIndex =
        items[0].quantity ===
        this.getCartFromLocalStorage().cartItems[cartItemIndex].quantity
          ? true
          : false;
    }
    qty.totalNewQty = qty.pairedProductQty + qty.unPairedProductQty + newQty;

    qty.realNumber =
      promoQty > 0 ? parseInt((qty.totalNewQty / promoQty).toString(), 0) : 0;
    qty.reminderNumber = promoQty > 0 ? qty.totalNewQty % promoQty : 0;

    qty.newPairedQty = qty.realNumber * promoQty;
    qty.newReminderQty = qty.reminderNumber;

    qty.isNewReminderQty = qty.newReminderQty > 0 ? true : false;

    if (qty.newPairedQty) {
      qty.updateablePairedQty = qty.newPairedQty - items[0].quantity;
    }
    if (qty.isUnPairedProductExist) {
      qty.updateableUnPairedQty = qty.newReminderQty - items[1].quantity;
    }
    if (!qty.isUnPairedProductExist && qty.totalNewQty < promoQty) {
      qty.updateablePairedQty = 1;
    }

    return qty;
  }

  compareExclusiveItems(findFromArray: any[], row: any[]): number {
    const index = findFromArray?.findIndex((element) => {
      const check = [];
      row?.forEach((element1) => {
        const found = element?.findIndex((xx, kk) => {
          return (
            xx.id === element1.id &&
            xx.qty === element1.qty &&
            xx.attr_name === element1.attr_name &&
            xx.attr_value === element1.attr_value
          );
        });
        check.push(found !== -1 ? true : false);
      });
      if (!check.includes(false)) {
        return element;
      }
    });
    return index;
  }
  cartItemsHaveExclusiveOfferItems(cart): void {
    let items = cart.cartItems.filter((x) => x.exclusive_offer);
    if (items?.length > 0) {
      items = items.sort((a, b) => a.quantity - b.quantity).reverse();

      const exclusive = items[0].exclusive_offer;
      const exclusiveItemsArray = [];
      exclusive.attribute.values.forEach((el) => {
        items.forEach((i) => {
          i.selected_variant.attribute_detail.forEach((attr) => {
            if (
              attr.attribute_name === exclusive.attribute.coloumn_name &&
              attr.attribute_value === el.value
            ) {
              exclusiveItemsArray.push(i);
            }
          });
        });
      });
      const count = exclusiveItemsArray
        .map((exItem) => exItem.quantity)
        .reduce((a, b) => a + b, 0);
      if (count >= exclusive.quantity) {
        const reminder = count % exclusive.quantity;
        const itemQty = parseInt(`${count / exclusive.quantity}`, 0);
        if (reminder === 0) {
          const length = items.length;
          for (let i = 0; i < length; i++) {
            if (items[i].quantity > exclusive.quantity) {
              items[i].quantity = exclusive.quantity;
            }
          }
          this.addItemsInMixMatchOffer(items, exclusive, cart, itemQty);
        } else if (reminder > 0) {
          if (items.length === 1) {
            items[0].quantity = exclusive.quantity;
            const cartItem = items[items.length - 1];
            const cartItemIndex = this.findcartItemIndexFromMixmatchItem(
              cartItem
            );
            for (let i = 1; i <= exclusive.quantity * itemQty; i++) {
              this.updateProductQuantity(
                cartItem.variant_id,
                cartItemIndex,
                1,
                false,
                true
              );
            }
            this.addItemsInMixMatchOffer(
              items,
              exclusive,
              cart,
              itemQty,
              reminder
            );
          } else {
            items[items.length - 1].quantity -= reminder;
            const filteredItems = items.filter((x) => x.quantity > 0);
            if (filteredItems.length === 1) {
              filteredItems[0].quantity = exclusive.quantity;
            }
            this.addItemsInMixMatchOffer(
              filteredItems,
              exclusive,
              cart,
              itemQty,
              reminder
            );
            const cartItem = items[items.length - 1];
            const cartItemIndex = this.findcartItemIndexFromMixmatchItem(
              cartItem
            );
            // update new added qty
            for (let i = 1; i <= items[items.length - 1].quantity; i++) {
              this.updateProductQuantity(
                cartItem.variant_id,
                cartItemIndex,
                1,
                false,
                true
              );
            }
            // remove items that are added to the offer items
            items.forEach((item: any, index: number) => {
              if (index !== items.length - 1) {
                const foundIndex = this.cart.cartItems.findIndex(
                  (x) =>
                    x.product_id === items[index].product_id &&
                    x.variant_id === items[index].variant_id
                );

                this.removeProductFromCart(foundIndex, false);
              }
            });
          }
        }
        // if (exclusive.quantity === count) {
        //   this.addItemsInExclusiveOffer(items, exclusive);
        // }
      }
    }
  }
  cartItemsHaveMixAddMatchOfferItems(cart): void {
    let items = cart.cartItems.filter((x) => x.mix_match_offer);

    if (items?.length > 0) {
      items = items.sort((a, b) => a.quantity - b.quantity).reverse();
      // }
      const count = items.map((i) => i.quantity).reduce((a, b) => a + b, 0);
      const mixMatchOffer = items[0].mix_match_offer;
      if (count >= mixMatchOffer.quantity) {
        const reminder = count % mixMatchOffer.quantity;
        const itemQty = parseInt(`${count / mixMatchOffer.quantity}`, 0);
        if (reminder === 0) {
          const length = items.length;
          for (let i = 0; i < length; i++) {
            if (items[i].quantity > mixMatchOffer.quantity) {
              items[i].quantity = mixMatchOffer.quantity;
            }
          }
          this.addItemsInMixMatchOffer(items, mixMatchOffer, cart, itemQty);
        } else if (reminder > 0) {
          // let totalQty = 0;
          // let addAbleQty = 0;
          // const removedItems = [];
          // let reduceQtyIndex = -1;
          // // var reduceQty = 0;
          // const length = items.length;
          // for (let i = 0; i < length; i++) {
          // if (items[i].quantity > mixMatchOffer.quantity) {
          //   items[i].quantity = mixMatchOffer.quantity;
          // }

          // for (let i = 0; i < length; i++) {
          //   if (items[i].quantity === mixMatchOffer.quantity) {
          //     // count = items[i].quantity;
          //     // removedItemsIndexes.push[i];
          //     items = items[i];
          //     console.log('Breaked');
          //     break;
          //   } else {
          //     console.log('totalQty + items[i.quantity', totalQty, ' + ', items[i].quantity, ' = ', items[i].quantity)
          //     if (totalQty + items[i].quantity >= mixMatchOffer.quantity) {
          //       addAbleQty = (items[i].quantity) - mixMatchOffer.quantity;
          //       items[i].quantity += addAbleQty;
          //       if (addAbleQty < 0) {
          //         reduceQtyIndex = i;
          //       }
          //       console.log('addAbleQty==', addAbleQty);
          //       console.log('reduceQtyIndex==', reduceQtyIndex, 'minus qty', +addAbleQty);
          //       break;
          //     } else {
          //       totalQty += items[i].quantity;
          //       removedItems.push(items[i]);
          //     }
          //     // }
          //   }
          // }
          if (items.length === 1) {
            items[0].quantity = mixMatchOffer.quantity;
            const cartItem = items[items.length - 1];
            const cartItemIndex = this.findcartItemIndexFromMixmatchItem(
              cartItem
            );
            for (let i = 1; i <= mixMatchOffer.quantity * itemQty; i++) {
              this.updateProductQuantity(
                cartItem.variant_id,
                cartItemIndex,
                1,
                false,
                true
              );
            }
            this.addItemsInMixMatchOffer(
              items,
              mixMatchOffer,
              cart,
              itemQty,
              reminder
            );
          } else {
            items[items.length - 1].quantity -= reminder;
            const filteredItems = items.filter((x) => x.quantity > 0);
            if (filteredItems.length === 1) {
              filteredItems[0].quantity = mixMatchOffer.quantity;
            }
            this.addItemsInMixMatchOffer(
              filteredItems,
              mixMatchOffer,
              cart,
              itemQty,
              reminder
            );
            const cartItem = items[items.length - 1];
            const cartItemIndex = this.findcartItemIndexFromMixmatchItem(
              cartItem
            );
            // update new added qty
            for (let i = 1; i <= items[items.length - 1].quantity; i++) {
              this.updateProductQuantity(
                cartItem.variant_id,
                cartItemIndex,
                1,
                false,
                true
              );
            }
            // remove items that are added to the offer items
            items.forEach((item: any, index: number) => {
              if (index !== items.length - 1) {
                const foundIndex = this.cart.cartItems.findIndex(
                  (x) =>
                    x.product_id === items[index].product_id &&
                    x.variant_id === items[index].variant_id
                );

                this.removeProductFromCart(foundIndex, false);
              }
            });
          }
        }
      }
    }
  }
  findcartItemIndexFromMixmatchItem(cartItem: any): number {
    return this.cart.cartItems.findIndex(
      (x) =>
        x.product_id === cartItem.product_id &&
        x.variant_id === cartItem.variant_id
    );
  }
  addItemsInMixMatchOffer(
    items: any,
    mixMatchOffer: any,
    cart: any,
    itemQty = 1,
    reminder = 0
  ): void {
    const addedProducts = [
      ...[...items].map((x) => ({
        below_name: x.product.properties_data.find(
          (p) => p.property_type === 'below_name'
        ),
        green_label: x.product.properties_data.find(
          (p) => p.property_type === 'green_label'
        ),
        id: x.product_id,
        name: x.product.name,
        promotion: x.mixMatchOffer,
        quantity: x.quantity,
        variant: x.selected_variant,
        attribute_value: '',
        attribute_name: '',
        freeProduct: x.freeProduct,
      })),
    ];
    const cartItem = {
      quantity: itemQty,
      price: mixMatchOffer.discount_price,
      isMixMatchOffer: true,
      promotion: mixMatchOffer,
      mixMatchItems: addedProducts,
      property_value: '',
      property_name: '',
    };

    const mappedCartItems = this.transFormCartItemsForMixMatchOffer(this.cart);
    const mappedAddedProducts = this.transFormForMixMatchOfferItems(
      addedProducts
    );
    const index = this.compareMixMatchOfferItems(
      mappedCartItems,
      mappedAddedProducts
    );
    if (index > -1) {
      this.exclusiveUpdateQty(index);
      this.cartItemsToBeRemoved(items, reminder);
      // }
    } else {
      this.addProductToCart(cartItem, null);
      // exclusive items to be removed
      this.cartItemsToBeRemoved(items, reminder);
    }
  }
  compareMixMatchOfferItems(
    mappedCartItems: any,
    mappedAddedProducts: any
  ): any {
    return mappedCartItems.findIndex((el) => {
      const check = [];
      mappedAddedProducts.forEach((el1) => {
        const found = el?.findIndex((x) => {
          return (
            x.prodId === el1.prodId && x.vId === el1.vId && x.qty === el1.qty
          );
        });
        check.push(found !== -1 ? true : false);
      });
      if (!check.includes(false)) {
        return el;
      }
    });
  }
  transFormForMixMatchOfferItems(addedProducts: any): any {
    return addedProducts.map((m) => ({
      prodId: m.id,
      vId: m?.variant?.id,
      qty: m.quantity,
    }));
  }

  addItemsInExclusiveOffer(items: any, exclusive: any): any {
    const addedProducts = items.map((x) => ({
      below_name: x.product.properties_data.find(
        (p) => p.property_type === 'below_name'
      ),
      green_label: x.product.properties_data.find(
        (p) => p.property_type === 'green_label'
      ),
      id: x.product_id,
      name: x.product.name,
      promotion: x.promotion,
      quantity: x.quantity,
      variant: x.selected_variant,
      attribute_value: x.selected_variant.attribute_detail.find(
        (x) => x.attribute_name === exclusive.attribute.name
      ).attribute_value,
      attribute_name: exclusive.attribute.coloumn_name,
    }));
    const cartItem = {
      quantity: 1,
      price: exclusive.discount_price,
      isExclusive: true,
      promotion: items[0].product.promotion,
      exclusiveItems: addedProducts,
      property_value: items[0].selected_variant.attribute_detail.find(
        (x) => x.attribute_name === exclusive.attribute.name
      ).attribute_value,
      property_name: exclusive.attribute.coloumn_name,
    };
    // return cartItem;
    const mappedCartItems = this.transFormCartItems(this.cart);
    // // if (mappedCartItems.length > 0) {
    const mappedAddedProducts = this.transformExclusiveItems(
      addedProducts,
      cartItem.property_name,
      cartItem.property_value
    );
    const index = this.compareExclusiveItems(
      mappedCartItems,
      mappedAddedProducts
    );
    if (index > -1) {
      this.exclusiveUpdateQty(index);
      this.cartItemsToBeRemoved(items);
      // }
    } else {
      this.addProductToCart(cartItem, null);
      // exclusive items to be removed
      this.cartItemsToBeRemoved(items);
    }
  }
  // transform the cart items for compare with Exclusive Items
  transFormCartItems(cart: any): any {
    return cart.cartItems.map((x) =>
      x.exclusiveItems?.map((i) => ({
        id: i.id,
        qty: i.quantity,
        attr_name: x.property_name,
        attr_value: x.property_value,
      }))
    );
  }
  transFormCartItemsForMixMatchOffer(cart: Cart): any {
    return cart.cartItems.map((i) =>
      i.mixMatchItems?.map((m) => ({
        prodId: m.id,
        vId: m?.variant?.id,
        qty: m.quantity,
      }))
    );
  }
  // transform the Exclusive added items for compare with Exclusive Items
  transformExclusiveItems(
    exclusiveaddedProducts: any,
    attributeName = 'Strength',
    attributeValue = '0 mg'
  ): any {
    return exclusiveaddedProducts.map((x) => ({
      id: x.id,
      qty: x.quantity,
      attr_name: x.variant.attribute_detail
        .filter((f) => f.attribute_name === attributeName)
        .map((attr) => attr.attribute_name)[0],
      attr_value: x.variant.attribute_detail
        .filter((f) => f.attribute_value === attributeValue)
        .map((attr) => attr.attribute_value)[0],
    }));
    // return exclusiveaddedProducts.map(x => ({ id: x.id, qty: x.quantity }));
  }
  // exclusive items to be removed
  private cartItemsToBeRemoved(items: any, reminder = 0): void {
    items.forEach((element) => {
      const cartItemsIndex = this.cart.cartItems.findIndex(
        (x) =>
          x.product_id === element.product_id &&
          x.selected_variant.id === element.selected_variant.id
      );
      // uncomment when work is completed.
      if (reminder === 0) {
        this.removeProductFromCart(cartItemsIndex);
      }
    });
  }

  removeProductThatHaveZeroQty(): void {
    // const cart = this.getCartFromLocalStorage();

    this.cart.cartItems = this.cart.cartItems.filter((x) => x.quantity !== 0);
    // return cart;
  }
  getEarnablePoints(points: number, rate: number, newCart: any): number {
    if (!points || !rate) {
      return 0;
    }
    return (points / rate) * newCart.is_reward
      ? newCart.cart_total_price -
          newCart.reward_amount +
          (newCart?.cart_total_price >
          newCart.selected_delivery_method?.free_minimum_order
            ? 0
            : newCart.selected_delivery_method?.rate
            ? newCart.selected_delivery_method.rate
            : 0)
      : newCart.cart_total_price +
          (newCart?.cart_total_price >
          newCart.selected_delivery_method?.free_minimum_order
            ? 0
            : newCart.selected_delivery_method?.rate
            ? newCart.selected_delivery_method.rate
            : 0);
  }
  getEarnablePointsForProduct(
    points: number,
    rate: number,
    newCart: any
  ): number {
    if (!points || !rate) {
      return 0;
    }
    return (points / rate) * newCart;
  }
}
