import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { product } from '../shared/product';
import { ProductService } from '../shared/product.service';
@Component({
   selector: 'user-product-page',
   templateUrl: './user-product.component.html',
   styleUrls: ['./user-product.component.scss'],
   encapsulation: ViewEncapsulation.None,
})
export class UserProductComponent implements OnInit {
   tabIndex = 0;
   allDraftProduct: any = [];
   allPublishProduct: any = [];
   allSoldProduct: any = [];
   constructor(private router: Router, private productService: ProductService) { }
   ngOnInit() {
      this.getAllDraftProduct();
      this.getAllPublishProduct();
      this.getAllSoldProduct();
   }
   getAllDraftProduct() {
      this.productService.getAllDraftProduct().subscribe((data: any) => {
         this.allDraftProduct = data;
      });
   }
   getAllPublishProduct() {
      this.productService.getAllPublishProduct().subscribe((data: any) => {
         this.allPublishProduct = data;
      });
   }
   getAllSoldProduct() {
      this.productService.getAllSoldProduct().subscribe((data: any) => {
         this.allSoldProduct = data;
      });
   }
   onTabChange(index: any) {
      this.tabIndex = index;
      // if (index === 0) {
      //    this.getAllDraftProduct();
      // } else if (index === 1) {
      //    this.getAllPublishProduct();
      // } else {
      //    this.getAllSoldProduct();
      // }
   }
   addNewProduct() {
      this.router.navigate(['/product']);
   }
   openProductDetailPage(pid: any) {
      this.router.navigate(['/product-details', { productId: pid }]);
   }
}
