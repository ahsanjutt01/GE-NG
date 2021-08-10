
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
// import {Timer} from 'rxjs/observable/timer';
import { Meta, Title } from '@angular/platform-browser';

import { DynamicScriptLoader } from 'src/app/_services/dynamicScriptLoader.service';
import { dealsCarousel } from '../../../assets/js/customJquery';
import { GenericService } from 'src/app/_services/generic.service';
import { environment } from 'src/environments/environment';
import { Home } from 'src/app/_models/home';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { ProductService } from 'src/app/_services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  // @ViewChild('cd', { static: false }) private countdown: CountdownComponent;
  readonly APP_NAME = environment.APP_NAME;
  productmodal = {
    isOpen: false,
    product: null
  };
  title = '';
  isloading = false;
  API_URL: string;
  home: Home;
  isShowModal = false;
  seconds = 0;
  minutes = 0;
  hours = 0;
  days = 0;
  imerObservable: any;
  timerSubscription: any;
  interval: any;
  dealOftheDayEndDate: any;
  difference = 0;
  isOneTabActive = false;
  isDealBannerActive = false;
  subscribtion: Subscription;
  currency = '$';
  propertyName = '';
  dealOFTheDayDiscount = {
    discountInPercentage: 0,
    priceAfterdiscount: 0

  };
  propertyValue = '';
  constructor(
    private genericService: GenericService,
    private productService: ProductService,
    private dynamicScriptLoader: DynamicScriptLoader,
    private metaTagService: Meta,
    private titleService: Title,
    private store: Store<{ navbar: { settings: any } }>
  ) {
    this.API_URL = environment.API_URL;
  }

  ngOnInit(): void {
    // Date.prototype.addDays = function (days) {
    //   this.setDate(this.getDate() + parseInt(days));
    //   return this;
    // };
    this.productService.openCard.subscribe(data => {
      this.productmodal.isOpen = data.isOpen;
      this.productmodal.product = data.product;
    });
    this.loadHomePage();
    this.subscribtion = this.store.select('navbar').pipe(map((x: any) => x.navbar)).subscribe((setting: any) => {
      this.currency = setting.currency;
    });
    this.title = this.APP_NAME + 'Home';
    this.titleService.setTitle(this.title);
    this.metaTagService.updateTag(
      { name: 'description', content: this.title }
    );
    this.metaTagService.updateTag(
      { name: 'keywords', content: 'vapesuite, home, vapesuitehome, suite, products, vape products, listing, vape' }
    );

  }

  loadHomePage(): void {
    const mL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.isloading = true;
    this.genericService.getHomePage().subscribe((result: any) => {
      this.home = result.data;
      dealsCarousel();
      if (this.home.deal_of_the_day.detail) {
        // this.dealOftheDayEndDate = this.home.deal_of_the_day.detail.end_date;
        this.dealOftheDayEndDate = this.home.deal_of_the_day.detail.end_date;
        // this.dealOftheDayEndDate = `${mL[this.dealOftheDayEndDate.getMonth()]} ${this.dealOftheDayEndDate.getDate()}, ${this.dealOftheDayEndDate.getFullYear()} 23:59:59`;
        const countDownDate = new Date(this.dealOftheDayEndDate).getTime();
        const now = new Date().getTime();
        this.difference = countDownDate - now;
        const product = this.home.deal_of_the_day.detail.product;
        this.propertyName = product.properties.find(x => x.property_type === 'below_name')?.property?.name;
        this.propertyValue = product.properties.find(x => x.property_type === 'below_name')?.property_value;
        this.countdownTimeStart();
        this.getAfterdiscoutPrice(this.home?.deal_of_the_day?.detail);
      }
      this.isOneTabActive = this.isAtlestOneTabActive();
      this.isDealBannerActive = this.home?.banner.is_active === 1 ? true : false;
      // this.countdown.begin();
      this.isloading = false;
    }, err => {
    });
  }

  ngAfterViewInit(): void {
  }
  ngOnDestroy(): void {
    if (this.timerSubscription) {
      clearInterval(this.interval);
      this.timerSubscription.unsubscribe();
      this.subscribtion.unsubscribe();
    }
  }

   parseDateString (dateString) {
    let matchers = [];
    matchers.push(/^[0-9]*$/.source);
    matchers.push(/([0-9]{1,2}\/){2}[0-9]{4}( [0-9]{1,2}(:[0-9]{2}){2})?/.source);
    matchers.push(/[0-9]{4}([\/\-][0-9]{1,2}){2}( [0-9]{1,2}(:[0-9]{2}){2})?/.source);
    let newMatchers = new RegExp(matchers.join("|"));
    if (dateString instanceof Date) {
        return dateString;
    }
    if (String(dateString).match(newMatchers)) {
        if (String(dateString).match(/^[0-9]*$/)) {
            dateString = Number(dateString);
        }
        if (String(dateString).match(/\-/)) {
            dateString = String(dateString).replace(/\-/g, "/");
        }
        return new Date(dateString);
    } else {
        throw new Error("Couldn't cast `" + dateString + "` to a date object.");
    }
}

  private countdownTimeStart(): void {
    const countDownDate = this.parseDateString(this.dealOftheDayEndDate).getTime();
      setTimeout(() => {
        const now = new Date().getTime();
        this.difference = countDownDate - now;
        this.hours = Math.floor((this.difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.minutes = Math.floor((this.difference % (1000 * 60 * 60)) / (1000 * 60));
        this.seconds = Math.floor((this.difference % (1000 * 60)) / 1000);
        this.days = Math.floor(this.difference / (1000 * 60 * 60 * 24));
        if (this.difference > 0) {
          this.countdownTimeStart();
        }
      }, 1000);
  }

  open_modal(): void {
    this.isShowModal = true;
  }
  onOpenModel(id): void {
  }
  closeModal(id): void {
  }

  getOldPrice(variants: any): string {
    let price = '0';
    if (variants) {
      price = variants[0].sell_price;
    }
    return price;
  }
  // show on HTML page Deal of the day Discounted Price
  getAfterdiscoutPrice(detail: any): void {
    // let discountedPrice = '0';
    if (detail) {
      if (detail.product) {
        this.dealOFTheDayDiscount.priceAfterdiscount = (detail.product.variants[0].sell_price - detail.discount_price);
        this.dealOFTheDayDiscount.discountInPercentage =
          ((detail.discount_price / detail.product.variants[0].sell_price)) * 100;
      }
    }
    // return discountedPrice;
  }

  // difference between Two Dates in seconds
  getDateDiffInSeconds(startDate, EndDate): number {
    return ((new Date(startDate).getTime() - new Date(EndDate).getTime()) / 1000);
  }
  getDifference(): boolean {
    return this.difference < 0 ? false : true;
  }
  isAtlestOneTabActive(): boolean {
    const filterResult = this.home?.featured_product.tabs.filter(x => x.is_active === 1);
    return (filterResult.length) ? true : false;
  }
}
