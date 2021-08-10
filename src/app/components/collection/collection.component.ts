import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductService } from 'src/app/_services/product.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit, OnDestroy {
  collections: any[];
  currency = '$';
  isloading = false;
  subscription: Subscription;
  constructor(
    private productService: ProductService,
    private metaTagService: Meta,
    private titleService: Title,
    private store: Store<{ navbar: { settings: any } }>
  ) {
    this.isloading = true;
   }

  ngOnInit(): void {
    this.subscription = this.store.select('navbar').pipe(map((x: any) => x.navbar)).subscribe((setting: any) => {
      this.currency = setting.currency;
    });
    this.productService.getCollections().subscribe((data: any[]) => {
      this.collections = [...data];
      this.isloading = false;
    });
    const title = environment.APP_NAME + 'Collections';
    this.titleService.setTitle(title);
    this.metaTagService.updateTag(
      { name: 'description', content: title  }
    );
    this.metaTagService.updateTag(
      { name: 'keywords', content: 'vapesuite, collections, vapesuitecollectons, suite, colletion, vape collection, vape' }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
