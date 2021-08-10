import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { RestService } from './rest.service';
import { environment } from 'src/environments/environment';
import { WishListCount } from '../_models/customerMenuCount';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  paymentGateway$ = new Subject<any>();
  _user$ = new BehaviorSubject<any>(null);
  private _paymentGatewayNextBtnLoading$ = new BehaviorSubject<boolean>(false);
  private _customerMenuCounts$ = new BehaviorSubject<WishListCount>(
    { wishListCount: 0 }
  );
  public isLoggedIn = new BehaviorSubject<boolean>(false);
  isCheckoutPage = new Subject<boolean>();
  userInfoUpdated = new Subject<boolean>();

  constructor(private restHttp: RestService) { }
  get paymentGatewayNextBtnLoading$(): Observable<boolean> {
    return this._paymentGatewayNextBtnLoading$.asObservable();
  }
  get user$(): Observable<boolean> {
    return this._user$.asObservable();
  }
  updateOrdersInUser$(orders: any): void {
    const user = this._user$.getValue();
    if (user?.data) {
      user.data.orders_count = orders.length;
      // this._user$.next({ ...user, user });
      this.setUserInfo(user.data);
    }
  }
  get customerMenuCounts$(): Observable<WishListCount> {
    return this._customerMenuCounts$.asObservable();
  }
  updateCustomerMenuCounts$(wishListCount: WishListCount): void {
    this._customerMenuCounts$.next(wishListCount);
  }
  getCustomerMenuCounts(): WishListCount {
    return this._customerMenuCounts$.value;
  }
  public decryption(encrypted: string): string {
    if (encrypted) {
      const key = environment.CRYPTO_KEY;
      const encryptedJson = JSON.parse(atob(encrypted));
      // Now I try to decrypt it.
      const decrypted = CryptoJS.AES.decrypt(encryptedJson.value, CryptoJS.enc.Base64.parse(key), {
        iv: CryptoJS.enc.Base64.parse(encryptedJson.iv)
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } else {
      return '';
    }
  }

  // post signup customer
  public getGateWay(): void {

    this._paymentGatewayNextBtnLoading$.next(true);
    this.restHttp.GetRequestAllowAnonymous('/api/get-gateway-settings')
      .pipe(map(x => x.data))
      .subscribe(data => {
        this.paymentGateway$.next(data);
      });
  }
  loadingFalse(): void {
    this._paymentGatewayNextBtnLoading$.next(false);
  }
  // post viva wallet
  public postVivawallet(model): Observable<any> {
    // return this.restHttp.postVivaWallet(link, model, marchantId);
    return this.restHttp.postRequest('/api/vivawallet-order', model).pipe(map(x => x.data));
  }
  // post signup customer
  public signup(model: any): Observable<any> {
    return this.restHttp.postRequest('/api/customer/register', model).pipe(map(x => x.data));
  }

  // post login customer
  public login(model: any): Observable<any> {
    return this.restHttp.postRequest('/api/customer/login', model).pipe(map(x => x.data));
  }

  public upadateProfile(model: any): Observable<any> {
    return this.restHttp.postRequest('/api/customer/account-store', model, true).pipe(map(x => x.data));
  }

  public upadateAddress(model: any): Observable<any> {
    return this.restHttp.postRequest('/api/customer/address-store', model, true).pipe(map(x => x.data));
  }

  public postSubscribe(userEmail: string): Observable<any> {
    return this.restHttp.postRequest('/api/subscribe', { email: userEmail }, true);
  }

  // set user info in local storage
  setUserInfo(data): void {
    localStorage.setItem('userInfo', JSON.stringify(data));
    const customeMenuCount: WishListCount = {
      wishListCount: data?.wishlist?.length || 0,
    };
    this.updateCustomerMenuCounts$(customeMenuCount);
    this.userInfoUpdated.next(true);
    this._user$.next({ ... this._user$.getValue(), data });
  }

  // get userinfo from local storage
  getUserInfo(): any {
    const localUserInfo = localStorage.getItem('userInfo');
    if (localUserInfo) {
      const parsedLocalUserInfo = JSON.parse(localUserInfo);
      this._customerMenuCounts$.next(
        { ... this.getCustomerMenuCounts(), wishListCount: parsedLocalUserInfo?.wishlist?.length || 0 }
      );
      return parsedLocalUserInfo;
    } else {
      return null;
    }
  }


  isLogin(): boolean {
    return this.getUserInfo() ? true : false;
  }
  removeUser(): void {
    localStorage.removeItem('userInfo');
  }
  logout(): Observable<any> {
    const userId = this.getUserInfo().id;
    return this.restHttp.postRequest('/api/customer/logout', { id: userId });
  }

  isEighteenPlus(): boolean {
    if (this.isLogin()) {
      return true;
    } else {
      if (localStorage.getItem('isEighteePlus')) {
        return true;
      }
      else {
        return false;
      }
    }
  }
  setEighteenPlus(): void {
    localStorage.setItem('isEighteePlus', JSON.stringify(true));
  }
  forgotPassword = (email: any): Observable<any> => {
    return this.restHttp.postAllowAnonymousRequest('/api/customer/forgot-password', email);
  }
  resetPassword(token: string, model: any): Observable<any> {
    return this.restHttp.postAllowAnonymousRequest(`/api/customer/password-reset/${token}`, model);
  }
  // getCartByToken
  getCartByToken(token: string): Observable<any> {
    return this.restHttp.getRequest(`/api/get-cart-payload/${token}`, false);
  }
}
