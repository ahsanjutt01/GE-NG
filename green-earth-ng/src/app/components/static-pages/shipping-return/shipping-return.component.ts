import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-shipping-return',
  templateUrl: './shipping-return.component.html',
  styleUrls: ['./shipping-return.component.scss']
})
export class ShippingReturnComponent implements OnInit {
  APP_NAME = environment.APP_NAME;
  constructor(
    private metaTagService: Meta,
    private titleService: Title,
  ) { }

  ngOnInit(): void {
    let title = '';
    title = this.APP_NAME + 'Shiping Return';
    this.titleService.setTitle(title);
    this.metaTagService.updateTag(
      { name: 'description', content: title }
    );
    this.metaTagService.updateTag(
      { name: 'keywords', content: 'vapesuite, Shiping Return, faqs, home, vapesuitehome, suite, products, vape products, listing, vape' }
    );
  }

}
