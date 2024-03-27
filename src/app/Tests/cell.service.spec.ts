/* import { TestBed } from '@angular/core/testing';
import { Directions } from '../model/enums';
import { GridComponent } from '../grid/grid.component';
import { CellService } from '../Services/cell.service';
import { LetterPipe } from '../Pipes/letter.pipe';
import { DatabaseService } from '../Services/database.service';
import { RndIntPipe } from '../Pipes/rnd-int.pipe';
import { CharPipe } from '../Pipes/char.pipe';
import { LowerCasePipe } from '@angular/common';
import { TranslocoService } from '@ngneat/transloco';
import { Number2WordPipe } from '../Pipes/number2word.pipe';
import { MockBuilder, ngMocks, MockRender} from 'ng-mocks';



describe('CellService', () => {

  beforeEach(() => {
    return MockBuilder(CellService);

  });

  it('should create the service', () => {
    const service = ngMocks.get(CellService);
    expect(service).toBeDefined();
  })

  it('should return the correct MaxLength', () => {
    const service = ngMocks.get(CellService);
    service.grid_size = [16, 16];
    expect(service.getMaxLength(5, 5, Directions.Left)).toEqual(6);
    expect(service.getMaxLength(9, 1, Directions.Right)).toEqual(15);
    expect(service.getMaxLength(13, 12, Directions.Down)).toEqual(3);
    expect(service.getMaxLength(7, 0, Directions.Up)).toEqual(8);
    expect(service.getMaxLength(8, 10, Directions.DiagonalLeft)).toEqual(8);
    expect(service.getMaxLength(7, 3, Directions.DiagonalLeft)).toEqual(4);
    expect(service.getMaxLength(9, 10, Directions.DiagonalRight)).toEqual(6);
    expect(service.getMaxLength(12, 7, Directions.DiagonalRight)).toEqual(4);
    expect(service.getMaxLength(10, 7, Directions.DiagonalRightUp)).toEqual(9);
    expect(service.getMaxLength(7, 1, Directions.DiagonalRightUp)).toEqual(8);
    expect(service.getMaxLength(14, 3, Directions.DiagonalLeftUp)).toEqual(4);
    expect(service.getMaxLength(6, 15, Directions.DiagonalLeftUp)).toEqual(7);
    expect(service.getMaxLength(3, 4, Directions.Right)).toEqual(12);
    expect(service.getMaxLength(2, 10, service.invertDirection(Directions.Left))).toEqual(6);
    expect(service.getMaxLength(6, 5, service.invertDirection(Directions.Up))).toEqual(10);
    expect(service.getMaxLength(6, 3, service.invertDirection(Directions.DiagonalLeft))).toEqual(7);
    expect(service.getMaxLength(6, 9, service.invertDirection(Directions.DiagonalRight))).toEqual(7);
  });

  it('should move the cursor to the correct edge', () => {
    const fixture = MockRender(GridComponent);
    const service = ngMocks.get(CellService);
    service.grid_size = [16, 16];
    expect(service.moveToEdge(5, 5, Directions.Left)).toEqual([5, 15]);
    expect(service.moveToEdge(9, 1, Directions.Right)).toEqual([9, 0]);
    expect(service.moveToEdge(13, 12, Directions.Down)).toEqual([0, 12]);
    expect(service.moveToEdge(0, 0, Directions.Up)).toEqual([15, 0]);
    expect(service.moveToEdge(8, 10, Directions.DiagonalLeft)).toEqual([3, 15]);
    expect(service.moveToEdge(7, 3, Directions.DiagonalLeft)).toEqual([0, 10]);
    expect(service.moveToEdge(9, 10, Directions.DiagonalRight)).toEqual([0, 1]);
    expect(service.moveToEdge(12, 7, Directions.DiagonalRight)).toEqual([5, 0]);
    expect(service.moveToEdge(10, 7, Directions.DiagonalRightUp)).toEqual([15, 2]);
    expect(service.moveToEdge(7, 1, Directions.DiagonalRightUp)).toEqual([8, 0]);
    expect(service.moveToEdge(14, 3, Directions.DiagonalLeftUp)).toEqual([15, 4]);
    expect(service.moveToEdge(6, 15, Directions.DiagonalLeftUp)).toEqual([6, 15]);
  });

  it('should move in the correct direction and not move when it hits an edge', () => {
    const fixture = MockRender(GridComponent);
    const service = ngMocks.get(CellService);
    service.grid_size = [16, 16];
    expect(service.move(5, 5, Directions.Left)).toEqual([5, 4]);
    expect(service.move(9, 1, Directions.Right)).toEqual([9, 2]);
    expect(service.move(13, 12, Directions.Down)).toEqual([14, 12]);
    expect(service.move(0, 0, Directions.Up)).toEqual([0, 0]);
    expect(service.move(8, 10, Directions.DiagonalLeft)).toEqual([9, 9]);
    expect(service.move(7, 3, Directions.DiagonalLeft)).toEqual([8, 2]);
    expect(service.move(9, 10, Directions.DiagonalRight)).toEqual([10, 11]);
    expect(service.move(12, 7, Directions.DiagonalRight)).toEqual([13, 8]);
    expect(service.move(10, 7, Directions.DiagonalRightUp)).toEqual([9, 8]);
    expect(service.move(7, 1, Directions.DiagonalRightUp)).toEqual([6, 2]);
    expect(service.move(14, 3, Directions.DiagonalLeftUp)).toEqual([13, 2]);
    expect(service.move(6, 15, Directions.DiagonalLeftUp)).toEqual([5, 14]);
    expect(service.move(9, 0, Directions.Up)).toEqual([8, 0]);
    expect(service.move(3, 0, Directions.Down, 6)).toEqual([9, 0]);
    expect(service.move(0, 15, Directions.Left, 6)).toEqual([0, 9]);
    expect(service.move(0, 0, Directions.Right, 6)).toEqual([0, 6]);
  });

  it('should create the correct regex matching string', () => {
    const fixture = MockRender(GridComponent);
    const service = ngMocks.get(CellService);
    expect(service.createRegexMatcher([-1, -1, -1, -1, 0, -1, -1, 11, -1, -1, -1])).toEqual('.?.?.?.?a..l.?.?.?');
    expect(service.createRegexMatcher([1, -1, -1, 11, -1, -1, -1])).toEqual('b..l.?.?.?');
  })

  it('should shorten the provided matcher correctly and add optional markers as necessary', () => {
    const fixture = MockRender(GridComponent);
    const service = ngMocks.get(CellService);
    expect(service.shortenMatcher('.?.?.?.?e.a..l.?.?.?', [8, 10, 13], 10, false)).toEqual(['.?.?.?.?e.a.?', false]);
    expect(service.shortenMatcher('.?.?.?.?e.a..l.?.?.?', [8, 10, 13], 10, true)).toEqual(['a..l.?.?.?', false]);
    expect(service.shortenMatcher('.?.?.?.?l...e.a..l.?.?.?', [8, 10, 13], 10, true)).toEqual(['.?.?e.a..l.?.?.?', false]);
    expect(service.shortenMatcher('.?.?n..t...a.?.?.?.?.?.?', [4, 7, 11], 11, false)).toEqual(['', true]);
    expect(service.shortenMatcher('.?.?.?.?e.a.?', [8, 10], 10, false)).toEqual(['', true]);
    expect(service.shortenMatcher('a..l.?.?.?', [10, 13], 10, true)).toEqual(['', false]);
  })
  
  it('should determine whether adjacent cells are empty', () => {
    const fixture = MockRender(GridComponent);
    const service = ngMocks.get(CellService);
    service.grid_size = [16, 16];
    service.createGrid();
    service.cell_grid[8][8].Content = 0;
    service.cell_grid[7][7].Content = 0;
    service.cell_grid[9][8].Content = 0;
    expect(service.returnPeripheryResult(8, 7, Directions.Left, true)).toBeFalse();
    expect(service.returnPeripheryResult(9, 7, Directions.Left)).toBeTrue();
    expect(service.returnPeripheryResult(7, 8, Directions.Right)).toBeFalse();
    expect(service.returnPeripheryResult(7, 6, Directions.Right, false, true)).toBeFalse();
    expect(service.returnPeripheryResult(10, 9, Directions.Up)).toBeTrue();
    expect(service.returnPeripheryResult(8, 9, Directions.Up)).toBeFalse();
    expect(service.returnPeripheryResult(6, 7, Directions.DiagonalLeft)).toBeFalse();
    expect(service.returnPeripheryResult(10, 6, Directions.DiagonalRight)).toBeTrue();
    expect(service.returnPeripheryResult(0, 0, Directions.Left)).toBeTrue();
  });

  it('should remove added words ', () => {
    const fixture = MockRender(GridComponent);
    const service = ngMocks.get(CellService);
    service.grid_size = [16, 16];
    service.createGrid();
    service.addWord(4, 4, 'TestWord', 'Test Hint', Directions.Right);
    service.undoAddition([[4, 4], [4, 5], [4, 6], [4, 7], [4, 8], [4, 9], [4, 10], [4, 11]]);
    expect(service.cell_grid[4][4].Content).toEqual(-1);
    expect(service.cell_grid[4][11].Content).toEqual(-1);
    expect(service.cell_grid[4][4].Hints.length).toEqual(0);
    expect(service.cell_grid[4][4].Directions.length).toEqual(0);
  });
}); */