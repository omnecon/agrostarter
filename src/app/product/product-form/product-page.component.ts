
import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { ProductService } from '../shared/product.service';
import { NotifyService } from '../../core/notify.service';
import { product } from '../shared/product';
import { Upload } from '../shared/upload';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';
import { Router, ActivatedRoute } from '@angular/router';
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
   @ViewChild('inputFile') _inputFile: any;
   @ViewChild('category') _category: HTMLElement;
   imgbasePath = 'user-products-imgs';
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
   editprodSubscription: any;
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

   latitude: number;
   longitude: number;
   uid: any;
   categories: Array<any> = [];
   selectedCategories: Array<any> = [];
   dropdownSettings: any = {};
   productId: any;
   product: product;
   // tslint:disable-next-line:max-line-length
   constructor(private fb: FormBuilder, private db: AngularFireDatabase, private productService: ProductService, private notify: NotifyService, private router: Router, private route: ActivatedRoute, private _zone: NgZone) {
      this.productForm = this.fb.group({
         'title': ['', Validators.required],
         'desc': ['', Validators.required],
         'location': [''],
         'category': ['', Validators.required],
         'price': ['', Validators.required],
         'status': ['default'],
      });
   }

   ngOnInit() {

      const newUser: any = JSON.parse(window.localStorage.getItem('user'));
      this.uid = newUser.uid;
      this.getUserLocation();

      this.productId = this.route.snapshot.paramMap.get('productId');

      if (this.productId) {
         this.productService.getProduct(this.productId).subscribe((resp: product) => {
            this.product = resp;
            this.selectedCategories = this.product.categories;
            this.productForm.get('title').setValue(this.product.title);
            this.productForm.get('desc').setValue(this.product.text);
            this.productForm.get('category').setValue(this.selectedCategories);
            this.productForm.get('location').setValue(this.product.productLocation);
            this.productForm.get('price').setValue(this.product.price);
            this.productForm.get('status').setValue(this.product.status);
            this.clickOnCategory();
            this.checkImageExistance();
         });
      } else {
         this.productForm = this.fb.group({
            'title': ['', Validators.required],
            'desc': ['', Validators.required],
            'location': [''],
            'category': ['', Validators.required],
            'price': ['', Validators.required],
            'status': ['default'],
         });

      }

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

      // detect all images are upload properly
      this.uploads = this.productService.getUploads();
      this.uploads.subscribe(() => this.showSpinner = false);
   }

   clickOnCategory() {
      // event.preventDefault();.
      const element: HTMLElement = document.getElementById('category') as HTMLElement;
      if (element) {
         element.click();
      }
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

            this.notify.update('Product add successfully', 'success');
            if (getStatus === 'published') {
               this.router.navigate(['/product-details', { productId: resp.pid }]);
            } else {
               this.router.navigate(['/user-product']);
            }
         });
      }
   }

   editProduct() {
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
         pid: this.productId,
      };

      if (this.productForm.valid) {
         this.editprodSubscription = this.productService.editProduct(data).subscribe((resp: product) => {
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
            this.editprodSubscription.unsubscribe();
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
   }

   // Upload multiple images
   uploadMulti() {
      const files = this.selectedFiles;
      if (!files || files.length === 0) {
         console.error('No Multi Files found!');
         return;
      }

      Array.from(files).forEach((file) => {
         this.currentUpload = new Upload(file);
         this.productService.pushUpload(this.currentUpload).subscribe((imageData) => {
            const newdata = {
               url: imageData.url,
               caption: imageData.name,
               $key: imageData.$key,
            };
            const index = this.imageSources.findIndex((resp) => resp.$key === imageData.$key);
            if (index === -1) {
               this.imageSources.push(newdata);
            }
         });
      });

      this._inputFile.nativeElement.value = null;
      this.selectedFiles = null;
   }
   deleteProductImg(currentImgData: any, imgIndex: any) {
      const userChoice = confirm('Are you sure you want to permanently delete this product image?');
      if (userChoice) {
         this.imageSources = this.imageSources.filter((item) => item.$key !== currentImgData.$key);
         const index = this.imageSources.indexOf(currentImgData);
         this.productService.deleteUpload(currentImgData).subscribe((data) => {
            // console.log('deleted image === ', data);
         });
      } else {
         console.log('You pressed Cancel!');
      }
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

   checkImageExistance() {
      const storageRef = firebase.storage().ref();
      this.imageSources = [];
      for (let i = 0, len = this.product.images.length; i < len; i++) {
         const imagesRef = storageRef.child(`${this.product.images[i].url}`);
         let filename = decodeURI(imagesRef.name);
         filename = (filename.split('/').pop().split('#')[0].split('?')[0]).replace(`${this.imgbasePath}%2F`, '');
         storageRef.child(`${this.imgbasePath}/${filename}`).getDownloadURL().then(
            (foundURL: any) => {
               this.imageSources.push(this.product.images[i]);
            }, (error: any) => {
               console.log('error.code === ', error);
            });
      }
   }

   ngOnDestroy() {
      if (this.addprodSubscription) { this.addprodSubscription.unsubscribe(); }
   }
}
