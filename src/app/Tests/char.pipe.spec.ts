/* import { CharPipe } from '../Pipes/char.pipe';
import { UpperCasePipe } from '@angular/common';
import { MockBuilder, ngMocks, MockRender} from 'ng-mocks';
import { LetterPipe } from '../Pipes/letter.pipe';

describe('CharPipe', () => {
  beforeEach(() => {
    return MockBuilder(CharPipe, null)
    .keep(LetterPipe)
    .keep(UpperCasePipe);
  });

    it('Returns the upper case string equivalent of a lower case character', () => {
        const pipe = ngMocks.get(CharPipe);
        expect(pipe.transform(97, true)).toBe('A');
      });
});
 */