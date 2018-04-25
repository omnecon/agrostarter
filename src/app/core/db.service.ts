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

   writeUserData(fName: string, lName: string) {
      const user: any = firebase.auth().currentUser;
      console.log('user.uid   ===== ', user.uid);
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
      const data: User = {
         uid: user.uid,
         email: user.email || null,
         photoURL: user.photoURL || 'https://goo.gl/Fz9nrQ',
         displayName: user.displayName || (`${fName} ${lName}`),
         postCode: '',
         lastName: lName,
         dateOfBirth: '',
         firstName: fName,
         streetNameNumber: '',
         city: '',
         isNewsletterEnabled: true,
         country: '',
         isMale: true,
         isNotifictionsEnalbe: true,
         phone: '',
      };
      return userRef.set(data);
   }
}
