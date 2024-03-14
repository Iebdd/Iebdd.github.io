import { RndIntPipe } from '../Pipes/rnd-int.pipe';

describe('RndIntPipe', () => {
  const pipe = new RndIntPipe();

  it('Should not return a number higher than the upper bound passed to it', () => {
    expect(pipe.transform(15)).toBeLessThanOrEqual(15);
  });

  it('Always return a natural number', () => {
    expect(pipe.transform(15)).toBeGreaterThanOrEqual(0);
  });

});
