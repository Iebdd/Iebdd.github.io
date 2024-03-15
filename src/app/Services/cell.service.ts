import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { Word, Occurence } from '../../db/db'; 
import { Options } from '../model/dtypes'; 
import { Directions, Parameters, ColRow, ID } from '../model/enums';
import { Cell, AdjacentContent, Edges } from '../model/classes';
import { LetterPipe } from '../Pipes/letter.pipe';
import { CharPipe } from '../Pipes/char.pipe';
import { RndIntPipe } from '../Pipes/rnd-int.pipe';
import { Occ2WordPipe } from '../Pipes/occ2word.pipe';
import { LowerCasePipe } from '@angular/common';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})

export class CellService {

  constructor(private LetterPipe: LetterPipe,
              private DatabaseService: DatabaseService,
              private RndIntPipe: RndIntPipe,
              private Occ2WordPipe: Occ2WordPipe,
              private CharPipe: CharPipe,
              private LowerCasePipe: LowerCasePipe) { }
  TimeoutError = Error("[[TODO Script has taken too long to execute]]");
  grid_size: number[] = [16, 16];
  cell_grid: Cell[][] = [];
  filled_cells: [number, number][] = [];
  hint_cells: [number, number][] = [];
  match: string = '';

  readonly N0Directions: number = 7;

  private grid_state = new BehaviorSubject<number[]>([this.grid_size[0], this.grid_size[1]]);

  setGridSize(column: number, row?: number): void {     //Limits grid size to 64 x 64 and reduces all dimensions to that value if they are higher
    if (row) {
      if (column <= 64 && row <= 64) {
        this.grid_size = [column, row];
        return;
      } else {
        (column >= 64) ? column = 64 : null;
        (row >= 64) ? row = 64 : null;
      }
    } else {
     if (column <= 64) {
      this.grid_size = [column, column];
      return;
     } else {
      column = 64;
     }
    }
    let check = window.confirm(`[[TODO Grid is limited to 64 x 64. Would you like to set it to ${column} x ${(row) ? row : column} or keep the current dimensions?]]`);
    (check) ? this.grid_size = [64, 64] : null;
  }

  createGrid(): void {
    for (let columns = 0; columns < this.grid_size[0]; columns++) {
      this.cell_grid[columns] = new Array<Cell>;
      for (let rows = 0; rows < this.grid_size[1]; rows++) {
        this.cell_grid[columns][rows] = new Cell(-1, columns, rows);
      }
    }
  }

  getGridSize(): Observable<number[]> {
    return this.grid_state.asObservable();
  }

  getGrid(): Observable<Cell[][]> {
    (this.cell_grid.length === 0) ? this.createGrid() : null;
    return of(this.cell_grid)
  }

  emptyGrid(): void {
    for (let columns = 0; columns < this.grid_size[0]; columns++) {
      for (let rows = 0; rows < this.grid_size[1]; rows++) {
        this.cell_grid[columns][rows].reInit();
      }
    }
    this.filled_cells.length = 0;
  }

  async fillGrid(options: Options) {
    let word: Word = {
      id: -1,
      hint_id: -1,
      word: ''
    }
    let occurence: Occurence = {
      id: -1,
      ids: [-1, -1],
      occurence: []
    }
    let occurences: Occurence[] = [];
    let filtered_occurences: Occurence[] = [];
    let hint: string = '';
    let cursor: [number, number] = [ColRow.Empty, ColRow.Empty];
    let next_cursor: [number, number] = [-1, -1];
    let next_direction: Directions = Directions.Left;
    let word_count: number = 0;
    let matching_arrays: number[] = [];
    let parameter_found: boolean[] = [false, false];
    let timeout: number = 0;
    let pivot_letter: number = -1;
    let max_directions: number = this.getDirectionArray(options.directions).length;
    this.emptyGrid();
    await this.addStartingWord(options);

    while (word_count <= options.n0words) {     
      parameter_found = [false, false];
      filtered_occurences.length = 0;
      cursor = this.filled_cells[this.RndIntPipe.transform(this.filled_cells.length - 1)];
      if(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].getHints().length >= max_directions) {
        continue;
      }
      next_direction = this.getNextDirection(options.directions);
      if (this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].getDirections().includes(next_direction)) {
        continue;
      }
      if(!this.checkAdjacentCells(cursor[ColRow.Column], cursor[ColRow.Row], next_direction)) {
        console.log('Its happening');
        continue;
      }
      pivot_letter = this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].getContent();
      matching_arrays = this.createMatchingArrays(cursor[ColRow.Column], cursor[ColRow.Row], next_direction);
      await this.DatabaseService.getOccurences(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].getContent())
        .then((result) => occurences = result)
        .catch((error) => alert('Cannot get Occurences' + error));
      filtered_occurences = this.filterOccurences(occurences, matching_arrays, cursor, next_direction);
      if(filtered_occurences.length > 0) {
        occurence = this.chooseOccurence(filtered_occurences)
        await this.DatabaseService.getWord(occurence.ids[ID.Word] + 1)
          .then((result) => word = result!)
          .catch((error) => alert('Cannot get Word:' + error));
        await this.DatabaseService.getHint(occurence.ids[ID.Hint] + 1)
          .then((result) => hint = result!.hint)
          .catch((error) => alert('Cannot get Hint:' + error));
        next_cursor = this.findStartingPoint(cursor[ColRow.Column], cursor[ColRow.Row], next_direction, this.LowerCasePipe.transform(word.word), pivot_letter);
        parameter_found[Parameters.Periphery] = this.checkPeriphery(next_cursor[ColRow.Column], next_cursor[ColRow.Row], word.word.length, next_direction);
        if(!parameter_found[Parameters.Periphery]) {
          continue;
        }
      }
      if (timeout > 500) {
        throw this.TimeoutError;
      }
      if(timeout > 0 && timeout % 100 === 0) {
        console.log(`Timeout: ${timeout}/500`);
      }
      timeout++;
      cursor = next_cursor;
      if (filtered_occurences.length === 0) {
        continue;
      }
      console.log(`Word Nr.${word_count + 2}: ${word.word}`);
      if(this.addWord(cursor[ColRow.Column], cursor[ColRow.Row], word.word, hint, next_direction)) {
        word_count++;
      }
    }
  }

  checkPeriphery(column: number, row: number, word_length: number, direction: Directions): boolean {
    let cursor: [number, number] = [column, row];
    if(!this.returnPeripheryResult(cursor[0],cursor[1], direction, true)) {
      return false;
    }
    cursor = this.move(cursor[0], cursor[1], direction);
    for(let length = 1; length < word_length - 1; length++) {
      if(!this.returnPeripheryResult(cursor[0], cursor[1], direction)) {
          return false;
        }
      cursor = this.move(cursor[0], cursor[1], direction);
    }
    if(!this.returnPeripheryResult(cursor[0], cursor[1], direction, false, true)) {
      return false;
    }
    return true;
  }

  returnPeripheryResult(column: number, row: number, direction: Directions, first: boolean = false, last: boolean = false): boolean {
    if (this.cell_grid[column][row].getContent() !== -1) {
      return true;
    }
    let directions: number[] = [-1, -1, -1, -1]     /* Up, Left, Right, Down */
    if(direction >= Directions.DiagonalLeft || direction <= Directions.Right) {
      (column != 0) ? directions[0] = this.cell_grid[column - 1][row].getContent() : null;
      (column < this.grid_size[0] - 1) ? directions[3] = this.cell_grid[column + 1][row].getContent() : null;
    }
    if(direction >= Directions.Down) {
      (row != 0) ? directions[1] = this.cell_grid[column][row - 1].getContent() : null;
      (row < this.grid_size[1] - 1) ? directions[2] = this.cell_grid[column][row + 1].getContent() : null;
    }
    switch(direction) {
      case Directions.Left:
        if (first) {
          (row < this.grid_size[1] - 1) ? directions[2] = this.cell_grid[column][row + 1].getContent() : null;
        } else if (last) {
          (row != 0) ? directions[1] = this.cell_grid[column][row - 1].getContent() : null;
        }
        break;
      case Directions.Right:
        if (first) {
          (row != 0) ? directions[1] = this.cell_grid[column][row - 1].getContent() : null;
        } else if (last) {
          (row < this.grid_size[1] - 1) ? directions[2] = this.cell_grid[column][row + 1].getContent() : null;
        }
      break;
      case Directions.Up:
        if (first) {
          (column < this.grid_size[0] - 1) ? directions[3] = this.cell_grid[column + 1][row].getContent() : null;
        } else if (last) {
          (column != 0) ? directions[0] = this.cell_grid[column - 1][row].getContent() : null;
        }
        break;
      case Directions.Down:
        if (first) {
          (column != 0) ? directions[0] = this.cell_grid[column - 1][row].getContent() : null;
        } else if (last) {
          (column < this.grid_size[0] - 1) ? directions[3] = this.cell_grid[column + 1][row].getContent() : null;
        }
      break;
      }
      return directions.every( x => x === -1);
  }

  returnPeriphery(column: number, row: number, direction: Directions): [number, number] {
    let max_columns: number = this.grid_size[0] - 1;            
    let max_rows: number = this.grid_size[1] - 1;               
    if(direction === Directions.Left || direction === Directions.Right || direction >= Directions.DiagonalLeft) {
      if (column != 0 || column < max_columns) {
        if(column == 0) {
          return [-1, this.cell_grid[column + 1][row].getContent()];
        } else if (column >= max_columns) {
          return [this.cell_grid[column - 1][row].getContent(), -1];
        }
        return [this.cell_grid[column - 1][row].getContent(), this.cell_grid[column + 1][row].getContent()]
      }
    } else if (direction === Directions.Up || direction === Directions.Down) {
      if (row != 0 || row < max_rows) {
        if(row == 0) {
          return [-1, this.cell_grid[column][row + 1].getContent()];
        } else if (row >= max_rows) {
          return [this.cell_grid[column][row - 1].getContent(), -1];
        }
        return [this.cell_grid[column][row - 1].getContent(), this.cell_grid[column][row + 1].getContent()]
      }
    }
    throw new Error(`Unknown Directions Type: ${direction}. In Col: ${column}, Row ${row}`);
    
  }

  async addStartingWord(options: Options): Promise<void> {
    let words: Word[] = [];
    let hint: string = '';
    let success: boolean = false;
    let cursor: [number, number] = [-1, -1];
    let next_direction: Directions = Directions.Left;
    words = this.filterWordsByLength(await this.DatabaseService.getWords());
    let word = words[this.RndIntPipe.transform(words.length)];
    hint = await this.DatabaseService.getHint(word.hint_id + 1)
      .then((result) => hint = result!.hint)
    while(!success) {
      next_direction = this.getNextDirection(options.directions);
      cursor = [this.RndIntPipe.transform(this.grid_size[ColRow.Column]), this.RndIntPipe.transform(this.grid_size[ColRow.Row])];
      if (this.getMaxLength(cursor[ColRow.Column], cursor[ColRow.Row], next_direction) >= word.word.length) {
        success = true;
      }
    }
    console.log(`Word Nr.1: ${word.word}`);
    this.addWord(cursor[ColRow.Column], cursor[ColRow.Row], word.word, hint, next_direction);
  }

  filterWordsByLength(words: Word[]): Word[] {
    let min_length: number = Math.min(Math.floor(this.grid_size[0] / 2), Math.floor(this.grid_size[1] / 2));
    return words.filter((element) => element.word.length >= min_length);
  }
  checkAdjacentCells(column: number, row: number, direction: Directions): boolean {
    let max_columns: number = this.grid_size[0] - 1;
    let max_rows: number = this.grid_size[1] - 1;
    let free: boolean = true;
    let adj_cells: AdjacentContent = { //Up, Left, Right, Down, DiagonalLeft, DiagonalRight, DiagonalUpLeft, DiagonalUpRight
      up: (column != 0) ? this.cell_grid[column - 1][row].getContent() : -1,
      left: (row != 0) ? this.cell_grid[column][row - 1].getContent() : -1,
      right: (row < max_rows)  ? this.cell_grid[column][row + 1].getContent() : -1,
      down: (column < max_columns) ? this.cell_grid[column + 1][ row].getContent() : -1,
      diagonalleft: (column != 0 && row < max_rows) ? this.cell_grid[column - 1][row + 1].getContent() : -1,
      diagonalright: (column < max_columns && row < max_rows) ? this.cell_grid[column + 1][row + 1].getContent() : -1,
      diagonalleftup: (column != 0 && row != 0) ? this.cell_grid[column - 1][row - 1].getContent() : -1,
      diagonalrightup: (column != 0 && row < max_rows) ? this.cell_grid[column - 1][row + 1].getContent() : -1
    }
     switch(direction) {
      case Directions.Left:
        (adj_cells.left != -1) ? free = false : null;
        (adj_cells.diagonalleftup != -1) ? free = false : null;
        (adj_cells.diagonalleft != -1) ? free = false : null;
      break;
      case Directions.Right:
        (adj_cells.right != -1) ? free = false : null;
        (adj_cells.diagonalrightup != -1) ? free = false : null;
        (adj_cells.diagonalright != -1) ? free = false : null;
      break;
      case Directions.Up:
        (adj_cells.up != -1) ? free = false : null;
        (adj_cells.diagonalleftup != -1) ? free = false : null;
        (adj_cells.diagonalrightup != -1) ? free = false : null;
      break;
      case Directions.Down:
        (adj_cells.down != -1) ? free = false : null;
        (adj_cells.diagonalleft != -1) ? free = false : null;
        (adj_cells.diagonalright != -1) ? free = false : null;
      break;
      case Directions.DiagonalLeft:
        (adj_cells.left != -1) ? free = false : null;
        (adj_cells.down != -1) ? free = false : null;
        (adj_cells.diagonalleft != -1) ? free = false : null;
      break;
      case Directions.DiagonalRight:
        (adj_cells.right != -1) ? free = false : null;
        (adj_cells.down != -1) ? free = false : null;
        (adj_cells.diagonalright != -1) ? free = false : null;
      break;
      case Directions.DiagonalLeftUp:
        (adj_cells.left != -1) ? free = false : null;
        (adj_cells.up != -1) ? free = false : null;
        (adj_cells.diagonalleftup != -1) ? free = false : null;
      break;
      case Directions.DiagonalRightUp:
        (adj_cells.right != -1) ? free = false : null;
        (adj_cells.up != -1) ? free = false : null;
        (adj_cells.diagonalrightup != -1) ? free = false : null;
      break;
    }
    return free;
  }

  shuffleArray<Type>(array: Array<Type>): Array<Type> {
    for(let index = array.length - 1; index > 0; index--) {
      const random_index: number = this.RndIntPipe.transform(index + 1);
      const temp = array[index];
      array[index] = array[random_index];
      array[random_index] = temp;
    }
    return array;
  }

  chooseOccurence(occurences: Occurence[]): Occurence {
    let max_length: number = 0;
    let min_index: number = 0;
    occurences.sort((a, b) => a.occurence.length - b.occurence.length);
    max_length = occurences[occurences.length - 1].occurence.length;
    if(max_length >= 5) {
      for(const [index, element] of occurences.entries()) {
        if(element.occurence.length >= 5) {
          min_index = index;
          break;
        }
      }
      return occurences[this.RndIntPipe.transform(occurences.length, min_index)]
    } else {
      return occurences[this.RndIntPipe.transform(occurences.length)]
    }
    
  }

  findStartingPoint(column: number, row: number, direction: Directions, word: string, pivot_letter: number): [number, number] {
    let cursor: [number, number] = [column, row];
    let temp_cursor: [number, number] = [-1, -1];
    let occ_index: number[] = [];
    let end_cursor: [number, number] = [-1, -1];
    cursor = this.moveToEdge(cursor[ColRow.Column], cursor[ColRow.Row], direction);
    end_cursor = this.moveToEdge(cursor[ColRow.Column], cursor[ColRow.Row], this.invertDirection(direction));

    while(cursor[0] !== end_cursor[0] || cursor[1] !== end_cursor[1]) {
      while(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].getContent() !== pivot_letter) {
        cursor = this.move(cursor[ColRow.Column], cursor[ColRow.Row], direction);
      }
      for (let index = 0; index < word.length; index++) {
        if (word[index] === this.CharPipe.transform(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].getContent(), false)) {
          occ_index.push(index);
        }
      }
      for (let index = 0; index < occ_index.length; index++) {
        temp_cursor = this.move(cursor[ColRow.Column], cursor[ColRow.Row], this.invertDirection(direction), occ_index[index]);
        if(temp_cursor[0] === -1 && temp_cursor[1] === -1) {
          break;
        } else if(this.getMaxLength(temp_cursor[ColRow.Column], temp_cursor[ColRow.Row], direction) >= word.length) {
          return temp_cursor;
        }
      }
      (cursor[0] !== end_cursor[0]) ? ++cursor[0] : null;
      (cursor[1] !== end_cursor[1]) ? ++cursor[1] : null;
    }
    throw new RangeError(`No suitable position for word: ${word}. Pivot: ${column}, ${row}`);
  }

  filterOccurences(occurences: Occurence[], matching_array: number[], cursor: [number, number], direction: Directions): Occurence[] {
    let match_string: string = this.createRegexMatcher(matching_array);
    let match_buffer: [string, boolean] = ['', false];
    let start: boolean = false;
    let attempting: boolean = true;
    let pivot_index: number = this.getPivotIndex(cursor[0], cursor[1], direction, match_string);
    let indp_letters: number[] = this.findIndependentLetters(match_string);
    let filtered_occurences: Occurence[] = [];
    match_buffer[0] = match_string;
    while( attempting ) {
      let matcher: RegExp = new RegExp('^' + match_buffer[0] + '$', 'gi');
      filtered_occurences = occurences.filter((element) => matcher.test(this.Occ2WordPipe.transform(element.occurence)));
      if(filtered_occurences.length != 0) {
        break;
      } else {
        match_buffer = this.shortenMatcher(match_string, indp_letters, pivot_index, start);
        if ((match_buffer[0].length == 0 && start) || indp_letters.length <= 1) {
          break;
        } else if(match_buffer[0].length == 0 && match_buffer[1]) {
          start = true;
          match_buffer[0] = match_string;
        } else if(start) {
          indp_letters.shift();
        } else {
          indp_letters.pop();
        }
      }
    }
    return filtered_occurences
  }

  shortenMatcher(match_string: string, indp_letters: number[], pivot_index: number, start: boolean): [string, boolean] {
    if (start && indp_letters[0] >= pivot_index) {
      return ['', false];
    }
    if (!start && indp_letters[indp_letters.length - 1] === pivot_index) {
      return ['', true];
    }
    if (start) {
      return  [match_string.slice(indp_letters[0] + 2, match_string.length).replace(/^\.*(?=\w)/, this.replacer), false];
    } else {
      return [match_string.slice(0, indp_letters[indp_letters.length - 1] - 1).replace(/(?<=\w)\.*$/, this.replacer), false];
    }
  }

  getPivotIndex(column: number, row: number, direction: Directions, match_string: string): number {
    let word_index: number = this.getMaxLength(column, row, this.invertDirection(direction)) - 1;
    let matches: RegExpMatchArray[] = [...match_string.matchAll(/(?:\.\??|\w)/gi)];
    if(matches[word_index][0] !== '.?') {
      return matches[word_index].index!;
    }
    throw new Error(`Unable to find pivot in ${column}, ${row} with match of ${match_string}.`);
  }

  findIndependentLetters(match_array: string): number[] {
    let indp_letters: number[] = [];
    for ( const match of match_array.matchAll(/(?<=\.\??|^)\w(?=\.\??|$)/gi) ) {
      if(match.index) {
        indp_letters.push(match.index);
      }
    }
    return indp_letters;
  }

  createRegexMatcher(matching_arrays: number[]): string {              // Returns a regex match string where all wildcards before and
    let length: number = matching_arrays.length - 1;                   // after the letters are optional making it variable length.
    let empty: [number, number] = [0, 0];
    let regex: string = '';
    while(matching_arrays[empty[0]] == -1 || matching_arrays[length - empty[1]] == -1) {
      (matching_arrays[empty[0]] == -1) ? empty[0]++ : null;
      (matching_arrays[length - empty[1]] == -1) ? empty[1]++ : null;
    }
    for(let match_iterator = 0; match_iterator < matching_arrays.length; match_iterator++) {
      if (empty[0]) {
        regex += '.?';
        empty[0]--;
      } else if (match_iterator > length - empty[1]) {
        regex += '.?';
        empty[1]--;
      } else if (matching_arrays[match_iterator] == -1) {
        regex += '.';
      } else {
        regex += this.CharPipe.transform(matching_arrays[match_iterator], false);
      }
    }
    return regex;
  }

  createMatchingArrays(column: number, row: number, direction: Directions): number[] {
    let cursor: [number, number] = this.moveToEdge(column, row, direction);
    let max_length = this.getMaxLength(cursor[ColRow.Column], cursor[ColRow.Row], direction) - 1;
    let side_buffer: [number, number] = [-1, -1];
    let matching_arrays: number[] = [];
    for (let cell_iterator = 0; cell_iterator <= max_length; cell_iterator++) {
      matching_arrays.push(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].getContent());
      side_buffer = this.returnPeriphery(cursor[ColRow.Column], cursor[ColRow.Row], direction);
      cursor = this.move(cursor[ColRow.Column], cursor[ColRow.Row], direction);
    }
    return matching_arrays;
  }

  invertDirection(direction: Directions): Directions {            // The Directions enum starts at 2 so the directions form even / uneven pairs  
    return (direction % 2 === 0) ? ++direction : --direction;
  }

  getNextDirection(options: boolean[]): Directions {
    let direction_array: Directions[] = this.getDirectionArray(options);
    return direction_array[Math.ceil(Math.random() * direction_array.length - 1)];
  }

  getDirectionArray(options: boolean[]): Directions[] {
    let directions: Directions[] = [];
    (options[0]) ? directions.push(Directions.Right, Directions.Down) : null;
    if (options[1]) {
      directions.push(Directions.DiagonalLeft, Directions.DiagonalRight);
      (options[2]) ? directions.push(Directions.DiagonalLeftUp, Directions.DiagonalRightUp) : null ;
    }
    (options[2]) ? directions.push(Directions.Up, Directions.Left) : null ;
    return directions;
  }

  getTotalLength(column: number, row: number, direction: Directions): number[] {
    let forward: number = 0;
    let backward: number = 0;
    forward = this.getMaxLength(column, row, direction);
    backward = this.getMaxLength(column, row, this.invertDirection(direction));
    return [forward + backward + 1, backward];
  }

  addWord(column: number, row: number, word: string, hint: string, direction: Directions): boolean {
    let cursor: [number, number] = [column, row];
    let to_be_filled: [number, number][] = [];
    let curr_cell: number = 0;
    if (this.getMaxLength(column, row, direction) < word.length) {
      throw new RangeError(`Selected word does not fit: ${word} Size: ${word.length} Start Point: ${cursor}`);
    }
    this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].setHint(hint);
    this.hint_cells.push([cursor[ColRow.Column], cursor[ColRow.Row]]);
    for (let word_index = 0; word_index < word.length; word_index++) {
      curr_cell = this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].getContent();
      this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].addDirection(direction);
      if(curr_cell === -1 || curr_cell === this.LetterPipe.transform(word[word_index])) {
        this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].setContent(this.LetterPipe.transform(word[word_index]));
      } else {
        if(to_be_filled.length > 0) {
          this.undoAddition(to_be_filled);
        }
        return false;
      }
      to_be_filled.push([cursor[ColRow.Column], cursor[ColRow.Row]])
      cursor = this.move(cursor[ColRow.Column], cursor[ColRow.Row], direction);
    }
    this.filled_cells = this.filled_cells.concat(to_be_filled)
    return true;
  }

  undoAddition(to_be_deleted: [number, number][]) {
    let cursor: [number, number] = [-1, -1];
    let n0hints: number = this.cell_grid[to_be_deleted[0][0]][to_be_deleted[0][1]].getHints().length;
    if(to_be_deleted.length > 1) {
      console.log(`Undoing additions between: ${to_be_deleted[0]} and ${to_be_deleted[to_be_deleted.length - 1]}.`);
    } else {
      console.log(`Undoing addition at: ${to_be_deleted[0]}.`);
    }
    for(let iterator = 1; iterator <= to_be_deleted.length; iterator++) {
      cursor = to_be_deleted[to_be_deleted.length - iterator];
      if(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].getDirections().length >= 2) {
        this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]]
          .removeDirection(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]]
            .getDirections().length - 1);
      } else {
        this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].setContent(-1);
      }
    }
    this.cell_grid[to_be_deleted[0][0]][to_be_deleted[0][1]].removeHint(n0hints - 1);
  }

  move(column: number, row: number, direction: Directions, steps: number = 1): [number, number] {
    let max_columns: number = this.grid_size[0];
    let max_rows: number = this.grid_size[1];
    if(this.checkValidity(column, row, steps, direction) === -1) {
      return [-1, -1];
    };
    switch (direction) {
      case Directions.Left:
        return (row <= 0) ? [column, row] : [column, row - steps];
      case Directions.Right:
        return (row >= max_rows) ? [column, row] : [column, row + steps];
      case Directions.Down:
        return (column >= max_columns) ? [column, row] : [column + steps, row];
      case Directions.Up:
        return (column > 0) ? [column - steps, row] : [column, row];
      case Directions.DiagonalLeft:
        return (column >= max_columns || row <= 0) ? [column, row] : [column + steps, row - steps];
      case Directions.DiagonalRight:
        return (column >= max_columns || row >= max_rows) ? [column, row] : [column + steps, row + steps];
      case Directions.DiagonalRightUp:
        return (column <= 0 || row >= max_rows) ? [column, row] : [column - steps, row + steps];
      case Directions.DiagonalLeftUp:
        return (column <= 0 || row <= 0) ? [column, row] : [column - steps, row - steps];
    }
  }

  moveToEdge(column: number, row: number, direction: Directions): [number, number] {
    direction = this.invertDirection(direction);
    let max_columns: number = this.grid_size[0] - 1;
    let max_rows: number = this.grid_size[1] - 1;
    let distances: Edges = { /* Up, Left, Right, Down */
    up: column,
    left: row,
    right: max_rows - row,
    down: max_columns - column
  }
    this.checkValidity(column, row);

    switch(direction) {
      case Directions.Left:
        return [column, 0];
      case Directions.Right:
        return [column, max_rows];
      case Directions.Down:
        return [max_columns, row];
      case Directions.Up:
        return [0, row];
      case Directions.DiagonalLeft:
        return (distances.down < distances.left) ? [max_columns, row - distances.down] : [column + distances.left, 0];
      case Directions.DiagonalRightUp:
        return (distances.up < distances.right) ? [0, row + distances.up] : [column - distances.right, max_rows];
      case Directions.DiagonalRight:
        return (distances.down < distances.right) ? [max_columns, row + distances.down] : [column + distances.right, max_rows];
      case Directions.DiagonalLeftUp:
        return (distances.up < distances.left) ? [0, row - distances.up] : [column - distances.left, 0];
    }

  }

  getMaxLength(column: number, row: number, direction: Directions): number {
    let max_columns: number = this.grid_size[0];
    let max_rows: number = this.grid_size[1];
    let distances: Edges = { /* Up, Left, Right, Down */
      up: column,
      left: row,
      right: max_rows - row,
      down: max_columns - column
    }
    this.checkValidity(column, row)

    switch(direction) {
      case Directions.Left:
        return row + 1;
      case Directions.Right:
        return max_rows - row;
      case Directions.Down:
        return max_columns - column;
      case Directions.Up:
        return column + 1;
      case Directions.DiagonalLeft:
        return (distances.down < distances.left) ? max_columns - column : row + 1 ;
      case Directions.DiagonalRightUp:
        return (distances.up < distances.right) ? column + 1 : max_rows - row;
      case Directions.DiagonalRight:
        return (distances.down < distances.right) ? max_columns - column: max_rows - row;
      case Directions.DiagonalLeftUp:
        return (distances.up < distances.left) ? column + 1 : row + 1;
    }
  }

  checkValidity(column: number, row: number, steps: number = 1, direction?: Directions): number {
    let max_columns: number = this.grid_size[0] - 1;
    let max_rows: number = this.grid_size[1] - 1;

    if (column > max_columns || row > max_rows) {
      throw new RangeError(`Entered coodinates exceed grid size: ${column}/${max_columns}, ${row}/${max_rows}`);
    }
    if (max_columns <= 0 || max_rows <= 0) {
      throw new RangeError(`Column or Row size set to 0: ${max_columns}/${max_rows}`);
    }
    if(steps < 0) {
      throw new RangeError(`Incorrect move parameter: Column: ${column}, Row: ${row}, Steps: ${steps}`);
    }
    if(steps > 1) {
      switch(direction) {
        case Directions.Left:
          if(steps > row) {
            return -1;
          };
          break;
        case Directions.Right:
          if(row + steps > max_rows) {
            return -1
          };
          break;
        case Directions.Down:
          if(column + steps > max_columns) {
            return -1
          };
          break;
        case Directions.Up:
          if(steps > column) {
            return -1;
          };
          break;
        case Directions.DiagonalLeft:
          if(column + steps > max_columns || steps > row) {
            return -1
          };
          break;
        case Directions.DiagonalRightUp:
          if(steps > column || row + steps > max_rows) {
            return -1
          };
          break;
        case Directions.DiagonalRight:
          if(column + steps > max_columns || row + steps > max_rows) {
            return -1
          };
          break;
        case Directions.DiagonalLeftUp:
          if(steps > column || steps > row) {
            return -1
          };
          break;
        default:
          null;
      }
    }
    return 0;

  }

  replacer(match: string): string {
    return match.replace(/\./g, '.?');
  }
}
