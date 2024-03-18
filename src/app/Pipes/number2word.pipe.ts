import { Pipe, PipeTransform } from '@angular/core';
import { CharPipe } from './char.pipe';

@Pipe({
    name: 'number2word',
    standalone: true,
})
export class Number2WordPipe implements PipeTransform {

  constructor(private charPipe: CharPipe) {}

  transform(occurences: number[]): string {
    let word: string = '';
    for (let word_iterator = 0; word_iterator < occurences.length; word_iterator++) {
      word += this.charPipe.transform(occurences[word_iterator], false);
    }
    return word;
  }

}
