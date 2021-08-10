import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from 'src/app/_services/product.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  products: any[];
  isWishlistShowPage = true;
  isLoading = false;
  loadingComplete = false;
  customerId = 0;
  constructor(
    private productSerive: ProductService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.customerId = JSON.parse(localStorage.getItem('userInfo')).id;
    this.productSerive.isWishlistShowPage.subscribe(data => {
      this.products = this.products.filter(x => x.id !== data.prodId);
      this.toastr.success('Removed from whishlist Sucessfuly', 'Sucess');
    });
    this.getWishListItems();
  }

  getWishListItems(): void {
    this.isLoading = true;
    this.productSerive.getWhislistItems(this.customerId).subscribe(data => {
      this.products = [...data];
      this.isLoading = false;
      this.loadingComplete = true;
    });
  }
}
