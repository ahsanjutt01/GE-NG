import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
 
  {
    path: 'serverError',
    loadChildren: () =>
      import('./components/errors/server-error/server-error.module').then(
        (m) => m.ServerErrorModule
      ),
  },
  {
    path: 'mycart',
    loadChildren: () =>
      import('./components/view-cart/view-cart.module').then(
        (m) => m.ViewCartModule
      ),
  },
  {
    path: 'articles',
    loadChildren: () =>
      import('./components/articles/articles.module').then(
        (m) => m.AarticlesModule
      ),
  },
  {
    path: 'page',
    loadChildren: () =>
      import('./components/static-pages/static-pages.module').then(
        (m) => m.StaticPageModule
      ),
  },
  {
    path: 'signup',
    loadChildren: () =>
      import('./components/auth/signup/signup.module').then(
        (m) => m.SignupModule
      ),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./components/auth/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'forgotPassword',
    loadChildren: () =>
      import('./components/auth/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'password-reset/:token',
    loadChildren: () =>
      import('./components/auth/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'deals',
    loadChildren: () =>
      import('./deals/deals.module').then((m) => m.DealsModule),
  },
  {
    path: 'brands',
    loadChildren: () =>
      import('./components/brand/brand.module').then((m) => m.BrandModule),
  },
  {
    path: 'flavours',
    loadChildren: () =>
      import('./components/flavour/flavour.module').then(
        (m) => m.FlavourModule
      ),
  },
  {
    path: 'collections',
    loadChildren: () =>
      import('./components/collection/collection.module').then(
        (m) => m.CollectionModule
      ),
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./components/checkout/checkout.module').then(
        (m) => m.CheckoutModule
      ),
  },
  // customer
  {
    path: 'customer',
    loadChildren: () =>
      import('./components/customer/customer.module').then(
        (m) => m.CustomerModule
      ),
  },
  {
    path: 'product',
    loadChildren: () =>
      import('./components/product/product-detail/product-detail.module').then(
        (m) => m.ProductDetailModule
      ),
  },
  // ========================== SAME MODULE FOR DIFFERNECT MODULE ==============================
  {
    path: 'category',
    loadChildren: () =>
      import('./components/product/product.module').then(
        (m) => m.ProductModule
      ),
  },
  {
    path: 'collection',
    loadChildren: () =>
      import('./components/product/product.module').then(
        (m) => m.ProductModule
      ),
  },
  {
    path: 'promotion',
    loadChildren: () =>
      import('./components/product/product.module').then(
        (m) => m.ProductModule
      ),
  },

  {
    path: 'flavour',
    loadChildren: () =>
      import('./components/product/product.module').then(
        (m) => m.ProductModule
      ),
  },
  {
    path: 'brand',
    loadChildren: () =>
      import('./components/product/product.module').then(
        (m) => m.ProductModule
      ),
  },
  {
    path: 'search',
    loadChildren: () =>
      import('./components/product/product.module').then(
        (m) => m.ProductModule
      ),
  },
  {
    path: 'exclusive',
    loadChildren: () =>
      import('./components/exclusive-offer/exclusive-offer.module').then(
        (m) => m.ExclusiveOfferModule
      ),
  },
  {
    path: 'search-results',
    loadChildren: () =>
      import('./components/search-results/search-results.module').then(
        (m) => m.SearchResultsModule
      ),
  },
  {
    path: 'components/flavour',
    loadChildren: () =>
      import('./components/flavour/flavour.module').then(
        (m) => m.FlavourModule
      ),
  },

  // ========================== END SAME MODULE FOR DIFFERNECT MODULE ==============================

  {
    path: '**',
    loadChildren: () =>
      import('./components/errors/not-found/not-found.module').then(
        (m) => m.NotFoundModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled',
      // urlUpdateStrategy: 'eager',
      useHash: true,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
