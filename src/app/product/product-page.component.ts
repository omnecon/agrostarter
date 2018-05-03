
import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { ProductService } from './shared/product.service';
import { product } from './shared/product';
import { Upload } from './shared/upload';
import { Observable } from 'rxjs/Observable';
import { UploadService } from '../uploads/shared/upload.service';

import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';

type UserProfileFields = 'title' | 'desc' | 'location' | 'category' | 'price';
type FormProfileErrors = { [u in UserProfileFields]: string };
// declare let geocoder: any;
@Component({
   selector: 'product-page',
   templateUrl: './product-page.component.html',
   styleUrls: ['./product-page.component.scss'],
   encapsulation: ViewEncapsulation.None,
})
export class ProductPageComponent implements OnInit {
   selectedFiles: FileList | null;
   currentUpload: Upload;
   uploads: Observable<Upload[]>;
   showSpinner = true;
   imageSources: Array<any> = [];
   productForm: FormGroup;
   geocoder: any;
   formErrors: FormProfileErrors = {
      'title': '',
      'desc': '',
      'location': '',
      'category': '',
      'price': '',
   };
   validationMessages = {
      'title': { 'required': 'Title is required.' },
      'desc': '',
      'category': { 'required': 'Please select atleast one category.' },
      'price': { 'required': 'Price is required.' },

   };
   imagem = '';
   showNoImg = true;
   pic: any;
   totalImgUpload = 0;

   latitude: number;
   longitude: number;
   zoom: number;

   categories: Array<any> = [];
   selectedCategories: Array<any> = [];
   dropdownSettings: any = {};
   // tslint:disable-next-line:max-line-length
   constructor(private fb: FormBuilder, private db: AngularFireDatabase, private productService: ProductService, private upSvc: UploadService, private mapsAPILoader: MapsAPILoader,
      private ngZone: NgZone) {
   }

   ngOnInit() {
      const newUser: any = JSON.parse(window.localStorage.getItem('user'));
      const uid = newUser.uid;
      this.getUserLocation();
      this.productForm = this.fb.group({
         'title': ['', Validators.required],
         'desc': ['', Validators.required],
         'location': [''],
         'category': ['', Validators.required],
         'price': ['', Validators.required],
         'status': ['default'],
      });
      this.productForm.valueChanges.subscribe((data) => this.onValueChanged(data));
      this.onValueChanged();
      // get uploaded images data
      this.uploads = this.productService.getUploads();
      this.uploads.subscribe((data: any) => {
         this.showSpinner = false;
         console.log('DATA === ', data);
         for (let i = 0, len = data.length; i < len; i++) {
            const newdata = {
               url: data[i].url,
               caption: data[i].name,
            };
            if (data[i].uid === uid) {
               if (this.imageSources.indexOf(newdata) === -1) {
                  this.imageSources.push(newdata);
               }
            }
         }
         console.log('this.imageSources  ', this.imageSources);
      });

      this.categories = [
         { cat_id: 'food', cat_text: 'Food' },
         { cat_id: 'vahilce', cat_text: 'Vahilce' },
         { cat_id: 'furniture', cat_text: 'Furniture' },
         { cat_id: 'mobiles', cat_text: 'Mobiles' },
      ];

      this.dropdownSettings = {
         singleSelection: false,
         idField: 'cat_id',
         textField: 'cat_text',
         selectAllText: 'Select All',
         unSelectAllText: 'UnSelect All',
         itemsShowLimit: 3,
         allowSearchFilter: true,
      };
   }

   onValueChanged(data?: any) {
      if (!this.productForm) { return; }
      const form = this.productForm;
      for (const field in this.formErrors) {
         // tslint:disable-next-line:max-line-length
         if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'title' || field === 'category' || field === 'price')) {
            // clear previous error message (if any)
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
               const messages = this.validationMessages[field];
               if (control.errors) {
                  for (const key in control.errors) {
                     if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
                        this.formErrors[field] += `${(messages as { [key: string]: string })[key]} `;
                     }
                  }
               }
            }
         }
      }
   }

   addProduct() {
      console.log('addProduct');
      const data = {
         categories: this.selectedCategories,
         images: this.imageSources,
         location: [this.latitude, this.longitude],
         price: this.productForm.value.price,
         status: this.productForm.value.status,
         text: this.productForm.value.title,
         title: this.productForm.value.desc,
      };
      console.log('product data ==== ', data);
      if (this.productForm.valid) { this.productService.createProduct(data); }
   }

   detectFiles($event: Event) {
      console.log('file detect');
      this.selectedFiles = ($event.target as HTMLInputElement).files;
      const files = this.selectedFiles;
      this.totalImgUpload = files.length;
   }

   uploadMulti() {
      const files = this.selectedFiles;
      this.totalImgUpload = files.length;
      if (!files || files.length === 0) {
         console.error('No Multi Files found!');
         return;
      }

      Array.from(files).forEach((file) => {
         this.currentUpload = new Upload(file);
         this.totalImgUpload = this.totalImgUpload - 1;
         this.productService.pushUpload(this.currentUpload);
      });
   }

   getUserLocation() {
      /// locate the user
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition((position) => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            console.log('this.latitude: ', this.latitude, ' & this.longitude: ', this.longitude);
         });
      }
   }

   getGeoLocation(address: any) {
      console.log('change location', address);
      this.geocoder.geocode({ 'address': address }, (results: any, status: any) => {
         // console.log('results', results);
         // console.log('results[0].geometry.location', results[0].geometry.location);
         // console.log('status', status);
         if (status === 'OK') {
            // map.setCenter(results[0].geometry.location);
            // var marker = new google.maps.Marker({
            //    map: map,
            //    position: results[0].geometry.location
            // });

         } else {
            console.log('Geocode was not successful for the following reason: ', status);
         }
      });
   }
   onItemSelect(item: any) {
      this.selectedCategories.push(item);
   }
   onSelectAll(items: any) {
      this.selectedCategories = items;
   }
   onItemDeSelect(item: any) {
      const index = this.selectedCategories.findIndex(i => i.cat_id === item.cat_id);
      if (index > -1) {
         this.selectedCategories.splice(index, 1);
      }
   }

   onDeSelectAll(items: any) {
      this.selectedCategories = items;
   }
}
