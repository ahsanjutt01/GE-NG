import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';

import { GenericService } from 'src/app/_services/generic.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  emailForm: FormGroup;
  submitted = false;
  footerStore: Observable<{ footer: any }>;
  // footer: any;
  fotterSubscription: Subscription;
  constructor(
    private store: Store<{ navbar: { footer: any } }>,
    private genericService: GenericService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.footerStore = this.store.select('navbar');
    // this.fotterSubscription = this.footer.subscribe((data: any) => {
    //   this.footerStore = data.navber;
    // });
  }
  ngOnDestroy(): void {
    // this.fotterSubscription.unsubscribe();
  }
  onSubscribe(): void {
    this.submitted = true;
    if (this.emailForm.invalid) {
      // this.toastr.error('Please enter your email.', 'Error');
      return;
    }
    this.genericService.postSubscribe(this.emailForm.value.email).subscribe(x => {
      // do somthing after subscribe
      this.toastr.success('Thanks for Subscription', 'Success');
    }, err => {
      this.toastr.error('You are already subscribed', 'Error');
    });
  }
  get f(): any { return this.emailForm.controls; }
}
