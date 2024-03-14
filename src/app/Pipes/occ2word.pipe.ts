import { Pipe, PipeTransform } from '@angular/core';
import { LetterPipe } from './letter.pipe';
import { CharPipe } from './char.pipe';

@Pipe({
  name: 'Occ2WordPipe',
})
export class Occ2WordPipe implements PipeTransform {

  constructor(private LetterPipe: LetterPipe,
              private CharPipe: CharPipe) {}

  transform(occurences: number[]): string {
    let word: string = '';
    for (let word_iterator = 0; word_iterator < occurences.length; word_iterator++) {
      word += this.CharPipe.transform(occurences[word_iterator], false);
    }
    return word;
  }

}
