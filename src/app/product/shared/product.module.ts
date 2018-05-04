import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../material/material.module';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { SharedModule } from '../../shared/shared.module';

import { ProductService } from './product.service';

import { ProductPageComponent } from '../product-form/product-page.component';
import { ProductDetailsComponent } from '../product-details/product-details.component';

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
      HttpClientModule,
   ],
   declarations: [
      ProductPageComponent,
      ProductDetailsComponent,
   ],
   providers: [
      ProductService,
   ],
})
export class ProductModule { }
