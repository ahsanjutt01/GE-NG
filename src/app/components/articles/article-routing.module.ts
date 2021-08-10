import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticleComponent } from './article/article.component';

import { ArticlesComponent } from './articles.component';

const routes: Routes = [
  { path: '', component: ArticlesComponent },
  {
    path: 'article', children: [
      { path: ':id', component: ArticleComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticlesRoutingModule { }
