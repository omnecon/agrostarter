import { MessageService } from './../shared/message.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { ProductService } from '../../product/shared/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import { database } from 'firebase';
@Component({
   selector: 'message-list',
   templateUrl: './message-list.component.html',
   styleUrls: ['./message-list.component.scss'],
})
export class MessageListComponent implements OnInit {
   @ViewChild('scrollMe') private myScrollContainer: ElementRef;
   chatsCollection: AngularFirestoreCollection<any>;
   bothChatUsers$: Observable<any[]>;
   allChatList: Array<any>;
   userOneData: any;
   currentUser: any;
   constructor(private router: Router, private productService: ProductService, private messageService: MessageService, private afs: AngularFirestore) {
      this.chatsCollection = this.afs.collection('chats', (ref) => ref.limit(5));
   }

   ngOnInit() {
      this.userOneData = JSON.parse(window.localStorage.getItem('user'));
      this.currentUser = this.userOneData.uid;
      this.getAllCurrentUserChatList();
      if (this.bothChatUsers$) {
         this.bothChatUsers$.subscribe((snapshot) => {
            this.allChatList = [];
            if (snapshot.length > 0) {
               for (let i = 0, len = snapshot.length; i < len; i++) {
                  const chatDetails = {
                     userName: '',
                     productImg: '',
                     productTitle: '',
                     productId: '',
                     userTwoId: '',
                     userOneId: '',
                     chatId: snapshot[i].chatId,
                  };
                  const singleChat = snapshot[i];
                  let otherUser: any;

                  if (this.currentUser === singleChat.userTwoId) {
                     otherUser = singleChat.userOneId;
                  } else {
                     otherUser = singleChat.userTwoId;
                  }
                  chatDetails.userOneId = singleChat.userOneId;
                  chatDetails.userTwoId = singleChat.userTwoId;
                  this.afs.collection('products').doc(singleChat.productId).ref.get().then((refr) => {
                     chatDetails.productId = refr.id;
                     const data = refr.data();
                     chatDetails.productImg = data.images[0].url || 'assets/images/no_image_available.jpeg';
                     chatDetails.productTitle = data.title;

                     this.afs.collection('users').doc(otherUser).ref.get().then((resp) => {
                        // chatDetails.userTwoId = resp.id;
                        const userData = resp.data();
                        chatDetails.userName = `${userData.firstName} ${userData.lastName}`;
                     });
                  });
                  this.allChatList.push(chatDetails);
               }
            }
         });
      }
   }

   getAllCurrentUserChatList() {
      const userOneRef = this.afs.collection('chats', (ref) => ref.where('userOneId', '==', this.currentUser));
      const userTwoRef = this.afs.collection('chats', (ref) => ref.where('userTwoId', '==', this.currentUser));
      const userOneRef1 = userOneRef.snapshotChanges().map((action) => {
         return action.map((a) => {
            const data = a.payload.doc.data();
            const chatId = a.payload.doc.id;
            return { chatId, ...data };
         });
      });
      const userTwoRef1 = userTwoRef.snapshotChanges().map((action) => {
         return action.map((a) => {
            const data = a.payload.doc.data();
            const chatId = a.payload.doc.id;
            return { chatId, ...data };
         });
      });
      this.bothChatUsers$ = Observable.combineLatest(userOneRef1,
         userTwoRef1)
         .switchMap((user) => {
            const [userOne, userTwo] = user;
            const combined = userOne.concat(userTwo);
            return Observable.of(combined);
         });
   }

   openChat(index: any) {
      const chatData = {
         productId: this.allChatList[index].productId,
         userOneId: this.allChatList[index].userOneId,
         userTwoId: this.allChatList[index].userTwoId,
         chatId: this.allChatList[index].chatId,
      };
      this.messageService._currentChat = chatData;
      this.router.navigate(['/message', chatData]);
   }

   deleteChat(index: any) {
      const userChoice = confirm(`Are you sure you want to permanently delete this chat? ${index}`);
      if (userChoice) {
         this.chatsCollection.doc(this.allChatList[index].chatId).delete().then((data) => {
            this.getAllCurrentUserChatList();
         });
      } else {
         console.log('You pressed Cancel!');
      }
   }

}
