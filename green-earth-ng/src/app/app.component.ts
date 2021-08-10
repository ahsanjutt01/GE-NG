import { ViewportScroller } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, RouteConfigLoadStart, RouteConfigLoadEnd, Scroll } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './_services/auth.service';
import { CartService } from './_services/cart/cart.service';
import { GenericService } from './_services/generic.service';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Vapesuite';
  API_URL = environment.API_URL;
  loadingRouteConfig: boolean;
  isCheckoutPage$ = false;
  isEighteePlus = false;
  isErrorPage = false;
  cartServiceSubscription: Subscription;
  newlyProductData = null;
  // previousUrl: string = null;
  // currentUrl: string = null;
  constructor(
    private router: Router,
    private authSerivce: AuthService,
    private genericService: GenericService,
    private cartService: CartService,
    viewportScroller: ViewportScroller
  ) {
    router.events.pipe(
      filter((e: Event): e is Scroll => e instanceof Scroll)
    ).subscribe(e => {
      if (e.position) {
        // backward navigation
        viewportScroller.scrollToPosition(e.position);
      } else if (e.anchor) {
        // anchor navigation
        viewportScroller.scrollToAnchor(e.anchor);
      } else {
        // forward navigation
        viewportScroller.scrollToPosition([0, 0]);
      }
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Show loading indicator
      }

      if (event instanceof NavigationEnd) {
        const url = this.router.url.split('/').filter(x => x !== '');
        if (url[0] === 'category') {
          if (url.length === 2) {
            document.querySelector('footer').classList.add('footer-listpage');
          } else {
            document.querySelector('footer').classList.remove('footer-listpage');
          }
        } else {
          document.querySelector('footer').classList.remove('footer-listpage');
        }
      }

      if (event instanceof NavigationError) {
      }
    });

  }
  ngOnDestroy(): void {
    if (this.cartServiceSubscription) {
      this.cartServiceSubscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    this.isEighteePlus = this.authSerivce.isEighteenPlus();
    this.router.events.subscribe(event => {
      if (event instanceof RouteConfigLoadStart) {
        this.loadingRouteConfig = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.loadingRouteConfig = false;
      }
    });
    this.authSerivce.isCheckoutPage.subscribe(x => {
      this.isCheckoutPage$ = x;
    });
    this.genericService.isErrorPage.subscribe(x => {
      this.isErrorPage = x;
    });
    this.cartServiceSubscription = this.cartService.newlyAddedProduct$.subscribe((x:any) => {
      // debugger;
      this.newlyProductData = x ? {...x} : null;
      if (x) {
        // closeProdModal();
        this.removeToaster();
      }
    });
  }

  onEighteePlus(): void {
    this.authSerivce.setEighteenPlus();
    this.isEighteePlus = true;
  }

  removeToaster(): void {
    setTimeout(() => {
      this.cartService.setNullNewlyAddedProduct$();
    }, 4000);
  }
  onCloseToaster(): void {
    this.cartService.setNullNewlyAddedProduct$();
  }
  onCheckout(): void {
    this.router.navigateByUrl('/checkout');
    this.cartService.setNullNewlyAddedProduct$();
  }
}
