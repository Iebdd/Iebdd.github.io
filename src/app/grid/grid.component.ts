import { Component, OnInit, OnDestroy } from '@angular/core';
import { Cell } from '../model/classes';
import { Options } from '../model/dtypes'; 
import { CellService } from '../Services/cell.service';
import { DatabaseService } from '../Services/database.service';
import { LoadDataService } from '../Services/load-data.service';
import { Subject, takeUntil } from 'rxjs';
import { Directions } from '../model/enums';
import { CharPipe } from '../Pipes/char.pipe';
import { ReplacementPipe } from '../Pipes/replacement.pipe';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
    standalone: true,
    imports: [CharPipe, ReplacementPipe]
})
export class GridComponent implements OnInit, OnDestroy {

  constructor(private cellService: CellService,
              private databaseService: DatabaseService,
              private loadDataService: LoadDataService){}
  String = String;
  cell_grid: Cell[][] = [];
  grid_size: number[] = [];
  destroyed = new Subject<void>();
  hidden_content: boolean = false;
  loading: boolean = false;
  progress: number = 0;

  options: Options = {
    directions: [true, false, false],
    n0words: 15
  }

  getGrid(): void {
    this.cellService.getGrid()
    .pipe(takeUntil(this.destroyed))
    .subscribe(grid => {
      this.cell_grid = grid
    });
  }

  getGridSize(): void {
    this.cellService.getGridSize()
    .subscribe(size => {
      this.grid_size = size
    });
  }

  fillGrid(): void {
    this.cellService.fillGrid(this.options);
  }

  toggleContent(): void {
    this.hidden_content = !this.hidden_content;
  }

  getLoadingProgress(): void {
    this.loadDataService.updateLoadingProgress()
      .subscribe(element => this.progress = element);
  }

  populate(): void {
    let cells: number[][] = [[1, 1], [3, 4], [3, 10], [5, 4], [7, 4], [9, 5], [9, 8], [11, 5]];
    let strings: string[] = ['crosswordmagic', 'start', 'by', 'choosing', 'options', 'on', 'the', 'right'];
    for(let index = 0; index < cells.length; index++) {
      this.cellService.addWord(cells[index][0], cells[index][1], strings[index], '', Directions.Right);
    }
  }

  async ngOnInit(): Promise<void> {
    this.getLoadingProgress();
    this.databaseService.initDB()
      .then(element => (element) ? (this.loading = true, this.databaseService.createEntries()) : null);
    this.getGrid();
    this.getGridSize();
    this.populate();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
