import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import * as firebase from 'firebase/app';
@Component({
   selector: 'account-activation',
   templateUrl: './account-activation.component.html',
   styleUrls: ['./account-activation.component.scss'],
})
export class AccountActivationComponent implements OnInit {
   constructor(private router: Router, private route: ActivatedRoute, public auth: AuthService) { }
   ngOnInit() {
      this.setUser();
   }
   setUser() {
      const newUser: any = window.localStorage.getItem('user');
      const finalUser = JSON.parse(newUser);
      this.route.queryParams.subscribe((params) => {
         const email = params['email'];
         if ((email !== undefined) && (email === finalUser.email)) {
            this.auth.setUserData(finalUser, true);
         } else {
            this.router.navigate(['/login']);
         }
      });
   }
   updateProfile() {
      this.router.navigate(['/my-profile']);
   }
}
