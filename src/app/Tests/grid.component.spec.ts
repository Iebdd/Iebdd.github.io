/* import { MockBuilder, ngMocks, MockRender} from 'ng-mocks';
import { CellService } from '../Services/cell.service';
import { ReplacementPipe } from '../Pipes/replacement.pipe';
import { DatabaseService } from '../Services/database.service';
import { CharPipe } from '../Pipes/char.pipe';
import { LetterPipe } from '../Pipes/letter.pipe';


import { GridComponent } from '../grid/grid.component';

describe('GridComponent', () => {

  beforeEach(() => {
    return MockBuilder(GridComponent, null)
    .keep(CellService)
    .keep(CharPipe)
    .keep(ReplacementPipe)
    .keep(DatabaseService)
    .keep(LetterPipe);
  });

  it('should create', () => {
    const fixture = MockRender(GridComponent);
    expect(fixture).toBeTruthy();
  });
});
 */