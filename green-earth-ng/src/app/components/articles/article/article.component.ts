import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { GenericService } from 'src/app/_services/generic.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {
  readonly API_URL = environment.API_URL;
  pageData: any;
  article: any;
  relatedArticles: any;
  constructor(
    private genericService: GenericService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params?.id;
    this.genericService.getArticleById(id).subscribe(data => {
      this.pageData = data;
      this.article = this.pageData?.article;
      this.relatedArticles = this.pageData?.related;
    });
  }
  setHtml(index: number): any {
    return this.sanitizer.bypassSecurityTrustHtml(this.article.body);
  }

}
