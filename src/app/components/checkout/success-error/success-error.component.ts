import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/_services/cart/cart.service';

@Component({
  selector: 'app-success-error',
  templateUrl: './success-error.component.html',
  styleUrls: ['./success-error.component.scss']
})
export class SuccessErrorComponent implements OnInit {
  isSucess = false;
  constructor(
    private router: Router,
    private cartService: CartService,
  ) { }

  ngOnInit(): void {
    if (this.router.url.split('/')[2]?.split('?')[0] === 'vivawallet-success') {
      this.isSucess = true;
      // this.cartService.initializeCart();
    }
  }
  onVeiwOrderDetails(): void {
    this.router.navigateByUrl('customer/detail/orders');
  }
}
