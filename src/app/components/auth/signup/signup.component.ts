import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { MustMatch } from 'src/app/_helper/must-match-validator';
import { AuthService } from 'src/app/_services/auth.service';
import { GenericService } from 'src/app/_services/generic.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  isClicked = false;
  today: string | null;
  days: any;
  months = environment.MONTHS;
  years: any;
  isUnderAge = false;
  isEmailTakenError = false;
  readonly APP_NAME = environment.APP_NAME;
  title = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private metaTagService: Meta,
    private titleService: Title,
    private router: Router,
    private genericService: GenericService,
    private toastr: ToastrService
  ) {
    this.today = new DatePipe('en-US').transform(new Date(), 'yyyy-MM-dd');
    if (this.authService.getUserInfo()) {
      this.router.navigateByUrl('/customer');
    }
    this.days = Array(32).fill(1).map((x, i) => i).splice(1);
    this.years = this.genericService.getYears();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.title = this.APP_NAME + 'Signup';
    this.titleService.setTitle(this.title);
    this.metaTagService.updateTag(
      { name: 'description', content: 'sign up to vape suite' }
    );
    this.metaTagService.updateTag(
      { name: 'keywords', content: 'vapesuite, suite, vapesuite signup vape signup, signup' }
    );
  }
  // initialize rgister form builder
  initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
      date_of_birth: new FormControl(this.today),
      day: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required],
      // acceptTerms: [false, Validators.requiredTrue]
    },
      {
        // validation for matching password
        validator: MustMatch('password', 'password_confirmation')
      }
    );
  }
  // convenience getter for easy access to form fields
  get f(): any { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    if (this.diff_years(new Date(), new Date(`${this.registerForm.value.day}-${parseInt(this.registerForm.value.month)+1}-${this.registerForm.value.year}`)) < 18) {
      this.isUnderAge = true;
      return;
    } else {
      this.isUnderAge = false;
    }
    this.isClicked = true;
    this.isEmailTakenError = false;
    const date = `${this.registerForm.value.year}-${parseInt(this.registerForm.value.month)+1}-${this.registerForm.value.day}`;
    this.registerForm.value.date_of_birth = date;
    // this.registerForm.value.date_of_birth = new Date(date.toLocaleString()).toISOString().split('T')[0];
    const model = this.registerForm.value;
    this.authService.signup(model).subscribe(user => {
      this.authService.login({ email: model.email, password: model.password }).subscribe(data => {
        this.toastr.success(`Logged In Sucess!`, `Hi, ${data.first_name}`);
        this.authService.setUserInfo(data);
        this.authService.isLoggedIn.next(true);
        this.router.navigateByUrl('/customer');
        this.isClicked = false;
      });
    }, error => {
      this.isClicked = false;
      if (error?.status) {
        this.isEmailTakenError = true;
        this.scrollToUp({ top: 0 });
        this.toastr.error('Email Already exists.', 'Error');
      }
    });
  }

  onReset(): void {
    this.submitted = false;
    this.registerForm.reset();
  }
  diff_years(dt2, dt1): number {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60 * 24);
    return Math.abs(Math.round(diff / 365.25));
  }
  scrollToUp(event): void {
    window.scrollTo({ top: 0 });
  }
}
