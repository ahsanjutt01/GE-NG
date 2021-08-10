import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { GenericService } from 'src/app/_services/generic.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-store-location',
  templateUrl: './store-location.component.html',
  styleUrls: ['./store-location.component.scss']
})
export class StoreLocationComponent implements OnInit, OnDestroy {
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
  // markers = [
  //   {
  //     lat: 51.673858,
  //     lng: 7.815982,
  //     label: 'A',
  //     draggable: true
  //   },
  //   {
  //     lat: 51.373858,
  //     lng: 7.215982,
  //     label: 'B',
  //     draggable: false
  //   },
  //   {
  //     lat: 51.723858,
  //     lng: 7.895982,
  //     label: 'C',
  //     draggable: true
  //   }
  // ];
  constructor(
    private formBuilder: FormBuilder,
    private store: Store<{ navbar: { settings: any } }>,
    private metaTagService: Meta,
    private titleService: Title,
    private genericeService: GenericService,
    private toastr: ToastrService
  ) {
    this.contactUsForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get f(): any { return this.contactUsForm.controls; }
  onSubmit(): void {
    this.isClicked = true;
    this.contactUsFormSubmited = true;
    // stop here if form is invalid
    if (this.contactUsForm.invalid) {
      this.isClicked = false;
      return;
    }
    this.genericeService.postContactUS(this.contactUsForm.value).subscribe(x => {
      this.isClicked = false;
      this.contactUsForm.reset();
      this.contactUsFormSubmited = false;
      this.toastr.success('Success', 'Email sent sucessfuly');
    }, err => {
      this.isClicked = false;
      this.toastr.error('Error', 'Something went wrong');
    });
  }
  ngOnInit(): void {
    let title = '';
    title = this.APP_NAME + 'Location';
    this.titleService.setTitle(title);
    this.metaTagService.updateTag(
      { name: 'description', content: title }
    );
    this.metaTagService.updateTag(
      { name: 'keywords', content: 'vapesuite, location, faqs, home, vapesuitehome, suite, products, vape products, listing, vape' }
    );
    this.storesubscription = this.store.subscribe((data: any) => {
      // this.organization = data.navbar.navbar.organization;
      if (data.navbar.navbar.organization.store_locations.length) {
        this.vapeStore = data.navbar.navbar.organization;
        this.organization = JSON.parse(data.navbar.navbar.organization.store_locations);
        this.organization.forEach(loc => {
          this.markers.push({
            lat: parseFloat(loc.lat),
            lng: parseFloat(loc.lon),
            label: 'V',
            draggable: false
          });
        });
      }
    });
  }
  ngOnDestroy(): void {
    if (this.storesubscription) {
      this.storesubscription.unsubscribe();
    }
  }
  clickedMarker(label: string, index: number) {
  }
  mapClicked($event: MouseEvent) {
    // this.markers.push({
    //   lat: $event.coords.lat,
    //   lng: $event.coords.lng,
    //   draggable: true
    // });
  }
}

// just an interface for type safety.
interface Marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}
