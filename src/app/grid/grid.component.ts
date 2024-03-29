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
              private loadDataService: LoadDataService){}
  String = String;
  cell_grid: Cell[][] = [];
  grid_size: number[] = [];
  destroyed = new Subject<void>();
  hidden_letters: boolean = false;
  loading: boolean = true;
  empty_db: boolean = true;
  skips: number[] = [0, 0, 0, 0, 0];
  progress: number = 0;
  hint_no: number = 0;

  n0elements: number = 0;

  options: Options = {
    directions: [true, false, false],   //Add as many words as possible, while going right and down;
    n0words: 99 
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

  fillGrid(): void {
    this.cellService.fillGrid(this.options);
  }

  toggleLetters(): void {
    this.hidden_letters = !this.hidden_letters;
  }

  getLoadingState(): void {
    this.databaseService.getLoadState()
      .subscribe(element => this.loading = element);
  }

  getSkips(): void {
    this.cellService.getSkips()
      .subscribe(skips => this.skips = skips);
  }

  getTotalLength(): void {
    this.n0elements = this.loadDataService.totalLength;
  }

  async getN0OfWords(): Promise<number> {
    let words: number = await this.databaseService.getN0OfWords();
    console.log(`Currently ${words} words in the database.`)
    return words;
  }

  toggleLoad(): void {
    this.databaseService.toggleLoad();
  }

  clearDB(): void {
    this.databaseService.clearDB();
  }

  isFinished(): void {
  }

  populate(): void {
    let cells: number[][] = [[1, 1], [3, 4], [3, 10], [5, 4], [7, 4], [9, 5], [9, 8], [11, 5]];
    let strings: string[] = ['crosswordmagic', 'start', 'by', 'choosing', 'options', 'on', 'the', 'right'];
    for(let index = 0; index < cells.length; index++) {
      this.cellService.addWord(cells[index][0], cells[index][1], strings[index], '', Directions.Right);
    }
  }

  async ngOnInit(): Promise<void> {
    this.getTotalLength();
    this.getLoadingState();
    this.databaseService.initDB()
      .then(element => (element) ? (this.databaseService.createEntries()
                                      .then(() => this.getN0OfWords()              //Creates a final db query after having sent all 
                                        .then(() => this.toggleLoad()))) : null);  //add queries to only return once db creation has finished.
    this.getGrid();
    this.getGridSize();
    this.getSkips();
    this.populate();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
