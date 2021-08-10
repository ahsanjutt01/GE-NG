import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  @Input() searchResults: { suggestions: any[], products: any[], collections: any[], brands: any[], total_products: 0 };
  @Input() currency: string;
  @Input() isShowNoResultValue = false;
  @Input() isLoading = false;
  @Input() queryValue: string;
  @Output() queryValueChange = new EventEmitter<string>();
  readonly API_URL = environment.API_URL;
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
  }
  getProductMinPrice(product: any): number {
    return Math.min(...product.variants.flat().map(x => x.sell_price));
  }
  onSearch(value: string): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate(['search/value'],
        {
          queryParams: { q: value }
        }
      )
    );
    this.queryValueChange.emit(value);
  }
  onProductClick(prodName: string): void {
    this.queryValueChange.emit(prodName);
  }
  onCollectionClick(name: string): void {
    this.queryValueChange.emit(name);
  }
  onBrandClick(name: string): void {
    this.queryValueChange.emit(name);
  }
  onViewAllSearchResults(): void {
    this.router.navigateByUrl('/search-results');
  }

  onViewSearch(value: string): void {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        query: this.queryValue,
        show: value,
        isMain: true,
      },
    };

    // Navigate to the login page with extras
    this.router.navigate(['/search-results'], navigationExtras);
  }
}
