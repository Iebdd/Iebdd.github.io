import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { db } from '../../db/db';
import { LetterPipe } from '../Pipes/letter.pipe';
import { LoadDataService } from './load-data.service';
import { Dict_Entry } from '../model/dtypes';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  available_letters: number = 1;

  constructor(private LetterPipe: LetterPipe,
              private LoadDataService: LoadDataService) { }

  progress: number = 0;
  loading$ = new BehaviorSubject<boolean>(true);
  progress$ = new BehaviorSubject<number>(this.progress);


  async clearDB() {
    db.resetDatabase();
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

  async initDB(): Promise<boolean> {
    let exist: boolean = true;
    await Dexie.exists("Crossword")
      .then(function(exists) {(!exists) ? exist = false : null;})
    await db.open()
      .then(data => console.log("Dexie DB opened"))
      .catch(err => console.log(err.message));
    if(!exist){
      return true;
    }
    this.toggleLoad();
    return false;
  }

  getLoadState(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  toggleLoad(): void {
    this.loading$.next(!this.loading$);
  }

  async createEntries() {
    let word_count: number = 0;
    let curr_entry: Dict_Entry = {
      hint: '',
      words: []
    };
    let occs_buffer: number[] = [];
    for (let letters = 0; letters < this.available_letters; letters++) {
      let hint_no: number = this.LoadDataService.getLength(letters);
      for (let hints = 0; hints < hint_no; hints++) {
        curr_entry = this.LoadDataService.getFragment(letters, hints);
        this.addHint(curr_entry.hint);
        for (let words = 0; words < curr_entry.words.length; words++) {
          for(let occs = 0; occs < curr_entry.words[words].length; occs++) {
            occs_buffer.push(this.LetterPipe.transform(curr_entry.words[words][occs]));
          }
          this.addWord(occs_buffer, hints)
          word_count++;
          occs_buffer.length = 0;
        }
      }
    }
  }

}

