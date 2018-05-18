import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material/material.module';

import { AngularFireDatabaseModule } from 'angularfire2/database';

import { SharedModule } from '../../shared/shared.module';

import { MessageService } from './message.service';

import { MessagePageComponent } from '../message-details/message-page.component';
import { MessageListComponent } from '../message-list/message-list.component';

@NgModule({
   imports: [
      CommonModule,
      SharedModule,
      ReactiveFormsModule,
      FormsModule,
      AngularFireDatabaseModule,
      BrowserAnimationsModule,
      MaterialModule,
   ],
   declarations: [
      MessagePageComponent,
      MessageListComponent,
   ],
   providers: [
      MessageService,
   ],
})
export class MessageModule { }
