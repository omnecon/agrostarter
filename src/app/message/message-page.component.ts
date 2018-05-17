import { MessageService } from './shared/message.service';
import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { ProductService } from '../product/shared/product.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import { database } from 'firebase';
@Component({
   selector: 'message-page',
   templateUrl: './message-page.component.html',
   styleUrls: ['./message-page.component.scss'],
})
export class MessagePageComponent implements OnInit, AfterViewChecked {
   @ViewChild('scrollMe') private myScrollContainer: ElementRef;
   chatsCollection: AngularFirestoreCollection<any>;
   bothChatUsers$: Observable<any[]>;
   chatCollectionChanges$: Observable<any[]>;
   productData: any = null;
   allChatList: Array<any>;
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
   constructor(private productService: ProductService, private messageService: MessageService, private afs: AngularFirestore) {
      this.chatsCollection = this.afs.collection('chats', (ref) => ref.limit(5));
      this.today = Date();
   }

   ngOnInit() {
      // get logged in user data
      this.userOneData = JSON.parse(window.localStorage.getItem('user'));
      this.currentUser = this.userOneData.uid;

      this.getAllCurrentUserChat();
      if (this.bothChatUsers$) {
         this.bothChatUsers$.subscribe((snapshot) => {
            this.allChatList = [];
            const chatData = this.messageService._currentChat;
            if (chatData) {
               this.productId = chatData.productId;
               this.userTwoId = chatData.userTwoId;
               this.userOneId = chatData.userOndId;
               this.chatId = chatData.chatId;
               this.getProduct(this.productId);
               this.getUserTwoProfile(this.userTwoId);
               this.getMessages();
            } else {
               if (snapshot.length > 0) {
                  this.productId = snapshot[0].productId;
                  this.userOneId = snapshot[0].userOneId;
                  this.userTwoId = snapshot[0].userTwoId;
                  this.chatId = snapshot[0].chatId;
                  this.getProduct(this.productId);
                  this.getUserTwoProfile(this.userTwoId);

               }

            }
            if (snapshot.length > 0) {
               // tslint:disable-next-line:max-line-length
               this.afs.doc<any>(`chats/${this.chatId}`).collection('messages', (ref) => ref.orderBy('sendDate', 'asc')).valueChanges().subscribe((data) => {
                  this.chatMessage = [];
                  this.chatMessage = data;
                  this.scrollToBottom();
               });
               for (let i = 0, len = snapshot.length; i < len; i++) {
                  const chatDetails = {
                     userName: '',
                     productImg: '',
                     productTitle: '',
                     productId: '',
                     userTwoId: '',
                     chatId: snapshot[i].chatId,
                  };
                  const singleChat = snapshot[i];
                  let otherUser: any;

                  if (this.currentUser === singleChat.userTwoId) {
                     otherUser = this.userOneId;
                  } else {
                     otherUser = singleChat.userTwoId;
                  }
                  this.afs.collection('products').doc(singleChat.productId).ref.get().then((refr) => {
                     chatDetails.productId = refr.id;
                     const data = refr.data();
                     chatDetails.productImg = data.images[0].url || 'assets/images/no_image_available.jpeg';
                     chatDetails.productTitle = data.title;

                     this.afs.collection('users').doc(otherUser).ref.get().then((resp) => {
                        chatDetails.userTwoId = resp.id;
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

   getAllCurrentUserChat() {
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

   openChat(index: any) {
      this.productId = this.allChatList[index].productId;
      this.userTwoId = this.allChatList[index].userTwoId;
      this.chatId = this.allChatList[index].chatId;
      this.getProduct(this.productId);
      this.getUserTwoProfile(this.userTwoId);
      this.getMessages();
   }

   deleteChat(index: any) {
      const userChoice = confirm('Are you sure you want to permanently delete this chat?');
      if (userChoice) {
         this.chatsCollection.doc(this.allChatList[index].chatId).delete().then((data) => {
            this.chatMessage = [];
            this.getAllCurrentUserChat();
         });
      } else {
         console.log('You pressed Cancel!');
      }
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

   scrollToBottom() {
      const element = document.getElementById('scrollHere') as HTMLElement;
      if (element) {
         setTimeout(() => { element.scrollIntoView({ behavior: 'smooth' }); }, 500);
      }
   }

   ngAfterViewChecked() {
      this.scrollToBottom1();
   }

   scrollToBottom1(): void {
      try {
         this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      } catch (err) { console.log(); }
   }
}
