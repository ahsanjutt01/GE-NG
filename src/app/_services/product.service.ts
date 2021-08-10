import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Brand } from '../_models/brand';
import { Cart } from '../_models/cartModel';
import { OrderSuccess } from '../_models/orderSuccess';

import { RestService } from './rest.service';

import * as moment from 'moment';
import 'moment-timezone';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productPageData = undefined;
  readonly DISCOUNT_OFFER = 'discount-offer';
  readonly BULK_OFFER = 'bulk-offer';
  readonly PERCENTAGE = 'percentage';
  readonly PRICE = 'price';
  readonly FREE_PRODUCT = 'free-product';
  private _props$ = new BehaviorSubject<any>(null);
  private _brands$ = new BehaviorSubject<Brand[]>([]);
  // navSearchQueryParams =
  openCard = new Subject<{ isOpen: boolean; product: any }>();
  isWishlistShowPage = new Subject<{
    isWishlistShowPage: boolean;
    prodId: number;
  }>();
  constructor(private restHttp: RestService) {}
  get props$(): Observable<any> {
    return this._props$.asObservable();
  }
  get brands$(): Observable<any> {
    return this._brands$.asObservable();
  }
  public getProductDetail(sku: string): Observable<any> {
    return this.restHttp.getRequest(`/api/product/${sku}`);
  }
  public getExclusiveOffer(id: number): Observable<any> {
    return this.restHttp
      .getRequest(`/api/bulk-exclusive/${id}`)
      .pipe(map((x) => x.data));
  }
  public getProductProps(category: string): Observable<any> {
    return this.restHttp.getRequest(`/api/categoryList/${category}`);
  }

  // get api/brands
  public getBrands(): void {
    this.restHttp
      .getRequest(`/api/brands`)
      .pipe(map((x) => x.data))
      .subscribe((brands: any) => {
        this._brands$.next(brands);
      });
  }
  // /api/GetValuesByProp/2
  // get api/brands
  public getAllProps(): void {
    this.restHttp
      .getRequest(`/api/GetValuesByProp/2`)
      .pipe(map((x) => x.data))
      .subscribe((x) => {
        this._props$.next(x);
      });
  }
  public getCrossByProducts(sku: string): Observable<any> {
    return this.restHttp.getRequest(`/api/getCrossByProduct/${sku}`);
  }
  // get api/collections
  public getCollections(): Observable<any> {
    return this.restHttp
      .getRequest(`/api/collections`)
      .pipe(map((x) => x.data));
  }

  public loadMoreProducts(url): Observable<any> {
    return this.restHttp.getRequestFromUrl(url);
  }
  public getProductListing(
    category: string,
    price = '1-1000',
    ppId = '',
    subCatId = 0,
    brands = [],
    offers = [],
    pageNumber = 1,
    limit = 20
  ): Observable<any> {
    const propId = ppId !== '' ? `ppId=${ppId}&` : '';
    const subCategoryId = subCatId > 0 ? `sub_cat=${subCatId}&` : '';
    const BRANDS =
      brands.length === 0 ? '' : `brand=${brands.map((x) => x.id).toString()}&`;
    const OFFERS =
      offers.length === 0
        ? ''
        : `promoId=${offers.map((x) => x.id).toString()}&`;
    return this.restHttp.getRequest(
      `/api/categoryProducts/${category}?page=${pageNumber}&limit=${limit}&${BRANDS}${OFFERS}${subCategoryId}${propId}price=${price}`
    );
  }

  public getProduts(
    // fromCache = false,
    module = 'category',
    id: string = '0',
    price = '1-1000',
    ppId = '',
    subCatId = 0,
    brands = [],
    offers = [],
    pageNumber = 1,
    limit = 20,
    queryParams = {
      isSearch: false,
      queryParam: '',
    }
  ): Observable<any> {
    // if (!fromCache) {

    const scondParam = queryParams.isSearch
      ? `?q=${queryParams.queryParam}&`
      : `/${id}?`;
    const propId = ppId !== '' ? `ppId=${ppId}&` : '';
    const subCategoryId = subCatId > 0 ? `sub_cat=${subCatId}&` : '';
    const BRANDS =
      brands.length === 0 ? '' : `brand=${brands.map((x) => x.id).toString()}&`;
    const OFFERS =
      offers.length === 0
        ? ''
        : `promoId=${offers.map((x) => x.id).toString()}&`;
    return this.restHttp.getRequest(
      `/api/l/${module}${scondParam}page=${pageNumber}&limit=${limit}&${BRANDS}${OFFERS}${subCategoryId}${propId}price=${price}`
    );
    // } else {
    // return of(this.productPageData);
    // }
  }

  // API post card
  postCartToDb(cart: Cart, isAdmin = false): Observable<Cart> {
    const model = this.translateObject(cart, isAdmin);
    const user = localStorage.getItem('userInfo');
    if (user) {
      const userInformation = JSON.parse(user);
      if (userInformation.addresses.length === 0) {
        model.billing_address.type = 'billing';
        if (model.shipping_address === null) {
          model.shipping_address = { ...model.billing_address };
        }
        model.shipping_address.type = 'shipping';
        userInformation.addresses.push(model.shipping_address);
        userInformation.addresses.push(model.billing_address);
        localStorage.setItem('userInfo', JSON.stringify(userInformation));
      }
    }
    return this.restHttp.postRequest(`/api/cart/store`, model);
  }
  // API post card
  postCartToDbOrderSuccess(orderSuccess: OrderSuccess): Observable<Cart> {
    return this.restHttp.postRequest(`/api/payment-success`, orderSuccess);
  }
  translateObject(cart: Cart, isAdmin: boolean): any {
    const cartItemsMapped = cart.cartItems.map((item) => {
      return {
        order_id: item.order_id,
        product_id: item.product_id,
        sku: item.sku,
        variant_id: item.variant_id,
        quantity: item.quantity,
        name: item.name,
        property_name: item.property_name,
        property_value: item.property_value,
        attribute_detail: item.attributes_detail,
        thumbnail: item.thumbnail,
        price: item.price,
        unit_price: item.unit_price,
        freeProduct: item.freeProduct,
        discount: item.discount,
        price_after_discount: item.price_after_discount,
        total_price: item.price_after_discount,
        is_deal_of_the_day: item.is_deal_of_the_day,
        deal_of_the_day: item.deal_of_the_day,
        is_promotion: item.is_promotion,
        promotion_type: item.promotion_type,
        promotion_title: item.promotion_title,
        afterDiscountPrice: item.afterDiscountPrice,
        exclusive_offer: item.exclusive_offer,
        exclusiveItems: item.exclusiveItems,
        mix_match_offer: item.mix_match_offer,
        mixMatchItems: item.mixMatchItems,
        promotions: item.cart_item_promotion,
        isFreeProductsPermotion: item?.isFreeProductsPermotion,
        freeProducts: item?.freeProducts,
      };
    });
    cartItemsMapped.forEach((el, index) => {
      if (el.mix_match_offer && el.quantity < el.mix_match_offer.quantity) {
        cartItemsMapped[index].is_promotion = false;
      }
    });
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (cart.billing_address) {
      cart.billing_address.company = 'compny Coulmn to be removed';
    }
    // cart.shipping_address === undefined ? null : cart.shipping_address
    const model = {
      order_id: cart.order_id,
      customer_id: isAdmin ? cart.customer_id : userInfo ? userInfo.id : null,
      role: isAdmin ? 'admin' : null,
      user_agent_detail: cart.user_agent_detail,
      cart_price: cart.cart_price,
      cart_discount: cart.cart_discount,
      cart_price_after_discount: cart.cart_price_after_discount,
      is_taxes: cart.is_taxes,
      tax_name: cart.tax_name,
      tax_price: cart.tax_price,
      cart_price_after_tax: cart.cart_price_after_tax,
      is_coupon: cart.is_coupon,
      coupon_id: cart.coupon_id,
      coupon_code: cart.coupon_code,
      coupon_total_discount_price: cart.coupon_total_discount_price,
      coupon_discount_type: cart.coupon_discount_type,
      coupon_discount_price: cart.coupon_discount_price,
      cart_price_after_coupon: cart.cart_price_after_coupon,
      cart_total_price: cart.cart_total_price,
      shipping_method: cart.delivery_method,
      billing_address: cart.billing_address,
      order_notes: cart.billing_address.order_note
        ? cart.billing_address.order_note
        : null,
      shipping_address:
        cart.shipping_address === undefined ? null : cart.shipping_address,
      is_reward: cart.is_reward,
      reward_points: cart.reward_points,
      reward_amount: cart.reward_amount,
      cartItems: cartItemsMapped,
      payload: isAdmin ? JSON.parse(localStorage.getItem('cart')) : null,
    };
    return model;
  }
  isBulkPermotion(product): boolean {
    let isBulk = false;
    if (product?.promotion) {
      if (product?.promotion.promotion_type === this.BULK_OFFER) {
        isBulk = true;
      }
    }
    return isBulk;
  }
  // calculate discount price
  getDiscountedPrice(
    product: any,
    variantProdPrice: number,
    selectedQuantity = 1
  ): number {
    if (product.deal_of_the_day !== null) {
      let price = 0;
      if (
        product.deal_of_the_day &&
        product.deal_of_the_day.discount_type === this.PRICE
      ) {
        price = variantProdPrice - product.deal_of_the_day.discount_price;
        return this.transFormToNumber(price * selectedQuantity);
      } else {
        price =
          variantProdPrice - product.deal_of_the_day
            ? (product.deal_of_the_day.discount_price / 100) * variantProdPrice
            : 1;
        return this.transFormToNumber(price * selectedQuantity);
      }
    }
    if (!product.promotion || product.deal_of_the_day !== null) {
      return this.transFormToNumber(variantProdPrice * selectedQuantity);
      // aaa
      // return 0;
    } else {
      switch (product?.promotion.promotion_type) {
        case this.DISCOUNT_OFFER: {
          let price = 0;
          switch (product?.promotion.discount_type) {
            case this.PERCENTAGE: {
              price = this.transFormToNumber(
                variantProdPrice -
                  (product?.promotion.discount_price / 100) * variantProdPrice
              );
              return this.transFormToNumber(price * selectedQuantity);
            }
            case this.PRICE: {
              price = variantProdPrice - product?.promotion.discount_price;
              return this.transFormToNumber(price * selectedQuantity);
            }
            default:
              return this.transFormToNumber(
                variantProdPrice * selectedQuantity
              );
          }
        }
        case this.FREE_PRODUCT: {
          return this.transFormToNumber(variantProdPrice) * selectedQuantity;
        }
        case this.BULK_OFFER: {
          if (selectedQuantity >= product?.promotion.quantity) {
            const realNumber = parseInt(
              (selectedQuantity / product?.promotion.quantity).toString(),
              10
            );
            const modulusNumber =
              selectedQuantity % product?.promotion.quantity;
            let promoQtyPrice = 0;
            let modulusPrice = 0;
            if (realNumber > 0) {
              promoQtyPrice = realNumber * product?.promotion.discount_price;
            }
            if (modulusNumber > 0) {
              modulusPrice = modulusNumber * variantProdPrice;
            }
            return this.transFormToNumber(promoQtyPrice + modulusPrice);
          } else {
            return this.transFormToNumber(variantProdPrice * selectedQuantity);
          }
        }
        default:
          return this.transFormToNumber(variantProdPrice);
      }
    }
  }

  setCachedProducts(data: any): void {
    this.productPageData = data;
  }
  getCachedProducts(): void {
    return this.productPageData;
  }

  // api/customer/wishlist-store
  public postWhislistItem(productId: number): Observable<any> {
    const customerId: number = JSON.parse(localStorage.getItem('userInfo')).id;
    return this.restHttp.postRequest(
      '/api/customer/wishlist-store',
      { customer_id: customerId, product_id: productId },
      true
    );
  }
  // api/customer/wishlist-store
  public getWhislistItems(customerId: number): Observable<any> {
    return this.restHttp
      .getRequest(`/api/customer/wishlist-get/${customerId}`, true)
      .pipe(map((x) => x.data));
  }
  // getFreePromotionProducts
  public getFreePromotionProducts(productIds: string): Observable<any> {
    return this.restHttp
      .getRequest(`/api/freePromotionProducts?productIds=${productIds}`, false)
      .pipe(map((x) => x.data));
  }

  // /api/coupon/wwwwwwww12@/70
  public getCoupon(couponCode: string, customerId: number): Observable<any> {
    return this.restHttp
      .getRequest(`/api/coupon/${couponCode}/${customerId}`)
      .pipe(map((x) => x.data));
  }

  transFormToNumber(val: number): number {
    if (val > 0) {
      return parseFloat(
        parseFloat(val.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
      );
    } else {
      return 0;
    }
  }
  notifyMe(model: any): Observable<any> {
    return this.restHttp
      .postRequest('/api/product-notify', model, false)
      .pipe(map((x) => x.data));
  }

  cutOffTime(){
    var currentTime = moment().tz('Europe/london');

    var closingTime = moment().toDate();
    closingTime.setHours(15);
    closingTime.setMinutes(0);
    closingTime.setSeconds(0);

    var a = moment(currentTime).unix();
    var u = moment(closingTime).unix();

    var unix_timestamp  = u - a;
        var date = new Date(unix_timestamp * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes =  date.getMinutes();
    // Seconds part from the timestamp
    var seconds =  date.getSeconds();

    var t = hours + " hours ," + minutes + " minutes ," + seconds +' seconds' ;

    var cutOffArra = {h:hours, m:minutes, s:seconds};
    return cutOffArra;
  }
}
