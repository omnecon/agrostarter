import { Component, OnInit, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { User } from '../../models';
import { DbService } from '../../core/db.service';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
type UserProfileFields = 'email' | 'phone';
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
      'phone': '',
   };
   validationMessages = {
      'email': {
         'required': 'Email is required.',
         'email': 'Email must be a valid email',
      },
      'phone': {
         'pattern': 'Phone number must be 10 digit number.',
      },
   };
   startDate: Date;
   uid: any;
   user: any;
   dob: any;
   private userDoc: AngularFirestoreDocument<User>;
   userProfile: Observable<User>;
   pic: any;
   imagem = '';
   showNoImg = true;
   // tslint:disable-next-line:max-line-length
   constructor(public auth: AuthService, public db: DbService, private fb: FormBuilder, private afs: AngularFirestore, private sanitizer: DomSanitizer) {
      this.startDate = new Date(1990, 0, 1);
      const newUser: any = window.localStorage.getItem('user');
      const finalUser = JSON.parse(newUser);
      this.uid = finalUser.uid;

      this.userProfileForm = this.fb.group({
         'email': ['', [
            Validators.required,
            Validators.email,
         ]],
         'isMale': [true],
         'isNewsletterEnabled': [true],
         'isNotifictionsEnabled': [true],
         'phone': ['', Validators.pattern('^[0-9]{10}$')],
         'streetNameNumber': [''],
         'postCode': [''],
         'city': [''],
         'country': [''],
         'firstName': [''],
         'lastName': [''],
         'dataOfBirth': [''],
      });
   }
   ngOnInit() {
      this.userDoc = this.afs.doc<User>(`users/${this.uid}`);
      this.userDoc.valueChanges().subscribe((data) => {
         console.log('Data', data);
         this.user = data;
         this.buildForm(this.user);
      });

   }
   buildForm(user: User) {
      // Login Forms
      let isMale = 'yes';
      if (user.isMale) {
         isMale = 'yes';
      } else {
         isMale = 'no';
      }
      console.log('ismale == ', isMale);
      this.userProfileForm = this.fb.group({
         'email': [user.email, [
            Validators.required,
            Validators.email,
         ]],
         'isMale': [isMale],
         'isNewsletterEnabled': [user.isNewsletterEnabled || true],
         'isNotifictionsEnabled': [user.isNotifictionsEnabled || true],
         'phone': [user.phone || '', Validators.pattern('^[0-9]{10}$')],
         'streetNameNumber': [user.streetNameNumber || ''],
         'postCode': [user.postCode || ''],
         'city': [user.city || ''],
         'country': [user.country || ''],
         'firstName': [user.firstName || ''],
         'lastName': [user.lastName || ''],
         'dataOfBirth': [user.dataOfBirth],
      });
      this.imagem = user.photoURL;
      this.showNoImg = false;
      this.userProfileForm.valueChanges.subscribe((data) => this.onValueChanged(data));

      this.onValueChanged(); // reset validation messages
   }
   onValueChanged(data?: any) {

      if (!this.userProfileForm) { return; }
      const form = this.userProfileForm;
      for (const field in this.formErrors) {
         // tslint:disable-next-line:max-line-length
         if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'email' || field === 'phone')) {
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

      if (this.userProfileForm.valid) {
         console.log('this.userProfileForm.value == ', this.userProfileForm.value);
         const data: User = {
            email: this.userProfileForm.value.email,
            photoURL: this.imagem,
            postCode: this.userProfileForm.value.postCode,
            lastName: this.userProfileForm.value.lastName,
            dataOfBirth: this.userProfileForm.value.dataOfBirth,
            firstName: this.userProfileForm.value.firstName,
            streetNameNumber: this.userProfileForm.value.streetNameNumber,
            city: this.userProfileForm.value.city,
            isNewsletterEnabled: this.userProfileForm.value.isNewsletterEnabled || true,
            country: this.userProfileForm.value.country,
            isMale: (this.userProfileForm.value.isMale === 'yes') ? true : false,
            isNotifictionsEnabled: this.userProfileForm.value.isNotifictionsEnabled || true,
            phone: this.userProfileForm.value.phone,
            uid: this.uid,
         };
         // this.db.writeUserData(data);
         this.userDoc.update(data);
      }
   }

   uploadFile(event: any, midia: any) {
      const file = event.target.files[0];
      console.log('file == ', file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
         console.log('base64 do archive', reader.result);
         this.pic = reader.result;
         this.imagem = btoa(reader.result);
         this.showNoImg = false;
         console.log('base64 do archive encoded', this.imagem);
      };
      reader.onerror = (error) => {
         console.log('Erro ao ler a imagem : ', error);
      };

      // console.log('this.pic ', this.pic);
   }
}
