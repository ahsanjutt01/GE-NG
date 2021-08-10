import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  readonly BILLING = 'billing';
  readonly SHIPPING = 'shipping';
  userInfo: any;
  isEditClickedShipingAddress = false;
  isAddNew = false;
  isEditClikedOne = false;
  isShowAddress = false;
  bilingAddress = '';
  shipingAddress = '';
  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();
    if (this.userInfo.addresses.length) {
      const address = this.userInfo.addresses.find(x => x.type === this.SHIPPING);
      this.isAddNew = address ? false : true;
      this.shipingAddress = `${address.address_1}, ${address.state}, ${address.postal_code}`;
    } else {
      this.isAddNew = true;
    }
  }
  getBillingAddress(): boolean {
    if (!this.userInfo.addresses.length) {
      return false;
    }
    const address = this.userInfo.addresses.find(x => x.type === this.BILLING);
    this.isShowAddress = true;
    this.bilingAddress = `${address.address_1}, ${address.state}, ${address.postal_code}`;
    return address ? true : false;
  }
  getAddress(): string {
    this.isShowAddress = this.userInfo.street_address === null ? false : true;
    return `${this.userInfo.street_address === null ? '' : this.userInfo.street_address},
    ${this.userInfo.state === null ? '' : this.userInfo.state},
    ${this.userInfo.postal_code === null ? '' : this.userInfo.postal_code}`;
  }
  onEditClikedOne(): void {
    this.isEditClikedOne = true;
  }
  isCloseClicked(isClosed: boolean): void {
    if (this.isEditClikedOne) {
      this.isEditClikedOne = false;
    } else {
      this.isEditClickedShipingAddress = false;
    }
  }
  oneditClickedShipingAddress(): void {
    this.isEditClickedShipingAddress = true;
  }
}
