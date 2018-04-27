import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
   name: 'decode64',
})
export class Decode64Pipe implements PipeTransform {
   transform(value: any, args?: any): any {
      let a = '';
      if (value) {
         try {
            a = atob(value);
         } catch (err) {
            a = value;
         }
      }
      return a;
   }
}
