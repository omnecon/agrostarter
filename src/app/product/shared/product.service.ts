import { Injectable, OnInit } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Upload } from './upload';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AuthService } from '../../core/auth.service';
import { product } from './product';
import { NotifyService } from '../../core/notify.service';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Headers } from '@angular/http';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable()
export class ProductService {
   private headers: HttpHeaders = new HttpHeaders();
   private _product: Subject<any> = new Subject<any>();
   private _imgUpload: Subject<any> = new Subject<any>();
   private _allProducts: Subject<any[]> = new Subject<any[]>();
   private _allDraftProducts: Subject<any[]> = new Subject<any[]>();
   private _allPublishProducts: Subject<any[]> = new Subject<any[]>();
   private _allSoldProducts: Subject<any[]> = new Subject<any[]>();
   private _question: Subject<any> = new Subject<any>();
   private _offers: Subject<any> = new Subject<any>();
   private _productImg: Subject<any> = new Subject<any>();
   basePath = 'products';
   imgbasePath = 'users-product-img';
   uploadsRef: AngularFireList<Upload>;
   uploads: Observable<Upload[]>;
   uid: any;
   pid: any;
   productsCollection: AngularFirestoreCollection<product>;
   productsDocument: AngularFirestoreDocument<product>;

   // tslint:disable-next-line:max-line-length
   constructor(private auth: AuthService, private afs: AngularFirestore, private db: AngularFireDatabase, private http: HttpClient, private notify: NotifyService) {
      this.productsCollection = this.afs.collection('products', (ref) => ref.orderBy('status').limit(5));
      this.headers.set('Content-Type', 'application/json; charset=utf-8');
      const newUser: any = JSON.parse(window.localStorage.getItem('user'));
      // if (newUser) { this.auth.currentUser.uid = newUser.uid; }
      console.log('newUser = ', newUser);
   }

   getAllProduct() {
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
            this._allProducts.next(allProd);
         });
      }).catch((error) => this.handleError(error));
      return this._allProducts.asObservable();
   }

   getAllDraftProduct() {
      console.log('this.auth.currentUser.uid  ', this.auth.currentUser.uid);
      // tslint:disable-next-line:max-line-length
      this.productsCollection.ref.where('userId', '==', this.auth.currentUser.uid).where('status', '==', 'default').get().then((snapshot) => {
         const allProd: any = [];
         snapshot.forEach((doc) => {
            if (doc.exists) {
               const singleProd = doc.data();
               singleProd.pid = doc.id;
               allProd.push(singleProd);
            } else {
               // doc.data() will be undefined in this case
               console.log('No such document!');
            }
            this._allDraftProducts.next(allProd);

         });
      }).catch((error) => this.handleError(error));
      return this._allDraftProducts.asObservable();
   }

   getAllPublishProduct() {
      // tslint:disable-next-line:max-line-length
      this.productsCollection.ref.where('userId', '==', this.auth.currentUser.uid).where('status', '==', 'published').get().then((snapshot) => {
         const allProd: any = [];
         snapshot.forEach((doc) => {
            if (doc.exists) {
               const singleProd = doc.data();
               singleProd.pid = doc.id;
               allProd.push(singleProd);
            } else {
               // doc.data() will be undefined in this case
               console.log('No such document!');
            }
            this._allPublishProducts.next(allProd);

         });
      }).catch((error) => this.handleError(error));
      return this._allPublishProducts.asObservable();
   }

   getAllSoldProduct() {
      this.productsCollection.ref.where('userId', '==', this.auth.currentUser.uid).where('status', '==', 'sold').get().then((snapshot) => {
         const allProd: any = [];
         snapshot.forEach((doc) => {
            if (doc.exists) {
               const singleProd = doc.data();
               singleProd.pid = doc.id;
               allProd.push(singleProd);
            } else {
               // doc.data() will be undefined in this case
               console.log('No such document!');
            }
            this._allSoldProducts.next(allProd);

         });
      }).catch((error) => this.handleError(error));
      return this._allSoldProducts.asObservable();
   }

   getProduct(id: string) {
      this.afs.collection('products').doc(id).ref.get().then((doc) => {
         if (doc.exists) {
            this._product.next(doc.data());
         } else {
            // doc.data() will be undefined in this case
            console.log('No such document!');
         }
      }).catch((error) => this.handleError(error));
      return this._product.asObservable();
   }

   getOffers() {
      this.afs.collection('offers', (ref) => ref.where('userId', '==', this.auth.currentUser.uid)).ref.get().then((snapshot) => {
         snapshot.forEach((doc) => {
            if (doc.exists) {
               this._offers.next(doc.data());
            } else {
               // doc.data() will be undefined in this case
               console.log('No such document!');
            }
         });
      }).catch((error) => this.handleError(error));
      return this._offers.asObservable();
   }

   createProduct(productData: product) {
      this.productsCollection.add(productData).then((data) => {
         productData.pid = data.id;
         this._product.next(productData);
      }).catch((error) => this.handleError(error));
      return this._product.asObservable();
   }

   createQue(queData: any) {
      const qData = {
         question: queData.question,
         ans: '',
         pid: queData.pid,
         uid: this.auth.currentUser.uid,
      };
      this.afs.collection('products').doc(queData.pid).collection('questions').add(qData).then((data) => {
         queData.qid = data.id;
         this._question.next(queData);
      }).catch((error) => this.handleError(error));
      return this._question.asObservable();
   }

   createOffers(offerData: any) {
      this.afs.collection('offers').ref.add(offerData).then((data) => {
         this._offers.next(offerData);
      }).catch((error) => this.handleError(error));
      return this._offers.asObservable();
   }

   getQue(pid: string) {
      this.afs.collection('products').doc(pid).collection('questions').ref.get().then((data) => {
         this._question.next(data);
         // doc.data() will be undefined in this case
         // console.log('all que', data);

      }).catch((error) => this.handleError(error));
      return this._question.asObservable();
   }

   // ////////////// upload image //////////
   getUploads() {
      this.uploads = this.db.list(this.imgbasePath).snapshotChanges().map((actions) => {
         return actions.map((a) => {
            const data = a.payload.val();
            const $key = a.payload.key;
            return { $key, ...data };
         });
      });
      return this.uploads;
   }

   // Executes the file uploading to firebase https://firebase.google.com/docs/storage/web/upload-files
   pushUpload(upload: Upload) {
      const storageRef = firebase.storage().ref();
      const ext = upload.file.name.split('.').pop();
      const timestamp = new Date().getTime().toString();
      const filename = `agruno_${this.auth.currentUser.uid}_${timestamp}.${ext}`;
      const uploadTask = storageRef.child(`${this.imgbasePath}/${filename}`).put(upload.file);

      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
         (snapshot: any) => {
            // upload in progress
            const snap = snapshot;
            upload.progress = (snap.bytesTransferred / snap.totalBytes) * 100;
         },
         (error) => {
            // upload failed
            console.log(error);
         },
         () => {
            // upload success
            if (uploadTask.snapshot.downloadURL) {
               upload.url = uploadTask.snapshot.downloadURL;
               upload.name = filename;
               upload.uid = this.auth.currentUser.uid;

               this.saveFileData(upload);
               return;
            } else {
               console.error('No download URL!');
            }
         },
      );
      return this._imgUpload.asObservable();
   }

   // Writes the file details to the realtime db
   private saveFileData(upload: Upload) {
      return this.db.list(`${this.imgbasePath}/`).push(upload).then((data) => {
         upload.$key = data.key;
         this._imgUpload.next(upload);
      });
   }

   deleteUpload(upload: any) {
      const name = upload.caption;
      this.deleteFileData(upload.$key)
         .then(() => {
            this.deleteFileStorage(name).then(() => {
               this._productImg.next();
            });
         }).catch((error) => this.handleError(error));
      return this._productImg.asObservable();
   }

   // Writes the file details to the realtime db
   private deleteFileData(key: string) {
      return this.db.list(`${this.imgbasePath}/`).remove(key);
   }

   // Firebase files must have unique names in their respective storage dir
   // So the name serves as a unique key
   private deleteFileStorage(name: string) {
      const storageRef = firebase.storage().ref();
      return storageRef.child(`${this.imgbasePath}/${name}`).delete();
   }

   getCurrentLocation(lat: any, lng: any): Observable<any> {
      // tslint:disable-next-line:max-line-length
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAL-QZaz0TObbwMZd_KXqj1Aq7xZ6Ylegc&latlng=${lat},${lng}&sensor=true`;
      return this.http.get(apiUrl, { headers: this.headers, responseType: 'json' });
   }

   getCurrentLocationProd(location: number[]) {
      // tslint:disable-next-line:max-line-length
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAL-QZaz0TObbwMZd_KXqj1Aq7xZ6Ylegc&latlng=${location}&sensor=true`;
      return this.http.get(apiUrl, { headers: this.headers, responseType: 'json' });
   }

   getUpdatedLocation(address: any) {
      // tslint:disable-next-line:max-line-length
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address};key=AIzaSyAL-QZaz0TObbwMZd_KXqj1Aq7xZ6Ylegc`;
      return this.http.get(apiUrl, { headers: this.headers, responseType: 'json' });
   }

   // If error, console log and notify user
   private handleError(error: Error) {
      console.error(error);
      this.notify.update(error.message, 'error');
   }
}
