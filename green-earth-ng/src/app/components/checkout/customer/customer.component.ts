import { CdkStepper } from '@angular/cdk/stepper';
import { AfterContentInit, AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/_services/auth.service';
import { CartService } from 'src/app/_services/cart/cart.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:no-input-rename
  @Input('stepperr') stepper: CdkStepper;
  loginForm: FormGroup;
  submitted = false;
  isLoginClicked = false;
  cartToken = null;
  loginError = false;
  payloadError = false;
  isLoggedIn = false;
  loggedinSubscription: Subscription;
  loggedinServiceSubscription: Subscription;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cartService: CartService,
    private toaster: ToastrService,
  ) { }
  ngOnDestroy(): void {
    if (this.loggedinSubscription) {
      this.loggedinSubscription.unsubscribe();
    }
    if (this.loggedinServiceSubscription) {
      this.loggedinServiceSubscription.unsubscribe();
    }
  }
  // ngAfterViewInit(): void {
  //   if (this.isLoggedIn) {
  //     this.stepper.selectedIndex = 1;
  //   }
  // }

  ngOnInit(): void {

    this.initializeForm();
    this.isLoggedIn = this.authService.isLogin();
    this.route.params.subscribe(
      params => {
        this.cartToken = params.token;
        if (this.isLoggedIn) {
          this.authService.getCartByToken(this.cartToken).subscribe(x => {
          });
        }
      });
    this.loggedinSubscription = this.authService.isLoggedIn.subscribe(x => {
      if (x) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });
  }
  // convenience getter for easy access to form fields
  get f(): any { return this.loginForm.controls; }

  // initialize rgister form builder
  initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
  // login form submit
  onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.isLoginClicked = true;
    // call Login servie
    this.loggedinServiceSubscription = this.authService.login(this.loginForm.value).subscribe(data => {
      if (data) {
        this.authService.setUserInfo(data);
        if (this.cartToken) {
          this.authService.getCartByToken(this.cartToken).subscribe(x => {
            if (x) {
              const payload = JSON.parse(x.data);
              if (payload.customer_id === data.id) {
                this.cartService.setCart(payload);
                this.authService.isLoggedIn.next(true);
                this.stepper.next();
                this.isLoginClicked = false;
              } else {
                this.authService.logout().subscribe(x => {
                  this.authService.setUserInfo(null);
                  this.payloadError = true;
                  this.isLoginClicked = false;
                });
              }
            }
          }, err => {
            this.authService.logout().subscribe(x => {
              this.authService.setUserInfo(null);
              this.payloadError = true;
              this.isLoginClicked = false;
            });
          });
        } else {
          this.authService.isLoggedIn.next(true);
          this.stepper.next();
        }
      } else {
        this.loginError = true;
      }
      this.isLoginClicked = false;
    }, error => {
      this.loginError = true;
      this.isLoginClicked = false;
    });
  }
}
