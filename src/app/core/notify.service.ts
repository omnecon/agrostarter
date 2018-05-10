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
   }

   update(content: string, style: 'error' | 'info' | 'success') {
      const msg: Msg = { content, style };
      this._msgSource.next(msg);
   }

   clear() {
      this._msgSource.next(null);
   }
}
