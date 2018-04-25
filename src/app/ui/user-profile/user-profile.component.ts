import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

import { DbService } from '../../core/db.service';
type UserProfileFields = 'email' | 'gender';
type FormProfileErrors = { [u in UserProfileFields]: string };

@Component({
   selector: 'user-profile',
   templateUrl: './user-profile.component.html',
   styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
   userProfileForm: FormGroup;
   formErrors: FormProfileErrors = {
      'email': '',
      'gender': '',
   };
   validationMessages = {
      'email': {
         'required': 'Email is required.',
         'email': 'Email must be a valid email',
      },
   };
   constructor(public auth: AuthService, public db: DbService, private fb: FormBuilder) { }
   ngOnInit() {
      this.buildForm();
   }
   buildForm() {
      // Login Forms
      this.userProfileForm = this.fb.group({
         'email': ['', [
            Validators.required,
            Validators.email,
         ]],
         'gender': [true],
      });

      this.userProfileForm.valueChanges.subscribe((data) => this.onValueChanged(data));

      this.onValueChanged(); // reset validation messages
   }
   onValueChanged(data?: any) {

      if (!this.userProfileForm) { return; }
      const form = this.userProfileForm;
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
   updateProfile() {
      // Get a reference to the database service
      // this.db.writeUserData('Poonam', 'Pardeshi');

   }
}
