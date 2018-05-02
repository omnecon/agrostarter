
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserLoginComponent } from './ui/user-login/user-login.component';
import { ResetPassComponent } from './ui/reset-password/reset-password.component';
import { AccountActivationComponent } from './ui/account-activation/account-activation.component';
import { UserProfileComponent } from './ui/user-profile/user-profile.component';

import { ItemsListComponent } from './items/items-list/items-list.component';
import { ReadmePageComponent } from './ui/readme-page/readme-page.component';
import { NotesListComponent } from './notes/notes-list/notes-list.component';
import { MessagePageComponent } from './message/message-page.component';
import { UploadsListComponent } from './uploads/uploads-list/uploads-list.component';
import { ProductPageComponent } from './product/product-page.component';


import { AuthGuard } from './core/auth.guard';
import { CoreModule } from './core/core.module';

const routes: Routes = [
   { path: '', component: ReadmePageComponent, canActivate: [AuthGuard] },
   { path: 'login', component: UserLoginComponent },
   { path: 'register', component: UserLoginComponent },
   { path: 'reset-password', component: ResetPassComponent },
   { path: 'account-activation', component: AccountActivationComponent },
   { path: 'my-profile', component: UserProfileComponent, canActivate: [AuthGuard] },
   { path: 'product', component: UploadsListComponent, canActivate: [AuthGuard] },
   { path: 'message', component: MessagePageComponent, canActivate: [AuthGuard] },
   // { path: 'items', component: ItemsListComponent, canActivate: [AuthGuard] },
   // uploads are lazy loaded
   { path: 'uploads', loadChildren: './uploads/shared/upload.module#UploadModule', canActivate: [AuthGuard] },
];

@NgModule({
   imports: [RouterModule.forRoot(routes)],
   exports: [RouterModule],
   providers: [AuthGuard],
})
export class AppRoutingModule { }
