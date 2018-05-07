
import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { ProductService } from '../shared/product.service';
import { NotifyService } from '../../core/notify.service';
import { product } from '../shared/product';
import { Upload } from '../shared/upload';
import { Observable } from 'rxjs/Observable';
import { UploadService } from '../../uploads/shared/upload.service';
import { Router } from '@angular/router';
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';
declare let navigator: any;
type ProductFields = 'title' | 'desc' | 'location' | 'category' | 'price';
type FormProfileErrors = { [p in ProductFields]: string };
// declare let geocoder: any;
@Component({
   selector: 'product-page',
   templateUrl: './product-page.component.html',
   styleUrls: ['./product-page.component.scss'],
   encapsulation: ViewEncapsulation.None,
})
export class ProductPageComponent implements OnInit {
   @ViewChild('slideshow') _slideshow: any;
   selectedFiles: FileList | null;
   currentUpload: Upload;
   uploads: Observable<Upload[]>;
   showSpinner = true;
   imageSources: Array<any> = [];
   currentProductImg = 0;
   currentProductData: any;
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
   uid: any;
   categories: Array<any> = [];
   selectedCategories: Array<any> = [];
   dropdownSettings: any = {};
   // tslint:disable-next-line:max-line-length
   constructor(private fb: FormBuilder, private db: AngularFireDatabase, private productService: ProductService, private upSvc: UploadService, private mapsAPILoader: MapsAPILoader, private notify: NotifyService, private router: Router) {
   }

   ngOnInit() {
      const newUser: any = JSON.parse(window.localStorage.getItem('user'));
      this.uid = newUser.uid;
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
         console.log('uid  === ', this.uid);
         console.log('DATA  === ', data);
         this.showSpinner = false;
         for (let i = 0, len = data.length; i < len; i++) {
            const newdata = {
               url: data[i].url,
               caption: data[i].name,
               $key: data[i].$key,
            };
            if (data[i].uid === this.uid) {
               const index = this.imageSources.findIndex((resp) => resp.$key === newdata.$key);
               if (index === -1) {
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
      console.log('addProduct', (this.productForm.value.location !== ''));
      if (this.productForm.value.location !== '') {
         this.getUpdatedGeoLocation(this.productForm.value.location);
      }
      const getStatus = this.productForm.value.status;
      const data = {
         categories: this.selectedCategories,
         images: this.imageSources,
         location: [this.latitude, this.longitude],
         price: this.productForm.value.price,
         status: getStatus,
         text: this.productForm.value.desc,
         title: this.productForm.value.title,
         userId: this.uid,
      };

      if (this.productForm.valid) {
         this.productService.createProduct(data).subscribe((resp: product) => {
            console.log('onbservable product data id == ', resp);
            this.productForm.get('category').setValue([]);
            this.productForm.reset({
               'title': [''],
               'desc': [''],
               'location': [''],
               'category': [''],
               'price': [''],
               'status': ['default'],
            });
            this.getUserLocation();
            this.notify.update('Product updated successfully', 'success');
            if (getStatus === 'Published') { this.router.navigate(['/product-details', { productId: resp.pid }]); }
         });
      }
   }
   // Start Multiple selection dropdown functions
   onItemSelect(item: any) {
      this.selectedCategories.push(item);
   }
   onSelectAll(items: any) {
      this.selectedCategories = items;
   }
   onItemDeSelect(item: any) {
      const index = this.selectedCategories.findIndex((i) => i.cat_id === item.cat_id);
      if (index > -1) {
         this.selectedCategories.splice(index, 1);
      }
   }
   onDeSelectAll(items: any) {
      this.selectedCategories = items;
   }
   // End Multiple selection dropdown functions

   // Check if image wheather image is added.
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

   deleteProductImg() {
      console.log('event  === ', this.currentProductData);
      const userChoice = confirm('Are you sure you want to permanently delete this product image?');
      if (userChoice) {
         const index = this.imageSources.findIndex((data) => data.$key === this.currentProductData.$key);
         this.productService.deleteUpload(this.currentProductData).subscribe((data) => {
            if (index > -1) {
               this.imageSources.splice(index, 1);
               this._slideshow.setSlideIndex(0);

            }
         });
      } else {
         console.log('You pressed Cancel!');
      }
   }

   getIndex(index: any) {
      this.currentProductImg = index;
      this.currentProductData = this.imageSources[this.currentProductImg];
   }

   getUserLocation() {
      if (navigator.geolocation) {
         // Add watch
         const watchId = navigator.geolocation.watchPosition((position: any) => {
            // do something with position
            console.log('position in watch === ', position);
         }, (error: any) => {
            // do something with error
            console.log('error in watch === ', error);
         });
         console.log('watchId === ', watchId);
         // Clear watch
         navigator.geolocation.clearWatch(watchId);
         /// locate the user
         navigator.geolocation.getCurrentPosition((position: any) => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            console.log('this.latitude: ', this.latitude, ' & this.longitude: ', this.longitude);
            this.getGeoLocation();
         });
      }
   }

   getGeoLocation() {
      this.productService.getCurrentLocation(this.latitude, this.longitude).subscribe((resp) => {
         const address = resp.results[1].formatted_address;
         console.log('current location ===', address);
         console.log('resp ===', resp);
         this.productForm.get('location').setValue([address]);
         this.getUpdatedGeoLocation(address);
      });
   }

   getUpdatedGeoLocation(address: any) {
      const $address = address.toString().split(',');
      const $url_encoded = encodeURI($address);
      this.productService.getUpdatedLocation($url_encoded).subscribe((resp: any) => {
         if (resp.results) {
            console.log('current lat and lan ===', resp.results[0].geometry.location.lat);
            const location = resp.results[0].geometry.location;
            this.latitude = location.lat;
            this.longitude = location.lng;
         }
      });
   }

}
