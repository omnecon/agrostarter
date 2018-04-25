import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs/Subject';

/// Notify users about errors and other helpful stuff
export interface Msg {
   content: string;
   style: string;
}

@Injectable()
export class NotifyService {

   private _msgSource = new Subject<Msg | null>();
   private keepAfterRouteChange = false;
   msg = this._msgSource.asObservable();
   constructor(private router: Router) {
      // clear alert messages on route change unless 'keepAfterRouteChange' flag is true
      // router.events.subscribe((event) => {
      //    if (event instanceof NavigationStart) {
      //       if (this.keepAfterRouteChange) {
      //          // only keep for a single route change
      //          this.keepAfterRouteChange = true;
      //       } else {
      //          // clear alert messages
      //          this.clear();
      //       }
      //    }
      // });
   }

   update(content: string, style: 'error' | 'info' | 'success') {
      const msg: Msg = { content, style };
      this._msgSource.next(msg);
      setTimeout(() => {
         this._msgSource.next(null);
      }, 2000);
   }

   clear() {
      this._msgSource.next(null);
   }
}
