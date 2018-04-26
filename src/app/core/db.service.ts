// Get a reference to the database service

import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { User } from '../models';
@Injectable()
export class DbService {
   constructor(private router: Router, private afs: AngularFirestore) {

   }

   writeUserData(updateUser: User) {
      const user: any = firebase.auth().currentUser;
      console.log('user.uid   ===== ', user.uid);
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
      const data: User = {
         uid: user.uid,
         email: user.email || null,
         photoURL: updateUser.photoURL || 'https://goo.gl/Fz9nrQ',
         displayName: (`${updateUser.firstName} ${updateUser.lastName}`) || user.displayName,
         postCode: updateUser.postCode || user.postCode,
         lastName: updateUser.lastName || user.lastName,
         dataOfBirth: updateUser.dataOfBirth || user.dataOfBirth,
         firstName: updateUser.firstName || user.firstName,
         streetNameNumber: updateUser.streetNameNumber || user.streetNameNumber,
         city: updateUser.city || user.city,
         isNewsletterEnabled: updateUser.isNewsletterEnabled || user.isNewsletterEnabled,
         country: updateUser.country || user.country,
         isMale: updateUser.isMale || user.isMale,
         isNotifictionsEnabled: updateUser.isNewsletterEnabled || user.isNotifictionsEnabled,
         phone: updateUser.phone || user.phone,
      };
      return userRef.set(data).then((updateProfile: any) => {
         console.log('updateProfile ====>', updateProfile);
      });
   }

}
