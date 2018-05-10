
import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { ProductService } from '../shared/product.service';
import { NotifyService } from '../../core/notify.service';
import { product } from '../shared/product';
import { Upload } from '../shared/upload';
import { Observable } from 'rxjs/Observable';
import { UploadService } from '../../uploads/shared/upload.service';
import { Router } from '@angular/router';
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
export class ProductPageComponent implements OnInit, OnDestroy {
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
   addprodSubscription: any;
   productLocation: any;
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
totalUpload = 0;
   latitude: number;
   longitude: number;
   zoom: number;
   uid: any;
   categories: Array<any> = [];
   selectedCategories: Array<any> = [];
   dropdownSettings: any = {};
   // For Image slider
   autoPlay = true;
   showArrows = true;
   lazyLoad= true;
   autoPlayWaitForLazyLoad = true;
   // tslint:disable-next-line:max-line-length
   constructor(private fb: FormBuilder, private db: AngularFireDatabase, private productService: ProductService, private upSvc: UploadService, private notify: NotifyService, private router: Router) {
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

      this.categories = [
         { cat_id: 'food', cat_text: 'Food' },
         { cat_id: 'vahicle', cat_text: 'Vahicle' },
         { cat_id: 'furniture', cat_text: 'Furniture' },
         { cat_id: 'mobile', cat_text: 'Mobile' },
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

   // Form validation
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

   // Add product to firestore
   addProduct() {
      const getStatus = this.productForm.value.status;
      const data = {
         categories: this.selectedCategories,
         images: this.imageSources,
         location: [this.latitude, this.longitude],
         productLocation: this.productLocation,
         price: this.productForm.value.price,
         status: getStatus,
         text: this.productForm.value.desc,
         title: this.productForm.value.title,
         userId: this.uid,
      };

      if (this.productForm.valid) {
         this.addprodSubscription = this.productService.createProduct(data).subscribe((resp: product) => {
            window.scroll(0, 0);
            this.productForm.get('category').setValue([]);
            this.productForm.get('category').patchValue([]);
            this.selectedCategories = [];
            this.productForm.reset({
               'title': [''],
               'desc': [''],
               'location': [''],
               'category': [],
               'price': [''],
               'status': ['default'],
            });
            this.getUserLocation();

            this.notify.update('Product updated successfully', 'success');
            if (getStatus === 'published') {
               this.router.navigate(['/product-details', { productId: resp.pid }]);
            } else {
               this.router.navigate(['/user-product']);
            }
         });
      }
   }

   // Start Multiple selection dropdown functions
   // On select of single category
   onItemSelect(item: any) {
      this.selectedCategories.push(item);
   }

   // On select of all categories
   onSelectAll(items: any) {
      this.selectedCategories = items;
   }

   // On deselect of single categoty
   onItemDeSelect(item: any) {
      const index = this.selectedCategories.findIndex((i) => i.cat_id === item.cat_id);
      if (index > -1) {
         this.selectedCategories.splice(index, 1);
      }
   }

   // On deselect of all categories
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
      this.totalUpload = this.totalImgUpload;
   }

   // Upload multiple images
   uploadMulti() {
      const files = this.selectedFiles;
      this.totalImgUpload = files.length;
      this.totalUpload = this.totalImgUpload;
      if (!files || files.length === 0) {
         console.error('No Multi Files found!');
         return;
      }

      Array.from(files).forEach((file) => {
         this.currentUpload = new Upload(file);
         this.totalImgUpload = this.totalImgUpload - 1;
         this.productService.pushUpload(this.currentUpload).subscribe((imageData) => {
            const newdata = {
               url: imageData.url,
               caption: imageData.name,
               $key: imageData.$key,
            };
            const index = this.imageSources.findIndex((resp) => resp.$key === newdata.$key);
            if (index === -1) {
               this.imageSources.push(newdata);               
            }
         });
      });
   }

   // Delet image by image id
   deleteProductImg() {
      const userChoice = confirm('Are you sure you want to permanently delete this product image?');
      if (userChoice) {
         if(this.imageSources.length===1){
            this.currentProductData = this.imageSources[0];
            this.imageSources.length = 0;
            this.autoPlay = false;
            this.showArrows = false;
            this.productService.deleteUpload(this.currentProductData).subscribe((data) => {
            });
         } else {
            const index = this.imageSources.findIndex((data) => data.$key === this.currentProductData.$key);
            this.productService.deleteUpload(this.currentProductData).subscribe((data) => {
                  if (index > -1) {
                     this.imageSources.splice(index, 1);
                     this.totalUpload = this.totalUpload-1;
                     if((index + 1) === this.imageSources.length){
                        this._slideshow.onSlide(-1);
                     } else if(index === 0) {
                        this._slideshow.onSlide(1);
                     } else {
                     this._slideshow.goToSlide(1);
                     }
                   
                  }
               });
         } 

      } else {
         console.log('You pressed Cancel!');
      }
   }

   // Get current image in from slider on slide left or right
   getIndex(index: any) {
      this.currentProductImg = index;
      this.currentProductData = this.imageSources[this.currentProductImg];
   }

   // Get current location latitude and longitude.
   getUserLocation() {
      this.productService.getUserLocation().subscribe((position: any) => {
         this.latitude = position.location.lat;
         this.longitude = position.location.lng;
         this.getGeoLocation();
      });
   }

   // Get current address of user using latitude and longitude.
   getGeoLocation() {
      this.productService.getCurrentLocation(this.latitude, this.longitude).subscribe((resp) => {
         const address = resp.results[0].formatted_address;
         this.productForm.get('location').setValue([address]);
         this.productLocation = address;
      });
   }

   // Get current address of user using location enter by user in form.
   getUpdatedGeoLocation(address: any) {
      this.productLocation = address;
      this.productService.getUpdatedLocation(address).subscribe((resp: any) => {
         if (resp.results) {
            const location = resp.results[0].geometry.location;
            this.latitude = location.lat;
            this.longitude = location.lng;
         }
      });
   }

   ngOnDestroy() {
      if (this.addprodSubscription) { this.addprodSubscription.unsubscribe(); }
   }
}
