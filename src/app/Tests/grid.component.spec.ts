import { MockBuilder, ngMocks, MockRender} from 'ng-mocks';
import { AppModule } from '../app.module';
import { CellService } from '../Services/cell.service';


import { GridComponent } from '../grid/grid.component';

describe('GridComponent', () => {

  beforeEach(() => {
    return MockBuilder(GridComponent, AppModule)
    .keep(CellService);
  });

  it('should create', () => {
    const fixture = MockRender(GridComponent);
    expect(fixture).toBeTruthy();
  });
});
