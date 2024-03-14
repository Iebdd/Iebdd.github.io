import { AppModule } from '../app.module';
import { DatabaseService } from '../Services/database.service';
import { LoadDataService } from '../Services/load-data.service';

import { MockBuilder, ngMocks} from 'ng-mocks';

describe('DatabaseService', () => {

  beforeEach(() => {
    return MockBuilder(DatabaseService, AppModule);
  });

  it('should create the service', () => {
    const service = ngMocks.get(DatabaseService);
    expect(service).toBeDefined();
  })
});
