import { CharPipe } from '../Pipes/char.pipe';
import { UpperCasePipe } from '@angular/common';

describe('CharPipe', () => {
    const pipe = new CharPipe(new UpperCasePipe);

    it('Returns the upper case string equivalent of a lower case character', () => {
        expect(pipe.transform(97)).toBe('A');
      });
});
