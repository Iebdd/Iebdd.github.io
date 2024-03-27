/* import { LetterPipe } from '../Pipes/letter.pipe';
import { LowerCasePipe } from '@angular/common';

describe('LetterPipe', () => {

  const pipe = new LetterPipe(new LowerCasePipe);

  it('Transforms "97" to its internal equivalent of "0"', () => {
    expect(pipe.transform(97)).toBe(0);
  });

  it('Utilises the provided maps when necessary', () => {
    expect(pipe.transform(248)).toBe(49);
    expect(pipe.transform(49)).toBe(248);
  });

  it('Accepts equivalent strings for the same output', () => {
    expect(pipe.transform('a')).toBe(0);
    expect(pipe.transform('z')).toBe(25);
  });

  it('Transforms upper case input to a lower case output', () => {
    expect(pipe.transform('A')).toBe(0);
    expect(pipe.transform('Z')).toBe(25);
  });

  it('Handles "exotic" values', () => {
    expect(pipe.transform('Ä')).toBe(26);
    expect(pipe.transform('ø')).toBe(49);
  });
}); */