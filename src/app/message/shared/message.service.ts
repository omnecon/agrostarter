import { Injectable } from '@angular/core';

import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';

// import { Item } from './item';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class MessageService {

   constructor(private db: AngularFireDatabase) { }

}
