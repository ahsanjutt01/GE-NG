import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/_services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  readonly BILLING = 'billing';
  readonly SHIPPING = 'shipping';
  countries = [];
  phoneNumberPattern = environment.PHONE_VALIDATION_PATTREN;
  emailPattern = environment.EMAIL_VALIDATION_PATTREN;
  @Input() type = '';
  @Output() isCloseClicked = new EventEmitter<boolean>();
  userInfo: any;
  addressForm: any;
  submitted = false;
  isClicked = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private store: Store<{ navbar: { settings: any } }>
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();
    if (this.type === this.BILLING) {
      this.userInfo = this.userInfo.addresses.find(
        (x) => x.type === this.BILLING
      );
    } else {
      this.userInfo = this.userInfo.addresses.find(
        (x) => x.type === this.SHIPPING
      );
    }
    this.initializeForm();
    if (this.userInfo) {
      this.setFormValues();
    }
    this.store.select('navbar').subscribe((x: any) => {
      this.countries = x?.navbar?.countries;
      if (this.countries) {
        const countryObj = this.countries.find(
          (country) => country.nicename === 'United Kingdom'
        );
        if (countryObj) {
          this.setFormValues(countryObj);
        }
      }
    });
  }
  onClose(): void {
    this.isCloseClicked.emit(true);
  }
  initializeForm(): void {
    this.addressForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      country_id: [-1, Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      address_1: ['', Validators.required],
      postal_code: ['', Validators.required],
      phone: [
        '',
        [Validators.required, Validators.pattern(this.phoneNumberPattern)],
      ],
      // secondary_phone: ['', Validators.required],
    });
  }
  // convenience getter for easy access to form fields
  get f(): any {
    return this.addressForm.controls;
  }
  // Set Default Values
  setFormValues(countyObj = null): void {
    this.addressForm.setValue({
      first_name: this.userInfo.first_name || '',
      last_name: this.userInfo.last_name || '',
      email: this.userInfo.email || '',
      country_id: this.userInfo.country_id
        ? this.userInfo.country_id
        : countyObj.id || 0,
      state: this.userInfo.state || '',
      city: this.userInfo.city || '',
      address_1: this.userInfo.address_1 || '',
      postal_code: this.userInfo.postal_code || '',
      phone: this.userInfo.phone || '',
      // secondary_phone: this.userInfo.secondary_phone || '',
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.addressForm.invalid) {
      return;
    }
    this.isClicked = true;
    this.onUpdateAddress();
  }
  onUpdateAddress(): void {
    this.addressForm.value.customer_id = this.authService.getUserInfo().id;
    this.addressForm.value.id = this.authService.getUserInfo().id;
    this.addressForm.value.type = this.type;
    this.addressForm.value.country_id = this.addressForm.value.country_id.toString();
    this.authService.upadateAddress(this.addressForm.value).subscribe(
      (data) => {
        if (data) {
          this.isCloseClicked.emit(true);
          const userinfo = this.authService.getUserInfo();
          if (userinfo.addresses?.length === 0) {
            userinfo.addresses.push(data);
          } else {
            const index = userinfo.addresses.findIndex(
              (address) => address.type === this.addressForm.value.type
            );
            index > -1
              ? (userinfo.addresses[index] = data)
              : userinfo.addresses.push(data);
          }
          this.authService.setUserInfo(userinfo);
        }
        this.isClicked = false;
        this.toastr.success('Updated Adress successfuly.', 'Success');
      },
      (error) => {
        this.isClicked = false;
        this.toastr.error('Someting went wrong.', 'Error');
      }
    );
  }
}
