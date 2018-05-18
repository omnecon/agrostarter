import { MessageService } from './../shared/message.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { ProductService } from '../../product/shared/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import { database } from 'firebase';
@Component({
   selector: 'message-page',
   templateUrl: './message-page.component.html',
   styleUrls: ['./message-page.component.scss'],
})
export class MessagePageComponent implements OnInit {
   @ViewChild('scrollMe') private myScrollContainer: ElementRef;
   chatsCollection: AngularFirestoreCollection<any>;
   bothChatUsers$: Observable<any[]>;
   chatCollectionChanges$: Observable<any[]>;
   productData: any = null;
   userOneData: any;
   userTwoData: any;
   productId: any;
   userOneId: any;
   userTwoId: any;
   chatId: any;
   chatUser: Array<any> = [];
   chatMessage: Array<any> = [];
   currentUser: any;
   today: any;
   constructor(private productService: ProductService, private route: ActivatedRoute, private messageService: MessageService, private afs: AngularFirestore) {
      this.chatsCollection = this.afs.collection('chats', (ref) => ref.limit(5));
      this.today = Date();
   }

   ngOnInit() {
      // get logged in user data
      this.userOneData = JSON.parse(window.localStorage.getItem('user'));
      this.currentUser = this.userOneData.uid;
      this.route.params.subscribe((chatData: any) => {
         console.log('chatData  ==== ', chatData);
         this.productId = chatData['productId'];
         this.userTwoId = chatData['userTwoId'];
         this.userOneId = chatData['userOneId'];
         this.chatId = chatData['chatId'];
         this.getProduct(this.productId);
         this.getUserTwoProfile(this.userTwoId);
         this.afs.doc<any>(`chats/${this.chatId}`).collection('messages', (ref) => ref.orderBy('sendDate', 'asc')).valueChanges().subscribe((data) => {
            this.chatMessage = [];
            this.chatMessage = data;
            this.scrollToBottom();
         });
         this.getMessages();
      });
   }

   getProduct(id: any) {
      this.productService.getProduct(id).subscribe((data: any) => {
         this.productData = data;
      });
   }

   getUserTwoProfile(id: any) {
      let getUser = id;
      if (this.currentUser === id) {
         getUser = this.userOneId;
      }
      this.messageService.getOtherUserProfile(getUser).subscribe((data: any) => {
         this.userTwoData = data;
      });
   }

   postMessage(value: any) {
      const TS = window.performance.timing.navigationStart + window.performance.now();
      const newData = {
         user: this.currentUser,
         message: value,
         sendDate: TS,
      };

      this.afs.collection('chats').doc(this.chatId).collection('messages').add(newData).then((data) => {
         console.log('post messsage successfully');
      }).catch((error) => console.log('error ------- ', error));
   }

   getMessages() {
      const TS = window.performance.timing.navigationStart + window.performance.now();
      this.chatMessage = [];
      this.afs.collection('chats').doc(this.chatId).collection('messages').ref.orderBy('sendDate', 'asc').get().then((snapshot) => {
         snapshot.forEach((doc) => {
            const chat = doc.data();
            this.chatMessage.push(chat);
            this.getUserDetails(doc.data().user);
         });
         this.scrollToBottom();
      }).catch((error) => console.log('error ------- ', error));
   }

   // get user details like name profile images using user id for offer list
   getUserDetails(uid: any) {
      this.afs.collection('users').doc(uid)
         .ref
         .get().then((doc) => {
            if (doc.exists) {
               const user = doc.data();
               const chatUser = {
                  photoURL: user.photoURL,
                  firstName: user.firstName,
                  lastName: user.lastName,
               };
               this.chatUser.push(chatUser);
            } else {
               // doc.data() will be undefined in this case
               console.log('No such document!');
            }
         });
   }

   getFormatedMessage(message: any) {
      message = message.replace(/ /g, '\u00a0');
      return message.replace(/\n/g, '<br />');
   }

   scrollToBottom(): void {
      try {
         setTimeout(() => { this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight; }, 500);
      } catch (err) { console.log(); }
   }

}
