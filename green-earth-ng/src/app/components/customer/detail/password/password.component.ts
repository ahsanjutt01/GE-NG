import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from 'src/app/_helper/must-match-validator';

import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {
  passwordForm: FormGroup;
  submitted = false;
  isClicked = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
  }
  initializeForm(): void {
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirmation: ['', Validators.required],
    },
      {
        // validation for matching password
        validator: MustMatch('newPassword', 'password_confirmation')
      }
    );
  }
  // convenience getter for easy access to form fields
  get f(): any { return this.passwordForm.controls; }

  onSubmit(): void {
    this.isClicked = true;
    this.submitted = true;
    // stop here if form is invalid
    if (this.passwordForm.invalid) {
      return;
    }

    this.isClicked = false;
  }
}
