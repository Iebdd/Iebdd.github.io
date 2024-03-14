import { Occ2WordPipe } from '../Pipes/occ2word.pipe';
import { LetterPipe } from '../Pipes/letter.pipe';
import { CharPipe } from '../Pipes/char.pipe';
import { LowerCasePipe, UpperCasePipe } from '@angular/common';

describe('Occ2WordPipe', () => {


  it('create an instance', () => {
    const pipe = new Occ2WordPipe(new LetterPipe(new LowerCasePipe), new CharPipe(new UpperCasePipe));
    expect(pipe).toBeTruthy();
  });
});
