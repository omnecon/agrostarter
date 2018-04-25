import { Injectable } from '@angular/core';

import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';

// import { Item } from './item';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class ProductService {

   constructor(private db: AngularFireDatabase) { }

}
