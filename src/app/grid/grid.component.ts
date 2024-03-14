import { Component, OnInit, OnDestroy } from '@angular/core';
import { Cell } from '../model/classes';
import { Options } from '../model/dtypes'; 
import { CellService } from '../Services/cell.service';
import { Subject, takeUntil } from 'rxjs';
import { Directions } from '../model/enums';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, OnDestroy {

  constructor(private CellService: CellService){}
  String = String;
  cell_grid: Cell[][] = [];
  grid_size: number[] = [];
  destroyed = new Subject<void>();
  hidden_content: boolean = false;

  options: Options = {
    directions: [true, false, false],
    n0words: 15
  }

  getGrid(): void {
    this.CellService.getGrid()
    .pipe(takeUntil(this.destroyed))
    .subscribe(grid => {
      this.cell_grid = grid
    });
  }

  getGridSize(): void {
    this.CellService.getGridSize()
    .subscribe(size => {
      this.grid_size = size
    });
  }

  fillGrid() {
    this.CellService.fillGrid(this.options);
  }

  toggleContent() {
    this.hidden_content = !this.hidden_content;
  }

  getRandomInt(upper_bound: number): number {
    return Math.floor(Math.random() * upper_bound);
  }

  populate() {
    let cells: number[][] = [[1, 1], [3, 4], [3, 10], [5, 4], [7, 4], [9, 5], [9, 8], [11, 5]];
    let strings: string[] = ['crosswordmagic', 'start', 'by', 'choosing', 'options', 'on', 'the', 'right'];
    for(let index = 0; index < cells.length; index++) {
      this.CellService.addWord(cells[index][0], cells[index][1], strings[index], '', Directions.Right);
    }
  }

  ngOnInit(): void {
    this.getGrid();
    this.getGridSize();
    this.populate();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
