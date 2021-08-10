import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpXhrBackend,
} from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RestService {
  userInfo;
  authOptions: any;
  options: any;
  API_URL: any;
  constructor(private http: HttpClient, private router: Router) {
    this.API_URL = environment.API_URL;
    // this.API_URL = environment.LOCAL_API_URL;
  }
  public getOptions(): any {
    // if (JSON.parse(localStorage.getItem('userInfo'))) {
    //   this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
    // } else {
    // this.userInfo = localStorage.setItem('api_token', JSON.stringify(
    //   { token: environment.LOCAL_REQUEST_TOKEN }
    // ));
    this.userInfo = JSON.parse(localStorage.getItem('api_token'));
    // }

    const token = `Bearer ${environment.LOCAL_REQUEST_TOKEN}`;
    const header = new HttpHeaders({
      Authorization: `${token}`,
    });
    this.options = { headers: header };
    return this.options;
  }

  public getAuthOptions(): any {
    if (JSON.parse(localStorage.getItem('userInfo'))) {
      const api_token = JSON.parse(localStorage.getItem('userInfo')).api_token;

      const token = `Bearer ${api_token}`;
      const header = new HttpHeaders({
        Authorization: `${token}`,
      });
      this.authOptions = { headers: header };
    }
    return this.authOptions;
  }

  public GetRequestAllowAnonymous(link): Observable<any> {
    return this.http
      .get(`${this.API_URL}${link}`, this.getOptions())
      .pipe(retry(0), catchError(this.handleError));
  }
  public postVivaWallet(link, model, authToken): Observable<any> {
    const marchantId = `Basic ${authToken}`;
    const header = new HttpHeaders({
      Authorization: `${marchantId}`,
    });
    const vivaOptions = { headers: header };
    return this.http
      .post(`${link}`, model, vivaOptions)
      .pipe(retry(0), catchError(this.handleError));
  }

  public getRequest(link: string, isNewtoken = false): Observable<any> {
    return this.http
      .get(
        `${this.API_URL}${link}`,
        isNewtoken ? this.getAuthOptions() : this.getOptions()
      )
      .pipe(retry(0), catchError(this.handleError));
  }
  public postRequest(
    link: string,
    model: any,
    isNewtoken = false
  ): Observable<any> {
    return this.http
      .post(
        `${this.API_URL}${link}`,
        model,
        isNewtoken ? this.getAuthOptions() : this.getOptions()
      )
      .pipe(retry(0), catchError(this.handleError));
  }
  public getRequestFromUrl(url): Observable<any> {
    return this.http
      .get(url, this.getOptions())
      .pipe(retry(0), catchError(this.handleError));
  }
  public postAllowAnonymousRequest(link: string, email: any): Observable<any> {
    return this.http
      .post(`${this.API_URL}${link}`, email)
      .pipe(retry(0), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    const httpClient = new HttpClient(
      new HttpXhrBackend({ build: () => new XMLHttpRequest() })
    );
    const token = `Bearer ${environment.LOCAL_REQUEST_TOKEN}`;
    const headers = {
      headers: new HttpHeaders({
        Authorization: `${token}`,
      }),
    };
    httpClient
      .post(`${environment.API_URL}/api/error-logs`, error, headers)
      .subscribe();
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      // this.router.navigateByUrl('/serverError');
    } else {
      if (error.status === 401) {
        // this.router.navigateByUrl('/serverError');
      }
    }
    // return an ErrorObservable with a user-facing error message
    return observableThrowError(error);
  }
}
