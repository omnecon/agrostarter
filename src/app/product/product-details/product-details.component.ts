import { take } from 'rxjs/operators';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { ProductService } from '../shared/product.service';
import { NotifyService } from '../../core/notify.service';
import { product } from '../shared/product';
import { Upload } from '../shared/upload';
import { database } from 'firebase';
type QueFields = 'que';
type FormQueErrors = { [q in QueFields]: string };
type offerFields = 'desc' | 'price';
type FormOfferErrors = { [q in offerFields]: string };
declare let navigator: any;
@Component({
   selector: 'product-details',
   templateUrl: './product-details.component.html',
   styleUrls: ['./product-details.component.scss'],
   encapsulation: ViewEncapsulation.None,
})
export class ProductDetailsComponent implements OnInit {
   product: product;
   productLocation: any;
   customWidth: number;
   uid: any;
   productId: any;

   user: any;
   currentUser: any;

   Offers: any;
   offersForm: FormGroup;
   offersBy: Array<any> = [];

   questionsBy: Array<any> = [];
   questionsForm: FormGroup;
   question: Array<any> = [];
   // private productDoc: AngularFirestoreDocument<product>;
   formErrors: FormQueErrors = {
      'que': '',
   };
   formOfferErrors: FormOfferErrors = {
      'desc': '',
      'price': '',
   };
   validationMessages = {
      'que': { 'required': 'Question can not be empty' },
      'desc': { 'required': 'Offer text can not be empty' },
      'price': { 'required': 'Please enter offer price' },
   };
   // tslint:disable-next-line:max-line-length
   constructor(private router: Router, private route: ActivatedRoute, private productService: ProductService, private afs: AngularFirestore, private fb: FormBuilder, private notify: NotifyService) {
      this.currentUser = JSON.parse(window.localStorage.getItem('user'));
      this.uid = this.currentUser.uid;
   }

   ngOnInit() {
      this.questionsForm = this.fb.group({
         'que': ['', Validators.required],
      });
      this.offersForm = this.fb.group({
         'desc': ['', Validators.required],
         'price': ['', Validators.required],
      });
      this.questionsForm.valueChanges.subscribe((data) => this.onValueChanged(data, 'question'));
      this.offersForm.valueChanges.subscribe((data) => this.onValueChanged(data, 'offer'));
      // this.onValueChanged();
      this.productId = this.route.snapshot.paramMap.get('productId');

      if (this.productId) {
         this.getProduct();
         this.getQuestions();
         this.getOffers();
      }

   }

   // tslint:disable-next-line:cyclomatic-complexity
   onValueChanged(data: any, formName: any) {
      if (formName === 'question') {
         if (!this.questionsForm) { return; }
         const form = this.questionsForm;
         for (const field in this.formErrors) {
            // tslint:disable-next-line:max-line-length
            if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'que')) {
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
         if (!this.offersForm) { return; }
         const form = this.offersForm;
         for (const field in this.formOfferErrors) {
            // tslint:disable-next-line:max-line-length
            if (Object.prototype.hasOwnProperty.call(this.formOfferErrors, field) && (field === 'price' || field === 'desc')) {
               // clear previous error message (if any)
               this.formOfferErrors[field] = '';
               const control = form.get(field);
               if (control && control.dirty && !control.valid) {
                  const messages = this.validationMessages[field];
                  if (control.errors) {
                     for (const key in control.errors) {
                        if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                           this.formOfferErrors[field] += `${(messages as { [key: string]: string })[key]}`;
                        }
                     }
                  }
               }
            }
         }
      }
   }

   getProduct() {
      this.productService.getProduct(this.productId).subscribe((resp: product) => {
         this.product = resp;
         this.getLocation(this.product.location);
      });
   }

   getLocation(location: number[]) {
      // Add watch
      const watchId = navigator.geolocation.watchPosition((position: any) => {
         // do something with position
         // console.log('position in geolocation watch === ', position);
      }, (error: any) => {
         // do something with error
         // console.log('error in  geolocationwatch === ', error);
      });
      // Clear watch
      navigator.geolocation.clearWatch(watchId);
      this.productService.getCurrentLocationProd(location).subscribe((resp: any) => {
         const address = resp.results[0].formatted_address;
         this.productLocation = address;
      });
   }

   addQuestion() {
      const data = {
         question: this.questionsForm.value.que,
         ans: '',
         pid: this.productId,
      };

      if (this.questionsForm.valid) {
         const questionSubscription = this.productService.createQue(data).subscribe((resp: any) => {
            const question = {
               question: resp.question,
               ans: resp.ans,
            };
            this.getQueUserDetails(this.uid, question);
            this.questionsForm.reset();
            questionSubscription.unsubscribe();
         });
      }

   }

   getQuestions() {
      this.productService.getQue(this.productId).subscribe((resp: any) => {
         if (resp.docs && resp.docs.length > 0) {
            for (let i = 0, len = resp.docs.length; i < len; i++) {
               const que = resp.docs[i].data();
               this.getQueUserDetails(que.uid, que);
            }
         }
      });
   }

   addOffer() {
      const data = {
         text: this.offersForm.value.desc,
         price: this.offersForm.value.price,
         productId: this.productId,
         userId: this.uid,
         accepted: false,
         created: new Date(),
         lastUpdated: new Date(),
      };

      if (this.offersForm.valid) {
         const offerSubscription = this.productService.createOffers(data).subscribe((resp: any) => {
            this.offersForm.reset();
            offerSubscription.unsubscribe();
         });
      }
   }

   getOffers() {
      this.productService.getOffers().subscribe((resp: any) => {
         this.Offers = resp;
         this.getOfferUserDetails(this.Offers.userId);
      });
   }

   getQueUserDetails(userId: any, que: any) {
      this.afs.collection('users').doc(userId)
         .ref
         .get().then((doc) => {
            if (doc.exists) {
               this.user = doc.data();
               const data = {
                  photoURL: this.user.photoURL,
                  firstName: this.user.firstName,
                  lastName: this.user.lastName,
                  question: que.question,
                  answer: que.ans,
               };
               this.questionsBy.push(data);
            } else {
               // doc.data() will be undefined in this case
               console.log('No such document!');
            }

         });
   }

   getOfferUserDetails(userId: any) {
      this.afs.collection('users').doc(userId)
         .ref
         .get().then((doc) => {
            if (doc.exists) {
               this.user = doc.data();
               this.offersBy.push(this.user);
            } else {
               // doc.data() will be undefined in this case
               console.log('No such document!');
            }
         });
   }

   scroll(el: any) {
      el.scrollIntoView({ behavior: 'smooth' });
   }

}
