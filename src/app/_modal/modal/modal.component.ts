import {
  Component,
  ViewEncapsulation,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Cart, CartItem } from 'src/app/_models/cartModel';
import { AuthService } from 'src/app/_services/auth.service';
import { CartService } from 'src/app/_services/cart/cart.service';
import { ProductService } from 'src/app/_services/product.service';
import { environment } from 'src/environments/environment';
import { closeProdModal } from '../../../assets/js/customJquery';
@Component({
  selector: 'app-cart-modal',
  templateUrl: 'modal.component.html',
  styleUrls: ['modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  currency = '$';
  addFreePromotionProductssumQty = 0;
  freePromotionProducts = [];
  addedFreePromotionProducts = [];
  isFreePromotionProdAdding = false;
  showFreeProductPromotion = false;
  isLoggedIn = false;
  crossProducts = [];
  emailForm: FormGroup;
  selectedAttributeIndex = 0;
  getCartSubscription: Subscription;
  product = null;
  isNicShotAdding = false;
  dataSet = [];
  maxQty = 0;
  isQuantityExists = true;
  API_URL = environment.API_URL;
  submitted = false;
  selectedVariant = null;
  selectedFreeProduct = null;
  isShowFreeProductErorMessage = false;
  cart: any;
  availableEmail = '';
  isProductAdded = false;
  productmodal = {
    isOpen: false,
    product: null,
  };
  arrangedVariants = [];
  cartProduct = {
    quantity: 1,
    cartAddedQty: 0,
    totalPrice: 0,
    freeProdTotalPrice: 0,
    product: null,
  };
  productDetailCopy = { product: null };
  subscription: Subscription;
  currencySubscription: Subscription;
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastr: ToastrService,
    private store: Store<{ navbar: { settings: any } }>,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.isProductAdded = false;
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLogin();
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.currencySubscription = this.store
      .select('navbar')
      .pipe(map((x: any) => x.navbar))
      .subscribe((setting: any) => {
        this.currency = setting.currency;
      });
    this.productService.openCard.subscribe((data) => {
      this.crossProducts = [];
      this.showFreeProductPromotion = false;
      this.isFreePromotionProdAdding = false;
      this.freePromotionProducts = [];
      this.addedFreePromotionProducts = [];
      this.productmodal = { ...data };
      this.product = { ...data.product };
      this.product = { ...this.product };
      if (this.product) {
        // ===========GET crosssale products===============
        this.productService
          .getCrossByProducts(this.product.sku)
          .subscribe((crossProductsData) => {
            for (let i = 0; i < crossProductsData.data.length; i++) {
              for (
                let j = 0;
                j < crossProductsData.data[i].variants.length;
                j++
              ) {
                const prod = { ...crossProductsData.data[i] };
                prod.variants = [];
                prod.variants.push(crossProductsData.data[i].variants[j]);
                this.crossProducts.push(prod);
              }
            }
          });
      }
      // ===========================Get Free Product Promo=============================
      if (this.product?.promotion?.promotion_type === 'free-product') {
        this.productService
          .getFreePromotionProducts(this.product.promotion.linked_id)
          .subscribe((x) => {
            this.addedFreePromotionProducts = [];
            for (let i = 0; i < x.length; i++) {
              for (let j = 0; j < x[i].variants.length; j++) {
                const prod = { ...x[i] };
                prod.variants = [];
                prod.variants.push(x[i].variants[j]);
                prod.attrValues = x[i].variants[j].attribute_detail
                  .map((x) => x.attribute_value)
                  .toString()
                  .split(',')
                  .join(' - ');
                prod.quantity = 0;
                this.freePromotionProducts.push(prod);
              }
            }
          });
      }
      this.getVariants();
      this.set_dataset();
      this.cartProduct = {
        quantity: 1,
        cartAddedQty: 0,
        totalPrice: 0,
        freeProdTotalPrice: 0,
        product: null,
      };
      this.defaultSelectionProductAttributes();
    });
    this.cartSubscription();
    if (this.product?.free_product) {
      this.product.free_product = this.product?.free_product.map((x) => ({
        ...x,
        realQuantity: x.quantity,
      }));
    }
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.getCartSubscription) {
      this.getCartSubscription.unsubscribe();
    }
    this.currencySubscription.unsubscribe();
  }
  onParseInt(value: number): number {
    return parseInt(value.toString());
  }
  get f(): any {
    return this.emailForm.controls;
  }

  onFreeNicShotCheckedUnchecked(): void {
    if (this.isNicShotAdding) {
      this.selectedFreeProduct = null;
      this.removeFreeNicShoot();
    }
  }
  removeFreeNicShoot(): void {
    if (this.cartProduct.product) {
      this.cartService.removeFreeNicShoot(
        this.product.id,
        this.selectedVariant.id
      );
      return;
    }
  }
  set_dataset(): void {
    this.dataSet = [];
    const product = { ...this.product };
    product.variants.forEach((e) => {
      const variant = {
        id: e.id,
        barcode: e.barcode,
        price: e.sell_price,
        initial_quantity: e.initial_quantity === null ? 0 : e.initial_quantity,
        image: e.variant_image?.image,
      };
      e.attribute_detail.forEach((element, key) => {
        variant[`attr${key}`] = element.attribute_value;
      });
      this.dataSet.push(variant);
    });
  }
  // ======================Free product promotion===================

  onFreePromotionProductsCheckedUnchecked(): void {
    if (this.isFreePromotionProdAdding) {
      this.addedFreePromotionProducts.length = 0;
      this.addFreePromotionProductssumQty = 0;
      this.addFreeProdQtyDefault();
      // this.removeFreeNicShoot();
    }
  }
  addFreeProdQtyDefault(): void {
    this.freePromotionProducts.forEach((currentValue: any, index: number) => {
      this.freePromotionProducts[index].quantity = 0;
    });
  }
  // ======================END Free product promotion===================
  getBelowName(product: any): string {
    const belowName = product?.properties_data?.find(
      (x) => x.property_type === 'below_name'
    )?.property_name;
    if (belowName) {
      return belowName + ':';
    } else {
      return '';
    }
  }
  getFalvors(product: any): string {
    return product?.properties_data?.find(
      (x) => x.property_type === 'below_name'
    )?.property_value;
  }
  getGreenLabel(): void {
    return this.product.properties_data
      .filter((x) => x.property_type === 'green_label')
      .map((x) => x.property_value)
      .toString();
  }
  getVariants(): any {
    this.arrangedVariants = [];
    const variants: any[] = this.product.variants;
    if (variants) {
      const variantNames = [
        ...new Set(
          variants
            .map((x) => x.attribute_detail)
            .flat()
            .map((a) => a.attribute_name)
        ),
      ];
      let variantsInProduct = [
        ...new Set(variants.map((x) => x.attribute_detail).flat()),
      ];
      variantsInProduct = variantsInProduct.filter(
        (thing, index, self) =>
          index ===
          self.findIndex((t) => t.attribute_value === thing.attribute_value)
      );
      variantNames.forEach((key, value) => {
        this.arrangedVariants.push({
          attribute_name: key,
          attribute_detail: variantsInProduct
            .filter((x) => x.attribute_name === key)
            .map((z) => ({
              id: z.id,
              variant_id: z.variant_id,
              disabled: false,
              isChecked: false,
              attribute_value: z.attribute_value,
            })),
        });
      });
    }
    this.arrangedVariants.forEach((value, key) => {
      value.attribute_detail.forEach((val, index) => {
        this.arrangedVariants[key].attribute_detail[
          index
        ].image = this.product.variants.find(
          (x) => x.id === val.variant_id
        ).variant_image?.image;
      });
    });
    return this.arrangedVariants;
  }
  // ==============ON RADIO CLICKED===============
  onRadioClicked(
    attributeName: string,
    attributeValue: string,
    index: number,
    vIndex = 0
  ): void {
    this.selectedAttributeIndex = vIndex > -1 ? vIndex : 0;
    if (this.arrangedVariants.length > 0 && index > -1) {
      this.onRadioClick(attributeName, attributeValue, index);
    }
  }
  onRadioClick(
    attributeName: string,
    attributeValue: string,
    index: number
  ): void {
    const attributeDetailLength = this.arrangedVariants[index].attribute_detail
      .length;
    for (let i = 0; i < attributeDetailLength; i++) {
      this.arrangedVariants[index].attribute_detail[i].isChecked = false;
    }
    this.arrangedVariants[index].attribute_detail[
      this.arrangedVariants[index].attribute_detail.findIndex(
        (x) => x.attribute_value === attributeValue
      )
    ].isChecked = true;
    if (index === 0) {
      this.selectedVariant = null;
      if (this.arrangedVariants.length - 1 >= index + 2) {
        for (let i = index + 2; i <= this.arrangedVariants.length - 1; i++) {
          // tslint:disable-next-line: prefer-for-of
          for (
            let j = 0;
            j < this.arrangedVariants[i].attribute_detail.length;
            j++
          ) {
            // if (this.arrangedVariants[i].attribute_detail[j].attribute_value !== attributeValue) {
            // this.arrangedVariants[0].attribute_detail[i].isChecked = false;
            this.arrangedVariants[i].attribute_detail[j].disabled = true;
            // }
          }
        }
      }
    }
    if (this.arrangedVariants[0].attribute_name === attributeName) {
      const length = this.arrangedVariants[0].attribute_detail.length;
      for (let i = 0; i < length; i++) {
        if (
          this.arrangedVariants[0].attribute_detail[i].attribute_value !==
          attributeValue
        ) {
          this.arrangedVariants[0].attribute_detail[i].isChecked = false;
          // this.arrangedVariants[0].attribute_detail[i].disabled = true;
        }
      }
    }
    if (this.arrangedVariants[index + 1]) {
      const watchAttributeName = this.arrangedVariants[index + 1]
        .attribute_name;
      const newFilter = [];
      for (const variant of this.product.variants) {
        for (const item of variant.attribute_detail) {
          if (item.attribute_value === attributeValue) {
            newFilter.push(variant);
          }
        }
      }
      // ==============FIND NEXT AVAILABLE ATTRIBUTES===============
      const availableAttributeValues = [
        ...new Set(
          [...new Set(newFilter.map((x) => x.attribute_detail).flat())]
            .filter((n) => n.attribute_name === watchAttributeName)
            .map((x) => x.attribute_value)
        ),
      ];
      // availableAttributeValues = [...new Set(availableAttributeValues)];
      // ==============END FIND NEXT AVAILABLE ATTRIBUTES===============

      // change the next all attrubutes default unchecked when primary chnaged
      if (this.arrangedVariants[0].attribute_name === attributeName) {
        for (let i = 1; i < this.arrangedVariants.length; i++) {
          // tslint:disable-next-line: prefer-for-of
          for (
            let j = 0;
            j < this.arrangedVariants[i].attribute_detail.length;
            j++
          ) {
            this.arrangedVariants[i].attribute_detail[j].isChecked = false;
          }
        }
      }
      // =======================END DEFAULT=======================

      for (const attribute of this.arrangedVariants[index + 1]
        .attribute_detail) {
        loop2: for (const value of availableAttributeValues) {
          if (attribute.attribute_value !== value) {
            const attributeIndex = this.findIndexOfVariant(
              index,
              attribute,
              attribute.attribute_value
            );
            this.arrangedVariants[index + 1].attribute_detail[
              attributeIndex
            ].disabled = true;
            this.arrangedVariants[index + 1].attribute_detail[
              attributeIndex
            ].isChecked = false;
          } else {
            const attributeIndex = this.findIndexOfVariant(
              index,
              attribute,
              attribute.attribute_value
            );
            this.arrangedVariants[index + 1].attribute_detail[
              attributeIndex
            ].disabled = false;
            this.arrangedVariants[index + 1].attribute_detail[
              attributeIndex
            ].isChecked = false;
            break loop2;
            // this.arrangedVariants[index + 1].attribute_detail[attributeIndex].isChecked = true;
          }
        }
      }
    }
    // =======================Last Variant Cliced=======================
    this.lastAttrChecked(attributeName);
    // =======================END Last Variant Cliced=======================

  }
  findIndexOfVariant(index: number, attribute: any, value: string): number {
    return this.arrangedVariants[index + 1].attribute_detail.findIndex(
      (d) => d.attribute_value === value
    );
  }
  lastAttrChecked(attributeName: string): void {
    if (
      attributeName ===
      this.arrangedVariants[this.arrangedVariants.length - 1].attribute_name
    ) {
      const checkedVariants = this.getCheckeVariants([
        ...this.arrangedVariants,
      ]);
      // this.selectedVariant = this.product.variants.find(x => x.id === checkedVariants[0].variant_id);
      let count = 0;
      const DATA_SET_LENGTH = this.dataSet.length;
      loop: for (let i = 0; i < DATA_SET_LENGTH; i++) {
        const CHECKED_VARNT_LENGTH = checkedVariants.length;
        for (let j = 0; j < CHECKED_VARNT_LENGTH; j++) {
          if (
            this.dataSet[i][`attr${j}`] === checkedVariants[j].attribute_value
          ) {
            count++;
            if (checkedVariants.length === count) {
              this.selectedVariant = { ...this.dataSet[i] };
              break loop;
            }
          } else {
            count = 0;
          }
        }
      }
      this.cartProduct.totalPrice = this.productService.getDiscountedPrice(
        { ...this.product },
        this.selectedVariant.price,
        this.cartProduct.quantity
      );
    }
    if (this.selectedVariant) {
      this.isQuantityExists =
        this.product.variants.find((x) => x.id === this.selectedVariant.id)
          .initial_quantity > 0
          ? true
          : false;
      if (this.cartProduct.quantity > 0 && !this.isQuantityExists) {
        this.cartProduct.quantity = 0;
      }
      if (this.cartProduct.quantity === 0 && this.isQuantityExists) {
        this.cartProduct.quantity = 1;
      }
      // set email if logged in and qty = 0
      if (!this.isQuantityExists && this.authService.isLoggedIn) {
        this.emailForm.setValue({
          email: this.authService.getUserInfo()?.email || '',
        });
      }
      this.maxQty = this.isQuantityExists
        ? this.selectedVariant.initial_quantity--
        : 0;
      this.selectedVariant.maxQty = this.maxQty;
      this.cartUpdate(this.cartService.getCartFromLocalStorage());
    }
    this.isShowFreeProductErorMessage = false;
    if (this.selectedVariant) {
      this.cartProduct.totalPrice = this.getProductTotalPrice();
    }
  }
  cartSubscription(): void {
    if (!this.getCartSubscription) {
      this.getCartSubscription = this.cartService.getCart().subscribe((x) => {
        if (x != null) {
          this.cartUpdate(x);
        }
      });
    }
  }
  cartUpdate(x: Cart): void {
    if (!x) {
      this.isNicShotAdding = false;
      return;
    }
    this.cart = { ...x };
    if (this.cart.cartItems.length && this.selectedVariant) {
      const items = x.cartItems.filter(
        (i: CartItem) => i.variant_id === this.selectedVariant.id
      );
      if (items.length) {
        this.cartProduct.cartAddedQty = this.cartService.getCartProductQuantity(
          [...items]
        );
        // this.maxQty -= this.cartProduct.cartAddedQty + 1;
        this.isProductAdded = this.cartProduct.cartAddedQty > 0 ? true : false;
        this.selectedVariant.initial_quantity =
          this.product.variants.find((v) => v.id === this.selectedVariant.id)
            .initial_quantity - this.cartProduct.cartAddedQty;
        const prod = this.cart.cartItems.find(
          (item: CartItem) => item.variant_id === this.selectedVariant.id
        );
        this.cartProduct.product = prod.freeProduct;
        this.selectedFreeProduct = prod.freeProduct;
        this.isNicShotAdding = prod?.isFreeNicShot ? true : false;
      } else {
        this.isNicShotAdding = false;
        this.isProductAdded = false;
        this.cartProduct.product = null;
        this.selectedVariant.initial_quantity =
          this.selectedVariant.maxQty - this.cartProduct.quantity;
        this.selectedFreeProduct = null;
      }
    } else {
      this.isProductAdded = false;
      // this.selectedVariant.initial_quantity = this.selectedVariant?.maxQty - this.cartProduct.quantity;
      this.selectedFreeProduct = null;
    }
  }
  onSortingAttributeDetail(arr): any {
    arr.sort((a, b) =>
      a.attribute_value.localeCompare(b.attribute_value, 'en', {
        numeric: true,
      })
    );
    const index = arr.findIndex((x) => x.isChecked);
    if (index > -1) {
      arr[index].isChecked = false;
      arr[0].isChecked = true;
      // this.selectedAttributeIndex = 0;
    }
    return arr;
  }
  getCheckeVariants(variants: any): any {
    const checkedVariants = [];
    for (const variant of this.arrangedVariants) {
      for (const attr of variant.attribute_detail) {
        if (attr.isChecked) {
          checkedVariants.push(attr);
        }
      }
    }
    return checkedVariants;
  }
  defaultSelectionProductAttributes(): void {
    const defaultAttributeDetail = [
      ...this.dataSet.sort((a, b) => a.price - b.price),
    ][0];
    const ATTR_LENGTH = this.arrangedVariants.length;
    for (let i = 0; i < ATTR_LENGTH; i++) {
      const ARNG_VARNT_ATTR_DET_LENGTH = this.arrangedVariants[i]
        .attribute_detail.length;
      for (let j = 0; j < ARNG_VARNT_ATTR_DET_LENGTH; j++) {
        if (
          this.arrangedVariants[i].attribute_detail[j].attribute_value ===
          defaultAttributeDetail[`attr${i}`]
        ) {
          this.arrangedVariants[i].attribute_detail[j].isChecked = true;
          this.onRadioClick(
            this.arrangedVariants[i].attribute_name,
            this.arrangedVariants[i].attribute_detail[j].attribute_value,
            i
          );
        }
      }
    }
  }

  // on Add to Cart button
  onAddToCart(): void {
    if (!this.isQuantityExists) {
      this.submitted = true;
      if (this.emailForm.invalid) {
        this.toasterErrorMessage('Please enter your email.', 'Error');
        return;
      }
      // call api notify me by email
      this.productService
        .notifyMe({
          email: this.emailForm.value.email,
          product_id: this.product.id,
          variant_id: this.selectedVariant.id,
        })
        .subscribe(
          (x) => {
            this.toasterSuccessMessage('Notify you when available.', 'Success');
          },
          (error) => {
            this.toasterErrorMessage('You are already subscribed', 'Error');
          }
        );
      return;
    }
    // if (this.selectedVariant.initial_quantity === 0) {
    //     return;
    // }
    if (
      this.cartProduct.quantity >= this.product?.promotion?.quantity &&
      this.product.promotion?.promotion_type === 'free-product' &&
      !this.isFreePromotionProdAdding &&
      this.addFreePromotionProductssumQty !==
        this.product.promotion?.free_quantity
    ) {
      this.toasterErrorMessage('Select Free Product', 'Error');
      return;
    }
    if (
      this.selectedFreeProduct ||
      this.isProductAdded ||
      !this.product.free_product.length ||
      this.isNicShotAdding
    ) {
      this.isShowFreeProductErorMessage = false;
      // if product is not added to the cart then add new
      if (!this.isProductAdded) {
        this.addNewProductToCart();
        this.resetQty();
        this.cartService.cartItemsHaveExclusiveOfferItems(this.cart);
        this.cartService.cartItemsHaveMixAddMatchOfferItems(this.cart);
      } else {
        if (
          this.cartProduct.quantity >= this.product.promotion?.quantity &&
          this.product.promotion?.promotion_type === 'free-product' &&
          !this.isFreePromotionProdAdding &&
          this.addFreePromotionProductssumQty !==
            this.product.promotion?.free_quantity
        ) {
          this.toasterErrorMessage('Select Free Product', 'Error');
          return;
        }
        const cartItemIndex = this.getIndexOfCartItem(this.selectedVariant.id);
        if (cartItemIndex > -1) {
          if (this.cartProduct.product || this.isNicShotAdding) {
            this.updateQuantity(cartItemIndex);
          } else {
            if (this.product?.freeProduct) {
              this.isShowFreeProductErorMessage = true;
              this.toasterErrorMessage('Select Free Product', 'Error');
              return;
            } else {
              this.updateQuantity(cartItemIndex);
            }
          }
          this.toasterSuccessMessage('Quantity Updated', 'Success');
          this.resetQty();

          this.cartService.cartItemsHaveExclusiveOfferItems(this.cart);
          this.cartService.cartItemsHaveMixAddMatchOfferItems(this.cart);
        } else {
          this.addNewProductToCart();
          this.resetQty();
          this.cartService.cartItemsHaveExclusiveOfferItems(this.cart);
          this.cartService.cartItemsHaveMixAddMatchOfferItems(this.cart);
        }
      }
    } else {
      this.isShowFreeProductErorMessage = true;
      this.toasterErrorMessage('Select Free Product', 'Error');
    }
    // this.cartService.cartItemsHaveExclusiveOfferItems(this.cart);
    this.showFreeProductPromotion = false;
    this.addedFreePromotionProducts.length = 0;
    this.freePromotionProducts.forEach((value, index) => {
      this.freePromotionProducts[index].quantity = 0;
    });
    this.cartService.cartItemsHaveExclusiveOfferItems(this.cart);
    this.cartService.cartItemsHaveMixAddMatchOfferItems(this.cart);
  }
  getIndexOfCartItem(variantId: number): number {
    return this.cart.cartItems.findIndex(
      (x: CartItem) => x.variant_id === variantId
    );
  }
  // update quantity in cart item and update prices
  updateQuantity(cartItemIndex: number): void {
    if (
      this.cartProduct.quantity >= this.product.promotion?.quantity &&
      this.product.promotion?.promotion_type === 'free-product' &&
      !this.isFreePromotionProdAdding &&
      this.addFreePromotionProductssumQty !==
        this.product.promotion?.free_quantity
    ) {
      this.toasterErrorMessage('Select Free Product', 'Error');
      return;
    }
    // if (this.productService.isBulkPermotion(this.product)) {
    //     const qty = this.cartService.getOldAndNextProductQty(
    //         this.cart.cartItems,
    //         this.product.id,
    //         this.cartProduct.quantity,
    //         this.cart.cartItems[cartItemIndex].product.promotion.quantity,
    //         -1,
    //         this.cart.cartItems[cartItemIndex].variant_id);

    //     if (qty.updateablePairedQty) {
    //         this.cartService.updateProductQuantity(
    //             this.selectedVariant.id,
    //             cartItemIndex,
    //             qty.updateablePairedQty);
    //     }
    //     if (!qty.isNewReminderQty) {
    //         this.cartService.removeProductFromCart(cartItemIndex + 1);
    //     } else {
    //         if (qty.isUnPairedProductExist) {
    //             this.cartService.updateProductQuantity(
    //                 this.selectedVariant.id,
    //                 cartItemIndex + 1,
    //                 qty.updateableUnPairedQty);
    //         } else {
    //             if (this.cart.cartItems[cartItemIndex].product.promotion.quantity <= this.cart.cartItems[cartItemIndex].quantity + 1) {
    //                 this.addNewProductToCart(cartItemIndex + 1, qty.newReminderQty);
    //             } else {
    //                 this.cartService.updateProductQuantity(
    //                     this.selectedVariant.id,
    //                     cartItemIndex,
    //                     1);
    //             }
    //         }

    //     }

    // } else {
    if (this.product.promotion?.promotion_type === 'free-product') {
      if (!this.showFreeProductPromotion || this.isFreePromotionProdAdding) {
        const foundedIndex = this.cart.cartItems.findIndex(
          (x) =>
            x.product_id === this.product.id &&
            x.selected_variant.id === this.selectedVariant.id &&
            x.freeProducts.length === 0
        );
        if (foundedIndex > -1) {
          this.cartService.updateProductQuantity(
            this.selectedVariant.id,
            foundedIndex,
            this.cartProduct.quantity
          );
        } else {
          this.addNewProductToCart();
        }
        return;
      } else {
        const fillteredFreeProds = this.cart.cartItems.filter(
          (x) =>
            x.product_id === this.product.id &&
            x.selected_variant.id === this.selectedVariant.id &&
            x.freeProducts.length > 0
        );
        const length = fillteredFreeProds.length;
        if (length > 0) {
          let newFoundedIndex = -1;
          const addedProdsStringify = JSON.stringify(
            this.addedFreePromotionProducts.map(
              (x) => `${x.id}-${x.variants[0].id}`
            )
          );
          for (let i = 0; i < length; i++) {
            const sg = JSON.stringify(
              fillteredFreeProds[i].freeProducts.map(
                (x) => `${x.id}-${x.variants[0].id}`
              )
            );
            if (sg === addedProdsStringify) {
              newFoundedIndex = i;
              break;
            }
          }
          if (newFoundedIndex > -1) {
            this.cartService.updateProductQuantity(
              this.selectedVariant.id,
              newFoundedIndex,
              this.cartProduct.quantity
            );
          } else {
            this.addNewProductToCart();
          }
          return;
        }
      }
    }
    this.cartService.updateProductQuantity(
      this.selectedVariant.id,
      cartItemIndex,
      this.cartProduct.quantity
    );
    // }
  }

  resetQty(): void {
    if (this.isQuantityExists) {
      this.cartProduct.quantity = 1;
    }
    // get total price of cart items
    this.cartProduct.totalPrice = this.getProductTotalPrice();
  }

  // add new product to cart and invoke subscribers
  addNewProductToCart(cartItemIndex = -1, qty = 0): void {
    const cartItem = { ...this.product };
    cartItem.quantity = qty > 0 ? qty : this.cartProduct.quantity;
    cartItem.product = this.product;
    cartItem.product.variant = { ...this.selectedVariant };
    cartItem.product.variant.maxQty = this.maxQty;
    cartItem.freeProduct = this.selectedFreeProduct;
    cartItem.isFreeNicShot = this.isNicShotAdding;
    cartItem.isFreeProductsPermotion = !this.isFreePromotionProdAdding;
    cartItem.freeProducts = [...this.addedFreePromotionProducts];
    if (
      this.productService.isBulkPermotion(this.product) &&
      !cartItem?.exclusive_offer &&
      !cartItem.mix_match_offer
    ) {
      if (cartItem.quantity % cartItem.promotion.quantity === 0) {
        this.cartService.addProductToCart(
          cartItem,
          { ...this.selectedVariant },
          cartItemIndex
        );
        closeProdModal();
      } else {
        if (cartItem.quantity < cartItem.promotion.quantity) {
          this.cartService.addProductToCart(
            cartItem,
            { ...this.selectedVariant },
            cartItemIndex
          );
          closeProdModal();
        } else {
          const realNumber = parseInt(
            (cartItem.quantity / cartItem.promotion.quantity).toString(),
            0
          );
          const reminderNumber =
            cartItem.quantity % cartItem.promotion.quantity;
          cartItem.quantity = realNumber * cartItem.promotion.quantity;
          this.cartService.addProductToCart(
            cartItem,
            { ...this.selectedVariant },
            cartItemIndex
          );
          cartItem.quantity = reminderNumber;
          this.cartService.addProductToCart(
            cartItem,
            { ...this.selectedVariant },
            cartItemIndex
          );
          closeProdModal();
        }
      }
    } else {
      this.cartService.addProductToCart(cartItem, { ...this.selectedVariant });
      this.cartProduct.quantity = 1;
      this.cartProduct.totalPrice = this.productService.getDiscountedPrice(
        { ...this.product },
        this.selectedVariant.price,
        this.cartProduct.quantity
      );
      closeProdModal();
    }
  }
  onMinusQuantity(): void {
    if (
      this.selectedVariant.initial_quantity === 0 &&
      this.cartProduct.quantity === 1 &&
      this.cartProduct.quantity !== this.maxQty
    ) {
      return;
    }
    if (
      (this.cartProduct.quantity > 1 && this.selectedVariant !== null) ||
      undefined
    ) {
      this.cartProduct.quantity--;
      this.selectedVariant.initial_quantity++;
      this.cartProduct.totalPrice = this.getProductTotalPrice();
    }
    // =================If free product show or not shown by promo min Qty==========================
    if (
      this.product?.promotion?.promotion_type === 'free-product' &&
      this.cartProduct.quantity < this.product?.promotion?.quantity
    ) {
      this.showFreeProductPromotion = false;
      this.addedFreePromotionProducts.length = 0;
      this.addFreeProdQtyDefault();
    }
  }
  // ======================= free promo adding====================
  onAddFreePromotionProducts(item: any): void {
    this.addFreePromotionProductssumQty = this.addedFreePromotionProducts
      .map((x) => x.quantity)
      .reduce((a, b) => a + b, 0);
    if (
      this.addFreePromotionProductssumQty <
      this.product.promotion?.free_quantity
    ) {
      const addedItemIndex = this.addedFreePromotionProducts.findIndex(
        (x) => x.id === item.id && x.variants[0].id === item.variants[0].id
      );
      if (addedItemIndex > -1) {
        this.addedFreePromotionProducts[addedItemIndex].quantity++;
      } else {
        item.quantity++;
        this.addedFreePromotionProducts.push(item);
      }
    }
    this.addFreePromotionProductssumQty = this.addedFreePromotionProducts
      .map((x) => x.quantity)
      .reduce((a, b) => a + b, 0);
  }
  // =====================selected promo remove and then add new one=========================
  onRemoveFreePromotionProduct(index: number): void {
    const addedItemIndex = this.freePromotionProducts.findIndex(
      (x) =>
        x.id === this.addedFreePromotionProducts[index].id &&
        x.variants[0].id ===
          this.addedFreePromotionProducts[index].variants[0].id
    );
    this.freePromotionProducts[addedItemIndex].quantity = 0;
    this.addedFreePromotionProducts.splice(index, 1);
    this.addFreePromotionProductssumQty = this.addedFreePromotionProducts
      .map((x) => x.quantity)
      .reduce((a, b) => a + b, 0);
  }
  showFreePromotionProds(): void {
    if (
      this.product?.promotion?.promotion_type === 'free-product' &&
      this.cartProduct.quantity >= this.product?.promotion?.quantity
    ) {
      this.showFreeProductPromotion = true;
    }
  }
  onPlusQuantity(): void {
    // if (this.selectedVariant.initial_quantity === 0) {
    //     return;
    // }
    if (
      this.cartProduct.quantity < this.maxQty &&
      this.cartProduct.quantity > -1
    ) {
      if (
        (this.cartProduct.quantity >= 1 && this.selectedVariant !== null) ||
        undefined
      ) {
        this.cartProduct.quantity++;
        this.selectedVariant.initial_quantity--;
        this.cartProduct.totalPrice = this.getProductTotalPrice();
      }
    }
    if (!this.showFreeProductPromotion) {
      this.showFreePromotionProds();
    }
  }
  getProductTotalPrice(): number {
    return this.productService.getDiscountedPrice(
      { ...this.product },
      this.selectedVariant.price,
      this.cartProduct.quantity === 0 ? 1 : this.cartProduct.quantity
    );
  }
  getOldPrice(): number {
    let price = 0;
    if (this.selectedVariant !== null) {
      price =
        this.selectedVariant.price *
        (this.cartProduct.quantity === 0 ? 1 : this.cartProduct.quantity);
    }
    return price;
  }
  // if product hava a free product then
  // make them selected product true of remove selected product
  onAddFreeProduct({ ...item }): void {
    if (this.isProductAdded) {
      item.realQuantity = item.quantity;
      this.cartService.addFreeNicShoot(
        item,
        this.product.id,
        this.selectedVariant.id
      );
      return;
    }
    if (this.isProductAdded || this.selectedFreeProduct) {
      const product = this.cartService.freeProductTranslateToProduct({
        ...item,
      });
      const cartProductIndex = this.getIndexOfCartItem(item.variant.id);
      if (cartProductIndex > -1) {
        this.cartService.updateProductQuantity(
          item.variant.id,
          cartProductIndex,
          1
        );
      } else {
        this.cartService.addProductToCart(product, { ...item.variant });
      }
    } else {
      this.isShowFreeProductErorMessage = false;
      this.selectedFreeProduct = item;
    }
  }
  getOldPriceForFreeProduct({ ...item }): number {
    let price = 0;
    if (this.selectedVariant !== null) {
      price = item.variant.sell_price * 1;
    }
    return price;
  }
  getPriceFreeProduct({ ...item }): number {
    let price = 0;
    item.promotion = item.promotions[0];
    price = this.productService.getDiscountedPrice(
      { ...item },
      item.variant.sell_price
    );
    return price;
  }
  removeFreeProduct(): void {
    this.isShowFreeProductErorMessage = false;
    this.selectedFreeProduct = null;
  }
  isShowAttrubutesOneLine(): boolean {
    return this.arrangedVariants
      .map((x) => x.attribute_detail.length)
      .filter((x) => x > 1).length > 0
      ? false
      : true;
  }

  toasterSuccessMessage(message: string, title: string): void {
    this.toastr.success(message, title);
  }

  toasterErrorMessage(message: string, title: string): void {
    this.toastr.error(message, title);
  }
}
