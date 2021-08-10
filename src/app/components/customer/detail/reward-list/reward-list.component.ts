import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { GenericService } from 'src/app/_services/generic.service';

@Component({
  selector: 'app-reward-list',
  templateUrl: './reward-list.component.html',
  styleUrls: ['./reward-list.component.scss']
})
export class RewardListComponent implements OnInit {
  currency: any;
  constructor(
    public genericService: GenericService,
    private store: Store<{ navbar: { settings: any } }>

  ) { }

  ngOnInit(): void {
    this.currency = this.store.select('navbar').pipe(map((x: any) => x.navbar.currency));
  }
}
