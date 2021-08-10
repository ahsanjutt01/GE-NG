import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './_shared/sahere.module';
import { StoreModule } from '@ngrx/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { RouteReuseStrategy } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { homeReducer } from './components/home/store/home.reducer';
import { navbarReducer } from './components/navbar/store/navebar.reducer';
import { SearchBarComponent } from './components/navbar/search-bar/search-bar.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ToastrModule } from 'ngx-toastr';
import { CacheRouteReuseStrategy } from './cache-route-reuse.strategy';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    NavbarComponent,
    SearchBarComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    AppRoutingModule,
    ToastrModule.forRoot(
      {
        timeOut: 5000,
        positionClass: 'toast-bottom-left',
        preventDuplicates: true,
        progressBar: true,
        easeTime: 300
      }
    ),
    // CountdownModule,
    HttpClientModule,
    StoreModule.forRoot({ navbar: navbarReducer, homeFetch: homeReducer }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerImmediately'
    }),
  ],
  providers: [
    // {
    //   provide: RouteReuseStrategy,
    //   useClass: CacheRouteReuseStrategy
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
