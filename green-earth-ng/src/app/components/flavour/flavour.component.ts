import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/_services/product.service';

@Component({
  selector: 'app-flavour',
  templateUrl: './flavour.component.html',
  styleUrls: ['./flavour.component.scss'],
})
export class FlavourComponent implements OnInit {
  props = []
  properties = [];
  startIndex = 0;
  size = 24;
  searchFlavour = '';
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.props$.subscribe((x) => {
      if(x) {
        this.props = [...x.properties];
        this.load_more();
      } else {
        this.productService.getAllProps();
      }
    });
  }
  onWindowScroll(isEnd = false): void {
    if (isEnd === true) {
      this.load_more();
    }
  }
  load_more(): void {
    this.props.splice(this.startIndex, this.size).forEach(x => {
      this.properties.push(x);
    });
    this.startIndex++;
  }
}
