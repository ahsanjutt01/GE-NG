import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Brand } from 'src/app/_models/brand';
import { ProductService } from 'src/app/_services/product.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss'],
})
export class BrandComponent implements OnInit {
  brands: Brand[];
  readonly API_URL = environment.API_URL;
  searchBrand = '';
  constructor(
    private metaTagService: Meta,
    private titleService: Title,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.productService.brands$.subscribe((data: Brand[]) => {
      if (data.length) {
        this.brands = [...data];
        this.onSortChange('1');
      } else {
        this.productService.getBrands();
      }
    });
    const title = environment.APP_NAME + 'Brands';
    this.titleService.setTitle(title);
    this.metaTagService.updateTag({ name: 'description', content: title });
    this.metaTagService.updateTag({
      name: 'keywords',
      content:
        'vapesuite, brands, vapesuitebrands, suite, brand, vape brands, vape',
    });
  }

  onSortChange(value: string): void {
    if (value === '1') {
      this.brands = this.brands.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
    } else if (value === '2') {
      this.brands = this.brands.sort((a, b) =>
        b.name.toLowerCase().localeCompare(a.name.toLowerCase())
      );
    }
  }
}
