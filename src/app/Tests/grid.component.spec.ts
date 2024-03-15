import { MockBuilder, ngMocks, MockRender} from 'ng-mocks';
import { CellService } from '../Services/cell.service';


import { GridComponent } from '../grid/grid.component';

describe('GridComponent', () => {

  beforeEach(() => {
    return MockBuilder(GridComponent)
    .keep(CellService);
  });

  it('should create', () => {
    const fixture = MockRender(GridComponent);
    expect(fixture).toBeTruthy();
  });
});
