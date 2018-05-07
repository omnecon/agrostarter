import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';

import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Headers } from '@angular/http';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { product } from '../../product/shared/product';

@Injectable()
export class HomeService {
   private headers: HttpHeaders = new HttpHeaders();
   private _product: Subject<any> = new Subject<any>();
   private _offers: Subject<any> = new Subject<any>();
   private _productImg: Subject<any> = new Subject<any>();
   basePath = 'products';
   imgbasePath = 'user-product-images';
   uid: any;
   productsCollection: AngularFirestoreCollection<product>;
   productsDocument: AngularFirestoreDocument<product>;

   constructor(private afs: AngularFirestore, private db: AngularFireDatabase, private http: HttpClient) {
      // const newUser: any = JSON.parse(window.localStorage.getItem('user'));
      // // this.uid = newUser.uid;
      // this.productsCollection = this.afs.collection('products', (ref) => ref.orderBy('status').limit(5));
      this.headers.set('Content-Type', 'application/json; charset=utf-8');
   }

   getProduct(id: string) {
      this.afs.collection('products').doc(id).ref.get().then((doc) => {
         if (doc.exists) {
            this._product.next(doc.data());
         } else {
            // doc.data() will be undefined in this case
            console.log('No such document!');
         }
      });
      return this._product.asObservable();
   }

   getOffers() {
      this.afs.collection('offers').ref.get().then((snapshot) => {
         snapshot.forEach((doc) => {
            if (doc.exists) {
               this._offers.next(doc.data());
            } else {
               // doc.data() will be undefined in this case
               console.log('No such document!');
            }
         });
      });
      return this._offers.asObservable();
   }

   createProduct(productData: any) {
      this.productsCollection.add(productData).then((data) => {

         productData.pid = data.id;
         this._product.next(productData);
      });
      return this._product.asObservable();
   }

   getCurrentLocation(lat: any, lng: any): Observable<any> {
      // tslint:disable-next-line:max-line-length
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAL-QZaz0TObbwMZd_KXqj1Aq7xZ6Ylegc&latlng=${lat},${lng}&sensor=true`;
      return this.http.get(apiUrl, { headers: this.headers, responseType: 'json' });
   }

   getCurrentLocationProd(location: Geolocation) {
      // tslint:disable-next-line:max-line-length
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAL-QZaz0TObbwMZd_KXqj1Aq7xZ6Ylegc&latlng=${location}&sensor=true`;
      return this.http.get(apiUrl, { headers: this.headers, responseType: 'json' });
   }

   getUpdatedLocation(address: any) {
      // tslint:disable-next-line:max-line-length
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address};key=AIzaSyAL-QZaz0TObbwMZd_KXqj1Aq7xZ6Ylegc`;
      return this.http.get(apiUrl, { headers: this.headers, responseType: 'json' });
   }

}
