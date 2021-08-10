import { OnDestroy, ViewChild } from '@angular/core';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Store } from '@ngrx/store';
import {
  Gallery,
  GalleryItem,
  ImageItem,
  ThumbnailsPosition,
  ImageSize,
  GalleryComponent,
} from 'ng-gallery';
import { Lightbox } from 'ng-gallery/lightbox';
import { ProductService } from 'src/app/_services/product.service';

import { environment } from 'src/environments/environment';
import { CartService } from 'src/app/_services/cart/cart.service';
import { Cart, CartItem } from 'src/app/_models/cartModel';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/_services/auth.service';
import { ShareService } from 'src/app/_services/share.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  @ViewChild('lightbox123') galleryComponent: GalleryComponent;
  readonly APP_NAME = environment.APP_NAME;
  emailForm: FormGroup;
  points = 0;
  showFreeProductPromotion = false;
  selectedAttributeIndex = 0;
  isNicShotAdding = false;
  isFreePromotionProdAdding = false;
  subscription: Subscription;
  getCartSubscription: Subscription;
  lightboxRef = this.gallery.ref('lightbox');
  data: SafeHtml = [];
  isQuantityExists = true;
  type = '';
  shareUrl: string;
  addFreePromotionProductssumQty = 0;
  currency = '$';
  isloading = false;
  isChangVariantFirstLoad = true;
  productSku: string;
  productDetail: any;
  arrangedVariants = [];
  greenLabel = '';
  bottomContent = '';
  items: GalleryItem[];
  imageData: any;
  API_URL: string;
  dataSet = [];
  productDetailCopy = null;
  selectedVariant: any = null;
  cartProduct = {
    quantity: 1,
    cartAddedQty: 0,
    totalPrice: 0,
    freeProdTotalPrice: 0,
    product: null,
  };
  images = [];
  userInfo: any;
  isWhishListItem = false;
  title = '';
  htmlcontent = [];
  maxQty = 0;
  cart: any;
  isLoggedIn = false;
  isProductAdded = false;
  isShowFreeProductErorMessage = false;
  selectedFreeProduct = null;
  selectedFreeProducts = [null];
  initialQuantity = 0;
  navUrl: string;
  reward = null;
  submitted = false;
  freePromotionProducts = [];
  addedFreePromotionProducts = [];
  cutOffTimeDetail: any;
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public gallery: Gallery,
    public lightbox: Lightbox,
    private metaTagService: Meta,
    private titleService: Title,
    private sanitizer: DomSanitizer,
    private cartService: CartService,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private store: Store<{ navbar: { settings: any } }>,
    private shareService: ShareService,
    private fb: FormBuilder
  ) {
    this.API_URL = environment.API_URL;
  }

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.shareUrl = 'https://vapesuite.allomate.solutions/#' + this.router.url;
    this.isLoggedIn = this.authService.isLogin();
    this.route.params.subscribe((params) => {
      this.productSku = params.id;
      this.greenLabel = '';
      // call api for product detail
      this.getProductDetail(this.productSku);
    });
    this.subscription = this.store.subscribe((data: any) => {
      this.currency = data.navbar.navbar.currency;
      if (data.navbar.navbar.reward) {
        this.reward = data.navbar.navbar.reward;
      }
      this.earnablePoints();
    });
    this.cartSubscription();

    setInterval(()=>{
      var c = this.productService.cutOffTime();
      this.cutOffTimeDetail = c.h + " Hrs, " + c.m + " Min, " + c.s +' Sec' ;
    }, 1000);

  }
  onParseInt(value: number): number {
    return parseInt(value.toString());
  }
  get f(): any {
    return this.emailForm.controls;
  }

  private createNavigationUrl(): void {
    const searchParams = new URLSearchParams();

    // TODO: zrobić map z tego manualnego dziugania

    switch (this.type) {
      case 'facebook':
        searchParams.set('u', this.shareUrl);
        this.navUrl =
          'https://www.facebook.com/sharer/sharer.php?' + searchParams;
        break;
      case 'twitter':
        searchParams.set('url', this.shareUrl);
        this.navUrl = 'https://twitter.com/share?' + searchParams;
        break;
      case 'whatsapp':
        searchParams.set('url', this.shareUrl);
        this.navUrl = 'https://api.whatsapp.com/send?text=' + searchParams;
        break;
    }
  }
  public share(shareType: string): any {
    this.type = shareType;
    this.createNavigationUrl();
    return window.open(this.navUrl, '_blank');
  }
  onFreeNicShotCheckedUnchecked(): void {
    if (this.isNicShotAdding) {
      this.selectedFreeProduct = null;
      this.removeFreeNicShoot();
    }
  }
  onFreePromotionProductsCheckedUnchecked(): void {
    if (this.isFreePromotionProdAdding) {
      this.addedFreePromotionProducts.length = 0;
      this.addFreePromotionProductssumQty = 0;
      this.addFreeProdQtyDefault();
      // this.removeFreeNicShoot();
    }
  }
  // wishlist icon active or not
  wishListItem(): void {
    if (this.isLoggedIn) {
      this.userInfo = this.authService.getUserInfo();
      const wishList = this.userInfo?.wishlist;
      if (wishList && wishList.length) {
        const wishedItem = wishList.find(
          (x) => x.product_id === this.productDetail.product.id
        );
        if (wishedItem) {
          this.isWhishListItem = true;
        }
      }
    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.getCartSubscription) {
      this.getCartSubscription.unsubscribe();
    }
  }
  set_dataset(): void {
    this.dataSet = [];
    const product = { ...this.productDetail.product };
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
  getProductDetail(sku: string): void {
    this.isloading = true;
    this.cartProduct = {
      quantity: 1,
      cartAddedQty: 0,
      totalPrice: 0,
      freeProdTotalPrice: 0,
      product: null,
    };
    this.productService.getProductDetail(sku).subscribe(
      (result: any) => {
        this.productDetailCopy = { ...result.data };
        this.productDetail = result.data;
        if (this.productDetail?.product?.free_product) {
          this.productDetail.product.free_product = this.productDetail?.product?.free_product.map(
            (x) => ({ ...x, realQuantity: x.quantity })
          );
        }
        const filteredData = this.getVariants();
        this.setImages();
        this.getVariants();
        const greenlabel = result.data?.product?.properties_data.find(
          (x) => x.property_type === 'green_label'
        );
        if (greenlabel) {
          this.greenLabel = greenlabel.property_value;
        }
        if (
          this.productDetail.product?.promotion?.promotion_type ===
          'free-product'
        ) {
          this.productService
            .getFreePromotionProducts(
              this.productDetail.product.promotion.linked_id
            )
            .subscribe((x) => {
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
              this.showFreePromotionProds();
              // this.freePromotionProducts = x;
            });
          this.earnablePoints();
        }
        this.isloading = false;
        this.set_dataset();
        this.defaultSelectionProductAttributes();
        this.bottomContent = this.productDetail.product.bottom_content;
        // ===========SEO==============
        this.title = this.APP_NAME + this.productDetail.product.name;
        this.titleService.setTitle(this.title);
        const keywords = JSON.parse(this.productDetail.product.seo)
          .meta_keywords;
        this.metaTagService.updateTag({
          name: 'description',
          content: this.title,
        });
        this.metaTagService.updateTag({ name: 'keywords', content: keywords });
        // =============END SEO===================
        this.htmlcontent = [...this.productDetail.product.bottom_content];
        this.wishListItem();
        this.cartUpdate(this.cartService.getCartFromLocalStorage());
        this.isChangVariantFirstLoad = false;
        if (this.productDetail?.product?.short_description?.length) {
          this.productDetail.product.short_description = this.productDetail?.product?.short_description.replace(
            /\n/g,
            '<br />'
          );
        }
        if (this.productDetail?.product.description?.length) {
          this.productDetail.product.description = this.productDetail.product.description.replace(
            /\n/g,
            '<br />'
          );
        }
        this.shareService.setSocialMediaTags(
          'https://vapesuite.allomate.solutions/#/product/Smoknic-0002',
          'Smoknic Black Aniseed',
          'A secret blend of mixed dark fruits, makes way for a sharp bite of aniseed in this complex and flavourful combination.',
          'https://vape.allomate.solutions/storage/products/Smoknic-Black-Aniseed-Smoknic-Smoknic-0002-thumbnail.jpg'
        );
      },
      (err) => {
      }
    );
  }
  showFreePromotionProds(): void {
    if (
      this.productDetail.product?.promotion?.promotion_type ===
        'free-product' &&
      this.cartProduct.quantity >=
        this.productDetail.product?.promotion?.quantity
    ) {
      this.showFreeProductPromotion = true;
    }
  }
  setHtml(index: number): any {
    return this.sanitizer.bypassSecurityTrustHtml(
      this.productDetail.product.bottom_content[index].content
    );
  }
  setHtmlDescription(desc): any {
    return this.sanitizer.bypassSecurityTrustHtml(desc);
  }
  setImages(): void {
    const arrayOfImages = this.productDetail.product.variants
      .map((x) => x.variant_image)
      .flat()
      .filter((img) => img != null);
    if (arrayOfImages.length > 0) {
      this.images = arrayOfImages.map((x) => ({
        id: x.product_id,
        imageUrl: `${this.API_URL}/${x.image}`,
      }));
      if (this.productDetail.product.media.length) {
        const prodImage = {
          imageUrl: `${this.API_URL}/${this.productDetail.product.media[0].full_path}`,
        };
        this.images.unshift(prodImage);
      }
      // Creat gallery items
      this.items = this.images.map(
        (item) => new ImageItem({ src: item.imageUrl, thumb: item.imageUrl })
      );

      // Add custom gallery config to the lightbox (optional)
      this.lightboxRef.setConfig({
        imageSize: ImageSize.Cover,
        thumbPosition: ThumbnailsPosition.Top,
      });

      // Load items into the lightbox gallery ref
      this.lightboxRef.load(this.items);
    }
  }

  getCartku(): string {
    return this.route.snapshot.paramMap.get('id');
  }

  // for html
  getKeyFeatures(): string[] {
    return JSON.parse(this.productDetail.product.key_features);
  }
  // get variants
  getVariants(): any {
    this.arrangedVariants = [];
    const variants: any[] = this.productDetail.product.variants;
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
        ].image = this.productDetail.product.variants.find(
          (x) => x.id === val.variant_id
        ).variant_image?.image;
      });
    });
    return this.arrangedVariants;
  }
  isShowAttrubutesOneLine(): boolean {
    return this.arrangedVariants
      .map((x) => x.attribute_detail.length)
      .filter((x) => x > 1).length > 0
      ? false
      : true;
  }
  onRadioClicked(
    attributeName: string,
    attributeValue: string,
    index: number,
    vIndex = 0
  ): void {
    this.selectedAttributeIndex = vIndex > -1 ? vIndex : 0;
    if (this.arrangedVariants.length && index > -1) {
      // if (this.arrangedVariants.length === 2 && index > 0) {
      this.onRadioClick(attributeName, attributeValue, index);
    }
  }
  // ==============ON RADIO CLICKED===============
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
      for (const variant of this.productDetail.product.variants) {
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
  // ==============END ON RADIO CLICKED===============

  lastAttrChecked(attributeName: string): void {
    if (
      attributeName ===
      this.arrangedVariants[this.arrangedVariants.length - 1].attribute_name
    ) {
      const checkedVariants = this.getCheckeVariants([
        ...this.arrangedVariants,
      ]);
      // this.selectedVariant = this.productDetail.product.variants.find(x => x.id === checkedVariants[0].variant_id);
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
      if (this.images.length && !this.isChangVariantFirstLoad) {
        const index = this.images.findIndex(
          (x) => x.id === this.selectedVariant.id
        );
        if (this.galleryComponent) {
          this.galleryComponent.set(index);
        }
      }
      this.cartProduct.totalPrice = this.productService.getDiscountedPrice(
        { ...this.productDetail.product },
        this.selectedVariant.price,
        this.cartProduct.quantity
      );
      if (this.selectedVariant) {
        this.isQuantityExists =
          this.productDetail.product.variants.find(
            (x) => x.id === this.selectedVariant.id
          ).initial_quantity > 0
            ? true
            : false;
        if (this.cartProduct.quantity > 0 && !this.isQuantityExists) {
          this.cartProduct.quantity = 0;
        }
        // set email if logged in and qty = 0
        if (!this.isQuantityExists && this.authService.isLoggedIn) {
          this.emailForm.setValue({
            email: this.authService.getUserInfo()?.email || '',
          });
        }
        if (this.cartProduct.quantity === 0 && this.isQuantityExists) {
          this.cartProduct.quantity = 1;
        }
        this.maxQty = this.selectedVariant.initial_quantity;
        this.selectedVariant.maxQty = this.maxQty;
        this.maxQty = this.isQuantityExists
          ? this.selectedVariant.initial_quantity--
          : 0;
        // this.selectedVariant.initial_quantity -= this.cartProduct.quantity;
        this.cartUpdate(this.cartService.getCartFromLocalStorage());
      }
    }
    this.isShowFreeProductErorMessage = false;
    if (this.selectedVariant) {
      this.cartProduct.totalPrice = this.getProductTotalPrice();
      this.earnablePoints();
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
    this.cart = { ...x };
    if (this.cart.cartItems && this.selectedVariant) {
      const items = x.cartItems.filter(
        (i: CartItem) => i.variant_id === this.selectedVariant.id
      );
      if (items.length) {
        this.cartProduct.cartAddedQty = this.cartService.getCartProductQuantity(
          [...items]
        );
        // this.maxQty -= this.cartProduct.cartAddedQty + 1;
        this.isProductAdded = true;
        // if (this.productDetail.product.promotion.promotion_type === 'free-product') {
        //   this.showFreeProductPromotion = true;
        // }
        this.selectedVariant.initial_quantity =
          this.productDetailCopy.product.variants.find(
            (v) => v.id === this.selectedVariant.id
          ).initial_quantity - this.cartProduct.cartAddedQty;
        const prod = this.cart.cartItems.find(
          (item: CartItem) => item.variant_id === this.selectedVariant.id
        );
        this.isFreePromotionProdAdding = !prod.isFreeProductsPermotion;
        this.cartProduct.product = prod.freeProduct;
        this.selectedFreeProduct = prod.freeProduct;
        this.isNicShotAdding = prod?.isFreeNicShot ? true : false;
      } else {
        this.isProductAdded = false;
        this.cartProduct.product = null;
        this.selectedVariant.initial_quantity =
          this.selectedVariant.maxQty - this.cartProduct.quantity;
        this.selectedFreeProduct = null;
      }
    }
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
  findIndexOfVariant(index: number, attribute: any, value: string): number {
    return this.arrangedVariants[index + 1].attribute_detail.findIndex(
      (d) => d.attribute_value === value
    );
  }
  lowPricedAttributesSelect(): void {}
  onMinusQuantity(): void {
    // if (this.selectedVariant.initial_quantity === 0 && this.cartProduct.quantity !== this.maxQty) {
    //   return;
    // }
    if (
      (this.cartProduct.quantity > 1 && this.selectedVariant !== null) ||
      undefined
    ) {
      this.cartProduct.quantity--;
      this.selectedVariant.initial_quantity++;
      this.cartProduct.totalPrice = this.getProductTotalPrice();

      this.earnablePoints();
    }
    if (
      this.productDetail.product?.promotion?.promotion_type ===
        'free-product' &&
      this.cartProduct.quantity <
        this.productDetail.product?.promotion?.quantity
    ) {
      this.showFreeProductPromotion = false;
      this.addedFreePromotionProducts.length = 0;
      this.addFreeProdQtyDefault();
    }
  }

  addFreeProdQtyDefault(): void {
    this.freePromotionProducts.forEach((currentValue: any, index: number) => {
      this.freePromotionProducts[index].quantity = 0;
    });
  }

  onPlusQuantity(): void {
    // if (this.selectedVariant.initial_quantity === 0) {
    //   this.toastr.info('You are added all stock', 'Information');
    //   return;
    // }
    // if (this.cartProduct.quantity < this.maxQty && this.cartProduct.quantity > -1) {
    if (
      (this.cartProduct.quantity >= 1 && this.selectedVariant !== null) ||
      undefined
    ) {
      this.cartProduct.quantity++;
      this.selectedVariant.initial_quantity--;
      this.cartProduct.totalPrice = this.getProductTotalPrice();

      this.earnablePoints();
    }
    // }
    if (!this.showFreeProductPromotion) {
      this.showFreePromotionProds();
    }
  }
  onAddFreePromotionProducts(item: any): void {
    this.addFreePromotionProductssumQty = this.addedFreePromotionProducts
      .map((x) => x.quantity)
      .reduce((a, b) => a + b, 0);
    if (
      this.addFreePromotionProductssumQty <
      this.productDetail.product.promotion?.free_quantity
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
  getProductTotalPrice(): number {
    return (this.cartProduct.totalPrice = this.productService.getDiscountedPrice(
      { ...this.productDetail.product },
      this.selectedVariant.price,
      this.cartProduct.quantity === 0 ? 1 : this.cartProduct.quantity
    ));
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
    if (this.isQuantityExists) {
      this.submitted = false;
    }

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
          product_id: this.productDetail.product.id,
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
    if (
      this.selectedVariant.initial_quantity === 0 &&
      this.cartProduct.quantity === 1
    ) {
      this.toastr.info('You are added all stock to cart', 'Information');
      return;
    }
    if (
      this.cartProduct.quantity >=
        this.productDetail.product?.promotion?.quantity &&
      this.productDetail.product.promotion?.promotion_type === 'free-product' &&
      !this.isFreePromotionProdAdding &&
      this.addFreePromotionProductssumQty !==
        this.productDetail.product.promotion?.free_quantity
    ) {
      this.toasterErrorMessage('Select Free Product', 'Error');
      return;
    }
    if (
      this.selectedFreeProduct ||
      this.isProductAdded ||
      !this.productDetail.product.free_product.length ||
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
          this.cartProduct.quantity >=
            this.productDetail.product.promotion?.quantity &&
          this.productDetail.product.promotion?.promotion_type ===
            'free-product' &&
          !this.isFreePromotionProdAdding &&
          this.addFreePromotionProductssumQty !==
            this.productDetail.product.promotion?.free_quantity
        ) {
          this.toasterErrorMessage('Select Free Product', 'Error');
          return;
        }
        // find product is with selected variant, if already added then update else add new;
        const cartItemIndex = this.getIndexOfCartItem(this.selectedVariant.id);
        if (this.cartProduct.product || this.isNicShotAdding) {
          this.updateQuantity(cartItemIndex);
        } else {
          if (this.productDetail?.freeProduct) {
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
      }
    } else {
      this.isShowFreeProductErorMessage = true;
      this.toasterErrorMessage('Select Free Product', 'Error');
    }
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

  toasterSuccessMessage(message: string, title: string): void {
    this.toastr.success(message, title);
  }

  toasterErrorMessage(message: string, title: string): void {
    this.toastr.error(message, title);
  }
  // update quantity in cart item and update prices
  updateQuantity(cartItemIndex: number): void {
    if (
      this.cartProduct.quantity >=
        this.productDetail.product.promotion?.quantity &&
      this.productDetail.product.promotion?.promotion_type === 'free-product' &&
      !this.isFreePromotionProdAdding &&
      this.addFreePromotionProductssumQty !==
        this.productDetail.product.promotion?.free_quantity
    ) {
      this.toasterErrorMessage('Select Free Product', 'Error');
      return;
    }
    // if (this.productService.isBulkPermotion(this.productDetail.product)) {
    //   const qty = this.cartService.getOldAndNextProductQty(
    //     this.cart.cartItems,
    //     this.productDetail.product.id,
    //     this.cartProduct.quantity,
    //     this.cart.cartItems[cartItemIndex].product.promotion.quantity,
    //     -1,
    //     this.cart.cartItems[cartItemIndex].variant_id);

    //   if (qty.updateablePairedQty) {
    //     this.cartService.updateProductQuantity(
    //       this.selectedVariant.id,
    //       cartItemIndex,
    //       qty.updateablePairedQty);
    //   }
    //   if (!qty.isNewReminderQty) {
    //     this.cartService.removeProductFromCart(cartItemIndex + 1);
    //   } else {
    //     if (qty.isUnPairedProductExist) {
    //       this.cartService.updateProductQuantity(
    //         this.selectedVariant.id,
    //         cartItemIndex + 1,
    //         qty.updateableUnPairedQty);
    //     } else {
    //       if (this.cart.cartItems[cartItemIndex].product.promotion.quantity <= this.cart.cartItems[cartItemIndex].quantity + 1) {
    //         this.addNewProductToCart(cartItemIndex + 1, qty.newReminderQty);
    //       } else {
    //         // this.cartService.updateProductQuantity(
    //         //   this.selectedVariant.id,
    //         //   cartItemIndex,
    //         //   1);
    //       }
    //     }

    //   }

    // } else {
    if (
      this.productDetail.product.promotion?.promotion_type === 'free-product'
    ) {
      if (!this.showFreeProductPromotion || this.isFreePromotionProdAdding) {
        const foundedIndex = this.cart.cartItems.findIndex(
          (x) =>
            x.product_id === this.productDetail.product.id &&
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
            x.product_id === this.productDetail.product.id &&
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
    this.cartProduct.quantity = 1;
    // get total price of cart items
    this.cartProduct.totalPrice = this.getProductTotalPrice();
  }

  // add new product to cart and invoke subscribers
  addNewProductToCart(cartItemIndex = -1, qty = 0): void {
    const cartItem = { ...this.productDetail.product };
    cartItem.quantity = qty > 0 ? qty : this.cartProduct.quantity;
    cartItem.product = this.productDetail.product;
    cartItem.product.variant = { ...this.selectedVariant };
    cartItem.product.variant.maxQty = this.maxQty;
    cartItem.freeProduct = this.selectedFreeProduct;
    cartItem.isFreeNicShot = this.isNicShotAdding;
    cartItem.isFreeProductsPermotion = !this.isFreePromotionProdAdding;
    cartItem.freeProducts = [...this.addedFreePromotionProducts];
    if (
      this.productService.isBulkPermotion(this.productDetail.product) &&
      !cartItem?.exclusive_offer &&
      !cartItem.mix_match_offer
    ) {
      if (cartItem.quantity % cartItem.promotion.quantity === 0) {
        this.cartService.addProductToCart(
          cartItem,
          { ...this.selectedVariant },
          cartItemIndex
        );
      } else {
        if (cartItem.quantity < cartItem.promotion.quantity) {
          this.cartService.addProductToCart(
            cartItem,
            { ...this.selectedVariant },
            cartItemIndex
          );
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
        }
      }
    } else {
      this.cartService.addProductToCart(cartItem, { ...this.selectedVariant });
      this.cartProduct.quantity = 1;
      this.cartProduct.totalPrice = this.productService.getDiscountedPrice(
        { ...this.productDetail.product },
        this.selectedVariant.price,
        this.cartProduct.quantity
      );
    }
    // this.cartService.invokeSubscribers();
  }
  // if product hava a free product then
  // make them selected product true of remove selected product
  onAddFreeProduct({ ...item }): void {
    if (this.isProductAdded) {
      item.realQuantity = item.quantity;
      this.cartService.addFreeNicShoot(
        item,
        this.productDetail.product.id,
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
          // this.productDetail.product.id,
          item.variant.id,
          cartProductIndex,
          1
        );
      } else {
        this.cartService.addProductToCart(product, { ...item.variant });
        this.toasterSuccessMessage('Added to cart Sucessfuly', 'Sucess');
      }
    } else {
      this.isShowFreeProductErorMessage = false;
      this.selectedFreeProduct = item;
      // if (this.selectedFreeProduct) {
      //   this.cartService.addProductToCart(product, { ...item.variant });
      // }
    }
  }
  removeFreeNicShoot(): void {
    if (this.cartProduct.product) {
      this.cartService.removeFreeNicShoot(
        this.productDetail.product.id,
        this.selectedVariant.id
      );
      return;
    }
  }
  removeFreeProduct(): void {
    this.isShowFreeProductErorMessage = false;
    this.selectedFreeProduct = null;
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
  onAddToWishList(productId: number): void {
    this.productService.postWhislistItem(productId).subscribe((x) => {
      this.isWhishListItem = true;
      this.userInfo = this.authService.getUserInfo();
      if (this.userInfo?.wishlist) {
        const wishedItemIndex = this.userInfo?.wishlist.findIndex(
          (w) => w.product_id === this.productDetail.product.id
        );
        if (wishedItemIndex > -1) {
          this.isWhishListItem = false;
          this.userInfo?.wishlist.splice(wishedItemIndex, 1);
          this.toasterSuccessMessage(
            'Removed from whishlist Sucessfuly',
            'Sucess'
          );
        } else {
          this.userInfo?.wishlist.push({
            product_id: this.productDetail.product.id,
          });
          this.toasterSuccessMessage('Added to whishlist Sucessfuly', 'Sucess');
          this.authService.setUserInfo(this.userInfo);
        }
        this.authService.setUserInfo(this.userInfo);
      }
    });
  }

  earnablePoints(): void {
    if (this.reward && !this.isloading) {
      this.points = this.cartService.getEarnablePointsForProduct(
        this.reward?.conversion_rate_points,
        this.reward?.conversion_rate_amount,
        this.cartProduct.totalPrice
      );
      this.points = this.productService.transFormToNumber(this.points || 0);
    }
  }
}
