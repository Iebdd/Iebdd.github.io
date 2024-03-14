import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rndInt',
})
export class RndIntPipe implements PipeTransform {

  transform(upper_bound: number, lower_bound: number = 0): number {
    lower_bound = Math.ceil(lower_bound);
    upper_bound = Math.floor(upper_bound);
    return Math.floor(Math.random() * (upper_bound - lower_bound) + lower_bound);
  }

}
