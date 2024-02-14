import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
  grid_size: number[] = [16, 16]
  cells = Array(this.grid_size[0]).fill(null).map(() => Array(this.grid_size[1]))

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max)
  }

  ngOnInit() {
    let row: number = 0;
    for (let cell = 0; cell < 16; cell++) {
      row = this.getRandomInt(16);
      this.cells[cell][row] = this.getRandomInt(100);
    }
  }

}
