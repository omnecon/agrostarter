import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { NotifyService } from '../../core/notify.service';
import * as firebase from 'firebase/app';
type UserFields = 'email' | 'password';
type UserRegFields = 'email' | 'password' | 'terms';
type FormErrors = { [u in UserFields]: string };
type FormRegErrors = { [u in UserRegFields]: string };
@Component({
   selector: 'user-login',
   templateUrl: './user-login.component.html',
   styleUrls: ['./user-login.component.scss'],
})
export class UserLoginComponent implements OnInit {
   actionCodeSettings = {
      url: ``,
      handleCodeInApp: false,
   };
   userForm: FormGroup;
   userRegistrationForm: FormGroup;
   passReset = false; // set to true when password reset is triggered
   formErrors: FormErrors = {
      'email': '',
      'password': '',
   };
   formRegErrors: FormRegErrors = {
      'email': '',
      'password': '',
      'terms': '',
   };
   validationMessages = {
      'email': {
         'required': 'Email is required.',
         'email': 'Email must be a valid email',
      },
      'password': {
         'required': 'Password is required.',
         'pattern': 'Password must be include at one letter and one number.',
         'minlength': 'Password must be at least 4 characters long.',
         'maxlength': 'Password cannot be more than 40 characters long.',
      },
      'terms': {
         'required': 'Please accept the trams.',
      },
   };
   tabIndex = 0;
   constructor(public auth: AuthService, private router: Router, private fb: FormBuilder, private notify: NotifyService) {
      console.log('router.url == ', router.url);
      if (router.url === '/register') {
         this.tabIndex = 1;
      } else if (router.url === '/login') {
         this.tabIndex = 0;
      } else {
         this.tabIndex = 0;
      }
   }
   ngOnInit() {
      this.buildForm();
   }
   buildForm() {
      // Login Forms
      this.userForm = this.fb.group({
         'email': ['', [
            Validators.required,
            Validators.email,
         ]],
         'password': ['', [
            Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
            Validators.minLength(6),
            Validators.maxLength(25),
         ]],
      });
      // Registration Forms
      this.userRegistrationForm = this.fb.group({
         'email': ['', [
            Validators.required,
            Validators.email,
         ]],
         'password': ['', [
            Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
            Validators.minLength(6),
            Validators.maxLength(25),
         ]],
         'terms': ['', [
            Validators.required,
         ]],
      });
      this.userForm.valueChanges.subscribe((data) => this.onValueChanged(data, 'login'));
      this.userRegistrationForm.valueChanges.subscribe((data) => this.onValueChanged(data, 'register'));
      this.onValueChanged(); // reset validation messages
   }
   login() {
      this.auth.emailLogin(this.userForm.value['email'], this.userForm.value['password']).then((data) => {
         console.log('login data ==> ', data);
         this.afterSignIn();
      });
   }
   signup() {
      console.log(this.userRegistrationForm.value['email']);
      // tslint:disable-next-line:max-line-length
      this.auth.emailSignUp(this.userRegistrationForm.value['email'], this.userRegistrationForm.value['password']).then((data) => {
         console.log('signup data ==> ', data);
         // this.auth.updateUserData(user)
         this.sendNewEmailVerification();
         // this.afterSignIn();
      });
   }

   // Sends email allowing user to reset password
   sendNewEmailVerification() {
      const user: any = firebase.auth().currentUser;
      // this.auth.updateUserData(user)
      const email = user.email.toString().trim();
      this.actionCodeSettings.url = `http://localhost:4200/account-activation/?email=${email}`;
      user.sendEmailVerification(this.actionCodeSettings)
         .then(() => this.notify.update('Please verify your email', 'info'));
   }

   resetPassword() {
      this.router.navigate(['/reset-password']);
   }



   // Updates validation state on form changes.
   // tslint:disable-next-line:cyclomatic-complexity
   onValueChanged(data?: any, formName?: any) {
      if (formName === 'login') {
         if (!this.userForm) { return; }
         const form = this.userForm;
         for (const field in this.formErrors) {
            // tslint:disable-next-line:max-line-length
            if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'email' || field === 'password')) {
               // clear previous error message (if any)
               this.formErrors[field] = '';
               const control = form.get(field);
               if (control && control.dirty && !control.valid) {
                  const messages = this.validationMessages[field];
                  if (control.errors) {
                     for (const key in control.errors) {
                        if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                           this.formErrors[field] += `${(messages as { [key: string]: string })[key]} `;
                        }
                     }
                  }
               }
            }
         }
      } else {
         if (!this.userRegistrationForm) { return; }
         const form = this.userRegistrationForm;
         for (const field in this.formRegErrors) {
            // tslint:disable-next-line:max-line-length
            if (Object.prototype.hasOwnProperty.call(this.formRegErrors, field) && (field === 'email' || field === 'password' || field === 'terms')) {
               // clear previous error message (if any)
               this.formRegErrors[field] = '';
               const control = form.get(field);
               if (control && control.dirty && !control.valid) {
                  const messages = this.validationMessages[field];
                  if (control.errors) {
                     for (const key in control.errors) {
                        if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                           this.formRegErrors[field] += `${(messages as { [key: string]: string })[key]} `;
                        }
                     }
                  }
               }
            }
         }
      }
   }

   /// Social Login
   signInWithGoogle() {
      this.auth.googleLogin()
         .then(() => this.afterSignIn());
   }

   signInWithFacebook() {
      this.auth.facebookLogin()
         .then(() => this.afterSignIn());
   }

   /// Shared

   private afterSignIn() {
      // Do after login stuff here, such router redirects, toast messages, etc.
      this.router.navigate(['/']);
   }
   onTabChange(index: any) {
      console.log('tab changed', index);
      this.tabIndex = index;
   }
}
