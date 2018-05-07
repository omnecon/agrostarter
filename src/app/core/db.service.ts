// Get a reference to the database service

import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import { User, Upload } from '../models';

@Injectable()
export class DbService {
   uid: any;
   imgbasePath = 'users-images';
   uploads: Observable<Upload[]>;
   private _myPic: Subject<any> = new Subject<any>();
   currentUserProfileImg: any;
   constructor(private db: AngularFireDatabase) {
      const newUser: any = JSON.parse(window.localStorage.getItem('user'));
      this.uid = newUser.uid;
   }

   pushUpload(upload: Upload) {
      const storageRef = firebase.storage().ref();
      const ext = upload.file.name.split('.').pop();
      const timestamp = new Date().getTime().toString();
      const filename = `agruno_user_${this.uid}_${timestamp}.${ext}`;
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
               this.currentUserProfileImg = uploadTask.snapshot.downloadURL;
               upload.url = this.currentUserProfileImg;
               upload.name = filename;
               upload.uid = this.uid;
               this.saveFileData(upload);
               this._myPic.next(this.currentUserProfileImg);
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

   getUploads() {
      return this._myPic.asObservable();
   }

}
