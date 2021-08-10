import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ProductService } from 'src/app/_services/product.service';
import { stickySearchExclusiveDeal } from '../../../assets/js/customJquery';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'src/app/_services/cart/cart.service';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-exclusive-offer',
  templateUrl: './exclusive-offer.component.html',
  styleUrls: ['./exclusive-offer.component.scss']
})
export class ExclusiveOfferComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly API_URL = environment.API_URL;
  isLoading = true;
  readonly APP_NAME = environment.APP_NAME;
  exclusiveOffer: any;
  currency = '';
  lastSelectedAttributeAddress = 0;
  isAttributeSelected = false;
  selectedAttributeIndex = 0;
  paramId = 0;
  sortBy = 0;
  searchVariant = '';
  products = [];
  addedProducts = [];
  addedProducts$ = new Subject<[]>();
  offerPrice = 0;
  OfferQuantity = 0;
  inputValue = 1;
  promotionQuantity = 0;
  attribute = {
    id: 0,
    coloumn_name: '',
    name: 'loading...',
    placement: null,
  };
  attributeValues = [];
  subscription: Subscription;
  variants = [];
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private toastr: ToastrService,
    private store: Store<{ navbar: { settings: any } }>,
    private metaTagService: Meta,
    private titleService: Title,
  ) {
    this.isLoading = true;
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  ngAfterViewInit(): void {
    stickySearchExclusiveDeal();
  }

  ngOnInit(): void {
    const title = this.APP_NAME + 'Exclusive-Offer';
    this.titleService.setTitle(title);
    this.metaTagService.updateTag(
      { name: 'description', content: 'category' }
    );
    this.metaTagService.updateTag(
      { name: 'keywords', content: 'vapesuite, exclusive, suite, products, vape products, listing, vape' }
    );
    this.subscription = this.store.subscribe((data: any) => {
      this.currency = data.navbar.navbar.currency;
    });
    this.addedProducts$.subscribe(prods => {
      this.addedProducts = prods;
      this.OfferQuantity = this.promotionQuantity - this.addedProducts.map(p => p.quantity).reduce((a, b) => a + b, 0);
    });
    this.route.params.subscribe(
      params => {
        this.paramId = params.id;
        this.getProductService();
      });
  }

  getProductService(): void {
    this.productService.getExclusiveOffer(this.paramId).subscribe(data => {
      if (data) {
        this.exclusiveOffer = data;
        this.products = [...this.exclusiveOffer?.products];
        this.attribute = { ...this.exclusiveOffer?.attribute };
        this.attributeValues = this.sortAttributeValue([...this.exclusiveOffer?.attribute?.values]);
        // this.attributeValues[this.lastSelectedAttributeAddress].isChecked = true;
        this.attributeValues.sort((a, b) => a.value.localeCompare(b.value, 'en', { numeric: true }));
        if (this.products.length > 0) {
          this.offerPrice = this.products[0].promotion.discount_price;
          this.OfferQuantity = this.products[0].promotion.quantity;
          this.promotionQuantity = this.OfferQuantity;
        }
        this.showVariants(1, 0, this.attributeValues[0].value);
      }
      this.isLoading = false;
    });
  }
  sortAttributeValue(attributeValues: any[]): any {
    let id = 1;
    return attributeValues.map(x => ({
      id: id++,
      assignment_id: x.attribute_id,
      attribute_id: x.attribute_id,
      value: x.value,
      isChecked: false,
      isDisabled: false
    }));
  }

  onRadioClick(id: number, index: number, value: string): void {
    if (this.addedProducts.length === 0) {
      this.attributeCheckedUnChecked(id, index);
      this.isAttributeSelected = true;
      this.showVariants(id, index, value);
      // this.lastSelectedAttributeAddress = index;
    }
  }

  attributeCheckedUnChecked(id: number, index: number): void {
    // this.attributeValues[this.lastSelectedAttributeAddress].isChecked = false;
    // this.attributeValues[index].isChecked = true;
    // this.selectedAttributeIndex = index;
    this.attributeValues.forEach(x => {
      x.isChecked = false;
    });
    this.attributeValues[index].isChecked = true;
  }

  showVariants(id: number, index: number, selectedAttrValue: string): void {
    const mappedVariants = this.products.map(x =>
    ({
      name: x.name,
      id: x.id,
      quantity: 0,
      promotion: x.promotion,
      below_name:
        x.properties_data.find(f =>
          f.property_type === 'below_name'
        ),
      green_label:
        x.properties_data.find(g =>
          g.property_type === 'green_label'
        ),
      variant:
        x.variants.find(v =>
          v.attribute_detail.find(
            a => a.attribute_value === selectedAttrValue
          )
        ),
      attribute_name: this.attribute.coloumn_name,
      attribute_value: selectedAttrValue,
    })).filter(x =>
      x.variant !== undefined
    );
    if (this.isAttributeSelected) {
      this.variants = mappedVariants;
    } else {
      this.variants = [...mappedVariants].slice(0, 6);
    }
    this.shortByName();
  }

  onSortChange(value: number): void {
    this.sortBy = value;
    this.shortByName();
  }

  shortByName(): void {
    if (this.sortBy == 0) {
      this.variants.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      this.variants.sort((a, b) => b.name.localeCompare(a.name));
    }
  }
  onAddProduct(variant: any): void {
    if (this.OfferQuantity > 0) {
      const index = this.findIndex(variant.id);
      if (index > -1) {
        this.addedProducts[index].quantity += 1;
      } else {
        variant.quantity = 1;
        this.addedProducts.push(variant);
      }
      this.OfferQuantity = this.promotionQuantity - this.addedProducts.map(p => p.quantity).reduce((a, b) => a + b, 0);
      this.addedProducts$.next(this.addedProducts as any);
      this.disabledEnabledAttributes(true);
    }
  }
  disabledEnabledAttributes(isDisabled = false): void {
    const length = this.attributeValues.length;
    for (let i = 0; i < length; i++) {
      if (this.attributeValues[i].isChecked === false) {
        this.attributeValues[i].isDisabled = isDisabled;
      }
    }
  }
  findIndex(id: number): number {
    return this.addedProducts.findIndex(x => x.id === id);
  }
  onMinusQuanity(): void {
    if (this.inputValue > 1) {
      this.inputValue--;
      // this.updateProdQuantity();
    }
  }
  onPlusQuanity(): void {
    if (this.inputValue > 0) {
      this.inputValue++;
      // this.updateProdQuantity();
    }
  }

  updateProdQuantity(): void {
    this.addedProducts.forEach(x => {
      x.quantity = x.quantity * this.inputValue;
    });
  }

  onRemoveProduct(id: number): void {
    const index = this.addedProducts.findIndex(x => x.id === id);
    if (index > -1) {
      this.addedProducts[index].quantity = 0;
      this.addedProducts = this.addedProducts.filter(x => x.id !== id);
      this.addedProducts$.next(this.addedProducts as any);
    }
    if (this.addedProducts.length === 0) {
      this.disabledEnabledAttributes();
    }
  }

  onAddToCart(): void {
    const selectedIndex = this.attributeValues.findIndex(x => x.isChecked === true);
    if (this.OfferQuantity === 0) {
      const localCart = localStorage.getItem('cart');
      let mappedCartItems;
      if (localCart) {
        const parsedlocalCart = JSON.parse(localCart);
        mappedCartItems = this.cartService.transFormCartItems(parsedlocalCart);
      }
      const mappedAddedProducts = this.cartService.transformExclusiveItems(
        [...this.addedProducts],
        this.attribute?.name,
        this.attributeValues[selectedIndex].value
      );
      const index = this.cartService.compareExclusiveItems(mappedCartItems, mappedAddedProducts);
      if (index > -1) {
        this.cartService.updateProductQuantity(0, index, 1, true);
        this.toasterSuccessMessage('Quantity update sucessfully', 'Success');
        this.resetSelection();
        return;
      }
      // If pair is not found add new exclusive offer on the cart
      const offer = {
        qty: this.inputValue,
        offerPrice: this.offerPrice,
        products: [...this.addedProducts]
      };
      const cartItem = {
        quantity: offer.qty,
        price: offer.offerPrice,
        isExclusive: true,
        promotion: this.products[0].promotion,
        exclusiveItems: offer.products,
        property_value: this.attributeValues[selectedIndex].value,
        property_name: this.attribute?.name,
      };
      this.cartService.addProductToCart(JSON.parse(JSON.stringify(cartItem)), null);
      this.resetSelection();
    } else {
      this.toasterErrorMessage(`Please select ${this.OfferQuantity} more, then add to cart`, 'Error');
    }

  }
  resetSelection(): void {
    this.addedProducts$.next([]);
    this.inputValue = 1;
    // this.attribute = { ...this.exclusiveOffer?.attribute };
    // this.attributeValues = this.sortAttributeValue([...this.exclusiveOffer?.attribute?.values]);
    // this.lastSelectedAttributeAddress = 0;
    // const index = this.attributeValues.findIndex(x => x.isChecked === true);
    // this.attributeValues[index].isChecked = true;
    // this.showVariants(1, index, this.attributeValues[index].value);
    this.variants.forEach(x => {
      x.quantity = 0;
    });
    this.attributeValues.forEach(x => {
      x.isDisabled = false;
    });
  }
  toasterSuccessMessage(message: string, title: string): void {
    this.toastr.success(message, title);
  }
  toasterErrorMessage(message: string, title: string): void {
    this.toastr.error(message, title);
  }
  selectedQty(): number {
    return this.addedProducts.map(x => x.quantity).reduce((a, b) => a + b, 0);
  }
}
