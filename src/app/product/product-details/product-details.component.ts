import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { ProductService } from '../shared/product.service';
import { product } from '../shared/product';
import { Upload } from '../shared/upload';

@Component({
   selector: 'product-details',
   templateUrl: './product-details.component.html',
   styleUrls: ['./product-details.component.scss'],
})
export class ProductDetailsComponent implements OnInit {
   product: product;
   productLocation: any;
   uid: any;
   Offers: any;
   user: any;
   // tslint:disable-next-line:max-line-length
   constructor(private router: Router, private route: ActivatedRoute, private productService: ProductService, private afs: AngularFirestore) {
      const newUser: any = JSON.parse(window.localStorage.getItem('user'));
      this.uid = newUser.uid;
   }

   ngOnInit() {
      const productId = this.route.snapshot.paramMap.get('productId');
      this.productService.getProduct(productId).subscribe((resp: product) => {
         this.product = resp;
         this.getLocation(this.product.location);
      });
      this.getOffers();
   }

   getLocation(location: Geolocation) {
      this.productService.getCurrentLocationProd(location).subscribe((resp: any) => {
         const address = resp.results[0].formatted_address;
         this.productLocation = address;
      });
   }

   getOffers() {
      this.productService.getOffers().subscribe((resp: any) => {
         this.Offers = resp;
         this.afs.collection('users').doc(this.Offers.userId)
            .ref
            .get().then((doc) => {
               this.user = doc.data();
            });
      });
   }
}
