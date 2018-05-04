import { NgModule } from '@angular/core';

import { AuthService } from './auth.service';
import { NotifyService } from './notify.service';
import { DbService } from './db.service';

import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';


@NgModule({
   imports: [
      AngularFireAuthModule,
      AngularFirestoreModule,
   ],
   providers: [AuthService, NotifyService, DbService],
})
export class CoreModule { }
