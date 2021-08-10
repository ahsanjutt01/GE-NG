import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { RestService } from './rest.service';
import { Settings } from '../_models/setting';
import { Home } from '../_models/home';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GenericService {
  openProductDetailModal = new Subject<{ order: any }>();
  _customerRewardsPoints$ = new BehaviorSubject<any>([]);
  _mainSearchResult$ = new BehaviorSubject<any>(null);
  isErrorPage = new Subject<boolean>();

  constructor(private restHttp: RestService) {
  }

  get customerRewardsPoints$(): Observable<any> {
    return this._customerRewardsPoints$.asObservable();
  }
  get mainSearchResult$(): Observable<any> {
    return this._mainSearchResult$.asObservable();
  }
  updateMainSerchResult$(result: any): void {
    this._mainSearchResult$.next(result);
  }

  // sortMainSerchResult$(value): void {
  //   const searchResults = this._mainSearchResult$.getValue();
  //   let sortedResults;
  //   debugger;
  //   if (value === '1') {
  //     sortedResults = searchResults.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  //   } else if (value === '2') {
  //     sortedResults = searchResults.sort((a, b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase()));
  //   }
  // }

  public getHomePage(): Observable<Home> {
    return this.restHttp.getRequest('/api/page/homepage');
  }
  public getDealsPage(): Observable<any> {
    return this.restHttp.getRequest('/api/page/promotion').pipe(map(x => x.data));
  }

  public getSeting(): Observable<Settings> {
    return this.restHttp.getRequest('/api/setting');
  }

  // Main Serach query
  public getMainSearch(keywords: string, ismain = false): Observable<any> {
    if (ismain) {
      return this.restHttp.getRequest(`/api/search?q=${keywords}&is_main=${ismain}`).pipe(map(x => x.data));
    } else {
      return this.restHttp.getRequest(`/api/search?q=${keywords}`).pipe(map(x => x.data));
    }
  }

  public postSubscribe(email: string): Observable<any> {
    return this.restHttp.postRequest('/api/subscribe', { email }, false);
  }
  getOrders(): Observable<any> {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    return this.restHttp.getRequest(`/api/customer/orders/${user.id}`, true).pipe(map(x => x.data));
  }
  getYears(): number[] {
    const currentYear = (new Date()).getFullYear();
    const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));
    return range(currentYear, currentYear - 100, -1);
  }
  // /api/articles
  getArticles(): Observable<any> {
    return this.restHttp.getRequest(`/api/articles`, false).pipe(map(x => x.data));
  }
  // article/:id
  // /api/articles
  getArticleById(id: string): Observable<any> {
    return this.restHttp.getRequest(`/api/article/${id}`, false).pipe(map(x => x.data));
  }
  // all-customers
  // /api/customer/all-customers
  getCustomers(): Observable<any> {
    return this.restHttp.getRequest(`/api/customer/all-customers`, true).pipe(map(x => x.data));
  }
  // all-customers
  // /api/customer/all-customers
  getCustomerAddressById(id: number): Observable<any> {
    return this.restHttp.getRequest(`/api/customer/addresses/${id}`, true).pipe(map(x => x.data));
  }

  // all-customers
  // /api/getCartPayload
  getCartPayload(payloadId: number): Observable<any> {
    return this.restHttp.getRequest(`/api/get-cart-payload/${payloadId}`, true).pipe(map(x => x.data));
  }
  // all-customers
  // /api/getCartPayload
  generateUrl(orderId: string): Observable<any> {
    return this.restHttp.getRequest(`/api/customer/cart-generate-url/${orderId}`, true).pipe(map(x => x.data));
  }

  // all-customers
  // /api/sendCartEmailToCustomer
  sendCartEmailToCustomer(token: string): Observable<any> {
    return this.restHttp.getRequest(`/api/send-cart-email/${token}`, false);
  }
  // getCustomerRewards
  // /api/customer/reward-get
  getCustomerRewards(id: number): void {
    this.restHttp.getRequest(`/api/customer/reward-get/${id}`, true).pipe(map(x => x.data)).subscribe(data => {
      this._customerRewardsPoints$.next(data);
    });
  }
  // post conact us request
  // /api/contact-us
  postContactUS(model: any): Observable<any> {
    return this.restHttp.postRequest(`/api/contact-us`, model).pipe(map(x => x.data));
  }
}
