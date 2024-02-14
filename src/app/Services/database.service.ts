import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { LowerCasePipe } from '@angular/common';
import { db, Occurence, Word} from '../../db/db';
import { LetterPipe } from '../Pipes/letter.pipe';
import { LoadDataService } from './load-data.service';
import { Dict_Entry } from '../model/dtypes';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private LetterPipe: LetterPipe,
              private LoadDataService: LoadDataService,
              private LowerCasePipe: LowerCasePipe) { }

  async addWord(word: string) {
    db.Words.add({
      word: word
    })
  }

  async addOccurence(ids: number[], occurence: number[]) {
    db.Occurences.add({
      ids: ids,
      occurence: occurence
    })
  }

  async addHint(hint: string) {
    db.Hints.add({
      hint: hint
    })
  }

  async getWord(word_id: number) {
    return db.Words.where({
      id: word_id
    })
    .toArray();
  }

  async getHint(hint_id: number) {
    return db.Hints.where({
      id: hint_id
    })
    .toArray()
  }

  async getOccurences(letter: number, index: number) {
    return db.Occurences
      .where('occurence')
      .equals(letter)
      .and(entry => entry.occurence.indexOf(letter) == index)
      .toArray();
  }

  async initDB() {
    let exist: boolean = true;
    await Dexie.exists("Crossword").then(function(exists) {(!exists) ? exist = false : null;})
    await db.open()
      .then(data => console.log("Dexie DB opened"))
      .catch(err => console.log(err.message));
    console.log(exist);
    (!exist) ? this.createEntries() : null;
  }

  createEntries() {
    let word_count: number = 0;
    let curr_entry: Dict_Entry = {
      hint: '',
      words: []
    };
    let occs_buffer: number[] = [];
    let hint_no: number = this.LoadDataService.getLength();
    for (let hints = 0; hints < hint_no; hints++) {
      curr_entry = this.LoadDataService.getFragment(hints);
      this.addHint(curr_entry.hint);
      for (let words = 0; words < curr_entry.words.length; words++) {
        this.addWord(curr_entry.words[words]);
        for(let occs = 0; occs < curr_entry.words[words].length; occs++) {
          occs_buffer.push(this.LetterPipe.transform(curr_entry.words[words][occs]));
        }
        this.addOccurence([hints, word_count], occs_buffer);
        word_count++;
        occs_buffer.length = 0;
      }
    }
  }

}

