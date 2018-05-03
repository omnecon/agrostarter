import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Upload } from './upload';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { product } from './product';

import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
// import * as GeoFire from 'geofire';

@Injectable()
export class ProductService {
   basePath = 'products';
   imgbasePath = 'my-product-imgs';
   uploadsRef: AngularFireList<Upload>;
   uploads: Observable<Upload[]>;
   uid: any;
   productsCollection: AngularFirestoreCollection<product>;
   productsDocument: AngularFirestoreDocument<product>;

   constructor(private afs: AngularFirestore, private db: AngularFireDatabase) {
      const newUser: any = JSON.parse(window.localStorage.getItem('user'));
      this.uid = newUser.uid;
      this.productsCollection = this.afs.collection('products', (ref) => ref.orderBy('status').limit(5));
   }

   createProduct(productData: any) {
      //  this.afs.collection('test').doc('p1').set(productData).then();
      return this.productsCollection.add(productData).then((data) => {
         console.log('create product data == ', data);
      });
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
      const uploadTask = storageRef.child(`${this.imgbasePath}/${upload.file.name}`).put(upload.file);

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
               upload.name = upload.file.name;
               upload.uid = this.uid;
               this.saveFileData(upload);
               return;
            } else {
               console.error('No download URL!');
            }
         },
      );
   }

   // Writes the file details to the realtime db
   private saveFileData(upload: Upload) {
      this.db.list(`${this.imgbasePath}/`).push(upload);
   }

}
