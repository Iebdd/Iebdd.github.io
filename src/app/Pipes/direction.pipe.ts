import { Pipe, PipeTransform } from '@angular/core';
import { Directions } from '../model/enums'; 

@Pipe({
  name: 'direction',
  standalone: true
})
export class DirectionPipe implements PipeTransform {

  directions: string[] = ["", "", "l", "r", "d", "u", "dil", "diru", "dir", "dilu"];

  transform(direction: Directions): string {
    return this.directions[direction];
  }

}
