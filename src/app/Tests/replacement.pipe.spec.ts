import { ReplacementPipe } from '../Pipes/replacement.pipe';
import { MockBuilder, ngMocks} from 'ng-mocks';
import { LoadDataService } from '../Services/load-data.service';


describe('ReplacementPipe', () => {

  beforeEach(() => {
    return MockBuilder(ReplacementPipe)
    .mock(LoadDataService)
  });

  it('create an instance', () => {
    const pipe = ngMocks.get(ReplacementPipe);
    expect(pipe).toBeTruthy();
  });
});
