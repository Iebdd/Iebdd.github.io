import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rndInt',
})
export class RndIntPipe implements PipeTransform {

  transform(upper_bound: number, lower_bound: number = 0): number {   //Returns a random int lower than upper_bound and higher than lower_bound if provided
    lower_bound = Math.ceil(lower_bound);
    upper_bound = Math.floor(upper_bound);
    return Math.floor(Math.random() * (upper_bound - lower_bound) + lower_bound);
  }

}
