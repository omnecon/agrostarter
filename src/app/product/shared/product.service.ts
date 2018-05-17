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
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';

@Injectable()
export class ProductService {
   currentOffer: any;
   private headers: HttpHeaders = new HttpHeaders();
   private response: HttpResponse<any>;
   private _product: Subject<any> = new Subject<any>();
   private _productList: Subject<any> = new Subject<any>();
   private _imgUpload: Subject<any> = new Subject<any>();
   private _allProducts: Subject<any[]> = new Subject<any[]>();
   private _allDraftProducts: Subject<any[]> = new Subject<any[]>();
   private _allPublishProducts: Subject<any[]> = new Subject<any[]>();
   private _allWishProducts: Subject<any[]> = new Subject<any[]>();
   private _allSoldProducts: Subject<any[]> = new Subject<any[]>();
   private _question: Subject<any> = new Subject<any>();
   private _offers: Subject<any> = new Subject<any>();
   private _offersOwner: Subject<any> = new Subject<any>();
   private _productImg: Subject<any> = new Subject<any>();
   basePath = 'products';
   imgbasePath = 'user-products-imgs';
   uploadsRef: AngularFireList<Upload>;
   uploads: Observable<Upload[]>;
   uid: any;
   pid: any;
   productsCollection: AngularFirestoreCollection<product>;
   productsDocument: AngularFirestoreDocument<product>;
   offersCollection: AngularFirestoreCollection<any>;
   // tslint:disable-next-line:max-line-length
   constructor(private auth: AuthService, private afs: AngularFirestore, private db: AngularFireDatabase, private http: HttpClient, private notify: NotifyService) {
      this.productsCollection = this.afs.collection('products', (ref) => ref.orderBy('status').limit(5));
      this.offersCollection = this.afs.collection('offers', (ref) => ref.orderBy('price').limit(5));
      this.headers.set('Content-Type', 'application/json; charset=utf-8');
      const newUser: any = JSON.parse(window.localStorage.getItem('user'));
      if (newUser) {
         this.uid = newUser.uid;
      } else {
         this.auth.user.subscribe((user) => {
            if (user) {
               this.uid = user.uid;
            } else {
               this.uid = this.auth.currentUser;
            }
         });
      }
   }
   // Get all Published product
   getAllProduct() {
      this.productsCollection.ref.get().then((snapshot) => {
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

   getAllDraftProduct(uid: any) {
      // tslint:disable-next-line:max-line-length
      this.productsCollection.ref.where('userId', '==', uid).where('status', '==', 'default').get().then((snapshot) => {
         const allProd: any = [];
         snapshot.forEach((doc) => {
            if (doc.exists) {
               const singleProd = doc.data();
               console.log('doc.id    ==== ', doc.id);
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

   getAllPublishProduct(uid: any) {
      // tslint:disable-next-line:max-line-length
      this.productsCollection.ref.where('userId', '==', uid).where('status', '==', 'published').get().then((snapshot) => {
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

   getAllWishProduct(uid: any) {
      // tslint:disable-next-line:max-line-length
      this.productsCollection.ref.where('userId', '==', uid).where('status', '==', 'wishlist').get().then((snapshot) => {
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
            this._allWishProducts.next(allProd);

         });
      }).catch((error) => this.handleError(error));
      return this._allWishProducts.asObservable();
   }

   getAllSoldProduct(uid: any) {
      this.productsCollection.ref.where('userId', '==', uid).where('status', '==', 'sold').get()
         .then((snapshot) => {
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

   getProductList(id: string) {
      this.afs.collection('products').doc(id).ref.get().then((doc) => {
         if (doc.exists) {
            this._productList.next(doc.data());
         } else {
            // doc.data() will be undefined in this case
            console.log('No such document!');
         }
      }).catch((error) => this.handleError(error));
      return this._productList.asObservable();
   }

   getOffers(pid: string) {
      this.offersCollection.ref.where('productId', '==', pid).get().then((snapshot) => {
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
   getOwnerOffers(pid: string) {
      this.offersCollection.ref.where('productId', '==', pid).where('userId', '==', this.uid).get().then((snapshot) => {
         snapshot.forEach((doc) => {
            if (doc.exists) {
               this._offersOwner.next(doc.data());
            } else {
               // doc.data() will be undefined in this case
               console.log('No such document!');
            }
         });
      }).catch((error) => this.handleError(error));
      return this._offersOwner.asObservable();
   }
   createProduct(productData: product) {
      this.productsCollection.add(productData).then((data) => {
         productData.pid = data.id;
         this._product.next(productData);
      }).catch((error) => this.handleError(error));
      return this._product.asObservable();
   }

   editProduct(productData: product) {
      const id = productData.pid;
      this.afs.collection('products').doc(id).update(productData).then((data) => {
         this._product.next(productData);
      }).catch((error) => this.handleError(error));
      return this._product.asObservable();
   }

   createQue(queData: any) {
      const qData = {
         question: queData.question,
         ans: '',
         pid: queData.pid,
         uid: this.uid,
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
      const TS = window.performance.timing.navigationStart + window.performance.now();
      // const timestamp = new Date().getTime().toString();
      const filename = `agruno_${this.uid}_${TS}.${ext}`;
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
               upload.uid = this.uid;

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

   getUserLocation(): Observable<any> {
      const httpOptions = {
         headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'my-auth-token',
         }),
      };
      const key = { 'key': 'AIzaSyAL-QZaz0TObbwMZd_KXqj1Aq7xZ6Ylegc' };
      const apiUrl = `https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAL-QZaz0TObbwMZd_KXqj1Aq7xZ6Ylegc`;
      return this.http.post<any>(apiUrl, httpOptions);
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
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyAL-QZaz0TObbwMZd_KXqj1Aq7xZ6Ylegc`;
      return this.http.get(apiUrl, { headers: this.headers, responseType: 'json' });
   }

   // If error, console log and notify user
   private handleError(error: Error) {
      console.error(error);
      this.notify.update(error.message, 'error');
   }
}
