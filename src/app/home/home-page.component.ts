import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { HomeService } from './shared/home.service';
import { product } from '../product/shared/product';
import { ProductService } from '../product/shared/product.service';
@Component({
   selector: 'home-page',
   templateUrl: './home-page.component.html',
   styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
   product: product;
   productLocation: any;
   allProduct: any = [];
   uid: any;
   Offers: any;
   user: any;
   // tslint:disable-next-line:max-line-length
   constructor(private router: Router, private route: ActivatedRoute, private homeService: HomeService, private productService: ProductService, private afs: AngularFirestore) { }

   ngOnInit() {
      this.getAllProduct();
   }

   getAllProduct() {
      this.productService.getAllProduct().subscribe((data: any) => {
         this.allProduct = data;
      });
   }
}
