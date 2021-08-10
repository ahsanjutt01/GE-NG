import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  OnDestroy,
  QueryList,
  HostListener,
  ViewEncapsulation,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationStart,
  Router,
  Scroll,
} from '@angular/router';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { NouisliderComponent } from 'ng2-nouislider';
import { Observable, Subject, Subscription } from 'rxjs';

import { ProductService } from 'src/app/_services/product.service';
import { environment } from '../../../../environments/environment';
import {
  owl_Sub_Category,
  filtersSideBarClose,
} from '../../../../assets/js/customJquery.js';
import { map } from 'rxjs/operators';
import { GenericService } from 'src/app/_services/generic.service';
import { OwlOptions } from 'ngx-owl-carousel-o';

const FILTER_OBJECT = {
  refinedFilter: [],
  selectedBrands: [],
  selectedOfers: [],
  minPrice: null,
  maxPrice: null,
  subCategoryId: 0,
  pageNumber: 1,
  scrollY: 0,
  isPriceRangeChanged: false,
  ppId: null,
  selectedSubcateory: null,
};

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductsListComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly FILTERS_REFINED = 'filtersRefinded';
  // private fromCache = false;
  appCurrency: Observable<{ footer: any }>;
  effect = Array(10).fill(1);
  subCategoryLoaded = true;
  isNoProducts = false;
  isFirstReqComplete = new Subject<boolean>();
  nextFecthedresult: any;
  onFirstLoad = true;
  isFilter = false;
  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: false,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    autoWidth: true,
    navSpeed: 700,
    navText: [
      "<i class='fa fa-chevron-left'></i>",
      "<i class='fa fa-chevron-right'></i>",
    ],
    responsive: {
      0: {
        items: 2,
      },
      375: {
        items: 3,
      },
      600: {
        items: 3,
      },
      1200: {
        items: 8,
      },
      1600: {
        items: 12,
      },
    },
    nav: true,
  };
  readonly BRANDS = 'brands';
  readonly PERMOTIONS = 'permotions';
  readonly SUB_CATEGORY = 'subCategory';
  readonly APP_NAME = environment.APP_NAME;
  discriptionHtml: any;
  routeSubscription: Subscription;
  moduleName = '';
  queryParams = {
    isSearch: false,
    queryParam: '',
  };
  isViewMoreDesc = false;
  title = '';
  innerWidth: any;
  isLoadMoreClicked = false;
  searchBrand: string;
  sortvalue = '0';
  searchBrandMobile: string;
  loadMoreBtnIsDisabled = false;
  isloading = false;
  isShowModal = false;
  isOnFilterChnage = false;
  props = [];
  propsCopy = [];
  isloadingSidebar = false;
  category: string;
  listing: any;
  product: any;
  filtersRefinded = [];
  minValue = 0;
  maxValue = 1000;
  ppId = '';
  selectedSubcateory = 'All';
  selectedSubcateoryId = 0;
  selectedBrands = [];
  selectedOffers = [];
  brands = [];
  sortedProducts = [];
  firstLoad = false;
  pageNumber = 1;
  priceRangeUpdate: any;
  sidebarProps = [];
  propinputChanged = false;
  isPriceRangeChanged = false;
  limit = 20;
  isSearching = false;
  searchResults: any;
  isShowNoResultValue = false;
  queryValue = '';
  priceRangeConfig: any = {
    connect: true,
    behaviour: 'tap',
    margin: 1,
    start: [0, 1000],
    // limit: 1000, // NOTE: overwritten by [limit]="10"
    step: 0.1,
    pageSteps: 10,
    range: {
      min: 0,
      max: 1000,
    },
    pips: {
      mode: 'count',
      density: 2,
      values: 5,
      stepped: true,
    },
  };
  search = {};
  curr = '';
  API_URL = '';
  isShowDescription = false;
  sub: Subscription;

  @ViewChild('sliderRefMobile') public sliderRefMobile: NouisliderComponent;
  @ViewChild('sliderRefDesktop') public sliderRefDesktop: NouisliderComponent;

  public someKeyboard2: number[] = [1, 3];

  // @HostListener('window:scroll', ['$event'])
  onWindowScroll(isEnd = false): void {
    if (isEnd === true) {
      this.load_more();
    }
  }

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private genericService: GenericService,
    private metaTagService: Meta,
    private titleService: Title,
    private sanitizer: DomSanitizer,
    private router: Router,
    private store: Store<{ navbar: { settings: any } }>
  ) {
    this.API_URL = environment.API_URL;
    // router.events
    //   .subscribe((event: NavigationStart) => {
    //     if (event.navigationTrigger === 'popstate') {
    //       // Perform actions
    //       this.fromCache = true;
    //     }
    //   });
  }

  getLocalFilter(): void {
    const localFilter = localStorage.getItem(this.FILTERS_REFINED);
    if (localFilter) {
      const localFilterParsed = JSON.parse(localFilter);
      if (localFilterParsed.refinedFilter.length) {
        this.filtersRefinded = localFilterParsed.refinedFilter;
        this.selectedBrands = localFilterParsed.selectedBrands;
        this.selectedOffers = localFilterParsed.selectedOfers;
        this.ppId = localFilterParsed.ppId;
        this.selectedSubcateoryId = localFilterParsed.subCategoryId;
        this.isPriceRangeChanged = localFilterParsed.isPriceRangeChanged;
        this.minValue = localFilterParsed.minPrice;
        this.maxValue = localFilterParsed.maxPrice;
        this.selectedSubcateory = localFilterParsed.selectedSubcateory;
      }
    }
  }
  ngOnInit(): void {
    this.isFirstReqComplete.subscribe(() => {
      if (this.loadMoreBtnIsDisabled) {
        this.pageNumber += 1;
        this.onFileterChanged(false, true);
      }
    });
    this.init();
    this.loadjuery();
  }

  init(): void {
    this.appCurrency = this.store
      .select('navbar')
      .pipe(map((x: any) => x.navbar.currency));
    this.sub = this.store
      .select('navbar')
      .pipe(map((x: any) => x.navbar.currency))
      .subscribe((x) => {
        this.curr = x;
      });

    this.loadMoreBtnIsDisabled = false;
    this.isloading = true;
    this.firstLoad = true;

    this.routeSubscription = this.route.params.subscribe((params) => {
      // this.addNoScroll();
      // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      // const body = document.getElementsByTagName('body')[0];
      // // body.classList.remove('scroll-down');
      // body.classList.add('no-scroll-body');
      // document.body.classList.add('viewport');
      // this.addNoScroll();
      this.subCategoryLoaded = false;
      // this.ngOnInit();
      this.initalizeValues();
      this.moduleName = this.router.url.split('/')[1];
      this.category = params.id || 0;
      // const newRouterLink = '/category/' + this.category;
      // this.router.navigate(['/']).then(() => { this.router.navigate([newRouterLink]); });
      // ============Query Pram SubId=============
      this.route.queryParams.subscribe((queryParams) => {
        if (queryParams.isFilter) {
          this.isFilter = queryParams.isFilter;
        }
        if (queryParams.q) {
          this.queryParams.isSearch = true;
          this.queryParams.queryParam = queryParams.q;
        }
        let paramSubId = queryParams?.subId || 0;
        paramSubId = parseInt(paramSubId);
        if (paramSubId > 0) {
          this.selectedSubcateoryId = paramSubId;
          const subCateg = this.listing?.category?.sub_categories?.find(
            (x) => x.id === this.selectedSubcateoryId
          );
          this.selectedSubcateory = queryParams?.subCategory;
          if (!(queryParams?.from === 'main')) {
            this.onSubCategoryChange(
              this.selectedSubcateoryId,
              subCateg?.category_name
            );
          }
          if (queryParams?.from) {
            this.router.navigate([], {
              queryParams: {
                from: null,
              },
              queryParamsHandling: 'merge',
            });
          }
        }
      });

      if (this.isFilter) {
        this.getLocalFilter();
      }

      this.onFileterChanged(true);
      if (!(this.selectedSubcateoryId > 0)) {
        this.selectedSubcateory = 'All';
        this.selectedSubcateoryId = 0;
      }
      if (this.queryParams.isSearch) {
        this.title = this.APP_NAME + 'Search';
      } else {
        this.title = this.APP_NAME + this.category;
      }
      this.titleService.setTitle(this.title);
      this.metaTagService.updateTag({
        name: 'description',
        content: this.category,
      });
      this.metaTagService.updateTag({
        name: 'keywords',
        content: 'vapesuite, suite, products, vape products, listing, vape',
      });
    });
    // ============Query Pram SubId=============
    this.route.queryParams.subscribe((queryParams) => {
      let paramSubId = queryParams?.subId || 0;
      paramSubId = parseInt(paramSubId);
      if (paramSubId > 0) {
        this.selectedSubcateoryId = paramSubId;
        this.selectedSubcateory = queryParams?.subCategory;
        // this.onSubCategoryChange(this.selectedSubcateoryId, this.selectedSubcateory);
      }
    });
    this.onFirstLoad = false;
  }

  ngAfterViewInit(): void {
    this.addNoScroll();
  }

  addNoScroll(): void {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('no-scroll');
    body.classList.add('no-scroll-body');
  }

  loadjuery(): void {
    setTimeout(() => {
      owl_Sub_Category();
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
  initalizeValues(): void {
    // this.isNoProducts = false;
    this.addNoScroll();
    this.nextFecthedresult = null;
    this.isFilter = false;
    this.isShowDescription = false;
    this.discriptionHtml = null;
    this.queryParams.isSearch = false;
    this.queryParams.queryParam = '';
    this.routeSubscription = null;
    this.moduleName = '';
    this.title = '';
    this.queryValue = '';
    this.isSearching = false;
    this.searchResults = {};
    this.isShowNoResultValue = false;
    this.searchBrand = '';
    this.searchBrandMobile = '';
    this.loadMoreBtnIsDisabled = false;
    this.isloading = false;
    this.isShowModal = false;
    this.isOnFilterChnage = false;
    this.props = [];
    this.propsCopy = [];
    this.isloadingSidebar = false;
    this.category = '';
    this.listing = null;
    this.product = null;
    this.filtersRefinded = [];
    this.minValue = 0;
    this.maxValue = 1000;
    this.ppId = '';
    this.selectedSubcateory = 'All';
    this.selectedSubcateoryId = 0;
    this.selectedBrands = [];
    this.selectedOffers = [];
    this.brands = [];
    this.sortedProducts = [];
    this.firstLoad = false;
    this.pageNumber = 1;
    this.priceRangeUpdate = null;
    this.sidebarProps = [];
    this.propinputChanged = false;
  }

  updateQueryString(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { isFilter: true },
      queryParamsHandling: 'merge',
    });
  }
  // =============================SORT CHANGE======================

  onSortChange(value: string): void {
    if (value === '1') {
      this.sortProducts();
      this.sortvalue = value;
      // this.sortedProducts
    } else if (value === '2') {
      this.sortvalue = value;
      this.sortProducts();
      this.sortedProducts.reverse();
    } else {
      this.sortvalue = '0';
      this.sortedProducts = this.product?.result?.products?.data;
    }
  }

  // sort product by price
  sortProducts(): void {
    if (this.sortedProducts.length) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.sortedProducts.length; i++) {
        const sortedVariants = this.sortedProducts[i].variants.sort(
          (a, b) => a.sell_price - b.sell_price
        );
        this.sortedProducts[i].variants = sortedVariants;
        this.sortedProducts[i].price = sortedVariants[0].sell_price;
      }
      this.sortedProducts = [
        ...this.sortedProducts.sort((a, b) => a.price - b.price),
      ];
    }
  }
  // =============================END SORT CHANGE======================

  // =============================SUB CATEGORY CHANGE======================

  onSubCategoryChange(subId: number, name: string): void {
    // if (this.selectedSubcateoryId === subId) {
    //   return;
    // }
    this.sortedProducts = [];
    this.props = [];
    this.selectedSubcateory = name;
    this.selectedSubcateoryId = subId;
    this.pageNumber = 1;
    if (!this.onFirstLoad) {
      this.onFileterChanged(true);
    }
    if (subId > 0) {
      this.removeSubCategory();
      this.filterRefined(
        { id: subId, property_value: name, prop_Name: this.SUB_CATEGORY },
        this.SUB_CATEGORY
      );
    } else {
      this.selectedSubcateoryId = 0;
      this.removeSubCategory();
    }
    this.loadjuery();
  }
  removeSubCategory(): void {
    const subCatIndex = this.filtersRefinded.findIndex(
      (x) => x.prop_Name === this.SUB_CATEGORY
    );
    if (subCatIndex > -1) {
      this.removeFiltersRefinedItem(subCatIndex, this.SUB_CATEGORY);
    }
  }

  // =============================END SUB CATEGORY CHANGE======================

  // =============================BRANDS CHANGE======================
  brandInputSearch(brand: string): void {
    if (this.listing && this.listing.brands) {
      if (brand) {
        this.brands = this.listing.brands.filter(
          (x) => x.name.toLowerCase().indexOf(brand.toLowerCase()) > -1
        );
      } else {
        this.brands = this.listing.brands;
      }
    }
  }
  onBrandInputChanged(brand: any, event: any): void {
    this.sortedProducts = [];
    this.propinputChanged = true;
    this.pageNumber = 1;
    if (event.target.checked) {
      this.selectedBrands.push(brand);
      this.onRefindFiltersChange(brand.id, this.BRANDS, brand.name);
    } else {
      this.selectedBrands.splice(
        this.selectedBrands.findIndex((x) => x.id === brand.id),
        1
      );
      this.onFiltersRefindSplice(
        this.filtersRefinded.findIndex(
          (x) => x.id === brand.id && x.prop_Name === this.BRANDS
        )
      );
    }
    this.propCheckedUnchecked(brand, this.PERMOTIONS);
    this.onFileterChanged();
  }

  // =============================END BRANDS CHANGE======================

  // ============================= LOAD PRODUCTS======================

  loadProductProps(category: string): void {
    this.isloadingSidebar = true;
    this.productService.getProductProps(category).subscribe(
      (result: any) => {
        this.listing = { ...result.data };
        this.listing.brands = this.transformOffersAndBrands(
          [...this.listing.brands],
          this.BRANDS
        );
        this.brands = [...this.listing.brands];
        this.listing.promotions = this.transformOffersAndBrands(
          [...this.listing.promotions],
          this.PERMOTIONS
        );

        // setting price range initially
        if (result.data.price_range != null) {
          this.initilize_price_slider(this.listing);
        }

        this.listing.category.sub_categories.unshift({
          id: 0,
          category_name: 'All',
          main_category_id: 3,
          attribute_id: '0',
          property_id: '0',
        });
        this.arrangingProps(this.listing.props);
        this.isloadingSidebar = false;
        if (this.listing.price_range) {
          this.minValue = this.listing.price_range.from;
          this.maxValue = this.listing.price_range.to;
        }
      },
      (err) => {}
    );
  }

  sortingProps(): void {
    const propsLength = this.props.length;
    if (propsLength) {
      const PROPS = [...this.props];
      for (let i = 0; i < propsLength; i++) {
        this.props[i].values = PROPS[i].values.sort(
          (a, b) => b.total_products - a.total_products
        );
      }
    }
  }

  initilize_price_slider(data): void {
    this.minValue = data.from || 0;
    this.maxValue = data.to || 0;
    const conf = {
      connect: true,
      behaviour: 'tap',
      start: [this.minValue, this.maxValue],
      range: {
        min: [this.minValue],
        max: [this.maxValue],
      },
    };
    this.sliderRefDesktop.slider.updateOptions(conf, true);
    this.sliderRefMobile.slider.updateOptions(conf, true);
  }
  // =============================END LOAD PRODUCTS======================

  arrangingProps(properties: any): void {
    if (properties.length) {
      for (const prop of properties) {
        const propObj = { id: prop.id, name: prop.name, values: [] };
        for (const value of prop.values) {
          propObj.values.push({
            id: value.id,
            property_value: value.property_value,
            total_products: value.total_products,
            prop_Name: prop.name,
            isChecked: false,
          });
        }
        this.props.push(propObj);
      }
      if (this.filtersRefinded.length) {
        for (const value of this.filtersRefinded) {
          // loop2:
          for (const propIndex in this.props) {
            if (this.props[propIndex].name === value.prop_Name) {
              for (const index in this.props[propIndex].values) {
                if (
                  this.props[propIndex].values[index].property_value ===
                  value.property_value
                ) {
                  this.props[propIndex].values[index].isChecked = true;
                  // break loop2;
                }
              }
            }
          }
        }
      }
      this.sortingProps();
    }
    this.propsCopy = [...this.props];
  }

  // =============================PROP CHECKED/UNCHECKEd INPUT=========================

  onInputChanged(value: any, propName: string): void {
    this.isOnFilterChnage = true;
    this.sortedProducts = [];
    this.propinputChanged = true;
    this.pageNumber = 1;
    if (propName === undefined) {
      propName = value.prop_Name;
    }
    this.filterRefined(value, propName);
    this.propCheckedUnchecked(value);
    this.onFileterChanged();
  }
  // =============================END PROP CHECKED/UNCHECKEd INPUT=========================

  // =============================PROP CHECKED/UNCHECKEd REMOVE=========================

  // transform offers and brands
  transformOffersAndBrands(arr: any, propType): any {
    if (propType === this.BRANDS) {
      arr = [...arr.sort((a, b) => b.total_products - a.total_products)];
      const transformedBrands = arr.map((x) => ({
        id: x.id,
        name: x.name,
        isChecked: false,
        type: propType,
        total_products: x.total_products,
      }));
      if (this.selectedBrands.length) {
        for (const value of this.selectedBrands) {
          loop2: for (const index in transformedBrands) {
            if (transformedBrands[index].id === value.id) {
              transformedBrands[index].isChecked = true;
              break loop2;
            }
          }
        }
      }
      return transformedBrands;
    } else {
      return arr.map((x) => ({
        id: x.id,
        title: x.title,
        isChecked: false,
        type: propType,
        total: x.total,
      }));
    }
  }
  transformOffers(arr: any, propType): any {
    if (propType === this.PERMOTIONS) {
      // arr = [...arr.sort((a, b) => b.total_products - a.total_products)];
      const transformedOffers = arr.map((x) => ({
        id: x.id,
        title: x.title,
        isChecked: false,
        type: propType,
        total_products: x.total_products,
      }));
      if (this.selectedOffers.length) {
        for (const value of this.selectedOffers) {
          loop2: for (const index in transformedOffers) {
            if (transformedOffers[index].id === value.id) {
              transformedOffers[index].isChecked = true;
              break loop2;
            }
          }
        }
      }
      return transformedOffers;
    } else {
      return arr.map((x) => ({
        id: x.id,
        title: x.title,
        isChecked: false,
        type: propType,
        total: x.total,
      }));
    }
  }
  filterRefined(value: any, propName: string): void {
    const filtersRefinedValue = this.filtersRefinded.find(
      (x) =>
        x.property_value === value.property_value && x.prop_Name === propName
    );
    if (filtersRefinedValue) {
      const index = this.filtersRefinded.findIndex(
        (x) => x.property_value === filtersRefinedValue.property_value
      );
      this.onFiltersRefindSplice(index);
      this.updatePPID();
    } else {
      this.onRefindFiltersChange(
        value.id,
        value.prop_Name,
        value.property_value
      );
      this.updatePPID();
    }
  }
  updatePPID(): void {
    this.ppId = this.filtersRefinded
      .filter(
        (x) =>
          x.prop_Name !== this.BRANDS &&
          x.prop_Name !== this.PERMOTIONS &&
          x.prop_Name !== this.SUB_CATEGORY
      )
      .map((x) => x.id)
      .toString();
  }
  propCheckedUnchecked(value: any, propName = ''): void {
    if (propName === this.BRANDS) {
      for (const index in this.listing.brands) {
        if (this.listing.brands[index].name === value.name || value.prop_Name) {
          this.listing.brands[index].isChecked = !this.listing.brands[index]
            .isChecked;
          break;
        }
      }
    } else {
      if (propName === this.PERMOTIONS) {
        for (const index in this.listing.promotions) {
          if (
            this.listing.promotions[index].title === value.title ||
            value.prop_Name
          ) {
            this.listing.promotions[index].isChecked = !this.listing.promotions[
              index
            ].isChecked;
            break;
          }
        }
      } else {
        if (this.ppId.length) {
          const propArrLength = this.props.length;
          loop: for (let i = 0; i < propArrLength; i++) {
            for (const index in this.props[i].values) {
              if (
                this.props[i].values[index].property_value ===
                value.property_value
              ) {
                this.props[i].values[index].isChecked = !this.props[i].values[
                  index
                ].isChecked;
                break loop;
              }
            }
          }
        }
      }
    }
  }

  onPropSearch(propName: string, value: string): void {
    if (!value) {
      if (this.listing.props.length) {
        this.propsCopy = [];
        this.props = [];
        for (const prop of this.listing.props) {
          const propObj = { id: prop.id, name: prop.name, values: [] };
          for (const item of prop.values) {
            propObj.values.push({
              id: item.id,
              property_value: item.property_value,
              total_products: item.total_products,
              isChecked: false,
            });
          }
          this.props.push(propObj);
        }
      }
      this.propsCopy = [...this.props];
      this.isloadingSidebar = false;
      this.filtersRefinded = [];
      this.onFileterChanged();
    } else {
      for (const index in this.props) {
        if (this.props[index].name === propName) {
          this.props[index].values = [...this.propsCopy][index].values.filter(
            (x) =>
              x.property_value.toLowerCase().indexOf(value.toLowerCase()) > -1
          );
        }
      }
    }
  }
  // =============================END PROP CHECKED/UNCHECKEd REMOVE=========================

  // =============================CLEAR FILTERS REFINED=========================

  clearRefiendFilters(): void {
    if (this.filtersRefinded.length) {
      this.filtersRefinded = [];
      this.pageNumber = 1;
      this.props = [];
      this.sortedProducts = [];
      // this.brands = this.listing.brands;
      // if (this.listing?.promotions?.length) {
      //   const promotionsLength = this.listing?.promotions?.length;
      //   for (let i = 0; i < promotionsLength; i++) {
      //     this.listing.promotions[i].isChecked = false;
      //   }
      // }
      // this.arrangingProps(this.listing.props);
      // for (const prop of this.props) {
      //   const propsLength = prop.values.length;
      //   for (let i = 0; i < propsLength; i++) {
      //     prop.values[i].isChecked = false;
      //   }
      // }
      this.ppId = '';
      this.selectedSubcateory = 'All';
      this.selectedSubcateoryId = 0;
      this.selectedBrands = [];
      this.selectedOffers = [];
      this.onFileterChanged();
    }
  }

  // =============================END CLEAR FILTERS REFINED=========================

  // =============================FILTER REFINED REMOVE=========================
  removeRefinedItem(index: number, propName: string): void {
    if (propName === this.PERMOTIONS) {
      this.selectedOffers = this.selectedOffers.filter(
        (x) => x.title !== this.filtersRefinded[index].property_value
      );
    } else {
      if (propName === this.BRANDS) {
        this.selectedBrands = this.selectedBrands.filter(
          (x) => x.name !== this.filtersRefinded[index].property_value
        );
      } else if (propName === this.SUB_CATEGORY) {
        this.selectedSubcateoryId = 0;
      }
    }
    this.removeFiltersRefinedItem(index, propName);
    this.updatePPID();
    this.onFileterChanged();
  }
  removeFiltersRefinedItem(index: number, propName: string): void {
    this.sortedProducts = [];
    const value = this.filtersRefinded[index];
    this.propCheckedUnchecked(value, propName);
    this.onFiltersRefindSplice(index);
  }
  // =============================END FILTER REFINED REMOVE=========================

  // =============================FILTER CHANGE=========================

  onFileterChanged(isLoader = true, isNextFecthCall = false): void {
    this.isloading = isLoader;
    this.innerWidth = window.innerWidth;
    filtersSideBarClose();

    if (this.innerWidth <= 1366 && this.innerWidth >= 768) {
      this.limit = 21;
    } else {
      this.limit = 20;
    }
    let productsSubscription: Subscription;
    if (productsSubscription) {
      productsSubscription.unsubscribe();
    }
    this.updateFiltersInLocalStorage();
    productsSubscription = this.productService
      .getProduts(
        // this.fromCache,
        this.moduleName,
        this.category,
        this.isPriceRangeChanged ? `${this.minValue}-${this.maxValue}` : '',
        this.ppId,
        this.selectedSubcateoryId,
        this.selectedBrands,
        this.selectedOffers,
        this.pageNumber,
        this.limit,
        this.queryParams
      )
      .subscribe(
        (result: any) => {
          this.isloading = false;
          // if (!this.fromCache) {
          //   this.productService.setCachedProducts(result);
          // }
          // this.sortedProducts = [];
          const body = document.getElementsByTagName('body')[0];
          body.classList.remove('no-scroll');
          body.classList.remove('no-scroll-body');
          if (!isNextFecthCall) {
            this.sortedProducts = [];
            this.props = [];
            this.updatePage(result);
            this.subCategoryLoaded = true;
            this.isNoProducts =
              result.data.result.products.data?.length > 0 ? false : true;
            this.isFirstReqComplete.next(true);
          } else {
            this.nextFecthedresult = result;
          }
          this.loadjuery();
        },
        (err) => {}
      );
  }
  setCategories(subCategories: any): void {
    this.listing = { category: { sub_categories: subCategories } };
    this.listing.category.sub_categories.unshift({
      id: 0,
      category_name: 'All',
      main_category_id: 3,
      attribute_id: '0',
      property_id: '0',
    });
  }

  // upadate when get new result from api
  updatePage(result: any): void {
    if (this.moduleName === 'brand') {
      this.titleService.setTitle(this.APP_NAME + result.data.result.title);
    }
    if (this.moduleName === 'promotion') {
      this.titleService.setTitle(this.APP_NAME + result.data.result.title);
    }
    if (this.moduleName === 'collection') {
      this.titleService.setTitle(this.APP_NAME + result.data.result.title);
    }
    if (!this.listing) {
      this.setCategories(result.data.filters.data.sub_categories);
    }
    if (this.sortedProducts.length) {
      // this.product = result.data;
      if (this.pageNumber > 1) {
        this.sortedProducts.push(...result.data.result.products.data);
      } else {
        this.sortedProducts = [
          ...this.sortedProducts,
          ...result.data.result.products.data,
        ];
      }
    } else {
      const products = [...result.data.result.products.data];
      this.sortedProducts = products;
      result.data.result.products.data = products;
      this.product = result.data;
    }
    if (
      result.data.result.products == null ||
      result.data.result.products.next_page_url === null
    ) {
      this.loadMoreBtnIsDisabled = false;
    } else {
      this.loadMoreBtnIsDisabled = true;
    }
    // setting price range initially
    if (result.data.filters.data.price_range != null) {
      this.initilize_price_slider({ ...result.data.filters.data.price_range });
      this.listing.price_range = { ...result.data.filters.data.price_range };
    }
    this.isOnFilterChnage = false;
    // filters props
    if (result.data.filters?.data?.props) {
      if (this.propinputChanged || this.selectedSubcateoryId >= 0) {
        if (
          result.data.filters.data?.props?.length ||
          this.selectedSubcateoryId >= 0
        ) {
          this.sidebarProps = [...result.data.filters?.data?.props];
          this.props = [];
        }
        if (result.data.filters.data.brands?.length) {
          this.brands = this.transformOffersAndBrands(
            [...result.data.filters.data.brands],
            this.BRANDS
          );
        }
        if (result.data.filters.data.promotions) {
          this.listing.promotions = this.transformOffers(
            [...result.data.filters.data.promotions],
            this.PERMOTIONS
          );
        }
        this.arrangingProps([...this.sidebarProps]);
        this.propinputChanged = false;
        this.isPriceRangeChanged = false;
      }
    }
    this.firstLoad = false;
    this.onSortChange(this.sortvalue);
    this.isLoadMoreClicked = false;
    this.setHtml();
    // this.nextFecthedresult = null;
  }
  // =============================END FILTER PROP CHANGE=========================

  // =============================PRICE CHANGE=========================

  onChangePrice(e): void {
    if (this.filtersRefinded.length) {
      const index = this.filtersRefinded.findIndex((x) => x.id === 0);
      if (index > -1) {
        this.onFiltersRefindSplice(index);
      }
      this.maxValue = 0;
      this.minValue = 0;
    }
    // setTimeout(() => {
    this.isPriceRangeChanged = true;
    this.sortedProducts = [];
    this.minValue = e[0];
    this.maxValue = e[1];
    this.onFileterChanged();
    if (this.minValue && this.maxValue) {
      this.onRefindFiltersChange(
        0,
        'Price',
        this.curr + this.minValue + '-' + this.curr + this.maxValue
      );
    }

    // }, 500);
  }

  onMinPriceChange(value: number): void {
    this.minValue = value;
    this.sortedProducts = [];
    this.onFileterChanged();
  }
  onMaxPriceChange(value: number): void {
    this.maxValue = value;
    this.sortedProducts = [];
    this.onFileterChanged();
  }
  // =============================END PRICE CHANGE=========================

  // =============================OFFER CHANGE=========================

  onOfferInputChanged(offer: any, event: any): void {
    this.sortedProducts = [];
    this.propinputChanged = true;
    this.pageNumber = 1;
    if (event.target.checked) {
      this.selectedOffers.push(offer);
      this.onRefindFiltersChange(offer.id, this.PERMOTIONS, offer.title);
    } else {
      this.selectedOffers.splice(
        this.selectedOffers.findIndex((x) => x.id === offer.id),
        1
      );
      this.onFiltersRefindSplice(
        this.filtersRefinded.findIndex(
          (x) => x.id === offer.id && x.prop_Name === this.PERMOTIONS
        )
      );
    }
    this.propCheckedUnchecked(offer, this.PERMOTIONS);
    this.onFileterChanged();
  }
  // =============================END OFFER CHANGE=========================
  showModal(): void {
    this.isShowModal = true;
  }

  onRefindFiltersChange(
    fId: number,
    propName: string,
    propValue: string
  ): void {
    this.filtersRefinded.push({
      id: fId,
      prop_Name: propName,
      property_value: propValue,
    });
    this.updateQueryString();
    // this.updateFiltersInLocalStorage();
  }
  updateFiltersInLocalStorage(): void {
    FILTER_OBJECT.refinedFilter = this.filtersRefinded;
    FILTER_OBJECT.selectedBrands = this.selectedBrands;
    FILTER_OBJECT.selectedOfers = this.selectedOffers;
    FILTER_OBJECT.ppId = this.ppId;
    FILTER_OBJECT.subCategoryId = this.selectedSubcateoryId;
    FILTER_OBJECT.isPriceRangeChanged = this.isPriceRangeChanged;
    FILTER_OBJECT.minPrice = this.minValue;
    FILTER_OBJECT.maxPrice = this.maxValue;
    FILTER_OBJECT.selectedSubcateory = this.selectedSubcateory;

    localStorage.setItem(this.FILTERS_REFINED, JSON.stringify(FILTER_OBJECT));
  }
  onFiltersRefindSplice(index: number): void {
    this.filtersRefinded.splice(index, 1);
    // this.updateFiltersInLocalStorage();
  }
  load_more(): void {
    if (this.sortedProducts.length < this.product?.filters?.totalProducts) {
      if (this.nextFecthedresult) {
        this.isLoadMoreClicked = true;
        if (this.nextFecthedresult?.data?.result?.products?.data?.length > 0) {
          this.updatePage(this.nextFecthedresult);
        }
        if (this.nextFecthedresult?.data?.result?.products.next_page_url) {
          this.pageNumber += 1;
          this.nextFecthedresult = null;
          this.onFileterChanged(false, true);
        } else {
          this.nextFecthedresult = null;
        }
      }
    }
  }
  onSearching(value: string): void {
    if (value.length > 0) {
      this.isSearching = true;
      this.genericService
        .getMainSearch(value.toLowerCase())
        .subscribe((result: any) => {
          this.searchResults = { ...result };
          if (
            this.searchResults?.suggestions.length ||
            this.searchResults?.products.length ||
            this.searchResults?.collections.length ||
            this.searchResults?.brands.length
          ) {
            this.isShowNoResultValue = false;
            this.queryValue = '';
          } else {
            this.isShowNoResultValue = true;
            this.queryValue = value;
          }
        });
    } else {
      this.isSearching = false;
    }
  }
  removeSearching(): void {
    this.isSearching = false;
  }
  setHtml(): any {
    if (this.product?.result?.description) {
      this.isShowDescription =
        JSON.parse(this.product?.result?.description).length > 0 ? true : false;

      // this.discriptionHtml = this.sanitizer.bypassSecurityTrustHtml(
      //   JSON.parse(this.product?.result?.description)
      // );
      /**
       * Added by adeel
       */
      this.discriptionHtml = JSON.parse(this.product?.result?.description);
    }
  }
  onViewMoreDesc(): void {
    this.isViewMoreDesc = !this.isViewMoreDesc;
  }
}
