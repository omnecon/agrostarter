
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

///// Start FireStarter

// Core
import { CoreModule } from './core/core.module';

// Shared/Widget
import { SharedModule } from './shared/shared.module';

// Feature Modules
import { ItemModule } from './items/shared/item.module';
import { UploadModule } from './uploads/shared/upload.module';
import { UiModule } from './ui/shared/ui.module';
import { NotesModule } from './notes/notes.module';
import { MessageModule } from './message/shared/message.module';
import { HomeModule } from './home/shared/home.module';
import { ProductModule } from './product/shared/product.module';
///// End FireStarter

// Material Module
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
///// End Material

import { environment } from '../environments/environment';

import { AngularFireModule } from 'angularfire2';
export const firebaseConfig = environment.firebaseConfig;
import { AngularFirestoreModule } from 'angularfire2/firestore';



@NgModule({
   declarations: [
      AppComponent,
   ],
   imports: [
      BrowserModule,
      FormsModule,
      AppRoutingModule,
      CoreModule,
      SharedModule,
      ItemModule,
      MessageModule,
      HomeModule,
      ProductModule,
      UploadModule,
      UiModule,
      NotesModule,
      AngularFireModule.initializeApp(firebaseConfig),
      BrowserAnimationsModule,
      MaterialModule,

   ],
   bootstrap: [
      AppComponent,
   ],
})
export class AppModule { }
