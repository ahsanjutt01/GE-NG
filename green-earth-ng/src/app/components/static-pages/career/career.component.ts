import { Marker } from '@agm/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-career',
  templateUrl: './career.component.html',
  styleUrls: ['./career.component.scss']
})
export class CareerComponent implements OnInit {
  contactUsForm: FormGroup;
  contactUsFormSubmited = false;
  isClicked = false;
  APP_NAME = environment.APP_NAME;
  zoom: number = 8;
  storesubscription: Subscription;
  lat: number = 31.5204;
  lng: number = 74.3587;
  organization: any;
  vapeStore: any;
  markers: Marker[] = [];
  get f(): any { return this.contactUsForm.controls; }

  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.contactUsForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {}

}
