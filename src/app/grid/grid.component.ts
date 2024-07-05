import { Component, OnInit, OnDestroy } from '@angular/core';
import { Cell } from '../model/classes';
import { Options } from '../model/dtypes'; 
import { CellService } from '../Services/cell.service';
import { DatabaseService } from '../Services/database.service';
import { Subject, takeUntil, of } from 'rxjs';
import { Directions } from '../model/enums';
import { CharPipe } from '../Pipes/char.pipe';
import { ReplacementPipe } from '../Pipes/replacement.pipe';
import { LoadDataService } from '../Services/load-data.service';
import { DirectionPipe } from '../Pipes/direction.pipe';
import { StateService } from '../Services/state.service';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
    standalone: true,
    imports: [CharPipe, ReplacementPipe, DirectionPipe]
})
export class GridComponent implements OnInit, OnDestroy {

  constructor(private cellService: CellService,
              private databaseService: DatabaseService,
              private stateService: StateService){}
  String = String;
  cell_grid: Cell[][] = [];
  grid_size: number[] = [];
  destroyed = new Subject<void>();
  hint_array: [string, number][][] = [];
  directions: string[] = ['', '', 'Left', 'Right', 'Down', 'Up', 'Diagonal Left Down', 'Diagonal Right Up', 'Diagonal Right Down', 'Diagonal Left Up'];
  hidden_letters: boolean = false;
  hidden_hints: boolean = true;
  highlight_h: number = -1;
  highlight_c: number = -1;
  loading: boolean = true;
  empty_db: boolean = true;
  default_grid: boolean = true;
  skips: number[] = [0, 0, 0, 0, 0];
  progress: number = 0;
  hint_no: number = 0;
  options: Options = {
    directions: [false, false, false],
    n0words: 0,
    amap: false
  }

  getGrid(): void {
    this.cellService.Grid
      .pipe(takeUntil(this.destroyed))
      .subscribe(grid => this.cell_grid = grid);
  }

  getGridSize(): void {
    this.cellService.getGridSize()
      .pipe(takeUntil(this.destroyed))
      .subscribe(size => this.grid_size = size);
  }

  getLetterVisibility(): void {
    this.stateService.getLetterVisibility()
      .pipe(takeUntil(this.destroyed))
      .subscribe((state) => this.hidden_letters = state);
  }

  getHintVisibility(): void {
    this.stateService.getHintVisibility()
      .pipe(takeUntil(this.destroyed))
      .subscribe((state) => this.hidden_hints = state);
  }

  toggleVisibility(element: number): void {
    this.stateService.toggleState(element);
  }

  getHints(): void {
    this.cellService.getHints()
      .pipe(takeUntil(this.destroyed))
      .subscribe(hints => this.hint_array = hints);
  }

  getGridState(): void {
    this.stateService.getGridState()
      .pipe(takeUntil(this.destroyed))
      .subscribe(state => this.default_grid = state);
  }

  getOptions(): void {
    this.stateService.getOptions()
      .pipe(takeUntil(this.destroyed))
      .subscribe(options => this.options = options);
  }

  populate(): void {
    let cells: number[][] = [[1, 1], [1, 4], [3, 6], [5, 6], [7, 2], [7, 10], [9, 3], [9, 7]];
    let directions: Directions[] = [3, 4, 3, 3, 3, 3, 3, 3];
    let strings: string[] = ['crosswordmagic', 'start', 'by', 'choosing', 'options', 'on', 'the', 'right'];
    for(let index = 0; index < cells.length; index++) {
      this.cellService.addWord(cells[index][0], cells[index][1], strings[index], '', directions[index]);
    }
  }

  ngOnInit() {
    this.getGridState();
    this.getOptions()
    this.getHints();
    this.getLetterVisibility();
    this.getHintVisibility();
    this.getGrid();
    this.getGridSize();
    this.populate();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
