import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { ToastrService } from 'ngx-toastr';

import { AuthService } from 'src/app/_services/auth.service';
import { environment } from 'src/environments/environment';

import {showModal} from '../../../../assets/js/customJquery';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  password: '';
  passwordConfirmation: '';
  // password_confirmation
  submitted = false;
  isLoginClicked = false;
  loginError = false;
  component = '';
  isEmailSend = false;
  emailAddress = '';
  readonly APP_NAME = environment.APP_NAME;
  title = '';
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private metaTagService: Meta,
    private titleService: Title,
    private router: Router,
    private toastr: ToastrService,
    private location: Location
  ) {
    if (this.authService.getUserInfo()) {
      this.router.navigateByUrl('/customer');
    }
    this.component = this.router.url.split('/')[1];
    this.switchComponent(this.component);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.title = this.APP_NAME + 'Login';
    this.titleService.setTitle(this.title);
    this.metaTagService.updateTag({
      name: 'description',
      content: 'login to vapesuite',
    });
    this.metaTagService.updateTag({
      name: 'keywords',
      content: 'vapesuite, suite, vapesuite login vape login, login',
    });
  }
  // initialize rgister form builder
  initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }
  // convenience getter for easy access to form fields
  get f(): any {
    return this.loginForm.controls;
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
    this.authService.login(this.loginForm.value).subscribe(
      (data) => {
        if (data) {
          if (data === 'old_customer_reset_password') {
            showModal('exampleModal');
          } else {
            this.toastr.success(`Logged In Success!`, `Hi, ${data.first_name}`);
            this.authService.setUserInfo(data);
            this.authService.isLoggedIn.next(true);
            if (data.role === 'admin') {
              this.router.navigateByUrl('/customer/detail/carts');
            } else {
              this.location.back();
            }
          }
        } else {
          this.loginError = true;
        }
        this.isLoginClicked = false;
      },
      (error) => {
        this.loginError = true;
        this.toastr.error('Email and Password incorrect.', 'Error');
        this.isLoginClicked = false;
      }
    );
  }
  switchComponent(pageType: string): void {
    switch (pageType) {
      case 'login':
        this.component = 'login';
        break;
      case 'forgotPassword':
        this.component = 'forgotPassword';
        break;
      case 'password-reset':
        this.component = 'newPassword';
        break;

      default:
        this.component = 'login';
        break;
    }
  }
  onresetPsasword(): void {
    this.isLoginClicked = true;
    this.authService.forgotPassword({ email: this.emailAddress }).subscribe(
      (x) => {
        if (x.status !== 404) {
          this.isLoginClicked = false;
          this.isEmailSend = true;
          this.toastr.success('Email send successfully', 'Sucess');
        } else {
          this.isLoginClicked = false;
          this.toastr.error(x.message, 'Error');
        }
      },
      (error) => {
        this.isLoginClicked = false;
        this.toastr.error('Something went wrong', 'Error');
      }
    );
  }
  onSetNewPassword(): void {
    this.isLoginClicked = true;
    this.authService
      .resetPassword(this.router.url.split('/')[2], {
        password: this.password,
        password_confirmation: this.passwordConfirmation,
      })
      .subscribe(
        (x) => {
          if (x.status === 404) {
            this.toastr.error(x.message, 'Error');
          } else {
            this.isLoginClicked = false;
            this.toastr.success('Reset password successfully', 'Sucess');
            this.authService.setUserInfo(x.data);
            this.authService.isLoggedIn.next(true);
            this.router.navigateByUrl('/customer');
          }
        },
        (error) => {
          this.isLoginClicked = false;
          this.toastr.error('Something went wrong', 'Error');
        }
      );
  }
}
