import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material/material.module';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { SharedModule } from '../../shared/shared.module';

import { ProductService } from './product.service';

import { ProductPageComponent } from '../product-page.component';
import { SlideshowModule } from 'ng-simple-slideshow';

import { AgmCoreModule } from '@agm/core';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
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
   ],
   declarations: [
      ProductPageComponent,
   ],
   providers: [
      ProductService,
   ],
})
export class ProductModule { }
