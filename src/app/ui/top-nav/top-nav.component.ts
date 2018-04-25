import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
   selector: 'top-nav',
   templateUrl: './top-nav.component.html',
   styleUrls: ['./top-nav.component.scss'],
})
export class TopNavComponent {

   show = false;
   constructor(public auth: AuthService, private router: Router) { }
   toggleCollapse() {
      this.show = !this.show;
   }
   logout() {
      this.auth.signOut();
   }

}
