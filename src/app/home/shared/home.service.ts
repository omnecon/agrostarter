import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';

import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Headers } from '@angular/http';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { product } from '../../product/shared/product';
import { NotifyService } from '../../core/notify.service';

@Injectable()
export class HomeService {
   private headers: HttpHeaders = new HttpHeaders();
   private _allPublishproduct: Subject<any> = new Subject<any>();
   basePath = 'products';
   imgbasePath = 'user-product-images';
   uid: any;
   productsCollection: AngularFirestoreCollection<product>;
   productsDocument: AngularFirestoreDocument<product>;

   constructor(private afs: AngularFirestore, private db: AngularFireDatabase, private http: HttpClient, private notify: NotifyService) {
      this.headers.set('Content-Type', 'application/json; charset=utf-8');
      this.productsCollection = this.afs.collection('products', (ref) => ref.orderBy('status').limit(5));
   }
   getDistancePlace(ulat: any, ulng: any, dlat: any, dlng: any) {
      // tslint:disable-next-line:max-line-length
      const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${ulat},${ulng}&destination=${dlat},${dlng}&key=AIzaSyAL-QZaz0TObbwMZd_KXqj1Aq7xZ6Ylegc&radius=500&sensor=false&mode=driving&alternatives=true`;
      return this.http.get(apiUrl, { headers: this.headers, responseType: 'json' });
   }
   // Get all Published product
   getAllProduct() {
      // tslint:disable-next-line:max-line-length
      this.productsCollection.ref.where('status', '==', 'published').get().then((snapshot) => {
         const allProd: any = [];
         snapshot.forEach((doc) => {
            if (doc.exists) {
               const singleProd = doc.data();
               singleProd.pid = doc.id;
               this.afs.collection('users').doc(singleProd.userId)
                  .ref
                  .get().then((userDoc) => {
                     if (userDoc.exists) {
                        const user = userDoc.data();
                        singleProd.photoURL = user.photoURL;
                        singleProd.firstName = user.firstName;
                        singleProd.lastName = user.lastName;
                     } else {
                        // doc.data() will be undefined in this case
                        console.log('No such document!');
                     }
                     allProd.push(singleProd);
                  });
            } else {
               // doc.data() will be undefined in this case
               console.log('No such document!');
            }
            this._allPublishproduct.next(allProd);
         });
      }).catch((error) => this.handleError(error));
      return this._allPublishproduct.asObservable();
   } // getAllProduct();

   // If error, console log and notify user
   private handleError(error: Error) {
      console.error(error);
      this.notify.update(error.message, 'error');
   }

   /**
    * @description Calculate distance between to places
    * @param lat1 latitude of current location
    * @param lon1 longitude of current location
    * @param lat2 latitude of product
    * @param lon2 longitude of product
    */
   calcCrow(lat1: any, lon1: any, lat2: any, lon2: any) {
      const R = 6371; // km
      const dLat = this.toRad(lat2 - lat1);
      const dLon = this.toRad(lon2 - lon1);
      const olat1 = this.toRad(lat1);
      const olat2 = this.toRad(lat2);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(olat1) * Math.cos(olat2);
      const c = Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 2;
      const d = R * c;
      const num = Number(d); // The Number() only visualizes the type and is not needed
      const roundedString = num.toFixed(2);
      const rounded = Number(roundedString);
      return rounded;
   }
   // Converts numeric degrees to radians
   private toRad(Value: any) {
      return Value * Math.PI / 180;
   }
}
