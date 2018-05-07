import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SlideshowModule } from 'ng-simple-slideshow';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';
import { HomePageComponent } from '../home-page.component';
import { HomeService } from './home.service';

@NgModule({
   imports: [
      AgmCoreModule.forRoot({
         libraries: ['places'],
      }),
      NgMultiSelectDropDownModule.forRoot(),
      CommonModule,
      SharedModule,
      ReactiveFormsModule,
      FormsModule,
      AngularFireDatabaseModule,
      BrowserAnimationsModule,
      MaterialModule,
      SlideshowModule,
      HttpClientModule,
   ],
   declarations: [
      HomePageComponent,
   ],
   providers: [
      HomeService,
   ],
})
export class HomeModule { }
