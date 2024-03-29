import { Pipe, PipeTransform } from '@angular/core';
import { Directions } from '../model/enums'; 

@Pipe({
  name: 'direction',
  standalone: true
})
export class DirectionPipe implements PipeTransform {

  directions: string[] = ["", "", "l", "r", "d", "u", "dil", "diru", "dir", "dilu"];
  markers: string[] = ["", "", "←", "→", "↓", "↑", "↙", "↘", "↗", "↖"]

  transform(direction: Directions, marker?: boolean): string {
    if(marker) {
      return this.markers[direction];
    }
    return this.directions[direction];
  }

}
