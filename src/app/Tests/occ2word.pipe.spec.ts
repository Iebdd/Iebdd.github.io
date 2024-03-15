import { Occ2WordPipe } from '../Pipes/occ2word.pipe';
import { CharPipe } from '../Pipes/char.pipe';
import { MockBuilder, ngMocks} from 'ng-mocks';

describe('Occ2WordPipe', () => {

    beforeEach(() => {
      return MockBuilder(Occ2WordPipe)
      .keep(CharPipe)
    });

  it('create an instance', () => {
    const pipe = ngMocks.get(Occ2WordPipe)
    expect(pipe).toBeTruthy();
  });
});
