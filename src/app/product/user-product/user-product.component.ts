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
   constructor(private router: Router, private productService: ProductService, private route: ActivatedRoute) {

   }
   ngOnInit() {
      const newUser: any = JSON.parse(window.localStorage.getItem('user'));
      if (newUser) {
         this.uid = newUser.uid;
      } else {
         this.uid = window.localStorage.getItem('userId');
      }
      this.getAllDraftProduct();
      this.getAllPublishProduct();
      this.getAllWishProduct();
      this.getAllSoldProduct();
   }

   // Get all draft Products
   getAllDraftProduct() {
      this.productService.getAllDraftProduct(this.uid).subscribe((data: any) => {
         this.allDraftProduct = data;
      });
   }

   // Get all publish Products
   getAllPublishProduct() {
      console.log('---- test ------');
      this.productService.getAllPublishProduct(this.uid).subscribe((data: any) => {
         this.allPublishProduct = data;
         console.log('this.allPublishProduct  == ', this.allPublishProduct);
      });
   }

   // Get all Wishlist Products
   getAllWishProduct() {
      console.log('---- test 11111 ------');
      this.productService.getAllWishProduct(this.uid).subscribe((data: any) => {
         this.allWishProduct = data;
         console.log('this.allWishProduct  == ', this.allWishProduct);
      });
   }

   // Get all Sold Products
   getAllSoldProduct() {
      this.productService.getAllSoldProduct(this.uid).subscribe((data: any) => {
         this.allSoldProduct = data;
      });
   }

   editProduct(pid: any) {
      console.log('pid === ', pid);
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
      console.log('pid 000000000 ', pid);
      this.router.navigate(['/product-details', { productId: pid }]);
   }
}
