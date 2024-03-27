import { Injectable} from '@angular/core';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { Word } from '../../db/db'; 
import { Options } from '../model/dtypes'; 
import { Directions, Parameters, ColRow} from '../model/enums';
import { Cell, AdjacentContent, Edges } from '../model/classes';
import { LetterPipe } from '../Pipes/letter.pipe';
import { CharPipe } from '../Pipes/char.pipe';
import { RndIntPipe } from '../Pipes/rnd-int.pipe';
import { Number2WordPipe } from '../Pipes/number2word.pipe';
import { LowerCasePipe } from '@angular/common';
import { DatabaseService } from './database.service';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root'
})

export class CellService {

  constructor(private letterPipe: LetterPipe,
              private databaseService: DatabaseService,
              private rndIntPipe: RndIntPipe,
              private charPipe: CharPipe,
              private lowerCasePipe: LowerCasePipe,
              private translocoService: TranslocoService,
              private number2WordPipe: Number2WordPipe) { }
  grid_size: number[] = [16, 16];
  cell_grid: Cell[][] = [];
  filled_cells: [number, number][] = [];
  curated_cells: [number, number][] = [];
  skips: number[] = [0, 0, 0, 0, 0, 0];
  hint_cells: [number, number][] = [];
  match: string = '';
  timeouterror: string = '';
  regex: string = '';
  TimeoutError = Error(this.timeouterror);

  readonly N0Directions: number = 7;

  private grid_state$ = new BehaviorSubject<number[]>([this.grid_size[0], this.grid_size[1]]);

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
        this.cell_grid[columns][rows] = new Cell(-1);
      }
    }
  }

  getGridSize(): Observable<number[]> {
    return this.grid_state$.asObservable();
  }

  get Grid(): Observable<Cell[][]> {
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
    const start = performance.now();
    let word: Word = {
      id: -1,
      hint_id: -1,
      word: []
    }
    let words: Word[] = [];
    let filtered_words: Word[] = [];
    let hint: string = '';
    let cursor: [number, number] = [ColRow.Empty, ColRow.Empty];
    let next_cursor: [number, number] = [-1, -1];
    let cursor_index: number = 0;
    let next_direction: Directions = Directions.Left;
    let match_string: string = '';
    let word_count: number = 1;
    let matching_array: number[] = [];
    let parameter_found: boolean = false;
    let timeout: number = 0;
    let pivot_letter: number = -1;
    let pivot_index: number = -1;
    let max_directions: number = this.getDirectionArray(options.directions).length;
    let previous_array_size: number = 0;
    let retry: number = 0;
    this.emptyGrid();
    await this.addStartingWord(options.directions);

    while (word_count < options.n0words) {    
      if(previous_array_size !== this.filled_cells.length) {
        console.log(this.filled_cells);
      }
      retry = 0;
      previous_array_size = this.filled_cells.length;
      parameter_found = false;
      filtered_words.length = 0;
      cursor_index = this.rndIntPipe.transform(this.filled_cells.length - 1)
      cursor = this.filled_cells[cursor_index];
      if(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].Directions.length >= max_directions) {
        console.log(`Removing element at index ${cursor_index}: ${this.filled_cells[cursor_index]} because of max directions while ${(next_direction === 3) ? 'going right' : 'going down'}.`);
        this.filled_cells = this.removeElement(cursor_index, this.filled_cells);
        this.skips[0]++;
        continue;
      }
      next_direction = this.getNextDirection(options.directions);
      if (this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].Directions.includes(next_direction)) {
        this.skips[1]++;
        this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].addIneligibility(next_direction);
        next_direction = this.getDifferentDirection(this.getDirectionArray(options.directions), this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].Directions);
      }
      if(!this.checkAdjacentCells(cursor[ColRow.Column], cursor[ColRow.Row], next_direction)) {
        if(this.checkEligibility(cursor[ColRow.Column], cursor[ColRow.Row], next_direction, max_directions)) {
          console.log(`Removing element at index ${cursor_index}: ${this.filled_cells[cursor_index]} because of filled adjacent cells while ${(next_direction === 3) ? 'going right' : 'going down'}.`);
          this.filled_cells = this.removeElement(cursor_index, this.filled_cells);
        }
        this.skips[2]++
        continue;
      }
      pivot_letter = this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].Content;
      matching_array = this.createMatchingArray(cursor[ColRow.Column], cursor[ColRow.Row], next_direction);
      await this.databaseService.getWordsByLetter(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].Content)
        .then((result) => words = result)
        .catch((error) => alert('Cannot get Words' + error));
      do {
        match_string = this.createRegexMatcher(matching_array);
        pivot_index = this.getPivotIndex(cursor[0], cursor[1], next_direction, match_string);
        filtered_words = this.filterOccurences(words, match_string, pivot_index);
        if(filtered_words.length > 0) {
          word = this.chooseWord(filtered_words)
          await this.databaseService.getHint(word.hint_id + 1)
            .then((result) => hint = result!.hint)
            .catch((error) => alert('Cannot get Hint:' + error));
          next_cursor = this.findStartingPoint(cursor[ColRow.Column], cursor[ColRow.Row], next_direction, this.lowerCasePipe.transform(this.number2WordPipe.transform(word.word)), pivot_letter);
          if(next_cursor[0] === -1 || next_cursor[1] === -1) {
            this.skips[3]++;
            retry = 1;
            break;
          }
        }
        [matching_array, retry] = this.getViability(cursor[ColRow.Column], cursor[ColRow.Row], next_direction, matching_array, pivot_letter, retry, filtered_words.length !== 0, 4);
        if (retry === -1) {
          break;
        } else if(retry) {
          continue;
        }
        parameter_found = this.checkPeriphery(next_cursor[ColRow.Column], next_cursor[ColRow.Row], word.word.length, next_direction);
        [matching_array, retry] = this.getViability(cursor[ColRow.Column], cursor[ColRow.Row], next_direction, matching_array, pivot_letter, retry, parameter_found, 5);
        if(retry === -1) {
          break;
        }
      } while (retry)

      if(retry === -1) {
        if(this.checkEligibility(cursor[ColRow.Column], cursor[ColRow.Row], next_direction, max_directions)) {
          console.log(`Removing element at index ${cursor_index}: ${this.filled_cells[cursor_index]}.`);
          this.filled_cells = this.removeElement(cursor_index, this.filled_cells);
        }
        continue;
      }
      cursor = next_cursor;
      if (timeout > 500) {
        this.logAttempt(word_count, (performance.now() - start) / 1000, false);
        throw this.TimeoutError;
      }
      if(timeout > 0 && timeout % 100 === 0) {
        console.log(`Timeout: ${timeout}/500`);
      }
      console.log(`Word Nr.${word_count + 1}: ${this.number2WordPipe.transform(word.word)}`);
      if(this.addWord(cursor[ColRow.Column], cursor[ColRow.Row], this.number2WordPipe.transform(word.word), hint, next_direction)) {
        word_count++;
      }
    }
    this.logAttempt(word_count, (performance.now() - start) / 1000, true);
  }

  getViability(column: number, row: number, direction: Directions, matching_array: number[], pivot_letter: number, retry: number, success: boolean, skips_type: number): [number[], number] {
    console.log(`Success? ${(success) ? 'yes!' : 'no :('}`);
    if(!success) {  
      if(matching_array[matching_array.length - 1] === pivot_letter  || matching_array[0] === pivot_letter) {
        if (retry === 1) {
          console.log("We're doing it from the other side!");
          matching_array = this.shortenToPivot(column, row, direction, this.getMaxLength(column, row, this.invertDirection(direction)) - 1, true);
          return [matching_array, 2];
        } else {
          this.skips[skips_type]++;
          return [matching_array, -1];
        }
  
      } else {
        console.log("We're doing this!");
        matching_array = this.shortenToPivot(column, row, direction, this.getMaxLength(column, row, this.invertDirection(direction)) - 1, false);
        retry = 1;
        return [matching_array, 1]
      }
    }
    return [matching_array, 0]
  }

  shortenToPivot(column: number, row: number, direction: Directions, max: number, min: boolean): number[] {
    let max_length: number = this.getMaxLength(column, row, this.invertDirection(direction)) - 1
    return (max !== -1) ? this.createMatchingArray(column, row, direction, max_length) : this.createMatchingArray(column, row, direction, -1, min);
  }

  logAttempt(word_count: number, time: number, finished: boolean) {
    if(finished) {
      console.log(`Finished adding ${word_count} words after ${time} seconds.`);
    } else {
      console.log(`Given up on grid after ${time} seconds with ${word_count} found words.`)
    }
    console.log(`Skipped ${this.skips[0]} times due to insufficient directions.`);
    console.log(`Skipped ${this.skips[1]} times due to to duplicate directions.`);
    console.log(`Skipped ${this.skips[2]} times due to full adjacent cells.`);
    console.log(`Skipped ${this.skips[3]} times due to an invalid periphery.`);
    console.log(`Skipped ${this.skips[4]} times due to no valid matches.`);
  }

  checkEligibility(column: number, row: number, direction: Directions, max_directions: number): boolean {
    let invalid_directions: Directions[] = this.cell_grid[column][row].Eligibility;
    if (invalid_directions.includes(direction)) {
      return (invalid_directions.length >= max_directions) ? true : false;
    } else {
      this.cell_grid[column][row].addIneligibility(direction);
      return (invalid_directions.length >= max_directions) ? true : false;
    }
  }

  removeElement<Type>(index: number, elements: Type[]): Type[] {
    if (elements.length - 1 === index) {
        return elements.slice(0, index);
    } else if (index === 0) {
      return elements.slice(1, elements.length);
    } else {
      return elements.slice(0, index).concat(elements.slice(index + 1, elements.length));
    }
  }

  checkPeriphery(column: number, row: number, word_length: number, direction: Directions): boolean { //Checks the content of directly adjacent cells
    let cursor: [number, number] = [column, row];                                                    //returning true if they are all empty and false
    if(!this.returnPeripheryResult(cursor[0],cursor[1], direction, true)) {                          //if any of them are occupied.
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
    let max_columns: number = this.grid_size[0] - 1;
    let max_rows: number = this.grid_size[1] - 1;
    if (this.cell_grid[column][row].Content !== -1) {
      return true;
    }
    let directions: number[] = [-1, -1, -1, -1]     /* Up, Left, Right, Down */
    if(direction >= Directions.DiagonalLeft || direction <= Directions.Right) {
      (column != 0) ? directions[0] = this.cell_grid[column - 1][row].Content : null;
      (column < max_columns) ? directions[3] = this.cell_grid[column + 1][row].Content : null;
    }
    if(direction >= Directions.Down) {
      (row != 0) ? directions[1] = this.cell_grid[column][row - 1].Content : null;
      (row < max_rows) ? directions[2] = this.cell_grid[column][row + 1].Content : null;
    }
    switch(direction) {
      case Directions.Left:
        if (first) {
          (row < max_rows) ? directions[2] = this.cell_grid[column][row + 1].Content : null;
        } else if (last) {
          (row != 0) ? directions[1] = this.cell_grid[column][row - 1].Content : null;
        }
        break;
      case Directions.Right:
        if (first) {
          (row != 0) ? directions[1] = this.cell_grid[column][row - 1].Content : null;
        } else if (last) {
          (row < max_rows) ? directions[2] = this.cell_grid[column][row + 1].Content : null;
        }
      break;
      case Directions.Up:
        if (first) {
          (column < max_columns) ? directions[3] = this.cell_grid[column + 1][row].Content : null;
        } else if (last) {
          (column != 0) ? directions[0] = this.cell_grid[column - 1][row].Content : null;
        }
        break;
      case Directions.Down:
        if (first) {
          (column != 0) ? directions[0] = this.cell_grid[column - 1][row].Content : null;
        } else if (last) {
          (column < max_columns) ? directions[3] = this.cell_grid[column + 1][row].Content : null;
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
          return [-1, this.cell_grid[column + 1][row].Content];
        } else if (column >= max_columns) {
          return [this.cell_grid[column - 1][row].Content, -1];
        }
        return [this.cell_grid[column - 1][row].Content, this.cell_grid[column + 1][row].Content]
      }
    } else if (direction === Directions.Up || direction === Directions.Down) {
      if (row != 0 || row < max_rows) {
        if(row == 0) {
          return [-1, this.cell_grid[column][row + 1].Content];
        } else if (row >= max_rows) {
          return [this.cell_grid[column][row - 1].Content, -1];
        }
        return [this.cell_grid[column][row - 1].Content, this.cell_grid[column][row + 1].Content]
      }
    }
    throw new Error(`Unknown Directions Type: ${direction}. In Col: ${column}, Row ${row}`);
    
  }

  async addStartingWord(directions: boolean[]): Promise<void> {
    let words: Word[] = [];
    let hint: string = '';
    let success: boolean = false;
    let cursor: [number, number] = [-1, -1];
    let next_direction: Directions = Directions.Left;
    words = this.filterWordsByLength(await this.databaseService.getWords());
    let word = words[this.rndIntPipe.transform(words.length)];
    hint = await this.databaseService.getHint(word.hint_id + 1)
      .then((result) => hint = result!.hint)
    while(!success) {
      next_direction = this.getNextDirection(directions);
      cursor = [this.rndIntPipe.transform(this.grid_size[ColRow.Column]), this.rndIntPipe.transform(this.grid_size[ColRow.Row])];
      if (this.getMaxLength(cursor[ColRow.Column], cursor[ColRow.Row], next_direction) >= word.word.length) {
        success = true;
      }
    }
    console.log(`Word Nr.1: ${this.number2WordPipe.transform(word.word)}`);
    this.addWord(cursor[ColRow.Column], cursor[ColRow.Row], this.number2WordPipe.transform(word.word), hint, next_direction);
  }

  filterWordsByLength(words: Word[]): Word[] {        //Returns a sub-array of objects with words longer than the shorter of the two sides halved
    let min_length: number = Math.min(Math.floor(this.grid_size[0] / 2), Math.floor(this.grid_size[1] / 2));
    return words.filter((element) => element.word.length >= min_length);
  }

  checkAdjacentCells(column: number, row: number, direction: Directions): boolean { //Checks the immediate vicinity of the cell based on the intended direction
    let max_columns: number = this.grid_size[0] - 1;
    let max_rows: number = this.grid_size[1] - 1;
    let free: boolean = true;
    let adj_cells: AdjacentContent = { //Up, Left, Right, Down, DiagonalLeft, DiagonalRight, DiagonalUpLeft, DiagonalUpRight
      up: (column != 0) ? this.cell_grid[column - 1][row].Content : -1,
      left: (row != 0) ? this.cell_grid[column][row - 1].Content : -1,
      right: (row < max_rows)  ? this.cell_grid[column][row + 1].Content : -1,
      down: (column < max_columns) ? this.cell_grid[column + 1][ row].Content : -1,
      diagonalleft: (column != 0 && row < max_rows) ? this.cell_grid[column - 1][row + 1].Content : -1,
      diagonalright: (column < max_columns && row < max_rows) ? this.cell_grid[column + 1][row + 1].Content : -1,
      diagonalleftup: (column != 0 && row != 0) ? this.cell_grid[column - 1][row - 1].Content : -1,
      diagonalrightup: (column != 0 && row < max_rows) ? this.cell_grid[column - 1][row + 1].Content : -1
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
      const random_index: number = this.rndIntPipe.transform(index + 1);
      const temp = array[index];
      array[index] = array[random_index];
      array[random_index] = temp;
    }
    return array;
  }

  chooseWord(words: Word[]): Word {
    let max_length: number = 0;
    let min_index: number = 0;
    words.sort((a, b) => a.word.length - b.word.length);       //Sorts array according to word length
    max_length = words[words.length - 1].word.length;
    if(max_length >= 5) {                                                     //and only considers words longer than 5 characters if there are any
      for(const [index, element] of words.entries()) {       
        if(element.word.length >= 5) {
          min_index = index;
          break;
        }
      }
      return words[this.rndIntPipe.transform(words.length, min_index)]
    } else {
      return words[this.rndIntPipe.transform(words.length)]
    }
    
  }

  findStartingPoint(column: number, row: number, direction: Directions, word: string, pivot_letter: number): [number, number] {
    let cursor: [number, number] = [column, row];
    let temp_cursor: [number, number] = [-1, -1];
    let occ_index: number[] = [];
    let end_cursor: [number, number] = [-1, -1];
    cursor = this.moveToEdge(cursor[ColRow.Column], cursor[ColRow.Row], direction);
    end_cursor = this.moveToEdge(cursor[ColRow.Column], cursor[ColRow.Row], this.invertDirection(direction));

    while(cursor[0] !== end_cursor[0] || cursor[1] !== end_cursor[1]) {                             //In case of earlier duplicate letters it
      while(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].Content !== pivot_letter) {   //will not find a suitable location and continue
        cursor = this.move(cursor[ColRow.Column], cursor[ColRow.Row], direction);                   //iterating over the slice and only fail once it
      }                                                                                             //it reaches the end.
      for (let index = 0; index < word.length; index++) {
        if (word[index] === this.charPipe.transform(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].Content, false)) {
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
    return [-1, -1];
  }

  filterOccurences(words: Word[], match_string: string, pivot_index: number): Word[] {
    let match_buffer: [string, boolean] = ['', false];
    let start: boolean = false;
    let attempting: boolean = true;
    let indp_letters: number[] = this.findIndependentLetters(match_string); 
    let filtered_occurences: Word[] = [];
    match_buffer[0] = match_string;
    while( attempting ) {
      let matcher: RegExp = new RegExp('^' + match_buffer[0] + '$', 'gi');    //Checks whether any provided words fit into the regex match.
      filtered_occurences = words.filter((element) => matcher.test(this.number2WordPipe.transform(element.word)));
      if(filtered_occurences.length != 0) {                                   //Stops searching if at least one word matches
        break;
      } else {
        match_buffer = this.shortenMatcher(match_string, indp_letters, pivot_index, start);
        if ((match_buffer[0].length == 0 && start) || indp_letters.length <= 1) {   //Gives up the matcher has been shortened as much as possible
          break;
        } else if(match_buffer[0].length == 0 && match_buffer[1]) {           //Attempts shortening from the beginning if 
          start = true;                                                       //the pivot letter is reached from the back
          match_buffer[0] = match_string;                                     //and resets the string to its original condition
        } else if(start) {
          indp_letters.shift();                                               
        } else {                                                              //Decreases the amount of possible deletions after every attempt
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
    if (start) {                                                    //Deletes the first or last letter only surrounded by wildcards 
      return  [match_string.slice(indp_letters[0] + 2, match_string.length).replace(/^\.*(?=\w)/, this.replacer), false];
    } else {                                                        //and adds an optional modifier to wildcards now before or after any letters
      return [match_string.slice(0, indp_letters[indp_letters.length - 1] - 1).replace(/(?<=\w)\.*$/, this.replacer), false];
    }
  }

  getPivotIndex(column: number, row: number, direction: Directions, match_string: string): number {
    let word_index: number = this.getMaxLength(column, row, this.invertDirection(direction)) - 1;
    let matches: RegExpMatchArray[] = [...match_string.matchAll(/(?:\.\??|\w)/gi)];     //Tries to find the initially chosen letter within the matching array
    if(matches[word_index][0] !== '.?') {                                               //by respectively matching a wildcard, a wildcard with an optional modifier
      return matches[word_index].index!;                                                //or a letter as one character to imitate the cell grid
    }                                                                                   //and returns it if the match at the expected location is a letter.
    throw new Error(`Unable to find pivot in ${column}, ${row} with match of ${match_string}.`);
  }

  findIndependentLetters(match_array: string): number[] {
    let indp_letters: number[] = [];                            //Matches all letters surrounded by one wildcard on each side (e.g. '.g.')
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
    while(matching_arrays[empty[0]] == -1 || matching_arrays[length - empty[1]] == -1) {  //Simultaneously iterates from the front and back
      (matching_arrays[empty[0]] == -1) ? empty[0]++ : null;                              //to find the index of the first letter.
      (matching_arrays[length - empty[1]] == -1) ? empty[1]++ : null;
    }
    for(let match_iterator = 0; match_iterator < matching_arrays.length; match_iterator++) {//Adds elements to the prospective matcher according to the content
      if (empty[0]) {                                                 //Adds an optional wildcard when the first letter is not expected yet                      
        regex += '.?';
        empty[0]--;
      } else if (match_iterator > length - empty[1]) {                //Adds an optional wildcard after the last letter is expected to have occured
        regex += '.?';
        empty[1]--;
      } else if (matching_arrays[match_iterator] == -1) {             //Adds a mandatory wildcard when there are letters expected on either side
        regex += '.';
      } else {
        regex += this.charPipe.transform(matching_arrays[match_iterator], false); //Adds the letter when encountered
      }
    }
    if(regex != this.regex) {
      console.log(regex);
    }
    this.regex = regex;
    return regex;
  }

  createMatchingArray(column: number, row: number, direction: Directions, max_length: number = -1, min_length: boolean = false): number[] {  //Iterates over the slice of the grid, returning an array of its values
    let cursor: [number, number] = this.moveToEdge(column, row, direction);
    let cell_iterator: number = 0;
    if(max_length === -1 && min_length) {
      throw new Error(`Unauthorised variable combination at ${column}, ${row} going ${(direction === 3) ? 'right' : 'down'}.`);
    }
    if (max_length === -1 || min_length) {
      max_length = this.getMaxLength(cursor[ColRow.Column], cursor[ColRow.Row], direction) - 1;
      (min_length) ? cell_iterator = max_length : null;
    }
    let matching_arrays: number[] = [];
    for (cell_iterator; cell_iterator <= max_length; cell_iterator++) {
      matching_arrays.push(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].Content);
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

  getDifferentDirection(directions: Directions[], invalid_directions: Directions[]): Directions {
    let valid_directions: Directions[] = [];
    directions.forEach((direction) => (invalid_directions.includes(direction)) ? null : valid_directions.push(direction));
    return valid_directions[this.rndIntPipe.transform(valid_directions.length)];
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
    this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].Hint = hint;
    this.hint_cells.push([cursor[ColRow.Column], cursor[ColRow.Row]]);
    for (let word_index = 0; word_index < word.length; word_index++) {
      curr_cell = this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].Content;
      this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].addDirection(direction);
      if(curr_cell === -1 || curr_cell === this.letterPipe.transform(word[word_index])) {
        this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].Content = this.letterPipe.transform(word[word_index]);
      } else {
        if(to_be_filled.length > 0) {
          this.undoAddition(to_be_filled);
        }
        return false;
      }
      to_be_filled.push([cursor[ColRow.Column], cursor[ColRow.Row]])
      cursor = this.move(cursor[ColRow.Column], cursor[ColRow.Row], direction);
    }
    this.filled_cells = this.filled_cells.concat(to_be_filled);
    return true;
  }

  undoAddition(to_be_deleted: [number, number][]): void {
    let cursor: [number, number] = [-1, -1];
    let n0hints: number = this.cell_grid[to_be_deleted[0][0]][to_be_deleted[0][1]].Hints.length;
    if(to_be_deleted.length > 1) {
      console.log(`Undoing additions between: ${to_be_deleted[0]} and ${to_be_deleted[to_be_deleted.length - 1]}.`);
    } else {
      console.log(`Undoing addition at: ${to_be_deleted[0]}.`);
    }
    for(let iterator = 1; iterator <= to_be_deleted.length; iterator++) {
      cursor = to_be_deleted[to_be_deleted.length - iterator];
      if(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].Directions.length >= 2) {
        this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]]
          .removeDirection(this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]]
            .Directions.length - 1);
      } else {
        this.cell_grid[cursor[ColRow.Column]][cursor[ColRow.Row]].Content = -1;
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

  getSkips(): Observable<number[]> {
    return of(this.skips);
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
