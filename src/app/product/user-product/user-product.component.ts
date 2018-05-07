import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { product } from '../shared/product';
@Component({
   selector: 'user-product-page',
   templateUrl: './user-product.component.html',
   styleUrls: ['./user-product.component.scss'],
})
export class UserProductComponent implements OnInit {
   tabIndex = 0;
   constructor(private router: Router) { }
   ngOnInit() {
      this.tabIndex = 0;
   }
   onTabChange(index: any) {
      this.tabIndex = index;
   }
   addNewProduct() {
      this.router.navigate(['/product']);
   }
}