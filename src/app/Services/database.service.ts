import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { db } from '../../db/db';
import { LetterPipe } from '../Pipes/letter.pipe';
import { LoadDataService } from './load-data.service';
import { StateService } from '../Services/state.service';
import { Dict_Entry } from '../model/dtypes';
import { States } from '../model/enums';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  available_letters: number = 1;

  constructor(private letterPipe: LetterPipe,
              private loadDataService: LoadDataService,
              private stateService: StateService) { }

  loading$ = new BehaviorSubject<boolean>(true);
  progress: number = 0;
  progress$ = new BehaviorSubject<number>(0);


  async clearDB() {
    db.deleteDatabase();
  }

  async addWord(word: number[], hint_id: number) {
    db.Words.add({
      word: word,
      hint_id: hint_id
    })
  }

  async addHint(hint: string) {
    db.Hints.add({
      hint: hint
    })
  }

  async getWord(word_id: number) {
    return db.Words.get({
      id: word_id
    });
  }

  async getWords() {
    return db.Words
    .toArray();
  }

  async getHint(hint_id: number) {
    return db.Hints.get({
      id: hint_id
    });
  }

  async getWordsByLetter(letter: number) {
    return db.Words
      .where('word')
      .equals(letter)
      .toArray();
  }

  async getN0OfWords(): Promise<number> {
    return db.Words.count();
  }

  async getN0OfHints(): Promise<number> {
    return db.Hints.count();
  }

  async updateProgress(): Promise<void> {
    this.getN0OfWords()
      .then(() => this.progress$.next(++this.progress));
  }

  getProgress(): Observable<number> {
    return this.progress$.asObservable();
  }

  async initDB(): Promise<boolean> {
    let exist: boolean = true;
    await Dexie.exists("Crossword")
      .then(function(exists) {(!exists) ? exist = false : null;})
    await db.open()
      .then(() => console.log('DB Opened'))
      .catch(() => console.log('Error occured while opening DB'));
    let count: number = Math.min(await this.getN0OfWords(), await this.getN0OfHints());
    (!count) ? exist = false : null;
    if(!exist){
      return true;
    }
    this.stateService.toggleState(States.Load);
    return false;
  }



  async createEntries() {
    let word_count: number = 0;
    let percent: number = Math.floor(this.loadDataService.totalLength / 100);
    let curr_entry: Dict_Entry = {
      hint: '',
      words: []
    };
    let occs_buffer: number[] = [];
    for (let letters = 0; letters < this.available_letters; letters++) {
      let hint_no: number = this.loadDataService.getLengthByIndex(letters);
      for (let hints = 0; hints < hint_no; hints++) {
        curr_entry = this.loadDataService.getFragment(letters, hints);
        this.addHint(curr_entry.hint);
        for (let words = 0; words < curr_entry.words.length; words++) {
          for(let occs = 0; occs < curr_entry.words[words].length; occs++) {
            occs_buffer.push(this.letterPipe.transform(curr_entry.words[words][occs]));
          }
          this.addWord(occs_buffer, hints)
          word_count++;
          (word_count % percent == 0) ? this.updateProgress() : null;         //Injects a DB request into every 1% of loaded data to return the progress
          occs_buffer.length = 0;
        }
      }
    }
  }

}

