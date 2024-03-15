import { Pipe, PipeTransform } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { LetterPipe } from './letter.pipe';

@Pipe({
    name: 'char',
    standalone: true,
})
export class CharPipe implements PipeTransform {

  constructor(private upperCasePipe: UpperCasePipe, private letterPipe: LetterPipe) {}

  transform(char: number, toUpper: boolean = true): string {
    return (toUpper) ? this.upperCasePipe.transform(String.fromCharCode(this.letterPipe.transform(char))) : String.fromCharCode(this.letterPipe.transform(char));
  }

}
