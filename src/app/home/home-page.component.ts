import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
   @ViewChild('searchtext') _searchtext: ElementRef;
   @ViewChild('searchLocationtext') _searchLocationtext: ElementRef;
   product: product;
   productLocation: any;
   allProduct: Array<any>;
   allProductClone: Array<any>;
   uid: any;
   Offers: any;
   user: any;
   latitude: number;
   longitude: number;
   categories: Array<any> = [];
   selectedCatValue: any = 'all';
   searchterm: string;

   // tslint:disable-next-line:max-line-length
   constructor(private router: Router, private route: ActivatedRoute, private homeService: HomeService, private productService: ProductService, private afs: AngularFirestore) { }

   ngOnInit() {
      /**
       * TypeScript Comment
       * @author Application Nexus
       * @description Get All Published Product on load of home module
       */
      this.getAllProduct();
      /**
       * TypeScript Comment
       * @description Get Current location of user
       */
      this.getUserLocation();
      // Initialise Dummy Categories
      this.categories = [
         { cat_id: 'food', cat_text: 'Food' },
         { cat_id: 'vahicle', cat_text: 'Vahicle' },
         { cat_id: 'furniture', cat_text: 'Furniture' },
         { cat_id: 'mobile', cat_text: 'Mobile' },
      ];
   }

   /**
    * TypeScript Comment
    * @description Get All Published Product on load of home module
    */
   getAllProduct() {
      this.homeService.getAllProduct().subscribe((data: any) => {
         this.allProduct = data;
         this.allProductClone = this.allProduct;
      });
   }
   /**
    * TypeScript Comment
    * @description Get latitude and longitude of user's Current location
    */
   getUserLocation() {
      this.productService.getUserLocation().subscribe((position: any) => {
         this.latitude = position.location.lat;
         this.longitude = position.location.lng;
      });
   }

   /**
    * @description Load all distance of product from current location using innerHtml
    * @param location [latitude,longitude]
    */
   getDistancePlace(location: any) {
      const destLatitude = location[0];
      const destLongitude = location[1];
      const distance = this.homeService.calcCrow(this.latitude, this.longitude, destLatitude, destLongitude);
      return `${distance} km`;
   }

   /**
    * @description Search product using product category
    * @param value category id
    */
   getProductByCategory(value: any) {
      this.selectedCatValue = value;
      this.allProduct = this.allProductClone;
      if (value !== 'all') {
         const prodByCat = this.allProductClone.filter((element) => {
            if (element.categories.length !== 0) {
               return element.categories.some((subElement: any) => {
                  return subElement.cat_id === this.selectedCatValue;
               });
            }
         });
         this.allProduct = prodByCat;
      } else {
         this.getAllProduct();
      }
      this._searchtext.nativeElement.value = '';
      this._searchLocationtext.nativeElement.value = '';
   }
   /**
    * @description Search product using string value prduct title
    * @param value product title
    */
   getProductByTitle(value: any) {
      this.selectedCatValue = 'all';
      this._searchLocationtext.nativeElement.value = '';
      const searchVal = value;
      this.allProduct = this.allProductClone;
      if (searchVal && searchVal.trim() !== '') {
         this.allProduct = this.allProduct.filter((item) => {
            return (item.title.toLowerCase().indexOf(searchVal.toLowerCase()) > -1);
         });
      }
   }

   /**
    * @description Search product by location entered by user
    * @param value product location
    */
   getProductByLocation(value: any) {
      this.selectedCatValue = 'all';
      this._searchtext.nativeElement.value = '';
      const searchVal = value;
      this.allProduct = this.allProductClone;
      if (searchVal && searchVal.trim() !== '') {
         this.allProduct = this.allProduct.filter((item) => {
            return (item.productLocation.toLowerCase().indexOf(searchVal.toLowerCase()) > -1);
         });
      }
   }

   /**
    * @description check if search input is null
    * @param event String value of input
    */
   checkNull(event: any) {
      if (event.target.value === '') {
         this.allProduct = this.allProductClone;
         this.selectedCatValue = 'all';
         this._searchtext.nativeElement.value = '';
         this._searchLocationtext.nativeElement.value = '';
      }
   }

   // Redict to product detail page on click of product
   openProductDetailPage(pid: any) {
      console.log('pid 000000000 ', pid);
      this.router.navigate(['/product-details', { productId: pid }]);
   }
}
