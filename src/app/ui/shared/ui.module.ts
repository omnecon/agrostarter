import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material/material.module';

import { SharedModule } from '../../shared/shared.module';

import { NavService } from './nav.service';

import { UserLoginComponent } from '../user-login/user-login.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';

import { TopNavComponent } from '../top-nav/top-nav.component';
import { FooterNavComponent } from '../footer-nav/footer-nav.component';
import { ReadmePageComponent } from '../readme-page/readme-page.component';
import { ResetPassComponent } from '../reset-password/reset-password.component';
import { AccountActivationComponent } from '../account-activation/account-activation.component';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import { Decode64Pipe } from '../../pipes/decode64pipe';
@NgModule({
   imports: [
      CommonModule,
      SharedModule,
      FormsModule,
      ReactiveFormsModule,
      RouterModule,
      BrowserAnimationsModule,
      MaterialModule,

   ],
   declarations: [
      UserLoginComponent,
      UserProfileComponent,
      TopNavComponent,
      FooterNavComponent,
      ReadmePageComponent,
      NotificationMessageComponent,
      ResetPassComponent,
      AccountActivationComponent,
      Decode64Pipe,
   ],
   exports: [
      TopNavComponent,
      FooterNavComponent,
      UserProfileComponent,
      NotificationMessageComponent,
   ],
})
export class UiModule { }
