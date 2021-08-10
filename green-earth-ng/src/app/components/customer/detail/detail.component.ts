import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { WishListCount } from 'src/app/_models/customerMenuCount';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DetailComponent implements OnInit, OnDestroy {
  customerMenuCounts: WishListCount;
  menuSubscription: Subscription;
  userInfo = null;
  constructor(
    private authService: AuthService
  ) { }
  ngOnDestroy(): void {
    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();
    this.menuSubscription = this.authService.customerMenuCounts$.subscribe(x => {
      this.customerMenuCounts = x;
    });
    this.authService.user$.subscribe((x: any) => {
      if (x) {
        this.userInfo = { ...x.data };
      }
    });
  }

}
