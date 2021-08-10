import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit {
  APP_NAME = environment.APP_NAME;
  constructor(
    private metaTagService: Meta,
    private titleService: Title,
  ) { }

  ngOnInit(): void {
    let title = '';
    title = this.APP_NAME + 'Faqs';
    this.titleService.setTitle(title);
    this.metaTagService.updateTag(
      { name: 'description', content: title }
    );
    this.metaTagService.updateTag(
      { name: 'keywords', content: 'vapesuite, faqs, home, vapesuitehome, suite, products, vape products, listing, vape' }
    );
  }

}
