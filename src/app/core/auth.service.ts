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

   user: Observable<User | null>;

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
      return this.oAuthLogin(provider);
   }

   githubLogin() {
      const provider = new firebase.auth.GithubAuthProvider();
      return this.oAuthLogin(provider);
   }

   facebookLogin() {
      const provider = new firebase.auth.FacebookAuthProvider();
      return this.oAuthLogin(provider);
   }

   twitterLogin() {
      const provider = new firebase.auth.TwitterAuthProvider();
      return this.oAuthLogin(provider);
   }

   private oAuthLogin(provider: firebase.auth.AuthProvider) {
      return this.afAuth.auth.signInWithPopup(provider)
         .then((credential) => {
            this.notify.update('Welcome to Agrostarter!!!', 'success');
            return this.updateUserData(credential.user);
         })
         .catch((error) => this.handleError(error));
   }

   //// Anonymous Auth ////

   anonymousLogin() {
      return this.afAuth.auth.signInAnonymously()
         .then((user) => {
            this.notify.update('Welcome to Agrostarter!!!', 'success');
            return this.updateUserData(user); // if using firestore
         })
         .catch((error) => {
            console.error(error.code);
            console.error(error.message);
            this.handleError(error);
         });
   }

   //// Email/Password Auth ////

   emailSignUp(email: string, password: string) {
      return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
         .then((user) => {
            // return this.updateUserData(user); // if using firestore
            window.localStorage.setItem('user', JSON.stringify(user));
            return user;
         })
         .catch((error) => this.handleError(error));
   }

   emailLogin(email: string, password: string) {
      return this.afAuth.auth.signInWithEmailAndPassword(email, password)
         .then((user) => {
            this.notify.update('Welcome to Agrostarter!!!', 'success')
            return this.updateUserData(user); // if using firestore
         })
         .catch((error) => this.handleError(error));
   }

   // Sends email allowing user to reset password
   resetPassword(email: string) {
      const fbAuth = firebase.auth();

      return fbAuth.sendPasswordResetEmail(email)
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
   updateUserData(user: User, newUser?: boolean) {
      console.log('user.uid   ===== ', user.uid);
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
      // const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      const data: User = {
         uid: user.uid,
         email: user.email || null,
         photoURL: user.photoURL || 'https://goo.gl/Fz9nrQ',
         postCode: '',
         lastName: '',
         dataOfBirth: '',
         firstName: '',
         streetNameNumber: '',
         city: '',
         isNewsletterEnabled: true,
         country: '',
         isMale: true,
         isNotifictionsEnabled: true,
         phone: '',
         agbAcceptedDate: '',
         isAgbAccepted: true,
      };
      if (newUser) {
         data.agbAcceptedDate = new Date();
      }
      window.localStorage.setItem('user', JSON.stringify(data));
      return userRef.set(data);
   }
}