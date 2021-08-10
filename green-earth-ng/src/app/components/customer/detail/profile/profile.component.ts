import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/_services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  readonly BILLING = 'billing';
  phoneNumberPattern = environment.PHONE_VALIDATION_PATTREN;
  emailPattern = environment.EMAIL_VALIDATION_PATTREN;
  countries = [];
  userInfo: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    country_id: number;
    state: string;
    city: string;
    street_address: string;
    postal_code: string;
    primary_phone: string;
    secondary_phone: string;
    password: string;
    password_confirmation: string;
    date_of_birth: string;
  };
  isUnderAge = false;
  isClicked = false;
  submitted = false;
  profileForm: FormGroup;
  today: string | null;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private store: Store<{ navbar: { settings: any } }>
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();
    this.initializeForm();
    this.store.select('navbar').subscribe((x: any) => {
      this.countries = x?.navbar?.countries;
      if (this.countries) {
        const countryObj = this.countries.find(
          (country) => country.nicename === 'United Kingdom'
        );
        if (countryObj) {
          this.setProfileFormValues(countryObj);
        }
      }
    });
  }
  // initialize rgister form builder
  initializeForm(): void {
    this.profileForm = this.formBuilder.group(
      {
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        email: [
          '',
          [Validators.required, Validators.pattern(this.emailPattern)],
        ],
        country_id: ['', Validators.required],
        state: ['', Validators.required],
        city: ['', Validators.required],
        street_address: ['', Validators.required],
        postal_code: ['', Validators.required],
        primary_phone: [
          '',
          [Validators.required, Validators.pattern(this.phoneNumberPattern)],
        ],
        secondary_phone: [
          '',
          [Validators.required, Validators.pattern(this.phoneNumberPattern)],
        ],
        // password: ['************', [Validators.required, Validators.minLength(8)]],
        // password_confirmation: ['', Validators.required],
        date_of_birth: new FormControl(this.today, Validators.required),
        // acceptTerms: [false, Validators.requiredTrue]
      }
      // {
      //   // validation for matching password
      //   validator: MustMatch('password', 'password_confirmation')
      // }
    );
  }
  // convenience getter for easy access to form fields
  get f(): any {
    return this.profileForm.controls;
  }
  // Set Default Values
  setProfileFormValues(countryObj = null): void {
    this.profileForm.setValue({
      first_name: this.userInfo.first_name || '',
      last_name: this.userInfo.last_name || '',
      email: this.userInfo.email || '',
      country_id: this.userInfo.country_id
        ? this.userInfo.country_id
        : countryObj.id || 0,
      state: this.userInfo.state || '',
      city: this.userInfo.city || '',
      street_address: this.userInfo.street_address || '',
      postal_code: this.userInfo.postal_code || '',
      primary_phone: this.userInfo.primary_phone || '',
      secondary_phone: this.userInfo.secondary_phone || '',
      // password: this.userInfo.password,
      // password_confirmation: this.userInfo.password_confirmation,
      date_of_birth: this.userInfo.date_of_birth || '',
    });
  }
  // on profile form submited
  onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.profileForm.invalid) {
      return;
    }
    if (
      this.diff_years(
        new Date(),
        new Date(this.profileForm.value.date_of_birth)
      ) < 18
    ) {
      this.isUnderAge = true;
      return;
    } else {
      this.isUnderAge = false;
    }
    this.isClicked = true;
    this.onUpdateProfile();
  }

  // On Update Profile
  onUpdateProfile(): void {
    this.profileForm.value.id = this.userInfo.id;
    this.authService.upadateProfile(this.profileForm.value).subscribe(
      (data: any) => {
        if (data) {
          this.authService.setUserInfo({ ...this.userInfo, ...data });
          this.userInfo = this.authService.getUserInfo();
          this.onUpdateAddress();
          this.isClicked = false;
          this.toastr.success('Profile updated', 'Sucess');
        }
      },
      (error) => {
        this.isClicked = false;
      }
    );
  }
  onUpdateAddress(): void {
    const model = { ...this.profileForm.value };

    model.customer_id = this.authService.getUserInfo().id;
    model.id = this.authService.getUserInfo().id;
    model.type = this.BILLING;
    model.country_id = this.profileForm.value.country_id.toString();
    this.authService.upadateAddress(model).subscribe(
      (data) => {
        if (data) {
          const userinfo = this.authService.getUserInfo();
          userinfo.addresses.push(data);
          this.authService.setUserInfo(userinfo);
        }
        this.isClicked = false;
      },
      (error) => {
        this.isClicked = false;
      }
    );
  }

  diff_years(dt2, dt1): number {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60 * 60 * 24;
    return Math.abs(Math.round(diff / 365.25));
  }
}
