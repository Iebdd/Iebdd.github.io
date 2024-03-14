import { Pipe, PipeTransform } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { LetterPipe } from './letter.pipe';

@Pipe({
  name: 'CharPipe',
})
export class CharPipe implements PipeTransform {

  constructor(private UpperCasePipe: UpperCasePipe, private LetterPipe: LetterPipe) {}

  transform(char: number, toUpper: boolean = true): string {
    return (toUpper) ? this.UpperCasePipe.transform(String.fromCharCode(this.LetterPipe.transform(char))) : String.fromCharCode(this.LetterPipe.transform(char));
  }

}
