import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/_services/auth.service';
import { GenericService } from 'src/app/_services/generic.service';
import { ProductService } from 'src/app/_services/product.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomerComponent implements OnInit {

  userInfo: any = {};
  reward = null;
  currency = '$';
  transformedAmount = 0;
  readonly APP_NAME = environment.APP_NAME;
  readonly PROFILE = 'profile';
  readonly ADDRESSES = 'addresses';
  title = '';
  constructor(
    private authService: AuthService,
    private metaTagService: Meta,
    private titleService: Title,
    private router: Router,
    private productSerive: ProductService,
    private genericSerive: GenericService,
    private store: Store<{ navbar: { settings: any } }>,
  ) { }

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();
    this.genericSerive.getCustomerRewards(this.userInfo.id);
    this.genericSerive.customerRewardsPoints$.subscribe(x => {
      if (x) {
        this.userInfo.reward_points = x.reward_points;
        this.userInfo.reward_points = x.reward_points;
        this.userInfo.rewards = x.rewards;
        this.authService.setUserInfo(this.userInfo);
        this.updateRewardAmount();
      }
    });
    if (!this.authService.getUserInfo()) {
      this.router.navigateByUrl('/login');
    }
    this.authService.userInfoUpdated.subscribe(x => {
      this.userInfo = this.authService.getUserInfo();
    });
    this.store.pipe(map(x => x.navbar)).subscribe((data: any) => {
      this.currency = data.navbar.currency;
      if (data?.navbar?.reward) {
        this.reward = data.navbar.reward;
        if (this.reward) {
          this.updateRewardAmount();
        }
      }
    });
    this.title = this.APP_NAME + 'Dashboard';
    this.titleService.setTitle(this.title);
    this.metaTagService.updateTag(
      { name: 'description', content: 'vapesuite dashboard' }
    );
    this.metaTagService.updateTag(
      { name: 'keywords', content: 'vapesuite, suite, vapesuite dashboard, vape' }
    );
  }

  updateRewardAmount(): void {
    const amount = (parseInt(this.reward?.redemption_conversion_rate_amount) / parseInt(this.reward?.redemption_conversion_rate_points)) * this.userInfo.reward_points;
    this.transformedAmount = this.productSerive.transFormToNumber(amount);
  }

}
