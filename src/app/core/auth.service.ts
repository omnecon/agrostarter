import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { NotifyService } from './notify.service';

import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';
import { User } from '../models';

@Injectable()
export class AuthService {
   actionCodeSettings = {
      url: ``,
      handleCodeInApp: false,
   };
   currentUser: any;
   user: Observable<User | null>;
   private userDoc: AngularFirestoreDocument<User>;
   accessToken = '';
   constructor(private afAuth: AngularFireAuth,
      private afs: AngularFirestore,
      private router: Router,
      private notify: NotifyService) {

      this.user = this.afAuth.authState
         .switchMap((user) => {
            if (user) {
               return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
            } else {
               return Observable.of(null);
            }
         });
   }

   ////// OAuth Methods /////

   googleLogin() {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
      provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');
      provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      return this.oAuthLogin(provider);
   }

   facebookLogin() {
      const provider = new firebase.auth.FacebookAuthProvider();
      provider.addScope('user_birthday');
      return this.oAuthLogin(provider);
   }

   private oAuthLogin(provider: firebase.auth.AuthProvider) {
      return this.afAuth.auth.signInWithPopup(provider)
         .then((result) => {
            // The signed-in user info.
            const user = result.user;
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            this.accessToken = result.credential.accessToken;
            const additionalUserInfo = result.additionalUserInfo.profile;
            const providerId = result.additionalUserInfo.providerId;
            this.afs.collection('users')
               .doc(user.uid)
               .ref
               .get().then((doc) => {
                  if (doc.exists) {
                     const data = {
                        uid: user.uid,
                     };
                     this.notify.update('Welcome to Agrostarter!!!', 'success');
                     this.updateUserData(data);
                  } else {
                     if (providerId === 'facebook.com') {
                        const data = {
                           uid: user.uid,
                           email: user.email || null,
                           photoURL: user.photoURL || 'https://goo.gl/Fz9nrQ',
                           firstName: additionalUserInfo.first_name,
                           lastName: additionalUserInfo.last_name,
                           isMale: (additionalUserInfo.gender === 'male') ? true : false,
                           dataOfBirth: additionalUserInfo.birthday,
                        };
                        this.notify.update('Welcome to Agrostarter!!!', 'success');
                        this.setUserData(data, true);
                     } else {
                        const data = {
                           uid: user.uid,
                           email: user.email || null,
                           photoURL: additionalUserInfo.picture,
                           firstName: additionalUserInfo.given_name,
                           lastName: additionalUserInfo.family_name,
                           isMale: (additionalUserInfo.gender === 'male') ? true : false,
                        };
                        this.notify.update('Welcome to Agrostarter!!!', 'success');
                        this.setUserData(data, true);
                     }
                  }
               }).catch((error) => {
                  console.log('Error getting document:', error);
               });
         })
         .catch((error) => this.handleError(error));
   }

   //// Email/Password Auth ////
   emailSignUp(email: string, password: string) {
      return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
         .then((user: User) => {
            user.terms = true;
            window.localStorage.setItem('user', JSON.stringify(user));
            return user;
         })
         .catch((error) => this.handleError(error));
   }

   emailLogin(email: string, password: string) {
      return this.afAuth.auth.signInWithEmailAndPassword(email, password)
         .then((user) => {
            this.notify.update('Welcome to Agrostarter!!!', 'success');

            this.updateUserData(user); // if using firestore
         })
         .catch((error) => this.handleError(error));
   }

   // Sends email allowing user to reset password
   resetPassword(email: string) {
      const fbAuth = firebase.auth();
      this.actionCodeSettings.url = `http://localhost:4200/login`;

      return fbAuth.sendPasswordResetEmail(email, this.actionCodeSettings)
         .then(() => this.notify.update('Password update email sent', 'info'))
         .catch((error) => this.handleError(error));
   }

   signOut() {
      this.afAuth.auth.signOut().then(() => {

         this.router.navigate(['/login']);
      });
   }

   // If error, console log and notify user
   private handleError(error: Error) {
      console.error(error);
      this.notify.update(error.message, 'error');
   }

   // Sets user data to firestore after succesful login
   updateUserData(user: any) {
      const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
      const data = {
         uid: user.uid,
      };
      this.currentUser = data;
      window.localStorage.setItem('user', JSON.stringify(user));
      return userRef.set(data, { merge: true });
   }

   // Sets user data to firestore after succesful sigin
   setUserData(user: any, newUser?: boolean) {
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
      const data: User = {
         uid: user.uid,
         email: user.email || null,
         photoURL: user.photoURL || 'https://goo.gl/Fz9nrQ',
         postCode: '',
         lastName: user.lastName || '',
         dataOfBirth: user.dataOfBirth || '',
         firstName: user.firstName || '',
         streetNameNumber: '',
         city: '',
         isNewsletterEnabled: true,
         country: '',
         isMale: user.isMale || true,
         isNotifictionsEnabled: true,
         phone: '',
         agbAcceptedDate: '',
         isAgbAccepted: true,
         accessToken: this.accessToken,
         terms: true,
      };
      if (newUser) {
         data.agbAcceptedDate = new Date();
      }
      this.currentUser = data;
      window.localStorage.setItem('user', JSON.stringify(data));
      return userRef.set(data);
   }
}
