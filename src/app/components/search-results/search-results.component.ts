import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GenericService } from 'src/app/_services/generic.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnDestroy {

  searchResult = null;
  API_URL = environment.API_URL;
  subscription: Subscription;
  show = '';
  query = '';
  constructor(
    public genericService: GenericService,
    private activatedRoute: ActivatedRoute
  ) { }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.genericService.updateMainSerchResult$(null);
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.show = params.show;
      this.query = params.query;
      const isMain = params.isMain;
      this.subscription = this.genericService.getMainSearch(this.query, isMain).subscribe(x => {
        this.genericService.updateMainSerchResult$(x);
      });
    });
  }

  // onSortChange(value: string): void {
  // this.genericService.updateMainSerchResult$(value);
  // }
}
