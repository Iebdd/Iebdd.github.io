import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadDataService } from '../Services/load-data.service';
import { CellService } from '../Services/cell.service';
import { DatabaseService } from '../Services/database.service';
import { StateService } from '../Services/state.service';
import { Options } from '../model/dtypes';
import { States } from '../model/enums';
import { Subject, takeUntil } from 'rxjs';
 
@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './control-panel.component.html',
  styleUrl: './control-panel.component.scss'
})
export class ControlPanelComponent implements OnInit, OnDestroy {

  constructor(private loadDataService: LoadDataService,
              private cellService: CellService,
              private databaseService: DatabaseService,
              private stateService: StateService) {

  }

  n0elements: number = 0;
  skips: number[] = [0, 0, 0, 0, 0];
  progress: number = 0;
  hidden_letters: boolean = false;
  hidden_hints: boolean = true;
  destroyed = new Subject<void>();
  loading: boolean = true;
  working: boolean = false;
  default_grid: boolean = true;
  options: Options = {
    directions: [false, false, false],  //The directions it will consider
    n0words: 0,                         //Number of words to be inserted before stopping. Ignored if amap (As many as possible) is true
    amap: true                          // Ignores the maximum amount of words and inserts as many as there is space for
  }

  getTotalLength(): void {
    this.n0elements = this.loadDataService.totalLength;
  }

  fillGrid(): void {
    (this.working) ? null : this.toggleState(States.Working);
    if(!this.hidden_hints) {
      this.toggleState(States.Hints);
    }
    (this.default_grid) ? this.toggleState(States.Grid) : null;
    this.cellService.fillGrid(this.options);
  }

  renderLoadBar(): string {
    return `linear-gradient(to right, white 0% ${this.progress}%, #bbb ${this.progress}% 100%`;
  }

  getSkips(): void {
    this.cellService.getSkips()
      .subscribe(skips => this.skips = skips);
  }
  
  getOptions(): void {
    this.stateService.getOptions()
      .subscribe(options => this.options = options);
  }

  setOptions(options: Options): number {
    if (options.n0words < 0) {
      return 1;
    } else if (options.n0words > 99) {
      options.n0words = 99;
    }
    if(options.directions.every( x => x == false)) {
      return 2;
    }
    this.setOptions(options);
    return 0;
  }

  clearDB(): void {
    this.databaseService.clearDB();
  }

  async getN0OfWords(): Promise<number> {
    let words: number = await this.databaseService.getN0OfWords();
    console.log(`Currently ${words} words in the database.`)
    return words;
  }

  getProgress(): void {
    this.databaseService.getProgress()
      .pipe(takeUntil(this.destroyed))
      .subscribe((number) => this.progress = number);
  }

  getLoadingState(): void {
    this.stateService.getLoadState()
      .pipe(takeUntil(this.destroyed))
      .subscribe(state => this.loading = state);
  }

  getLetterVisibility(): void {
    this.stateService.getLetterVisibility()
      .pipe(takeUntil(this.destroyed))
      .subscribe((state) => this.hidden_letters = state);
  }

  getGridState(): void {
    this.stateService.getGridState()
      .pipe(takeUntil(this.destroyed))
      .subscribe((state) => this.default_grid = state);
  }

  toggleState(state: number) {
    this.stateService.toggleState(state);
  }

  getHintVisibility(): void {
    this.stateService.getHintVisibility()
      .pipe(takeUntil(this.destroyed))
      .subscribe((state) => this.hidden_hints = state);
  }


  getWorkingState(): void {
    this.stateService.getWorkingState()
      .pipe(takeUntil(this.destroyed))
      .subscribe((state) => this.working = state); 
  }

  ngOnInit() {
    this.getProgress();
    this.getLoadingState();
    this.getLetterVisibility();
    this.getHintVisibility();
    this.getGridState();
    this.getWorkingState();
    this.getTotalLength();
    this.getOptions();
    this.databaseService.initDB()
      .then(element => (element) ? (this.databaseService.createEntries()
                                      .then(() => this.getN0OfWords()              //Creates a final db query after having sent all 
                                        .then(() => this.toggleState(States.Load)))) : null);  //add queries to only return once db creation has finished.
    this.getSkips();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
