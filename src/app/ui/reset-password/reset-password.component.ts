import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import * as firebase from 'firebase/app';
type UserFields = 'email';
type FormErrors = { [u in UserFields]: string };
@Component({
   selector: 'reset-password',
   templateUrl: './reset-password.component.html',
   styleUrls: ['./reset-password.component.scss'],
})
export class ResetPassComponent implements OnInit {
   resetPassForm: FormGroup;
   formErrors: FormErrors = {
      'email': '',
   };
   validationMessages = {
      'email': {
         'required': 'Email is required.',
         'email': 'Email must be a valid email',
      },
   };

   constructor(public auth: AuthService, private router: Router, private fb: FormBuilder) {

   }
   ngOnInit() {
      this.buildForm();
   }

   resetPassword() {
      this.auth.resetPassword(this.resetPassForm.value['email'])
         .then(() => {
            console.log('Check your email to reset your password');
            this.router.navigate(['/login']);
         });
   }

   buildForm() {
      this.resetPassForm = this.fb.group({
         'email': ['', [
            Validators.required,
            Validators.email,
         ]],
      });

      this.resetPassForm.valueChanges.subscribe((data) => this.onValueChanged(data));
      this.onValueChanged(); // reset validation messages
   }

   // Updates validation state on form changes.
   onValueChanged(data?: any) {
      if (!this.resetPassForm) { return; }
      const form = this.resetPassForm;
      for (const field in this.formErrors) {
         // tslint:disable-next-line:max-line-length
         if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'email')) {
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
   }

}
