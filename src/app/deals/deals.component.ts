import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { GenericService } from '../_services/generic.service';

@Component({
  selector: 'app-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss']
})
export class DealsComponent implements OnInit, OnDestroy {
  deal = null;
  readonly API_URL = environment.API_URL;
  currency = '$';
  subscription: Subscription;
  isloading = false;
  promotionSections = [];
  constructor(
    private genericService: GenericService,
    private metaTagService: Meta,
    private titleService: Title,
    private store: Store<{ navbar: { settings: any } }>
  ) { }

  ngOnInit(): void {
    this.subscription = this.store.select('navbar').pipe(map((x: any) => x.navbar)).subscribe((setting: any) => {
      this.currency = setting.currency;
    });
    this.getDeals();
    const title = environment.APP_NAME + 'Deals';
    this.titleService.setTitle(title);
    this.metaTagService.updateTag(
      { name: 'description', content: title }
    );
    this.metaTagService.updateTag(
      { name: 'keywords', content: 'vapesuite, deals, vapesuitecollectons, suite, colletion, vape collection, vape' }
    );
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  getDeals(): void {
    this.isloading = true;
    this.genericService.getDealsPage().subscribe((dealsData: any) => {
      this.deal = { ...dealsData };
      this.promotionSections = this.deal.promotionSections.filter(x => x.products.length > 0);
      this.isloading = false;
    });
  }
}
