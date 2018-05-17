import { Injectable } from '@angular/core';

import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { NotifyService } from '../../core/notify.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
@Injectable()
export class MessageService {
   chatsCollection: AngularFirestoreCollection<any>;
   private _createChat: Subject<any> = new Subject<any>();
   _currentChat: any;
   private _otherUser: Subject<any> = new Subject<any>();
   private _otherUserList: Subject<any> = new Subject<any>();
   constructor(private db: AngularFireDatabase, private afs: AngularFirestore, private notify: NotifyService) {
      this.chatsCollection = this.afs.collection('chats', (ref) => ref.limit(5));
   }

   getOtherUserProfile(id: any) {

      this.afs.collection('users').doc(id).ref.get().then((doc) => {
         if (doc.exists) {
            this._otherUser.next(doc.data());
         } else {
            // doc.data() will be undefined in this case
            console.log('No such document!');
         }
      }).catch((error) => this.handleError(error));
      return this._otherUser.asObservable();
   }

   getOtherUserProfileList(id: any) {
      this.afs.collection('users').doc(id).ref.get().then((doc) => {
         if (doc.exists) {
            this._otherUserList.next(doc.data());
         } else {
            // doc.data() will be undefined in this case
            console.log('No such document!');
         }
      }).catch((error) => this.handleError(error));
      return this._otherUserList.asObservable();
   }

   createChat(chatData: any) {
      this.chatsCollection.add(chatData).then((data) => {
         chatData.chatId = data.id;
         this._createChat.next(chatData);
      }).catch((error) => this.handleError(error));
      return this._createChat.asObservable();
   }

   getChatData() {
      return this._currentChat.asObservable();
   }

   setChatData(chatData: any) {
      return this._currentChat.next(chatData);
   }

   // If error, console log and notify user
   private handleError(error: Error) {
      console.error(error);
      this.notify.update(error.message, 'error');
   }
}
