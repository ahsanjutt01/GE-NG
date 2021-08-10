import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { GenericService } from 'src/app/_services/generic.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {
  readonly API_URL = environment.API_URL;
  articles: any;
  constructor(
    private metaTagService: Meta,
    private titleService: Title,
    private genericService: GenericService
  ) { }

  ngOnInit(): void {
    this.genericService.getArticles().subscribe(data => {
      this.articles = data;
    });
    const title = environment.APP_NAME + 'Articles';
    this.titleService.setTitle(title);
    this.metaTagService.updateTag(
      { name: 'description', content: title }
    );
    this.metaTagService.updateTag(
      { name: 'keywords', content: 'vapesuite, articles, vapesuitearticles, suite, article, vape articles, vape' }
    );
  }

}
