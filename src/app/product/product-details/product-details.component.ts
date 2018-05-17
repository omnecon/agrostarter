
import { take } from 'rxjs/operators';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { ProductService } from '../shared/product.service';
import { NotifyService } from '../../core/notify.service';
import { MessageService } from '../../message/shared/message.service';
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
   @ViewChild('imgSlider') _imgSlider: any;
   chatsCollection: AngularFirestoreCollection<any>;
   product: product;
   productLocation: any;
   customWidth: number;
   uid: any;
   productId: any;
   isWishlisted = false;
   user: any;
   currentUser: any;
   userLogin = false;
   Offers: any;
   offersForm: FormGroup;
   offersBy: Array<any> = [];

   questionsBy: Array<any> = [];
   questionsForm: FormGroup;
   question: Array<any> = [];
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
   constructor(private router: Router, private route: ActivatedRoute, private productService: ProductService, private afs: AngularFirestore, private fb: FormBuilder, private notify: NotifyService, private messageService: MessageService) {
      this.chatsCollection = this.afs.collection('chats', (ref) => ref.limit(5));
   }

   ngOnInit() {
      this.currentUser = JSON.parse(window.localStorage.getItem('user'));
      if (this.currentUser) {
         this.uid = this.currentUser.uid;
         this.userLogin = true;
      } else {
         this.userLogin = false;
      }
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
         if (this.userLogin) {
            this.getMyOffers();
         }
      } else {
         this.router.navigate(['/']);
      }

   }
   // Form Validation
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

   gotoProductImg(index: any) {
      this._imgSlider.goToSlide(index);
   }

   // Get product by id
   getProduct() {
      this.productService.getProduct(this.productId).subscribe((resp: product) => {
         this.product = resp;
         if (this.product.status === 'wishlist') {
            this.isWishlisted = true;
         }
      });
   }

   // Add question against product
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

   // Get all questions using product id
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

   // add offers using user id
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

   // get all offers using user id
   getMyOffers() {
      const getMyOffers = this.productService.getOffers(this.productId).subscribe((resp: any) => {
         this.Offers = resp;
         const offer = {
            accepted: this.Offers.accepted,
            created: this.Offers.created,
            lastUpdated: this.Offers.lastUpdated,
            price: this.Offers.price,
            productId: this.Offers.productId,
            text: this.Offers.text,
            userTwoId: this.Offers.userId,
            photoURL: '',
            firstName: '',
            lastName: '',
            userOneId: this.uid,
            // productImg: this.product.images[0].url,
            // productTitle: this.product.title,
            // productPrice: this.product.price,
         };
         this.getOfferUserDetails(offer);
         // getMyOffers.unsubscribe();
      });
   }

   // get user details like name profile images using user id and add question to locat array
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

   // get user details like name profile images using user id for offer list
   getOfferUserDetails(offer: any) {
      this.afs.collection('users').doc(offer.userTwoId)
         .ref
         .get().then((doc) => {
            if (doc.exists) {
               const user = doc.data();
               offer.photoURL = user.photoURL;
               offer.firstName = user.firstName;
               offer.lastName = user.lastName;
               this.offersBy.push(offer);
            } else {
               // doc.data() will be undefined in this case
               console.log('No such document!');
            }
         });
   }

   // On click on buttton scroll to offer or quetion form.
   scroll(elementId: any) {
      elementId.scrollIntoView({ behavior: 'smooth' });
   }

   openChat(index: any) {
      // tslint:disable-next-line:max-line-length
      this.chatsCollection.ref.where('productId', '==', this.offersBy[index].productId).where('userOneId', '==', this.offersBy[index].userOneId).where('userTwoId', '==', this.offersBy[index].userTwoId).get().then((snapshot) => {
         if (snapshot.size <= 0) {
            const charRoom = {
               productId: this.offersBy[index].productId,
               userOneId: this.offersBy[index].userOneId,
               userTwoId: this.offersBy[index].userTwoId,
            };
            this.messageService.createChat(charRoom).subscribe((data) => {
               this.messageService._currentChat = data;
            });
         } else {
            const chatData = {
               productId: this.offersBy[index].productId,
               userOneId: this.offersBy[index].userOneId,
               userTwoId: this.offersBy[index].userTwoId,
               chatId: '',
            };
            snapshot.forEach((respDoc) => {
               if (respDoc.exists) {
                  chatData.chatId = respDoc.id;
               }
            });
            this.messageService._currentChat = chatData;
         }
         this.router.navigate(['/message']);
      }).catch((error) => console.log('error! ---- ', error));
   }
}
