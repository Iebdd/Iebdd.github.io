import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replacement',
  standalone: true
})
export class ReplacementPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
