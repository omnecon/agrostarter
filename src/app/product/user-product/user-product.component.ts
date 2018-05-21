import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
   allWishProduct: any = [];
   allSoldProduct: any = [];
   uid: any;

   constructor(private router: Router, private productService: ProductService, private route: ActivatedRoute) { }
   ngOnInit() {
      const newUser: any = JSON.parse(window.localStorage.getItem('user'));
      if (newUser) {
         this.uid = newUser.uid;
      } else {
         this.uid = window.localStorage.getItem('userId');
      }
      this.getAllDraftProduct();
      this.getAllPublishProduct();
      this.getAllSoldProduct();
      this.getAllWishProduct();
   }

   // Get all draft Products
   getAllDraftProduct() {
      this.productService.getAllDraftProduct(this.uid).subscribe((data: any) => {
         this.allDraftProduct = data;
      });
   }

   // Get all publish Products
   getAllPublishProduct() {
      this.productService.getAllPublishProduct(this.uid).subscribe((data: any) => {
         this.allPublishProduct = data;
      });
   }

   // Get all Sold Products
   getAllSoldProduct() {
      this.productService.getAllSoldProduct(this.uid).subscribe((data: any) => {
         this.allSoldProduct = data;
      });
   }

   // Get all Wishlist Products
   getAllWishProduct() {
      this.productService.getAllWishProduct(this.uid).subscribe((data: any) => {
         this.allWishProduct = data;
      });
   }

   editProduct(pid: any) {
      this.router.navigate(['/product', { productId: pid }]);
   }

   // On tab change get index of tab from material tabs
   onTabChange(index: any) {
      this.tabIndex = index;
   }

   // Redirect to product page for adding a new product
   addNewProduct() {
      this.router.navigate(['/product']);
   }

   // Redict to product detail page on click of product
   openProductDetailPage(pid: any) {
      this.router.navigate(['/product-details', { productId: pid }]);
   }
}
